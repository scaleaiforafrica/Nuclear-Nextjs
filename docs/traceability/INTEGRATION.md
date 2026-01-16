# Integration Guide for External Systems

## Overview

This guide provides comprehensive instructions for integrating external systems with the NuclearFlow blockchain traceability API. Whether you're building an IoT sensor integration, a mobile app, or connecting an existing ERP system, this guide will help you get started.

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [Recording Events](#recording-events)
3. [Querying Events](#querying-events)
4. [Verifying Chain Integrity](#verifying-chain-integrity)
5. [Export and Reporting](#export-and-reporting)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

## Authentication Setup

### 1. Obtain API Credentials

Contact your NuclearFlow administrator to obtain API credentials:
- User account with appropriate permissions
- API authentication token (JWT)

### 2. Configure Authentication

```typescript
// authentication.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign in and get session token
export async function authenticate(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  return data.session?.access_token;
}

// Get current session token
export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}
```

### 3. Making Authenticated Requests

```typescript
// api-client.ts
import { getAuthToken } from './authentication';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-domain.com';

export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}
```

## Recording Events

### Basic Event Recording

```typescript
// traceability-client.ts
import { makeAuthenticatedRequest } from './api-client';
import type { 
  CreateBlockchainEventInput, 
  RecordedEvent 
} from '@/models/blockchain.model';

export class TraceabilityClient {
  /**
   * Record a new blockchain event
   */
  async recordEvent(input: CreateBlockchainEventInput): Promise<RecordedEvent> {
    return makeAuthenticatedRequest<RecordedEvent>(
      '/api/traceability/events',
      {
        method: 'POST',
        body: JSON.stringify(input)
      }
    );
  }

  /**
   * Record shipment creation
   */
  async recordShipmentCreated(
    shipmentId: string,
    shipmentData: {
      shipmentNumber: string;
      batchNumber: string;
      isotope: string;
      origin: string;
      destination: string;
      carrier: string;
    }
  ): Promise<RecordedEvent> {
    return this.recordEvent({
      shipmentId,
      eventType: 'shipment_created',
      actor: {
        id: 'system',
        type: 'system',
        name: 'NuclearFlow Platform'
      },
      location: {
        name: shipmentData.origin,
        type: 'facility'
      },
      metadata: shipmentData
    });
  }

  /**
   * Record temperature reading from IoT sensor
   */
  async recordTemperatureReading(
    shipmentId: string,
    sensorId: string,
    temperature: number,
    location: {
      latitude: number;
      longitude: number;
    }
  ): Promise<RecordedEvent> {
    const threshold = { min: -20, max: 25, unit: 'celsius' as const };
    const isCompliant = temperature >= threshold.min && temperature <= threshold.max;

    return this.recordEvent({
      shipmentId,
      eventType: isCompliant ? 'temperature_reading' : 'temperature_alert',
      actor: {
        id: sensorId,
        type: 'iot_sensor',
        name: `Temperature Sensor ${sensorId}`,
        deviceId: sensorId
      },
      location: {
        name: 'In Transit',
        type: 'vehicle',
        coordinates: location
      },
      metadata: {
        sensorId,
        temperature,
        threshold,
        unit: 'celsius',
        isCompliant
      }
    });
  }

  /**
   * Record GPS location update
   */
  async recordLocationUpdate(
    shipmentId: string,
    latitude: number,
    longitude: number,
    vehicleId?: string
  ): Promise<RecordedEvent> {
    return this.recordEvent({
      shipmentId,
      eventType: 'location_update',
      actor: {
        id: vehicleId || 'system',
        type: 'system',
        name: vehicleId ? `Vehicle ${vehicleId}` : 'GPS System'
      },
      location: {
        name: 'In Transit',
        type: 'vehicle',
        coordinates: { latitude, longitude }
      },
      metadata: {
        vehicleId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Record checkpoint passage
   */
  async recordCheckpoint(
    shipmentId: string,
    checkpointName: string,
    inspector: {
      id: string;
      name: string;
      organization: string;
    },
    location: {
      name: string;
      coordinates?: { latitude: number; longitude: number };
      country?: string;
    },
    notes?: string
  ): Promise<RecordedEvent> {
    return this.recordEvent({
      shipmentId,
      eventType: 'checkpoint',
      actor: {
        id: inspector.id,
        type: 'user',
        name: inspector.name,
        role: 'Inspector',
        organization: inspector.organization
      },
      location: {
        name: location.name,
        type: 'checkpoint',
        coordinates: location.coordinates,
        country: location.country
      },
      metadata: {
        checkpointName,
        notes
      }
    });
  }

  /**
   * Record delivery
   */
  async recordDelivery(
    shipmentId: string,
    recipient: {
      id: string;
      name: string;
      organization: string;
    },
    signatureName: string,
    notes?: string
  ): Promise<RecordedEvent> {
    return this.recordEvent({
      shipmentId,
      eventType: 'delivery',
      actor: {
        id: recipient.id,
        type: 'user',
        name: recipient.name,
        organization: recipient.organization
      },
      location: {
        name: recipient.organization,
        type: 'destination'
      },
      metadata: {
        deliveryDetails: {
          signatureName,
          deliveryTime: new Date(),
          recipientOrganization: recipient.organization,
          notes
        }
      }
    });
  }
}
```

## Querying Events

### Get Shipment Events

```typescript
export class TraceabilityClient {
  /**
   * Get all events for a shipment
   */
  async getShipmentEvents(shipmentId: string) {
    return makeAuthenticatedRequest(
      `/api/traceability/shipments/${shipmentId}/events`
    );
  }

  /**
   * Search events with filters
   */
  async searchEvents(filters: {
    shipmentId?: string;
    eventType?: string | string[];
    actorType?: 'user' | 'system' | 'iot_sensor' | 'api';
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const params = new URLSearchParams();

    if (filters.shipmentId) params.append('shipmentId', filters.shipmentId);
    if (filters.eventType) {
      if (Array.isArray(filters.eventType)) {
        params.append('eventTypes', filters.eventType.join(','));
      } else {
        params.append('eventType', filters.eventType);
      }
    }
    if (filters.actorType) params.append('actorType', filters.actorType);
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    return makeAuthenticatedRequest(
      `/api/traceability/search?${params.toString()}`
    );
  }

  /**
   * Get chain statistics
   */
  async getChainStats() {
    return makeAuthenticatedRequest('/api/traceability/stats');
  }

  /**
   * Get IoT sensor readings
   */
  async getSensorReadings(shipmentId: string) {
    return this.searchEvents({
      shipmentId,
      actorType: 'iot_sensor',
      eventType: ['temperature_reading', 'humidity_reading', 'radiation_check']
    });
  }

  /**
   * Get temperature alerts
   */
  async getTemperatureAlerts(shipmentId: string) {
    return this.searchEvents({
      shipmentId,
      eventType: 'temperature_alert'
    });
  }
}
```

## Verifying Chain Integrity

### Verify Shipment Chain

```typescript
export class TraceabilityClient {
  /**
   * Verify complete chain for a shipment
   */
  async verifyShipmentChain(shipmentId: string) {
    return makeAuthenticatedRequest(
      `/api/traceability/shipments/${shipmentId}/verify`,
      { method: 'POST' }
    );
  }

  /**
   * Verify hash
   */
  async verifyHash(data: unknown, expectedHash: string) {
    return makeAuthenticatedRequest(
      '/api/traceability/verify',
      {
        method: 'POST',
        body: JSON.stringify({ data, expectedHash })
      }
    );
  }

  /**
   * Verify transaction exists
   */
  async verifyTransaction(transactionHash: string) {
    return makeAuthenticatedRequest(
      '/api/traceability/verify',
      {
        method: 'POST',
        body: JSON.stringify({ transactionHash })
      }
    );
  }

  /**
   * Check if shipment chain is valid
   */
  async isChainValid(shipmentId: string): Promise<boolean> {
    try {
      const result = await this.verifyShipmentChain(shipmentId);
      return result.data.isValid;
    } catch (error) {
      console.error('Chain verification failed:', error);
      return false;
    }
  }
}
```

## Export and Reporting

### Export Audit Trails

```typescript
export class TraceabilityClient {
  /**
   * Export audit trail as JSON
   */
  async exportJSON(shipmentId: string): Promise<Blob> {
    const token = await getAuthToken();
    
    const response = await fetch(
      `${API_BASE_URL}/api/traceability/shipments/${shipmentId}/export?format=json`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  /**
   * Export audit trail as CSV
   */
  async exportCSV(shipmentId: string): Promise<Blob> {
    const token = await getAuthToken();
    
    const response = await fetch(
      `${API_BASE_URL}/api/traceability/shipments/${shipmentId}/export?format=csv`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  /**
   * Export audit trail as PDF
   */
  async exportPDF(shipmentId: string): Promise<Blob> {
    const token = await getAuthToken();
    
    const response = await fetch(
      `${API_BASE_URL}/api/traceability/shipments/${shipmentId}/export?format=pdf`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  /**
   * Download audit trail
   */
  async downloadAuditTrail(
    shipmentId: string,
    format: 'json' | 'csv' | 'pdf',
    filename?: string
  ): Promise<void> {
    let blob: Blob;

    switch (format) {
      case 'json':
        blob = await this.exportJSON(shipmentId);
        break;
      case 'csv':
        blob = await this.exportCSV(shipmentId);
        break;
      case 'pdf':
        blob = await this.exportPDF(shipmentId);
        break;
    }

    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `audit_trail_${shipmentId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
```

## Error Handling

### Robust Error Handling

```typescript
// error-handler.ts
export class TraceabilityError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'TraceabilityError';
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof TraceabilityError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new TraceabilityError(
        `${context}: ${error.message}`,
        undefined,
        error
      );
    }

    throw new TraceabilityError(`${context}: Unknown error`);
  }
}

// Enhanced client with error handling
export class RobustTraceabilityClient extends TraceabilityClient {
  async recordEvent(input: CreateBlockchainEventInput): Promise<RecordedEvent> {
    return withErrorHandling(
      () => super.recordEvent(input),
      'Failed to record event'
    );
  }

  async verifyShipmentChain(shipmentId: string) {
    return withErrorHandling(
      () => super.verifyShipmentChain(shipmentId),
      'Failed to verify chain'
    );
  }
}

// Retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw new TraceabilityError(
    `Operation failed after ${maxRetries} attempts`,
    undefined,
    lastError
  );
}
```

## Code Examples

### Example 1: IoT Sensor Integration

```typescript
// iot-sensor-integration.ts
import { TraceabilityClient } from './traceability-client';

