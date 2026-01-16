// Hyperledger Fabric blockchain service implementation

import { createClient } from '@/lib/supabase/server';
import {
  BlockchainEvent,
  CreateBlockchainEventInput,
  RecordedEvent,
  ChainVerificationResult,
  EventVerificationResult,
  EventQueryFilters,
  PaginatedEvents,
  ChainStatistics,
  BlockchainEventType,
} from '@/models/blockchain.model';
import { BlockchainService } from './index';
import { hashService } from './hash.service';

/**
 * Hyperledger Fabric blockchain service
 * Currently mocked for development, with hooks for real implementation
 */
export class HyperledgerService implements BlockchainService {
  /**
   * Record new event to blockchain
   */
  async recordEvent(input: CreateBlockchainEventInput): Promise<RecordedEvent> {
    const supabase = await createClient();

    // Get previous event to link chain
    const { data: previousEvents } = await supabase
      .from('blockchain_events')
      .select('*')
      .eq('shipment_id', input.shipmentId)
      .order('timestamp', { ascending: false })
      .limit(1);

    const previousHash = previousEvents && previousEvents.length > 0
      ? previousEvents[0].data_hash
      : hashService.generateGenesisHash(input.shipmentId);

    // Generate event data hash
    const eventData = {
      shipmentId: input.shipmentId,
      eventType: input.eventType,
      actor: input.actor,
      location: input.location,
      metadata: input.metadata || {},
      timestamp: new Date().toISOString(),
    };

    const dataHash = hashService.generateDataHash(eventData);
    const transactionHash = hashService.generateTransactionHash();

    // Insert into database
    const { data, error } = await supabase
      .from('blockchain_events')
      .insert({
        shipment_id: input.shipmentId,
        event_type: input.eventType,
        actor_id: input.actor.id,
        actor_type: input.actor.type,
        actor_name: input.actor.name,
        actor_role: input.actor.role,
        actor_organization: input.actor.organization,
        actor_device_id: input.actor.deviceId,
        location_name: input.location.name,
        location_type: input.location.type,
        location_latitude: input.location.coordinates?.latitude,
        location_longitude: input.location.coordinates?.longitude,
        location_address: input.location.address,
        location_country: input.location.country,
        location_country_code: input.location.countryCode,
        data_hash: dataHash,
        previous_hash: previousHash,
        transaction_hash: transactionHash,
        metadata: input.metadata || {},
        signature: input.signature,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record event: ${error.message}`);
    }

    // Map database response to BlockchainEvent
    const event = this.mapDbEventToBlockchainEvent(data);

    return {
      ...event,
      success: true,
      message: 'Event recorded successfully on blockchain',
    };
  }

  /**
   * Get all events for a shipment
   */
  async getShipmentEvents(shipmentId: string): Promise<BlockchainEvent[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blockchain_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch shipment events: ${error.message}`);
    }

    return (data || []).map(this.mapDbEventToBlockchainEvent);
  }

