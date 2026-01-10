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
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-md mb-4 border border-primary/20">
            <span className="text-primary font-medium">Features</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl mb-4 text-foreground">Comprehensive Platform Features</h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Enterprise-grade tools for nuclear medicine logistics management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-background rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl mb-3 text-foreground">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
