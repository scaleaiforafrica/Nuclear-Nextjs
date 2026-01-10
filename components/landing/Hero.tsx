'use client';

import { ArrowRight, Menu } from 'lucide-react';
import { AnimatedLogo } from '@/components';

export interface HeroProps {
  onOpenLogin: () => void;
}

export function Hero({ onOpenLogin }: HeroProps) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <AnimatedLogo size="sm" showIcon={true} />
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-foreground hover:text-primary transition-colors">Platform</a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">Solutions</a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">Resources</a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">Company</a>
        </div>
        <button 
          onClick={onOpenLogin}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
        >
          Sign In
        </button>
        <button className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-4 py-2 bg-card border border-primary/20 rounded-md">
            <span className="text-primary font-medium">Professional Medical Logistics Platform</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground">
            Nuclear Medicine<br />
            <span className="text-primary">
              Supply Chain Management
            </span>
          </h1>
          
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Real-time tracking, automated compliance, and intelligent routing for radiopharmaceutical delivery
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onOpenLogin}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-card text-foreground px-8 py-3 rounded-md hover:bg-muted transition-colors border border-border">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-50"></div>
    </div>
  );
}
