import { describe, it, expect } from 'vitest';
import { differenceInDays, subDays } from 'date-fns';

// Mock data structure for different report types
const MOCK_DATA = {
  'Shipment Performance': {
    baseShipments: 150,
    dailyVariance: 5,
    onTimeRate: 98.7,
    avgTransit: 18.5,
    complianceRate: 100,
  },
  'Compliance Overview': {
    baseShipments: 120,
    dailyVariance: 3,
    onTimeRate: 99.2,
    avgTransit: 17.2,
    complianceRate: 100,
  },
  'Financial Summary': {
    baseShipments: 180,
    dailyVariance: 7,
    onTimeRate: 97.5,
    avgTransit: 19.8,
    complianceRate: 98.5,
  },
  'Activity Decay Analysis': {
    baseShipments: 95,
    dailyVariance: 4,
    onTimeRate: 96.8,
    avgTransit: 20.1,
    complianceRate: 99.2,
  },
};

type ReportType = keyof typeof MOCK_DATA;

// Calculate filtered statistics (mimics the useMemo logic from page.tsx)
function calculateFilteredStats(reportType: ReportType, startDate: Date, endDate: Date) {
  const data = MOCK_DATA[reportType];
  const daysDiff = differenceInDays(endDate, startDate);
  
  // Calculate shipments based on date range (scaled by days)
  const totalShipments = Math.floor(data.baseShipments * (daysDiff / 30));
  
  // Add some variance based on date range
  const variance = (daysDiff % 7) * data.dailyVariance;
  const adjustedShipments = totalShipments + variance;
  
  // Calculate change percentage (comparing to previous period)
  const changePercent = 5 + (daysDiff % 10) * 1.5;

  return {
    totalShipments: Math.max(1, adjustedShipments),
    onTimeDelivery: data.onTimeRate,
    avgTransitTime: data.avgTransit,
    complianceRate: data.complianceRate,
    changePercent: Number(changePercent.toFixed(1)),
  };
}

describe('Reports Page - Dynamic Filtering', () => {
  describe('Filter Logic', () => {
    it('should calculate different statistics for different date ranges', () => {
      const today = new Date();
      const reportType = 'Shipment Performance';
      
      // Test 7-day range
      const stats7Days = calculateFilteredStats(
        reportType,
        subDays(today, 7),
        today
      );
      
      // Test 30-day range
      const stats30Days = calculateFilteredStats(
        reportType,
        subDays(today, 30),
        today
      );
      
      // 30-day period should have more shipments than 7-day period
      expect(stats30Days.totalShipments).toBeGreaterThan(stats7Days.totalShipments);
    });

    it('should calculate different statistics for different report types', () => {
      const today = new Date();
      const startDate = subDays(today, 30);
      
      const shipmentPerformance = calculateFilteredStats('Shipment Performance', startDate, today);
      const financialSummary = calculateFilteredStats('Financial Summary', startDate, today);
      
      // Different report types should have different base data
      expect(shipmentPerformance.onTimeDelivery).toBe(98.7);
      expect(financialSummary.onTimeDelivery).toBe(97.5);
      expect(shipmentPerformance.avgTransitTime).toBe(18.5);
      expect(financialSummary.avgTransitTime).toBe(19.8);
    });

    it('should scale shipments based on date range', () => {
      const today = new Date();
      const reportType = 'Shipment Performance';
      
      // Test different date ranges
      const stats7Days = calculateFilteredStats(reportType, subDays(today, 7), today);
      const stats90Days = calculateFilteredStats(reportType, subDays(today, 90), today);
      
      // 90-day period should have significantly more shipments
      expect(stats90Days.totalShipments).toBeGreaterThan(stats7Days.totalShipments * 3);
    });

    it('should return different stats for each report type', () => {
      const today = new Date();
      const startDate = subDays(today, 7);
      
      const reportTypes: ReportType[] = [
        'Shipment Performance',
        'Compliance Overview',
        'Financial Summary',
        'Activity Decay Analysis'
      ];
      
      const allStats = reportTypes.map(type => calculateFilteredStats(type, startDate, today));
      
      // Each report type should have unique characteristics
      expect(allStats[0].totalShipments).not.toBe(allStats[1].totalShipments);
      expect(allStats[0].onTimeDelivery).not.toBe(allStats[2].onTimeDelivery);
    });

    it('should always return at least 1 shipment', () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      
      const stats = calculateFilteredStats('Activity Decay Analysis', yesterday, today);
      
      // Even for very small date ranges, should return at least 1
      expect(stats.totalShipments).toBeGreaterThanOrEqual(1);
    });

    it('should preserve report-specific metrics', () => {
      const today = new Date();
      const startDate = subDays(today, 30);
      
      const complianceStats = calculateFilteredStats('Compliance Overview', startDate, today);
      
      // Should maintain the specific characteristics of each report type
      expect(complianceStats.onTimeDelivery).toBe(99.2);
      expect(complianceStats.avgTransitTime).toBe(17.2);
      expect(complianceStats.complianceRate).toBe(100);
    });

    it('should calculate consistent change percentages based on date range', () => {
      const today = new Date();
      
      // Same date ranges should produce same change percentages
      const stats1 = calculateFilteredStats('Shipment Performance', subDays(today, 7), today);
      const stats2 = calculateFilteredStats('Financial Summary', subDays(today, 7), today);
      
      // Change percentage depends on date range, not report type
      expect(stats1.changePercent).toBe(stats2.changePercent);
    });
  });

  describe('Date Range Validation', () => {
    it('should handle same start and end dates', () => {
      const today = new Date();
      
      const stats = calculateFilteredStats('Shipment Performance', today, today);
      
      // Should handle edge case of 0-day range
      expect(stats.totalShipments).toBeGreaterThanOrEqual(1);
      expect(stats.onTimeDelivery).toBe(98.7);
    });

    it('should handle long date ranges (90 days)', () => {
      const today = new Date();
      const start90Days = subDays(today, 90);
      
      const stats = calculateFilteredStats('Financial Summary', start90Days, today);
      
      // Should calculate stats for 90-day period
      expect(stats.totalShipments).toBeGreaterThan(100);
      expect(stats.avgTransitTime).toBe(19.8);
    });
  });

  describe('Report Type Variations', () => {
    it('should have unique base shipments for each report type', () => {
      expect(MOCK_DATA['Shipment Performance'].baseShipments).toBe(150);
      expect(MOCK_DATA['Compliance Overview'].baseShipments).toBe(120);
      expect(MOCK_DATA['Financial Summary'].baseShipments).toBe(180);
      expect(MOCK_DATA['Activity Decay Analysis'].baseShipments).toBe(95);
    });

    it('should maintain different on-time rates per report type', () => {
      const onTimeRates = Object.values(MOCK_DATA).map(d => d.onTimeRate);
      const uniqueRates = new Set(onTimeRates);
      
      // Each report type should have a different on-time rate
      expect(uniqueRates.size).toBe(4);
    });
  });
});
