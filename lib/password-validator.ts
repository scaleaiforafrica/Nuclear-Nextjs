/**
 * Password Validation Utility
 * 
 * Comprehensive password strength validation with detailed feedback.
 * Implements security best practices from OWASP and NIST guidelines.
 */

import { isCommonPassword } from './common-passwords'

export interface PasswordStrength {
  score: number // 0-5
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  feedback: string[]
  passedRequirements: string[]
  failedRequirements: string[]
  isValid: boolean
}

export interface UserInfo {
  email?: string
  name?: string
}

/**
 * Password requirements configuration
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,./<>?',
  maxSimilarityToUserInfo: 0.5,
}

/**
 * Validate password strength with comprehensive feedback
 */
export function validatePasswordStrength(
  password: string,
  userInfo?: UserInfo
): PasswordStrength {
  // Handle null/undefined
  if (!password) {
    return {
      score: 0,
      level: 'very-weak',
      feedback: ['Password is required'],
      passedRequirements: [],
      failedRequirements: ['At least 12 characters', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character', 'Not a common password'],
      isValid: false,
    }
  }

  const passedRequirements: string[] = []
  const failedRequirements: string[] = []
  const feedback: string[] = []
  let score = 0

  // Check minimum length
  if (password.length >= PASSWORD_REQUIREMENTS.minLength) {
    passedRequirements.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`)
    score++
  } else {
    failedRequirements.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`)
    feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long (current: ${password.length})`)
  }

  // Check uppercase
  if (/[A-Z]/.test(password)) {
    passedRequirements.push('One uppercase letter')
    score++
  } else {
    failedRequirements.push('One uppercase letter')
    feedback.push('Password must contain at least one uppercase letter')
  }

  // Check lowercase
  if (/[a-z]/.test(password)) {
    passedRequirements.push('One lowercase letter')
    score++
  } else {
    failedRequirements.push('One lowercase letter')
    feedback.push('Password must contain at least one lowercase letter')
  }

  // Check number
  if (/[0-9]/.test(password)) {
    passedRequirements.push('One number')
    score++
  } else {
    failedRequirements.push('One number')
    feedback.push('Password must contain at least one number')
  }

  // Check special character
  const specialCharRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
  if (specialCharRegex.test(password)) {
    passedRequirements.push('One special character')
    score++
  } else {
    failedRequirements.push('One special character')
    feedback.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`)
  }

  // Check for common passwords
  if (!isCommonPassword(password)) {
    passedRequirements.push('Not a common password')
  } else {
    failedRequirements.push('Not a common password')
    feedback.push('This password is too common and easily guessable. Please choose a more unique password.')
    score = Math.max(0, score - 2) // Heavily penalize common passwords
  }

  // Check similarity to user info
  if (userInfo) {
    const isSimilarToEmail = userInfo.email && checkSimilarity(password.toLowerCase(), userInfo.email.toLowerCase())
    const isSimilarToName = userInfo.name && checkSimilarity(password.toLowerCase(), userInfo.name.toLowerCase())

    if (isSimilarToEmail) {
      failedRequirements.push('Not similar to email')
      feedback.push('Password should not be similar to your email address')
      score = Math.max(0, score - 1)
    } else if (isSimilarToName) {
      failedRequirements.push('Not similar to name')
      feedback.push('Password should not be similar to your name')
      score = Math.max(0, score - 1)
    } else {
      passedRequirements.push('Not similar to personal information')
    }
  }

  // Additional score bonuses for very strong passwords
  if (password.length >= 16) {
    score += 0.5
  }
  if (password.length >= 20) {
    score += 0.5
  }

  // Check for character variety
  const hasMultipleNumbers = (password.match(/[0-9]/g) || []).length >= 2
  const hasMultipleSpecialChars = (password.match(new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g')) || []).length >= 2
  
  if (hasMultipleNumbers && hasMultipleSpecialChars) {
    score += 0.5
  }

  // Cap score at 5
  score = Math.min(5, score)

  // Determine level based on score
  let level: PasswordStrength['level']
  if (score <= 1) {
    level = 'very-weak'
  } else if (score <= 2) {
    level = 'weak'
  } else if (score <= 3) {
    level = 'fair'
  } else if (score <= 4) {
    level = 'good'
  } else if (score < 5) {
    level = 'strong'
  } else {
    level = 'very-strong'
  }

  // Password is valid if it meets all basic requirements
  const isValid = failedRequirements.length === 0

  // Add positive feedback for strong passwords
  if (isValid && score >= 4) {
    feedback.push('Great! This is a strong password.')
  } else if (isValid) {
    feedback.push('This password meets the minimum requirements but could be stronger.')
  }

  return {
    score,
    level,
    feedback,
    passedRequirements,
    failedRequirements,
    isValid,
  }
}

/**
 * Check if two strings are similar using a simple similarity metric
 */
function checkSimilarity(str1: string, str2: string): boolean {
  if (!str1 || !str2) return false
  
  // Extract username from email
  const email = str2.includes('@') ? str2.split('@')[0] : str2
  
  // Check if password contains significant portion of email/name
  if (str1.includes(email) || email.includes(str1)) {
    return true
  }
  
  // Check for similar substrings
  const minLength = 4
  for (let i = 0; i <= email.length - minLength; i++) {
    const substring = email.substring(i, i + minLength)
    if (str1.includes(substring)) {
      return true
    }
  }
  
  return false
}

/**
 * Get color for password strength indicator
 */
export function getPasswordStrengthColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'very-weak':
      return 'rgb(220, 38, 38)' // red-600
    case 'weak':
      return 'rgb(239, 68, 68)' // red-500
    case 'fair':
      return 'rgb(251, 191, 36)' // amber-400
    case 'good':
      return 'rgb(34, 197, 94)' // green-500
    case 'strong':
      return 'rgb(22, 163, 74)' // green-600
    case 'very-strong':
      return 'rgb(21, 128, 61)' // green-700
    default:
      return 'rgb(156, 163, 175)' // gray-400
  }
}

/**
 * Get label for password strength
 */
export function getPasswordStrengthLabel(level: PasswordStrength['level']): string {
  switch (level) {
    case 'very-weak':
      return 'Very Weak'
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'good':
      return 'Good'
    case 'strong':
      return 'Strong'
    case 'very-strong':
      return 'Very Strong'
    default:
      return 'Unknown'
  }
}

/**
 * Validate password against requirements (without detailed feedback)
 * Used for quick server-side validation
 */
export function isPasswordValid(password: string, userInfo?: UserInfo): boolean {
  const strength = validatePasswordStrength(password, userInfo)
  return strength.isValid
}
