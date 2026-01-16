# Blockchain Integration Details

## Overview

The NuclearFlow traceability system is built on blockchain principles inspired by Hyperledger Fabric, providing immutable, cryptographically-verified event recording for nuclear material shipments. This document details the blockchain mechanics, hash generation, chain linking, and implementation approach.

## Hyperledger Fabric Foundation

### What is Hyperledger Fabric?

Hyperledger Fabric is an enterprise-grade, permissioned blockchain framework designed for:
- **Permissioned networks**: Only authorized participants can join
- **Modular architecture**: Pluggable consensus and membership services
- **Confidential transactions**: Private channels for data privacy
- **Smart contracts**: Chaincode for business logic
- **High performance**: Optimized for enterprise workloads

### Why Hyperledger Fabric?

For nuclear material tracking, we need:
- ✅ **Regulatory compliance**: Permissioned access meets IAEA/NRC requirements
- ✅ **Data privacy**: Sensitive shipment data restricted to authorized parties
- ✅ **Auditability**: Complete, immutable audit trails
- ✅ **Performance**: Handle high-frequency IoT sensor data
- ✅ **Enterprise support**: Production-ready with IBM backing

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Application Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   UI/UX    │  │ API Routes │  │   Models   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘
                            │
┌──────────────────────────┴────────────────────────────────────┐
│              Blockchain Service Layer                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │          Hyperledger Service                        │     │
│  │  - recordEvent()                                    │     │
│  │  - getShipmentEvents()                              │     │
│  │  - verifyChain()                                    │     │
│  │  - queryEvents()                                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                            │                                  │
│  ┌──────────────────┐     │     ┌──────────────────┐         │
│  │  Hash Service    │◄────┴────►│ Event Recorder   │         │
│  │  - SHA-256       │            │  Helper methods  │         │
│  │  - Merkle root   │            │  for event types │         │
│  │  - Chain hashing │            └──────────────────┘         │
│  └──────────────────┘                                         │
└───────────────────────────────────────────────────────────────┘
                            │
┌──────────────────────────┴────────────────────────────────────┐
│                  Data Layer                                   │
│  ┌────────────────────────────────────────────────────┐      │
│  │         PostgreSQL (Supabase)                      │      │
│  │  Tables:                                           │      │
│  │  - blockchain_events: Event records                │      │
│  │  - chain_verifications: Verification results       │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  [Future: Hyperledger Fabric Network]                        │
│  - Orderer nodes                                             │
│  - Peer nodes                                                │
│  - Channel configuration                                     │
│  - Chaincode (smart contracts)                               │
└───────────────────────────────────────────────────────────────┘
```

## Event Recording Process

### 1. Event Submission

When an event is recorded, the following sequence occurs:

```typescript
// User/System submits event
const input: CreateBlockchainEventInput = {
  shipmentId: 'uuid',
  eventType: 'checkpoint',
  actor: { /* actor details */ },
  location: { /* location details */ },
  metadata: { /* custom data */ }
};

// API validates input
const validated = createEventSchema.safeParse(input);
```

### 2. Hash Generation

```typescript
// Step 1: Create event data object
const eventData = {
  shipmentId: input.shipmentId,
  eventType: input.eventType,
  actor: input.actor,
  location: input.location,
  metadata: input.metadata || {},
  timestamp: new Date().toISOString()
};

// Step 2: Generate SHA-256 hash of event data
const jsonString = JSON.stringify(eventData);
const dataHash = crypto
  .createHash('sha256')
  .update(jsonString)
  .digest('hex');

// Result: 64-character hex string
// Example: "a3f5e8d9c2b1a4e6f7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0"
```

### 3. Chain Linking

```typescript
// Step 1: Get previous event's hash
const { data: previousEvents } = await supabase
  .from('blockchain_events')
  .select('data_hash')
  .eq('shipment_id', shipmentId)
  .order('timestamp', { ascending: false })
  .limit(1);

