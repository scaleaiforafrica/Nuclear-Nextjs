'use client';

import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { AnimatedLogo } from '@/components';

export function Footer() {
  return (
    <footer id="company" className="bg-primary text-white pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center mb-10 sm:mb-12 lg:mb-16">
          {/* Brand Column */}
          <div className="text-center">
            <div className="mb-3 sm:mb-4">
              <AnimatedLogo size="md" showIcon={true} className="text-white" />
            </div>
            <p className="mb-4 sm:mb-6 text-white/70 text-sm sm:text-base max-w-xs mx-auto">
              Enterprise platform for nuclear medicine supply chain management.
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center">
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-white/50 text-center sm:text-left">
            © {new Date().getFullYear()} ⚛ NUCLEAR. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="#" className="hover:text-accent transition-colors text-white/70 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors text-white/70 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Terms</a>
            <a href="#" className="hover:text-accent transition-colors text-white/70 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
