'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { AnimatedLogo } from '@/components';

export interface HeroProps {
  onOpenLogin: () => void;
}

export function Hero({ onOpenLogin }: HeroProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '#', label: 'Platform' },
    { href: '#', label: 'Solutions' },
    { href: '#', label: 'Resources' },
    { href: '#', label: 'Company' },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-50">
        <AnimatedLogo size="sm" showIcon={true} />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href} 
              className="text-foreground hover:text-primary transition-colors text-sm lg:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        {/* Desktop Sign In Button */}
        <button 
          onClick={onOpenLogin}
          className="hidden md:block bg-primary text-primary-foreground px-4 lg:px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm lg:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Sign In
        </button>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 -mr-2 rounded-md hover:bg-muted transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-card z-50 transform transition-transform duration-300 ease-out md:hidden shadow-xl ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full safe-area-inset-top safe-area-inset-bottom">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <AnimatedLogo size="sm" showIcon={true} />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-muted transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Mobile Menu Links */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors text-base font-medium touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-border">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium text-base touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32 text-center">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-card border border-secondary/20 rounded-md">
            <span className="text-secondary font-medium text-sm sm:text-base">Professional Medical Logistics Platform</span>
          </div>
          
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-foreground leading-tight font-semibold">
            Nuclear Medicine<br />
            <span className="text-primary">
              Supply Chain Management
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Real-time tracking, automated compliance, and intelligent routing for radiopharmaceutical delivery
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <button 
              onClick={onOpenLogin}
              className="bg-primary text-primary-foreground px-6 sm:px-8 py-3 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium text-base touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="mailto:scaleaiforafrica@gmail.com?subject=Schedule%20Demo%20Request&body=Hello%2C%0A%0AI%20would%20like%20to%20schedule%20a%20demo%20of%20NuclearFlow.%0A%0AYou%20can%20also%20reach%20us%20at%3A%20%2B263%2078544753"
              className="bg-card text-foreground px-6 sm:px-8 py-3 rounded-md hover:bg-muted transition-colors border border-secondary text-base touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex items-center justify-center"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
