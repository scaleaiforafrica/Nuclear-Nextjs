import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hyperledgerService } from '@/services';
import { exportToJSON, exportToCSV, generateAuditPDF } from '@/lib/traceability-utils';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * GET /api/traceability/shipments/[shipmentId]/export
 * Export audit trail in JSON, CSV, or PDF format
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { shipmentId: string } }
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
          error: 'You must be logged in to export audit trails',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const { shipmentId } = params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    // Validate format
    if (!['json', 'csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid format',
          error: 'Format must be one of: json, csv, pdf',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Verify shipment exists
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('shipment_number, batch_number, isotope')
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Shipment not found',
          error: `No shipment found with ID: ${shipmentId}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Get all events for shipment
    const events = await hyperledgerService.getShipmentEvents(shipmentId);

    if (events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No events found',
          error: 'No blockchain events found for this shipment',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Generate export based on format
    let blob: Blob;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'json':
        blob = await exportToJSON(shipmentId, events);
        contentType = 'application/json';
        filename = `audit_trail_${shipment.shipment_number}_${Date.now()}.json`;
        break;

      case 'csv':
        blob = await exportToCSV(shipmentId, events);
        contentType = 'text/csv';
        filename = `audit_trail_${shipment.shipment_number}_${Date.now()}.csv`;
        break;

      case 'pdf':
        blob = await generateAuditPDF(shipmentId, events, {
          includeHashes: true,
          includeSignatures: true,
          includeMetadata: true,
          includeTimeline: true,
          headerText: `Audit Trail - ${shipment.shipment_number}`,
        });
        contentType = 'application/pdf';
        filename = `audit_trail_${shipment.shipment_number}_${Date.now()}.pdf`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Unsupported format',
            error: `Format ${format} is not supported`,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
    }

    // Convert Blob to Buffer for NextResponse
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting audit trail:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to export audit trail',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
