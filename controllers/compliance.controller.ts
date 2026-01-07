// Compliance controller - Business logic for compliance management
import type { ComplianceStatus, ComplianceAlert, Permit } from '@/models'
import type { Result, ValidationError } from '@/lib/types'

// Document interface for pending documents
export interface ComplianceDocument {
  id: string
  name: string
  type: 'license' | 'permit' | 'certificate' | 'report'
  dueDate: Date
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
}

// Mock compliance alerts
const mockAlerts: ComplianceAlert[] = [
  {
    id: 'ALERT-001',
    severity: 'warning',
    title: 'License Renewal Due',
    description: 'NRC License expires in 30 days. Renewal application required.'
  },
  {
    id: 'ALERT-002',
    severity: 'info',
    title: 'Quarterly Report Due',
    description: 'Q1 2024 radiation safety report due by January 31.'
  }
]

// Mock permits
const mockPermits: Permit[] = [
  {
    id: 'PERMIT-001',
    name: 'NRC Radioactive Materials License',
    expiryDate: new Date('2024-02-15'),
    status: 'expiring'
  },
  {
    id: 'PERMIT-002',
    name: 'DOT Hazmat Transportation Permit',
    expiryDate: new Date('2024-06-30'),
    status: 'valid'
  },
  {
    id: 'PERMIT-003',
    name: 'State Radiation Control License',
    expiryDate: new Date('2024-03-01'),
    status: 'expiring'
  },
  {
    id: 'PERMIT-004',
    name: 'EPA Waste Disposal Permit',
    expiryDate: new Date('2025-01-15'),
    status: 'valid'
  }
]

// Mock pending documents
const mockDocuments: ComplianceDocument[] = [
  {
    id: 'DOC-001',
    name: 'Annual Radiation Safety Report',
    type: 'report',
    dueDate: new Date('2024-01-31'),
    status: 'pending'
  },
  {
    id: 'DOC-002',
    name: 'NRC License Renewal Application',
    type: 'license',
    dueDate: new Date('2024-02-01'),
    status: 'pending'
  },
  {
    id: 'DOC-003',
    name: 'Quality Assurance Certificate',
    type: 'certificate',
    dueDate: new Date('2024-02-15'),
    status: 'submitted'
  }
]

// In-memory stores
let alerts: ComplianceAlert[] = [...mockAlerts]
let permits: Permit[] = [...mockPermits]
let documents: ComplianceDocument[] = [...mockDocuments]

/**
 * Calculate overall compliance status based on alerts and permits
 */
function calculateOverallStatus(
  alertList: ComplianceAlert[],
  permitList: Permit[]
): 'clear' | 'warning' | 'critical' {
  // Check for critical conditions
  const hasErrorAlerts = alertList.some(a => a.severity === 'error')
  const hasExpiredPermits = permitList.some(p => p.status === 'expired')
  
  if (hasErrorAlerts || hasExpiredPermits) {
    return 'critical'
  }
  
  // Check for warning conditions
  const hasWarningAlerts = alertList.some(a => a.severity === 'warning')
  const hasExpiringPermits = permitList.some(p => p.status === 'expiring')
  
  if (hasWarningAlerts || hasExpiringPermits) {
    return 'warning'
  }
  
  return 'clear'
}

/**
 * Get current compliance status
 * Aggregates alerts and permit status
 */
export function getComplianceStatus(): ComplianceStatus {
  const expiringPermits = permits.filter(p => 
    p.status === 'expiring' || p.status === 'expired'
  )
  
  return {
    overallStatus: calculateOverallStatus(alerts, permits),
    alerts: [...alerts],
    expiringPermits
  }
}

/**
 * Get permits expiring within specified days
 */
export function getExpiringPermits(days: number): Permit[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  
  return permits.filter(permit => {
    const expiryDate = new Date(permit.expiryDate)
    return expiryDate <= futureDate && permit.status !== 'expired'
  })
}

/**
 * Get all permits
 */
export function getAllPermits(): Permit[] {
  return [...permits]
}

/**
 * Get pending documents
 */
export function getPendingDocuments(): ComplianceDocument[] {
  return documents.filter(doc => doc.status === 'pending')
}

/**
 * Get all documents
 */
export function getAllDocuments(): ComplianceDocument[] {
  return [...documents]
}

/**
 * Get all compliance alerts
 */
export function getAlerts(): ComplianceAlert[] {
  return [...alerts]
}

/**
 * Validate permit data
 */
export function validatePermit(data: unknown): Result<Permit, ValidationError> {
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      error: {
        code: 'INVALID_PERMIT',
        message: 'Permit data must be an object'
      }
    }
  }
  
  const obj = data as Record<string, unknown>
  const errors: string[] = []
  
  if (typeof obj.id !== 'string' || obj.id.trim() === '') {
    errors.push('id')
  }
  if (typeof obj.name !== 'string' || obj.name.trim() === '') {
    errors.push('name')
  }
  if (!(obj.expiryDate instanceof Date) && typeof obj.expiryDate !== 'string') {
    errors.push('expiryDate')
  }
  if (typeof obj.status !== 'string' || !['valid', 'expiring', 'expired'].includes(obj.status)) {
    errors.push('status')
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_PERMIT',
        message: 'Permit data is invalid',
        fields: errors
      }
    }
  }
  
  return { success: true, data: data as Permit }
}

/**
 * Validate compliance alert data
 */
export function validateAlert(data: unknown): Result<ComplianceAlert, ValidationError> {
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      error: {
        code: 'INVALID_ALERT',
        message: 'Alert data must be an object'
      }
    }
  }
  
  const obj = data as Record<string, unknown>
  const errors: string[] = []
  
  if (typeof obj.id !== 'string' || obj.id.trim() === '') {
    errors.push('id')
  }
  if (typeof obj.severity !== 'string' || !['warning', 'info', 'error'].includes(obj.severity)) {
    errors.push('severity')
  }
  if (typeof obj.title !== 'string' || obj.title.trim() === '') {
    errors.push('title')
  }
  if (typeof obj.description !== 'string') {
    errors.push('description')
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_ALERT',
        message: 'Alert data is invalid',
        fields: errors
      }
    }
  }
  
  return { success: true, data: data as ComplianceAlert }
}

/**
 * Set alerts (useful for testing)
 */
export function setAlerts(newAlerts: ComplianceAlert[]): void {
  alerts = [...newAlerts]
}

/**
 * Set permits (useful for testing)
 */
export function setPermits(newPermits: Permit[]): void {
  permits = [...newPermits]
}

/**
 * Set documents (useful for testing)
 */
export function setDocuments(newDocuments: ComplianceDocument[]): void {
  documents = [...newDocuments]
}

/**
 * Reset to mock data
 */
export function resetComplianceData(): void {
  alerts = [...mockAlerts]
  permits = [...mockPermits]
  documents = [...mockDocuments]
}
