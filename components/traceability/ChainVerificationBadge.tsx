'use client';

import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChainVerificationBadgeProps {
  status: 'valid' | 'broken' | 'unverified';
  eventCount: number;
  onClick?: () => void;
}

export function ChainVerificationBadge({
  status,
  eventCount,
  onClick,
}: ChainVerificationBadgeProps) {
  const config = {
    valid: {
      icon: CheckCircle,
      label: 'Chain Verified',
      color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
      iconColor: 'text-green-600',
    },
    broken: {
      icon: XCircle,
      label: 'Chain Broken',
      color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
      iconColor: 'text-red-600',
    },
    unverified: {
      icon: AlertTriangle,
      label: 'Unverified',
      color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
      iconColor: 'text-amber-600',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        config.color
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <Shield className={`w-5 h-5 ${config.iconColor}`} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="font-medium text-sm">{config.label}</span>
        <span className="text-xs opacity-75">
          {eventCount} {eventCount === 1 ? 'event' : 'events'}
        </span>
      </div>
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
    </div>
  );
}
