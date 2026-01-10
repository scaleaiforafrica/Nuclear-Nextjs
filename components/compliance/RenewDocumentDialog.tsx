'use client';

import { AlertTriangle, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface RenewDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    name: string;
    shipmentId: string;
  } | null;
}

export function RenewDocumentDialog({ isOpen, onClose, document }: RenewDocumentDialogProps) {
  const [expiryDate, setExpiryDate] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);

  const handleRenew = async () => {
    setIsRenewing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Renewing document:', document?.name, 'with expiry:', expiryDate);
    setIsRenewing(false);
    onClose();
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Renew Document</DialogTitle>
          <DialogDescription>
            Renew {document.name} for shipment {document.shipmentId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">Document Expired</p>
              <p className="text-amber-700">
                This document needs to be renewed immediately to avoid shipment delays.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">New Expiry Date</Label>
            <div className="relative">
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500">
              Select a new expiry date for this document
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Document Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Document Name</span>
                <span className="font-medium">{document.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipment ID</span>
                <span className="font-medium font-mono">{document.shipmentId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isRenewing}>
            Cancel
          </Button>
          <Button 
            onClick={handleRenew} 
            disabled={!expiryDate || isRenewing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRenewing ? 'Renewing...' : 'Renew Document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
