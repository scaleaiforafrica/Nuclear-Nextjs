// Navigation model - Data types for navigation
import type { ComponentType } from 'react'

export interface NavigationItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
}

export type DashboardPage = 
  | 'dashboard' 
  | 'procurement' 
  | 'shipments' 
  | 'compliance' 
  | 'traceability' 
  | 'reports' 
  | 'settings'
