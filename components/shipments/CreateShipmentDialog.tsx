'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Package, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ShipmentStatus } from '@/models/shipment.model';
import type { ProcurementRequest, ProcurementStatus } from '@/models/procurement.model';
import { createShipment, createShipmentFromProcurement } from '@/services/shipment.service';

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ManualFormData {
  isotope: string;
  batch_number: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  initial_activity?: string;
  estimated_delivery_time?: string;
  temperature_requirements?: string;
  special_handling_instructions?: string;
}

interface ProcurementFormData {
  procurement_request_id: string;
  carrier: string;
  estimated_delivery_time?: string;
  temperature_requirements?: string;
}

const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'Pending',
  'In Transit',
  'At Customs',
  'Dispatched',
  'Delivered',
];

// Procurement statuses that allow shipment creation
const VALID_PROCUREMENT_STATUSES_FOR_SHIPMENT: ProcurementStatus[] = ['PO Approved', 'Completed'];

export function CreateShipmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateShipmentDialogProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'procurement'>('manual');
  const [loading, setLoading] = useState(false);
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([]);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState<ProcurementRequest | null>(null);

  // Form for manual entry
  const manualForm = useForm<ManualFormData>({
    defaultValues: {
      isotope: '',
      batch_number: '',
      origin: '',
      destination: '',
      carrier: '',
      status: 'Pending',
      initial_activity: '',
      estimated_delivery_time: '',
      temperature_requirements: '',
      special_handling_instructions: '',
    },
  });

  // Form for procurement-based shipment
  const procurementForm = useForm<ProcurementFormData>({
    defaultValues: {
      procurement_request_id: '',
      carrier: '',
      estimated_delivery_time: '',
      temperature_requirements: '',
    },
  });

  // Fetch procurement requests when tab changes to procurement
  useEffect(() => {
    if (open && activeTab === 'procurement') {
      fetchProcurementRequests();
    }
  }, [open, activeTab]);

  // Fetch procurement requests with PO Approved or Completed status
  const fetchProcurementRequests = async () => {
    try {
      setFetchingRequests(true);
      const response = await fetch('/api/procurement');
      const data = await response.json();

      if (data.success) {
        // Filter for only PO Approved or Completed status
        const validRequests = (data.data || []).filter(
          (req: ProcurementRequest) =>
            VALID_PROCUREMENT_STATUSES_FOR_SHIPMENT.includes(req.status)
        );
        setProcurementRequests(validRequests);
      } else {
        toast.error('Failed to fetch procurement requests');
      }
    } catch (error) {
      console.error('Error fetching procurement requests:', error);
      toast.error('Failed to fetch procurement requests');
    } finally {
      setFetchingRequests(false);
    }
  };

  // Handle procurement request selection
  const handleProcurementSelect = (requestId: string) => {
    const request = procurementRequests.find((r) => r.id === requestId);
    setSelectedProcurement(request || null);
    procurementForm.setValue('procurement_request_id', requestId);
  };

  // Submit manual entry form
  const handleManualSubmit = async (data: ManualFormData) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!data.isotope || !data.batch_number || !data.origin || !data.destination || !data.carrier) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Prepare shipment data
      const shipmentData = {
        isotope: data.isotope.trim(),
        batch_number: data.batch_number.trim(),
        origin: data.origin.trim(),
        destination: data.destination.trim(),
        carrier: data.carrier.trim(),
        status: data.status,
        initial_activity: data.initial_activity ? parseFloat(data.initial_activity) : undefined,
        estimated_delivery_time: data.estimated_delivery_time?.trim() || undefined,
        temperature_requirements: data.temperature_requirements?.trim() || undefined,
        special_handling_instructions: data.special_handling_instructions?.trim() || undefined,
      };

      // Create shipment
      await createShipment(shipmentData);

      toast.success('Shipment created successfully', {
        description: `Shipment for ${data.isotope} has been created`,
      });

      // Reset form and close dialog
      manualForm.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  // Submit procurement form
  const handleProcurementSubmit = async (data: ProcurementFormData) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!data.procurement_request_id || !data.carrier) {
        toast.error('Please select a procurement request and enter carrier');
        return;
      }

      // Prepare shipment data
      const shipmentData = {
        procurement_request_id: data.procurement_request_id,
        carrier: data.carrier.trim(),
        estimated_delivery_time: data.estimated_delivery_time?.trim() || undefined,
        temperature_requirements: data.temperature_requirements?.trim() || undefined,
      };

      // Create shipment from procurement
      await createShipmentFromProcurement(shipmentData);

      toast.success('Shipment created successfully', {
        description: `Shipment created from procurement request ${selectedProcurement?.request_number}`,
      });

      // Reset form and close dialog
      procurementForm.reset();
      setSelectedProcurement(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating shipment from procurement:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  // Reset forms when dialog closes
  useEffect(() => {
    if (!open) {
      manualForm.reset();
      procurementForm.reset();
      setSelectedProcurement(null);
      setActiveTab('manual');
    }
  }, [open, manualForm, procurementForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>
            Create a shipment manually or from an existing procurement request
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'procurement')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Manual Entry</span>
              <span className="sm:hidden">Manual</span>
            </TabsTrigger>
            <TabsTrigger value="procurement" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">From Procurement</span>
              <span className="sm:hidden">Procurement</span>
            </TabsTrigger>
          </TabsList>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Isotope */}
                <div className="space-y-2">
                  <Label htmlFor="isotope">
                    Isotope <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="isotope"
                    placeholder="e.g., Tc-99m"
                    {...manualForm.register('isotope', { required: true })}
                  />
                </div>

                {/* Batch Number */}
                <div className="space-y-2">
                  <Label htmlFor="batch_number">
                    Batch Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="batch_number"
                    placeholder="e.g., BATCH-TC99M-202401-001"
                    {...manualForm.register('batch_number', { required: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Origin */}
                <div className="space-y-2">
                  <Label htmlFor="origin">
                    Origin <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="origin"
                    placeholder="e.g., New York, NY"
                    {...manualForm.register('origin', { required: true })}
                  />
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <Label htmlFor="destination">
                    Destination <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Boston, MA"
                    {...manualForm.register('destination', { required: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Carrier */}
                <div className="space-y-2">
                  <Label htmlFor="carrier">
                    Carrier <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="carrier"
                    placeholder="e.g., FedEx Medical"
                    {...manualForm.register('carrier', { required: true })}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={manualForm.watch('status')}
                    onValueChange={(value) => manualForm.setValue('status', value as ShipmentStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Activity */}
                <div className="space-y-2">
                  <Label htmlFor="initial_activity">Initial Activity (mCi)</Label>
                  <Input
                    id="initial_activity"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 100"
                    {...manualForm.register('initial_activity')}
                  />
                </div>

                {/* Estimated Delivery Time */}
                <div className="space-y-2">
                  <Label htmlFor="estimated_delivery_time">Estimated Delivery Time</Label>
                  <Input
                    id="estimated_delivery_time"
                    placeholder="e.g., 24 hours"
                    {...manualForm.register('estimated_delivery_time')}
                  />
                </div>
              </div>

              {/* Temperature Requirements */}
              <div className="space-y-2">
                <Label htmlFor="temperature_requirements">Temperature Requirements</Label>
                <Textarea
                  id="temperature_requirements"
                  placeholder="e.g., Maintain between 2-8°C"
                  rows={2}
                  {...manualForm.register('temperature_requirements')}
                />
              </div>

              {/* Special Handling Instructions */}
              <div className="space-y-2">
                <Label htmlFor="special_handling_instructions">Special Handling Instructions</Label>
                <Textarea
                  id="special_handling_instructions"
                  placeholder="Enter any special handling requirements..."
                  rows={2}
                  {...manualForm.register('special_handling_instructions')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Shipment
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* From Procurement Tab */}
          <TabsContent value="procurement" className="space-y-4 mt-4">
            <form onSubmit={procurementForm.handleSubmit(handleProcurementSubmit)} className="space-y-4">
              {/* Procurement Request Selection */}
              <div className="space-y-2">
                <Label htmlFor="procurement_request">
                  Procurement Request <span className="text-red-500">*</span>
                </Label>
                {fetchingRequests ? (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading requests...</span>
                  </div>
                ) : procurementRequests.length === 0 ? (
                  <div className="p-4 border rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600">
                      No procurement requests available. Only requests with status &quot;{VALID_PROCUREMENT_STATUSES_FOR_SHIPMENT.join('&quot; or &quot;')}&quot; can be used to create shipments.
                    </p>
                  </div>
                ) : (
                  <Select
                    value={procurementForm.watch('procurement_request_id')}
                    onValueChange={handleProcurementSelect}
                  >
                    <SelectTrigger id="procurement_request">
                      <SelectValue placeholder="Select a procurement request" />
                    </SelectTrigger>
                    <SelectContent>
                      {procurementRequests.map((request) => (
                        <SelectItem key={request.id} value={request.id}>
                          {request.request_number} - {request.isotope} ({request.quantity} {request.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Selected Procurement Details */}
              {selectedProcurement && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-blue-900">Selected Request Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Isotope:</span>{' '}
                      <span className="font-medium">{selectedProcurement.isotope}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>{' '}
                      <span className="font-medium">
                        {selectedProcurement.quantity} {selectedProcurement.unit}
                      </span>
                    </div>
                    {selectedProcurement.origin && (
                      <div>
                        <span className="text-gray-600">Origin:</span>{' '}
                        <span className="font-medium">{selectedProcurement.origin}</span>
                      </div>
                    )}
                    {selectedProcurement.destination && (
                      <div>
                        <span className="text-gray-600">Destination:</span>{' '}
                        <span className="font-medium">{selectedProcurement.destination}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Carrier */}
              <div className="space-y-2">
                <Label htmlFor="procurement_carrier">
                  Carrier <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="procurement_carrier"
                  placeholder="e.g., FedEx Medical"
                  {...procurementForm.register('carrier', { required: true })}
                />
              </div>

              {/* Estimated Delivery Time */}
              <div className="space-y-2">
                <Label htmlFor="procurement_delivery_time">Estimated Delivery Time</Label>
                <Input
                  id="procurement_delivery_time"
                  placeholder="e.g., 24 hours"
                  {...procurementForm.register('estimated_delivery_time')}
                />
              </div>

              {/* Temperature Requirements */}
              <div className="space-y-2">
                <Label htmlFor="procurement_temperature">Temperature Requirements</Label>
                <Textarea
                  id="procurement_temperature"
                  placeholder="e.g., Maintain between 2-8°C"
                  rows={2}
                  {...procurementForm.register('temperature_requirements')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !selectedProcurement}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Shipment
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
