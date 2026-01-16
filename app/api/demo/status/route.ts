/**
 * GET /api/demo/status
 * Get demo account status and restoration information
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDemoStatus } from '@/lib/demo/restore-demo-data'
import { isDemoAccountId } from '@/lib/demo/utils'

export async function GET() {
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

    // Check if demo account
    const isDemo = isDemoAccountId(user.id)

    if (!isDemo) {
      return NextResponse.json({
        success: true,
        data: {
          isDemo: false,
          coverage: 0,
          lastRestore: null,
          version: '1.0.0',
        },
      })
    }

    // Get demo status
    const status = await getDemoStatus()

    return NextResponse.json({
      success: true,
      data: {
        isDemo: true,
        coverage: status.coverage,
        lastRestore: status.lastRestore,
        version: status.version,
      },
    })
  } catch (error) {
    console.error('Demo status API error:', error)
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
