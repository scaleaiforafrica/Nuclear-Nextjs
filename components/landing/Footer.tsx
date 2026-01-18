'use client';

import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { AnimatedLogo } from '@/components';

export function Footer() {
  return (
    <footer id="company" className="bg-header-footer text-foreground pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center mb-10 sm:mb-12 lg:mb-16">
          {/* Brand Column */}
          <div className="text-center">
            <div className="mb-3 sm:mb-4">
              <AnimatedLogo size="md" showIcon={true} className="text-foreground" />
            </div>
            <p className="mb-4 sm:mb-6 text-muted-foreground text-sm sm:text-base max-w-xs mx-auto">
              Enterprise platform for nuclear medicine supply chain management.
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center">
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-md flex items-center justify-center hover:bg-accent transition-colors touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} ⚛ NUCLEAR. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="#" className="hover:text-accent transition-colors text-muted-foreground py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors text-muted-foreground py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Terms</a>
            <a href="#" className="hover:text-accent transition-colors text-muted-foreground py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
