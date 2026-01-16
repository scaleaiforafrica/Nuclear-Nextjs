import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hyperledgerService } from '@/services';
import { verifyChainIntegrity } from '@/lib/traceability-utils';

interface ShipmentEventsResponse {
  shipmentId: string;
  eventCount: number;
  chainIntegrity: {
    isValid: boolean;
    brokenLinks: string[];
    invalidHashes: string[];
    message: string;
  };
  events: any[];
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * GET /api/traceability/shipments/[shipmentId]/events
 * Get all events for a shipment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
): Promise<NextResponse<ApiResponse<ShipmentEventsResponse>>> {
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
          error: 'You must be logged in to view blockchain events',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const { shipmentId } = await params;

    // Verify shipment exists
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id')
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Shipment not found',
          error: `No shipment found with ID: ${shipmentId}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Get all events for shipment
    const events = await hyperledgerService.getShipmentEvents(shipmentId);

    // Verify chain integrity
    const chainIntegrity = verifyChainIntegrity(events);

    const response: ShipmentEventsResponse = {
      shipmentId,
      eventCount: events.length,
      chainIntegrity,
      events,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Shipment events fetched successfully',
        data: response,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching shipment events:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch shipment events',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
