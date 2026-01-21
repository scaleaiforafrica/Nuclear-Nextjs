import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { NotificationStats } from '@/models/notification-log.model';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * GET /api/notifications/stats
 * Get notification statistics for the current user
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<NotificationStats>>> {
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
          error: 'You must be logged in to view notification statistics',
        },
        { status: 401 }
      );
    }

    // Fetch all notification logs for the user
    const { data: logs, error } = await supabase
      .from('notification_logs')
      .select('notification_type, channel, status')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching notification statistics:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch notification statistics',
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats: NotificationStats = {
      total: logs.length,
      sent: 0,
      delivered: 0,
      failed: 0,
      skipped: 0,
      pending: 0,
      by_type: {} as any,
      by_channel: {} as any,
    };

    logs.forEach((log) => {
      // Count by status
      switch (log.status) {
        case 'sent':
          stats.sent++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'failed':
          stats.failed++;
          break;
        case 'skipped':
          stats.skipped++;
          break;
        case 'pending':
          stats.pending++;
          break;
      }

      // Count by type
      stats.by_type[log.notification_type] =
        (stats.by_type[log.notification_type] || 0) + 1;

      // Count by channel
      stats.by_channel[log.channel] =
        (stats.by_channel[log.channel] || 0) + 1;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification statistics fetched successfully',
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/notifications/stats:', error);
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
