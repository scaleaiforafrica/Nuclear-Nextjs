// Utility functions for traceability operations

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

/**
 * Download audit trail as JSON
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
 * Generate signed PDF report with audit trail
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
 * Verify shipment on blockchain
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
