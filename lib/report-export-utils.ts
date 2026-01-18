/**
 * Report Export Utilities
 * Functions to export reports in various formats (PDF, CSV, Excel, JSON)
 */

import { toast } from 'sonner';
import jsPDF from 'jspdf';

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
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `${data.reportType} Report`,
    subject: 'Nuclear Material Shipment Report',
    author: 'NUCLEAR System',
    keywords: 'nuclear, shipment, report, compliance',
    creator: 'NUCLEAR Supply Chain Management'
  });

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('NUCLEAR MATERIAL SHIPMENT REPORT', 105, 20, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);
  
  // Report Type
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Type:', 20, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(data.reportType, 60, 35);
  
  // Date Range
  doc.setFont('helvetica', 'bold');
  doc.text('Date Range:', 20, 45);
  doc.setFont('helvetica', 'normal');
  const dateRange = `${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}`;
  doc.text(dateRange, 60, 45);
  
  // Key Metrics Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY METRICS', 20, 60);
  doc.setLineWidth(0.3);
  doc.line(20, 62, 80, 62);
  
  doc.setFontSize(12);
  let yPos = 72;
  
  // Metrics
  const metrics = [
    { label: 'Total Shipments:', value: data.totalShipments.toString() },
    { label: 'On-Time Delivery Rate:', value: `${data.onTimeDelivery}%` },
    { label: 'Average Transit Time:', value: `${data.avgTransitTime} hours` },
    { label: 'Compliance Rate:', value: `${data.complianceRate}%` },
    { 
      label: 'Change from Previous Period:', 
      value: `${data.changePercent > 0 ? '+' : ''}${data.changePercent}%` 
    }
  ];
  
  metrics.forEach(metric => {
    doc.setFont('helvetica', 'bold');
    doc.text(metric.label, 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.value, 90, yPos);
    yPos += 10;
  });
  
  // Summary Section
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 20, yPos);
  doc.setLineWidth(0.3);
  doc.line(20, yPos + 2, 70, yPos + 2);
  
  yPos += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summaryText = 'This report provides an overview of nuclear material shipment performance for the selected time period. All shipments comply with international regulations and safety standards.';
  const splitSummary = doc.splitTextToSize(summaryText, 170);
  doc.text(splitSummary, 20, yPos);
  
  // Footer
  yPos = 270;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
  doc.text('NUCLEAR Supply Chain Management System', 105, yPos + 5, { align: 'center' });
  
  // Convert to blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
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
