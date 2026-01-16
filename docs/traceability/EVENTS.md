# Event Types and Structures

## Overview

The blockchain traceability system supports 21 distinct event types that capture the complete lifecycle of nuclear material shipments. Each event type has specific metadata structures and use cases.

## Event Type Enumeration

```typescript
type BlockchainEventType =
  | 'shipment_created'
  | 'dispatch'
  | 'pickup'
  | 'in_transit'
  | 'checkpoint'
  | 'customs_check'
  | 'customs_cleared'
  | 'customs_hold'
  | 'temperature_reading'
  | 'temperature_alert'
  | 'humidity_reading'
  | 'radiation_check'
  | 'location_update'
  | 'handover'
  | 'delivery'
  | 'receipt_confirmation'
  | 'document_generated'
  | 'document_signed'
  | 'compliance_verified'
  | 'alert_triggered'
  | 'status_change';
```

## Core Data Structures

### EventActor

The entity performing or triggering the event.

```typescript
interface EventActor {
  id: string;                    // Unique identifier for the actor
  type: ActorType;               // Type of actor
  name: string;                  // Human-readable name
  role?: string;                 // Optional role (e.g., "Inspector", "Driver")
  organization?: string;         // Optional organization name
  deviceId?: string;             // Optional device ID for IoT sensors
}

type ActorType = 
  | 'user'         // Human user (inspector, driver, recipient)
  | 'system'       // Automated system action
  | 'iot_sensor'   // IoT device (temperature, radiation sensor)
  | 'api';         // External API integration
```

**Examples**:
```typescript
// Human inspector
{
  id: "user-123",
  type: "user",
  name: "Jane Smith",
  role: "Nuclear Inspector",
  organization: "IAEA"
}

// IoT temperature sensor
{
  id: "sensor-temp-001",
  type: "iot_sensor",
  name: "Temperature Sensor Alpha",
  deviceId: "TMP-SENSOR-001"
}

// System automation
{
  id: "system",
  type: "system",
  name: "NuclearFlow Platform"
}
```

### EventLocation

The physical or logical location where the event occurred.

```typescript
interface EventLocation {
  name: string;                  // Location name
  type: LocationType;            // Type of location
  coordinates?: {                // Optional GPS coordinates
    latitude: number;
    longitude: number;
  };
  address?: string;              // Optional physical address
  country?: string;              // Optional country name
  countryCode?: string;          // Optional ISO country code
}

type LocationType =
  | 'facility'      // Origin or destination facility
  | 'checkpoint'    // Inspection or border checkpoint
  | 'vehicle'       // Transport vehicle (truck, ship, plane)
  | 'port'          // Seaport or airport
  | 'customs'       // Customs facility
  | 'destination'   // Final destination
  | 'unknown';      // Unknown or unspecified
```

**Examples**:
```typescript
// Facility
{
  name: "Oak Ridge National Laboratory",
  type: "facility",
  coordinates: { latitude: 35.9307, longitude: -84.3099 },
  address: "1 Bethel Valley Rd, Oak Ridge, TN 37830",
  country: "United States",
  countryCode: "US"
}

// Checkpoint
{
  name: "Port of Rotterdam Checkpoint",
  type: "checkpoint",
  coordinates: { latitude: 51.9225, longitude: 4.47917 },
  country: "Netherlands",
  countryCode: "NL"
}

// In-transit vehicle
{
  name: "In Transit",
  type: "vehicle",
  coordinates: { latitude: 40.7128, longitude: -74.0060 }
}
```

### Complete BlockchainEvent

```typescript
interface BlockchainEvent {
  id: string;                    // Unique event ID
  shipmentId: string;            // Associated shipment UUID
  eventType: BlockchainEventType; // Event type
  timestamp: Date;               // When event occurred
  actor: EventActor;             // Who/what performed the event
  location: EventLocation;       // Where it occurred
  dataHash: string;              // SHA-256 hash of event data
  previousHash: string;          // Hash of previous event (chain link)
  blockNumber?: number;          // Optional block number
  transactionHash: string;       // Blockchain transaction hash
  metadata: Record<string, unknown>; // Event-specific data
  signature?: string;            // Optional digital signature
  verified: boolean;             // Verification status
  createdAt?: Date;              // Database creation timestamp
  updatedAt?: Date;              // Database update timestamp
}
```

## Event Types and Metadata

### 1. shipment_created

**Description**: Initial event when a shipment is created in the system.

**Typical Actor**: `user` (system administrator) or `system`

**Typical Location**: `facility` (origin facility)

