# Blockchain Traceability System

## Overview

The NuclearFlow blockchain traceability system provides immutable, cryptographically-verified tracking of nuclear material shipments throughout their entire lifecycle. Built on Hyperledger Fabric principles, the system ensures data integrity, chain-of-custody verification, and comprehensive audit trails for regulatory compliance.

## Purpose

- **Immutability**: All shipment events are cryptographically hashed and linked in a blockchain-style chain
- **Transparency**: Complete visibility into shipment lifecycle from creation to delivery
- **Compliance**: Automated audit trail generation for regulatory requirements (IAEA, NRC)
- **Security**: SHA-256 hashing with chain verification prevents tampering
- **Traceability**: Track 21 different event types across the shipment journey

## Key Features

### 🔗 Blockchain-Style Chain Linking
- Each event is cryptographically linked to the previous event via hash chains
- Genesis hash establishes the start of each shipment's chain
- Verification tools detect any tampering or broken links

### 📊 21 Event Types
Track comprehensive shipment lifecycle events:
- **Creation**: `shipment_created`
- **Transport**: `dispatch`, `pickup`, `in_transit`, `checkpoint`, `handover`
- **Customs**: `customs_check`, `customs_cleared`, `customs_hold`
- **Monitoring**: `temperature_reading`, `humidity_reading`, `radiation_check`, `temperature_alert`
- **Location**: `location_update`
- **Delivery**: `delivery`, `receipt_confirmation`
- **Documentation**: `document_generated`, `document_signed`
- **Compliance**: `compliance_verified`, `alert_triggered`, `status_change`

### 🔐 Data Integrity
- **SHA-256 Hashing**: Every event generates a cryptographic hash
- **Chain Verification**: Real-time integrity checking
- **Merkle Root Support**: Efficient batch verification
- **Transaction Hashes**: Unique identifiers for blockchain transactions

### 📡 Real-Time Tracking
- IoT sensor integration for automated event recording
- GPS location tracking with coordinates
- Temperature, humidity, and radiation monitoring
- Automated alerts for threshold violations

### 📄 Export & Audit
- Export audit trails in JSON, CSV, or PDF formats
- Blockchain-verified digital signatures
- Complete event timeline with metadata
- Regulatory-compliant documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ UI Components│  │  API Routes  │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│            Blockchain Service Layer                           │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ Event Recorder   │  │  Hash Service    │                  │
│  │  - Record events │  │  - SHA-256 hash  │                  │
│  │  - Link chains   │  │  - Merkle root   │                  │
│  └──────────────────┘  └──────────────────┘                  │
│                                                               │
│  ┌──────────────────────────────────────────┐                │
│  │     Hyperledger Service                  │                │
│  │  - Chain verification                    │                │
│  │  - Event querying                        │                │
│  │  - Statistics                            │                │
│  └──────────────────────────────────────────┘                │
└───────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│              Data Persistence Layer                           │
│  ┌────────────────────────────────────────┐                  │
│  │         PostgreSQL (Supabase)          │                  │
│  │  - blockchain_events table             │                  │
│  │  - chain_verifications table           │                  │
│  └────────────────────────────────────────┘                  │
└───────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Models** (`models/blockchain.model.ts`)
- TypeScript interfaces for all blockchain data types
- Event types, actors, locations, verification results
- 21 event type definitions with metadata structures

**Services** (`services/blockchain/`)
- `hyperledger.service.ts`: Main blockchain operations
- `event-recorder.service.ts`: Helper methods for specific event types
- `hash.service.ts`: Cryptographic hashing utilities

**API Routes** (`app/api/traceability/`)
- `/events`: Record and list events
- `/search`: Advanced event search with filters
- `/stats`: Chain statistics
- `/verify`: Hash and transaction verification
- `/shipments/[id]/events`: Get shipment events
- `/shipments/[id]/verify`: Verify shipment chain
- `/shipments/[id]/export`: Export audit trails

**UI Components** (`components/traceability/`)
- Event timeline visualization
- Chain verification badges
- Real-time event feed
- Export functionality
- Hash verifier tools

**Utils** (`lib/traceability-utils.ts`)
- Hash generation and verification
- Chain integrity checking
- Export utilities (JSON, CSV, PDF)
- Event formatting and display

