import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Supplier } from '@/models/procurement.model'

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * GET /api/suppliers
 * List all active suppliers
 * Only returns suppliers where is_active = true
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Supplier[]>>> {
  try {
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
          error: 'You must be logged in to view suppliers',
        },
        { status: 401 }
      )
    }

    // Fetch active suppliers
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching suppliers:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch suppliers',
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Suppliers fetched successfully',
      data: data as Supplier[],
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/suppliers:', error)
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
