// Blockchain service interface and types

import {
  BlockchainEvent,
  CreateBlockchainEventInput,
  RecordedEvent,
  ChainVerificationResult,
  EventVerificationResult,
  EventQueryFilters,
  PaginatedEvents,
  ChainStatistics,
} from '@/models/blockchain.model';

/**
 * Interface for blockchain service implementations
 */
export interface BlockchainService {
  /**
   * Record new event to blockchain
   */
  recordEvent(event: CreateBlockchainEventInput): Promise<RecordedEvent>;

  /**
   * Get all events for a shipment
   */
  getShipmentEvents(shipmentId: string): Promise<BlockchainEvent[]>;

  /**
   * Get single event by ID
   */
  getEvent(eventId: string): Promise<BlockchainEvent | null>;

  /**
   * Verify entire chain for a shipment
   */
  verifyChain(shipmentId: string): Promise<ChainVerificationResult>;

  /**
   * Verify single event
   */
  verifyEvent(eventId: string): Promise<EventVerificationResult>;

  /**
   * Query events with filters
   */
  queryEvents(filters: EventQueryFilters): Promise<PaginatedEvents>;

  /**
   * Get chain statistics
   */
  getChainStats(): Promise<ChainStatistics>;
}

// Export service implementations
export { hyperledgerService } from './hyperledger.service';
export { hashService } from './hash.service';
export { eventRecorderService } from './event-recorder.service';

