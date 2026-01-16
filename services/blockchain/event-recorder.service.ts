// Event recorder service - Helper methods for recording specific event types

import {
  EventActor,
  EventLocation,
  RecordedEvent,
  ShipmentData,
  ShipmentCondition,
  CustomsCheckResult,
  TemperatureThreshold,
  DeliveryDetails,
  ReceiptCondition,
} from '@/models/blockchain.model';
import { hyperledgerService } from './hyperledger.service';

/**
 * Service with helper methods for recording specific blockchain event types
 */
export class EventRecorderService {
  /**
   * Record shipment created event
   */
  async recordShipmentCreated(
    shipmentId: string,
    shipmentData: ShipmentData,
    actor: EventActor
  ): Promise<RecordedEvent> {
    return hyperledgerService.recordEvent({
      shipmentId,
      eventType: 'shipment_created',
      actor,
      location: {
        name: 'NuclearFlow Platform',
        type: 'facility',
      },
      metadata: {
        shipmentNumber: shipmentData.shipmentNumber,
        batchNumber: shipmentData.batchNumber,
        isotope: shipmentData.isotope,
        origin: shipmentData.origin,
        destination: shipmentData.destination,
        carrier: shipmentData.carrier,
        initialActivity: shipmentData.initialActivity,
      },
    });
  }

  /**
   * Record dispatch event
   */
  async recordDispatch(
    shipmentId: string,
    facilityId: string,
    handler: EventActor,
    condition: ShipmentCondition
  ): Promise<RecordedEvent> {
    return hyperledgerService.recordEvent({
      shipmentId,
      eventType: 'dispatch',
      actor: handler,
      location: {
        name: facilityId,
        type: 'facility',
      },
      metadata: {
        condition,
        facilityId,
      },
    });
  }

  /**
   * Record customs check event
   */
  async recordCustomsCheck(
    shipmentId: string,
    checkpointId: string,
    officer: EventActor,
    result: CustomsCheckResult
  ): Promise<RecordedEvent> {
    const eventType = result.approved ? 'customs_cleared' : 'customs_hold';

    return hyperledgerService.recordEvent({
      shipmentId,
      eventType,
      actor: officer,
      location: {
        name: checkpointId,
        type: 'customs',
      },
      metadata: {
        result,
        checkpointId,
      },
    });
  }

  /**
   * Record temperature reading event
   */
  async recordTemperatureReading(
    shipmentId: string,
    sensorId: string,
    temperature: number,
    threshold: TemperatureThreshold,
    location?: EventLocation
  ): Promise<RecordedEvent> {
    const isCompliant = temperature >= threshold.min && temperature <= threshold.max;
    const eventType = isCompliant ? 'temperature_reading' : 'temperature_alert';

    return hyperledgerService.recordEvent({
      shipmentId,
      eventType,
      actor: {
        id: sensorId,
        type: 'iot_sensor',
        name: `Temperature Sensor ${sensorId}`,
        deviceId: sensorId,
      },
      location: location || {
        name: 'In Transit',
        type: 'vehicle',
      },
      metadata: {
        sensorId,
        temperature,
        threshold,
        unit: threshold.unit,
        isCompliant,
      },
    });
  }

  /**
   * Record location update event
   */
  async recordLocationUpdate(
    shipmentId: string,
    location: EventLocation,
    vehicleId?: string
  ): Promise<RecordedEvent> {
    return hyperledgerService.recordEvent({
      shipmentId,
      eventType: 'location_update',
      actor: {
        id: vehicleId || 'system',
        type: vehicleId ? 'system' : 'system',
        name: vehicleId ? `Vehicle ${vehicleId}` : 'GPS System',
      },
      location,
      metadata: {
        vehicleId,
      },
    });
  }

  /**
   * Record delivery event
   */
  async recordDelivery(
    shipmentId: string,
    recipient: EventActor,
    deliveryDetails: DeliveryDetails
  ): Promise<RecordedEvent> {
    return hyperledgerService.recordEvent({
      shipmentId,
      eventType: 'delivery',
      actor: recipient,
      location: {
        name: deliveryDetails.recipientOrganization,
        type: 'destination',
      },
      metadata: {
        deliveryDetails,
      },
    });
  }

  /**
   * Record receipt confirmation event
   */
  async recordReceiptConfirmation(
    shipmentId: string,
    confirmer: EventActor,
    condition: ReceiptCondition
  ): Promise<RecordedEvent> {
    return hyperledgerService.recordEvent({
      shipmentId,
      eventType: 'receipt_confirmation',
      actor: confirmer,
      location: {
        name: confirmer.organization || 'Destination',
        type: 'destination',
      },
      metadata: {
        condition,
      },
    });
  }

  /**
   * Record checkpoint event
   */
  async recordCheckpoint(
    shipmentId: string,
    checkpointName: string,
    actor: EventActor,
    location: EventLocation
  ): Promise<RecordedEvent> {
    return hyperledgerService.recordEvent({
      shipmentId,
      eventType: 'checkpoint',
      actor,
      location,
      metadata: {
        checkpointName,
      },
    });
  }

  /**
   * Record status change event
   */
  async recordStatusChange(
    shipmentId: string,
    oldStatus: string,
    newStatus: string,
    actor: EventActor
  ): Promise<RecordedEvent> {
    return hyperledgerService.recordEvent({
      shipmentId,
      eventType: 'status_change',
      actor,
      location: {
        name: 'System',
        type: 'unknown',
      },
      metadata: {
        oldStatus,
        newStatus,
      },
    });
  }
}

// Export singleton instance
export const eventRecorderService = new EventRecorderService();
