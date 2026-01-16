import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ProcurementRequest, UpdateProcurementRequest } from '@/models/procurement.model'

// Validation schema for updating procurement requests
const updateProcurementSchema = z.object({
  isotope: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.enum(['mCi', 'GBq']).optional(),
  delivery_date: z.string().optional(),
  delivery_time_window: z.enum(['Morning', 'Afternoon', 'Evening']).optional(),
  delivery_location: z.string().optional(),
  clinical_indication: z.string().optional(),
  special_instructions: z.string().optional(),
  status: z.enum(['Draft', 'Pending Quotes', 'Quotes Received', 'PO Approved', 'Completed', 'Cancelled']).optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
})

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * GET /api/procurement/[id]
 * Get a single procurement request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProcurementRequest>>> {
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
          error: 'You must be logged in to view procurement requests',
        },
        { status: 401 }
      )
    }

    // Fetch procurement request
    const { data, error } = await supabase
      .from('procurement_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching procurement request:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Procurement request not found',
          error: error.message,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Procurement request fetched successfully',
      data: data as ProcurementRequest,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/procurement/[id]:', error)
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

/**
 * PUT /api/procurement/[id]
 * Update a procurement request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProcurementRequest>>> {
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
          error: 'You must be logged in to update procurement requests',
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateProcurementSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: validationResult.error.issues.map(e => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    const data: Partial<UpdateProcurementRequest> & { status_color?: string } = validationResult.data

    // Update status color if status is being changed
    if (data.status) {
      const statusColors: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700',
        'Pending Quotes': 'bg-amber-100 text-amber-700',
        'Quotes Received': 'bg-blue-100 text-blue-700',
        'PO Approved': 'bg-green-100 text-green-700',
        'Completed': 'bg-purple-100 text-purple-700',
        'Cancelled': 'bg-red-100 text-red-700',
      }
      data.status_color = statusColors[data.status] || 'bg-gray-100 text-gray-700'
    }

    // Update procurement request
    const { data: procurementRequest, error: updateError } = await supabase
      .from('procurement_requests')
      .update(data)
      .eq('id', id)
      .eq('created_by', user.id) // Ensure user can only update their own requests
      .select()
      .single()

    if (updateError) {
      console.error('Error updating procurement request:', updateError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update procurement request',
          error: updateError.message,
        },
        { status: 500 }
      )
    }

    if (!procurementRequest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Procurement request not found or you do not have permission to update it',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Procurement request updated successfully',
      data: procurementRequest as ProcurementRequest,
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/procurement/[id]:', error)
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

/**
 * DELETE /api/procurement/[id]
 * Delete/Cancel a procurement request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
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
          error: 'You must be logged in to delete procurement requests',
        },
        { status: 401 }
      )
    }

    // Soft delete by setting status to Cancelled
    const { error: updateError } = await supabase
      .from('procurement_requests')
      .update({
        status: 'Cancelled',
        status_color: 'bg-red-100 text-red-700',
      })
      .eq('id', id)
      .eq('created_by', user.id) // Ensure user can only delete their own requests

    if (updateError) {
      console.error('Error deleting procurement request:', updateError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to delete procurement request',
          error: updateError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Procurement request cancelled successfully',
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/procurement/[id]:', error)
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
