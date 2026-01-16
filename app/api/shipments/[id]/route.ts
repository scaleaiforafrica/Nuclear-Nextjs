import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { Shipment } from '@/models/shipment.model';
import { calculateCurrentActivity, calculateElapsedHours } from '@/lib/isotope-decay';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * GET /api/shipments/[id]
 * Fetch a single shipment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Shipment>>> {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Validate ID format
    if (!id || id.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid shipment ID',
          error: 'Shipment ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch shipment with procurement request and supplier data
    const { data, error } = await supabase
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
          delivery_time_window,
          delivery_location,
          origin,
          destination,
          status,
          status_color,
          clinical_indication,
          special_instructions,
          created_at,
          updated_at,
          selected_supplier_id,
          suppliers:selected_supplier_id (
            id,
            name,
            location,
            rating,
            contact_email,
            contact_phone,
            is_active
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            message: 'Shipment not found',
            error: `No shipment found with ID: ${id}`,
          },
          { status: 404 }
        );
      }

      console.error('Error fetching shipment:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch shipment',
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate current activity if initial_activity exists
    let shipment = data;
    if (shipment.initial_activity && shipment.created_at) {
      const elapsedHours = calculateElapsedHours(shipment.created_at);
      const current_activity = calculateCurrentActivity(
        shipment.initial_activity,
        shipment.isotope,
        elapsedHours
      );

      shipment = {
        ...shipment,
        current_activity,
      };
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Shipment fetched successfully',
        data: shipment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/shipments/[id]:', error);
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
