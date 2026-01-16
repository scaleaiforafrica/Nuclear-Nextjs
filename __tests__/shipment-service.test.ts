import { describe, it, expect } from 'vitest';
import {
  validateShipmentData,
  calculateShipmentProgress,
  getCurrentWaypoint,
  isShipmentUrgent,
  isShipmentDelayed,
  formatShipmentETA,
} from '@/services/shipment.service';
import type { CreateShipmentRequest, RouteWaypoint } from '@/models/shipment.model';

describe('Shipment Service', () => {
  describe('validateShipmentData', () => {
    it('should validate complete shipment data', () => {
      const data: Partial<CreateShipmentRequest> = {
        isotope: 'Tc-99m',
        batch_number: 'BATCH-001',
        origin: 'Johannesburg',
        destination: 'Cape Town',
        carrier: 'MediTransport',
        status: 'Pending',
      };

      const errors = validateShipmentData(data);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const data: Partial<CreateShipmentRequest> = {
        isotope: 'Tc-99m',
        // Missing other required fields
      };

      const errors = validateShipmentData(data);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Batch'))).toBe(true);
      expect(errors.some(e => e.includes('Origin'))).toBe(true);
      expect(errors.some(e => e.includes('Destination'))).toBe(true);
      expect(errors.some(e => e.includes('Carrier'))).toBe(true);
    });

    it('should detect empty strings', () => {
      const data: Partial<CreateShipmentRequest> = {
        isotope: '',
        batch_number: '  ',
        origin: 'Johannesburg',
        destination: 'Cape Town',
        carrier: 'MediTransport',
        status: 'Pending',
      };

      const errors = validateShipmentData(data);
      expect(errors.some(e => e.includes('Isotope'))).toBe(true);
      expect(errors.some(e => e.includes('Batch'))).toBe(true);
    });

    it('should detect invalid initial activity', () => {
      const data: Partial<CreateShipmentRequest> = {
        isotope: 'Tc-99m',
        batch_number: 'BATCH-001',
        origin: 'Johannesburg',
        destination: 'Cape Town',
        carrier: 'MediTransport',
        status: 'Pending',
        initial_activity: -10,
      };

      const errors = validateShipmentData(data);
      expect(errors.some(e => e.includes('activity'))).toBe(true);
    });
  });

  describe('calculateShipmentProgress', () => {
    it('should calculate progress based on completed waypoints', () => {
      const waypoints: RouteWaypoint[] = [
        { name: 'Origin', coordinates: [0, 0], status: 'completed' },
        { name: 'Waypoint 1', coordinates: [1, 1], status: 'completed' },
        { name: 'Waypoint 2', coordinates: [2, 2], status: 'current' },
        { name: 'Destination', coordinates: [3, 3], status: 'upcoming' },
      ];

      const progress = calculateShipmentProgress(waypoints);
      expect(progress).toBe(50); // 2 out of 4 completed = 50%
    });

    it('should return 0 for empty waypoints', () => {
      const progress = calculateShipmentProgress([]);
      expect(progress).toBe(0);
    });

    it('should return 0 for undefined waypoints', () => {
      const progress = calculateShipmentProgress(undefined);
      expect(progress).toBe(0);
    });

    it('should return 100 when all waypoints completed', () => {
      const waypoints: RouteWaypoint[] = [
        { name: 'Origin', coordinates: [0, 0], status: 'completed' },
        { name: 'Destination', coordinates: [1, 1], status: 'completed' },
      ];

      const progress = calculateShipmentProgress(waypoints);
      expect(progress).toBe(100);
    });
  });

  describe('getCurrentWaypoint', () => {
    it('should return waypoint with current status', () => {
      const waypoints: RouteWaypoint[] = [
        { name: 'Origin', coordinates: [0, 0], status: 'completed' },
        { name: 'Current Stop', coordinates: [1, 1], status: 'current' },
        { name: 'Destination', coordinates: [2, 2], status: 'upcoming' },
      ];

      const current = getCurrentWaypoint(waypoints);
      expect(current?.name).toBe('Current Stop');
      expect(current?.status).toBe('current');
    });

    it('should return first upcoming if no current', () => {
      const waypoints: RouteWaypoint[] = [
        { name: 'Origin', coordinates: [0, 0], status: 'completed' },
        { name: 'Next Stop', coordinates: [1, 1], status: 'upcoming' },
        { name: 'Destination', coordinates: [2, 2], status: 'upcoming' },
      ];

      const current = getCurrentWaypoint(waypoints);
      expect(current?.name).toBe('Next Stop');
    });

    it('should return null for empty waypoints', () => {
      const current = getCurrentWaypoint([]);
      expect(current).toBeNull();
    });

    it('should return null for undefined waypoints', () => {
      const current = getCurrentWaypoint(undefined);
      expect(current).toBeNull();
    });
  });

  describe('isShipmentUrgent', () => {
    it('should return true for ETA less than 12 hours', () => {
      const eta = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(); // 10 hours from now
      expect(isShipmentUrgent(eta)).toBe(true);
    });

    it('should return false for ETA more than 12 hours', () => {
      const eta = new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(); // 15 hours from now
      expect(isShipmentUrgent(eta)).toBe(false);
    });

    it('should return false for past ETA', () => {
      const eta = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
      expect(isShipmentUrgent(eta)).toBe(false);
    });
  });

  describe('isShipmentDelayed', () => {
    it('should return true for overdue shipment not delivered', () => {
      const eta = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
      expect(isShipmentDelayed(eta, 'In Transit')).toBe(true);
    });

    it('should return false for delivered shipment', () => {
      const eta = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
      expect(isShipmentDelayed(eta, 'Delivered')).toBe(false);
    });

    it('should return false for future ETA', () => {
      const eta = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
      expect(isShipmentDelayed(eta, 'In Transit')).toBe(false);
    });
  });

  describe('formatShipmentETA', () => {
    it('should format ETA in minutes for less than 1 hour', () => {
      const eta = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now
      const formatted = formatShipmentETA(eta);
      expect(formatted).toContain('min');
    });

    it('should format ETA in hours for less than 24 hours', () => {
      const eta = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(); // 5 hours from now
      const formatted = formatShipmentETA(eta);
      expect(formatted).toContain('h');
      expect(formatted).toContain('5');
    });

    it('should format ETA in days for more than 24 hours', () => {
      const eta = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours from now
      const formatted = formatShipmentETA(eta);
      expect(formatted).toContain('d');
      expect(formatted).toContain('2');
    });

    it('should show overdue for past ETA', () => {
      const eta = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
      const formatted = formatShipmentETA(eta);
      expect(formatted).toBe('Overdue');
    });
  });
});
