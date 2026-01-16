// Blockchain traceability model - Data types for blockchain event recording

/**
 * Blockchain event types that can be recorded
 */
export type BlockchainEventType =
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

/**
 * Actor performing the blockchain event
 */
export interface EventActor {
  id: string;
  type: 'user' | 'system' | 'iot_sensor' | 'api';
  name: string;
  role?: string;
  organization?: string;
  deviceId?: string;
}

/**
 * Location where the event occurred
 */
export interface EventLocation {
  name: string;
  type: 'facility' | 'checkpoint' | 'vehicle' | 'port' | 'customs' | 'destination' | 'unknown';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  country?: string;
  countryCode?: string;
}

/**
 * Complete blockchain event record
 */
export interface BlockchainEvent {
  id: string;
  shipmentId: string;
  eventType: BlockchainEventType;
  timestamp: Date;
  actor: EventActor;
  location: EventLocation;
  dataHash: string;
  previousHash: string;
  blockNumber?: number;
  transactionHash: string;
  metadata: Record<string, unknown>;
  signature?: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Blockchain block structure
 */
export interface BlockchainBlock {
  blockNumber: number;
  timestamp: Date;
  transactions: string[];
  previousBlockHash: string;
  blockHash: string;
  merkleRoot: string;
  nonce: number;
}

/**
 * Chain verification result
 */
export interface ChainVerificationResult {
  shipmentId: string;
  isValid: boolean;
  eventCount: number;
  firstEvent: Date;
  lastEvent: Date;
  brokenLinks: string[];
  invalidHashes: string[];
  verifiedAt: Date;
}

/**
 * Input data for creating a blockchain event
 */
export interface CreateBlockchainEventInput {
  shipmentId: string;
  eventType: BlockchainEventType;
  actor: EventActor;
  location: EventLocation;
  metadata?: Record<string, unknown>;
  signature?: string;
}

/**
 * Recorded event response
 */
export interface RecordedEvent extends BlockchainEvent {
  success: boolean;
  message: string;
}

/**
 * Event verification result
 */
export interface EventVerificationResult {
  eventId: string;
  isValid: boolean;
  hashValid: boolean;
  chainValid: boolean;
  signatureValid: boolean;
  verifiedAt: Date;
  message: string;
}

/**
 * Event query filters
 */
export interface EventQueryFilters {
  shipmentId?: string;
  eventType?: BlockchainEventType | BlockchainEventType[];
  actorId?: string;
  actorType?: EventActor['type'];
  locationType?: EventLocation['type'];
  startDate?: Date;
  endDate?: Date;
  verified?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Paginated events response
 */
export interface PaginatedEvents {
  events: BlockchainEvent[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Chain statistics
 */
export interface ChainStatistics {
  totalEvents: number;
  totalShipments: number;
  eventsToday: number;
  verificationRate: number;
  averageEventsPerShipment: number;
  chainIntegrityPercentage: number;
  eventsByType: Record<BlockchainEventType, number>;
  lastBlockNumber?: number;
  lastBlockTime?: Date;
}

/**
 * Shipment data for initial blockchain recording
 */
export interface ShipmentData {
  shipmentNumber: string;
  batchNumber: string;
  isotope: string;
  origin: string;
  destination: string;
  carrier: string;
  initialActivity?: number;
}

/**
 * Shipment condition for dispatch event
 */
export interface ShipmentCondition {
  temperature?: number;
  humidity?: number;
  radiation?: number;
  packagingIntegrity: 'intact' | 'damaged' | 'tampered';
  sealsIntact: boolean;
  notes?: string;
}

/**
 * Customs check result
 */
export interface CustomsCheckResult {
  approved: boolean;
  documentsVerified: string[];
  inspectionNotes?: string;
  clearanceNumber?: string;
  holdReason?: string;
}

/**
 * Temperature threshold for monitoring
 */
export interface TemperatureThreshold {
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit';
}

/**
 * Delivery details
 */
export interface DeliveryDetails {
  signatureData?: string;
  signatureName: string;
  deliveryTime: Date;
  recipientOrganization: string;
  notes?: string;
}

/**
 * Receipt condition
 */
export interface ReceiptCondition {
  packagingCondition: 'good' | 'acceptable' | 'damaged';
  temperatureOnReceipt?: number;
  contentsVerified: boolean;
  discrepanciesNoted?: string;
  acceptanceStatus: 'accepted' | 'rejected' | 'accepted_with_conditions';
}

/**
 * Export options for audit trail
 */
export interface PDFOptions {
  includeHashes?: boolean;
  includeSignatures?: boolean;
  includeMetadata?: boolean;
  includeTimeline?: boolean;
  companyLogo?: string;
  headerText?: string;
  footerText?: string;
}