class IoTSensorIntegration {
  private client: TraceabilityClient;
  private sensorId: string;
  private shipmentId: string;

  constructor(sensorId: string, shipmentId: string) {
    this.client = new TraceabilityClient();
    this.sensorId = sensorId;
    this.shipmentId = shipmentId;
  }

  /**
   * Record temperature reading every 5 minutes
   */
  async startTemperatureMonitoring(latitude: number, longitude: number) {
    setInterval(async () => {
      try {
        const temperature = await this.readTemperatureSensor();
        
        await this.client.recordTemperatureReading(
          this.shipmentId,
          this.sensorId,
          temperature,
          { latitude, longitude }
        );

        console.log(`Temperature recorded: ${temperature}°C`);
      } catch (error) {
        console.error('Failed to record temperature:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async readTemperatureSensor(): Promise<number> {
    // Implement actual sensor reading logic
    return Math.random() * 30 - 10; // Mock: -10 to 20°C
  }
}

// Usage
const sensor = new IoTSensorIntegration('TMP-SENSOR-001', 'shipment-uuid');
await sensor.startTemperatureMonitoring(40.7128, -74.0060);
```

### Example 2: Mobile App Integration

```typescript
// mobile-app-integration.ts
import { TraceabilityClient } from './traceability-client';

class MobileAppIntegration {
  private client: TraceabilityClient;

  constructor() {
    this.client = new TraceabilityClient();
  }

  /**
   * Record checkpoint scan from mobile app
   */
  async scanCheckpoint(
    shipmentId: string,
    checkpointQRData: {
      checkpointName: string;
      locationName: string;
      latitude: number;
      longitude: number;
      country: string;
    },
    user: {
      id: string;
      name: string;
      organization: string;
    }
  ) {
    try {
      const result = await this.client.recordCheckpoint(
        shipmentId,
        checkpointQRData.checkpointName,
        user,
        {
          name: checkpointQRData.locationName,
          coordinates: {
            latitude: checkpointQRData.latitude,
            longitude: checkpointQRData.longitude
          },
          country: checkpointQRData.country
        }
      );

      return {
        success: true,
        message: 'Checkpoint recorded successfully',
        transactionHash: result.transactionHash
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to record checkpoint',
        error
      };
    }
  }

  /**
   * Get real-time shipment status
   */
  async getShipmentStatus(shipmentId: string) {
    const events = await this.client.getShipmentEvents(shipmentId);
    const latestEvent = events.data.events[events.data.events.length - 1];

    return {
      currentStatus: latestEvent.eventType,
      lastUpdate: latestEvent.timestamp,
      location: latestEvent.location,
      chainIntegrity: events.data.chainIntegrity.isValid
    };
  }
}
```

### Example 3: ERP System Integration

```typescript
// erp-integration.ts
import { TraceabilityClient } from './traceability-client';

class ERPIntegration {
  private client: TraceabilityClient;

  constructor() {
    this.client = new TraceabilityClient();
  }

  /**
   * Sync shipment creation from ERP to blockchain
   */
  async syncShipmentFromERP(erpShipment: {
    id: string;
    shipmentNumber: string;
    batchNumber: string;
    isotope: string;
    originFacility: string;
    destinationFacility: string;
    carrier: string;
  }) {
    try {
      const result = await this.client.recordShipmentCreated(
        erpShipment.id,
        {
          shipmentNumber: erpShipment.shipmentNumber,
          batchNumber: erpShipment.batchNumber,
          isotope: erpShipment.isotope,
          origin: erpShipment.originFacility,
          destination: erpShipment.destinationFacility,
          carrier: erpShipment.carrier
        }
      );

      // Update ERP with blockchain reference
      await this.updateERPWithBlockchainReference(
        erpShipment.id,
        result.transactionHash
      );

      return result;
    } catch (error) {
      console.error('Failed to sync shipment to blockchain:', error);
      throw error;
    }
  }

  private async updateERPWithBlockchainReference(
    shipmentId: string,
    transactionHash: string
  ) {
    // Implement ERP update logic
    console.log(`Updated ERP shipment ${shipmentId} with tx ${transactionHash}`);
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(shipmentId: string) {
    const [events, verification] = await Promise.all([
      this.client.getShipmentEvents(shipmentId),
      this.client.verifyShipmentChain(shipmentId)
    ]);

    return {
      shipmentId,
      totalEvents: events.data.eventCount,
      chainValid: verification.data.isValid,
      events: events.data.events,
      generatedAt: new Date().toISOString()
    };
  }
}
```

## Best Practices

### 1. Authentication
- ✅ Store credentials securely (environment variables)
- ✅ Refresh tokens before they expire
- ✅ Handle 401 errors gracefully
- ✅ Use separate credentials for each integration

### 2. Error Handling
- ✅ Implement retry logic with exponential backoff
- ✅ Log errors for debugging
- ✅ Handle network failures gracefully
- ✅ Validate input before sending

### 3. Performance
- ✅ Batch operations when possible
- ✅ Use pagination for large datasets
- ✅ Cache results when appropriate
- ✅ Monitor API usage and rate limits

### 4. Data Integrity
- ✅ Verify chain integrity regularly
- ✅ Store transaction hashes for reference
- ✅ Validate event data before recording
- ✅ Keep local audit logs

### 5. Security
- ✅ Use HTTPS for all requests
- ✅ Never log sensitive data
- ✅ Implement request signing (future)
- ✅ Follow least privilege principle

## Testing Your Integration

```typescript
// integration-tests.ts
import { TraceabilityClient } from './traceability-client';

describe('Traceability Integration', () => {
  const client = new TraceabilityClient();
  const testShipmentId = 'test-uuid';

  test('should record event', async () => {
    const result = await client.recordEvent({
      shipmentId: testShipmentId,
      eventType: 'checkpoint',
      actor: {
        id: 'test-user',
        type: 'user',
        name: 'Test User'
      },
      location: {
        name: 'Test Checkpoint',
        type: 'checkpoint'
      },
      metadata: {}
    });

    expect(result.success).toBe(true);
    expect(result.transactionHash).toBeDefined();
  });

  test('should verify chain', async () => {
    const result = await client.verifyShipmentChain(testShipmentId);
    expect(result.data.isValid).toBe(true);
  });
});
```

## Support and Resources

- **API Documentation**: [API.md](./API.md)
- **Event Types**: [EVENTS.md](./EVENTS.md)
- **Blockchain Details**: [BLOCKCHAIN.md](./BLOCKCHAIN.md)
- **Security Guide**: [SECURITY.md](./SECURITY.md)

For technical support, contact: support@nuclearflow.com
