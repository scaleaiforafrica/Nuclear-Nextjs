import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hyperledgerService } from '@/services';
import type {
  EventQueryFilters,
  BlockchainEventType,
  PaginatedEvents,
} from '@/models/blockchain.model';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;
}

/**
 * GET /api/traceability/search
 * Search events with filters
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedEvents>>> {
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
          error: 'You must be logged in to search blockchain events',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const shipmentId = searchParams.get('shipmentId');
    const eventType = searchParams.get('eventType');
    const eventTypes = searchParams.get('eventTypes');
    const actorId = searchParams.get('actorId');
    const actorType = searchParams.get('actorType');
    const locationType = searchParams.get('locationType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10);

    // Validate page and pageSize
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid pagination parameters',
          error: 'Page must be >= 1 and pageSize must be between 1 and 100',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build filters
    const filters: EventQueryFilters = {
      page,
      pageSize,
    };

    if (shipmentId) {
      filters.shipmentId = shipmentId;
    }

    // Handle single or multiple event types
    if (eventTypes) {
      const types = eventTypes.split(',').map((t) => t.trim()) as BlockchainEventType[];
      filters.eventType = types;
    } else if (eventType) {
      filters.eventType = eventType as BlockchainEventType;
    }

    if (actorId) {
      filters.actorId = actorId;
    }

    if (actorType) {
      filters.actorType = actorType as 'user' | 'system' | 'iot_sensor' | 'api';
    }

    if (locationType) {
      filters.locationType = locationType as
        | 'facility'
        | 'checkpoint'
        | 'vehicle'
        | 'port'
        | 'customs'
        | 'destination'
        | 'unknown';
    }

    if (startDate) {
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid start date',
            error: 'Start date must be a valid ISO 8601 date string',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      filters.startDate = startDateObj;
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid end date',
            error: 'End date must be a valid ISO 8601 date string',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      filters.endDate = endDateObj;
    }

    if (verified) {
      filters.verified = verified === 'true';
    }

    // Query events
    const result = await hyperledgerService.queryEvents(filters);

    return NextResponse.json(
      {
        success: true,
        message: `Found ${result.pagination.totalItems} matching events`,
        data: result,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching blockchain events:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to search blockchain events',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