## Quick Start Guide

### 1. Recording an Event

```typescript
// POST /api/traceability/events
const response = await fetch('/api/traceability/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shipmentId: 'uuid-here',
    eventType: 'checkpoint',
    actor: {
      id: 'user-123',
      type: 'user',
      name: 'John Smith',
      role: 'Inspector',
      organization: 'IAEA'
    },
    location: {
      name: 'Port of Rotterdam',
      type: 'checkpoint',
      coordinates: { latitude: 51.9225, longitude: 4.47917 },
      country: 'Netherlands',
      countryCode: 'NL'
    },
    metadata: {
      checkpointId: 'checkpoint-001',
      notes: 'Routine inspection completed'
    }
  })
});

const result = await response.json();
console.log(result.data); // Returns recorded event with hash and transaction details
```

### 2. Viewing Shipment Events

```typescript
// GET /api/traceability/shipments/[shipmentId]/events
const response = await fetch(`/api/traceability/shipments/${shipmentId}/events`);
const result = await response.json();

console.log(result.data.eventCount); // Number of events
console.log(result.data.chainIntegrity); // Verification status
console.log(result.data.events); // Array of all events
```

### 3. Verifying Chain Integrity

```typescript
// POST /api/traceability/shipments/[shipmentId]/verify
const response = await fetch(`/api/traceability/shipments/${shipmentId}/verify`, {
  method: 'POST'
});

const result = await response.json();
console.log(result.data.isValid); // true if chain is valid
console.log(result.data.brokenLinks); // Array of broken link IDs
console.log(result.data.invalidHashes); // Array of invalid hash IDs
```

### 4. Exporting Audit Trail

```typescript
// GET /api/traceability/shipments/[shipmentId]/export?format=json
const response = await fetch(
  `/api/traceability/shipments/${shipmentId}/export?format=json`
);

// Download the file
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `audit_trail_${shipmentId}.json`;
a.click();
```

### 5. Searching Events

```typescript
// GET /api/traceability/search
const params = new URLSearchParams({
  eventType: 'temperature_alert',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  verified: 'true',
  page: '1',
  pageSize: '30'
});

const response = await fetch(`/api/traceability/search?${params}`);
const result = await response.json();

console.log(result.data.events); // Filtered events
console.log(result.pagination); // Pagination metadata
```

## Documentation Structure

- **[README.md](./README.md)** (this file) - System overview and quick start
- **[API.md](./API.md)** - Complete API endpoint documentation
- **[BLOCKCHAIN.md](./BLOCKCHAIN.md)** - Blockchain implementation details
- **[EVENTS.md](./EVENTS.md)** - Event types and data structures
- **[INTEGRATION.md](./INTEGRATION.md)** - Integration guide for external systems
- **[SECURITY.md](./SECURITY.md)** - Security considerations and best practices

## Technology Stack

- **Backend**: Next.js 14+ API Routes (TypeScript)
- **Database**: PostgreSQL via Supabase
- **Hashing**: Node.js `crypto` module (SHA-256)
- **Validation**: Zod schemas
- **Authentication**: Supabase Auth
- **Blockchain Model**: Hyperledger Fabric principles (currently mocked)

## Current Status

### ✅ Implemented
- Complete event recording system with 21 event types
- SHA-256 cryptographic hashing
- Chain linking and verification
- Full REST API with authentication
- Event querying with filters
- Chain statistics and analytics
- Export to JSON, CSV, PDF formats
- Real-time UI components
- Comprehensive TypeScript types

### 🚧 In Development
- Actual Hyperledger Fabric integration
- Digital signature verification
- Webhooks for event notifications
- Advanced analytics dashboard
- Mobile app integration

### 📋 Planned
- Multi-organization support
- Smart contract integration
- Decentralized storage (IPFS)
- Advanced cryptographic features
- AI-powered anomaly detection

## Support

For questions, issues, or contributions:
- Review the [API documentation](./API.md)
- Check the [integration guide](./INTEGRATION.md)
- Review [security best practices](./SECURITY.md)
- Consult [event type definitions](./EVENTS.md)
- Understand [blockchain mechanics](./BLOCKCHAIN.md)

## License

Proprietary - NuclearFlow Traceability System
