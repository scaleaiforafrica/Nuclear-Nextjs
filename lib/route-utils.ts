/**
 * Route Utilities
 * Provides utilities for geocoding, distance calculation, and route generation
 */

import type { RouteWaypoint } from '@/models/shipment.model';

/**
 * Known city coordinates for common African locations
 * Used as a fallback when geocoding API is unavailable
 */
const KNOWN_COORDINATES: Record<string, [number, number]> = {
  // South Africa
  'johannesburg': [-26.2041, 28.0473],
  'cape town': [-33.9249, 18.4241],
  'pretoria': [-25.7479, 28.2293],
  'durban': [-29.8587, 31.0218],
  'port elizabeth': [-33.9608, 25.6022],
  'bloemfontein': [-29.0852, 26.1596],
  
  // Kenya
  'nairobi': [-1.2921, 36.8219],
  'mombasa': [-4.0435, 39.6682],
  'kisumu': [-0.0917, 34.7680],
  
  // Nigeria
  'lagos': [6.5244, 3.3792],
  'abuja': [9.0765, 7.3986],
  'kano': [12.0022, 8.5919],
  
  // Ghana
  'accra': [5.6037, -0.1870],
  'kumasi': [6.6885, -1.6244],
  
  // Tanzania
  'dar es salaam': [-6.7924, 39.2083],
  'dodoma': [-6.1630, 35.7516],
  
  // Uganda
  'kampala': [0.3476, 32.5825],
  'entebbe': [0.0481, 32.4637],
  
  // Rwanda
  'kigali': [-1.9403, 29.8739],
  
  // Zimbabwe
  'harare': [-17.8252, 31.0335],
  'bulawayo': [-20.1594, 28.5606],
  
  // Zambia
  'lusaka': [-15.3875, 28.3228],
  'kitwe': [-12.8024, 28.2132],
  
  // Mozambique
  'maputo': [-25.9655, 32.5832],
  'beira': [-19.8436, 34.8389],
  
  // Botswana
  'gaborone': [-24.6282, 25.9231],
  
  // Ethiopia
  'addis ababa': [9.0320, 38.7469],
  
  // Egypt
  'cairo': [30.0444, 31.2357],
  'alexandria': [31.2001, 29.9187],
};

/**
 * Geocode an address to coordinates
 * First tries known coordinates, then falls back to Nominatim API
 * 
 * @param address - Address string (e.g., "Johannesburg, South Africa")
 * @returns Coordinates [lat, lng] or null if not found
 */
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (!address || !address.trim()) {
    return null;
  }
  
  // Normalize address for lookup
  const normalized = address.toLowerCase().trim();
  
  // Extract city name (first part before comma)
  const cityMatch = normalized.split(',')[0].trim();
  
  // Check known coordinates first
  if (KNOWN_COORDINATES[cityMatch]) {
    return KNOWN_COORDINATES[cityMatch];
  }
  
  // Check full address
  if (KNOWN_COORDINATES[normalized]) {
    return KNOWN_COORDINATES[normalized];
  }
  
  try {
    // Try Nominatim API (OpenStreetMap geocoding service)
    // Note: In production, consider using a paid service with higher rate limits
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Nuclear-Supply-Chain-App/1.0',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return [lat, lon];
      }
    }
  } catch (error) {
    console.warn(`Geocoding failed for address: ${address}`, error);
  }
  
  return null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * 
 * @param coord1 - First coordinate [lat, lng]
 * @param coord2 - Second coordinate [lat, lng]
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generate intermediate waypoints between origin and destination
 * Creates evenly spaced points along a straight line (great circle not implemented)
 * 
 * @param origin - Origin coordinates [lat, lng]
 * @param destination - Destination coordinates [lat, lng]
 * @param count - Number of intermediate points to generate
 * @returns Array of intermediate coordinates
 */
