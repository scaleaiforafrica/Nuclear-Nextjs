import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * GET /api/compliance-documents/[id]/preview
 * Generate a signed URL for in-browser preview
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ url: string; file_type: string; file_name: string }>>> {
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
          error: 'You must be logged in to preview documents',
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch document
    const { data: document, error: fetchError } = await supabase
      .from('compliance_documents')
      .select('storage_path, file_type, file_name')
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

    // Generate signed URL valid for 1 hour
    const { data: urlData, error: urlError } = await supabase.storage
      .from('compliance-documents')
      .createSignedUrl(document.storage_path, 3600); // 1 hour

    if (urlError || !urlData) {
      console.error('Error generating signed URL:', urlError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to generate preview URL',
          error: urlError?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Log audit entry for preview/view action
    await supabase.from('compliance_document_audit').insert({
      document_id: id,
      action: 'downloaded', // We use 'downloaded' action for both preview and download
      performed_by: user.id,
      changes: {
        action_type: 'preview',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Preview URL generated successfully',
        data: {
          url: urlData.signedUrl,
          file_type: document.file_type,
          file_name: document.file_name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/compliance-documents/[id]/preview:', error);
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
