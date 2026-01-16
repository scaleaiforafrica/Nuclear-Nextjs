'use client';

import { useState } from 'react';
import { MapPin, ArrowRight, Clock, Package, AlertCircle } from 'lucide-react';
import type { RouteWaypoint } from '@/models/shipment.model';
import { RouteDisplayMap } from './RouteDisplayMap';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ShipmentRouteCardProps {
  origin: string;
  destination: string;
  waypoints?: RouteWaypoint[];
  eta?: string;
  estimatedDeliveryTime?: string;
  currentActivity?: number;
  initialActivity?: number;
  expectedActivityAtArrival?: number;
  isotope?: string;
  className?: string;
}

/**
 * ShipmentRouteCard Component
 * Displays a summary of the shipment route with waypoints and key information
 */
export function ShipmentRouteCard({
  origin,
  destination,
  waypoints = [],
  eta,
  estimatedDeliveryTime,
  currentActivity,
  initialActivity,
  expectedActivityAtArrival,
  isotope,
  className = '',
}: ShipmentRouteCardProps) {
  const [showMapDialog, setShowMapDialog] = useState(false);

  // Calculate progress based on waypoint status
  const totalWaypoints = waypoints.length;
  const completedWaypoints = waypoints.filter((w) => w.status === 'completed').length;
  const progressPercentage = totalWaypoints > 0 ? (completedWaypoints / totalWaypoints) * 100 : 0;

  // Get current waypoint
  const currentWaypoint =
    waypoints.find((w) => w.status === 'current') || waypoints.find((w) => w.status === 'upcoming');

  // Format ETA
  const formatETA = (etaStr?: string) => {
    if (!etaStr) return 'N/A';
    const etaDate = new Date(etaStr);
    const now = new Date();
    const hoursUntil = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 0) {
      return 'Overdue';
    } else if (hoursUntil < 1) {
      const minutes = Math.round(hoursUntil * 60);
      return `${minutes} minutes`;
    } else if (hoursUntil < 24) {
      return `${Math.round(hoursUntil)} hours`;
    } else {
      const days = Math.round(hoursUntil / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  // Get status badge for waypoint
  const getWaypointStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      case 'upcoming':
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Shipment Route</h3>
            {waypoints.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMapDialog(true)}
                className="text-xs"
              >
                View Map
              </Button>
            )}
          </div>

          {/* Origin to Destination */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="font-medium truncate">{origin.split(',')[0]}</span>
            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="font-medium truncate">{destination.split(',')[0]}</span>
          </div>

          {/* Progress Bar */}
          {totalWaypoints > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Waypoints List */}
        {waypoints.length > 0 ? (
          <div className="p-4 space-y-3">
            {waypoints.map((waypoint, index) => (
              <div key={`${waypoint.name}-${index}`} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getWaypointStatusBadge(waypoint.status)}`}></div>
                  {index < waypoints.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{waypoint.name}</p>
                  {waypoint.timestamp && (
                    <p className="text-xs text-gray-500">
                      {new Date(waypoint.timestamp).toLocaleDateString()} at{' '}
                      {new Date(waypoint.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {waypoint.status === 'current' && (
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Current Location
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No waypoint information available</p>
          </div>
        )}

        {/* Footer - ETA and Activity Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
          {/* ETA */}
          {eta && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">ETA:</span>
              <span className="font-medium text-gray-900">{formatETA(eta)}</span>
            </div>
          )}

          {/* Estimated Delivery Time */}
          {estimatedDeliveryTime && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Delivery Time:</span>
              <span className="font-medium text-gray-900">{estimatedDeliveryTime}</span>
            </div>
          )}

          {/* Activity Information */}
          {initialActivity && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Activity Level</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">Initial</div>
                  <div className="font-medium">{initialActivity.toFixed(1)}</div>
                </div>
                {currentActivity !== undefined && (
                  <div>
                    <div className="text-gray-500">Current</div>
                    <div className="font-medium text-blue-600">{currentActivity.toFixed(1)}</div>
                  </div>
                )}
                {expectedActivityAtArrival !== undefined && (
                  <div>
                    <div className="text-gray-500">Expected</div>
                    <div className="font-medium text-green-600">{expectedActivityAtArrival.toFixed(1)}</div>
                  </div>
                )}
              </div>
              {isotope && <div className="text-xs text-gray-500 mt-1">Isotope: {isotope}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Shipment Route Map</DialogTitle>
            <DialogDescription>
              Route from {origin} to {destination}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <RouteDisplayMap waypoints={waypoints} height="500px" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
