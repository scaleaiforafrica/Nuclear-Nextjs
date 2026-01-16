# Traceability API Documentation

## Overview

The Traceability API provides RESTful endpoints for recording, querying, and verifying blockchain events in the NuclearFlow system. All endpoints require authentication via Supabase Auth.

**Base URL**: `/api/traceability`

## Authentication

All API endpoints require a valid authentication token. Include the token in your request headers:

```http
Authorization: Bearer <your-auth-token>
```

Authentication is handled via Supabase Auth. Unauthorized requests return:

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "You must be logged in to access this endpoint",
  "timestamp": "2024-01-16T12:00:00.000Z"
}
```

## Standard Response Envelope

All API responses follow this standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;        // Request success status
  message: string;         // Human-readable message
  data?: T;               // Response data (if successful)
  error?: string;         // Error message (if failed)
  pagination?: {          // Pagination metadata (for list endpoints)
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;      // ISO 8601 timestamp
}
```

## Endpoints

### 1. Record Event

Record a new blockchain event for a shipment.

**Endpoint**: `POST /api/traceability/events`

**Request Body**:
```json
{
  "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "checkpoint",
  "actor": {
    "id": "user-123",
    "type": "user",
    "name": "John Smith",
    "role": "Inspector",
    "organization": "IAEA",
    "deviceId": null
  },
  "location": {
    "name": "Port of Rotterdam",
    "type": "checkpoint",
    "coordinates": {
      "latitude": 51.9225,
      "longitude": 4.47917
    },
    "address": "Wilhelminakade 909, 3072 AP Rotterdam",
    "country": "Netherlands",
    "countryCode": "NL"
  },
  "metadata": {
    "checkpointId": "checkpoint-001",
    "inspectionDuration": 45,
    "notes": "Routine inspection completed"
  },
  "signature": "optional-digital-signature"
}
```

