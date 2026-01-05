// Dashboard controller - Business logic for dashboard data aggregation
import type { DashboardStats, StatCard, Activity, Delivery } from '@/models'
import type { ComplianceAlert } from '@/models'
import { getShipmentStats, getActiveShipments } from './shipment.controller'
import { getComplianceStatus } from './compliance.controller'

// Mock activity data
const mockActivities: Activity[] = [
  {
    id: 'ACT-001',
    time: '10:30 AM',
    event: 'Shipment SHP-001 cleared customs in Newark',
    type: 'customs'
  },
  {
    id: 'ACT-002',
    time: '09:45 AM',
    event: 'New procurement request submitted for Tc-99m',
    type: 'procurement'
  },
  {
    id: 'ACT-003',
    time: '09:15 AM',
    event: 'Delivery confirmed at Memorial Hospital',
    type: 'delivery'
  },
  {
    id: 'ACT-004',
    time: '08:30 AM',
    event: 'Compliance alert: License renewal due in 30 days',
    type: 'alert'
  },
  {
    id: 'ACT-005',
    time: '08:00 AM',
    event: 'Quality inspection approved for batch B-2024-001',
    type: 'approval'
  }
]

// Mock upcoming deliveries
const mockDeliveries: Delivery[] = [
  {
    date: '2024-01-15',
    time: '14:30',
    isotope: 'Tc-99m',
    destination: 'Memorial Hospital, NYC'
  },
  {
    date: '2024-01-16',
    time: '09:00',
    isotope: 'I-131',
    destination: 'Johns Hopkins, MD'
  },
  {
    date: '2024-01-17',
    time: '16:45',
    isotope: 'Mo-99',
    destination: 'Mayo Clinic, MN'
  },
  {
    date: '2024-01-18',
    time: '08:30',
    isotope: 'Ga-68',
    destination: 'Stanford Medical, CA'
  }
]

// In-memory stores
let activities: Activity[] = [...mockActivities]
let deliveries: Delivery[] = [...mockDeliveries]

/**
 * Create a stat card with consistent structure
 */
function createStatCard(
  label: string,
  value: string,
  subtext: string,
  color: string,
  textColor: string
): StatCard {
  return { label, value, subtext, color, textColor }
}

/**
 * Get dashboard statistics
 * Aggregates data from shipments and compliance
 */
export function getDashboardStats(): DashboardStats {
  const shipmentStats = getShipmentStats()
  const complianceStatus = getComplianceStatus()
  
  // Determine compliance status display
  let complianceValue: string
  let complianceSubtext: string
  let complianceColor: string
  let complianceTextColor: string
  
  switch (complianceStatus.overallStatus) {
    case 'clear':
      complianceValue = 'Clear'
      complianceSubtext = 'All requirements met'
      complianceColor = 'bg-green-50'
      complianceTextColor = 'text-green-600'
      break
    case 'warning':
      complianceValue = 'Warning'
      complianceSubtext = `${complianceStatus.alerts.length} items need attention`
      complianceColor = 'bg-yellow-50'
      complianceTextColor = 'text-yellow-600'
      break
    case 'critical':
      complianceValue = 'Critical'
      complianceSubtext = `${complianceStatus.alerts.length} urgent issues`
      complianceColor = 'bg-red-50'
      complianceTextColor = 'text-red-600'
      break
  }
  
  return {
    activeShipments: createStatCard(
      'Active Shipments',
      shipmentStats.activeCount.toString(),
      `${shipmentStats.onSchedulePercentage}% on schedule`,
      'bg-blue-50',
      'text-blue-600'
    ),
    pendingRequests: createStatCard(
      'Pending Requests',
      shipmentStats.pendingCount.toString(),
      `${shipmentStats.urgentCount} urgent`,
      'bg-orange-50',
      'text-orange-600'
    ),
    complianceStatus: createStatCard(
      'Compliance Status',
      complianceValue,
      complianceSubtext,
      complianceColor,
      complianceTextColor
    ),
    monthlyTotal: createStatCard(
      'Monthly Total',
      '47',
      '+12% from last month',
      'bg-purple-50',
      'text-purple-600'
    )
  }
}

/**
 * Get recent activity
 * Returns the most recent activities
 */
export function getRecentActivity(limit: number = 5): Activity[] {
  return activities.slice(0, limit)
}

/**
 * Get all activities
 */
export function getAllActivities(): Activity[] {
  return [...activities]
}

/**
 * Get upcoming deliveries
 * Returns deliveries sorted by date/time
 */
export function getUpcomingDeliveries(limit: number = 4): Delivery[] {
  const sorted = [...deliveries].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })
  
  return sorted.slice(0, limit)
}

/**
 * Get all deliveries
 */
export function getAllDeliveries(): Delivery[] {
  return [...deliveries]
}

/**
 * Get compliance alerts for dashboard
 */
export function getComplianceAlerts(): ComplianceAlert[] {
  const status = getComplianceStatus()
  return status.alerts
}

/**
 * Set activities (useful for testing)
 */
export function setActivities(newActivities: Activity[]): void {
  activities = [...newActivities]
}

/**
 * Set deliveries (useful for testing)
 */
export function setDeliveries(newDeliveries: Delivery[]): void {
  deliveries = [...newDeliveries]
}

/**
 * Reset to mock data
 */
export function resetDashboardData(): void {
  activities = [...mockActivities]
  deliveries = [...mockDeliveries]
}
