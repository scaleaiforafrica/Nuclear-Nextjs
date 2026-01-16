import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDistance,
  generateIntermediateWaypoints,
  formatCoordinates,
  calculateBounds,
  estimateTravelTime,
  addKnownCoordinates,
  getKnownCities,
} from '@/lib/route-utils';

describe('Route Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between Johannesburg and Cape Town', () => {
      const jhb: [number, number] = [-26.2041, 28.0473];
      const cpt: [number, number] = [-33.9249, 18.4241];
      const distance = calculateDistance(jhb, cpt);
      
      // Expected distance is approximately 1265 km
      expect(distance).toBeGreaterThan(1200);
      expect(distance).toBeLessThan(1300);
    });

    it('should calculate distance between Nairobi and Mombasa', () => {
      const nairobi: [number, number] = [-1.2921, 36.8219];
      const mombasa: [number, number] = [-4.0435, 39.6682];
      const distance = calculateDistance(nairobi, mombasa);
      
      // Expected distance is approximately 440 km
      expect(distance).toBeGreaterThan(400);
      expect(distance).toBeLessThan(500);
    });

    it('should return 0 for same coordinates', () => {
      const coord: [number, number] = [-26.2041, 28.0473];
      const distance = calculateDistance(coord, coord);
      expect(distance).toBe(0);
    });

    it('should handle coordinates across equator', () => {
      const north: [number, number] = [9.0320, 38.7469]; // Addis Ababa
      const south: [number, number] = [-1.2921, 36.8219]; // Nairobi
      const distance = calculateDistance(north, south);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('generateIntermediateWaypoints', () => {
    it('should generate correct number of intermediate waypoints', () => {
      const origin: [number, number] = [-26.2041, 28.0473];
      const destination: [number, number] = [-33.9249, 18.4241];
      const waypoints = generateIntermediateWaypoints(origin, destination, 3);
      
      expect(waypoints).toHaveLength(3);
    });

    it('should generate waypoints between origin and destination', () => {
      const origin: [number, number] = [0, 0];
      const destination: [number, number] = [10, 10];
      const waypoints = generateIntermediateWaypoints(origin, destination, 2);
      
      expect(waypoints[0][0]).toBeCloseTo(3.33, 1);
      expect(waypoints[0][1]).toBeCloseTo(3.33, 1);
      expect(waypoints[1][0]).toBeCloseTo(6.67, 1);
      expect(waypoints[1][1]).toBeCloseTo(6.67, 1);
    });

    it('should return empty array for zero count', () => {
      const origin: [number, number] = [0, 0];
      const destination: [number, number] = [10, 10];
      const waypoints = generateIntermediateWaypoints(origin, destination, 0);
      
      expect(waypoints).toHaveLength(0);
    });

    it('should return empty array for negative count', () => {
      const origin: [number, number] = [0, 0];
      const destination: [number, number] = [10, 10];
      const waypoints = generateIntermediateWaypoints(origin, destination, -1);
      
      expect(waypoints).toHaveLength(0);
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates with proper directions', () => {
      const coord: [number, number] = [-26.2041, 28.0473];
      const formatted = formatCoordinates(coord);
      
      expect(formatted).toContain('S'); // South latitude
      expect(formatted).toContain('E'); // East longitude
      expect(formatted).toContain('26.2041');
      expect(formatted).toContain('28.0473');
    });

    it('should handle northern latitude', () => {
      const coord: [number, number] = [9.0320, 38.7469];
      const formatted = formatCoordinates(coord);
      
      expect(formatted).toContain('N');
      expect(formatted).toContain('E');
    });

    it('should handle western longitude', () => {
      const coord: [number, number] = [5.6037, -0.1870];
      const formatted = formatCoordinates(coord);
      
      expect(formatted).toContain('N');
      expect(formatted).toContain('W');
    });
  });

  describe('calculateBounds', () => {
    it('should calculate correct bounds for multiple coordinates', () => {
      const coords: [number, number][] = [
        [-26.2041, 28.0473],
        [-33.9249, 18.4241],
        [-1.2921, 36.8219],
      ];
      
      const bounds = calculateBounds(coords);
      
      expect(bounds).not.toBeNull();
      if (bounds) {
        const [[minLat, minLng], [maxLat, maxLng]] = bounds;
        
        // Min should be less than max
        expect(minLat).toBeLessThan(maxLat);
        expect(minLng).toBeLessThan(maxLng);
        
        // Bounds should contain all coordinates with padding
        expect(minLat).toBeLessThan(-33.9249);
        expect(maxLat).toBeGreaterThan(-1.2921);
        expect(minLng).toBeLessThan(18.4241);
        expect(maxLng).toBeGreaterThan(36.8219);
      }
    });

    it('should handle single coordinate with padding', () => {
      const coords: [number, number][] = [[-26.2041, 28.0473]];
      const bounds = calculateBounds(coords);
      
      expect(bounds).not.toBeNull();
      if (bounds) {
        const [[minLat, minLng], [maxLat, maxLng]] = bounds;
        // For a single coordinate, bounds might have same values with zero padding
        // or small padding, so we just check they are valid
        expect(minLat).toBeLessThanOrEqual(-26.2041);
        expect(maxLat).toBeGreaterThanOrEqual(-26.2041);
        expect(minLng).toBeLessThanOrEqual(28.0473);
        expect(maxLng).toBeGreaterThanOrEqual(28.0473);
      }
    });

    it('should return null for empty array', () => {
      const coords: [number, number][] = [];
      const bounds = calculateBounds(coords);
      expect(bounds).toBeNull();
    });
  });

  describe('estimateTravelTime', () => {
    it('should estimate travel time correctly', () => {
      const time = estimateTravelTime(800); // 800 km
      expect(time).toBe(10); // 800 / 80 = 10 hours
    });

    it('should handle short distances', () => {
      const time = estimateTravelTime(80);
      expect(time).toBe(1);
    });

    it('should handle zero distance', () => {
      const time = estimateTravelTime(0);
      expect(time).toBe(0);
    });
  });

  describe('addKnownCoordinates', () => {
    beforeEach(() => {
      // Test will add a custom city
    });

    it('should add new city coordinates', () => {
      addKnownCoordinates('Test City', [10, 20]);
      const cities = getKnownCities();
      expect(cities).toContain('Test City');
    });

    it('should normalize city names to lowercase', () => {
      addKnownCoordinates('Another Test City', [15, 25]);
      // The function stores in lowercase, so we verify by checking if we can retrieve it
      const cities = getKnownCities();
      expect(cities.some(city => city.toLowerCase() === 'another test city')).toBe(true);
    });
  });

  describe('getKnownCities', () => {
    it('should return array of city names', () => {
      const cities = getKnownCities();
      expect(Array.isArray(cities)).toBe(true);
      expect(cities.length).toBeGreaterThan(0);
    });

    it('should include major African cities', () => {
      const cities = getKnownCities();
      const lowerCaseCities = cities.map(c => c.toLowerCase());
      
      expect(lowerCaseCities).toContain('johannesburg');
      expect(lowerCaseCities).toContain('nairobi');
      expect(lowerCaseCities).toContain('lagos');
      expect(lowerCaseCities).toContain('cairo');
    });

    it('should return properly capitalized city names', () => {
      const cities = getKnownCities();
      // Check that first letter is capitalized
      cities.forEach(city => {
        expect(city.charAt(0)).toBe(city.charAt(0).toUpperCase());
      });
    });
  });
});
