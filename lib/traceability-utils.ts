// Utility functions for traceability operations

import { BlockchainEvent, BlockchainEventType, PDFOptions } from '@/models/blockchain.model';
import { LucideIcon, FileText, MapPin, Truck, Database, AlertTriangle, CheckCircle, Package, ClipboardCheck, FileCheck, Shield } from 'lucide-react';
import crypto from 'crypto';

interface AuditEvent {
  type: string;
  timestamp: string;
  actor: string;
  location: string;
  description: string;
  hash: string;
}

interface ShipmentMetadata {
  isotope?: string;
  batch?: string;
}

interface ChainIntegrityResult {
  isValid: boolean;
  brokenLinks: string[];
  invalidHashes: string[];
  message: string;
}

// ============================================================================
// Hash Generation Utilities
// ============================================================================

/**
 * Generate SHA-256 hash for event data
 */
export function generateEventHash(event: Partial<BlockchainEvent>): string {
  const data = {
    shipmentId: event.shipmentId,
    eventType: event.eventType,
    timestamp: event.timestamp,
    actor: event.actor,
    location: event.location,
    metadata: event.metadata,
  };
  const jsonString = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Generate chain hash linking previous hash to current event
 */
export function generateChainHash(previousHash: string, eventHash: string): string {
  const combined = previousHash + eventHash;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Verify event hash matches expected hash
 */
export function verifyEventHash(event: BlockchainEvent): boolean {
  const calculatedHash = generateEventHash(event);
  return calculatedHash === event.dataHash;
}

/**
 * Verify entire chain integrity for a shipment
 */
export function verifyChainIntegrity(events: BlockchainEvent[]): ChainIntegrityResult {
  if (events.length === 0) {
    return {
      isValid: false,
      brokenLinks: [],
      invalidHashes: [],
      message: 'No events to verify',
    };
  }

  const brokenLinks: string[] = [];
  const invalidHashes: string[] = [];

  // Verify hashes
  for (const event of events) {
    if (!verifyEventHash(event)) {
      invalidHashes.push(event.id);
    }
  }

  // Verify chain links
  for (let i = 1; i < events.length; i++) {
    if (events[i].previousHash !== events[i - 1].dataHash) {
      brokenLinks.push(events[i].id);
    }
  }

  const isValid = brokenLinks.length === 0 && invalidHashes.length === 0;

  return {
    isValid,
    brokenLinks,
    invalidHashes,
    message: isValid
      ? 'Chain integrity verified'
      : `Chain integrity compromised: ${brokenLinks.length} broken links, ${invalidHashes.length} invalid hashes`,
  };
}

// ============================================================================
// Export Utilities
// ============================================================================

/**
 * Export blockchain events to JSON
 */
export async function exportToJSON(
  shipmentId: string,
  events: BlockchainEvent[]
): Promise<Blob> {
  const exportData = {
    shipmentId,
    exportDate: new Date().toISOString(),
    eventCount: events.length,
    events: events.map(event => ({
      id: event.id,
      eventType: event.eventType,
      timestamp: event.timestamp,
      actor: event.actor,
      location: event.location,
      dataHash: event.dataHash,
      previousHash: event.previousHash,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      metadata: event.metadata,
      verified: event.verified,
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Export blockchain events to CSV
 */
export async function exportToCSV(
  shipmentId: string,
  events: BlockchainEvent[]
): Promise<Blob> {
  const headers = [
    'Event ID',
    'Shipment ID',
    'Event Type',
    'Timestamp',
    'Actor ID',
    'Actor Name',
    'Location Name',
    'Transaction Hash',
    'Data Hash',
    'Verified',
  ];

  const rows = events.map(event => [
    event.id,
    event.shipmentId,
    event.eventType,
    event.timestamp.toISOString(),
    event.actor.id,
    event.actor.name,
    event.location.name,
    event.transactionHash,
    event.dataHash,
    event.verified ? 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv' });
}

/**
 * Generate audit trail PDF
 */
export async function generateAuditPDF(
  shipmentId: string,
  events: BlockchainEvent[],
  options: PDFOptions = {}
): Promise<Blob> {
  const {
    includeHashes = true,
    includeSignatures = true,
    includeMetadata = true,
    includeTimeline = true,
  } = options;

  // Generate PDF content as text (in production, use a PDF library)
  const pdfContent = `
BLOCKCHAIN-VERIFIED AUDIT TRAIL REPORT
======================================

Shipment ID: ${shipmentId}
Report Generated: ${new Date().toISOString()}
Total Events: ${events.length}

${includeTimeline ? `
AUDIT TRAIL TIMELINE:
${events.map((event, i) => `
${i + 1}. ${formatEventType(event.eventType).toUpperCase()}
   Time: ${formatTimestamp(event.timestamp)}
   Actor: ${event.actor.name} (${event.actor.type})
   Location: ${event.location.name}
   ${includeHashes ? `Hash: ${event.dataHash}` : ''}
   ${includeHashes ? `Transaction: ${event.transactionHash}` : ''}
   ${includeMetadata && Object.keys(event.metadata).length > 0 ? `Metadata: ${JSON.stringify(event.metadata, null, 2)}` : ''}
   Verified: ${event.verified ? 'Yes' : 'No'}
`).join('\n')}
` : ''}

${includeSignatures ? `
DIGITAL SIGNATURES:
This document is digitally signed and blockchain-verified.
All events have been recorded on Hyperledger Fabric blockchain.
` : ''}

Chain Integrity: ${verifyChainIntegrity(events).isValid ? 'VALID' : 'COMPROMISED'}

This is a text-based audit report. In production, this would be a properly 
formatted PDF with embedded digital signatures and QR codes for verification.
  `;

  return new Blob([pdfContent], { type: 'text/plain' });
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format event type for display
 */
export function formatEventType(type: BlockchainEventType): string {
  const typeMap: Record<BlockchainEventType, string> = {
    shipment_created: 'Shipment Created',
    dispatch: 'Dispatched',
    pickup: 'Picked Up',
    in_transit: 'In Transit',
    checkpoint: 'Checkpoint',
    customs_check: 'Customs Check',
    customs_cleared: 'Customs Cleared',
    customs_hold: 'Customs Hold',
    temperature_reading: 'Temperature Reading',
    temperature_alert: 'Temperature Alert',
    humidity_reading: 'Humidity Reading',
    radiation_check: 'Radiation Check',
    location_update: 'Location Update',
    handover: 'Handover',
    delivery: 'Delivered',
    receipt_confirmation: 'Receipt Confirmed',
    document_generated: 'Document Generated',
    document_signed: 'Document Signed',
    compliance_verified: 'Compliance Verified',
    alert_triggered: 'Alert Triggered',
    status_change: 'Status Changed',
  };

  return typeMap[type] || type;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: Date): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Truncate hash for display
 */
export function truncateHash(hash: string, length: number = 16): string {
  if (hash.length <= length) {
    return hash;
  }
  const start = Math.floor((length - 3) / 2);
  const end = Math.ceil((length - 3) / 2);
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/**
 * Get icon for event type
 */
export function getEventIcon(type: BlockchainEventType): LucideIcon {
  const iconMap: Record<BlockchainEventType, LucideIcon> = {
    shipment_created: FileText,
    dispatch: Truck,
    pickup: Package,
    in_transit: Truck,
    checkpoint: MapPin,
    customs_check: ClipboardCheck,
    customs_cleared: CheckCircle,
    customs_hold: AlertTriangle,
    temperature_reading: Database,
    temperature_alert: AlertTriangle,
    humidity_reading: Database,
    radiation_check: Shield,
    location_update: MapPin,
    handover: Package,
    delivery: CheckCircle,
    receipt_confirmation: FileCheck,
    document_generated: FileText,
    document_signed: FileCheck,
    compliance_verified: Shield,
    alert_triggered: AlertTriangle,
    status_change: FileText,
  };

  return iconMap[type] || FileText;
}

/**
 * Get color for event type
 */
export function getEventColor(type: BlockchainEventType): string {
  const colorMap: Record<BlockchainEventType, string> = {
    shipment_created: 'purple',
    dispatch: 'blue',
    pickup: 'blue',
    in_transit: 'blue',
    checkpoint: 'green',
    customs_check: 'amber',
    customs_cleared: 'green',
    customs_hold: 'red',
    temperature_reading: 'cyan',
    temperature_alert: 'red',
    humidity_reading: 'cyan',
    radiation_check: 'purple',
    location_update: 'green',
    handover: 'blue',
    delivery: 'green',
    receipt_confirmation: 'green',
    document_generated: 'purple',
    document_signed: 'green',
    compliance_verified: 'green',
    alert_triggered: 'red',
    status_change: 'amber',
  };

  return colorMap[type] || 'gray';
}

// ============================================================================
// Legacy Functions (kept for backward compatibility)
// ============================================================================

/**
 * Download audit trail as JSON (legacy)
 */
export async function downloadAuditTrailJSON(
  shipmentId: string,
  events: AuditEvent[]
): Promise<void> {
  console.log('Downloading audit trail JSON for shipment:', shipmentId);
  
  const auditData = {
    shipmentId,
    exportDate: new Date().toISOString(),
    eventCount: events.length,
    events: events.map(event => ({
      type: event.type,
      timestamp: event.timestamp,
      actor: event.actor,
      location: event.location,
      description: event.description,
      blockchainHash: event.hash
    }))
  };
  
  const jsonString = JSON.stringify(auditData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit_trail_${shipmentId}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate signed PDF report with audit trail (legacy)
 */
export async function generateSignedPDFReport(
  shipmentId: string,
  events: AuditEvent[],
  metadata: ShipmentMetadata
): Promise<void> {
  console.log('Generating signed PDF report for shipment:', shipmentId);
  
  // Simulate PDF generation with digital signature
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const pdfContent = `
    BLOCKCHAIN-VERIFIED AUDIT TRAIL REPORT
    ======================================
    
    Shipment ID: ${shipmentId}
    Report Generated: ${new Date().toISOString()}
    Total Events: ${events.length}
    
    Isotope: ${metadata?.isotope || 'N/A'}
    Batch Number: ${metadata?.batch || 'N/A'}
    
    AUDIT TRAIL EVENTS:
    ${events.map((event, i) => `
    ${i + 1}. ${event.type.toUpperCase()}
       Time: ${event.timestamp}
       Actor: ${event.actor}
       Location: ${event.location}
       Description: ${event.description}
       Blockchain Hash: ${event.hash}
    `).join('\n')}
    
    DIGITAL SIGNATURE:
    This document is digitally signed and blockchain-verified.
    Signature: ${generateMockSignature()}
    
    This is a mock PDF report. In production, this would be a properly formatted 
    PDF with embedded digital signatures and QR codes for verification.
  `;
  
  const blob = new Blob([pdfContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `signed_audit_trail_${shipmentId}_${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Verify shipment on blockchain (legacy)
 */
export async function verifyShipmentOnBlockchain(
  shipmentId: string
): Promise<{ verified: boolean; eventCount: number; message: string }> {
  console.log('Verifying shipment on blockchain:', shipmentId);
  
  // Simulate blockchain verification
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock verification result
  const verified = Math.random() > 0.1; // 90% success rate
  
  return {
    verified,
    eventCount: verified ? 6 : 0,
    message: verified 
      ? 'All events verified successfully on Hyperledger Fabric'
      : 'Verification failed. Some events could not be confirmed on blockchain.'
  };
}

/**
 * Generate mock digital signature
 */
const SIGNATURE_LENGTH = 64;

function generateMockSignature(): string {
  return Array.from({ length: SIGNATURE_LENGTH }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase();
}
