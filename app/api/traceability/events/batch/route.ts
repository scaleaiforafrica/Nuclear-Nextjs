import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hyperledgerService } from '@/services';
import type { CreateBlockchainEventInput } from '@/models/blockchain.model';

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

const batchCreateSchema = z.array(createEventSchema);

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * POST /api/traceability/events/batch
 * Batch record multiple events
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
    const validation = batchCreateSchema.safeParse(body);

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

    const events: CreateBlockchainEventInput[] = validation.data;

    if (events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No events provided',
          error: 'Request body must contain at least one event',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (events.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many events',
          error: 'Maximum 100 events can be recorded in a single batch',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Record events sequentially to maintain chain integrity
    const recordedEvents = [];
    const errors = [];

    for (let i = 0; i < events.length; i++) {
      try {
        const recordedEvent = await hyperledgerService.recordEvent(events[i]);
        recordedEvents.push(recordedEvent);
      } catch (error) {
        errors.push({
          index: i,
          eventType: events[i].eventType,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const allSuccessful = errors.length === 0;

    return NextResponse.json(
      {
        success: allSuccessful,
        message: allSuccessful
          ? `Successfully recorded ${recordedEvents.length} events`
          : `Recorded ${recordedEvents.length} events with ${errors.length} failures`,
        data: {
          recorded: recordedEvents,
          errors: errors.length > 0 ? errors : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: allSuccessful ? 201 : 207 }
    );
  } catch (error) {
    console.error('Error batch recording blockchain events:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to batch record blockchain events',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
