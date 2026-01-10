'use client';

import { TrendingUp, Activity, Package } from 'lucide-react';

export function Analytics() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
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
            <div className="h-48 sm:h-56 lg:h-64 flex items-end gap-0.5 sm:gap-1 lg:gap-2 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = Math.random() * 80 + 20;
                const colors = ['bg-secondary', 'bg-accent', 'bg-destructive'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end min-w-[4px]">
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
          <div className="bg-card border border-border/50 rounded-md p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-heading text-base sm:text-lg text-foreground font-medium">Temperature Monitor</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="text-4xl sm:text-5xl text-foreground">2.4°C</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                <span className="text-secondary text-sm sm:text-base">Within range</span>
              </div>
              <div className="pt-3 sm:pt-4">
                <div className="h-24 sm:h-28 lg:h-32 flex items-end gap-0.5 sm:gap-1">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const height = Math.random() * 60 + 40;
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end min-w-[3px]">
                        <div 
                          className="bg-primary rounded-t opacity-70 hover:opacity-100 transition-opacity"
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
