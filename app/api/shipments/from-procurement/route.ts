import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Shipment, ShipmentFromProcurement } from '@/models/shipment.model';
import { calculateCurrentActivity } from '@/lib/isotope-decay';
import { generateRouteWaypoints } from '@/lib/route-utils';

// Validation schema
const fromProcurementSchema = z.object({
  procurement_request_id: z.string().uuid('Invalid procurement request ID'),
  carrier: z.string().min(1, 'Carrier is required'),
  estimated_delivery_time: z.string().optional(),
  temperature_requirements: z.string().optional(),
});

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * POST /api/shipments/from-procurement
 * Create a shipment from a procurement request
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Shipment>>> {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          error: 'You must be logged in to create shipments',
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = fromProcurementSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: errors.join(', '),
        },
        { status: 400 }
      );
    }

    const data: ShipmentFromProcurement = validation.data;

    // Fetch procurement request with supplier data
    const { data: procurementRequest, error: procurementError } = await supabase
      .from('procurement_requests')
      .select(
        `
        *,
        suppliers:selected_supplier_id (
          id,
          name,
          location,
          contact_email,
          contact_phone
        )
      `
      )
      .eq('id', data.procurement_request_id)
      .single();

    if (procurementError || !procurementRequest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Procurement request not found',
          error: 'The specified procurement request does not exist',
        },
        { status: 404 }
      );
    }

    // Validate procurement request status
    const validStatuses = ['PO Approved', 'Completed'];
    if (!validStatuses.includes(procurementRequest.status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid procurement status',
          error: `Procurement request must be in 'PO Approved' or 'Completed' status. Current status: ${procurementRequest.status}`,
        },
        { status: 400 }
      );
    }

    // Check if shipment already exists for this procurement request
    const { data: existingShipment } = await supabase
      .from('shipments')
      .select('id, shipment_number')
      .eq('procurement_request_id', data.procurement_request_id)
      .single();

    if (existingShipment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Shipment already exists',
          error: `A shipment (${existingShipment.shipment_number}) already exists for this procurement request`,
        },
        { status: 409 }
      );
    }

    // Validate origin and destination
    if (!procurementRequest.origin || !procurementRequest.destination) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing origin or destination',
          error: 'Procurement request must have both origin and destination specified',
        },
        { status: 400 }
      );
    }

    // Generate shipment number
    const { data: shipmentNumberData, error: shipmentNumberError } = await supabase.rpc(
      'generate_shipment_number'
    );

    if (shipmentNumberError || !shipmentNumberData) {
      console.error('Error generating shipment number:', shipmentNumberError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to generate shipment number',
          error: shipmentNumberError?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    const shipment_number = shipmentNumberData;

    // Generate route waypoints
    let route_waypoints;
    try {
      route_waypoints = await generateRouteWaypoints(
        procurementRequest.origin,
        procurementRequest.destination,
        true // Include intermediate waypoints
      );
    } catch (error) {
      console.warn('Failed to generate route waypoints:', error);
      route_waypoints = [];
    }

    // Calculate activity based on procurement quantity
    const initial_activity = procurementRequest.quantity;
    const estimated_delivery_time = data.estimated_delivery_time || '24 hours';
    
    // Parse delivery time to hours
    const deliveryHours = parseDeliveryTimeToHours(estimated_delivery_time);
    
    // Calculate expected activity at arrival
    const expected_activity_at_arrival = calculateCurrentActivity(
      initial_activity,
      procurementRequest.isotope,
      deliveryHours
    );

    // Calculate ETA
    const eta = new Date(Date.now() + deliveryHours * 60 * 60 * 1000).toISOString();

    // Generate batch number based on isotope and date
    const batch_number = generateBatchNumber(procurementRequest.isotope);

    // Determine status color
    const status_color = 'bg-gray-100 text-gray-700'; // Default to Pending

    // Insert shipment
    const { data: shipment, error: insertError } = await supabase
      .from('shipments')
      .insert({
        shipment_number,
        procurement_request_id: data.procurement_request_id,
        batch_number,
        isotope: procurementRequest.isotope,
        origin: procurementRequest.origin,
        destination: procurementRequest.destination,
        carrier: data.carrier,
        status: 'Pending',
        status_color,
        eta,
        initial_activity,
        current_activity: initial_activity, // Same as initial at creation
        expected_activity_at_arrival,
        route_waypoints: route_waypoints.length > 0 ? route_waypoints : null,
        estimated_delivery_time,
        temperature_requirements: data.temperature_requirements,
        special_handling_instructions: `Created from procurement request ${procurementRequest.request_number}`,
        created_by: user.id,
      })
      .select(
        `
        *,
        procurement_requests:procurement_request_id (
          id,
          request_number,
          isotope,
          quantity,
          unit,
          delivery_date,
          delivery_location,
          origin,
          destination,
          status,
          suppliers:selected_supplier_id (
            id,
            name,
            location,
            contact_email,
            contact_phone
          )
        )
      `
      )
      .single();

    if (insertError) {
      console.error('Error creating shipment:', insertError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create shipment',
          error: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Shipment created successfully from procurement request',
        data: shipment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/shipments/from-procurement:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to parse delivery time string to hours
 */
function parseDeliveryTimeToHours(deliveryTimeStr: string): number {
  const str = deliveryTimeStr.toLowerCase().trim();

  const hoursMatch = str.match(/(\d+\.?\d*)\s*(hours?|hrs?|h)/);
  const daysMatch = str.match(/(\d+\.?\d*)\s*(days?|d)/);

  if (hoursMatch) {
    return parseFloat(hoursMatch[1]);
  }

  if (daysMatch) {
    return parseFloat(daysMatch[1]) * 24;
  }

  return 24; // Default to 24 hours
}

/**
 * Helper function to generate batch number
 */
function generateBatchNumber(isotope: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  // Clean isotope name (remove dashes, spaces)
  const cleanIsotope = isotope.replace(/[-\s]/g, '').toUpperCase();

  return `BATCH-${cleanIsotope}-${year}${month}-${random}`;
}
