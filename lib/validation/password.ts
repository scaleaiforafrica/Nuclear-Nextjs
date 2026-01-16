import { isCommonPassword } from './common-passwords'

/**
 * Strength levels for password validation
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

/**
 * Password requirement check results
 */
export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  notCommon: boolean
}

/**
 * Complete password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-10
  strength: PasswordStrength
  requirements: PasswordRequirements
  feedback: string[]
}

/**
 * Password validation configuration
 */
export interface PasswordConfig {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecialChar: boolean
  checkCommonPasswords: boolean
}

/**
 * Default password configuration
 */
export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  checkCommonPasswords: true,
}

/**
 * Validate password requirements
 * @param password - The password to validate
 * @param config - Optional configuration overrides
 * @returns PasswordRequirements object with individual checks
 */
export function checkPasswordRequirements(
  password: string,
  config: PasswordConfig = DEFAULT_PASSWORD_CONFIG
): PasswordRequirements {
  return {
    minLength: password.length >= config.minLength,
    hasUppercase: config.requireUppercase ? /[A-Z]/.test(password) : true,
    hasLowercase: config.requireLowercase ? /[a-z]/.test(password) : true,
    hasNumber: config.requireNumber ? /\d/.test(password) : true,
    hasSpecialChar: config.requireSpecialChar
      ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      : true,
    notCommon: config.checkCommonPasswords ? !isCommonPassword(password) : true,
  }
}

/**
 * Calculate password strength score (0-10)
 * @param password - The password to score
 * @returns Score from 0 (weakest) to 10 (strongest)
 */
export function calculatePasswordScore(password: string): number {
  let score = 0

  // Length scoring (0-3 points)
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  // Character variety scoring (0-4 points)
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1

  // Complexity bonus (0-2 points)
  // Check for multiple character types in combination
  const hasMultipleTypes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  ].filter(Boolean).length

  if (hasMultipleTypes >= 3) score += 1
  if (hasMultipleTypes === 4) score += 1

  // Common password penalty (-3 points)
  if (isCommonPassword(password)) {
    score = Math.max(0, score - 3)
  }

  return Math.min(10, score)
}

/**
 * Get password strength level based on score
 * @param score - Password score (0-10)
 * @returns PasswordStrength level
 */
export function getPasswordStrength(score: number): PasswordStrength {
  if (score <= 3) return 'weak'
  if (score <= 5) return 'fair'
  if (score <= 7) return 'good'
  return 'strong'
}

/**
 * Generate feedback messages for password improvement
 * @param requirements - Password requirements check results
 * @param score - Password score
 * @param password - The password being validated
 * @returns Array of feedback messages
 */
export function generatePasswordFeedback(
  requirements: PasswordRequirements,
  score: number,
  password: string
): string[] {
  const feedback: string[] = []

  if (!requirements.minLength) {
    feedback.push('Use at least 8 characters')
  }

  if (!requirements.hasUppercase) {
    feedback.push('Add uppercase letters (A-Z)')
  }

  if (!requirements.hasLowercase) {
    feedback.push('Add lowercase letters (a-z)')
  }

  if (!requirements.hasNumber) {
    feedback.push('Add numbers (0-9)')
  }

  if (!requirements.hasSpecialChar) {
    feedback.push('Add special characters (!@#$%^&*)')
  }

  if (!requirements.notCommon) {
    feedback.push('This password is too common. Choose something unique')
  }

  // Provide constructive feedback for improving password
  if (password.length < 12 && feedback.length === 0) {
    feedback.push('Consider using 12+ characters for better security')
  }

  if (score >= 8 && feedback.length === 0) {
    feedback.push('Excellent! This is a strong password')
  }

  return feedback
}

/**
 * Comprehensive password strength validation
 * @param password - The password to validate
 * @param config - Optional configuration overrides
 * @returns Complete validation result with score, strength, requirements, and feedback
 */
export function validatePasswordStrength(
  password: string,
  config: PasswordConfig = DEFAULT_PASSWORD_CONFIG
): PasswordValidationResult {
  const requirements = checkPasswordRequirements(password, config)
  const score = calculatePasswordScore(password)
  const strength = getPasswordStrength(score)
  const feedback = generatePasswordFeedback(requirements, score, password)

  // Password is valid if all required checks pass
  const isValid = Object.values(requirements).every((check) => check === true)

  return {
    isValid,
    score,
    strength,
    requirements,
    feedback,
  }
}

/**
 * Check if password and confirm password match
 * @param password - The password
 * @param confirmPassword - The confirmation password
 * @returns true if passwords match, false otherwise
 */
export function checkPasswordMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword && password.length > 0
}

/**
 * Validate complete password change request
 * @param newPassword - The new password
 * @param confirmPassword - The confirmation password
 * @param config - Optional configuration overrides
 * @returns Validation result with match check
 */
export function validatePasswordChange(
  newPassword: string,
  confirmPassword: string,
  config?: PasswordConfig
): PasswordValidationResult & { passwordsMatch: boolean } {
  const validation = validatePasswordStrength(newPassword, config)
  const passwordsMatch = checkPasswordMatch(newPassword, confirmPassword)

  if (!passwordsMatch && confirmPassword.length > 0) {
    validation.feedback.push('Passwords do not match')
  }

  return {
    ...validation,
    passwordsMatch,
    isValid: validation.isValid && passwordsMatch,
  }
}
