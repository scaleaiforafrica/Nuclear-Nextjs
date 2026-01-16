'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PasswordStrength } from '@/lib/password-validator'

interface PasswordRequirementsChecklistProps {
  strength: PasswordStrength
  className?: string
}

/**
 * Password Requirements Checklist Component
 * 
 * Displays a visual checklist of password requirements with checkmarks
 * for met requirements and X marks for unmet ones.
 */
export function PasswordRequirementsChecklist({
  strength,
  className,
}: PasswordRequirementsChecklistProps) {
  // Combine all requirements
  const allRequirements = [
    ...strength.passedRequirements.map(req => ({ label: req, met: true })),
    ...strength.failedRequirements.map(req => ({ label: req, met: false })),
  ]

  // Sort so that met requirements come first
  const sortedRequirements = allRequirements.sort((a, b) => {
    if (a.met === b.met) return 0
    return a.met ? -1 : 1
  })

  if (sortedRequirements.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-gray-700">Password Requirements:</h4>
      <ul className="space-y-1.5">
        {sortedRequirements.map((requirement, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0 mt-0.5">
              {requirement.met ? (
                <Check className="w-4 h-4 text-green-600" aria-label="Requirement met" />
              ) : (
                <X className="w-4 h-4 text-red-500" aria-label="Requirement not met" />
              )}
            </span>
            <span 
              className={cn(
                'flex-1',
                requirement.met ? 'text-green-700' : 'text-gray-600'
              )}
            >
              {requirement.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