**Metadata Structure**:
```typescript
interface ShipmentCreatedMetadata {
  shipmentNumber: string;        // Unique shipment identifier
  batchNumber: string;           // Batch number
  isotope: string;               // Isotope type (e.g., "Cobalt-60")
  origin: string;                // Origin facility name
  destination: string;           // Destination facility name
  carrier: string;               // Transport carrier name
  initialActivity?: number;      // Initial radioactivity (Becquerels)
}
```

**Example**:
```typescript
{
  eventType: "shipment_created",
  actor: { id: "user-admin", type: "user", name: "Admin User" },
  location: { name: "Oak Ridge Lab", type: "facility" },
  metadata: {
    shipmentNumber: "SHP-2024-001",
    batchNumber: "BATCH-001",
    isotope: "Cobalt-60",
    origin: "Oak Ridge National Laboratory",
    destination: "Memorial Hospital",
    carrier: "SafeNuclear Transport",
    initialActivity: 1000000000
  }
}
```

---

### 2. dispatch

**Description**: Shipment is dispatched from origin facility.

**Typical Actor**: `user` (handler, driver)

**Typical Location**: `facility`

**Metadata Structure**:
```typescript
interface DispatchMetadata {
  facilityId: string;            // Facility identifier
  condition: ShipmentCondition;  // Shipment condition at dispatch
}

interface ShipmentCondition {
  temperature?: number;          // Temperature in Celsius
  humidity?: number;             // Humidity percentage
  radiation?: number;            // Radiation level
  packagingIntegrity: 'intact' | 'damaged' | 'tampered';
  sealsIntact: boolean;
  notes?: string;
}
```

**Example**:
```typescript
{
  eventType: "dispatch",
  actor: { id: "driver-123", type: "user", name: "John Driver", role: "Driver" },
  location: { name: "Oak Ridge Lab", type: "facility" },
  metadata: {
    facilityId: "FAC-001",
    condition: {
      temperature: 20,
      humidity: 45,
      packagingIntegrity: "intact",
      sealsIntact: true,
      notes: "All safety checks passed"
    }
  }
}
```

---

### 3. pickup

**Description**: Shipment is picked up by carrier.

**Typical Actor**: `user` (carrier representative)

**Typical Location**: `facility`

**Metadata Structure**:
```typescript
interface PickupMetadata {
  carrierName: string;
  driverName: string;
  vehicleId: string;
  pickupTime: Date;
  signatureData?: string;        // Base64 encoded signature image
}
```

---

### 4. in_transit

**Description**: Shipment is actively in transit.

**Typical Actor**: `system` or `iot_sensor`

**Typical Location**: `vehicle`

**Metadata Structure**:
```typescript
interface InTransitMetadata {
  vehicleId: string;
  currentSpeed?: number;         // Speed in km/h
  estimatedArrival?: Date;
}
```

---

### 5. checkpoint

**Description**: Shipment passes through a checkpoint.

**Typical Actor**: `user` (inspector)

**Typical Location**: `checkpoint`

**Metadata Structure**:
```typescript
interface CheckpointMetadata {
  checkpointId: string;
  checkpointName: string;
  inspectionDuration?: number;   // Duration in minutes
  notes?: string;
}
```

---

### 6. customs_check

**Description**: Shipment undergoes customs inspection.

**Typical Actor**: `user` (customs officer)

**Typical Location**: `customs`

**Metadata Structure**:
```typescript
interface CustomsCheckMetadata {
  checkpointId: string;
  result: CustomsCheckResult;
}

interface CustomsCheckResult {
  approved: boolean;
  documentsVerified: string[];   // List of verified document types
  inspectionNotes?: string;
  clearanceNumber?: string;
  holdReason?: string;
}
```

---

### 7. customs_cleared

**Description**: Shipment successfully clears customs.

**Typical Actor**: `user` (customs officer)

**Typical Location**: `customs`

**Metadata Structure**:
```typescript
interface CustomsClearedMetadata {
  clearanceNumber: string;
  clearanceTime: Date;
  officerName: string;
}
```

---

### 8. customs_hold

**Description**: Shipment is held at customs.

**Typical Actor**: `user` (customs officer)

**Typical Location**: `customs`

**Metadata Structure**:
```typescript
interface CustomsHoldMetadata {
  holdReason: string;
  expectedResolutionDate?: Date;
  requiredDocuments?: string[];
}
```

---

### 9. temperature_reading

**Description**: Temperature sensor reading (within acceptable range).

**Typical Actor**: `iot_sensor`

**Typical Location**: `vehicle` or `facility`

