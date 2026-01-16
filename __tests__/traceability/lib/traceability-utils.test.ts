import { describe, it, expect } from 'vitest';
import {
  generateEventHash,
  generateChainHash,
  verifyEventHash,
  verifyChainIntegrity,
  formatEventType,
  formatTimestamp,
  truncateHash,
  getEventColor,
} from '@/lib/traceability-utils';
import { BlockchainEvent, BlockchainEventType } from '@/models/blockchain.model';

describe('Traceability Utils', () => {
  describe('generateEventHash', () => {
    it('should generate consistent hash for same event data', () => {
      const event = {
        shipmentId: 'SH-123',
        eventType: 'shipment_created' as BlockchainEventType,
        timestamp: new Date('2024-01-01T00:00:00Z'),
        actor: { id: 'user1', type: 'user' as const, name: 'John' },
        location: { name: 'Facility', type: 'facility' as const },
        metadata: {},
      };

      const hash1 = generateEventHash(event);
      const hash2 = generateEventHash(event);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('generateChainHash', () => {
    it('should combine previous hash with event hash', () => {
      const previousHash = 'a'.repeat(64);
      const eventHash = 'b'.repeat(64);

      const chainHash = generateChainHash(previousHash, eventHash);

      expect(chainHash).toHaveLength(64);
      expect(chainHash).not.toBe(previousHash);
      expect(chainHash).not.toBe(eventHash);
    });
  });

  describe('verifyChainIntegrity', () => {
    it('should return false for empty events', () => {
      const result = verifyChainIntegrity([]);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('No events');
    });

    it('should detect valid chain', () => {
      const event1: BlockchainEvent = {
        id: '1',
        shipmentId: 'SH-123',
        eventType: 'shipment_created',
        timestamp: new Date(),
        actor: { id: 'user1', type: 'user', name: 'John' },
        location: { name: 'Facility', type: 'facility' },
        dataHash: 'hash1',
        previousHash: 'genesis',
        transactionHash: '0x123',
        metadata: {},
        verified: true,
      };

      const event2: BlockchainEvent = {
        ...event1,
        id: '2',
        eventType: 'dispatch',
        dataHash: 'hash2',
        previousHash: 'hash1',
      };

      const result = verifyChainIntegrity([event1, event2]);
      expect(result.brokenLinks).toHaveLength(0);
    });

    it('should detect broken chain links', () => {
      const event1: BlockchainEvent = {
        id: '1',
        shipmentId: 'SH-123',
        eventType: 'shipment_created',
        timestamp: new Date(),
        actor: { id: 'user1', type: 'user', name: 'John' },
        location: { name: 'Facility', type: 'facility' },
        dataHash: 'hash1',
        previousHash: 'genesis',
        transactionHash: '0x123',
        metadata: {},
        verified: true,
      };

      const event2: BlockchainEvent = {
        ...event1,
        id: '2',
        eventType: 'dispatch',
        dataHash: 'hash2',
        previousHash: 'wrong_hash', // Broken link
      };

      const result = verifyChainIntegrity([event1, event2]);
      expect(result.brokenLinks).toContain('2');
      expect(result.isValid).toBe(false);
    });
  });

  describe('formatEventType', () => {
    it('should format event types correctly', () => {
      expect(formatEventType('shipment_created')).toBe('Shipment Created');
      expect(formatEventType('dispatch')).toBe('Dispatched');
      expect(formatEventType('customs_cleared')).toBe('Customs Cleared');
      expect(formatEventType('temperature_alert')).toBe('Temperature Alert');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp in readable format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatTimestamp(date);

      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('truncateHash', () => {
    it('should truncate long hashes', () => {
      const hash = 'a'.repeat(64);
      const truncated = truncateHash(hash, 16);

      expect(truncated.length).toBeLessThan(hash.length);
      expect(truncated).toContain('...');
    });

    it('should not truncate short hashes', () => {
      const hash = 'abc';
      const truncated = truncateHash(hash, 16);

      expect(truncated).toBe(hash);
    });

    it('should use default length if not specified', () => {
      const hash = 'a'.repeat(64);
      const truncated = truncateHash(hash);

      expect(truncated).toContain('...');
      expect(truncated.length).toBeLessThan(64);
    });
  });

  describe('getEventColor', () => {
    it('should return colors for event types', () => {
      expect(getEventColor('shipment_created')).toBe('purple');
      expect(getEventColor('dispatch')).toBe('blue');
      expect(getEventColor('customs_cleared')).toBe('green');
      expect(getEventColor('temperature_alert')).toBe('red');
      expect(getEventColor('delivery')).toBe('green');
    });

    it('should return default color for unknown type', () => {
      const color = getEventColor('unknown_type' as BlockchainEventType);
      expect(color).toBe('gray');
    });
  });
});
