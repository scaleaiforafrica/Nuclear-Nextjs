import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ProcurementRequest, CreateProcurementRequest } from '@/models/procurement.model'

// Validation schema for creating procurement requests
const createProcurementSchema = z.object({
  isotope: z.string().min(1, 'Isotope is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['mCi', 'GBq'], { errorMap: () => ({ message: 'Unit must be mCi or GBq' }) }),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  delivery_time_window: z.enum(['Morning', 'Afternoon', 'Evening']).optional(),
  delivery_location: z.string().min(1, 'Delivery location is required'),
  clinical_indication: z.string().optional(),
  special_instructions: z.string().optional(),
  status: z.enum(['Draft', 'Pending Quotes', 'Quotes Received', 'PO Approved', 'Completed', 'Cancelled']).optional(),
})

interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * GET /api/procurement
 * List procurement requests with optional filters
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ProcurementRequest[]>>> {
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
          error: 'You must be logged in to view procurement requests',
        },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const isotope = searchParams.get('isotope')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const per_page = parseInt(searchParams.get('per_page') || '30', 10)

    // Build query
    let query = supabase
      .from('procurement_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (isotope) {
      query = query.eq('isotope', isotope)
    }

    if (start_date) {
      query = query.gte('delivery_date', start_date)
    }

    if (end_date) {
      query = query.lte('delivery_date', end_date)
    }

    if (search) {
      query = query.or(`request_number.ilike.%${search}%,isotope.ilike.%${search}%,delivery_location.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * per_page
    const to = from + per_page - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching procurement requests:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch procurement requests',
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Procurement requests fetched successfully',
        data: data as ProcurementRequest[],
      },
      {
        headers: {
          'X-Total-Count': count?.toString() || '0',
          'X-Page': page.toString(),
          'X-Per-Page': per_page.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Unexpected error in GET /api/procurement:', error)
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
 * POST /api/procurement
 * Create a new procurement request
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ProcurementRequest>>> {
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
          error: 'You must be logged in to create procurement requests',
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createProcurementSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: validationResult.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      )
    }

    const data: CreateProcurementRequest = validationResult.data

    // Generate request number
    const { data: requestNumber, error: requestNumberError } = await supabase
      .rpc('generate_request_number')

    if (requestNumberError) {
      console.error('Error generating request number:', requestNumberError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to generate request number',
          error: requestNumberError.message,
        },
        { status: 500 }
      )
    }

    // Determine status color
    const statusColors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-700',
      'Pending Quotes': 'bg-amber-100 text-amber-700',
      'Quotes Received': 'bg-blue-100 text-blue-700',
      'PO Approved': 'bg-green-100 text-green-700',
      'Completed': 'bg-purple-100 text-purple-700',
      'Cancelled': 'bg-red-100 text-red-700',
    }

    const status = data.status || 'Draft'
    const status_color = statusColors[status] || 'bg-gray-100 text-gray-700'

    // Create procurement request
    const { data: procurementRequest, error: createError } = await supabase
      .from('procurement_requests')
      .insert({
        request_number: requestNumber,
        isotope: data.isotope,
        quantity: data.quantity,
        unit: data.unit,
        delivery_date: data.delivery_date,
        delivery_time_window: data.delivery_time_window,
        delivery_location: data.delivery_location,
        destination: data.delivery_location, // Set destination same as delivery location initially
        status,
        status_color,
        clinical_indication: data.clinical_indication,
        special_instructions: data.special_instructions,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating procurement request:', createError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create procurement request',
          error: createError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Procurement request created successfully',
        data: procurementRequest as ProcurementRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in POST /api/procurement:', error)
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
