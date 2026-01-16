import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashService } from '@/services';

const verifyHashSchema = z.object({
  dataHash: z.string().optional(),
  expectedHash: z.string().optional(),
  data: z.unknown().optional(),
  transactionHash: z.string().optional(),
});

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * POST /api/traceability/verify
 * Verify hash or transaction
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
          error: 'You must be logged in to verify hashes',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = verifyHashSchema.safeParse(body);

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

    const { dataHash, expectedHash, data, transactionHash } = validation.data;

    // Case 1: Verify data against expected hash
    if (data && expectedHash) {
      const isValid = hashService.verifyHash(data, expectedHash);
      return NextResponse.json(
        {
          success: isValid,
          message: isValid ? 'Hash verification successful' : 'Hash verification failed',
          data: {
            isValid,
            expectedHash,
            calculatedHash: hashService.generateDataHash(data),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Case 2: Verify transaction hash exists in blockchain
    if (transactionHash) {
      const { data: event, error } = await supabase
        .from('blockchain_events')
        .select('id, event_type, timestamp, verified')
        .eq('transaction_hash', transactionHash)
        .single();

      if (error || !event) {
        return NextResponse.json(
          {
            success: false,
            message: 'Transaction not found',
            data: {
              isValid: false,
              transactionHash,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Transaction verified successfully',
          data: {
            isValid: true,
            transactionHash,
            event: {
              id: event.id,
              eventType: event.event_type,
              timestamp: event.timestamp,
              verified: event.verified,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Case 3: Compare two hashes
    if (dataHash && expectedHash) {
      const isValid = dataHash === expectedHash;
      return NextResponse.json(
        {
          success: isValid,
          message: isValid ? 'Hashes match' : 'Hashes do not match',
          data: {
            isValid,
            dataHash,
            expectedHash,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // No valid verification parameters provided
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid verification request',
        error: 'Must provide either (data and expectedHash), transactionHash, or (dataHash and expectedHash)',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error verifying hash:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify hash',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
