import { Database, Zap, Shield } from 'lucide-react';

export function ChainOfCustody() {
  return (
    <section id="chain-of-custody" className="py-24 bg-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl mb-4">Real-Time Chain of Custody</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Immutable tracking with complete transparency and security
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Blockchain Storage */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl mb-3">Blockchain Storage</h3>
              <p className="text-gray-400">
                Every custody transfer is recorded on an immutable blockchain ledger, ensuring complete data integrity and audit trails.
              </p>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-blue-500/10 rounded-2xl -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
          </div>

          {/* Instant Verification */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-yellow-500 transition-all">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-2xl mb-3">Instant Verification</h3>
              <p className="text-gray-400">
                Verify custody transfers in real-time with cryptographic signatures. Know exactly who handled what, when, and where.
              </p>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-yellow-500/10 rounded-2xl -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
          </div>

          {/* Regulatory Compliance */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl mb-3">Full Compliance</h3>
              <p className="text-gray-400">
                Automatically meet all regulatory requirements for nuclear medicine transport with built-in compliance checks and reporting.
              </p>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full bg-green-500/10 rounded-2xl -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 rounded-3xl p-8 border border-gray-700">
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
