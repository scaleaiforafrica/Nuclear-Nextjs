'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { validatePasswordStrength, type PasswordStrength } from '@/lib/validation/password'
import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
  className?: string
}

/**
 * Get color classes based on password strength
 */
function getStrengthColors(strength: PasswordStrength): {
  bg: string
  text: string
  border: string
} {
  switch (strength) {
    case 'weak':
      return {
        bg: 'bg-red-500',
        text: 'text-red-700',
        border: 'border-red-200',
      }
    case 'fair':
      return {
        bg: 'bg-orange-500',
        text: 'text-orange-700',
        border: 'border-orange-200',
      }
    case 'good':
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      }
    case 'strong':
      return {
        bg: 'bg-green-500',
        text: 'text-green-700',
        border: 'border-green-200',
      }
  }
}

/**
 * Get strength label for display
 */
function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'good':
      return 'Good'
    case 'strong':
      return 'Strong'
  }
}

/**
 * Password Strength Meter Component
 * Displays real-time password strength feedback with visual indicators
 */
export function PasswordStrengthMeter({
  password,
  showRequirements = true,
  className,
}: PasswordStrengthMeterProps) {
  const validation = useMemo(
    () => validatePasswordStrength(password),
    [password]
  )

  // Don't show meter if password is empty
  if (!password) {
    return null
  }

  const colors = getStrengthColors(validation.strength)
  const strengthLabel = getStrengthLabel(validation.strength)
  const progressPercentage = (validation.score / 10) * 100

  return (
    <div className={cn('space-y-3', className)} role="status" aria-live="polite">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password strength:</span>
          <span className={cn('font-medium', colors.text)}>{strengthLabel}</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300 ease-in-out', colors.bg)}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={validation.score}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-label={`Password strength: ${strengthLabel}`}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2">
          <RequirementItem
            met={validation.requirements.minLength}
            label="At least 8 characters"
          />
          <RequirementItem
            met={validation.requirements.hasUppercase}
            label="One uppercase letter (A-Z)"
          />
          <RequirementItem
            met={validation.requirements.hasLowercase}
            label="One lowercase letter (a-z)"
          />
          <RequirementItem
            met={validation.requirements.hasNumber}
            label="One number (0-9)"
          />
          <RequirementItem
            met={validation.requirements.hasSpecialChar}
            label="One special character (!@#$%...)"
          />
          <RequirementItem
            met={validation.requirements.notCommon}
            label="Not a common password"
          />
        </div>
      )}

      {/* Feedback Messages */}
      {validation.feedback.length > 0 && (
        <div className="space-y-1">
          {validation.feedback.map((message, idx) => (
            <p key={idx} className="text-xs text-gray-600">
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Individual requirement item component
 */
function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
      ) : (
        <X className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
      )}
      <span className={cn(met ? 'text-green-700' : 'text-gray-600')}>
        {label}
      </span>
    </div>
  )
}
