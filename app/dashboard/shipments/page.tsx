'use client';

import { Plus, Search, Filter, Loader2, ArrowLeft, MapPin, Clock, Package, Thermometer, AlertCircle, Eye, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MobileOnly, DesktopOnly, MobileTableCard, MobileTableCardRow } from '@/components/responsive';
import { CreateShipmentDialog, ShipmentRouteCard } from '@/components/shipments';
import type { Shipment, ShipmentStatus } from '@/models/shipment.model';
import { fetchShipments, fetchShipmentById, formatShipmentETA } from '@/services/shipment.service';
import { toast } from 'sonner';

export default function ShipmentsPage() {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<ShipmentStatus | ''>('');
  const [filterIsotope, setFilterIsotope] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFromProcurement, setFilterFromProcurement] = useState<boolean | undefined>(undefined);

  // Fetch shipments from API
  const loadShipments = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterIsotope) filters.isotope = filterIsotope;
      if (filterFromProcurement !== undefined) filters.from_procurement = filterFromProcurement;
      
      const data = await fetchShipments(filters);
      setShipments(data);
    } catch (error) {
      toast.error('Failed to fetch shipments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single shipment details
  const loadShipmentDetails = async (id: string) => {
    try {
      setDetailLoading(true);
      const data = await fetchShipmentById(id);
      if (data) {
        setSelectedShipment(data);
      } else {
        toast.error('Shipment not found');
        setSelectedShipment(null);
      }
    } catch (error) {
      toast.error('Failed to fetch shipment details');
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadShipments();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadShipments();
  }, [filterStatus, filterIsotope, filterFromProcurement]);

  // Handle shipment creation success
  const handleShipmentCreated = () => {
    setCreateDialogOpen(false);
    loadShipments();
    toast.success('Shipment created successfully');
  };

  // Handle row click
  const handleShipmentClick = (shipment: Shipment) => {
    loadShipmentDetails(shipment.id);
  };

  // Filter shipments by search query
  const filteredShipments = shipments.filter(shipment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      shipment.shipment_number.toLowerCase().includes(query) ||
      shipment.isotope.toLowerCase().includes(query) ||
      shipment.batch_number.toLowerCase().includes(query) ||
      shipment.origin.toLowerCase().includes(query) ||
      shipment.destination.toLowerCase().includes(query)
    );
  });

  // Get unique isotopes for filter
  const uniqueIsotopes = Array.from(new Set(shipments.map(s => s.isotope))).sort();

  // Detail view
  if (selectedShipment) {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      );
    }

    return (
      <div>
        <button 
          onClick={() => setSelectedShipment(null)}
          className="mb-6 text-purple-600 hover:text-purple-700 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shipments
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-mono mb-3">{selectedShipment.shipment_number}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Isotope:</span>
                  <span className="ml-2 font-medium">{selectedShipment.isotope}</span>
                </div>
                <div>
                  <span className="text-gray-600">Batch:</span>
                  <span className="ml-2 font-mono text-xs">{selectedShipment.batch_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs ${selectedShipment.status_color}`}>
                    {selectedShipment.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Carrier:</span>
                  <span className="ml-2 font-medium">{selectedShipment.carrier}</span>
                </div>
                <div>
                  <span className="text-gray-600">ETA:</span>
                  <span className="ml-2 font-medium">{formatShipmentETA(selectedShipment.eta)}</span>
                </div>
                {selectedShipment.procurement_request_id && (
                  <div>
                    <span className="text-gray-600">Procurement:</span>
                    <span className="ml-2 font-mono text-xs text-purple-600">{selectedShipment.procurement_request_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Route Card */}
        <div className="mb-6">
          <ShipmentRouteCard
            origin={selectedShipment.origin}
            destination={selectedShipment.destination}
            waypoints={selectedShipment.route_waypoints}
            eta={selectedShipment.eta}
            estimatedDeliveryTime={selectedShipment.estimated_delivery_time}
            currentActivity={selectedShipment.current_activity}
            initialActivity={selectedShipment.initial_activity}
            expectedActivityAtArrival={selectedShipment.expected_activity_at_arrival}
            isotope={selectedShipment.isotope}
          />
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Information */}
          {selectedShipment.initial_activity && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Activity Decay Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Initial Activity</span>
                  <span className="font-semibold">{selectedShipment.initial_activity} mCi</span>
                </div>
                {selectedShipment.current_activity && (
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">Current Activity</span>
                    <span className="font-semibold text-blue-600">{selectedShipment.current_activity.toFixed(2)} mCi</span>
                  </div>
                )}
                {selectedShipment.expected_activity_at_arrival && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected at Arrival</span>
                    <span className="font-semibold text-green-600">{selectedShipment.expected_activity_at_arrival.toFixed(2)} mCi</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Handling Requirements */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-blue-600" />
              Handling Requirements
            </h3>
            <div className="space-y-3">
              {selectedShipment.temperature_requirements && (
                <div>
                  <span className="text-gray-600 text-sm">Temperature:</span>
                  <p className="font-medium">{selectedShipment.temperature_requirements}</p>
                </div>
              )}
              {selectedShipment.special_handling_instructions && (
                <div>
                  <span className="text-gray-600 text-sm">Special Instructions:</span>
                  <p className="font-medium">{selectedShipment.special_handling_instructions}</p>
                </div>
              )}
              {!selectedShipment.temperature_requirements && !selectedShipment.special_handling_instructions && (
                <p className="text-gray-500 text-sm">No special handling requirements specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Waypoints Timeline */}
        {selectedShipment.route_waypoints && selectedShipment.route_waypoints.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Waypoints Timeline
            </h3>
            <div className="space-y-4">
              {selectedShipment.route_waypoints.map((waypoint, index) => (
                <div key={`${waypoint.name}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full ${
                      waypoint.status === 'completed' ? 'bg-green-600' :
                      waypoint.status === 'current' ? 'bg-blue-600' :
                      'bg-gray-300'
                    }`}></div>
                    {index < selectedShipment.route_waypoints!.length - 1 && (
                      <div className={`w-0.5 h-full mt-2 ${
                        waypoint.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="font-medium">{waypoint.name}</div>
                    {waypoint.timestamp && (
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(waypoint.timestamp).toLocaleString()}
                      </div>
                    )}
                    {waypoint.status === 'current' && (
                      <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Current Location
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl">Shipments & Logistics</h2>
        <button 
          onClick={() => setCreateDialogOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Shipment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mb-6 border border-gray-200">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by shipment number, isotope, batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          
          {/* Filter dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ShipmentStatus | '')}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="At Customs">At Customs</option>
              <option value="Delivered">Delivered</option>
            </select>
            
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={filterIsotope}
              onChange={(e) => setFilterIsotope(e.target.value)}
            >
              <option value="">All Isotopes</option>
              {uniqueIsotopes.map(isotope => (
                <option key={isotope} value={isotope}>{isotope}</option>
              ))}
            </select>
            
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox"
                checked={filterFromProcurement === true}
                onChange={(e) => setFilterFromProcurement(e.target.checked ? true : undefined)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-600"
              />
              <span className="text-sm">From Procurement</span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading shipments...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredShipments.length === 0 && (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No shipments found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or create a new shipment</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && filteredShipments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <DesktopOnly>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Shipment #</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Isotope</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Batch #</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Carrier</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ETA</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Procurement</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr 
                      key={shipment.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleShipmentClick(shipment)}
                          className="text-xs sm:text-sm font-mono text-purple-600 hover:text-purple-700 hover:underline"
                        >
                          {shipment.shipment_number}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{shipment.isotope}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-mono">{shipment.batch_number}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[100px]">{shipment.origin.split(',')[0]}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[100px]">{shipment.destination.split(',')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{shipment.carrier}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${shipment.status_color}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        {formatShipmentETA(shipment.eta)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        {shipment.procurement_request_id ? (
                          <span className="font-mono text-xs text-purple-600">{shipment.procurement_request_id}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleShipmentClick(shipment)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DesktopOnly>

          {/* Mobile Card View */}
          <MobileOnly>
            <div className="p-4 space-y-3">
              {filteredShipments.map((shipment) => (
                <MobileTableCard 
                  key={shipment.id}
                  onClick={() => handleShipmentClick(shipment)}
                >
                  <MobileTableCardRow 
                    label="Shipment #" 
                    value={<span className="font-mono text-xs text-purple-600">{shipment.shipment_number}</span>} 
                  />
                  <MobileTableCardRow 
                    label="Isotope" 
                    value={shipment.isotope} 
                  />
                  <MobileTableCardRow 
                    label="Batch" 
                    value={<span className="font-mono text-xs">{shipment.batch_number}</span>} 
                  />
                  <MobileTableCardRow 
                    label="Route" 
                    value={
                      <div className="flex items-center gap-1 text-xs">
                        <span className="truncate">{shipment.origin.split(',')[0]}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{shipment.destination.split(',')[0]}</span>
                      </div>
                    } 
                  />
                  <MobileTableCardRow 
                    label="Carrier" 
                    value={shipment.carrier} 
                  />
                  <MobileTableCardRow 
                    label="Status" 
                    value={
                      <span className={`px-2 py-1 rounded-full text-xs ${shipment.status_color}`}>
                        {shipment.status}
                      </span>
                    } 
                  />
                  <MobileTableCardRow 
                    label="ETA" 
                    value={formatShipmentETA(shipment.eta)} 
                  />
                  <MobileTableCardRow 
                    label="Procurement" 
                    value={
                      shipment.procurement_request_id ? (
                        <span className="font-mono text-xs text-purple-600">{shipment.procurement_request_id}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )
                    } 
                  />
                </MobileTableCard>
              ))}
            </div>
          </MobileOnly>
        </div>
      )}

      {/* Create Shipment Dialog */}
      <CreateShipmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleShipmentCreated}
      />
    </div>
  );
}
