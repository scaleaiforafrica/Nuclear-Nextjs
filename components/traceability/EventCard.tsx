'use client';

import { useState } from 'react';
import { BlockchainEvent } from '@/models/blockchain.model';
import { formatTimestamp, getEventIcon, getEventColor, formatEventType, truncateHash } from '@/lib/traceability-utils';
import { ChevronDown, ChevronUp, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: BlockchainEvent;
  isExpanded?: boolean;
  onExpand?: (eventId: string) => void;
  onVerify?: (eventId: string) => void;
  showHash?: boolean;
  showActor?: boolean;
  showLocation?: boolean;
}

export function EventCard({
  event,
  isExpanded = false,
  onExpand,
  onVerify,
  showHash = true,
  showActor = true,
  showLocation = true,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const Icon = getEventIcon(event.eventType);
  const color = getEventColor(event.eventType);

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    red: 'bg-red-100 text-red-600 border-red-200',
    cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  }[color] || 'bg-gray-100 text-gray-600 border-gray-200';

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (onExpand) {
      onExpand(event.id);
    }
  };

  const hasMetadata = Object.keys(event.metadata).length > 0;

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-medium text-base">{formatEventType(event.eventType)}</h3>
              {event.verified && (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {showActor && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 min-w-[80px]">Actor:</span>
              <span className="text-gray-600">{event.actor.name} ({event.actor.type})</span>
            </div>
          )}
          
          {showLocation && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 min-w-[80px]">Location:</span>
              <span className="text-gray-600">{event.location.name}</span>
            </div>
          )}

          {showHash && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 min-w-[80px]">Hash:</span>
              <span className="text-gray-600 font-mono text-xs break-all">
                {truncateHash(event.dataHash, 20)}
              </span>
            </div>
          )}
        </div>

        {/* Expandable metadata */}
        {hasMetadata && (
          <>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleToggle}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 min-h-[44px]"
              >
                <span>Metadata</span>
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {expanded && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        {onVerify && !event.verified && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onVerify(event.id)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verify Event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
