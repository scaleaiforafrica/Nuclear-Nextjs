'use client';

import { TrendingUp, Activity, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Analytics() {
  // Hard-coded delivery performance data
  const deliveryData = [
    { day: 'Day 1', onTime: 45, delayed: 5, critical: 2 },
    { day: 'Day 2', onTime: 52, delayed: 3, critical: 1 },
    { day: 'Day 3', onTime: 48, delayed: 6, critical: 2 },
    { day: 'Day 4', onTime: 55, delayed: 4, critical: 1 },
    { day: 'Day 5', onTime: 50, delayed: 7, critical: 3 },
    { day: 'Day 6', onTime: 58, delayed: 2, critical: 0 },
    { day: 'Day 7', onTime: 60, delayed: 3, critical: 1 },
    { day: 'Day 8', onTime: 54, delayed: 5, critical: 2 },
    { day: 'Day 9', onTime: 57, delayed: 4, critical: 1 },
    { day: 'Day 10', onTime: 62, delayed: 2, critical: 1 },
    { day: 'Day 11', onTime: 59, delayed: 3, critical: 0 },
    { day: 'Day 12', onTime: 61, delayed: 4, critical: 2 },
    { day: 'Day 13', onTime: 56, delayed: 5, critical: 1 },
    { day: 'Day 14', onTime: 63, delayed: 2, critical: 0 },
    { day: 'Day 15', onTime: 58, delayed: 4, critical: 1 },
    { day: 'Day 16', onTime: 60, delayed: 3, critical: 2 },
    { day: 'Day 17', onTime: 65, delayed: 2, critical: 1 },
    { day: 'Day 18', onTime: 62, delayed: 5, critical: 1 },
    { day: 'Day 19', onTime: 67, delayed: 3, critical: 0 },
    { day: 'Day 20', onTime: 64, delayed: 4, critical: 2 },
    { day: 'Day 21', onTime: 68, delayed: 2, critical: 1 },
    { day: 'Day 22', onTime: 66, delayed: 3, critical: 1 },
    { day: 'Day 23', onTime: 70, delayed: 2, critical: 0 },
    { day: 'Day 24', onTime: 65, delayed: 4, critical: 1 },
    { day: 'Day 25', onTime: 69, delayed: 3, critical: 2 },
    { day: 'Day 26', onTime: 72, delayed: 2, critical: 1 },
    { day: 'Day 27', onTime: 68, delayed: 3, critical: 0 },
    { day: 'Day 28', onTime: 71, delayed: 2, critical: 1 },
    { day: 'Day 29', onTime: 74, delayed: 3, critical: 1 },
    { day: 'Day 30', onTime: 70, delayed: 2, critical: 0 },
  ];

  // Hard-coded temperature data for thermometer
  const temperatureData = [
    { hour: '00:00', temp: 2.2 },
    { hour: '01:00', temp: 2.1 },
    { hour: '02:00', temp: 2.3 },
    { hour: '03:00', temp: 2.4 },
    { hour: '04:00', temp: 2.2 },
    { hour: '05:00', temp: 2.3 },
    { hour: '06:00', temp: 2.5 },
    { hour: '07:00', temp: 2.4 },
    { hour: '08:00', temp: 2.6 },
    { hour: '09:00', temp: 2.5 },
    { hour: '10:00', temp: 2.4 },
    { hour: '11:00', temp: 2.3 },
    { hour: '12:00', temp: 2.5 },
    { hour: '13:00', temp: 2.6 },
    { hour: '14:00', temp: 2.4 },
    { hour: '15:00', temp: 2.5 },
    { hour: '16:00', temp: 2.3 },
    { hour: '17:00', temp: 2.4 },
    { hour: '18:00', temp: 2.2 },
    { hour: '19:00', temp: 2.3 },
    { hour: '20:00', temp: 2.5 },
    { hour: '21:00', temp: 2.4 },
    { hour: '22:00', temp: 2.3 },
    { hour: '23:00', temp: 2.4 },
  ];

  // Current temperature for thermometer display
  const currentTemp = 2.4;
  const minTemp = 0;
  const maxTemp = 8;
  const optimalMin = 2;
  const optimalMax = 4;

  return (
    <section id="solutions" className="py-16 sm:py-20 lg:py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 text-foreground font-semibold">Analytics & Reporting</h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">Comprehensive insights for operational excellence</p>
        </div>

        {/* Dashboard Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Main Chart Card */}
          <div className="lg:col-span-2 bg-card border border-border/50 rounded-md p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="font-heading text-base sm:text-lg mb-1 text-foreground font-medium">Delivery Performance</h3>
                <p className="text-muted-foreground text-sm">Last 30 days</p>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-secondary rounded-full"></div>
                  <span className="text-xs sm:text-sm text-muted-foreground">On Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent rounded-full"></div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-destructive rounded-full"></div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Critical</span>
                </div>
              </div>
            </div>
            
            {/* Bar Chart Visualization */}
            <div className="h-48 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                    hide
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="onTime" stackId="a" fill="hsl(var(--secondary))" name="On Time" />
                  <Bar dataKey="delayed" stackId="a" fill="hsl(var(--accent))" name="Delayed" />
                  <Bar dataKey="critical" stackId="a" fill="hsl(var(--destructive))" name="Critical" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Monitor */}
          <div className="bg-card border border-border/50 rounded-md p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-heading text-base sm:text-lg text-foreground font-medium">Temperature Monitor</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="text-4xl sm:text-5xl text-foreground">{currentTemp}°C</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                <span className="text-secondary text-sm sm:text-base">Within range</span>
              </div>
              
              {/* Thermometer Visualization */}
              <div className="pt-3 sm:pt-4">
                <div className="flex gap-4">
                  {/* Thermometer Column */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-40 w-8 bg-gray-200 rounded-full overflow-hidden">
                      {/* Optimal range indicator */}
                      <div 
                        className="absolute w-full bg-green-100 opacity-50"
                        style={{
                          bottom: `${(optimalMin / maxTemp) * 100}%`,
                          height: `${((optimalMax - optimalMin) / maxTemp) * 100}%`
                        }}
                      ></div>
                      {/* Current temperature fill */}
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transition-all"
                        style={{ height: `${(currentTemp / maxTemp) * 100}%` }}
                      ></div>
                      {/* Thermometer bulb */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full border-4 border-white"></div>
                    </div>
                    {/* Temperature scale */}
                    <div className="text-xs text-gray-500 space-y-1 text-center">
                      <div>{maxTemp}°C</div>
                      <div className="h-8"></div>
                      <div className="text-green-600 font-semibold">{optimalMax}°C</div>
                      <div className="h-4"></div>
                      <div className="text-green-600 font-semibold">{optimalMin}°C</div>
                      <div className="h-8"></div>
                      <div>{minTemp}°C</div>
                    </div>
                  </div>
                  
                  {/* Temperature trend mini chart */}
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-2">24h Trend</div>
                    <div className="h-32 flex items-end gap-0.5">
                      {temperatureData.map((data, i) => {
                        const height = ((data.temp - minTemp) / (maxTemp - minTemp)) * 100;
                        const isOptimal = data.temp >= optimalMin && data.temp <= optimalMax;
                        return (
                          <div key={i} className="flex-1 flex flex-col justify-end min-w-[2px] group relative">
                            <div 
                              className={`${isOptimal ? 'bg-green-500' : 'bg-blue-400'} rounded-t opacity-70 hover:opacity-100 transition-opacity`}
                              style={{ height: `${height}%` }}
                            ></div>
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card text-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {data.hour}: {data.temp}°C
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card border border-secondary/20 rounded-md p-5 sm:p-6 lg:p-8 hover:shadow-md transition-shadow">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-3 sm:mb-4" strokeWidth={1.5} />
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 text-foreground">1,247</div>
            <div className="text-muted-foreground text-sm sm:text-base">Active Shipments</div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-secondary">+12% from last month</div>
          </div>
          
          <div className="bg-card border border-secondary/20 rounded-md p-5 sm:p-6 lg:p-8 hover:shadow-md transition-shadow">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-3 sm:mb-4" strokeWidth={1.5} />
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 text-foreground">98.7%</div>
            <div className="text-muted-foreground text-sm sm:text-base">On-Time Delivery</div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-secondary">+2.3% improvement</div>
          </div>
          
          <div className="bg-card border border-secondary/20 rounded-md p-5 sm:p-6 lg:p-8 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-3 sm:mb-4" strokeWidth={1.5} />
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 text-foreground">100%</div>
            <div className="text-muted-foreground text-sm sm:text-base">Compliance Rate</div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-secondary">All shipments monitored</div>
          </div>
        </div>
      </div>
    </section>
  );
}
