// Hash service for blockchain data integrity

import crypto from 'crypto';

/**
 * Service for generating and verifying cryptographic hashes
 */
export class HashService {
  /**
   * Generate SHA-256 hash for data integrity
   */
  generateDataHash(data: unknown): string {
    const jsonString = JSON.stringify(data);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Generate chain hash linking current event to previous
   */
  generateChainHash(previousHash: string, data: unknown): string {
    const dataHash = this.generateDataHash(data);
    const combined = previousHash + dataHash;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Verify data hash matches expected hash
   */
  verifyHash(data: unknown, expectedHash: string): boolean {
    const actualHash = this.generateDataHash(data);
    return actualHash === expectedHash;
  }

  /**
   * Generate merkle root from array of hashes
   */
  generateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) {
      return '';
    }
    
    if (hashes.length === 1) {
      return hashes[0];
    }

    const newLevel: string[] = [];
    
    // Pair up hashes and hash them together
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        const combined = hashes[i] + hashes[i + 1];
        newLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
      } else {
        // Odd number of hashes - duplicate the last one
        const combined = hashes[i] + hashes[i];
        newLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
      }
    }

    // Recursively build the merkle tree
    return this.generateMerkleRoot(newLevel);
  }

  /**
   * Generate a mock transaction hash (for development)
   * In production, this would be the actual blockchain transaction hash
   */
  generateTransactionHash(): string {
    const randomData = crypto.randomBytes(32);
    return '0x' + crypto.createHash('sha256').update(randomData).digest('hex');
  }

  /**
   * Generate a genesis hash for the first event in a chain
   */
  generateGenesisHash(shipmentId: string): string {
    return crypto.createHash('sha256').update(`genesis_${shipmentId}`).digest('hex');
  }
}

// Export singleton instance
export const hashService = new HashService();
