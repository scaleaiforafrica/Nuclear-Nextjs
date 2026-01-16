'use client';

import { useState } from 'react';
import { BlockchainEvent } from '@/models/blockchain.model';
import { exportToJSON, exportToCSV, generateAuditPDF } from '@/lib/traceability-utils';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportAuditTrailProps {
  shipmentId: string;
  events: BlockchainEvent[];
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
}

export function ExportAuditTrail({ shipmentId, events, onExport }: ExportAuditTrailProps) {
  const [exporting, setExporting] = useState<'json' | 'csv' | 'pdf' | null>(null);

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setExporting(format);
    onExport?.(format);

    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'json':
          blob = await exportToJSON(shipmentId, events);
          filename = `audit_trail_${shipmentId}_${Date.now()}.json`;
          break;
        case 'csv':
          blob = await exportToCSV(shipmentId, events);
          filename = `audit_trail_${shipmentId}_${Date.now()}.csv`;
          break;
        case 'pdf':
          blob = await generateAuditPDF(shipmentId, events, {
            includeHashes: true,
            includeSignatures: true,
            includeMetadata: true,
            includeTimeline: true,
          });
          filename = `audit_trail_${shipmentId}_${Date.now()}.txt`; // Will be PDF in production
          break;
        default:
          throw new Error('Invalid export format');
      }

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Audit trail exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export audit trail');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg">Export Audit Trail</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* JSON Export */}
        <Button
          variant="outline"
          onClick={() => handleExport('json')}
          disabled={exporting !== null || events.length === 0}
          className="min-h-[44px] flex items-center justify-center gap-2"
        >
          {exporting === 'json' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileJson className="w-4 h-4" />
              Export JSON
            </>
          )}
        </Button>

        {/* CSV Export */}
        <Button
          variant="outline"
          onClick={() => handleExport('csv')}
          disabled={exporting !== null || events.length === 0}
          className="min-h-[44px] flex items-center justify-center gap-2"
        >
          {exporting === 'csv' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </>
          )}
        </Button>

        {/* PDF Export */}
        <Button
          variant="outline"
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null || events.length === 0}
          className="min-h-[44px] flex items-center justify-center gap-2"
        >
          {exporting === 'pdf' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Export PDF
            </>
          )}
        </Button>
      </div>

      {events.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          No events available to export
        </p>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <p className="text-xs text-blue-900">
          <strong>Note:</strong> Exported files contain blockchain-verified data including
          hashes, timestamps, and digital signatures for compliance and audit purposes.
        </p>
      </div>
    </div>
  );
}
