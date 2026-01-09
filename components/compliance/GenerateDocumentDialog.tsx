'use client';

import { FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface GenerateDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    name: string;
    shipmentId: string;
  } | null;
}

export function GenerateDocumentDialog({ isOpen, onClose, document }: GenerateDocumentDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate document generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Generated document:', document?.name);
    setIsGenerating(false);
    onClose();
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Document</DialogTitle>
          <DialogDescription>
            Generate {document.name} for shipment {document.shipmentId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium mb-2">{document.name}</h3>
            <p className="text-sm text-gray-600">
              This document will be automatically generated based on shipment data 
              and regulatory requirements.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">What's included:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                <span>Shipment details and isotope information</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                <span>Regulatory compliance certifications</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                <span>Digital signatures and timestamps</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5"></div>
                <span>Blockchain verification hash</span>
              </li>
            </ul>
          </div>

          {isGenerating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-900">Generating document...</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Document
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
