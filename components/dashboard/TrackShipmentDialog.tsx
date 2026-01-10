'use client';

import { useState } from 'react';
import { Search, MapPin, Package, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TrackShipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShipmentResult {
  id: string;
  isotope: string;
  status: string;
  origin: string;
  destination: string;
  eta: string;
  statusColor: string;
}

export function TrackShipmentDialog({ isOpen, onClose }: TrackShipmentDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ShipmentResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Mock shipments data - in real app, this would come from API
  const mockShipments: ShipmentResult[] = [
    {
      id: 'SH-2851',
      isotope: 'Tc-99m',
      status: 'In Transit',
      origin: 'Johannesburg',
      destination: 'Cape Town',
      eta: '2 hours',
      statusColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'SH-2850',
      isotope: 'F-18 FDG',
      status: 'At Customs',
      origin: 'Nairobi',
      destination: 'Mombasa',
      eta: '4 hours',
      statusColor: 'bg-amber-100 text-amber-700'
    },
    {
      id: 'SH-2849',
      isotope: 'I-131',
      status: 'In Transit',
      origin: 'Lagos',
      destination: 'Accra',
      eta: '6 hours',
      statusColor: 'bg-blue-100 text-blue-700'
    }
  ];

  const handleSearch = () => {
    setIsSearching(true);
    setNotFound(false);
    
    // Simulate API call
    setTimeout(() => {
      const result = mockShipments.find(
        s => s.id.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (result) {
        setSearchResult(result);
        setNotFound(false);
      } else {
        setSearchResult(null);
        setNotFound(true);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResult(null);
    setNotFound(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Track Shipment</DialogTitle>
          <DialogDescription>
            Enter a shipment ID to view its current status and location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter shipment ID (e.g., SH-2851)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery || isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold font-mono">{searchResult.id}</h3>
                  <p className="text-sm text-gray-500">{searchResult.isotope}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${searchResult.statusColor}`}>
                  {searchResult.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-gray-600">Route: </span>
                    <span className="font-medium">{searchResult.origin} → {searchResult.destination}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-gray-600">ETA: </span>
                    <span className="font-medium">{searchResult.eta}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <a 
                  href={`/dashboard/shipments?id=${searchResult.id}`}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View Full Shipment Details →
                </a>
              </div>
            </div>
          )}

          {/* Not Found Message */}
          {notFound && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-center">
              <Package className="w-12 h-12 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-900">
                No shipment found with ID "{searchQuery}"
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Please check the ID and try again
              </p>
            </div>
          )}

          {/* Quick Links */}
          {!searchResult && !notFound && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 mb-2">Quick access:</p>
              <div className="space-y-2">
                {mockShipments.slice(0, 3).map((shipment) => (
                  <button
                    key={shipment.id}
                    onClick={() => {
                      setSearchQuery(shipment.id);
                      setTimeout(() => handleSearch(), 100);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-purple-600">{shipment.id}</span>
                      <span className="text-gray-500">{shipment.isotope}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
