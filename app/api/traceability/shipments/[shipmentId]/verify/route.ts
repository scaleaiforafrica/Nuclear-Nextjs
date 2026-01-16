import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hyperledgerService } from '@/services';
import type { ChainVerificationResult } from '@/models/blockchain.model';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * POST /api/traceability/shipments/[shipmentId]/verify
 * Verify entire chain for a shipment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
): Promise<NextResponse<ApiResponse<ChainVerificationResult>>> {
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
          error: 'You must be logged in to verify blockchain chains',
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

    // Verify the chain
    const verificationResult = await hyperledgerService.verifyChain(shipmentId);

    return NextResponse.json(
      {
        success: verificationResult.isValid,
        message: verificationResult.isValid
          ? 'Chain verified successfully - all events are valid'
          : 'Chain verification failed - integrity issues detected',
        data: verificationResult,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying blockchain chain:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify blockchain chain',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
