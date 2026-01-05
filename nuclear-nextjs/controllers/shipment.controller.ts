// Shipment controller - Business logic for shipment management
import type { Shipment, ShipmentFilter, ShipmentStats, ShipmentStatus } from '@/models'
import type { Result, ValidationError } from '@/lib/types'

// Sort criteria type
export type SortCriteria = 'id' | 'isotope' | 'origin' | 'destination' | 'status' | 'eta'
export type SortDirection = 'asc' | 'desc'

// Mock shipment data (in real app, this would come from an API)
const mockShipments: Shipment[] = [
  {
    id: 'SHP-001',
    isotope: 'Tc-99m',
    origin: 'Oak Ridge, TN',
    destination: 'Memorial Hospital, NYC',
    status: 'In Transit',
    eta: '2024-01-15 14:30',
    statusColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'SHP-002',
    isotope: 'I-131',
    origin: 'Chalk River, ON',
    destination: 'Johns Hopkins, MD',
    status: 'At Customs',
    eta: '2024-01-16 09:00',
    statusColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'SHP-003',
    isotope: 'Mo-99',
    origin: 'ANSTO, Australia',
    destination: 'Mayo Clinic, MN',
    status: 'Dispatched',
    eta: '2024-01-17 16:45',
    statusColor: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'SHP-004',
    isotope: 'F-18',
    origin: 'Nordion, Canada',
    destination: 'Cleveland Clinic, OH',
    status: 'Delivered',
    eta: '2024-01-14 11:00',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 'SHP-005',
    isotope: 'Ga-68',
    origin: 'IRE, Belgium',
    destination: 'Stanford Medical, CA',
    status: 'Pending',
    eta: '2024-01-18 08:30',
    statusColor: 'bg-gray-100 text-gray-800'
  }
]

// In-memory shipment store (can be replaced with API calls)
let shipments: Shipment[] = [...mockShipments]

/**
 * Get all active shipments (non-delivered)
 */
export function getActiveShipments(): Shipment[] {
  return shipments.filter(s => s.status !== 'Delivered')
}

/**
 * Get all shipments
 */
export function getAllShipments(): Shipment[] {
  return [...shipments]
}

/**
 * Get shipment by ID
 */
export function getShipmentById(id: string): Shipment | null {
  return shipments.find(s => s.id === id) || null
}

/**
 * Filter shipments by criteria
 * Returns only shipments that match ALL specified filter conditions
 */
export function filterShipments(shipmentList: Shipment[], criteria: ShipmentFilter): Shipment[] {
  return shipmentList.filter(shipment => {
    // Check each filter criterion - all must match
    if (criteria.status !== undefined && shipment.status !== criteria.status) {
      return false
    }
    if (criteria.isotope !== undefined && shipment.isotope !== criteria.isotope) {
      return false
    }
    if (criteria.origin !== undefined && !shipment.origin.toLowerCase().includes(criteria.origin.toLowerCase())) {
      return false
    }
    if (criteria.destination !== undefined && !shipment.destination.toLowerCase().includes(criteria.destination.toLowerCase())) {
      return false
    }
    return true
  })
}

/**
 * Sort shipments by specified criteria
 */
export function sortShipments(
  shipmentList: Shipment[], 
  sortBy: SortCriteria, 
  direction: SortDirection = 'asc'
): Shipment[] {
  const sorted = [...shipmentList].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
  
  return sorted
}

/**
 * Get shipment statistics
 */
export function getShipmentStats(): ShipmentStats {
  const active = shipments.filter(s => s.status !== 'Delivered')
  const pending = shipments.filter(s => s.status === 'Pending')
  const urgent = shipments.filter(s => s.status === 'At Customs')
  
  // Calculate on-schedule percentage (simplified - in real app would compare ETA to current time)
  const inTransitOrDispatched = shipments.filter(s => 
    s.status === 'In Transit' || s.status === 'Dispatched'
  )
  const onSchedulePercentage = inTransitOrDispatched.length > 0 
    ? Math.round((inTransitOrDispatched.length / active.length) * 100)
    : 100
  
  return {
    activeCount: active.length,
    onSchedulePercentage,
    pendingCount: pending.length,
    urgentCount: urgent.length
  }
}

/**
 * Validate shipment data
 */
export function validateShipment(data: unknown): Result<Shipment, ValidationError> {
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      error: {
        code: 'INVALID_SHIPMENT',
        message: 'Shipment data must be an object'
      }
    }
  }
  
  const obj = data as Record<string, unknown>
  const errors: string[] = []
  
  if (typeof obj.id !== 'string' || obj.id.trim() === '') {
    errors.push('id')
  }
  if (typeof obj.isotope !== 'string' || obj.isotope.trim() === '') {
    errors.push('isotope')
  }
  if (typeof obj.origin !== 'string' || obj.origin.trim() === '') {
    errors.push('origin')
  }
  if (typeof obj.destination !== 'string' || obj.destination.trim() === '') {
    errors.push('destination')
  }
  if (typeof obj.status !== 'string' || !isValidStatus(obj.status)) {
    errors.push('status')
  }
  if (typeof obj.eta !== 'string') {
    errors.push('eta')
  }
  if (typeof obj.statusColor !== 'string') {
    errors.push('statusColor')
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_SHIPMENT',
        message: 'Shipment data is invalid',
        fields: errors
      }
    }
  }
  
  return { success: true, data: data as Shipment }
}

/**
 * Check if status is valid
 */
function isValidStatus(status: string): status is ShipmentStatus {
  return ['In Transit', 'At Customs', 'Dispatched', 'Delivered', 'Pending'].includes(status)
}

/**
 * Set shipments data (useful for testing)
 */
export function setShipments(newShipments: Shipment[]): void {
  shipments = [...newShipments]
}

/**
 * Reset shipments to mock data
 */
export function resetShipments(): void {
  shipments = [...mockShipments]
}