// Step 2: Use genesis hash if first event
const previousHash = previousEvents?.length > 0
  ? previousEvents[0].data_hash
  : hashService.generateGenesisHash(shipmentId);

// Genesis hash generation
function generateGenesisHash(shipmentId: string): string {
  return crypto
    .createHash('sha256')
    .update(`genesis_${shipmentId}`)
    .digest('hex');
}
```

### 4. Transaction Recording

```typescript
// Step 1: Generate transaction hash (mock in development)
const transactionHash = hashService.generateTransactionHash();
// Returns: "0x" + 64-character hex string

// Step 2: Store event in database
const event = await supabase
  .from('blockchain_events')
  .insert({
    shipment_id: shipmentId,
    event_type: eventType,
    actor_id: actor.id,
    actor_type: actor.type,
    actor_name: actor.name,
    // ... actor and location fields
    data_hash: dataHash,
    previous_hash: previousHash,
    transaction_hash: transactionHash,
    metadata: metadata,
    verified: false,
    timestamp: new Date()
  })
  .select()
  .single();

// Step 3: Return recorded event
return {
  ...event,
  success: true,
  message: 'Event recorded successfully on blockchain'
};
```

### Visual Flow

```
┌─────────────┐
│ Event Input │
└──────┬──────┘
       │
       ▼
┌────────────────────┐
│ Validate & Prepare │
│  - Check schema    │
│  - Add timestamp   │
└─────────┬──────────┘
          │
          ▼
┌──────────────────────┐
│  Get Previous Hash   │
│  (or Genesis Hash)   │
└─────────┬────────────┘
          │
          ▼
┌─────────────────────┐
│  Generate Hashes    │
│  - Data hash        │
│  - Transaction hash │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Store in DB       │
│  - Event data       │
│  - Hash chain link  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Return to Client   │
│  - Event details    │
│  - Hashes           │
│  - Success status   │
└─────────────────────┘
```

## Chain Integrity Verification

### Verification Algorithm

```typescript
async function verifyChain(shipmentId: string): ChainVerificationResult {
  // Step 1: Get all events in chronological order
  const events = await getShipmentEvents(shipmentId);
  
  if (events.length === 0) {
    throw new Error('No events found for shipment');
  }

  const brokenLinks: string[] = [];
  const invalidHashes: string[] = [];

  // Step 2: Verify genesis hash
  const expectedGenesisHash = generateGenesisHash(shipmentId);
  if (events[0].previousHash !== expectedGenesisHash) {
    brokenLinks.push(events[0].id);
  }

  // Step 3: Verify chain links
  for (let i = 1; i < events.length; i++) {
    // Each event's previousHash must match previous event's dataHash
    if (events[i].previousHash !== events[i - 1].dataHash) {
      brokenLinks.push(events[i].id);
    }
  }

  // Step 4: Verify data hashes
  for (const event of events) {
    const eventData = {
      shipmentId: event.shipmentId,
      eventType: event.eventType,
      actor: event.actor,
      location: event.location,
      metadata: event.metadata,
      timestamp: event.timestamp.toISOString()
    };

    const calculatedHash = generateDataHash(eventData);
    if (calculatedHash !== event.dataHash) {
      invalidHashes.push(event.id);
    }
  }

  // Step 5: Calculate result
  const isValid = brokenLinks.length === 0 && invalidHashes.length === 0;

  // Step 6: Store verification result
  await storeVerificationResult({
    shipment_id: shipmentId,
    is_valid: isValid,
    event_count: events.length,
    broken_links: brokenLinks,
    invalid_hashes: invalidHashes
  });

  return {
    shipmentId,
    isValid,
    eventCount: events.length,
    firstEvent: events[0].timestamp,
    lastEvent: events[events.length - 1].timestamp,
    brokenLinks,
    invalidHashes,
    verifiedAt: new Date()
  };
}
```

### Visual Chain Verification

```
Event 1 (Genesis)
┌─────────────────────────────────────────────┐
│ previousHash: genesis_[shipmentId]          │
│ dataHash: abc123...                         │
└─────────────────────────────────────────────┘
                    │
                    │ Link verification:
                    │ Event2.previousHash === Event1.dataHash ✓
                    ▼
