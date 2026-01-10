import { Database, Zap, Shield } from 'lucide-react';

export function ChainOfCustody() {
  return (
    <section className="py-24 bg-primary text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl mb-4">Chain of Custody Management</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Complete tracking and transparency for regulatory compliance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Blockchain Storage */}
          <div className="bg-card/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-6">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-2xl mb-3">Blockchain Storage</h3>
            <p className="text-white/80">
              Immutable record-keeping ensures complete data integrity and audit trails for all custody transfers.
            </p>
          </div>

          {/* Instant Verification */}
          <div className="bg-card/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-2xl mb-3">Instant Verification</h3>
            <p className="text-white/80">
              Real-time verification with cryptographic signatures. Complete visibility into custody chain at all times.
            </p>
          </div>

          {/* Regulatory Compliance */}
          <div className="bg-card/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-2xl mb-3">Full Compliance</h3>
            <p className="text-white/80">
              Automated compliance checks and reporting for all nuclear medicine transport regulations.
            </p>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-card/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl">Live Custody Timeline</h4>
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm">Active</span>
            </div>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              
              {/* Timeline Events */}
              <div className="space-y-6">
                {[
                  { time: '09:15 AM', event: 'Package scanned at facility', user: 'John Smith', status: 'completed' },
                  { time: '09:45 AM', event: 'Loaded onto transport vehicle', user: 'Transport Team A', status: 'completed' },
                  { time: '10:30 AM', event: 'In transit to destination', user: 'Driver: Mike Johnson', status: 'active' },
                  { time: '11:00 AM', event: 'Expected delivery', user: 'Medical Center', status: 'pending' }
                ].map((item, index) => (
                  <div key={index} className="relative pl-12 flex items-center gap-4">
                    <div className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-green-500 border-green-500' :
                      item.status === 'active' ? 'bg-blue-500 border-blue-500 animate-pulse' :
                      'bg-gray-700 border-gray-600'
                    }`}>
                      {item.status === 'completed' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">{item.time}</span>
                        <span className="text-sm text-gray-500">{item.user}</span>
                      </div>
                      <p>{item.event}</p>
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
