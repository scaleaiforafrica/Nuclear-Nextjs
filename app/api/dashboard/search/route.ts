/**
 * Dashboard search API endpoint
 * Server-side search across multiple dashboard tables
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SearchResult } from '@/models/search.model';

/**
 * GET /api/dashboard/search
 * Search across dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Search query is required',
          data: null,
        },
        { status: 400 }
      );
    }

    // In a real implementation, this would query the database
    // For now, return mock data for demonstration
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'shipment',
        title: `Shipment ${query}`,
        subtitle: 'In transit',
        url: '/dashboard/shipments',
        metadata: { status: 'in_transit' },
      },
      {
        id: '2',
        type: 'procurement',
        title: `Procurement ${query}`,
        subtitle: 'Pending approval',
        url: '/dashboard/procurement',
        metadata: { status: 'pending' },
      },
    ];

    return NextResponse.json(
      {
        success: true,
        message: 'Search completed successfully',
        data: mockResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while searching',
        data: null,
      },
      { status: 500 }
    );
  }
}
