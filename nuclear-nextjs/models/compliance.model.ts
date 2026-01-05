// Compliance model - Data types for compliance tracking
export interface ComplianceAlert {
  id: string
  severity: 'warning' | 'info' | 'error'
  title: string
  description: string
}

export interface Permit {
  id: string
  name: string
  expiryDate: Date
  status: 'valid' | 'expiring' | 'expired'
}

export interface ComplianceStatus {
  overallStatus: 'clear' | 'warning' | 'critical'
  alerts: ComplianceAlert[]
  expiringPermits: Permit[]
}
