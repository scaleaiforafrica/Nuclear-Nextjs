'use client';

import { ArrowRight, Check } from 'lucide-react';

export interface FinalCTAProps {
  onOpenLogin: () => void;
}

export function FinalCTA({ onOpenLogin }: FinalCTAProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-primary text-white overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 font-semibold">
            Get Started with NuclearFlow
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 lg:mb-12 text-white/80 max-w-2xl mx-auto px-4 sm:px-0">
            Join leading medical facilities using NUCLEAR to ensure safe, compliant, and efficient radiopharmaceutical delivery.
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
            {[
              '30-day trial period',
              'Enterprise support',
              'Regulatory compliance included'
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm sm:text-base py-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4 sm:px-0">
            <button 
              onClick={onOpenLogin}
              className="bg-card text-primary px-8 sm:px-10 py-3 sm:py-4 rounded-md hover:bg-card/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Request Demo
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="bg-transparent text-white px-8 sm:px-10 py-3 sm:py-4 rounded-md border-2 border-white hover:bg-white/10 transition-colors text-sm sm:text-base font-medium touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
              Contact Sales
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs sm:text-sm text-white/70">
            Trusted by healthcare providers worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
