'use client';

import { useState, useCallback } from 'react';
import { CreateBlockchainEventInput, RecordedEvent } from '@/models/blockchain.model';

/**
 * Result from useEventRecorder hook
 */
export interface UseEventRecorderResult {
  recordEvent: (input: CreateBlockchainEventInput) => Promise<RecordedEvent | null>;
  isRecording: boolean;
  lastRecorded: RecordedEvent | null;
  error: Error | null;
}

/**
 * Hook for recording blockchain events
 */
export function useEventRecorder(): UseEventRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecorded, setLastRecorded] = useState<RecordedEvent | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Record a new event
   */
  const recordEvent = useCallback(
    async (input: CreateBlockchainEventInput): Promise<RecordedEvent | null> => {
      try {
        setIsRecording(true);
        setError(null);

        const response = await fetch('/api/traceability/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to record event');
        }

        const data = await response.json();
        
        // Parse dates
        const recordedEvent: RecordedEvent = {
          ...data.data,
          timestamp: new Date(data.data.timestamp),
          createdAt: data.data.createdAt ? new Date(data.data.createdAt) : undefined,
          updatedAt: data.data.updatedAt ? new Date(data.data.updatedAt) : undefined,
        };

        setLastRecorded(recordedEvent);
        return recordedEvent;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return null;
      } finally {
        setIsRecording(false);
      }
    },
    []
  );

  return {
    recordEvent,
    isRecording,
    lastRecorded,
    error,
  };
}
