import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ComplianceDocument, DocumentFilter } from '@/models/compliance-document.model';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * GET /api/compliance-documents
 * List compliance documents with optional filters
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ComplianceDocument[]>>> {
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
          error: 'You must be logged in to view documents',
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const shipment_id = searchParams.get('shipment_id');
    const document_type = searchParams.get('document_type');
    const status = searchParams.get('status');
    const uploaded_by = searchParams.get('uploaded_by');
    const expiry_from = searchParams.get('expiry_from');
    const expiry_to = searchParams.get('expiry_to');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = parseInt(searchParams.get('per_page') || '50', 10);

    // Build query
    let query = supabase
      .from('compliance_documents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (shipment_id) {
      query = query.eq('shipment_id', shipment_id);
    }

    if (document_type) {
      query = query.eq('document_type', document_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (uploaded_by) {
      query = query.eq('uploaded_by', uploaded_by);
    }

    if (expiry_from) {
      query = query.gte('expiry_date', expiry_from);
    }

    if (expiry_to) {
      query = query.lte('expiry_date', expiry_to);
    }

    // Apply pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch documents',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Documents fetched successfully',
        data: data || [],
        count: count || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/compliance-documents:', error);
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

/**
 * POST /api/compliance-documents
 * Upload a new compliance document
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ComplianceDocument>>> {
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
          error: 'You must be logged in to upload documents',
        },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const shipment_id = formData.get('shipment_id') as string;
    const document_type = formData.get('document_type') as string;
    const document_name = formData.get('document_name') as string;
    const expiry_date = formData.get('expiry_date') as string | null;
    const jurisdictionStr = formData.get('jurisdiction') as string | null;
    const notes = formData.get('notes') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'File is required',
        },
        { status: 400 }
      );
    }

    if (!shipment_id || !document_type || !document_name) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'shipment_id, document_type, and document_name are required',
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'File size exceeds 10MB limit',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: 'File type must be PDF, PNG, or JPEG',
        },
        { status: 400 }
      );
    }

    // Verify shipment exists
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id')
      .eq('id', shipment_id)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid shipment',
          error: 'The specified shipment does not exist',
        },
        { status: 400 }
      );
    }

    // Parse jurisdiction if provided
    let jurisdiction: string[] | undefined;
    if (jurisdictionStr) {
      try {
        jurisdiction = JSON.parse(jurisdictionStr);
      } catch {
        jurisdiction = undefined;
      }
    }

    // Generate unique file name with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedDocType = document_type.replace(/\s+/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedDocType}.${fileExtension}`;
    
    // Storage path: {shipment_id}/{document_type}/{timestamp}_{filename}
    const storagePath = `${shipment_id}/${sanitizedDocType}/${uniqueFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('compliance-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to upload file',
          error: uploadError.message,
        },
        { status: 500 }
      );
    }

    // Generate signed URL (valid for 1 year for long-term access)
    const { data: urlData } = await supabase.storage
      .from('compliance-documents')
      .createSignedUrl(storagePath, 31536000); // 1 year in seconds

    const file_url = urlData?.signedUrl || '';

    // Insert document record in database
    const { data: document, error: insertError } = await supabase
      .from('compliance_documents')
      .insert({
        shipment_id,
        document_type,
        document_name,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url,
        storage_path: storagePath,
        status: 'uploaded', // Set status to uploaded immediately
        uploaded_by: user.id,
        expiry_date: expiry_date || null,
        jurisdiction: jurisdiction || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      // If database insert fails, try to clean up the uploaded file
      await supabase.storage.from('compliance-documents').remove([storagePath]);
      
      console.error('Error creating document record:', insertError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create document record',
          error: insertError.message,
        },
        { status: 500 }
      );
    }

    // Log audit entry
    await supabase.from('compliance_document_audit').insert({
      document_id: document.id,
      action: 'created',
      performed_by: user.id,
      changes: {
        document_type,
        document_name,
        status: 'uploaded',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/compliance-documents:', error);
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
