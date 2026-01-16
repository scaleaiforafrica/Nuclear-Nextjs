'use client'

import { useMemo } from 'react'
import { Progress } from './progress'
import { cn } from '@/lib/utils'
import type { PasswordStrength } from '@/lib/password-validator'
import { getPasswordStrengthColor, getPasswordStrengthLabel } from '@/lib/password-validator'

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
  className?: string
  showLabel?: boolean
  showFeedback?: boolean
}

/**
 * Password Strength Indicator Component
 * 
 * Visual indicator showing password strength with color-coded progress bar
 * and optional feedback messages.
 */
export function PasswordStrengthIndicator({
  strength,
  className,
  showLabel = true,
  showFeedback = true,
}: PasswordStrengthIndicatorProps) {
  // Calculate percentage based on score (0-5)
  const percentage = useMemo(() => {
    return (strength.score / 5) * 100
  }, [strength.score])

  // Get color based on strength level
  const color = useMemo(() => {
    return getPasswordStrengthColor(strength.level)
  }, [strength.level])

  // Get label text
  const label = useMemo(() => {
    return getPasswordStrengthLabel(strength.level)
  }, [strength.level])

  // Get text color class based on strength
  const getTextColorClass = () => {
    switch (strength.level) {
      case 'very-weak':
      case 'weak':
        return 'text-red-600'
      case 'fair':
        return 'text-amber-600'
      case 'good':
        return 'text-green-600'
      case 'strong':
      case 'very-strong':
        return 'text-green-700'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Bar */}
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-2"
          style={{
            // @ts-ignore - Custom CSS variable
            '--progress-background': color,
          } as React.CSSProperties}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password Strength:</span>
          <span className={cn('font-medium', getTextColorClass())}>
            {label}
          </span>
        </div>
      )}

      {/* Feedback Messages */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((message, idx) => (
            <p 
              key={idx} 
              className={cn(
                'text-xs',
                strength.isValid && strength.score >= 4 
                  ? 'text-green-600' 
                  : 'text-gray-600'
              )}
            >
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
