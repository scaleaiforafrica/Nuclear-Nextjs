import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { AnimatedLogo } from '@/components';

export function Footer() {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Security', 'Integrations', 'Changelog'],
    Company: ['About', 'Careers', 'Blog', 'Press Kit', 'Partners'],
    Resources: ['Documentation', 'API Reference', 'Support', 'System Status', 'Community'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance', 'Licenses']
  };

  return (
    <footer className="bg-primary text-white pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12 lg:mb-16">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <div className="mb-3 sm:mb-4">
              <AnimatedLogo size="md" showIcon={true} className="text-white" />
            </div>
            <p className="mb-4 sm:mb-6 text-white/70 text-sm sm:text-base max-w-xs">
              Enterprise platform for nuclear medicine supply chain management.
            </p>
            <div className="flex gap-3 sm:gap-4">
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

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white mb-3 sm:mb-4 text-sm sm:text-base font-medium">{category}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="hover:text-accent transition-colors text-white/70 text-xs sm:text-sm py-1 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-white/50 text-center sm:text-left">
            © 2026 NUCLEAR. All rights reserved.
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
