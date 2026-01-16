// Shipment model - Data types for shipment tracking

/**
 * Shipment status workflow
 */
export type ShipmentStatus =
  | 'In Transit'
  | 'At Customs'
  | 'Dispatched'
  | 'Delivered'
  | 'Pending'

/**
 * Route waypoint with coordinates and status
 */
export interface RouteWaypoint {
  name: string;
  coordinates: [number, number]; // [lat, lng]
  timestamp?: string;
  status?: 'completed' | 'current' | 'upcoming';
}

/**
 * Complete shipment entity
 */
export interface Shipment {
  id: string;
  shipment_number: string;
  procurement_request_id?: string;
  batch_number: string;
  isotope: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  status_color: string;
  eta: string;
  initial_activity?: number;
  current_activity?: number;
  expected_activity_at_arrival?: number;
  route_waypoints?: RouteWaypoint[];
  estimated_delivery_time?: string;
  special_handling_instructions?: string;
  temperature_requirements?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create a new shipment
 */
export interface CreateShipmentRequest {
  procurement_request_id?: string;
  batch_number: string;
  isotope: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  initial_activity?: number;
  route_waypoints?: RouteWaypoint[];
  estimated_delivery_time?: string;
  special_handling_instructions?: string;
  temperature_requirements?: string;
}

/**
 * Data for creating shipment from procurement request
 */
export interface ShipmentFromProcurement {
  procurement_request_id: string;
  carrier: string;
  estimated_delivery_time?: string;
  temperature_requirements?: string;
}

/**
 * Filter criteria for shipments
 */
export interface ShipmentFilter {
  status?: ShipmentStatus;
  isotope?: string;
  origin?: string;
  destination?: string;
  procurement_request_id?: string;
  start_date?: string;
  end_date?: string;
  from_procurement?: boolean;
}

/**
 * Shipment statistics for dashboard
 */
export interface ShipmentStats {
  activeCount: number;
  onSchedulePercentage: number;
  pendingCount: number;
  urgentCount: number;
}

/**
 * Sort criteria and direction
 */
export type SortCriteria = 'id' | 'isotope' | 'origin' | 'destination' | 'status' | 'eta' | 'shipment_number' | 'created_at';
export type SortDirection = 'asc' | 'desc';

/**
 * Status color mapping helper
 */
export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  'Pending': 'bg-gray-100 text-gray-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  'At Customs': 'bg-amber-100 text-amber-700',
  'Dispatched': 'bg-green-100 text-green-700',
  'Delivered': 'bg-purple-100 text-purple-700',
};

/**
 * Get status color for a given shipment status
 */
export function getShipmentStatusColor(status: ShipmentStatus): string {
  return SHIPMENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
}
