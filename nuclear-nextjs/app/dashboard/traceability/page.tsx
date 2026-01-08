'use client';

import { Search, Download, FileText, Clock, MapPin, User, Database } from 'lucide-react';
import { useState } from 'react';

export default function TraceabilityPage() {
  const [selectedShipment, setSelectedShipment] = useState('SH-2851');
  const [isRegulatorView, setIsRegulatorView] = useState(false);

  const auditEvents = [
    {
      type: 'created',
      icon: FileText,
      timestamp: '2026-01-03 07:30:00 UTC',
      actor: 'System',
      location: 'NuclearFlow Platform',
      description: 'Shipment record created',
      hash: '0x4f3a8b2c7d1e9f6a3b5c8d2e7f1a4b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a'
    },
    {
      type: 'dispatched',
      icon: MapPin,
      timestamp: '2026-01-03 08:00:00 SAST',
      actor: 'Warehouse Manager - Sarah Williams',
      location: 'Johannesburg Distribution Center',
      description: 'Package dispatched from facility',
      hash: '0x7d2e4a1f9b6c3e8d5a2f7b4c1e9d6a3f8b5c2e7d4a1f6b9c3e8d5a2f7b4c1e9d'
    },
    {
      type: 'loaded',
      icon: User,
      timestamp: '2026-01-03 08:15:00 SAST',
      actor: 'Driver - James Smith (ID: DR-4829)',
      location: 'Loading Bay 3, Johannesburg',
      description: 'Package loaded onto transport vehicle #VH-2847',
      hash: '0x9b1c6d3e7f4a2b8c5d1e9f6a3b7c4d2e8f5a1b6c9d3e7f4a2b8c5d1e9f6a3b7c'
    },
    {
      type: 'temperature',
      icon: Database,
      timestamp: '2026-01-03 09:30:00 SAST',
      actor: 'IoT Sensor #TS-1847',
      location: 'Vehicle #VH-2847, N1 Highway',
      description: 'Temperature check: 2.4°C - Within safe range',
      hash: '0x2e4f7c8a1b5d9f3e6a2c8d5f1b7e4a9c6d2f8b5e1a7c4d9f6b3e8a5c2d7f4b1e'
    },
    {
      type: 'checkpoint',
      icon: MapPin,
      timestamp: '2026-01-03 09:45:00 SAST',
      actor: 'Driver - James Smith',
      location: 'Worcester Junction Checkpoint',
      description: 'Checkpoint scan completed - Package integrity verified',
      hash: '0x5a6b9d2f8c4e1a7d3b9f6c2e8a5d1f7b4c9e6a3d8f5b2c7e4a1d9f6b3c8e5a2d'
    },
    {
      type: 'customs',
      icon: FileText,
      timestamp: '2026-01-03 10:15:00 SAST',
      actor: 'Customs Officer - Michael Brown',
      location: 'Border Control Station',
      description: 'Customs documentation verified and approved',
      hash: '0x8c5d2f9b6e3a7d4f1b8c5a2e9d6f3a7b4c1e8d5f2a9b6c3e7d4a1f8b5c2e9d6f'
    },
  ];


  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl">Blockchain Traceability</h2>
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
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            <span className="whitespace-nowrap">Export Audit Report</span>
          </button>
        </div>
      </div>

      {isRegulatorView && (
        <div className="bg-blue-900 text-white rounded-xl p-4 sm:p-6 mb-6 border-2 border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <h3 className="text-base sm:text-xl">Regulatory Portal - Read-Only Access</h3>
          </div>
          <p className="text-blue-200 text-xs sm:text-sm">
            This view provides blockchain-verified audit trails and compliance documentation. Pricing and PII are hidden in regulatory mode.
          </p>
        </div>
      )}

      {/* Search Interface */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <h3 className="text-base sm:text-lg mb-4">Search Shipments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Shipment ID or Batch Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={selectedShipment}
                onChange={(e) => setSelectedShipment(e.target.value)}
                placeholder="Search by ID or batch..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700">Date Range</label>
            <input 
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Origin Country</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>All Countries</option>
              <option>South Africa</option>
              <option>Kenya</option>
              <option>Nigeria</option>
              <option>Egypt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700">Isotope Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>All Isotopes</option>
              <option>Tc-99m</option>
              <option>F-18 FDG</option>
              <option>I-131</option>
              <option>Lu-177</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700">Manufacturer</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>All Manufacturers</option>
              <option>NucMed Solutions</option>
              <option>RadioPharma Inc</option>
              <option>Isotope Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipment Info Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div>
            <div className="text-xs sm:text-sm text-purple-100 mb-1">Shipment ID</div>
            <div className="text-lg sm:text-2xl font-mono">{selectedShipment}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-purple-100 mb-1">Isotope</div>
            <div className="text-base sm:text-xl">Tc-99m</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-purple-100 mb-1">Batch Number</div>
            <div className="text-base sm:text-xl font-mono">TC-2026-001</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-purple-100 mb-1">Compliance Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-base sm:text-xl">Verified</span>
            </div>
          </div>
        </div>
      </div>


      {/* Audit Trail Timeline */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl">Immutable Audit Trail</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">All events are recorded on Hyperledger Fabric blockchain</p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative">
            {/* Timeline Line - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Events */}
            <div className="space-y-6 sm:space-y-8">
              {auditEvents.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div key={index} className="relative md:pl-20">
                    {/* Icon */}
                    <div className="md:absolute md:left-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-xl flex items-center justify-center border-4 border-white mb-3 md:mb-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
                    </div>

                    {/* Content */}
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-3 gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base lg:text-lg mb-2">{event.description}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="break-all">{event.timestamp}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{event.location}</span>
                            </span>
                          </div>
                        </div>
                        <div className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs capitalize whitespace-nowrap">
                          {event.type}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1">Actor</div>
                        <div className="text-xs sm:text-sm font-medium break-words">{event.actor}</div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <span className="text-xs text-gray-400">Blockchain Transaction Hash</span>
                          <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors self-start">
                            Verify on Chain →
                          </button>
                        </div>
                        <div className="text-xs text-green-400 font-mono break-all">
                          {event.hash}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Export Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-600">
              <strong>{auditEvents.length}</strong> blockchain-verified events recorded
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-xs sm:text-sm">
                Download JSON
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                <span className="whitespace-nowrap">Generate Signed PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
