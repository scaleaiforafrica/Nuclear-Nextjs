import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hyperledgerService } from '@/services';
import type {
  CreateBlockchainEventInput,
  EventQueryFilters,
  BlockchainEventType,
} from '@/models/blockchain.model';

const actorSchema = z.object({
  id: z.string(),
  type: z.enum(['user', 'system', 'iot_sensor', 'api']),
  name: z.string(),
  role: z.string().optional(),
  organization: z.string().optional(),
  deviceId: z.string().optional(),
});

const locationSchema = z.object({
  name: z.string(),
  type: z.enum(['facility', 'checkpoint', 'vehicle', 'port', 'customs', 'destination', 'unknown']),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
});

const createEventSchema = z.object({
  shipmentId: z.string().uuid('Invalid shipment ID'),
  eventType: z.enum([
    'shipment_created',
    'dispatch',
    'pickup',
    'in_transit',
    'checkpoint',
    'customs_check',
    'customs_cleared',
    'customs_hold',
    'temperature_reading',
    'temperature_alert',
    'humidity_reading',
    'radiation_check',
    'location_update',
    'handover',
    'delivery',
    'receipt_confirmation',
    'document_generated',
    'document_signed',
    'compliance_verified',
    'alert_triggered',
    'status_change',
  ] as const),
  actor: actorSchema,
  location: locationSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  signature: z.string().optional(),
});

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
 * GET /api/traceability/events
 * List events with pagination and filters
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const shipmentId = searchParams.get('shipmentId');
    const eventType = searchParams.get('eventType');
    const actorId = searchParams.get('actorId');
    const actorType = searchParams.get('actorType');
    const locationType = searchParams.get('locationType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '30', 10);

    // Build filters
    const filters: EventQueryFilters = {
      page,
      pageSize,
    };

    if (shipmentId) {
      filters.shipmentId = shipmentId;
    }

    if (eventType) {
      filters.eventType = eventType as BlockchainEventType;
    }

    if (actorId) {
      filters.actorId = actorId;
    }

    if (actorType) {
      filters.actorType = actorType as 'user' | 'system' | 'iot_sensor' | 'api';
    }

    if (locationType) {
      filters.locationType = locationType as 'facility' | 'checkpoint' | 'vehicle' | 'port' | 'customs' | 'destination' | 'unknown';
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    if (verified !== null) {
      filters.verified = verified === 'true';
    }

    // Query events
    const result = await hyperledgerService.queryEvents(filters);

    return NextResponse.json(
      {
        success: true,
        message: 'Events fetched successfully',
        data: result.events,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching blockchain events:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch blockchain events',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/traceability/events
 * Record new event
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
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
          error: 'You must be logged in to record blockchain events',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: errors.join(', '),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const data: CreateBlockchainEventInput = validation.data;

    // Record event to blockchain
    const recordedEvent = await hyperledgerService.recordEvent(data);

    return NextResponse.json(
      {
        success: true,
        message: 'Event recorded successfully on blockchain',
        data: recordedEvent,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording blockchain event:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to record blockchain event',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
