'use client';

import { Plus, Filter, Eye, Edit, X, ChevronDown, Search, Loader2, AlertCircle, MapPin, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileOnly, DesktopOnly, MobileTableCard, MobileTableCardRow } from '@/components/responsive';
import { RouteDisplay, ProcurementShipmentLink } from '@/components/procurement';
import { toast } from 'sonner';
import type { ProcurementRequest, ProcurementQuote, Supplier, ProcurementStatus, ActivityUnit, DeliveryTimeWindow } from '@/models/procurement.model';
import { getProcurementStatusColor, canViewQuotes, canEditRequest, canCancelRequest, formatShippingRoute } from '@/models/procurement.model';

export default function ProcurementPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'form' | 'quotes'>('list');
  const [formStep, setFormStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data state
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [quotes, setQuotes] = useState<ProcurementQuote[]>([]);
  const [editingRequest, setEditingRequest] = useState<ProcurementRequest | null>(null);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<ProcurementStatus | ''>('');
  const [filterIsotope, setFilterIsotope] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    isotope: '',
    quantity: '',
    unit: 'mCi' as ActivityUnit,
    delivery_date: '',
    delivery_time_window: '' as DeliveryTimeWindow | '',
    delivery_location: '',
    clinical_indication: '',
    special_instructions: '',
  });

  // Fetch procurement requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterIsotope) params.append('isotope', filterIsotope);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/procurement?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch procurement requests');
      }
    } catch (error) {
      toast.error('Failed to fetch procurement requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  // Fetch quotes for a request
  const fetchQuotes = async (requestId: string) => {
    try {
      setQuotesLoading(true);
      const response = await fetch(`/api/procurement/${requestId}/quotes`);
      const data = await response.json();
      
      if (data.success) {
        setQuotes(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch quotes');
      }
    } catch (error) {
      toast.error('Failed to fetch quotes');
      console.error(error);
    } finally {
      setQuotesLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRequests();
    fetchSuppliers();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterIsotope, searchQuery]);

  // Create new request
  const handleCreateRequest = async () => {
    try {
      setSubmitting(true);
      
      // Validate form
      if (!formData.isotope || !formData.quantity || !formData.delivery_date || !formData.delivery_location) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await fetch('/api/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          delivery_time_window: formData.delivery_time_window || undefined,
          status: 'Draft',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Procurement request created successfully');
        setView('list');
        setFormStep(1);
        setFormData({
          isotope: '',
          quantity: '',
          unit: 'mCi',
          delivery_date: '',
          delivery_time_window: '',
          delivery_location: '',
          clinical_indication: '',
          special_instructions: '',
        });
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to create request');
      }
    } catch (error) {
      toast.error('Failed to create request');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update request
  const handleUpdateRequest = async () => {
    if (!editingRequest) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/procurement/${editingRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          delivery_time_window: formData.delivery_time_window || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Procurement request updated successfully');
        setView('list');
        setFormStep(1);
        setEditingRequest(null);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to update request');
      }
    } catch (error) {
      toast.error('Failed to update request');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete/cancel request
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this procurement request?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/procurement/${requestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Procurement request cancelled successfully');
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to cancel request');
      }
    } catch (error) {
      toast.error('Failed to cancel request');
      console.error(error);
    }
  };

  // View quotes
  const handleViewQuotes = async (request: ProcurementRequest) => {
    setSelectedRequest(request);
    await fetchQuotes(request.id);
    setView('quotes');
  };

  // Edit request
  const handleEditRequest = (request: ProcurementRequest) => {
    setEditingRequest(request);
    setFormData({
      isotope: request.isotope,
      quantity: request.quantity.toString(),
      unit: request.unit,
      delivery_date: request.delivery_date,
      delivery_time_window: request.delivery_time_window || '',
      delivery_location: request.delivery_location,
      clinical_indication: request.clinical_indication || '',
      special_instructions: request.special_instructions || '',
    });
    setView('form');
  };

  // Select supplier and create PO
  const handleSelectSupplier = async (quote: ProcurementQuote) => {
    if (!selectedRequest) return;
    
    if (!confirm(`Select ${quote.supplier?.name} as the supplier?\n\nThis will set the status to "PO Approved" and create a purchase order.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/procurement/${selectedRequest.id}/select-supplier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: quote.supplier_id,
          quote_id: quote.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const updatedRequest = data.data as ProcurementRequest;
        toast.success(data.message || 'Supplier selected successfully', {
          description: updatedRequest.origin && updatedRequest.destination 
            ? `Route: ${formatShippingRoute(updatedRequest.origin, updatedRequest.destination)}`
            : undefined,
        });
        setView('list');
        setSelectedRequest(null);
        setQuotes([]);
        fetchRequests();
      } else {
        toast.error(data.message || 'Failed to select supplier');
      }
    } catch (error) {
      toast.error('Failed to select supplier');
      console.error(error);
    }
  };

  // Get unique isotopes for filter
  const uniqueIsotopes = Array.from(new Set(requests.map(r => r.isotope))).sort();

  // Count quotes for a request
  const getQuotesCount = (request: ProcurementRequest) => {
    return request.quotes?.length || 0;
  };

  // Quotes view
  if (view === 'quotes') {
    if (!selectedRequest) {
      return null;
    }

    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl mb-1">Quote Comparison</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Request #{selectedRequest.request_number}
            </p>
          </div>
          <button 
            onClick={() => {
              setView('list');
              setSelectedRequest(null);
              setQuotes([]);
            }}
            className="px-4 py-2 min-h-[44px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start"
          >
            Back to List
          </button>
        </div>

        {/* Request Summary - FIRST */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Request Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Request ID</span>
              <span className="font-mono text-sm">{selectedRequest.request_number}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Isotope</span>
              <span className="text-sm font-medium">{selectedRequest.isotope}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Quantity</span>
              <span className="text-sm font-medium">{selectedRequest.quantity} {selectedRequest.unit}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Delivery Date</span>
              <span className="text-sm font-medium">
                {new Date(selectedRequest.delivery_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Location</span>
              <span className="text-sm font-medium">{selectedRequest.delivery_location}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Status</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getProcurementStatusColor(selectedRequest.status)}`}>
                {selectedRequest.status}
              </span>
            </div>
            {selectedRequest.origin && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Origin</span>
                <span className="text-sm font-medium">{selectedRequest.origin}</span>
              </div>
            )}
            {selectedRequest.destination && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Destination</span>
                <span className="text-sm font-medium">{selectedRequest.destination}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quotes Loading State */}
        {quotesLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* No Quotes */}
        {!quotesLoading && quotes.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quotes Available</h3>
            <p className="text-gray-600">No supplier quotes have been received for this request yet.</p>
          </div>
        )}

        {/* Quote Comparison Cards */}
        {!quotesLoading && quotes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {quotes.map((quote) => (
              <div 
                key={quote.id}
                className={`bg-white rounded-xl p-6 border-2 ${
                  quote.is_best_value ? 'border-purple-600' : 'border-gray-200'
                } hover:shadow-lg transition-shadow relative`}
              >
                {quote.is_best_value && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-xs rounded-full whitespace-nowrap">
                    Best Value
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg mb-2">{quote.supplier?.name || 'Unknown Supplier'}</h3>
                  {quote.supplier && (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(quote.supplier!.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </div>
                        ))}
                        <span className="text-sm text-gray-600 ml-1">{quote.supplier!.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{quote.supplier!.location}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Route Visualization */}
                {quote.supplier && selectedRequest.destination && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {quote.supplier.location.split(',')[0]?.trim() || quote.supplier.location}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {selectedRequest.destination.split(',')[0]?.trim() || selectedRequest.destination}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product</span>
                    <span>${quote.product_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>${quote.shipping_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Insurance</span>
                    <span>${quote.insurance_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                    <span>Total</span>
                    <span className="text-lg">${quote.total_cost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Time</span>
                    <span className="font-medium">{quote.delivery_time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Activity at Arrival</span>
                    <span className="text-green-600 font-medium">{quote.activity_at_arrival}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {quote.compliance_passed ? (
                      <>
                        <div className="w-4 h-4 flex items-center justify-center text-green-600">✓</div>
                        <span className="text-green-600">Compliance passed</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 flex items-center justify-center text-red-600">✗</div>
                        <span className="text-red-600">Compliance failed</span>
                      </>
                    )}
                  </div>
                  {quote.quote_valid_until && (
                    <div className="text-xs text-gray-500">
                      Valid until: {new Date(quote.quote_valid_until).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <button 
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSelectSupplier(quote)}
                  disabled={selectedRequest.status === 'PO Approved' || selectedRequest.status === 'Completed'}
                  title={selectedRequest.status === 'PO Approved' ? 'Supplier already selected' : 'Select this supplier and create purchase order'}
                >
                  {selectedRequest.status === 'PO Approved' ? 'Supplier Selected' : 'Select & Create PO'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  // Form view
  if (view === 'form') {
    const isEditing = editingRequest !== null;
    
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl">
            {isEditing ? 'Edit Procurement Request' : 'New Procurement Request'}
          </h2>
          <button 
            onClick={() => {
              setView('list');
              setFormStep(1);
              setEditingRequest(null);
              setFormData({
                isotope: '',
                quantity: '',
                unit: 'mCi',
                delivery_date: '',
                delivery_time_window: '',
                delivery_location: '',
                clinical_indication: '',
                special_instructions: '',
              });
            }}
            className="px-4 py-2 min-h-[44px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start"
          >
            Cancel
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {[
            { num: 1, label: 'Isotope Details' },
            { num: 2, label: 'Delivery' },
            { num: 3, label: 'Review' }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center flex-1 min-w-[120px]">
              <div className="flex items-center">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
                    formStep >= step.num 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.num}
                </div>
                <span className={`ml-2 sm:ml-3 text-xs sm:text-sm whitespace-nowrap ${formStep >= step.num ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${formStep > step.num ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-200">
          {formStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Isotope Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.isotope}
                    onChange={(e) => setFormData({ ...formData, isotope: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent appearance-none"
                  >
                    <option value="">Select isotope...</option>
                    <option value="Tc-99m">Tc-99m (Half-life: 6 hours)</option>
                    <option value="F-18 FDG">F-18 FDG (Half-life: 110 minutes)</option>
                    <option value="I-131">I-131 (Half-life: 8 days)</option>
                    <option value="Lu-177">Lu-177 (Half-life: 6.7 days)</option>
                    <option value="Ga-68">Ga-68 (Half-life: 68 minutes)</option>
                    <option value="Y-90">Y-90 (Half-life: 64 hours)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Activity Required <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="500" 
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as ActivityUnit })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="mCi">mCi</option>
                    <option value="GBq">GBq</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Clinical Indication (Optional)</label>
                <textarea 
                  value={formData.clinical_indication}
                  onChange={(e) => setFormData({ ...formData, clinical_indication: e.target.value })}
                  rows={3}
                  placeholder="Enter clinical indication..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Time Window</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Morning', 'Afternoon', 'Evening'] as DeliveryTimeWindow[]).map((time) => (
                    <button 
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, delivery_time_window: time })}
                      className={`px-4 py-3 min-h-[44px] border rounded-lg transition-colors ${
                        formData.delivery_time_window === time
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-300 hover:border-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Location <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.delivery_location}
                  onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
                  placeholder="e.g., City Hospital, 123 Medical Ave, Cape Town"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>This will be set as the destination for delivery</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Special Instructions</label>
                <textarea 
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  rows={3}
                  placeholder="Enter any special handling or delivery instructions..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Request Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Isotope</span>
                    <span className="font-medium">{formData.isotope || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activity Required</span>
                    <span className="font-medium">{formData.quantity} {formData.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date</span>
                    <span className="font-medium">
                      {formData.delivery_date 
                        ? new Date(formData.delivery_date).toLocaleDateString()
                        : 'Not specified'}
                    </span>
                  </div>
                  {formData.delivery_time_window && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Window</span>
                      <span className="font-medium">{formData.delivery_time_window}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium text-right">{formData.delivery_location || 'Not specified'}</span>
                  </div>
                  {formData.clinical_indication && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clinical Indication</span>
                      <span className="font-medium text-right">{formData.clinical_indication}</span>
                    </div>
                  )}
                  {formData.special_instructions && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Special Instructions</span>
                      <span className="font-medium text-right">{formData.special_instructions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Origin/Destination Section */}
              {formData.delivery_location && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm text-blue-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Route
                  </h4>
                  <div className="text-sm mb-1">
                    <span className="text-gray-600">Origin:</span>{' '}
                    <span className="font-medium text-gray-500 italic">Will be set when supplier is selected</span>
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <span className="text-gray-600">To:</span>{' '}
                    <span className="font-medium">{formData.delivery_location}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {formStep > 1 && (
              <button 
                onClick={() => setFormStep(formStep - 1)}
                disabled={submitting}
                className="px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            <button 
              onClick={() => {
                if (formStep < 3) {
                  setFormStep(formStep + 1);
                } else {
                  if (isEditing) {
                    handleUpdateRequest();
                  } else {
                    handleCreateRequest();
                  }
                }
              }}
              disabled={submitting}
              className="flex-1 bg-purple-600 text-white py-3 min-h-[44px] rounded-lg hover:bg-purple-700 transition-colors order-1 sm:order-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                formStep === 3 ? (isEditing ? 'Update Request' : 'Submit Request') : 'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  // List view
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl">Procurement Requests</h2>
        <button 
          onClick={() => {
            setView('form');
            setEditingRequest(null);
            setFormStep(1);
          }}
          className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 min-h-[44px] rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 self-start"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          New Request
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mb-6 border border-gray-200">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by request number, isotope, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          
          {/* Filter dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ProcurementStatus | '')}
              className="flex-1 px-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Quotes">Pending Quotes</option>
              <option value="Quotes Received">Quotes Received</option>
              <option value="PO Approved">PO Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <select 
              value={filterIsotope}
              onChange={(e) => setFilterIsotope(e.target.value)}
              className="flex-1 px-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">All Isotopes</option>
              {uniqueIsotopes.map((isotope) => (
                <option key={isotope} value={isotope}>{isotope}</option>
              ))}
            </select>
            
            {(filterStatus || filterIsotope || searchQuery) && (
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterIsotope('');
                  setSearchQuery('');
                }}
                className="px-4 py-2 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Procurement Requests</h3>
          <p className="text-gray-600 mb-4">
            {filterStatus || filterIsotope || searchQuery
              ? 'No requests match your filters. Try adjusting your search criteria.'
              : 'Get started by creating your first procurement request.'}
          </p>
          {!filterStatus && !filterIsotope && !searchQuery && (
            <button
              onClick={() => setView('form')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Request
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && requests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <DesktopOnly>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Isotope</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Delivery Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Quotes</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Shipment</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => {
                    const quotesCount = getQuotesCount(request);
                    const canView = canViewQuotes(request.status);
                    
                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-mono">
                          {request.request_number}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {request.isotope}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {request.quantity} {request.unit}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {new Date(request.delivery_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                          <RouteDisplay origin={request.origin} destination={request.destination} />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${getProcurementStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {canView ? (
                            <button
                              onClick={() => handleViewQuotes(request)}
                              className="text-purple-600 hover:text-purple-700 underline"
                            >
                              {quotesCount} quote{quotesCount !== 1 ? 's' : ''}
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <ProcurementShipmentLink
                            procurementRequestId={request.id}
                            procurementStatus={request.status}
                            onShipmentCreated={fetchRequests}
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            {canView && (
                              <button 
                                onClick={() => handleViewQuotes(request)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Quotes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            {canEditRequest(request.status) && (
                              <button 
                                onClick={() => handleEditRequest(request)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {canCancelRequest(request.status) && (
                              <button 
                                onClick={() => handleDeleteRequest(request.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600" 
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DesktopOnly>

          {/* Mobile Card View */}
          <MobileOnly>
            <div className="p-4 space-y-3">
              {requests.map((request) => {
                const quotesCount = getQuotesCount(request);
                const canView = canViewQuotes(request.status);
                
                return (
                  <MobileTableCard key={request.id}>
                    <MobileTableCardRow 
                      label="ID" 
                      value={<span className="font-mono text-xs">{request.request_number}</span>} 
                    />
                    <MobileTableCardRow 
                      label="Isotope" 
                      value={request.isotope} 
                    />
                    <MobileTableCardRow 
                      label="Quantity" 
                      value={`${request.quantity} ${request.unit}`} 
                    />
                    <MobileTableCardRow 
                      label="Delivery" 
                      value={new Date(request.delivery_date).toLocaleDateString()} 
                    />
                    {(request.origin || request.destination) && (
                      <MobileTableCardRow 
                        label="Route" 
                        value={
                          <RouteDisplay 
                            origin={request.origin} 
                            destination={request.destination || request.delivery_location}
                            className="text-sm"
                          />
                        } 
                      />
                    )}
                    <MobileTableCardRow 
                      label="Status" 
                      value={
                        <span className={`px-2 py-1 rounded-full text-xs ${getProcurementStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      } 
                    />
                    {canView && (
                      <MobileTableCardRow 
                        label="Quotes" 
                        value={
                          <button
                            onClick={() => handleViewQuotes(request)}
                            className="text-purple-600 hover:text-purple-700 underline text-sm"
                          >
                            {quotesCount} quote{quotesCount !== 1 ? 's' : ''}
                          </button>
                        } 
                      />
                    )}
                    <MobileTableCardRow 
                      label="Shipment" 
                      value={
                        <ProcurementShipmentLink
                          procurementRequestId={request.id}
                          procurementStatus={request.status}
                          onShipmentCreated={fetchRequests}
                        />
                      } 
                    />
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      {canView && (
                        <button 
                          type="button"
                          onClick={() => handleViewQuotes(request)}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]"
                        >
                          <Eye className="w-4 h-4" />
                          View Quotes
                        </button>
                      )}
                      {canEditRequest(request.status) && (
                        <button 
                          type="button"
                          onClick={() => handleEditRequest(request)}
                          className={`${canView ? '' : 'flex-1'} px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]`}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      {canCancelRequest(request.status) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(request.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center min-h-[44px]"
                          aria-label="Cancel request"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </MobileTableCard>
                );
              })}
            </div>
          </MobileOnly>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
