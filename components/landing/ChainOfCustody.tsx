import { Database, Zap, Shield } from 'lucide-react';

export function ChainOfCustody() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-primary text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 font-semibold">Chain of Custody Management</h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto px-4 sm:px-0">
            Complete tracking and transparency for regulatory compliance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Blockchain Storage */}
          <div className="bg-white/5 backdrop-blur-sm rounded-md p-5 sm:p-6 lg:p-8 border border-white/10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/10 rounded-md flex items-center justify-center mb-4 sm:mb-6">
              <Database className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 font-medium">Blockchain Storage</h3>
            <p className="text-white/80 text-sm sm:text-base">
              Immutable record-keeping ensures complete data integrity and audit trails for all custody transfers.
            </p>
          </div>

          {/* Instant Verification */}
          <div className="bg-white/5 backdrop-blur-sm rounded-md p-5 sm:p-6 lg:p-8 border border-white/10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/10 rounded-md flex items-center justify-center mb-4 sm:mb-6">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 font-medium">Instant Verification</h3>
            <p className="text-white/80 text-sm sm:text-base">
              Real-time verification with cryptographic signatures. Complete visibility into custody chain at all times.
            </p>
          </div>

          {/* Regulatory Compliance */}
          <div className="bg-white/5 backdrop-blur-sm rounded-md p-5 sm:p-6 lg:p-8 border border-white/10 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/10 rounded-md flex items-center justify-center mb-4 sm:mb-6">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 font-medium">Full Compliance</h3>
            <p className="text-white/80 text-sm sm:text-base">
              Automated compliance checks and reporting for all nuclear medicine transport regulations.
            </p>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="mt-10 sm:mt-12 lg:mt-16 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-md p-4 sm:p-6 lg:p-8 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h4 className="text-lg sm:text-xl font-medium">Live Custody Timeline</h4>
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/20 text-white rounded-md text-xs sm:text-sm w-fit border border-secondary/30">Active</span>
            </div>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-white/20"></div>
              
              {/* Timeline Events */}
              <div className="space-y-4 sm:space-y-6">
                {[
                  { time: '09:15 AM', event: 'Package scanned at facility', user: 'John Smith', status: 'completed' },
                  { time: '09:45 AM', event: 'Loaded onto transport vehicle', user: 'Transport Team A', status: 'completed' },
                  { time: '10:30 AM', event: 'In transit to destination', user: 'Driver: Mike Johnson', status: 'active' },
                  { time: '11:00 AM', event: 'Expected delivery', user: 'Medical Center', status: 'pending' }
                ].map((item, index) => (
                  <div key={index} className="relative pl-10 sm:pl-12 flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className={`absolute left-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-secondary border-secondary' :
                      item.status === 'active' ? 'bg-accent border-accent animate-pulse' :
                      'bg-white/10 border-white/30'
                    }`}>
                      {item.status === 'completed' && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-md p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">
                        <span className="text-xs sm:text-sm text-white/60">{item.time}</span>
                        <span className="text-xs sm:text-sm text-white/60">{item.user}</span>
                      </div>
                      <p className="text-sm sm:text-base">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
