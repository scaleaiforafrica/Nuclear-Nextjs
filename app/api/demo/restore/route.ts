/**
 * POST /api/demo/restore
 * Manually trigger demo data restoration
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { restoreDemoData } from '@/lib/demo/restore-demo-data'
import { isDemoAccountId } from '@/lib/demo/utils'
import { DEMO_ERROR_MESSAGES } from '@/lib/demo/config'

export async function POST() {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify demo account
    if (!isDemoAccountId(user.id)) {
      return NextResponse.json(
        { success: false, error: DEMO_ERROR_MESSAGES.NOT_DEMO_ACCOUNT },
        { status: 403 }
      )
    }

    // Perform restoration
    const result = await restoreDemoData('manual')

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          tablesRestored: result.tablesRestored,
          recordsRestored: result.recordsRestored,
          duration: result.duration,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: DEMO_ERROR_MESSAGES.RESTORE_FAILED,
          details: result.errors,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Demo restore API error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
