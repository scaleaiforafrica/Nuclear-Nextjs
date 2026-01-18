'use client';

import { useState } from 'react';
import { BlockchainEvent } from '@/models/blockchain.model';
import { exportToJSON, exportToCSV, generateAuditPDF } from '@/lib/traceability-utils';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet, FileText, Loader2, Mail, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { ExportMenu, ExportFormat, ShareDestination } from '@/components/ui/export-menu';

interface ExportAuditTrailProps {
  shipmentId: string;
  events: BlockchainEvent[];
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
}

export function ExportAuditTrail({ shipmentId, events, onExport }: ExportAuditTrailProps) {
  const handleExport = async (format: ExportFormat) => {
    onExport?.(format as 'json' | 'csv' | 'pdf');

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
    }
  };

  const handleShare = async (destination: ShareDestination) => {
    try {
      if (destination === 'email') {
        const subject = encodeURIComponent(`Blockchain Audit Trail - Shipment ${shipmentId}`);
        const body = encodeURIComponent(
          `Blockchain-Verified Audit Trail\n\n` +
          `Shipment ID: ${shipmentId}\n` +
          `Total Events: ${events.length}\n` +
          `Generated: ${new Date().toLocaleString()}\n\n` +
          `This audit trail contains blockchain-verified events with cryptographic hashes and timestamps.`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        toast.success('Opening email client...');
      } else {
        // Simulate regulatory portal/cloud storage integration
        await new Promise(resolve => setTimeout(resolve, 1500));
        const destinations = {
          'google-drive': 'Google Drive',
          'dropbox': 'Regulatory Portal',
          'onedrive': 'Audit System',
          'sharepoint': 'SharePoint',
        };
        toast.success(`Audit trail would be shared to ${destinations[destination as keyof typeof destinations]}`, {
          description: 'Integration not yet configured. File will be downloaded instead.',
        });
        // Fall back to downloading
        await handleExport('pdf');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share audit trail');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <ExportMenu
        onExport={handleExport}
        onShare={handleShare}
        formats={['json', 'csv', 'pdf']}
        shareDestinations={['email', 'dropbox']}
        disabled={events.length === 0}
        buttonText="Export Audit Trail"
        buttonVariant="outline"
        showShareOptions={true}
      />
      {events.length === 0 && (
        <p className="text-sm text-gray-500">
          No events available to export
        </p>
      )}
    </div>
  );
}
