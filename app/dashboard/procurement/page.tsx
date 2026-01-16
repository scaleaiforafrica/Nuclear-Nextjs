'use client';

import { Plus, Filter, Eye, Edit, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MobileOnly, DesktopOnly, MobileTableCard, MobileTableCardRow } from '@/components/responsive';

export default function ProcurementPage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get('view');
  const [view, setView] = useState<'list' | 'form' | 'quotes'>('list');
  const [formStep, setFormStep] = useState(1);

  // Handle URL parameter on mount
  useEffect(() => {
    if (viewParam === 'form') {
      setView('form');
    }
  }, [viewParam]);

  const procurementRequests = [
    { 
      id: 'PR-2847', 
      isotope: 'Tc-99m', 
      quantity: '500 mCi', 
      deliveryDate: '2026-01-10', 
      status: 'Quotes Received',
      matchedManufacturers: 3,
      statusColor: 'bg-blue-100 text-blue-700'
    },
    { 
      id: 'PR-2846', 
      isotope: 'F-18 FDG', 
      quantity: '250 mCi', 
      deliveryDate: '2026-01-08', 
      status: 'PO Approved',
      matchedManufacturers: 2,
      statusColor: 'bg-green-100 text-green-700'
    },
    { 
      id: 'PR-2845', 
      isotope: 'I-131', 
      quantity: '100 mCi', 
      deliveryDate: '2026-01-12', 
      status: 'Pending Quotes',
      matchedManufacturers: 4,
      statusColor: 'bg-amber-100 text-amber-700'
    },
    { 
      id: 'PR-2844', 
      isotope: 'Lu-177', 
      quantity: '50 mCi', 
      deliveryDate: '2026-01-15', 
      status: 'Draft',
      matchedManufacturers: 0,
      statusColor: 'bg-gray-100 text-gray-700'
    },
  ];

  const quotes = [
    {
      manufacturer: 'NucMed Solutions',
      rating: 4.8,
      price: { product: 4500, shipping: 350, insurance: 150 },
      deliveryTime: '24 hours',
      activityAtArrival: '95%',
      isBestValue: true
    },
    {
      manufacturer: 'RadioPharma Inc',
      rating: 4.6,
      price: { product: 4200, shipping: 450, insurance: 200 },
      deliveryTime: '36 hours',
      activityAtArrival: '92%',
      isBestValue: false
    },
    {
      manufacturer: 'Isotope Global',
      rating: 4.9,
      price: { product: 4800, shipping: 300, insurance: 125 },
      deliveryTime: '18 hours',
      activityAtArrival: '97%',
      isBestValue: false
    },
  ];


  if (view === 'quotes') {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl mb-1">Quote Comparison</h2>
            <p className="text-sm sm:text-base text-gray-600">Request #PR-2847 - Tc-99m</p>
          </div>
          <button 
            onClick={() => setView('list')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {quotes.map((quote, index) => {
            const total = quote.price.product + quote.price.shipping + quote.price.insurance;
            return (
              <div 
                key={index}
                className={`bg-white rounded-xl p-6 border-2 ${
                  quote.isBestValue ? 'border-purple-600' : 'border-gray-200'
                } hover:shadow-lg transition-shadow relative`}
              >
                {quote.isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-xs rounded-full">
                    Best Value
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg mb-2">{quote.manufacturer}</h3>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(quote.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </div>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">{quote.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product</span>
                    <span>${quote.price.product.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>${quote.price.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Insurance</span>
                    <span>${quote.price.insurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-lg">${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Time</span>
                    <span>{quote.deliveryTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Activity at Arrival</span>
                    <span className="text-green-600">{quote.activityAtArrival}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-4 h-4 flex items-center justify-center">✓</div>
                    <span>All compliance checks passed</span>
                  </div>
                </div>

                <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Select & Create PO
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }


  if (view === 'form') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl">New Procurement Request</h2>
          <button 
            onClick={() => setView('list')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start"
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
                <label className="block text-sm mb-2">Isotope Type</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent appearance-none">
                    <option>Select isotope...</option>
                    <option>Tc-99m (Half-life: 6 hours)</option>
                    <option>F-18 FDG (Half-life: 110 minutes)</option>
                    <option>I-131 (Half-life: 8 days)</option>
                    <option>Lu-177 (Half-life: 6.7 days)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Activity Required</label>
                  <input 
                    type="number" 
                    placeholder="500" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Unit</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                    <option>mCi</option>
                    <option>GBq</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Clinical Indication (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Enter clinical indication..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm mb-2">Attach Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-600 transition-colors cursor-pointer">
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PDF, DOC (max. 10MB)</p>
                </div>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Delivery Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Preferred Time Window</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Morning', 'Afternoon', 'Evening'].map((time) => (
                    <button 
                      key={time}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Delivery Location</label>
                <input 
                  type="text" 
                  defaultValue="City Hospital, 123 Medical Ave, Cape Town"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Special Instructions</label>
                <textarea 
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
                <h3 className="text-lg mb-4">Request Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Isotope</span>
                    <span>Tc-99m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activity Required</span>
                    <span>500 mCi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date</span>
                    <span>January 10, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Window</span>
                    <span>Morning</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span>City Hospital, Cape Town</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm mb-2">Expected Activity at Delivery</h4>
                <p className="text-2xl text-blue-600">475 mCi (95%)</p>
                <p className="text-sm text-gray-600 mt-1">Based on 24-hour estimated transit time</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {formStep > 1 && (
              <button 
                onClick={() => setFormStep(formStep - 1)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Back
              </button>
            )}
            <button 
              onClick={() => {
                if (formStep < 3) {
                  setFormStep(formStep + 1);
                } else {
                  setView('list');
                }
              }}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors order-1 sm:order-2"
            >
              {formStep === 3 ? 'Submit Request' : 'Continue'}
            </button>
            {formStep === 3 && (
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-3">
                Save as Draft
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl">Procurement Requests</h2>
        <button 
          onClick={() => setView('form')}
          className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 self-start"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          New Request
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mb-6 border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
            <option>All Statuses</option>
            <option>Draft</option>
            <option>Pending Quotes</option>
            <option>Quotes Received</option>
            <option>PO Approved</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
            <option>All Isotopes</option>
            <option>Tc-99m</option>
            <option>F-18 FDG</option>
            <option>I-131</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <DesktopOnly>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Isotope</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Delivery Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Manufacturers</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {procurementRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-mono">{request.id}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{request.isotope}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{request.quantity}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    {new Date(request.deliveryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${request.statusColor}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{request.matchedManufacturers}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => request.status === 'Quotes Received' && setView('quotes')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
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
            {procurementRequests.map((request) => (
              <MobileTableCard key={request.id}>
                <MobileTableCardRow 
                  label="ID" 
                  value={<span className="font-mono text-xs">{request.id}</span>} 
                />
                <MobileTableCardRow 
                  label="Isotope" 
                  value={request.isotope} 
                />
                <MobileTableCardRow 
                  label="Quantity" 
                  value={request.quantity} 
                />
                <MobileTableCardRow 
                  label="Delivery" 
                  value={new Date(request.deliveryDate).toLocaleDateString()} 
                />
                <MobileTableCardRow 
                  label="Status" 
                  value={
                    <span className={`px-2 py-1 rounded-full text-xs ${request.statusColor}`}>
                      {request.status}
                    </span>
                  } 
                />
                <MobileTableCardRow 
                  label="Manufacturers" 
                  value={request.matchedManufacturers} 
                />
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => request.status === 'Quotes Received' && setView('quotes')}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center min-h-[44px]"
                    aria-label="Delete request"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </MobileTableCard>
            ))}
          </div>
        </MobileOnly>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">Showing 1-4 of 4</div>
          <div className="flex items-center gap-2">
            <button type="button" className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm min-h-[44px]">Previous</button>
            <button type="button" className="px-3 py-1 bg-purple-600 text-white rounded text-sm min-h-[44px]">1</button>
            <button type="button" className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm min-h-[44px]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
