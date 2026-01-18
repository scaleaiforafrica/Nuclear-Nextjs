import {
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import {
  getDashboardStats,
  getRecentActivity,
  getUpcomingDeliveries,
  getCompletedDeliveries,
  getComplianceAlerts,
  getActiveShipments
} from '@/lib/api'
import DashboardGreeting from '@/components/DashboardGreeting'
import UpcomingDeliveries from '@/components/shared/UpcomingDeliveries'
import RecentActivity from '@/components/shared/RecentActivity'
import { LiveTrackingMap } from '@/components/dashboard'
import { 
  MobileOnly, 
  DesktopOnly, 
  MobileTableCard, 
  MobileTableCardRow 
} from '@/components/responsive'

export default async function DashboardPage() {

  const dashboardStats = await getDashboardStats()
  const recentActivity = await getRecentActivity(5)
  const upcomingDeliveries = await getUpcomingDeliveries(4)
  const completedDeliveries = await getCompletedDeliveries(24)
  const complianceAlerts = await getComplianceAlerts()
  const activeShipments = await getActiveShipments()

  const stats = [
    {
      label: dashboardStats.activeShipments.label,
      value: dashboardStats.activeShipments.value,
      subtext: dashboardStats.activeShipments.subtext,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      label: dashboardStats.pendingRequests.label,
      value: dashboardStats.pendingRequests.value,
      subtext: dashboardStats.pendingRequests.subtext,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600'
    },
    {
      label: dashboardStats.complianceStatus.label,
      value: dashboardStats.complianceStatus.value,
      subtext: dashboardStats.complianceStatus.subtext,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      label: dashboardStats.monthlyTotal.label,
      value: dashboardStats.monthlyTotal.value,
      subtext: dashboardStats.monthlyTotal.subtext,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
  ]

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-100 text-blue-700'
      case 'At Customs':
        return 'bg-amber-100 text-amber-700'
      case 'Dispatched':
        return 'bg-green-100 text-green-700'
      case 'Delivered':
        return 'bg-gray-100 text-gray-700'
      case 'Pending':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Banner + Quick Actions */}
      <DashboardGreeting />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-card rounded-xl p-4 sm:p-6 border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl mb-1 text-gray-100">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-400 mb-2">{stat.label}</div>
              <div className={`text-xs sm:text-sm ${stat.textColor}`}>{stat.subtext}</div>
            </div>
          )
        })}
      </div>

      {/* Live Shipment Map + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Live Shipment Map */}
        <div className="lg:col-span-3 bg-card rounded-xl p-4 sm:p-6 border border-border">
          <h3 className="text-lg sm:text-xl mb-4 text-gray-100">Live Shipment Tracking</h3>
          <div className="h-64 sm:h-80 lg:h-96">
            <LiveTrackingMap />
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-card rounded-xl p-4 sm:p-6 border border-border">
          <h3 className="text-lg sm:text-xl mb-4 text-gray-100">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{activity.event}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            {/* Show more button on mobile */}
            <Link 
              href="/dashboard/reports" 
              className="md:hidden w-full text-center text-sm text-purple-600 hover:text-purple-700 py-2 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded-sm"
            >
              View All Activity
            </Link>
          </div>
        </div>
      </div>

      {/* Active Shipments Table Preview */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl text-gray-100">Active Shipments</h3>
          <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm self-start sm:self-auto">
            View All Shipments
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Desktop Table View */}
        <DesktopOnly>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Isotope</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Route</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeShipments.slice(0, 5).map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-muted transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-300">{shipment.id}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">{shipment.isotope}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                      {shipment.origin} → {shipment.destination}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">{shipment.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DesktopOnly>

        {/* Mobile Card View */}
        <MobileOnly>
          <div className="p-4 space-y-3">
            {activeShipments.slice(0, 5).map((shipment) => (
              <MobileTableCard key={shipment.id}>
                <MobileTableCardRow 
                  label="ID" 
                  value={<span className="font-mono text-xs">{shipment.id}</span>} 
                />
                <MobileTableCardRow 
                  label="Isotope" 
                  value={shipment.isotope} 
                />
                <MobileTableCardRow 
                  label="Route" 
                  value={
                    <span className="text-xs">
                      {shipment.origin} → {shipment.destination}
                    </span>
                  } 
                />
                <MobileTableCardRow 
                  label="Status" 
                  value={
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  } 
                />
                <MobileTableCardRow 
                  label="ETA" 
                  value={shipment.eta} 
                />
              </MobileTableCard>
            ))}
          </div>
        </MobileOnly>
      </div>

      {/* Compliance Alerts + Upcoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Compliance Alerts */}
        <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
          <h3 className="text-lg sm:text-xl mb-4 text-gray-100">Compliance Alerts</h3>
          <div className="space-y-3">
            {complianceAlerts.length > 0 ? (
              complianceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg ${alert.severity === 'warning'
                      ? 'bg-amber-900/20 border border-amber-700/30'
                      : alert.severity === 'error'
                        ? 'bg-red-900/20 border border-red-700/30'
                        : 'bg-blue-900/20 border border-blue-700/30'
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${alert.severity === 'warning'
                      ? 'bg-amber-500'
                      : alert.severity === 'error'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}></div>
                  <div>
                    <p className="text-sm text-gray-200">{alert.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-200">All Clear</p>
                  <p className="text-xs text-gray-400 mt-1">No compliance issues at this time</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <UpcomingDeliveries 
          initialDeliveries={upcomingDeliveries}
        />
      </div>
    </div>
  )
}
