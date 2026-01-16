'use client';

import { BlockchainEvent } from '@/models/blockchain.model';
import { formatTimestamp, getEventIcon, getEventColor, formatEventType, truncateHash } from '@/lib/traceability-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, User, Hash, Link2, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventDetailModalProps {
  event: BlockchainEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const Icon = getEventIcon(event.eventType);
  const color = getEventColor(event.eventType);

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    gray: 'bg-gray-100 text-gray-600',
  }[color] || 'bg-gray-100 text-gray-600';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span>{formatEventType(event.eventType)}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
          <div className="space-y-6">
            {/* Status badge */}
            <div>
              <Badge variant={event.verified ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                {event.verified ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    Unverified
                  </>
                )}
              </Badge>
            </div>

            {/* Basic info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900">Event Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Event ID</p>
                  <p className="font-mono text-xs break-all">{event.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Shipment ID</p>
                  <p className="font-mono text-xs break-all">{event.shipmentId}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Timestamp</p>
                  <p>{formatTimestamp(event.timestamp)}</p>
                </div>
                {event.blockNumber && (
                  <div>
                    <p className="text-gray-500 mb-1">Block Number</p>
                    <p className="font-mono">{event.blockNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actor */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Actor
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{event.actor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="capitalize">{event.actor.type}</span>
                </div>
                {event.actor.role && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role:</span>
                    <span>{event.actor.role}</span>
                  </div>
                )}
                {event.actor.organization && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organization:</span>
                    <span>{event.actor.organization}</span>
                  </div>
                )}
                {event.actor.deviceId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Device ID:</span>
                    <span className="font-mono text-xs">{event.actor.deviceId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{event.location.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="capitalize">{event.location.type}</span>
                </div>
                {event.location.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address:</span>
                    <span>{event.location.address}</span>
                  </div>
                )}
                {event.location.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Country:</span>
                    <span>{event.location.country}</span>
                  </div>
                )}
                {event.location.coordinates && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Coordinates:</span>
                    <span className="font-mono text-xs">
                      {event.location.coordinates.latitude.toFixed(6)}, {event.location.coordinates.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain data */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Blockchain Data
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500">Data Hash:</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2 font-mono text-xs break-all">
                    {event.dataHash}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500">Previous Hash:</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2 font-mono text-xs break-all">
                    {event.previousHash}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500">Transaction Hash:</span>
                  </div>
                  <div className="bg-gray-50 rounded p-2 font-mono text-xs break-all">
                    {event.transactionHash}
                  </div>
                </div>
                {event.signature && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500">Signature:</span>
                    </div>
                    <div className="bg-gray-50 rounded p-2 font-mono text-xs break-all">
                      {event.signature}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            {Object.keys(event.metadata).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-900">Metadata</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
