import { MapPin, Clock, FileCheck, Bell, Shield, Zap } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: MapPin,
      title: 'Real-Time GPS Tracking',
      description: 'Track every shipment with precision GPS monitoring and live location updates'
    },
    {
      icon: Clock,
      title: 'Time-Sensitive Routing',
      description: 'Intelligent algorithms optimize routes for time-critical radiopharmaceuticals'
    },
    {
      icon: FileCheck,
      title: 'Automated Compliance',
      description: 'Built-in regulatory compliance for nuclear medicine transportation'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Instant notifications for temperature changes, delays, or compliance issues'
    },
    {
      icon: Shield,
      title: 'Chain of Custody',
      description: 'Complete audit trail with blockchain-verified custody transfers'
    },
    {
      icon: Zap,
      title: 'Instant Deployment',
      description: 'Get up and running in minutes with our plug-and-play system'
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-card">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-md mb-3 sm:mb-4 border border-primary/20">
            <span className="text-primary font-medium text-sm sm:text-base">Features</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 text-foreground font-semibold">Comprehensive Platform Features</h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Enterprise-grade tools for nuclear medicine logistics management
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-background rounded-md p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow border border-border/50"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/5 rounded-md flex items-center justify-center mb-4 sm:mb-6 border border-primary/10">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-lg sm:text-xl mb-2 sm:mb-3 text-foreground font-medium">{feature.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