**Request Schema**:
```typescript
{
  shipmentId: string;              // UUID format required
  eventType: BlockchainEventType;  // One of 21 valid event types
  actor: {
    id: string;
    type: 'user' | 'system' | 'iot_sensor' | 'api';
    name: string;
    role?: string;
    organization?: string;
    deviceId?: string;
  };
  location: {
    name: string;
    type: 'facility' | 'checkpoint' | 'vehicle' | 'port' | 'customs' | 'destination' | 'unknown';
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    address?: string;
    country?: string;
    countryCode?: string;
  };
  metadata?: Record<string, any>;  // Optional custom data
  signature?: string;               // Optional digital signature
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Event recorded successfully on blockchain",
  "data": {
    "id": "evt-789abc",
    "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
    "eventType": "checkpoint",
    "timestamp": "2024-01-16T12:30:00.000Z",
    "actor": { /* actor object */ },
    "location": { /* location object */ },
    "dataHash": "a3f5e8d9c2b1a4e6f7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0",
    "previousHash": "b4e6f9c3d2e1f5a7d8e9f0c1d2e3f4a5e6f7d8e9f0c1d2e3f4a5e6f7d8e9f0c1",
    "transactionHash": "0xc5d7a1e3f5b9d0e2f4a6c8e0f2d4a6e8f0c2d4e6f8a0c2e4f6a8c0e2f4a6c8e0",
    "blockNumber": null,
    "metadata": { /* metadata object */ },
    "signature": null,
    "verified": false,
    "createdAt": "2024-01-16T12:30:00.000Z",
    "updatedAt": "2024-01-16T12:30:00.000Z"
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "shipmentId: Invalid shipment ID, eventType: Invalid event type",
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

### 2. List Events

Get a paginated list of blockchain events with optional filters.

**Endpoint**: `GET /api/traceability/events`

**Query Parameters**:
- `shipmentId` (string, optional): Filter by shipment ID
- `eventType` (string, optional): Filter by event type
- `actorId` (string, optional): Filter by actor ID
- `actorType` (string, optional): Filter by actor type (user, system, iot_sensor, api)
- `locationType` (string, optional): Filter by location type
- `startDate` (ISO 8601, optional): Filter events after this date
- `endDate` (ISO 8601, optional): Filter events before this date
- `verified` (boolean, optional): Filter by verification status
- `page` (integer, optional, default: 1): Page number
- `pageSize` (integer, optional, default: 30, max: 100): Items per page

**Example Request**:
```http
GET /api/traceability/events?shipmentId=550e8400-e29b-41d4-a716-446655440000&page=1&pageSize=30
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Events fetched successfully",
  "data": [
    {
      "id": "evt-123",
      "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
      "eventType": "shipment_created",
      "timestamp": "2024-01-15T08:00:00.000Z",
      "actor": { /* actor object */ },
      "location": { /* location object */ },
      "dataHash": "abc123...",
      "previousHash": "genesis-hash",
      "transactionHash": "0x123...",
      "verified": true
    }
    // ... more events
  ],
  "pagination": {
    "page": 1,
    "pageSize": 30,
    "totalItems": 45,
    "totalPages": 2
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

### 3. Search Events

Advanced event search with multiple filters and pagination.

**Endpoint**: `GET /api/traceability/search`

**Query Parameters**:
- Same as List Events, plus:
- `eventTypes` (string, optional): Comma-separated list of event types

**Example Request**:
```http
GET /api/traceability/search?eventTypes=temperature_alert,radiation_check&startDate=2024-01-01T00:00:00Z&page=1&pageSize=30
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Found 12 matching events",
  "data": {
    "events": [
      {
        "id": "evt-456",
        "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
        "eventType": "temperature_alert",
        "timestamp": "2024-01-16T10:15:00.000Z",
        "metadata": {
          "temperature": 28.5,
          "threshold": { "min": -20, "max": 25 },
          "isCompliant": false
        }
      }
      // ... more events
    ],
    "pagination": {
      "page": 1,
      "pageSize": 30,
      "totalItems": 12,
      "totalPages": 1
    }
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Invalid pagination parameters",
  "error": "Page must be >= 1 and pageSize must be between 1 and 100",
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

### 4. Get Chain Statistics

Retrieve blockchain statistics and metrics.

**Endpoint**: `GET /api/traceability/stats`

**Example Request**:
```http
GET /api/traceability/stats
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Chain statistics fetched successfully",
  "data": {
    "totalEvents": 1247,
    "totalShipments": 89,
    "eventsToday": 23,
    "verificationRate": 0.95,
    "averageEventsPerShipment": 14.01,
    "chainIntegrityPercentage": 95.0,
    "eventsByType": {
      "shipment_created": 89,
      "dispatch": 89,
      "checkpoint": 234,
      "temperature_reading": 445,
      "temperature_alert": 12,
      "delivery": 78,
      "receipt_confirmation": 75,
      // ... other event types
    },
    "lastBlockNumber": 1247,
    "lastBlockTime": "2024-01-16T12:25:00.000Z"
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

### 5. Verify Hash

Verify data hash or transaction hash.

**Endpoint**: `POST /api/traceability/verify`

**Request Body** (Option 1 - Verify data against hash):
```json
{
  "data": {
    "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
    "eventType": "checkpoint",
    "actor": { /* actor object */ },
    "location": { /* location object */ },
    "metadata": { /* metadata object */ },
    "timestamp": "2024-01-16T12:30:00.000Z"
  },
  "expectedHash": "a3f5e8d9c2b1a4e6f7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0"
}
```

**Request Body** (Option 2 - Verify transaction exists):
```json
{
  "transactionHash": "0xc5d7a1e3f5b9d0e2f4a6c8e0f2d4a6e8f0c2d4e6f8a0c2e4f6a8c0e2f4a6c8e0"
}
```

**Request Body** (Option 3 - Compare two hashes):
```json
{
  "dataHash": "abc123...",
  "expectedHash": "abc123..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Hash verification successful",
  "data": {
    "isValid": true,
    "expectedHash": "a3f5e8d9c2b1a4e6f7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0",
    "calculatedHash": "a3f5e8d9c2b1a4e6f7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7b8a9e0"
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

### 6. Get Shipment Events

Get all events for a specific shipment with chain integrity verification.

**Endpoint**: `GET /api/traceability/shipments/[shipmentId]/events`

**Path Parameters**:
- `shipmentId` (UUID): The shipment ID

**Example Request**:
```http
GET /api/traceability/shipments/550e8400-e29b-41d4-a716-446655440000/events
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Shipment events fetched successfully",
  "data": {
    "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
    "eventCount": 8,
    "chainIntegrity": {
      "isValid": true,
      "brokenLinks": [],
      "invalidHashes": [],
      "message": "Chain integrity verified"
    },
    "events": [
      {
        "id": "evt-001",
        "eventType": "shipment_created",
        "timestamp": "2024-01-15T08:00:00.000Z",
        // ... full event details
      }
      // ... more events in chronological order
    ]
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "Shipment not found",
  "error": "No shipment found with ID: 550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

### 7. Verify Shipment Chain

Verify the complete blockchain chain for a shipment.

**Endpoint**: `POST /api/traceability/shipments/[shipmentId]/verify`

**Path Parameters**:
- `shipmentId` (UUID): The shipment ID

**Example Request**:
```http
POST /api/traceability/shipments/550e8400-e29b-41d4-a716-446655440000/verify
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Chain verified successfully - all events are valid",
  "data": {
    "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
    "isValid": true,
    "eventCount": 8,
    "firstEvent": "2024-01-15T08:00:00.000Z",
    "lastEvent": "2024-01-16T12:00:00.000Z",
    "brokenLinks": [],
    "invalidHashes": [],
    "verifiedAt": "2024-01-16T12:30:00.000Z"
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

**Failed Verification Response** (200):
```json
{
  "success": false,
  "message": "Chain verification failed - integrity issues detected",
  "data": {
    "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
    "isValid": false,
    "eventCount": 8,
    "firstEvent": "2024-01-15T08:00:00.000Z",
    "lastEvent": "2024-01-16T12:00:00.000Z",
    "brokenLinks": ["evt-456", "evt-789"],
    "invalidHashes": ["evt-123"],
    "verifiedAt": "2024-01-16T12:30:00.000Z"
  },
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

### 8. Export Audit Trail

Export shipment audit trail in JSON, CSV, or PDF format.

**Endpoint**: `GET /api/traceability/shipments/[shipmentId]/export`

**Path Parameters**:
- `shipmentId` (UUID): The shipment ID

**Query Parameters**:
- `format` (string, required): Export format (`json`, `csv`, or `pdf`)

**Example Request**:
```http
GET /api/traceability/shipments/550e8400-e29b-41d4-a716-446655440000/export?format=json
```

**Success Response** (200):
Returns file download with appropriate Content-Type and Content-Disposition headers.

**JSON Format**:
```json
{
  "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
  "exportDate": "2024-01-16T12:30:00.000Z",
  "eventCount": 8,
  "events": [
    {
      "id": "evt-001",
      "eventType": "shipment_created",
      "timestamp": "2024-01-15T08:00:00.000Z",
      "actor": { /* actor details */ },
      "location": { /* location details */ },
      "dataHash": "abc123...",
      "previousHash": "genesis-hash",
      "transactionHash": "0x123...",
      "metadata": { /* metadata */ },
      "verified": true
    }
    // ... more events
  ]
}
```

**CSV Format**:
```csv
Event ID,Shipment ID,Event Type,Timestamp,Actor ID,Actor Name,Location Name,Transaction Hash,Data Hash,Verified
"evt-001","550e8400-e29b-41d4-a716-446655440000","shipment_created","2024-01-15T08:00:00.000Z","user-123","John Smith","NuclearFlow Platform","0x123...","abc123...","Yes"
```

**PDF Format**:
Returns a formatted PDF document with:
- Report header with shipment details
- Complete event timeline
- Hash values for verification
- Chain integrity status
- Digital signature information

**Error Response** (400):
```json
{
  "success": false,
  "message": "Invalid format",
  "error": "Format must be one of: json, csv, pdf",
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

---

## Rate Limiting

Currently, no rate limiting is enforced. Future versions will implement:
- 1000 requests per hour per user
- 100 POST requests per hour per user
- Exponential backoff on 429 responses

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request (resource created)
- `400 Bad Request`: Validation error or invalid parameters
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

### Error Response Format

All error responses include:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error information",
  "timestamp": "2024-01-16T12:30:00.000Z"
}
```

## Best Practices

1. **Always verify authentication**: Include valid Bearer token in all requests
2. **Handle pagination**: Use `page` and `pageSize` parameters for large datasets
3. **Validate input**: Use the provided schemas to validate data before sending
4. **Check chain integrity**: Regularly verify shipment chains using the verify endpoint
5. **Export for archival**: Periodically export audit trails for compliance
6. **Monitor statistics**: Use stats endpoint for system health monitoring
7. **Retry on failure**: Implement exponential backoff for 5xx errors
8. **Store transaction hashes**: Keep transaction hashes for future verification

## Code Examples

See [INTEGRATION.md](./INTEGRATION.md) for complete integration examples in TypeScript.
