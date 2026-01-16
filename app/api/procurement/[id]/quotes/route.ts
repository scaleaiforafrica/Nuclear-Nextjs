import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ProcurementQuote } from '@/models/procurement.model'

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * GET /api/procurement/[id]/quotes
 * Fetch all quotes for a specific procurement request
 * Includes supplier information through a join
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProcurementQuote[]>>> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          error: 'You must be logged in to view quotes',
        },
        { status: 401 }
      )
    }

    // Verify procurement request exists
    const { data: procurementRequest, error: procurementError } = await supabase
      .from('procurement_requests')
      .select('id')
      .eq('id', id)
      .single()

    if (procurementError || !procurementRequest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Procurement request not found',
          error: procurementError?.message || 'Invalid procurement request ID',
        },
        { status: 404 }
      )
    }

    // Fetch quotes with supplier information
    const { data, error } = await supabase
      .from('procurement_quotes')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('procurement_request_id', id)
      .order('total_cost', { ascending: true })

    if (error) {
      console.error('Error fetching procurement quotes:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch quotes',
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Quotes fetched successfully',
      data: data as ProcurementQuote[],
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/procurement/[id]/quotes:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
