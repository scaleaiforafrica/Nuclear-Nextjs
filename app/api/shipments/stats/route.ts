import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ShipmentStats {
  totalShipments: number;
  onTimeDelivery: number;
  avgTransitTime: number;
  complianceRate: number;
  changePercent: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * GET /api/shipments/stats
 * Get shipment statistics
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ShipmentStats>>> {
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
          error: 'You must be logged in to view shipment statistics',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse optional date range filters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get total shipments count
    let shipmentsQuery = supabase
      .from('shipments')
      .select('*', { count: 'exact', head: false });

    if (startDate) {
      shipmentsQuery = shipmentsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      shipmentsQuery = shipmentsQuery.lte('created_at', endDate);
    }

    const { data: shipments, count: totalShipments } = await shipmentsQuery;

    // If no shipments exist, return zeros
    if (!totalShipments || totalShipments === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No shipments found',
          data: {
            totalShipments: 0,
            onTimeDelivery: 0,
            avgTransitTime: 0,
            complianceRate: 0,
            changePercent: 0,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Calculate on-time delivery rate
    // Compare current time/delivery time against ETA
    const deliveredShipments = shipments?.filter(s => s.status === 'Delivered') || [];
    let onTimeDelivery = 0;
    
    if (deliveredShipments.length > 0) {
      const onTimeCount = deliveredShipments.filter(s => {
        if (!s.eta) return true; // Assume on-time if no ETA set
        // Since we don't have actual_delivery_time, use current time as approximation
        const deliveryTime = new Date();
        const eta = new Date(s.eta);
        return deliveryTime <= eta;
      }).length;
      onTimeDelivery = Number(((onTimeCount / deliveredShipments.length) * 100).toFixed(1));
    }

    // Calculate average transit time (in hours)
    // For delivered shipments, calculate time from created_at to current time
    const shipmentsWithTransit = shipments?.filter(s => 
      s.status === 'Delivered' && s.created_at
    ) || [];
    
    let avgTransitTime = 0;
    if (shipmentsWithTransit.length > 0) {
      const totalTransitHours = shipmentsWithTransit.reduce((sum, s) => {
        const start = new Date(s.created_at);
        const end = new Date(); // Use current time as approximation for delivery time
        const hours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgTransitTime = Number((totalTransitHours / shipmentsWithTransit.length).toFixed(1));
    }

    // Calculate compliance rate
    // All shipments are compliant by default since we don't have violation flags
    const complianceRate = 100;

    // Calculate change percentage (comparing to previous period)
    // For now, using a simplified calculation based on recent vs older shipments
    let changePercent = 0;
    if (totalShipments > 1 && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      const previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - periodDays);
      
      const { count: previousCount } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', previousStart.toISOString())
        .lt('created_at', startDate);

      if (previousCount && previousCount > 0) {
        changePercent = Number((((totalShipments - previousCount) / previousCount) * 100).toFixed(1));
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Shipment statistics fetched successfully',
        data: {
          totalShipments,
          onTimeDelivery,
          avgTransitTime,
          complianceRate,
          changePercent,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching shipment statistics:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch shipment statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
