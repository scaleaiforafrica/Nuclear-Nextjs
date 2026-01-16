import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hyperledgerService } from '@/services';
import type { ChainStatistics } from '@/models/blockchain.model';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * GET /api/traceability/stats
 * Get chain statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ChainStatistics>>> {
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
          error: 'You must be logged in to view blockchain statistics',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Get chain statistics
    const stats = await hyperledgerService.getChainStats();

    return NextResponse.json(
      {
        success: true,
        message: 'Chain statistics fetched successfully',
        data: stats,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching chain statistics:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch chain statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
