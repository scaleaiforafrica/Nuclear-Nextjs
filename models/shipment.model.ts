// Shipment model - Data types for shipment tracking
export interface Shipment {
  id: string
  isotope: string
  origin: string
  destination: string
  status: ShipmentStatus
  eta: string
  statusColor: string
}

export type ShipmentStatus = 
  | 'In Transit' 
  | 'At Customs' 
  | 'Dispatched' 
  | 'Delivered' 
  | 'Pending'

export interface ShipmentFilter {
  status?: ShipmentStatus
  isotope?: string
  origin?: string
  destination?: string
}

export interface ShipmentStats {
  activeCount: number
  onSchedulePercentage: number
  pendingCount: number
  urgentCount: number
}