export function generateIntermediateWaypoints(
  origin: [number, number],
  destination: [number, number],
  count: number = 2
): [number, number][] {
  if (count <= 0) {
    return [];
  }
  
  const [lat1, lon1] = origin;
  const [lat2, lon2] = destination;
  
  const waypoints: [number, number][] = [];
  
  for (let i = 1; i <= count; i++) {
    const fraction = i / (count + 1);
    const lat = lat1 + (lat2 - lat1) * fraction;
    const lon = lon1 + (lon2 - lon1) * fraction;
    waypoints.push([lat, lon]);
  }
  
  return waypoints;
}

/**
 * Generate route waypoints from origin to destination
 * Creates a basic route with origin, optional intermediate points, and destination
 * 
 * @param origin - Origin address
 * @param destination - Destination address
 * @param includeIntermediate - Whether to include intermediate waypoints
 * @returns Array of route waypoints
 */
export async function generateRouteWaypoints(
  origin: string,
  destination: string,
  includeIntermediate: boolean = false
): Promise<RouteWaypoint[]> {
  const waypoints: RouteWaypoint[] = [];
  
  // Geocode origin
  const originCoords = await geocodeAddress(origin);
  if (originCoords) {
    waypoints.push({
      name: `Origin - ${origin.split(',')[0].trim()}`,
      coordinates: originCoords,
      status: 'upcoming',
    });
  }
  
  // Geocode destination
  const destCoords = await geocodeAddress(destination);
  
  // Add intermediate waypoints if requested and we have both coordinates
  if (includeIntermediate && originCoords && destCoords) {
    const distance = calculateDistance(originCoords, destCoords);
    
    // Add intermediate waypoints based on distance
    // For every ~500km, add a waypoint
    const intermediateCount = Math.min(3, Math.floor(distance / 500));
    
    if (intermediateCount > 0) {
      const intermediateCoords = generateIntermediateWaypoints(
        originCoords,
        destCoords,
        intermediateCount
      );
      
      intermediateCoords.forEach((coords, index) => {
        waypoints.push({
          name: `Waypoint ${index + 1}`,
          coordinates: coords,
          status: 'upcoming',
        });
      });
    }
  }
  
  // Add destination
  if (destCoords) {
    waypoints.push({
      name: `Destination - ${destination.split(',')[0].trim()}`,
      coordinates: destCoords,
      status: 'upcoming',
    });
  }
  
  return waypoints;
}

/**
 * Format coordinates for display
 * 
 * @param coordinates - Coordinates [lat, lng]
 * @returns Formatted string
 */
export function formatCoordinates(coordinates: [number, number]): string {
  const [lat, lng] = coordinates;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Calculate bounding box for a set of coordinates
 * Used to fit map view to show all waypoints
 * 
 * @param coordinates - Array of coordinates
 * @returns Bounding box [[minLat, minLng], [maxLat, maxLng]]
 */
export function calculateBounds(
  coordinates: [number, number][]
): [[number, number], [number, number]] | null {
  if (coordinates.length === 0) {
    return null;
  }
  
  let minLat = coordinates[0][0];
  let maxLat = coordinates[0][0];
  let minLng = coordinates[0][1];
  let maxLng = coordinates[0][1];
  
  coordinates.forEach(([lat, lng]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });
  
  // Add padding (5% on each side)
  const latPadding = (maxLat - minLat) * 0.05;
  const lngPadding = (maxLng - minLng) * 0.05;
  
  return [
    [minLat - latPadding, minLng - lngPadding],
    [maxLat + latPadding, maxLng + lngPadding],
  ];
}

/**
 * Estimate travel time based on distance
 * Assumes average speed of 80 km/h for ground transport
 * 
 * @param distanceKm - Distance in kilometers
 * @returns Estimated hours
 */
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmh = 80;
  return distanceKm / averageSpeedKmh;
}

/**
 * Add city to known coordinates cache
 * Useful for adding custom locations
 * 
 * @param city - City name
 * @param coordinates - Coordinates [lat, lng]
 */
export function addKnownCoordinates(
  city: string,
  coordinates: [number, number]
): void {
  const normalized = city.toLowerCase().trim();
  KNOWN_COORDINATES[normalized] = coordinates;
}

/**
 * Get all known city names
 * 
 * @returns Array of city names
 */
export function getKnownCities(): string[] {
  return Object.keys(KNOWN_COORDINATES).map(city => 
    city.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  );
}