**Metadata Structure**:
```typescript
interface TemperatureReadingMetadata {
  sensorId: string;
  temperature: number;           // Temperature in Celsius
  threshold: TemperatureThreshold;
  unit: 'celsius' | 'fahrenheit';
  isCompliant: boolean;
}

interface TemperatureThreshold {
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit';
}
```

**Example**:
```typescript
{
  eventType: "temperature_reading",
  actor: { 
    id: "sensor-001", 
    type: "iot_sensor", 
    name: "Temperature Sensor Alpha",
    deviceId: "TMP-SENSOR-001"
  },
  location: { name: "Transport Vehicle", type: "vehicle" },
  metadata: {
    sensorId: "TMP-SENSOR-001",
    temperature: 18.5,
    threshold: { min: -20, max: 25, unit: "celsius" },
    unit: "celsius",
    isCompliant: true
  }
}
```

---

### 10. temperature_alert

**Description**: Temperature reading exceeds acceptable threshold.

**Typical Actor**: `iot_sensor` or `system`

**Typical Location**: `vehicle` or `facility`

**Metadata Structure**: Same as `temperature_reading`, but `isCompliant: false`

---

### 11. humidity_reading

**Description**: Humidity sensor reading.

**Typical Actor**: `iot_sensor`

**Typical Location**: `vehicle` or `facility`

**Metadata Structure**:
```typescript
interface HumidityReadingMetadata {
  sensorId: string;
  humidity: number;              // Relative humidity percentage
  threshold?: {
    min: number;
    max: number;
  };
  isCompliant?: boolean;
}
```

---

### 12. radiation_check

**Description**: Radiation level measurement.

**Typical Actor**: `iot_sensor` or `user`

**Typical Location**: Any

**Metadata Structure**:
```typescript
interface RadiationCheckMetadata {
  sensorId?: string;
  radiationLevel: number;        // Measured in Becquerels or Sieverts
  unit: 'becquerel' | 'sievert' | 'rem';
  expectedLevel?: number;
  variance?: number;             // Difference from expected
  isWithinLimits: boolean;
}
```

---

### 13. location_update

**Description**: GPS location update (automated tracking).

**Typical Actor**: `system` or `iot_sensor`

**Typical Location**: `vehicle` (with coordinates)

**Metadata Structure**:
```typescript
interface LocationUpdateMetadata {
  vehicleId?: string;
  altitude?: number;             // Altitude in meters
  speed?: number;                // Speed in km/h
  heading?: number;              // Heading in degrees (0-360)
}
```

---

### 14. handover

**Description**: Shipment is transferred between parties.

**Typical Actor**: `user`

**Typical Location**: `checkpoint` or `facility`

**Metadata Structure**:
```typescript
interface HandoverMetadata {
  fromParty: string;             // Name of transferring party
  toParty: string;               // Name of receiving party
  handoverTime: Date;
  witnessName?: string;
  signatureData?: string;
}
```

---

### 15. delivery

**Description**: Shipment is delivered to destination.

**Typical Actor**: `user` (driver, recipient)

**Typical Location**: `destination`

**Metadata Structure**:
```typescript
interface DeliveryMetadata {
  deliveryDetails: DeliveryDetails;
}

interface DeliveryDetails {
  signatureData?: string;        // Base64 encoded signature
  signatureName: string;         // Name of person who signed
  deliveryTime: Date;
  recipientOrganization: string;
  notes?: string;
}
```

---

### 16. receipt_confirmation

**Description**: Recipient confirms receipt and condition of shipment.

**Typical Actor**: `user` (recipient)

**Typical Location**: `destination`

**Metadata Structure**:
```typescript
interface ReceiptConfirmationMetadata {
  condition: ReceiptCondition;
}

interface ReceiptCondition {
  packagingCondition: 'good' | 'acceptable' | 'damaged';
  temperatureOnReceipt?: number;
  contentsVerified: boolean;
  discrepanciesNoted?: string;
  acceptanceStatus: 'accepted' | 'rejected' | 'accepted_with_conditions';
}
```

---

### 17. document_generated

**Description**: Compliance or transport document is generated.

**Typical Actor**: `system` or `user`

**Typical Location**: Any

**Metadata Structure**:
```typescript
interface DocumentGeneratedMetadata {
  documentType: string;          // e.g., "Bill of Lading", "Manifest"
  documentId: string;
  documentUrl?: string;
  generatedBy: string;
  generatedAt: Date;
}
```

---

### 18. document_signed

**Description**: Document is digitally signed.

**Typical Actor**: `user`

**Typical Location**: Any

