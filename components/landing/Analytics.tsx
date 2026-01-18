'use client';

import { TrendingUp, Activity, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Hard-coded delivery performance data for the last 30 days
const deliveryData = [
  { day: 1, onTime: 42, delayed: 8, critical: 2 },
  { day: 2, onTime: 45, delayed: 6, critical: 1 },
  { day: 3, onTime: 38, delayed: 10, critical: 3 },
  { day: 4, onTime: 50, delayed: 5, critical: 1 },
  { day: 5, onTime: 48, delayed: 7, critical: 2 },
  { day: 6, onTime: 35, delayed: 12, critical: 4 },
  { day: 7, onTime: 40, delayed: 9, critical: 2 },
  { day: 8, onTime: 46, delayed: 6, critical: 1 },
  { day: 9, onTime: 44, delayed: 8, critical: 2 },
  { day: 10, onTime: 52, delayed: 4, critical: 1 },
  { day: 11, onTime: 47, delayed: 7, critical: 2 },
  { day: 12, onTime: 43, delayed: 9, critical: 3 },
  { day: 13, onTime: 49, delayed: 6, critical: 1 },
  { day: 14, onTime: 41, delayed: 10, critical: 2 },
  { day: 15, onTime: 51, delayed: 5, critical: 1 },
  { day: 16, onTime: 45, delayed: 8, critical: 2 },
  { day: 17, onTime: 48, delayed: 6, critical: 2 },
  { day: 18, onTime: 39, delayed: 11, critical: 3 },
  { day: 19, onTime: 53, delayed: 4, critical: 1 },
  { day: 20, onTime: 46, delayed: 7, critical: 2 },
  { day: 21, onTime: 42, delayed: 9, critical: 3 },
  { day: 22, onTime: 50, delayed: 5, critical: 1 },
  { day: 23, onTime: 44, delayed: 8, critical: 2 },
  { day: 24, onTime: 47, delayed: 7, critical: 2 },
  { day: 25, onTime: 49, delayed: 6, critical: 1 },
  { day: 26, onTime: 41, delayed: 10, critical: 3 },
  { day: 27, onTime: 54, delayed: 4, critical: 1 },
  { day: 28, onTime: 46, delayed: 8, critical: 2 },
  { day: 29, onTime: 43, delayed: 9, critical: 2 },
  { day: 30, onTime: 51, delayed: 5, critical: 1 },
];

// Calculate totals for pie chart
const totalOnTime = deliveryData.reduce((sum, day) => sum + day.onTime, 0);
const totalDelayed = deliveryData.reduce((sum, day) => sum + day.delayed, 0);
const totalCritical = deliveryData.reduce((sum, day) => sum + day.critical, 0);

const pieData = [
  { name: 'On Time', value: totalOnTime },
  { name: 'Delayed', value: totalDelayed },
  { name: 'Critical', value: totalCritical },
];

export function Analytics() {
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
                <BarChart data={deliveryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(64, 126, 140, 0.2)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickFormatter={(value) => value % 5 === 0 ? value : ''}
                  />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Bar dataKey="onTime" stackId="a" fill="var(--secondary)" name="On Time" />
                  <Bar dataKey="delayed" stackId="a" fill="var(--accent)" name="Delayed" />
                  <Bar dataKey="critical" stackId="a" fill="var(--destructive)" name="Critical" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="bg-card border border-border/50 rounded-md p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-heading text-base sm:text-lg text-foreground font-medium">Distribution</h3>
            </div>
            <div className="h-48 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="var(--secondary)" />
                    <Cell fill="var(--accent)" />
                    <Cell fill="var(--destructive)" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Deliveries:</span>
                <span className="font-medium text-foreground">{totalOnTime + totalDelayed + totalCritical}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-medium text-secondary">
                  {((totalOnTime / (totalOnTime + totalDelayed + totalCritical)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card border border-secondary/20 rounded-md p-5 sm:p-6 lg:p-8 hover:shadow-md transition-shadow">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-3 sm:mb-4" strokeWidth={1.5} />
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 text-foreground">{totalOnTime + totalDelayed + totalCritical}</div>
            <div className="text-muted-foreground text-sm sm:text-base">Total Deliveries (30 days)</div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-secondary">{totalOnTime} delivered on time</div>
          </div>
          
          <div className="bg-card border border-secondary/20 rounded-md p-5 sm:p-6 lg:p-8 hover:shadow-md transition-shadow">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-3 sm:mb-4" strokeWidth={1.5} />
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 text-foreground">
              {((totalOnTime / (totalOnTime + totalDelayed + totalCritical)) * 100).toFixed(1)}%
            </div>
            <div className="text-muted-foreground text-sm sm:text-base">On-Time Delivery Rate</div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-secondary">Excellent performance</div>
          </div>
          
          <div className="bg-card border border-destructive/20 rounded-md p-5 sm:p-6 lg:p-8 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-destructive mb-3 sm:mb-4" strokeWidth={1.5} />
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 text-foreground">{totalCritical}</div>
            <div className="text-muted-foreground text-sm sm:text-base">Critical Deliveries</div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-destructive">Requiring immediate attention</div>
          </div>
        </div>
      </div>
    </section>
  );
}
