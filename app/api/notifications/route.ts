import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type {
  NotificationLog,
  NotificationLogFilter,
  NotificationStats,
} from '@/models/notification-log.model';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * GET /api/notifications
 * List notification logs with optional filters
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<NotificationLog[]>>> {
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
          error: 'You must be logged in to view notification logs',
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const notification_type = searchParams.get('notification_type');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const shipment_id = searchParams.get('shipment_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = parseInt(searchParams.get('per_page') || '30', 10);

    // Build query - filter by current user
    let query = supabase
      .from('notification_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (notification_type) {
      query = query.eq('notification_type', notification_type);
    }

    if (channel) {
      query = query.eq('channel', channel);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (shipment_id) {
      query = query.eq('shipment_id', shipment_id);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Apply pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching notification logs:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch notification logs',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notification logs fetched successfully',
        data: data || [],
        count: count || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/notifications:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