  /**
   * Get single event by ID
   */
  async getEvent(eventId: string): Promise<BlockchainEvent | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blockchain_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDbEventToBlockchainEvent(data);
  }

  /**
   * Verify entire chain for a shipment
   */
  async verifyChain(shipmentId: string): Promise<ChainVerificationResult> {
    const events = await this.getShipmentEvents(shipmentId);

    if (events.length === 0) {
      throw new Error('No events found for shipment');
    }

    const brokenLinks: string[] = [];
    const invalidHashes: string[] = [];

    // Verify first event
    const expectedFirstPreviousHash = hashService.generateGenesisHash(shipmentId);
    if (events[0].previousHash !== expectedFirstPreviousHash) {
      brokenLinks.push(events[0].id);
    }

    // Verify chain links
    for (let i = 1; i < events.length; i++) {
      if (events[i].previousHash !== events[i - 1].dataHash) {
        brokenLinks.push(events[i].id);
      }
    }

    // Verify data hashes
    for (const event of events) {
      const eventData = {
        shipmentId: event.shipmentId,
        eventType: event.eventType,
        actor: event.actor,
        location: event.location,
        metadata: event.metadata,
        timestamp: event.timestamp.toISOString(),
      };

      if (!hashService.verifyHash(eventData, event.dataHash)) {
        invalidHashes.push(event.id);
      }
    }

    const isValid = brokenLinks.length === 0 && invalidHashes.length === 0;

    // Store verification result
    const supabase = await createClient();
    await supabase.from('chain_verifications').insert({
      shipment_id: shipmentId,
      is_valid: isValid,
      event_count: events.length,
      first_event: events[0].timestamp,
      last_event: events[events.length - 1].timestamp,
      broken_links: brokenLinks,
      invalid_hashes: invalidHashes,
      verified_by: 'system',
    });

    return {
      shipmentId,
      isValid,
      eventCount: events.length,
      firstEvent: events[0].timestamp,
      lastEvent: events[events.length - 1].timestamp,
      brokenLinks,
      invalidHashes,
      verifiedAt: new Date(),
    };
  }

  /**
   * Verify single event
   */
  async verifyEvent(eventId: string): Promise<EventVerificationResult> {
    const event = await this.getEvent(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    const eventData = {
      shipmentId: event.shipmentId,
      eventType: event.eventType,
      actor: event.actor,
      location: event.location,
      metadata: event.metadata,
      timestamp: event.timestamp.toISOString(),
    };

    const hashValid = hashService.verifyHash(eventData, event.dataHash);

    // Check chain link
    const allEvents = await this.getShipmentEvents(event.shipmentId);
    const eventIndex = allEvents.findIndex(e => e.id === eventId);
    
    let chainValid = true;
    if (eventIndex === 0) {
      const expectedPreviousHash = hashService.generateGenesisHash(event.shipmentId);
      chainValid = event.previousHash === expectedPreviousHash;
    } else if (eventIndex > 0) {
      chainValid = event.previousHash === allEvents[eventIndex - 1].dataHash;
    }

    const signatureValid = true; // TODO: Implement signature verification

    return {
      eventId,
      isValid: hashValid && chainValid && signatureValid,
      hashValid,
      chainValid,
      signatureValid,
      verifiedAt: new Date(),
      message: hashValid && chainValid ? 'Event verified successfully' : 'Event verification failed',
    };
  }

  /**
   * Query events with filters
   */
  async queryEvents(filters: EventQueryFilters): Promise<PaginatedEvents> {
    const supabase = await createClient();
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 30;
    const offset = (page - 1) * pageSize;

    let query = supabase.from('blockchain_events').select('*', { count: 'exact' });

    if (filters.shipmentId) {
      query = query.eq('shipment_id', filters.shipmentId);
    }

    if (filters.eventType) {
      if (Array.isArray(filters.eventType)) {
        query = query.in('event_type', filters.eventType);
      } else {
        query = query.eq('event_type', filters.eventType);
      }
    }

    if (filters.actorId) {
      query = query.eq('actor_id', filters.actorId);
    }

    if (filters.actorType) {
      query = query.eq('actor_type', filters.actorType);
    }

    if (filters.locationType) {
      query = query.eq('location_type', filters.locationType);
    }

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }

    const { data, error, count } = await query
      .order('timestamp', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to query events: ${error.message}`);
    }

    const events = (data || []).map(this.mapDbEventToBlockchainEvent);

    return {
      events,
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    };
  }

  /**
   * Get chain statistics
   */
  async getChainStats(): Promise<ChainStatistics> {
    const supabase = await createClient();

    // Total events
    const { count: totalEvents } = await supabase
      .from('blockchain_events')
      .select('*', { count: 'exact', head: true });

    // Total unique shipments
    const { data: shipmentData } = await supabase
      .from('blockchain_events')
      .select('shipment_id');

    const uniqueShipments = new Set((shipmentData || []).map(d => d.shipment_id));
    const totalShipments = uniqueShipments.size;

    // Events today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: eventsToday } = await supabase
      .from('blockchain_events')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', today.toISOString());

    // Verification rate
    const { count: verifiedEvents } = await supabase
      .from('blockchain_events')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);

    const verificationRate = totalEvents ? (verifiedEvents || 0) / totalEvents : 0;

    // Events by type
    const { data: eventTypeData } = await supabase
      .from('blockchain_events')
      .select('event_type');

    const eventsByType: Record<BlockchainEventType, number> = {} as Record<BlockchainEventType, number>;
    (eventTypeData || []).forEach((row: { event_type: BlockchainEventType }) => {
      eventsByType[row.event_type] = (eventsByType[row.event_type] || 0) + 1;
    });

    return {
      totalEvents: totalEvents || 0,
      totalShipments,
      eventsToday: eventsToday || 0,
      verificationRate,
      averageEventsPerShipment: totalShipments ? (totalEvents || 0) / totalShipments : 0,
      chainIntegrityPercentage: verificationRate * 100,
      eventsByType,
    };
  }

  /**
   * Map database row to BlockchainEvent
   */
  private mapDbEventToBlockchainEvent(data: any): BlockchainEvent {
    return {
      id: data.id,
      shipmentId: data.shipment_id,
      eventType: data.event_type,
      timestamp: new Date(data.timestamp),
      actor: {
        id: data.actor_id,
        type: data.actor_type,
        name: data.actor_name,
        role: data.actor_role,
        organization: data.actor_organization,
        deviceId: data.actor_device_id,
      },
      location: {
        name: data.location_name,
        type: data.location_type,
        coordinates: data.location_latitude && data.location_longitude
          ? {
              latitude: parseFloat(data.location_latitude),
              longitude: parseFloat(data.location_longitude),
            }
          : undefined,
        address: data.location_address,
        country: data.location_country,
        countryCode: data.location_country_code,
      },
      dataHash: data.data_hash,
      previousHash: data.previous_hash,
      blockNumber: data.block_number,
      transactionHash: data.transaction_hash,
      metadata: data.metadata || {},
      signature: data.signature,
      verified: data.verified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Export singleton instance
export const hyperledgerService = new HyperledgerService();