Event 2
┌─────────────────────────────────────────────┐
│ previousHash: abc123...                     │
│ dataHash: def456...                         │
└─────────────────────────────────────────────┘
                    │
                    │ Link verification:
                    │ Event3.previousHash === Event2.dataHash ✓
                    ▼
Event 3
┌─────────────────────────────────────────────┐
│ previousHash: def456...                     │
│ dataHash: ghi789...                         │
└─────────────────────────────────────────────┘

Hash verification for each event:
  Calculate: SHA256(eventData) === storedDataHash ✓
```

## Hash Generation Details

### SHA-256 Algorithm

```typescript
class HashService {
  // Basic data hash
  generateDataHash(data: unknown): string {
    const jsonString = JSON.stringify(data);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  // Chain hash (combines previous hash with current data hash)
  generateChainHash(previousHash: string, data: unknown): string {
    const dataHash = this.generateDataHash(data);
    const combined = previousHash + dataHash;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  // Merkle root for batch verification
  generateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];

    const newLevel: string[] = [];
    
    // Pair up hashes and hash them together
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        const combined = hashes[i] + hashes[i + 1];
        newLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
      } else {
        // Odd number: duplicate last hash
        const combined = hashes[i] + hashes[i];
        newLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
      }
    }

    // Recursively build merkle tree
    return this.generateMerkleRoot(newLevel);
  }

  // Transaction hash (mock - in production, from blockchain)
  generateTransactionHash(): string {
    const randomData = crypto.randomBytes(32);
    return '0x' + crypto.createHash('sha256').update(randomData).digest('hex');
  }

  // Genesis hash for shipment chain
  generateGenesisHash(shipmentId: string): string {
    return crypto.createHash('sha256').update(`genesis_${shipmentId}`).digest('hex');
  }
}
```

### Merkle Tree for Batch Verification

```
         Merkle Root
            /    \
           /      \
        H(AB)    H(CD)
        /  \      /  \
       /    \    /    \
     H(A)  H(B) H(C) H(D)
      |     |    |     |
    Evt1  Evt2 Evt3  Evt4
```

## Transaction Handling

### Current Implementation (Mock)

```typescript
// Generate mock transaction hash
function generateTransactionHash(): string {
  const randomData = crypto.randomBytes(32);
  return '0x' + crypto.createHash('sha256').update(randomData).digest('hex');
}

// Result format: "0x" + 64 hex characters
// Example: "0xc5d7a1e3f5b9d0e2f4a6c8e0f2d4a6e8f0c2d4e6f8a0c2e4f6a8c0e2f4a6c8e0"
```

### Future Implementation (Hyperledger Fabric)

```typescript
// Submit transaction to Hyperledger Fabric
async function submitTransaction(
  contract: Contract,
  eventData: BlockchainEvent
): Promise<string> {
  const result = await contract.submitTransaction(
    'RecordEvent',
    JSON.stringify(eventData)
  );
  
  return result.toString(); // Returns transaction ID from ledger
}

