'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

interface Shipment {
  id: string;
  lat: number;
  lng: number;
  status: 'active' | 'warning' | 'success';
  isotope: string;
}

export function LiveTrackingMap() {
  const [shipments, setShipments] = useState<Shipment[]>([
    { id: 'SH-2851', lat: -33.9249, lng: 18.4241, status: 'active', isotope: 'Tc-99m' },
    { id: 'SH-2850', lat: -26.2041, lng: 28.0473, status: 'warning', isotope: 'F-18 FDG' },
    { id: 'SH-2849', lat: -25.7479, lng: 28.2293, status: 'active', isotope: 'I-131' },
    { id: 'SH-2848', lat: -29.8587, lng: 31.0218, status: 'success', isotope: 'Lu-177' },
  ]);

  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setShipments(prev => prev.map(s => ({
        ...s,
        lat: s.lat + (Math.random() - 0.5) * 0.1,
        lng: s.lng + (Math.random() - 0.5) * 0.1,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600';
      case 'warning':
        return 'text-amber-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Africa Outline */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg viewBox="0 0 800 800" className="w-full h-full max-w-2xl">
          <path
            d="M 400,100 L 500,150 L 550,250 L 570,350 L 550,450 L 500,550 L 420,600 L 350,580 L 300,500 L 280,400 L 300,300 L 350,200 L 380,150 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-purple-300"
          />
        </svg>
      </div>

      {/* Shipment Markers */}
      <div className="relative w-full h-full">
        {shipments.map((shipment, index) => (
          <div
            key={shipment.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
            style={{
              top: `${30 + index * 15}%`,
              left: `${35 + index * 10}%`,
            }}
            onMouseEnter={() => setSelectedShipment(shipment.id)}
            onMouseLeave={() => setSelectedShipment(null)}
          >
            <div className="relative">
              {/* Ping Animation */}
              <div className={`absolute inset-0 ${getStatusColor(shipment.status)} opacity-75 rounded-full animate-ping`}></div>
              
              {/* Marker Icon */}
              <MapPin
                className={`relative w-8 h-8 ${getStatusColor(shipment.status)} drop-shadow-lg`}
                fill="currentColor"
              />

              {/* Tooltip */}
              {selectedShipment === shipment.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-3 whitespace-nowrap z-10 border border-gray-200">
                  <div className="text-xs font-mono text-purple-600 mb-1">{shipment.id}</div>
                  <div className="text-sm font-medium">{shipment.isotope}</div>
                  <div className="text-xs text-gray-500 capitalize">{shipment.status}</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs font-medium mb-2 text-gray-700">Live Tracking</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600">In Transit</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
            <span className="text-gray-600">At Customs</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-600">Dispatched</span>
          </div>
        </div>
      </div>

      {/* Real-time Indicator */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-700">Live</span>
        </div>
      </div>
    </div>
  );
}
