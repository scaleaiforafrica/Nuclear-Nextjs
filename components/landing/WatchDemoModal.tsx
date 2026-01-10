'use client';

import { X, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WatchDemoModal({ isOpen, onClose }: WatchDemoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="relative">
          {/* Video Container */}
          <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                <Play className="w-10 h-10 ml-1" fill="currentColor" />
              </div>
              <h3 className="text-2xl mb-2">NuclearFlow Demo Video</h3>
              <p className="text-purple-200 mb-6">
                See how NuclearFlow revolutionizes nuclear medicine logistics
              </p>
              <div className="text-sm text-purple-300">
                Demo video coming soon...
              </div>
            </div>
          </div>

          {/* Video Placeholder with Features */}
          <div className="p-6 space-y-4">
            <h4 className="text-lg font-semibold">What you'll learn:</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm">✓</span>
                </div>
                <div>
                  <div className="font-medium">Real-time Tracking</div>
                  <div className="text-sm text-gray-600">Monitor shipments with live GPS tracking and automated updates</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm">✓</span>
                </div>
                <div>
                  <div className="font-medium">Automated Compliance</div>
                  <div className="text-sm text-gray-600">Generate and manage all regulatory documents automatically</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm">✓</span>
                </div>
                <div>
                  <div className="font-medium">Blockchain Traceability</div>
                  <div className="text-sm text-gray-600">Immutable audit trails for complete transparency</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm">✓</span>
                </div>
                <div>
                  <div className="font-medium">Smart Analytics</div>
                  <div className="text-sm text-gray-600">Insights and reports to optimize your operations</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
