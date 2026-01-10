'use client';

import { ArrowRight, Check } from 'lucide-react';

export interface FinalCTAProps {
  onOpenLogin: () => void;
}

export function FinalCTA({ onOpenLogin }: FinalCTAProps) {
  return (
    <section className="py-24 bg-primary text-white overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl mb-6">
            Get Started with NuclearFlow
          </h2>
          <p className="text-xl mb-12 text-purple-100">
            Join leading medical facilities using ⚛ NUCLEAR to ensure safe, compliant, and efficient radiopharmaceutical delivery.
          </p>

          {/* Features List */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              '30-day trial period',
              'Enterprise support',
              'Regulatory compliance included'
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-base">
                <Check className="w-5 h-5 text-white" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={onOpenLogin}
              className="bg-white text-primary px-10 py-4 rounded-md hover:bg-white/90 transition-colors flex items-center justify-center gap-2 text-base font-medium"
            >
              Request Demo
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-transparent text-white px-10 py-4 rounded-md border-2 border-white hover:bg-white/10 transition-colors text-base font-medium">
              Contact Sales
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-white/70">
            Trusted by healthcare providers worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
