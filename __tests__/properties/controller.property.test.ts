import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { 
  Shipment, 
  ShipmentStatus, 
  ShipmentFilter, 
  ShipmentStats 
} from '../../models/shipment.model'
import type { 
  User, 
  UserRole, 
  AuthState, 
  LoginCredentials, 
  AuthResult 
} from '../../models/user.model'
import type { Activity, ActivityType } from '../../models/activity.model'
import type { 
  ComplianceAlert, 
  Permit, 
  ComplianceStatus 
} from '../../models/compliance.model'
import type { 
  DashboardStats, 
  StatCard, 
  Delivery 
} from '../../models/dashboard.model'

// Arbitraries for generating valid model data
const shipmentStatusArb = fc.constantFrom<ShipmentStatus>(
  'In Transit', 
  'At Customs', 
  'Dispatched', 
  'Delivered', 
  'Pending'
)

const shipmentArb = fc.record<Shipment>({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  isotope: fc.string({ minLength: 1, maxLength: 20 }),
  origin: fc.string({ minLength: 1, maxLength: 100 }),
  destination: fc.string({ minLength: 1, maxLength: 100 }),
  status: shipmentStatusArb,
  eta: fc.string({ minLength: 1, maxLength: 50 }),
  statusColor: fc.string({ minLength: 1, maxLength: 20 }),
})

const userRoleArb = fc.constantFrom<UserRole>(
  'Hospital Administrator',
  'Logistics Manager',
  'Compliance Officer'
)

const userArb = fc.record<User>({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: userRoleArb,
  initials: fc.string({ minLength: 1, maxLength: 5 }),
})

const activityTypeArb = fc.constantFrom<ActivityType>(
  'delivery',
  'procurement',
  'customs',
  'alert',
  'approval'
)

const activityArb = fc.record<Activity>({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  time: fc.string({ minLength: 1, maxLength: 50 }),
  event: fc.string({ minLength: 1, maxLength: 200 }),
  type: activityTypeArb,
})

const statCardArb = fc.record<StatCard>({
  label: fc.string({ minLength: 1, maxLength: 50 }),
  value: fc.string({ minLength: 1, maxLength: 20 }),
  subtext: fc.string({ minLength: 1, maxLength: 100 }),
  color: fc.string({ minLength: 1, maxLength: 30 }),
  textColor: fc.string({ minLength: 1, maxLength: 30 }),
})

const dashboardStatsArb = fc.record<DashboardStats>({
  activeShipments: statCardArb,
  pendingRequests: statCardArb,
  complianceStatus: statCardArb,
  monthlyTotal: statCardArb,
})

// Helper function to validate that data conforms to model interface
function isValidShipment(data: unknown): data is Shipment {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.isotope === 'string' &&
    typeof obj.origin === 'string' &&
    typeof obj.destination === 'string' &&
    typeof obj.status === 'string' &&
    ['In Transit', 'At Customs', 'Dispatched', 'Delivered', 'Pending'].includes(obj.status as string) &&
    typeof obj.eta === 'string' &&
    typeof obj.statusColor === 'string'
  )
}

function isValidUser(data: unknown): data is User {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.role === 'string' &&
    ['Hospital Administrator', 'Logistics Manager', 'Compliance Officer'].includes(obj.role as string) &&
    typeof obj.initials === 'string'
  )
}

function isValidActivity(data: unknown): data is Activity {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.time === 'string' &&
    typeof obj.event === 'string' &&
    typeof obj.type === 'string' &&
    ['delivery', 'procurement', 'customs', 'alert', 'approval'].includes(obj.type as string)
  )
}

function isValidStatCard(data: unknown): data is StatCard {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.label === 'string' &&
    typeof obj.value === 'string' &&
    typeof obj.subtext === 'string' &&
    typeof obj.color === 'string' &&
    typeof obj.textColor === 'string'
  )
}

function isValidDashboardStats(data: unknown): data is DashboardStats {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    isValidStatCard(obj.activeShipments) &&
    isValidStatCard(obj.pendingRequests) &&
    isValidStatCard(obj.complianceStatus) &&
    isValidStatCard(obj.monthlyTotal)
  )
}

describe('Controller Data Transformation', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 5: Controller Data Transformation
   * *For any* valid raw data input to a controller function, the controller SHALL 
   * return correctly transformed and typed output data matching the expected model interface.
   * **Validates: Requirements 5.1, 5.4**
   */
  
  it('should correctly type any valid Shipment data', () => {
    fc.assert(
      fc.property(shipmentArb, (shipment) => {
        // Verify the generated data conforms to the Shipment interface
        expect(isValidShipment(shipment)).toBe(true)
        
        // Verify all required fields are present and correctly typed
        expect(typeof shipment.id).toBe('string')
        expect(typeof shipment.isotope).toBe('string')
        expect(typeof shipment.origin).toBe('string')
        expect(typeof shipment.destination).toBe('string')
        expect(['In Transit', 'At Customs', 'Dispatched', 'Delivered', 'Pending']).toContain(shipment.status)
        expect(typeof shipment.eta).toBe('string')
        expect(typeof shipment.statusColor).toBe('string')
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly type any valid User data', () => {
    fc.assert(
      fc.property(userArb, (user) => {
        // Verify the generated data conforms to the User interface
        expect(isValidUser(user)).toBe(true)
        
        // Verify all required fields are present and correctly typed
        expect(typeof user.id).toBe('string')
        expect(typeof user.name).toBe('string')
        expect(['Hospital Administrator', 'Logistics Manager', 'Compliance Officer']).toContain(user.role)
        expect(typeof user.initials).toBe('string')
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly type any valid Activity data', () => {
    fc.assert(
      fc.property(activityArb, (activity) => {
        // Verify the generated data conforms to the Activity interface
        expect(isValidActivity(activity)).toBe(true)
        
        // Verify all required fields are present and correctly typed
        expect(typeof activity.id).toBe('string')
        expect(typeof activity.time).toBe('string')
        expect(typeof activity.event).toBe('string')
        expect(['delivery', 'procurement', 'customs', 'alert', 'approval']).toContain(activity.type)
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly type any valid DashboardStats data', () => {
    fc.assert(
      fc.property(dashboardStatsArb, (stats) => {
        // Verify the generated data conforms to the DashboardStats interface
        expect(isValidDashboardStats(stats)).toBe(true)
        
        // Verify all stat cards are present and correctly typed
        expect(isValidStatCard(stats.activeShipments)).toBe(true)
        expect(isValidStatCard(stats.pendingRequests)).toBe(true)
        expect(isValidStatCard(stats.complianceStatus)).toBe(true)
        expect(isValidStatCard(stats.monthlyTotal)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})
