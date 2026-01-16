/**
 * Shipment Service
 * Service layer for shipment operations and business logic
 */

import type {
  Shipment,
  CreateShipmentRequest,
  ShipmentFromProcurement,
  ShipmentFilter,
  RouteWaypoint,
} from '@/models/shipment.model';
import { calculateCurrentActivity, calculateElapsedHours } from '@/lib/isotope-decay';
import { generateRouteWaypoints } from '@/lib/route-utils';

/**
 * Create a new shipment
 * 
 * @param data - Shipment creation data
 * @returns Created shipment
 */
export async function createShipment(data: CreateShipmentRequest): Promise<Shipment> {
  const response = await fetch('/api/shipments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create shipment');
  }

  return result.data;
}

/**
 * Create a shipment from a procurement request
 * 
 * @param data - Procurement shipment data
 * @returns Created shipment
 */
export async function createShipmentFromProcurement(
  data: ShipmentFromProcurement
): Promise<Shipment> {
  const response = await fetch('/api/shipments/from-procurement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create shipment from procurement');
  }

  return result.data;
}

/**
 * Fetch all shipments with optional filters
 * 
 * @param filters - Filter criteria
 * @returns Array of shipments
 */
export async function fetchShipments(filters?: ShipmentFilter): Promise<Shipment[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.status) params.append('status', filters.status);
    if (filters.isotope) params.append('isotope', filters.isotope);
    if (filters.origin) params.append('origin', filters.origin);
    if (filters.destination) params.append('destination', filters.destination);
    if (filters.procurement_request_id) params.append('procurement_request_id', filters.procurement_request_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.from_procurement !== undefined) params.append('from_procurement', String(filters.from_procurement));
  }

  const response = await fetch(`/api/shipments?${params.toString()}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch shipments');
  }

  return result.data || [];
}

/**
 * Fetch a single shipment by ID
 * 
 * @param id - Shipment ID
 * @returns Shipment or null if not found
 */
export async function fetchShipmentById(id: string): Promise<Shipment | null> {
  const response = await fetch(`/api/shipments/${id}`);
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(result.message || 'Failed to fetch shipment');
  }

  return result.data;
}

/**
 * Fetch shipment linked to a procurement request
 * 
 * @param procurementId - Procurement request ID
 * @returns Shipment or null if not found
 */
export async function fetchShipmentByProcurementId(
  procurementId: string
): Promise<Shipment | null> {
  const response = await fetch(`/api/procurement/${procurementId}/shipment`);
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(result.message || 'Failed to fetch shipment');
  }

  return result.data;
}

/**
 * Calculate current activity based on initial activity and elapsed time
 * Client-side calculation for real-time updates
 * 
 * @param initialActivity - Initial activity
 * @param isotope - Isotope name
 * @param createdAt - Shipment creation timestamp
 * @returns Current activity
 */
export function calculateShipmentCurrentActivity(
  initialActivity: number,
  isotope: string,
  createdAt: string
): number {
  const elapsedHours = calculateElapsedHours(createdAt);
  return calculateCurrentActivity(initialActivity, isotope, elapsedHours);
}

/**
 * Generate route waypoints for a shipment
 * 
 * @param origin - Origin address
 * @param destination - Destination address
 * @param includeIntermediate - Include intermediate waypoints
 * @returns Array of waypoints
 */
export async function generateShipmentRoute(
  origin: string,
  destination: string,
  includeIntermediate: boolean = true
): Promise<RouteWaypoint[]> {
  return generateRouteWaypoints(origin, destination, includeIntermediate);
}

/**
 * Format shipment ETA for display
 * 
 * @param eta - ETA timestamp string
 * @returns Formatted ETA string
 */
export function formatShipmentETA(eta: string): string {
  const etaDate = new Date(eta);
  const now = new Date();
  const hoursUntil = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 0) {
    return 'Overdue';
  } else if (hoursUntil < 1) {
    const minutes = Math.round(hoursUntil * 60);
    return `${minutes} min`;
  } else if (hoursUntil < 24) {
    return `${Math.round(hoursUntil)}h`;
  } else {
    const days = Math.round(hoursUntil / 24);
    return `${days}d`;
  }
}

/**
 * Calculate shipment progress percentage
 * Based on waypoint completion
 * 
 * @param waypoints - Array of waypoints
 * @returns Progress percentage (0-100)
 */
export function calculateShipmentProgress(waypoints?: RouteWaypoint[]): number {
  if (!waypoints || waypoints.length === 0) {
    return 0;
  }

  const completedCount = waypoints.filter(w => w.status === 'completed').length;
  const progress = (completedCount / waypoints.length) * 100;

  return Math.round(progress);
}

/**
 * Get the current waypoint (first non-completed waypoint)
 * 
 * @param waypoints - Array of waypoints
 * @returns Current waypoint or null
 */
export function getCurrentWaypoint(waypoints?: RouteWaypoint[]): RouteWaypoint | null {
  if (!waypoints || waypoints.length === 0) {
    return null;
  }

  return waypoints.find(w => w.status === 'current') || 
         waypoints.find(w => w.status === 'upcoming') || 
         null;
}

/**
 * Validate shipment data before submission
 * 
 * @param data - Shipment data
 * @returns Validation errors or empty array if valid
 */
export function validateShipmentData(data: Partial<CreateShipmentRequest>): string[] {
  const errors: string[] = [];

  if (!data.isotope || data.isotope.trim() === '') {
    errors.push('Isotope is required');
  }

  if (!data.batch_number || data.batch_number.trim() === '') {
    errors.push('Batch number is required');
  }

  if (!data.origin || data.origin.trim() === '') {
    errors.push('Origin is required');
  }

  if (!data.destination || data.destination.trim() === '') {
    errors.push('Destination is required');
  }

  if (!data.carrier || data.carrier.trim() === '') {
    errors.push('Carrier is required');
  }

  if (!data.status) {
    errors.push('Status is required');
  }

  if (data.initial_activity !== undefined && data.initial_activity <= 0) {
    errors.push('Initial activity must be positive');
  }

  return errors;
}

/**
 * Check if a shipment is urgent (ETA < 12 hours)
 * 
 * @param eta - ETA timestamp
 * @returns True if urgent
 */
export function isShipmentUrgent(eta: string): boolean {
  const etaDate = new Date(eta);
  const now = new Date();
  const hoursUntil = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntil > 0 && hoursUntil < 12;
}

/**
 * Check if a shipment is delayed (past ETA)
 * 
 * @param eta - ETA timestamp
 * @param status - Current shipment status
 * @returns True if delayed
 */
export function isShipmentDelayed(eta: string, status: string): boolean {
  if (status === 'Delivered') {
    return false;
  }

  const etaDate = new Date(eta);
  const now = new Date();

  return now > etaDate;
}
