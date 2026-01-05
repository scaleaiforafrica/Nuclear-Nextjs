import { 
  Package, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  MapPin,
  Plus,
  Search,
  FileText,
  ArrowRight
} from 'lucide-react';

export function DashboardHome() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const stats = [
    { 
      label: 'Active Shipments', 
      value: '24', 
      subtext: '92% On Schedule', 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Pending Requests', 
      value: '7', 
      subtext: '3 Urgent', 
      icon: Clock, 
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600'
    },
    { 
      label: 'Compliance Status', 
      value: 'All Clear', 
      subtext: 'No issues', 
      icon: CheckCircle, 
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    { 
      label: 'This Month', 
      value: '142', 
      subtext: '88% of target', 
      icon: TrendingUp, 
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
  ];

  const recentActivity = [
    { time: '10 min ago', event: 'Shipment #SH-2847 delivered to City Hospital', type: 'delivery' },
    { time: '25 min ago', event: 'New procurement request for F-18 FDG', type: 'procurement' },
    { time: '1 hour ago', event: 'Customs clearance completed for #SH-2845', type: 'customs' },
    { time: '2 hours ago', event: 'Temperature alert resolved for #SH-2843', type: 'alert' },
    { time: '3 hours ago', event: 'Purchase order PO-1247 approved', type: 'approval' },
  ];

  const activeShipments = [
    { 
      id: 'SH-2851', 
      isotope: 'Tc-99m', 
      origin: 'Johannesburg', 
      destination: 'Cape Town', 
      status: 'In Transit', 
      eta: '2 hours',
      statusColor: 'bg-blue-100 text-blue-700'
    },
    { 
      id: 'SH-2850', 
      isotope: 'F-18 FDG', 
      origin: 'Nairobi', 
      destination: 'Mombasa', 
      status: 'At Customs', 
      eta: '4 hours',
      statusColor: 'bg-amber-100 text-amber-700'
    },
    { 
      id: 'SH-2849', 
      isotope: 'I-131', 
      origin: 'Lagos', 
      destination: 'Accra', 
      status: 'In Transit', 
      eta: '6 hours',
      statusColor: 'bg-blue-100 text-blue-700'
    },
    { 
      id: 'SH-2848', 
      isotope: 'Lu-177', 
      origin: 'Cairo', 
      destination: 'Alexandria', 
      status: 'Dispatched', 
      eta: '1 hour',
      statusColor: 'bg-green-100 text-green-700'
    },
    { 
      id: 'SH-2847', 
      isotope: 'Tc-99m', 
      origin: 'Dar es Salaam', 
      destination: 'Dodoma', 
      status: 'Delivered', 
      eta: 'Completed',
      statusColor: 'bg-gray-100 text-gray-700'
    },
  ];

  const upcomingDeliveries = [
    { date: 'Today', time: '2:00 PM', isotope: 'Tc-99m', destination: 'City Hospital' },
    { date: 'Today', time: '4:30 PM', isotope: 'F-18 FDG', destination: 'Regional Medical' },
    { date: 'Tomorrow', time: '9:00 AM', isotope: 'I-131', destination: 'Central Clinic' },
    { date: 'Tomorrow', time: '11:00 AM', isotope: 'Lu-177', destination: 'Metro Hospital' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner + Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Good morning, Dr. Sarah Johnson</h2>
            <p className="text-purple-100">{currentDate}</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Procurement
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
              <Search className="w-5 h-5" />
              Track Shipment
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
              <div className={`text-sm ${stat.textColor}`}>{stat.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Live Shipment Map + Recent Activity */}
      <div className="grid grid-cols-5 gap-6">
        {/* Live Shipment Map */}
        <div className="col-span-3 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl mb-4">Live Shipment Tracking</h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl h-96 flex items-center justify-center relative overflow-hidden">
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
                    className={`w-8 h-8 ${
                      pin.status === 'active' ? 'text-blue-600' :
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
        <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.event}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Shipments Table Preview */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl">Active Shipments</h3>
          <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm">
            View All Shipments
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Isotope</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeShipments.map((shipment, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{shipment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{shipment.isotope}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {shipment.origin} → {shipment.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs ${shipment.statusColor}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{shipment.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Alerts + Upcoming Deliveries */}
      <div className="grid grid-cols-2 gap-6">
        {/* Compliance Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl mb-4">Compliance Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">3 permits expiring in 7 days</p>
                <p className="text-xs text-gray-500 mt-1">Review and renew transport permits</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">Certificate of Analysis pending for #SH-2850</p>
                <p className="text-xs text-gray-500 mt-1">Upload required documentation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl mb-4">Upcoming Deliveries</h3>
          <div className="space-y-3">
            {upcomingDeliveries.map((delivery, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="text-center flex-shrink-0">
                  <div className="text-xs text-gray-500">{delivery.date}</div>
                  <div className="text-sm">{delivery.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{delivery.isotope}</div>
                  <div className="text-xs text-gray-500">{delivery.destination}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
