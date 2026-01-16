import { describe, it, expect } from 'vitest';
import { hashService } from '@/services/blockchain/hash.service';

describe('HashService', () => {
  describe('generateDataHash', () => {
    it('should generate consistent hash for same data', () => {
      const data = { test: 'data', value: 123 };
      const hash1 = hashService.generateDataHash(data);
      const hash2 = hashService.generateDataHash(data);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 char hex string
    });

    it('should generate different hashes for different data', () => {
      const data1 = { test: 'data1' };
      const data2 = { test: 'data2' };
      
      const hash1 = hashService.generateDataHash(data1);
      const hash2 = hashService.generateDataHash(data2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle complex nested objects', () => {
      const data = {
        shipmentId: 'SH-123',
        actor: { id: 'user1', type: 'user', name: 'John' },
        location: { name: 'Facility A', coordinates: { lat: 10, lng: 20 } },
        metadata: { temperature: 5.5 },
      };
      
      const hash = hashService.generateDataHash(data);
      expect(hash).toHaveLength(64);
    });
  });

  describe('generateChainHash', () => {
    it('should link previous hash with current data', () => {
      const previousHash = 'a'.repeat(64);
      const data = { test: 'data' };
      
      const chainHash = hashService.generateChainHash(previousHash, data);
      expect(chainHash).toHaveLength(64);
      expect(chainHash).not.toBe(previousHash);
    });

    it('should generate different hashes with different previous hashes', () => {
      const previousHash1 = 'a'.repeat(64);
      const previousHash2 = 'b'.repeat(64);
      const data = { test: 'data' };
      
      const hash1 = hashService.generateChainHash(previousHash1, data);
      const hash2 = hashService.generateChainHash(previousHash2, data);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyHash', () => {
    it('should verify correct hash', () => {
      const data = { test: 'data', value: 42 };
      const hash = hashService.generateDataHash(data);
      
      const isValid = hashService.verifyHash(data, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect hash', () => {
      const data = { test: 'data' };
      const wrongHash = 'x'.repeat(64);
      
      const isValid = hashService.verifyHash(data, wrongHash);
      expect(isValid).toBe(false);
    });

    it('should detect data tampering', () => {
      const originalData = { test: 'original' };
      const hash = hashService.generateDataHash(originalData);
      
      const tamperedData = { test: 'tampered' };
      const isValid = hashService.verifyHash(tamperedData, hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateMerkleRoot', () => {
    it('should return empty string for empty array', () => {
      const root = hashService.generateMerkleRoot([]);
      expect(root).toBe('');
    });

    it('should return single hash for array of one', () => {
      const hash = 'a'.repeat(64);
      const root = hashService.generateMerkleRoot([hash]);
      expect(root).toBe(hash);
    });

    it('should generate merkle root for multiple hashes', () => {
      const hashes = [
        'a'.repeat(64),
        'b'.repeat(64),
        'c'.repeat(64),
        'd'.repeat(64),
      ];
      
      const root = hashService.generateMerkleRoot(hashes);
      expect(root).toHaveLength(64);
    });

    it('should generate same root for same input', () => {
      const hashes = ['a'.repeat(64), 'b'.repeat(64)];
      
      const root1 = hashService.generateMerkleRoot(hashes);
      const root2 = hashService.generateMerkleRoot(hashes);
      
      expect(root1).toBe(root2);
    });

    it('should handle odd number of hashes', () => {
      const hashes = ['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64)];
      
      const root = hashService.generateMerkleRoot(hashes);
      expect(root).toHaveLength(64);
    });
  });

  describe('generateTransactionHash', () => {
    it('should generate hash with 0x prefix', () => {
      const txHash = hashService.generateTransactionHash();
      expect(txHash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should generate different hashes each time', () => {
      const hash1 = hashService.generateTransactionHash();
      const hash2 = hashService.generateTransactionHash();
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateGenesisHash', () => {
    it('should generate consistent genesis hash for same shipment', () => {
      const shipmentId = 'SH-123';
      
      const hash1 = hashService.generateGenesisHash(shipmentId);
      const hash2 = hashService.generateGenesisHash(shipmentId);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should generate different genesis hashes for different shipments', () => {
      const hash1 = hashService.generateGenesisHash('SH-001');
      const hash2 = hashService.generateGenesisHash('SH-002');
      
      expect(hash1).not.toBe(hash2);
    });
  });
});
