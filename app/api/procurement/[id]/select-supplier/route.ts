import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ProcurementRequest } from '@/models/procurement.model'

// Validation schema for supplier selection
const selectSupplierSchema = z.object({
  supplier_id: z.string().uuid('Invalid supplier ID'),
  quote_id: z.string().uuid('Invalid quote ID').optional(),
})

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * PUT /api/procurement/[id]/select-supplier
 * Select a supplier for a procurement request
 * Automatically populates origin from supplier location via database trigger
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
          error: 'You must be logged in to select suppliers',
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = selectSupplierSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: validationResult.error.issues.map((e: { message: string }) => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    const { supplier_id, quote_id } = validationResult.data

    // Verify procurement request exists and user owns it
    const { data: existingRequest, error: fetchError } = await supabase
      .from('procurement_requests')
      .select('*')
      .eq('id', id)
      .eq('created_by', user.id)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Procurement request not found or you do not have permission to modify it',
          error: fetchError?.message,
        },
        { status: 404 }
      )
    }

    // Verify supplier exists
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id, name, location')
      .eq('id', supplier_id)
      .single()

    if (supplierError || !supplier) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supplier not found',
          error: supplierError?.message || 'Invalid supplier ID',
        },
        { status: 404 }
      )
    }

    // If quote_id is provided, verify it belongs to this procurement and supplier
    if (quote_id) {
      const { data: quote, error: quoteError } = await supabase
        .from('procurement_quotes')
        .select('id')
        .eq('id', quote_id)
        .eq('procurement_request_id', id)
        .eq('supplier_id', supplier_id)
        .single()

      if (quoteError || !quote) {
        return NextResponse.json(
          {
            success: false,
            message: 'Quote not found or does not match the procurement request and supplier',
            error: quoteError?.message,
          },
          { status: 404 }
        )
      }
    }

    // Update procurement request with selected supplier
    // The database trigger will automatically populate origin from supplier.location
    const { data: updatedRequest, error: updateError } = await supabase
      .from('procurement_requests')
      .update({
        selected_supplier_id: supplier_id,
        status: 'PO Approved',
        status_color: 'bg-green-100 text-green-700',
      })
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating procurement request:', updateError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to select supplier',
          error: updateError.message,
        },
        { status: 500 }
      )
    }

    if (!updatedRequest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update procurement request',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Supplier "${supplier.name}" selected successfully. Origin set to ${supplier.location}.`,
      data: updatedRequest as ProcurementRequest,
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/procurement/[id]/select-supplier:', error)
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
