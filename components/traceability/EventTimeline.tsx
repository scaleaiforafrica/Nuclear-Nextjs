'use client';

import { BlockchainEvent } from '@/models/blockchain.model';
import { formatTimestamp, getEventIcon, getEventColor, formatEventType } from '@/lib/traceability-utils';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventTimelineProps {
  events: BlockchainEvent[];
  isLoading?: boolean;
  onEventClick?: (event: BlockchainEvent) => void;
  onVerifyEvent?: (eventId: string) => void;
  showVerificationStatus?: boolean;
  compactMode?: boolean;
}

export function EventTimeline({
  events,
  isLoading = false,
  onEventClick,
  onVerifyEvent,
  showVerificationStatus = true,
  compactMode = false,
}: EventTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No events found for this shipment</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Events */}
      <div className="space-y-4 sm:space-y-6">
        {events.map((event, index) => {
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

          return (
            <div key={event.id} className="relative pl-12 sm:pl-16">
              {/* Icon */}
              <div
                className={`absolute left-0 sm:left-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center ${colorClasses} z-10`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Event card */}
              <div
                className={`border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${
                  onEventClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onEventClick?.(event)}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${compactMode ? 'text-sm' : 'text-base'}`}>
                        {formatEventType(event.eventType)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                    
                    {showVerificationStatus && (
                      <div className="flex items-center gap-2">
                        {event.verified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  {!compactMode && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-[80px]">Actor:</span>
                        <span className="flex-1">{event.actor.name}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-[80px]">Location:</span>
                        <span className="flex-1">{event.location.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {onVerifyEvent && !event.verified && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerifyEvent(event.id);
                        }}
                        className="min-h-[44px]"
                      >
                        Verify Event
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
