'use client';

import { Download, Database, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  VerifyShipmentDialog,
  EventTimeline,
  ShipmentSearchBar,
  EventFilters,
  BlockchainStats,
  ExportAuditTrail,
  ChainVerificationBadge,
  EventDetailModal,
} from '@/components/traceability';
import { useBlockchainEvents } from '@/lib/hooks/useBlockchainEvents';
import { BlockchainEvent, EventQueryFilters, ChainStatistics } from '@/models/blockchain.model';
import { verifyChainIntegrity } from '@/lib/traceability-utils';

export default function TraceabilityPage() {
  const [selectedShipment, setSelectedShipment] = useState('SH-2851');
  const [isRegulatorView, setIsRegulatorView] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BlockchainEvent | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [filters, setFilters] = useState<EventQueryFilters>({});
  const [stats, setStats] = useState<ChainStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Use blockchain events hook
  const {
    events,
    isLoading,
    error,
    refresh,
    verifyChain,
    lastUpdated,
  } = useBlockchainEvents({
    shipmentId: selectedShipment,
    pollingInterval: 30000,
    autoRefresh: false,
  });

  // Fetch statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch('/api/traceability/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Verify chain integrity
  const chainIntegrity = events.length > 0 ? verifyChainIntegrity(events) : null;
  const chainStatus = chainIntegrity?.isValid
    ? 'valid'
    : chainIntegrity
    ? 'broken'
    : 'unverified';

  const handleSearch = (query: string) => {
    setSelectedShipment(query);
  };

  const handleEventClick = (event: BlockchainEvent) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleVerifyEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/traceability/events/${eventId}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Event verification: ${data.data.message}`);
      }
    } catch (err) {
      alert('Failed to verify event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Blockchain Traceability</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer self-start">
            <input
              type="checkbox"
              checked={isRegulatorView}
              onChange={(e) => setIsRegulatorView(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm">Regulator View</span>
          </label>
        </div>
      </div>

      {/* Regulator View Banner */}
      {isRegulatorView && (
        <div className="bg-blue-900 text-white rounded-xl p-4 sm:p-6 border-2 border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <h3 className="text-base sm:text-xl">Regulatory Portal - Read-Only Access</h3>
          </div>
          <p className="text-blue-200 text-xs sm:text-sm">
            This view provides blockchain-verified audit trails and compliance documentation.
            Pricing and PII are hidden in regulatory mode.
          </p>
        </div>
      )}

      {/* Statistics Dashboard */}
      {stats && !loadingStats && (
        <BlockchainStats stats={stats} />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg mb-4 font-medium">Search Shipments</h3>
        <div className="mb-4">
          <ShipmentSearchBar
            onSearch={handleSearch}
            initialValue={selectedShipment}
          />
        </div>
        <EventFilters
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Shipment Info Card */}
      {selectedShipment && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 flex-1">
              <div>
                <div className="text-xs sm:text-sm text-purple-100 mb-1">Shipment ID</div>
                <div className="text-lg sm:text-2xl font-mono">{selectedShipment}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-purple-100 mb-1">Events</div>
                <div className="text-base sm:text-xl">{events.length}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-purple-100 mb-1">Last Updated</div>
                <div className="text-base sm:text-xl">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-purple-100 mb-1">Chain Status</div>
                <ChainVerificationBadge
                  status={chainStatus}
                  eventCount={events.length}
                  onClick={() => setVerifyDialogOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading blockchain events...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <h3 className="text-red-900 font-medium">Error Loading Events</h3>
          </div>
          <p className="text-red-700 text-sm">{error.message}</p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Event Timeline */}
      {!isLoading && !error && events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-medium">Immutable Audit Trail</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                All events are recorded on Hyperledger Fabric blockchain
              </p>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <EventTimeline
              events={events}
              onEventClick={handleEventClick}
              onVerifyEvent={handleVerifyEvent}
              showVerificationStatus={true}
            />
          </div>

          {/* Export Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-600">
                <strong>{events.length}</strong> blockchain-verified events recorded
              </p>
              <ExportAuditTrail
                shipmentId={selectedShipment}
                events={events}
                onExport={(format) => console.log(`Exported as ${format}`)}
              />
            </div>
          </div>
        </div>
      )}

      {/* No Events State */}
      {!isLoading && !error && events.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-600 text-sm">
            No blockchain events found for shipment {selectedShipment}.
            <br />
            Try searching for a different shipment ID.
          </p>
        </div>
      )}

      {/* Dialogs */}
      <VerifyShipmentDialog
        isOpen={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        shipmentId={selectedShipment}
      />

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={eventModalOpen}
          onClose={() => {
            setEventModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
