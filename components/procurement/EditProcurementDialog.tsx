'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface EditProcurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    isotope: string;
    quantity: string;
    deliveryDate: string;
    status: string;
  } | null;
}

export function EditProcurementDialog({ isOpen, onClose, request }: EditProcurementDialogProps) {
  const [formData, setFormData] = useState({
    isotope: request?.isotope || '',
    quantity: request?.quantity || '',
    deliveryDate: request?.deliveryDate || '',
  });

  const handleSave = () => {
    // In real app, this would call API to update the request
    console.log('Saving procurement request:', formData);
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Procurement Request</DialogTitle>
          <DialogDescription>
            Update the details for request {request.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="isotope">Isotope Type</Label>
            <Input
              id="isotope"
              value={formData.isotope}
              onChange={(e) => setFormData({ ...formData, isotope: e.target.value })}
              placeholder="Enter isotope type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm">
              <span className="text-gray-600">Current Status: </span>
              <span className="font-medium text-blue-900">{request.status}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
