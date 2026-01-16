/**
 * QuickActionCard Component
 * Card component for quick action buttons in dashboard
 */

'use client';

import type { LucideIcon } from 'lucide-react';

export interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'secondary',
  disabled = false,
}: QuickActionCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 sm:p-6 rounded-lg transition-all touch-manipulation
        flex flex-col items-center justify-center gap-2 sm:gap-3
        min-h-[120px] sm:min-h-[140px]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${
          isPrimary
            ? 'bg-white text-primary hover:bg-white/90 active:bg-white/80 border-2 border-primary'
            : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 active:bg-white/30 border border-white/20'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={title}
      aria-disabled={disabled}
    >
      <div
        className={`
        w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
        ${isPrimary ? 'bg-primary/10' : 'bg-white/20'}
      `}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="font-medium text-sm sm:text-base">{title}</p>
        {description && (
          <p
            className={`text-xs sm:text-sm mt-1 ${
              isPrimary ? 'text-gray-600' : 'text-white/80'
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  );
}
