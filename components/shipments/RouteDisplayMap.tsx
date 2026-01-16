'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteWaypoint } from '@/models/shipment.model';

// Fix for default marker icons in Next.js
// Type assertion for leaflet icon prototype
if (typeof window !== 'undefined') {
  const IconDefault = L.Icon.Default.prototype as unknown as { _getIconUrl?: string };
  delete IconDefault._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-3 h-3 rounded-full bg-white"></div>
        </div>
        <div class="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-300"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const completedIcon = createCustomIcon('bg-green-500');
const currentIcon = createCustomIcon('bg-blue-500');
const upcomingIcon = createCustomIcon('bg-gray-400');

interface BoundsUpdaterProps {
  waypoints: RouteWaypoint[];
}

// Component to update map bounds
function BoundsUpdater({ waypoints }: BoundsUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (waypoints.length === 0) return;

    const coordinates = waypoints.map((w) => w.coordinates);
    if (coordinates.length === 1) {
      // Single point, center on it
      map.setView([coordinates[0][0], coordinates[0][1]], 10);
    } else {
      // Multiple points, fit bounds
      const bounds = L.latLngBounds(coordinates.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [waypoints, map]);

  return null;
}

interface RouteDisplayMapProps {
  waypoints: RouteWaypoint[];
  className?: string;
  height?: string;
}

/**
 * RouteDisplayMap Component
 * Displays shipment route on a static map using Leaflet
 * Shows waypoints with status-based colors and route line
 */
export function RouteDisplayMap({ waypoints, className = '', height = '400px' }: RouteDisplayMapProps) {
  // Filter out waypoints without coordinates
  const validWaypoints = useMemo(
    () => waypoints.filter((w) => w.coordinates && w.coordinates.length === 2),
    [waypoints]
  );

  // Calculate center point
  const center = useMemo(() => {
    if (validWaypoints.length === 0) {
      return [-1.2921, 36.8219] as [number, number]; // Default to Nairobi
    }
    
    // Calculate average of all coordinates
    const sumLat = validWaypoints.reduce((sum, w) => sum + w.coordinates[0], 0);
    const sumLng = validWaypoints.reduce((sum, w) => sum + w.coordinates[1], 0);
    return [sumLat / validWaypoints.length, sumLng / validWaypoints.length] as [number, number];
  }, [validWaypoints]);

  // Polyline coordinates
  const polylinePositions = useMemo(
    () => validWaypoints.map((w) => w.coordinates as [number, number]),
    [validWaypoints]
  );

  // Get icon based on waypoint status
  const getWaypointIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return completedIcon;
      case 'current':
        return currentIcon;
      case 'upcoming':
      default:
        return upcomingIcon;
    }
  };

  // Get status badge color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'current':
        return 'bg-blue-100 text-blue-700';
      case 'upcoming':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (validWaypoints.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="text-gray-400 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No route data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 5',
            }}
          />
        )}

        {/* Waypoint markers */}
        {validWaypoints.map((waypoint, index) => (
          <Marker
            key={`${waypoint.name}-${index}`}
            position={waypoint.coordinates as [number, number]}
            icon={getWaypointIcon(waypoint.status)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{waypoint.name}</h3>
                {waypoint.status && (
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(waypoint.status)} mb-2`}>
                    {waypoint.status.charAt(0).toUpperCase() + waypoint.status.slice(1)}
                  </span>
                )}
                {waypoint.timestamp && (
                  <p className="text-xs text-gray-600">
                    {new Date(waypoint.timestamp).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {waypoint.coordinates[0].toFixed(4)}°, {waypoint.coordinates[1].toFixed(4)}°
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        <BoundsUpdater waypoints={validWaypoints} />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs z-[1000]">
        <h4 className="font-semibold mb-2">Waypoint Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
