'use client';

import { useEffect, useRef } from 'react';
import { BlockchainEvent } from '@/models/blockchain.model';
import { useBlockchainEvents } from '@/lib/hooks/useBlockchainEvents';
import { formatTimestamp, getEventIcon, formatEventType } from '@/lib/traceability-utils';
import { Activity, Loader2 } from 'lucide-react';

interface RealTimeEventFeedProps {
  shipmentId: string;
  maxEvents?: number;
}

export function RealTimeEventFeed({ shipmentId, maxEvents = 10 }: RealTimeEventFeedProps) {
  const { events, isLoading, error } = useBlockchainEvents({
    shipmentId,
    autoRefresh: true,
    pollingInterval: 30000, // 30 seconds
  });

  const feedRef = useRef<HTMLDivElement>(null);
  const prevEventsLength = useRef(events.length);

  // Auto-scroll to new events
  useEffect(() => {
    if (events.length > prevEventsLength.current && feedRef.current) {
      feedRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    prevEventsLength.current = events.length;
  }, [events.length]);

  const displayEvents = events.slice(0, maxEvents);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-900 text-sm">Failed to load events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-sm">Real-Time Event Feed</h3>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      {/* Events feed */}
      <div
        ref={feedRef}
        className="max-h-[500px] overflow-y-auto divide-y divide-gray-100"
      >
        {displayEvents.length === 0 && !isLoading ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No events yet. Events will appear here in real-time.
          </div>
        ) : (
          displayEvents.map((event) => (
            <EventFeedItem key={event.id} event={event} />
          ))
        )}
      </div>

      {/* Footer */}
      {events.length > maxEvents && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-xs text-gray-600">
            Showing latest {maxEvents} of {events.length} events
          </p>
        </div>
      )}
    </div>
  );
}

interface EventFeedItemProps {
  event: BlockchainEvent;
}

function EventFeedItem({ event }: EventFeedItemProps) {
  const Icon = getEventIcon(event.eventType);

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm">{formatEventType(event.eventType)}</p>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTimestamp(event.timestamp).split(',')[1]?.trim() || 'Now'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-1">
            {event.actor.name} • {event.location.name}
          </p>
          {event.verified && (
            <span className="inline-flex items-center text-xs text-green-600">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
