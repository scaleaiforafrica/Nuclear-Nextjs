'use client';

import { CheckCircle, Download, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Quote {
  manufacturer: string;
  rating: number;
  price: { product: number; shipping: number; insurance: number };
  deliveryTime: string;
  activityAtArrival: string;
  isBestValue: boolean;
}

interface ViewQuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  requestId: string;
}

export function ViewQuoteDialog({ isOpen, onClose, quote, requestId }: ViewQuoteDialogProps) {
  if (!quote) return null;

  const total = quote.price.product + quote.price.shipping + quote.price.insurance;

  const handleSelectQuote = () => {
    // In real app, this would create a purchase order
    console.log('Creating PO for quote from:', quote.manufacturer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quote Details</DialogTitle>
          <DialogDescription>
            Quote from {quote.manufacturer} for request {requestId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Manufacturer Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{quote.manufacturer}</h3>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(quote.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-600 ml-2">{quote.rating}/5.0</span>
              </div>
            </div>
            {quote.isBestValue && (
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Best Value
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="font-medium mb-3">Pricing Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Product Cost</span>
                <span className="font-medium">${quote.price.product.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping & Handling</span>
                <span className="font-medium">${quote.price.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Insurance</span>
                <span className="font-medium">${quote.price.insurance.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-purple-600">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Delivery Time</div>
              <div className="text-lg font-semibold">{quote.deliveryTime}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Activity at Arrival</div>
              <div className="text-lg font-semibold text-green-600">
                {quote.activityAtArrival}
              </div>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>All compliance checks passed</span>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2 text-sm">Included Services</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Temperature-controlled transport
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Real-time GPS tracking
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Insurance coverage up to $1M
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                All required documentation
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSelectQuote} className="flex items-center gap-2">
            Select & Create PO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
