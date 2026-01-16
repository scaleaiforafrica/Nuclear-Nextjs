/**
 * Password Validator Tests
 * 
 * Comprehensive tests for password strength validation functionality
 */

import { describe, it, expect } from 'vitest'
import {
  validatePasswordStrength,
  isPasswordValid,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  PASSWORD_REQUIREMENTS,
} from '@/lib/password-validator'

describe('Password Validator', () => {
  describe('validatePasswordStrength', () => {
    it('should reject passwords shorter than 12 characters', () => {
      const result = validatePasswordStrength('Sh0rt1!')
      
      expect(result.isValid).toBe(false)
      expect(result.failedRequirements).toContain('At least 12 characters')
      // Don't check level as it depends on other factors
    })

    it('should require uppercase letter', () => {
      const result = validatePasswordStrength('lowercase123!')
      
      expect(result.isValid).toBe(false)
      expect(result.failedRequirements).toContain('One uppercase letter')
    })

    it('should require lowercase letter', () => {
      const result = validatePasswordStrength('UPPERCASE123!')
      
      expect(result.isValid).toBe(false)
      expect(result.failedRequirements).toContain('One lowercase letter')
    })

    it('should require number', () => {
      const result = validatePasswordStrength('NoNumbersHere!')
      
      expect(result.isValid).toBe(false)
      expect(result.failedRequirements).toContain('One number')
    })

    it('should require special character', () => {
      const result = validatePasswordStrength('NoSpecial1234567')
      
      expect(result.isValid).toBe(false)
      expect(result.failedRequirements).toContain('One special character')
    })

    it('should reject common passwords', () => {
      const result = validatePasswordStrength('Password123!')
      
      expect(result.isValid).toBe(false)
      expect(result.failedRequirements).toContain('Not a common password')
      expect(result.feedback.some(f => f.includes('too common'))).toBe(true)
    })

    it('should reject passwords similar to email', () => {
      const result = validatePasswordStrength('JohnDoe2024!', {
        email: 'johndoe@example.com',
      })
      
      expect(result.failedRequirements).toContain('Not similar to email')
      expect(result.feedback.some(f => f.includes('email'))).toBe(true)
    })

    it('should reject passwords similar to name', () => {
      const result = validatePasswordStrength('JaneSmith2024!', {
        name: 'Jane Smith',
      })
      
      expect(result.failedRequirements).toContain('Not similar to name')
      expect(result.feedback.some(f => f.includes('name'))).toBe(true)
    })

    it('should accept strong password meeting all requirements', () => {
      const result = validatePasswordStrength('MyV3ry$ecureStr1ng!')
      
      expect(result.isValid).toBe(true)
      expect(result.failedRequirements).toHaveLength(0)
      expect(result.score).toBeGreaterThanOrEqual(4)
      expect(['good', 'strong', 'very-strong']).toContain(result.level)
    })

    it('should give bonus score for longer passwords', () => {
      const short = validatePasswordStrength('MySecure#Pass2024!')
      const long = validatePasswordStrength('MySecure#Pass2024!WithExtraLength')
      
      expect(long.score).toBeGreaterThan(short.score)
    })

    it('should handle empty password', () => {
      const result = validatePasswordStrength('')
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBe(0)
      expect(result.level).toBe('very-weak')
    })

    it('should handle unicode characters', () => {
      const result = validatePasswordStrength('Пароль123!SecurePass')
      
      // Should still validate basic requirements
      expect(result.passedRequirements).toContain('At least 12 characters')
      expect(result.passedRequirements).toContain('One number')
      expect(result.passedRequirements).toContain('One special character')
    })

    it('should provide helpful feedback for weak passwords', () => {
      const result = validatePasswordStrength('weak')
      
      expect(result.feedback.length).toBeGreaterThan(0)
      expect(result.feedback.some(f => f.includes('12 characters'))).toBe(true)
    })

    it('should give very strong rating to excellent passwords', () => {
      const result = validatePasswordStrength('MyV3ry$ecure&Complex#Str1ng2024!')
      
      expect(result.level).toBe('very-strong')
      expect(result.score).toBe(5)
      expect(result.isValid).toBe(true)
    })

    it('should handle passwords with multiple special characters', () => {
      const result = validatePasswordStrength('P@ssw0rd!#$%2024')
      
      expect(result.passedRequirements).toContain('One special character')
      expect(result.score).toBeGreaterThanOrEqual(4)
    })

    it('should handle very long passwords', () => {
      const longPassword = 'MyV3ry$ecureStr1ng!' + 'x'.repeat(100)
      const result = validatePasswordStrength(longPassword)
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBe(5)
    })
  })

  describe('isPasswordValid', () => {
    it('should return true for valid passwords', () => {
      expect(isPasswordValid('MyV3ry$ecureStr1ng!')).toBe(true)
    })

    it('should return false for invalid passwords', () => {
      expect(isPasswordValid('weak')).toBe(false)
      expect(isPasswordValid('password123')).toBe(false)
      expect(isPasswordValid('NoNumbers!')).toBe(false)
    })

    it('should consider user info in validation', () => {
      const password = 'JohnDoe2024!'
      
      expect(isPasswordValid(password)).toBe(true)
      expect(isPasswordValid(password, { email: 'johndoe@example.com' })).toBe(false)
    })
  })

  describe('getPasswordStrengthColor', () => {
    it('should return red for very weak passwords', () => {
      const color = getPasswordStrengthColor('very-weak')
      expect(color).toContain('220')
    })

    it('should return amber for fair passwords', () => {
      const color = getPasswordStrengthColor('fair')
      expect(color).toContain('251')
    })

    it('should return green for strong passwords', () => {
      const color = getPasswordStrengthColor('strong')
      expect(color).toContain('22')
    })

    it('should return darker green for very strong passwords', () => {
      const color = getPasswordStrengthColor('very-strong')
      expect(color).toContain('21')
    })
  })

  describe('getPasswordStrengthLabel', () => {
    it('should return correct labels for all levels', () => {
      expect(getPasswordStrengthLabel('very-weak')).toBe('Very Weak')
      expect(getPasswordStrengthLabel('weak')).toBe('Weak')
      expect(getPasswordStrengthLabel('fair')).toBe('Fair')
      expect(getPasswordStrengthLabel('good')).toBe('Good')
      expect(getPasswordStrengthLabel('strong')).toBe('Strong')
      expect(getPasswordStrengthLabel('very-strong')).toBe('Very Strong')
    })
  })

  describe('Password Requirements', () => {
    it('should have correct minimum length requirement', () => {
      expect(PASSWORD_REQUIREMENTS.minLength).toBe(12)
    })

    it('should require all character types', () => {
      expect(PASSWORD_REQUIREMENTS.requireUppercase).toBe(true)
      expect(PASSWORD_REQUIREMENTS.requireLowercase).toBe(true)
      expect(PASSWORD_REQUIREMENTS.requireNumber).toBe(true)
      expect(PASSWORD_REQUIREMENTS.requireSpecialChar).toBe(true)
    })

    it('should define valid special characters', () => {
      expect(PASSWORD_REQUIREMENTS.specialChars).toBeTruthy()
      expect(PASSWORD_REQUIREMENTS.specialChars.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null or undefined user info', () => {
      const result = validatePasswordStrength('MyV3ry$ecureStr1ng!', undefined)
      expect(result.isValid).toBe(true)
    })

    it('should handle passwords with only spaces', () => {
      const result = validatePasswordStrength('            ')
      expect(result.isValid).toBe(false)
    })

    it('should handle passwords with leading/trailing spaces', () => {
      const result = validatePasswordStrength('  MySecure#Pass2024!  ')
      // Password with spaces should still be validated
      expect(result.passedRequirements.length).toBeGreaterThan(0)
    })

    it('should handle passwords with all same characters', () => {
      const result = validatePasswordStrength('AAAAAAAAAAAA')
      expect(result.isValid).toBe(false)
      expect(result.score).toBeLessThan(3)
    })
  })
})
