import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Shipment, CreateShipmentRequest } from '@/models/shipment.model';
import { calculateCurrentActivity, calculateElapsedHours } from '@/lib/isotope-decay';

// Validation schema for creating shipments
const createShipmentSchema = z.object({
  procurement_request_id: z.string().uuid().optional(),
  batch_number: z.string().min(1, 'Batch number is required'),
  isotope: z.string().min(1, 'Isotope is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  carrier: z.string().min(1, 'Carrier is required'),
  status: z.enum(['Pending', 'In Transit', 'At Customs', 'Dispatched', 'Delivered'], {
    message: 'Status must be one of: Pending, In Transit, At Customs, Dispatched, Delivered',
  }),
  initial_activity: z.number().positive().optional(),
  route_waypoints: z
    .array(
      z.object({
        name: z.string(),
        coordinates: z.tuple([z.number(), z.number()]),
        timestamp: z.string().optional(),
        status: z.enum(['completed', 'current', 'upcoming']).optional(),
      })
    )
    .optional(),
  estimated_delivery_time: z.string().optional(),
  special_handling_instructions: z.string().optional(),
  temperature_requirements: z.string().optional(),
});

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * GET /api/shipments
 * List shipments with optional filters
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Shipment[]>>> {
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
          error: 'You must be logged in to view shipments',
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const isotope = searchParams.get('isotope');
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const procurement_request_id = searchParams.get('procurement_request_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const from_procurement = searchParams.get('from_procurement');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = parseInt(searchParams.get('per_page') || '30', 10);

    // Build query with procurement request join
    let query = supabase
      .from('shipments')
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
          selected_supplier_id,
          suppliers:selected_supplier_id (
            id,
            name,
            location,
            contact_email,
            contact_phone
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (isotope) {
      query = query.eq('isotope', isotope);
    }

    if (origin) {
      query = query.ilike('origin', `%${origin}%`);
    }

    if (destination) {
      query = query.ilike('destination', `%${destination}%`);
    }

    if (procurement_request_id) {
      query = query.eq('procurement_request_id', procurement_request_id);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    if (from_procurement === 'true') {
      query = query.not('procurement_request_id', 'is', null);
    } else if (from_procurement === 'false') {
      query = query.is('procurement_request_id', null);
    }

    // Apply pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching shipments:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch shipments',
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate current activity for shipments with initial_activity
    const shipments = (data || []).map((shipment: any) => {
      let current_activity = shipment.current_activity;

      // Recalculate current activity if initial_activity exists
      if (shipment.initial_activity && shipment.created_at) {
        const elapsedHours = calculateElapsedHours(shipment.created_at);
        current_activity = calculateCurrentActivity(
          shipment.initial_activity,
          shipment.isotope,
          elapsedHours
        );
      }

      return {
        ...shipment,
        current_activity,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Shipments fetched successfully',
        data: shipments,
        count: count || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/shipments:', error);
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
 * POST /api/shipments
 * Create a new shipment
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
    const validation = createShipmentSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: errors.join(', '),
        },
        { status: 400 }
      );
    }

    const data: CreateShipmentRequest = validation.data;

    // If procurement_request_id is provided, verify it exists
    if (data.procurement_request_id) {
      const { data: procurementRequest, error: procurementError } = await supabase
        .from('procurement_requests')
        .select('id')
        .eq('id', data.procurement_request_id)
        .single();

      if (procurementError || !procurementRequest) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid procurement request',
            error: 'The specified procurement request does not exist',
          },
          { status: 400 }
        );
      }
    }

    // Generate shipment number using database function
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

    // Calculate current_activity if initial_activity is provided
    let current_activity = data.initial_activity;
    let expected_activity_at_arrival = data.initial_activity;

    if (data.initial_activity) {
      // Current activity is same as initial at creation time
      current_activity = data.initial_activity;

      // Calculate expected activity at arrival if delivery time is provided
      if (data.estimated_delivery_time) {
        const deliveryHours = parseDeliveryTimeToHours(data.estimated_delivery_time);
        expected_activity_at_arrival = calculateCurrentActivity(
          data.initial_activity,
          data.isotope,
          deliveryHours
        );
      }
    }

    // Calculate ETA based on estimated delivery time (default 24 hours if not provided)
    const deliveryHours = data.estimated_delivery_time
      ? parseDeliveryTimeToHours(data.estimated_delivery_time)
      : 24;
    const eta = new Date(Date.now() + deliveryHours * 60 * 60 * 1000).toISOString();

    // Determine status color
    const status_color = getStatusColor(data.status);

    // Insert shipment
    const { data: shipment, error: insertError } = await supabase
      .from('shipments')
      .insert({
        shipment_number,
        procurement_request_id: data.procurement_request_id,
        batch_number: data.batch_number,
        isotope: data.isotope,
        origin: data.origin,
        destination: data.destination,
        carrier: data.carrier,
        status: data.status,
        status_color,
        eta,
        initial_activity: data.initial_activity,
        current_activity,
        expected_activity_at_arrival,
        route_waypoints: data.route_waypoints || null,
        estimated_delivery_time: data.estimated_delivery_time,
        special_handling_instructions: data.special_handling_instructions,
        temperature_requirements: data.temperature_requirements,
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
          status
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
        message: 'Shipment created successfully',
        data: shipment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/shipments:', error);
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
 * Helper function to get status color based on status
 */
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Pending: 'bg-gray-100 text-gray-700',
    'In Transit': 'bg-blue-100 text-blue-700',
    'At Customs': 'bg-amber-100 text-amber-700',
    Dispatched: 'bg-green-100 text-green-700',
    Delivered: 'bg-purple-100 text-purple-700',
  };

  return colors[status] || 'bg-gray-100 text-gray-700';
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
