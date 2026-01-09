'use client';

import { FileText, Download, Calendar, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ViewDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    name: string;
    description: string;
    shipmentId: string;
    status: string;
    required: string[];
  } | null;
}

export function ViewDocumentDialog({ isOpen, onClose, document }: ViewDocumentDialogProps) {
  if (!document) return null;

  const handleDownload = () => {
    console.log('Downloading document:', document.name);
    // In real app, this would trigger document download
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {document.name}
          </DialogTitle>
          <DialogDescription>{document.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Preview */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Document preview not available
            </p>
            <Button 
              variant="outline" 
              onClick={handleDownload}
              className="flex items-center gap-2 mx-auto"
            >
              <Download className="w-4 h-4" />
              Download to View
            </Button>
          </div>

          {/* Document Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Shipment ID</span>
              <span className="font-mono font-medium">{document.shipmentId}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                document.status === 'complete' 
                  ? 'bg-green-100 text-green-700' 
                  : document.status === 'expired'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {document.status === 'complete' ? 'Complete' : 
                 document.status === 'expired' ? 'Expired' : 
                 'In Progress'}
              </span>
            </div>
            <div className="py-2">
              <span className="text-sm text-gray-600 block mb-2">Required for:</span>
              <div className="flex flex-wrap gap-2">
                {document.required.map((jurisdiction, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                  >
                    {jurisdiction}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Compliance Notes</h4>
            <p className="text-sm text-blue-700">
              This document is required for compliance with nuclear medicine transportation 
              regulations. Ensure all information is accurate before shipment.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
