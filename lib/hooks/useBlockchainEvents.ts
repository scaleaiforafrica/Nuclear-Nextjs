'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlockchainEvent, ChainVerificationResult } from '@/models/blockchain.model';

/**
 * Options for useBlockchainEvents hook
 */
export interface UseBlockchainEventsOptions {
  shipmentId: string;
  pollingInterval?: number; // Default: 30000ms (30 seconds)
  autoRefresh?: boolean; // Default: false
}

/**
 * Result from useBlockchainEvents hook
 */
export interface UseBlockchainEventsResult {
  events: BlockchainEvent[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  verifyChain: () => Promise<ChainVerificationResult | null>;
  lastUpdated: Date | null;
}

/**
 * Hook for fetching and managing blockchain events
 */
export function useBlockchainEvents(
  options: UseBlockchainEventsOptions
): UseBlockchainEventsResult {
  const { shipmentId, pollingInterval = 30000, autoRefresh = false } = options;

  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Fetch events from API
   */
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/traceability/shipments/${shipmentId}/events`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse dates
      const parsedEvents = data.data.events.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
        createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
      }));

      setEvents(parsedEvents);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [shipmentId]);

  /**
   * Verify chain integrity
   */
  const verifyChain = useCallback(async (): Promise<ChainVerificationResult | null> => {
    try {
      const response = await fetch(
        `/api/traceability/shipments/${shipmentId}/verify`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to verify chain: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse dates
      return {
        ...data.data,
        firstEvent: new Date(data.data.firstEvent),
        lastEvent: new Date(data.data.lastEvent),
        verifiedAt: new Date(data.data.verifiedAt),
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  }, [shipmentId]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /**
   * Auto-refresh polling
   */
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchEvents();
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, pollingInterval, fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refresh: fetchEvents,
    verifyChain,
    lastUpdated,
  };
}
