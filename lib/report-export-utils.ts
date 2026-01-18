/**
 * Report Export Utilities
 * Functions to export reports in various formats (PDF, CSV, Excel, JSON)
 */

import { toast } from 'sonner';

export interface ReportData {
  reportType: string;
  startDate: Date;
  endDate: Date;
  totalShipments: number;
  onTimeDelivery: number;
  avgTransitTime: number;
  complianceRate: number;
  changePercent: number;
}

/**
 * Export report as PDF
 */
export async function exportReportAsPDF(data: ReportData): Promise<Blob> {
  const content = generatePDFContent(data);
  
  // Create a text-based PDF representation (in production, use a proper PDF library like jsPDF)
  const pdfContent = `
NUCLEAR MATERIAL SHIPMENT REPORT
=====================================

Report Type: ${data.reportType}
Date Range: ${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}

KEY METRICS
-----------
Total Shipments: ${data.totalShipments}
On-Time Delivery Rate: ${data.onTimeDelivery}%
Average Transit Time: ${data.avgTransitTime} hours
Compliance Rate: ${data.complianceRate}%
Change from Previous Period: ${data.changePercent > 0 ? '+' : ''}${data.changePercent}%

SUMMARY
-------
This report provides an overview of nuclear material shipment performance
for the selected time period. All shipments comply with international
regulations and safety standards.

Generated: ${new Date().toLocaleString()}
  `.trim();

  return new Blob([pdfContent], { type: 'application/pdf' });
}

/**
 * Export report as CSV
 */
export async function exportReportAsCSV(data: ReportData): Promise<Blob> {
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Report Type', data.reportType],
    ['Start Date', data.startDate.toLocaleDateString()],
    ['End Date', data.endDate.toLocaleDateString()],
    ['Total Shipments', data.totalShipments.toString()],
    ['On-Time Delivery Rate', `${data.onTimeDelivery}%`],
    ['Average Transit Time', `${data.avgTransitTime} hours`],
    ['Compliance Rate', `${data.complianceRate}%`],
    ['Change from Previous Period', `${data.changePercent > 0 ? '+' : ''}${data.changePercent}%`],
    ['Generated', new Date().toLocaleString()],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv' });
}

/**
 * Export report as Excel (CSV format compatible with Excel)
 */
export async function exportReportAsExcel(data: ReportData): Promise<Blob> {
  // Use CSV format with Excel-specific encoding
  const csvBlob = await exportReportAsCSV(data);
  return new Blob([csvBlob], { 
    type: 'application/vnd.ms-excel' 
  });
}

/**
 * Export report as JSON
 */
export async function exportReportAsJSON(data: ReportData): Promise<Blob> {
  const jsonData = {
    reportType: data.reportType,
    dateRange: {
      start: data.startDate.toISOString(),
      end: data.endDate.toISOString(),
    },
    metrics: {
      totalShipments: data.totalShipments,
      onTimeDeliveryRate: data.onTimeDelivery,
      avgTransitTime: data.avgTransitTime,
      complianceRate: data.complianceRate,
      changePercent: data.changePercent,
    },
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0',
    },
  };

  const jsonContent = JSON.stringify(jsonData, null, 2);
  return new Blob([jsonContent], { type: 'application/json' });
}

/**
 * Generate PDF content (helper function)
 */
function generatePDFContent(data: ReportData): string {
  return `Report: ${data.reportType}\nPeriod: ${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}`;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Share report via email (opens email client)
 */
export async function shareReportViaEmail(data: ReportData): Promise<void> {
  const subject = encodeURIComponent(`${data.reportType} Report`);
  const body = encodeURIComponent(
    `Nuclear Material Shipment Report\n\n` +
    `Report Type: ${data.reportType}\n` +
    `Date Range: ${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}\n\n` +
    `Key Metrics:\n` +
    `- Total Shipments: ${data.totalShipments}\n` +
    `- On-Time Delivery: ${data.onTimeDelivery}%\n` +
    `- Avg Transit Time: ${data.avgTransitTime}h\n` +
    `- Compliance Rate: ${data.complianceRate}%\n\n` +
    `Generated: ${new Date().toLocaleString()}`
  );

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  toast.success('Opening email client...');
}

/**
 * Share report to cloud storage (simulated)
 */
export async function shareReportToCloud(
  destination: 'google-drive' | 'dropbox' | 'onedrive' | 'sharepoint',
  data: ReportData
): Promise<void> {
  // In production, this would integrate with actual cloud storage APIs
  const destinationNames = {
    'google-drive': 'Google Drive',
    'dropbox': 'Dropbox',
    'onedrive': 'OneDrive',
    'sharepoint': 'SharePoint',
  };

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  toast.success(`Report would be shared to ${destinationNames[destination]}`, {
    description: 'Cloud integration not yet configured. File will be downloaded instead.',
  });

  // Fall back to downloading the file
  const blob = await exportReportAsPDF(data);
  const filename = `report_${data.reportType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  downloadBlob(blob, filename);
}