**Metadata Structure**:
```typescript
interface DocumentSignedMetadata {
  documentId: string;
  documentType: string;
  signerName: string;
  signerOrganization: string;
  signatureHash: string;
  signedAt: Date;
}
```

---

### 19. compliance_verified

**Description**: Compliance verification is performed and passed.

**Typical Actor**: `user` (compliance officer) or `system`

**Typical Location**: Any

**Metadata Structure**:
```typescript
interface ComplianceVerifiedMetadata {
  verificationType: string;      // e.g., "IAEA Safeguards", "NRC Compliance"
  verificationStandard: string;  // e.g., "10 CFR 71"
  verifiedBy: string;
  verificationDate: Date;
  certificationNumber?: string;
  expiryDate?: Date;
}
```

---

### 20. alert_triggered

**Description**: Automated alert is triggered (general purpose).

**Typical Actor**: `system` or `iot_sensor`

**Typical Location**: Any

**Metadata Structure**:
```typescript
interface AlertTriggeredMetadata {
  alertType: string;             // e.g., "security", "environmental", "delay"
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertMessage: string;
  triggeredBy: string;
  triggeredAt: Date;
  acknowledged?: boolean;
  acknowledgedBy?: string;
}
```

---

### 21. status_change

**Description**: Shipment status changes (general purpose).

**Typical Actor**: `system` or `user`

**Typical Location**: Any

**Metadata Structure**:
```typescript
interface StatusChangeMetadata {
  oldStatus: string;
  newStatus: string;
  reason?: string;
  changedBy: string;
}
```

## Event Lifecycle

Typical event sequence for a shipment:

```
1. shipment_created       ← Initial creation
2. dispatch               ← Leaves origin
3. pickup                 ← Carrier picks up
4. in_transit            ← Active transport
5. location_update       ← GPS tracking (multiple)
6. temperature_reading   ← Monitoring (multiple)
7. checkpoint            ← Border crossing
8. customs_check         ← Customs inspection
9. customs_cleared       ← Customs approval
10. in_transit           ← Continue transport
11. delivery             ← Arrives at destination
12. receipt_confirmation ← Recipient confirms
```

## Chain Linking Mechanism

Each event is cryptographically linked to the previous event:

```typescript
// Event 1 (Genesis)
{
  id: "evt-001",
  eventType: "shipment_created",
  dataHash: "abc123...",
  previousHash: "genesis_550e8400-e29b-41d4-a716-446655440000"
}

// Event 2
{
  id: "evt-002",
  eventType: "dispatch",
  dataHash: "def456...",
  previousHash: "abc123..."  // ← Links to Event 1's dataHash
}

// Event 3
{
  id: "evt-003",
  eventType: "checkpoint",
  dataHash: "ghi789...",
  previousHash: "def456..."  // ← Links to Event 2's dataHash
}
```

## Querying Events

```typescript
// Get all events for a shipment
const events = await hyperledgerService.getShipmentEvents(shipmentId);

// Filter by event type
const alerts = await hyperledgerService.queryEvents({
  shipmentId,
  eventType: ['temperature_alert', 'alert_triggered']
});

// Filter by actor type
const iotReadings = await hyperledgerService.queryEvents({
  shipmentId,
  actorType: 'iot_sensor'
});

// Filter by date range
const recentEvents = await hyperledgerService.queryEvents({
  shipmentId,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});
```

## Validation Rules

- ✅ `shipmentId` must be a valid UUID
- ✅ `eventType` must be one of the 21 defined types
- ✅ `actor.type` must be one of: user, system, iot_sensor, api
- ✅ `location.type` must be one of: facility, checkpoint, vehicle, port, customs, destination, unknown
- ✅ `timestamp` is automatically set to current time
- ✅ `dataHash` is automatically generated from event data
- ✅ `previousHash` is automatically retrieved from previous event
- ✅ `transactionHash` is automatically generated

## Best Practices

1. **Choose appropriate event type**: Use the most specific event type available
2. **Include rich metadata**: Provide as much context as possible
3. **Use consistent actor IDs**: Maintain consistent actor identifiers across events
4. **Provide GPS coordinates**: Include coordinates for location_update events
5. **Set thresholds**: Define thresholds for sensor readings
6. **Link related events**: Use metadata to cross-reference related events
7. **Record timestamps accurately**: Ensure accurate time synchronization
8. **Validate before recording**: Validate all data before submitting to API

## See Also

- [API.md](./API.md) - API endpoint documentation
- [BLOCKCHAIN.md](./BLOCKCHAIN.md) - Blockchain mechanics
- [INTEGRATION.md](./INTEGRATION.md) - Integration examples
