import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ComplianceDocument, UpdateDocumentRequest } from '@/models/compliance-document.model';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Validation schema for updates
const updateDocumentSchema = z.object({
  document_name: z.string().min(1).optional(),
  status: z.enum(['pending', 'uploaded', 'verified', 'rejected', 'expired']).optional(),
  expiry_date: z.string().optional(),
  jurisdiction: z.array(z.string()).optional(),
  notes: z.string().optional(),
  verified_by: z.string().uuid().optional(),
});

/**
 * GET /api/compliance-documents/[id]
 * Get a single compliance document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
          error: 'You must be logged in to view documents',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch document
    const { data: document, error } = await supabase
      .from('compliance_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            message: 'Document not found',
            error: 'The requested document does not exist',
          },
          { status: 404 }
        );
      }

      console.error('Error fetching document:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch document',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Document fetched successfully',
        data: document,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/compliance-documents/[id]:', error);
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
 * PATCH /api/compliance-documents/[id]
 * Update a compliance document
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
          error: 'You must be logged in to update documents',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateDocumentSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: errors.join(', '),
        },
        { status: 400 }
      );
    }

    const updateData: UpdateDocumentRequest = validation.data;

    // Get current document to track changes
    const { data: currentDoc, error: fetchError } = await supabase
      .from('compliance_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Document not found',
          error: 'The requested document does not exist',
        },
        { status: 404 }
      );
    }

    // Update document
    const { data: document, error: updateError } = await supabase
      .from('compliance_documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating document:', updateError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update document',
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    // Track changes for audit
    const changes: Record<string, any> = {};
    Object.keys(updateData).forEach((key) => {
      const typedKey = key as keyof UpdateDocumentRequest;
      if (updateData[typedKey] !== undefined) {
        changes[key] = {
          from: (currentDoc as any)[key],
          to: updateData[typedKey],
        };
      }
    });

    // Log audit entry
    const auditAction = updateData.status === 'verified' ? 'verified' : updateData.status === 'rejected' ? 'rejected' : 'updated';
    await supabase.from('compliance_document_audit').insert({
      document_id: id,
      action: auditAction,
      performed_by: user.id,
      changes,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Document updated successfully',
        data: document,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in PATCH /api/compliance-documents/[id]:', error);
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
 * DELETE /api/compliance-documents/[id]
 * Delete a compliance document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<void>>> {
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
          error: 'You must be logged in to delete documents',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get document info before deletion
    const { data: document, error: fetchError } = await supabase
      .from('compliance_documents')
      .select('storage_path, document_name, document_type')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Document not found',
          error: 'The requested document does not exist',
        },
        { status: 404 }
      );
    }

    // Log audit entry before deletion
    await supabase.from('compliance_document_audit').insert({
      document_id: id,
      action: 'deleted',
      performed_by: user.id,
      changes: {
        document_name: document.document_name,
        document_type: document.document_type,
      },
    });

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('compliance-documents')
      .remove([document.storage_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from('compliance_documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to delete document',
          error: deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Document deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/compliance-documents/[id]:', error);
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
