/**
 * AboutModal Component
 * Displays application and domain information
 */

'use client';

import { AnimatedLogo } from '@/components/AnimatedLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExternalLink, Mail } from 'lucide-react';

export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appInfo: {
    name: string;
    version: string;
    domain: string;
    description: string;
    supportEmail: string;
    documentationUrl?: string;
    lastUpdated?: string;
  };
}

export function AboutModal({ isOpen, onClose, appInfo }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 mb-4">
            <AnimatedLogo size="lg" showIcon={true} />
          </div>
          <DialogTitle className="text-center text-2xl">{appInfo.name}</DialogTitle>
          <DialogDescription className="text-center">
            {appInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Version Information */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm">
              <p className="text-gray-500">Version</p>
              <p className="font-medium">{appInfo.version}</p>
            </div>
          </div>

          {/* Last Updated */}
          {appInfo.lastUpdated && (
            <div className="text-sm">
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium">{appInfo.lastUpdated}</p>
            </div>
          )}

          {/* Support Contact */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-2">Support</p>
            <a
              href={`mailto:${appInfo.supportEmail}`}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>{appInfo.supportEmail}</span>
            </a>
          </div>

          {/* Documentation Link */}
          {appInfo.documentationUrl && (
            <div className="border-t border-gray-200 pt-4">
              <a
                href={appInfo.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
                <span>Documentation</span>
              </a>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
            <p>© 2026 {appInfo.name}. All rights reserved.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
