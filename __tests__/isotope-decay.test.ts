import { describe, it, expect } from 'vitest';
import {
  ISOTOPE_HALF_LIVES,
  calculateDecay,
  calculateCurrentActivity,
  calculateActivityAtArrival,
  parseDeliveryTime,
  calculateElapsedHours,
  calculateDecayPercentage,
  calculateRemainingPercentage,
  getFormattedHalfLife,
  estimateTimeToThreshold,
} from '@/lib/isotope-decay';

describe('Isotope Decay Calculations', () => {
  describe('calculateDecay', () => {
    it('should calculate correct decay after one half-life', () => {
      const result = calculateDecay(100, 6, 6);
      expect(result).toBe(50);
    });

    it('should calculate correct decay after two half-lives', () => {
      const result = calculateDecay(100, 6, 12);
      expect(result).toBe(25);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateDecay(0, 6, 6)).toBe(0);
      expect(calculateDecay(100, 0, 6)).toBe(0);
      expect(calculateDecay(-100, 6, 6)).toBe(0);
    });

    it('should handle fractional half-lives', () => {
      const result = calculateDecay(100, 6, 3);
      expect(result).toBeCloseTo(70.71, 1);
    });
  });

  describe('calculateCurrentActivity', () => {
    it('should calculate Tc-99m decay correctly', () => {
      const result = calculateCurrentActivity(100, 'Tc-99m', 6);
      expect(result).toBe(50);
    });

    it('should calculate F-18 decay correctly', () => {
      const result = calculateCurrentActivity(100, 'F-18', 1.83);
      expect(result).toBe(50);
    });

    it('should handle unknown isotopes gracefully', () => {
      const result = calculateCurrentActivity(100, 'Unknown-99', 6);
      expect(result).toBe(100); // Should return initial activity
    });
  });

  describe('parseDeliveryTime', () => {
    it('should parse hours correctly', () => {
      expect(parseDeliveryTime('24 hours')).toBe(24);
      expect(parseDeliveryTime('48 hrs')).toBe(48);
      expect(parseDeliveryTime('12h')).toBe(12);
    });

    it('should parse days correctly', () => {
      expect(parseDeliveryTime('2 days')).toBe(48);
      expect(parseDeliveryTime('1 day')).toBe(24);
      expect(parseDeliveryTime('3d')).toBe(72);
    });

    it('should handle invalid input with default', () => {
      expect(parseDeliveryTime('invalid')).toBe(24);
      expect(parseDeliveryTime('')).toBe(24);
    });
  });

  describe('calculateElapsedHours', () => {
    it('should calculate elapsed hours correctly', () => {
      const start = new Date('2024-01-01T00:00:00Z');
      const end = new Date('2024-01-01T12:00:00Z');
      const elapsed = calculateElapsedHours(start, end);
      expect(elapsed).toBe(12);
    });

    it('should handle current time as default end', () => {
      const start = new Date(Date.now() - 3600000); // 1 hour ago
      const elapsed = calculateElapsedHours(start);
      expect(elapsed).toBeGreaterThanOrEqual(0.9);
      expect(elapsed).toBeLessThanOrEqual(1.1);
    });

    it('should not return negative values', () => {
      const future = new Date(Date.now() + 3600000); // 1 hour in future
      const elapsed = calculateElapsedHours(future);
      expect(elapsed).toBe(0);
    });
  });

  describe('calculateDecayPercentage', () => {
    it('should calculate decay percentage correctly', () => {
      const result = calculateDecayPercentage(100, 75);
      expect(result).toBe(25);
    });

    it('should handle zero initial activity', () => {
      const result = calculateDecayPercentage(0, 50);
      expect(result).toBe(0);
    });

    it('should handle complete decay', () => {
      const result = calculateDecayPercentage(100, 0);
      expect(result).toBe(100);
    });
  });

  describe('calculateRemainingPercentage', () => {
    it('should calculate remaining percentage correctly', () => {
      const result = calculateRemainingPercentage(100, 75);
      expect(result).toBe(75);
    });

    it('should handle zero initial activity', () => {
      const result = calculateRemainingPercentage(0, 50);
      expect(result).toBe(0);
    });
  });

  describe('getFormattedHalfLife', () => {
    it('should format short half-lives in minutes', () => {
      const result = getFormattedHalfLife('Ga-68');
      expect(result).toContain('minutes');
    });

    it('should format medium half-lives in hours', () => {
      const result = getFormattedHalfLife('Tc-99m');
      expect(result).toContain('hours');
    });

    it('should format long half-lives in days', () => {
      const result = getFormattedHalfLife('Lu-177');
      expect(result).toContain('days');
    });

    it('should handle unknown isotopes', () => {
      const result = getFormattedHalfLife('Unknown-99');
      expect(result).toBe('Unknown');
    });
  });

  describe('estimateTimeToThreshold', () => {
    it('should calculate time to reach threshold correctly', () => {
      const result = estimateTimeToThreshold(100, 'Tc-99m', 25);
      expect(result).toBeCloseTo(12, 1); // 2 half-lives
    });

    it('should return 0 if initial activity is below threshold', () => {
      const result = estimateTimeToThreshold(50, 'Tc-99m', 100);
      expect(result).toBe(0);
    });
  });

  describe('ISOTOPE_HALF_LIVES', () => {
    it('should have entries for common medical isotopes', () => {
      expect(ISOTOPE_HALF_LIVES['Tc-99m']).toBe(6.0);
      expect(ISOTOPE_HALF_LIVES['F-18']).toBe(1.83);
      expect(ISOTOPE_HALF_LIVES['I-131']).toBe(192.0);
      expect(ISOTOPE_HALF_LIVES['Lu-177']).toBeGreaterThan(150);
      expect(ISOTOPE_HALF_LIVES['Ga-68']).toBe(1.13);
    });
  });
});
