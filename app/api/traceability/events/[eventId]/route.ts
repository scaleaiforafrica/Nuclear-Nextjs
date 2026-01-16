import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hyperledgerService } from '@/services';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * GET /api/traceability/events/[eventId]
 * Get single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
): Promise<NextResponse<ApiResponse>> {
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

    const { eventId } = params;

    // Get event
    const event = await hyperledgerService.getEvent(eventId);

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: 'Event not found',
          error: `No event found with ID: ${eventId}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Event fetched successfully',
        data: event,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching blockchain event:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch blockchain event',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/traceability/events/[eventId]
 * Verify event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
): Promise<NextResponse<ApiResponse>> {
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
          error: 'You must be logged in to verify blockchain events',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const { eventId } = params;

    // Verify event
    const verificationResult = await hyperledgerService.verifyEvent(eventId);

    return NextResponse.json(
      {
        success: verificationResult.isValid,
        message: verificationResult.message,
        data: verificationResult,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying blockchain event:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify blockchain event',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
