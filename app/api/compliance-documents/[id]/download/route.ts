import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/compliance-documents/[id]/download
 * Download a compliance document file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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
          error: 'You must be logged in to download documents',
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

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('compliance-documents')
      .download(document.storage_path);

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to download file',
          error: downloadError?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Log audit entry for download action
    await supabase.from('compliance_document_audit').insert({
      document_id: id,
      action: 'downloaded',
      performed_by: user.id,
      changes: {
        action_type: 'download',
        file_name: document.file_name,
      },
    });

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Return file as response with appropriate headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': document.file_type,
        'Content-Disposition': `attachment; filename="${document.file_name}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/compliance-documents/[id]/download:', error);
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
