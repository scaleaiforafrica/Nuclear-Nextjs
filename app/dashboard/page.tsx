import {
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  ArrowRight
} from 'lucide-react'
import {
  getDashboardStats,
  getRecentActivity,
  getUpcomingDeliveries,
  getCompletedDeliveries,
  getComplianceAlerts,
  getActiveShipments
} from '@/lib/api'
import DashboardGreeting from '@/components/DashboardGreeting'

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
            <div key={index} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mb-2">{stat.label}</div>
              <div className={`text-xs sm:text-sm ${stat.textColor}`}>{stat.subtext}</div>
            </div>
          )
        })}
      </div>

      {/* Live Shipment Map + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Live Shipment Map */}
        <div className="lg:col-span-3 bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg sm:text-xl mb-4">Live Shipment Tracking</h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl h-64 sm:h-80 lg:h-96 flex items-center justify-center relative overflow-hidden">
            {/* Simplified Map Visualization */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* Africa outline simplified */}
                <path
                  d="M 400,50 L 450,80 L 480,120 L 490,180 L 480,250 L 450,320 L 400,360 L 350,350 L 320,300 L 310,240 L 320,180 L 350,120 L 380,80 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            {/* Shipment Pins */}
            <div className="relative w-full h-full">
              {[
                { top: '30%', left: '40%', status: 'active' },
                { top: '50%', left: '35%', status: 'warning' },
                { top: '60%', left: '45%', status: 'active' },
                { top: '40%', left: '50%', status: 'success' },
              ].map((pin, i) => (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <MapPin
                    className={`w-8 h-8 ${pin.status === 'active' ? 'text-blue-600' :
                        pin.status === 'warning' ? 'text-amber-600' :
                          'text-green-600'
                      }`}
                    fill="currentColor"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <RecentActivity 
          initialActivities={recentActivity}
          completedDeliveries={completedDeliveries}
        />
      </div>

      {/* Active Shipments Table Preview */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl">Active Shipments</h3>
          <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm self-start sm:self-auto">
            View All Shipments
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Isotope</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeShipments.slice(0, 5).map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-mono">{shipment.id}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{shipment.isotope}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    {shipment.origin} → {shipment.destination}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{shipment.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Alerts + Upcoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg sm:text-xl mb-4">Compliance Alerts</h3>
          <div className="space-y-3">
            {complianceAlerts.length > 0 ? (
              complianceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg ${alert.severity === 'warning'
                      ? 'bg-amber-50 border border-amber-200'
                      : alert.severity === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${alert.severity === 'warning'
                      ? 'bg-amber-600'
                      : alert.severity === 'error'
                        ? 'bg-red-600'
                        : 'bg-blue-600'
                    }`}></div>
                  <div>
                    <p className="text-sm text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-900">All Clear</p>
                  <p className="text-xs text-gray-500 mt-1">No compliance issues at this time</p>
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
