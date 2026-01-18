import { describe, it, expect } from 'vitest';
import {
  exportReportAsPDF,
  exportReportAsCSV,
  exportReportAsExcel,
  exportReportAsJSON,
  type ReportData,
} from '@/lib/report-export-utils';

describe('Report Export Utilities', () => {
  const mockReportData: ReportData = {
    reportType: 'Shipment Performance',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    totalShipments: 150,
    onTimeDelivery: 98.7,
    avgTransitTime: 18.5,
    complianceRate: 100,
    changePercent: 12.5,
  };

  describe('exportReportAsPDF', () => {
    it('should generate a PDF blob', async () => {
      const blob = await exportReportAsPDF(mockReportData);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate a PDF with proper content', async () => {
      const blob = await exportReportAsPDF(mockReportData);
      
      // PDF should be at least a few KB in size for proper formatting
      expect(blob.size).toBeGreaterThan(1000);
    });
  });

  describe('exportReportAsCSV', () => {
    it('should generate a CSV blob', async () => {
      const blob = await exportReportAsCSV(mockReportData);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should contain report data in CSV format', async () => {
      const blob = await exportReportAsCSV(mockReportData);
      const text = await blob.text();
      
      expect(text).toContain('Metric,Value');
      expect(text).toContain('Shipment Performance');
      expect(text).toContain('150');
      expect(text).toContain('98.7');
    });
  });

  describe('exportReportAsExcel', () => {
    it('should generate an Excel blob', async () => {
      const blob = await exportReportAsExcel(mockReportData);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.ms-excel');
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('exportReportAsJSON', () => {
    it('should generate a JSON blob', async () => {
      const blob = await exportReportAsJSON(mockReportData);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should contain structured report data', async () => {
      const blob = await exportReportAsJSON(mockReportData);
      const text = await blob.text();
      const data = JSON.parse(text);
      
      expect(data.reportType).toBe('Shipment Performance');
      expect(data.metrics.totalShipments).toBe(150);
      expect(data.metrics.onTimeDeliveryRate).toBe(98.7);
      expect(data.metrics.complianceRate).toBe(100);
    });
  });
});
