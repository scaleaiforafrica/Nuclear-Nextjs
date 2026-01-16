'use client';

import { useEffect, useState } from 'react';
import { Package, ExternalLink, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Shipment } from '@/models/shipment.model';
import { fetchShipmentByProcurementId } from '@/services/shipment.service';
import { Button } from '@/components/ui/button';
import { CreateShipmentDialog } from '@/components/shipments';

interface ProcurementShipmentLinkProps {
  procurementRequestId: string;
  procurementStatus: string;
  onShipmentCreated?: () => void;
  className?: string;
}

/**
 * ProcurementShipmentLink Component
 * Shows shipment status for a procurement request
 * Displays "Create Shipment" button if no shipment exists (for PO Approved/Completed)
 * Shows link to shipment details if shipment exists
 */
export function ProcurementShipmentLink({
  procurementRequestId,
  procurementStatus,
  onShipmentCreated,
  className = '',
}: ProcurementShipmentLinkProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch shipment for this procurement request
  useEffect(() => {
    const loadShipment = async () => {
      try {
        setLoading(true);
        const data = await fetchShipmentByProcurementId(procurementRequestId);
        setShipment(data);
      } catch (error) {
        // 404 is expected if no shipment exists - not an error
        if (error instanceof Error && !error.message.includes('404')) {
          console.error('Error fetching shipment:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadShipment();
  }, [procurementRequestId]);

  // Handle successful shipment creation
  const handleShipmentCreated = () => {
    setShowCreateDialog(false);
    toast.success('Shipment created successfully');
    // Reload shipment data
    fetchShipmentByProcurementId(procurementRequestId)
      .then(setShipment)
      .catch(console.error);
    if (onShipmentCreated) {
      onShipmentCreated();
    }
  };

  // Check if procurement can have shipment created
  const canCreateShipment = ['PO Approved', 'Completed'].includes(procurementStatus);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  // If shipment exists, show link to it
  if (shipment) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link
          href={`/dashboard/shipments?id=${shipment.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Package className="h-4 w-4" />
          <span>{shipment.shipment_number}</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${shipment.status_color}`}>
          {shipment.status}
        </span>
      </div>
    );
  }

  // If no shipment and can create, show create button
  if (canCreateShipment) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className={`text-xs ${className}`}
        >
          <Plus className="h-3 w-3 mr-1" />
          Create Shipment
        </Button>

        <CreateShipmentDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleShipmentCreated}
        />
      </>
    );
  }

  // Otherwise, show no shipment message
  return (
    <div className={`text-sm text-gray-400 ${className}`}>
      <span>No shipment</span>
    </div>
  );
}