// Query transaction
async function queryTransaction(
  contract: Contract,
  transactionId: string
): Promise<BlockchainEvent> {
  const result = await contract.evaluateTransaction(
    'GetEvent',
    transactionId
  );
  
  return JSON.parse(result.toString());
}
```

## Mock vs Production Implementation

### Current State (Development)

| Feature | Status | Implementation |
|---------|--------|----------------|
| Event Recording | ✅ Implemented | PostgreSQL storage via Supabase |
| Hash Generation | ✅ Implemented | Node.js crypto (SHA-256) |
| Chain Linking | ✅ Implemented | previousHash → dataHash linking |
| Chain Verification | ✅ Implemented | Full integrity checking algorithm |
| Transaction Hash | ⚠️ Mock | Random hash generation |
| Blockchain Network | ❌ Not Implemented | Using PostgreSQL as data store |
| Smart Contracts | ❌ Not Implemented | Business logic in TypeScript |
| Consensus | ❌ Not Implemented | Single database authority |
| Peer Network | ❌ Not Implemented | Centralized architecture |

### Production Requirements

| Feature | Implementation Plan |
|---------|-------------------|
| **Hyperledger Fabric Network** | Deploy orderer and peer nodes |
| **Chaincode** | Develop smart contracts for event recording |
| **Channel Configuration** | Create private channels for organizations |
| **Certificate Authority** | Set up Fabric CA for identity management |
| **Consensus Mechanism** | Configure Raft or Kafka ordering service |
| **Transaction Signing** | Implement digital signatures with X.509 certificates |
| **Block Structure** | Store events in Fabric blocks with proper headers |
| **World State** | Use CouchDB/LevelDB for current state |
| **History Database** | Enable historical query capabilities |
| **Event Hub** | Real-time event notifications from chaincode |

## Future Implementation Roadmap

### Phase 1: Foundation (Current)
- ✅ Data models and TypeScript interfaces
- ✅ Hash generation and chain linking
- ✅ PostgreSQL storage
- ✅ REST API endpoints
- ✅ Chain verification algorithms
- ✅ Export functionality

### Phase 2: Hyperledger Integration (Q2 2024)
- Deploy Hyperledger Fabric test network
- Develop chaincode for event recording
- Implement transaction submission via Fabric SDK
- Set up certificate authority
- Configure channels and access control

### Phase 3: Production Deployment (Q3 2024)
- Multi-organization setup
- Production consensus configuration
- High availability and load balancing
- Backup and disaster recovery
- Performance optimization

### Phase 4: Advanced Features (Q4 2024)
- Smart contract-based validation rules
- Automated compliance checking
- Cross-organization visibility controls
- Advanced analytics on blockchain data
- Integration with IoT platforms

## Performance Considerations

### Current Performance
- **Event recording**: ~200ms (database write)
- **Chain verification**: ~500ms for 100 events
- **Query operations**: ~100ms with indexes
- **Export generation**: ~1s for 1000 events

### Expected Hyperledger Performance
- **Transaction throughput**: 1000-3000 TPS
- **Transaction latency**: 2-5 seconds (including consensus)
- **Query performance**: Similar to current (world state queries)
- **Historical queries**: Slower (requires block iteration)

## Security Considerations

### Current Implementation
- ✅ SHA-256 cryptographic hashing
- ✅ Chain integrity verification
- ✅ Immutable event records (no UPDATE queries)
- ✅ Authentication required for all operations
- ⚠️ Centralized database (single point of trust)
- ⚠️ No digital signatures on events

### Hyperledger Implementation
- ✅ X.509 certificate-based authentication
- ✅ Digital signatures on all transactions
- ✅ Distributed trust (multiple organizations)
- ✅ Private data collections
- ✅ Channel-based access control
- ✅ Endorsement policies (multi-party approval)

## Testing and Validation

```typescript
// Example: Verify chain integrity
const result = await hyperledgerService.verifyChain(shipmentId);

console.assert(result.isValid === true, 'Chain should be valid');
console.assert(result.brokenLinks.length === 0, 'No broken links');
console.assert(result.invalidHashes.length === 0, 'All hashes valid');

// Example: Verify individual event
const event = await hyperledgerService.getEvent(eventId);
const verification = await hyperledgerService.verifyEvent(eventId);

console.assert(verification.hashValid === true, 'Hash should be valid');
console.assert(verification.chainValid === true, 'Chain link should be valid');
```

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [SHA-256 Specification](https://en.wikipedia.org/wiki/SHA-2)
- [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
