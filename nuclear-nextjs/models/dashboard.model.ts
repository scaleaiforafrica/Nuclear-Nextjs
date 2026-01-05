// Dashboard model - Data types for dashboard statistics
export interface DashboardStats {
  activeShipments: StatCard
  pendingRequests: StatCard
  complianceStatus: StatCard
  monthlyTotal: StatCard
}

export interface StatCard {
  label: string
  value: string
  subtext: string
  color: string
  textColor: string
}

export interface Delivery {
  date: string
  time: string
  isotope: string
  destination: string
}
