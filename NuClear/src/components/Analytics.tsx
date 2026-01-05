import { TrendingUp, Activity, Package } from 'lucide-react';

export function Analytics() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-4">Powerful Analytics Dashboard</h2>
          <p className="text-xl text-gray-600">Real-time insights into your entire logistics operation</p>
        </div>

        {/* Dashboard Preview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Main Chart Card */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg mb-1">Delivery Performance</h3>
                <p className="text-gray-500">Last 30 days</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">On Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Critical</span>
                </div>
              </div>
            </div>
            
            {/* Bar Chart Visualization */}
            <div className="h-64 flex items-end gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = Math.random() * 80 + 20;
                const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div 
                      className={`${color} rounded-t transition-all hover:opacity-80`}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Temperature Monitor */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg">Temperature Monitor</h3>
            </div>
            <div className="space-y-4">
              <div className="text-5xl">2.4°C</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-green-600">Within range</span>
              </div>
              <div className="pt-4">
                <div className="h-32 flex items-end gap-1">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const height = Math.random() * 60 + 40;
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end">
                        <div 
                          className="bg-blue-600 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-8 hover:scale-105 transition-transform">
            <Package className="w-10 h-10 text-purple-600 mb-4" />
            <div className="text-4xl mb-2">1,247</div>
            <div className="text-gray-700">Active Shipments</div>
            <div className="mt-4 text-sm text-purple-600">+12% from last month</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-8 hover:scale-105 transition-transform">
            <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
            <div className="text-4xl mb-2">98.7%</div>
            <div className="text-gray-700">On-Time Delivery</div>
            <div className="mt-4 text-sm text-green-600">+2.3% improvement</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 hover:scale-105 transition-transform">
            <Activity className="w-10 h-10 text-blue-600 mb-4" />
            <div className="text-4xl mb-2">100%</div>
            <div className="text-gray-700">Compliance Rate</div>
            <div className="mt-4 text-sm text-blue-600">All shipments monitored</div>
          </div>
        </div>
      </div>
    </section>
  );
}
