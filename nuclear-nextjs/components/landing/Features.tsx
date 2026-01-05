import { MapPin, Clock, FileCheck, Bell, Shield, Zap } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: MapPin,
      title: 'Real-Time GPS Tracking',
      description: 'Track every shipment with precision GPS monitoring and live location updates',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Clock,
      title: 'Time-Sensitive Routing',
      description: 'Intelligent algorithms optimize routes for time-critical radiopharmaceuticals',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FileCheck,
      title: 'Automated Compliance',
      description: 'Built-in regulatory compliance for nuclear medicine transportation',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Instant notifications for temperature changes, delays, or compliance issues',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'Chain of Custody',
      description: 'Complete audit trail with blockchain-verified custody transfers',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Zap,
      title: 'Instant Deployment',
      description: 'Get up and running in minutes with our plug-and-play system',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-purple-100 rounded-full mb-4">
            <span className="text-purple-600">Features</span>
          </div>
          <h2 className="text-5xl mb-4">Everything you need to succeed</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed specifically for nuclear medicine logistics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
