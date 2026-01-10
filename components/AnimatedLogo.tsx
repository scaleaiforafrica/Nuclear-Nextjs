'use client';

import { useEffect, useState } from 'react';

export interface AnimatedLogoProps {
  /**
   * Size variant for the logo
   * - sm: Small (mobile-friendly)
   * - md: Medium (default)
   * - lg: Large (hero sections)
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show the logo with icon
   */
  showIcon?: boolean;
  /**
   * Custom className for additional styling
   */
  className?: string;
}

export function AnimatedLogo({ size = 'md', showIcon = true, className = '' }: AnimatedLogoProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const text = 'NUCLEAR';
  const letters = text.split('');

  useEffect(() => {
    // Reset animation on mount or navigation
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Size classes
  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl md:text-4xl',
  };

  const iconSizeClasses = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl md:text-5xl',
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <span
          className={`${iconSizeClasses[size]} ${
            isAnimating ? 'animate-fade-in-symbol' : ''
          }`}
          style={{
            animationDelay: '800ms',
          }}
          aria-label="Nuclear symbol"
        >
          ⚛
        </span>
      )}
      <span className="font-semibold flex" aria-label="NUCLEAR">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`inline-block ${
              isAnimating ? 'animate-letter-reveal' : ''
            }`}
            style={{
              // Right-to-left stagger: last letter animates first
              animationDelay: `${(letters.length - 1 - index) * 100}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </span>

      <style jsx>{`
        @keyframes letterReveal {
          0% {
            opacity: 0;
            transform: translateX(10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInSymbol {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-letter-reveal {
          animation: letterReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .animate-fade-in-symbol {
          animation: fadeInSymbol 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        /* Respect user preference for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-letter-reveal,
          .animate-fade-in-symbol {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
