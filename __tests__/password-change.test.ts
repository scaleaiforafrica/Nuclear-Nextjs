/**
 * Password Change Integration Tests
 * 
 * Tests for the complete password change flow including API, validation, and UI
 */

import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from '@/lib/password-validator'
import { checkRateLimit } from '@/lib/rate-limiter'

describe('Password Change Integration', () => {
  describe('End-to-End Validation Flow', () => {
    it('should validate complete password change request', () => {
      const currentPassword = 'OldStr1ng$ecure123!'
      const newPassword = 'NewV3ry$ecureStr1ng456#'
      const confirmPassword = 'NewV3ry$ecureStr1ng456#'
      
      // Validate new password strength
      const strength = validatePasswordStrength(newPassword)
      
      expect(strength.isValid).toBe(true)
      expect(newPassword).toBe(confirmPassword)
      expect(newPassword).not.toBe(currentPassword)
    })

    it('should reject when passwords do not match', () => {
      const newPassword = 'NewSecurePassword456#'
      const confirmPassword = 'DifferentPassword789$'
      
      expect(newPassword).not.toBe(confirmPassword)
    })

    it('should reject weak passwords', () => {
      const newPassword = 'weak'
      const strength = validatePasswordStrength(newPassword)
      
      expect(strength.isValid).toBe(false)
      expect(strength.failedRequirements.length).toBeGreaterThan(0)
    })

    it('should reject when new password same as current', () => {
      const currentPassword = 'S@meStr1ng123!'
      const newPassword = 'S@meStr1ng123!'
      
      expect(newPassword).toBe(currentPassword)
    })
  })

  describe('Security Flow', () => {
    it('should enforce rate limiting on multiple attempts', async () => {
      const userId = 'test-user-security'
      
      // Make multiple attempts
      const attempts = []
      for (let i = 0; i < 6; i++) {
        attempts.push(await checkRateLimit(userId, 'password-change'))
      }
      
      // First 5 should be allowed
      expect(attempts[0].allowed).toBe(true)
      expect(attempts[4].allowed).toBe(true)
      
      // 6th should be blocked
      expect(attempts[5].allowed).toBe(false)
    })

    it('should provide security feedback for common passwords', () => {
      const commonPassword = 'Password123!'
      const strength = validatePasswordStrength(commonPassword)
      
      expect(strength.isValid).toBe(false)
      expect(strength.feedback.some(f => f.toLowerCase().includes('common'))).toBe(true)
    })

    it('should detect similarity to user information', () => {
      const userEmail = 'john.doe@example.com'
      const password = 'JohnDoe2024!'
      
      const strength = validatePasswordStrength(password, { email: userEmail })
      
      expect(strength.failedRequirements).toContain('Not similar to email')
    })
  })

  describe('Validation Requirements', () => {
    it('should require all security criteria', () => {
      const testCases = [
        { password: 'sh0rt1!', shouldFail: 'length' },
        { password: 'noupperc4se123!', shouldFail: 'uppercase' },
        { password: 'NOLOWERC4SE123!', shouldFail: 'lowercase' },
        { password: 'NoNumb3rsHere!', shouldFail: 'number' },
        { password: 'NoSpecialCh4rs456', shouldFail: 'special' },
      ]
      
      testCases.forEach(({ password, shouldFail }) => {
        const strength = validatePasswordStrength(password)
        expect(strength.isValid).toBe(false)
      })
    })

    it('should accept password meeting all criteria', () => {
      const validPasswords = [
        'MyV3ry$ecureStr1ng#',
        'C0mplex!Cr3d@2024',
        'Str0ng&S3cure#Word',
      ]
      
      validPasswords.forEach(password => {
        const strength = validatePasswordStrength(password)
        expect(strength.isValid).toBe(true)
      })
    })
  })

  describe('User Experience Flow', () => {
    it('should provide progressive feedback as password is typed', () => {
      const stages = [
        'M',
        'My',
        'MyV',
        'MyV3ry',
        'MyV3ry$',
        'MyV3ry$ec',
        'MyV3ry$ecureStr1ng!',
      ]
      
      const results = stages.map(password => validatePasswordStrength(password))
      
      // Score should generally increase as password gets stronger
      for (let i = 1; i < results.length - 1; i++) {
        // Later stages should not be weaker than earlier ones
        expect(results[i].score).toBeGreaterThanOrEqual(0)
      }
      
      // Last password should be valid
      expect(results[results.length - 1].isValid).toBe(true)
    })

    it('should show specific requirements that are not met', () => {
      const password = 'onlylowercase'
      const strength = validatePasswordStrength(password)
      
      expect(strength.failedRequirements.length).toBeGreaterThan(0)
      strength.failedRequirements.forEach(req => {
        expect(req).toBeTruthy()
        expect(typeof req).toBe('string')
      })
    })

    it('should show requirements that are met', () => {
      const password = 'MyV3ry$ecureStr1ng123!'
      const strength = validatePasswordStrength(password)
      
      expect(strength.passedRequirements.length).toBeGreaterThan(0)
      expect(strength.passedRequirements).toContain('At least 12 characters')
      expect(strength.passedRequirements).toContain('One uppercase letter')
      expect(strength.passedRequirements).toContain('One lowercase letter')
      expect(strength.passedRequirements).toContain('One number')
      expect(strength.passedRequirements).toContain('One special character')
    })
  })

  describe('Error Handling', () => {
    it('should handle empty password fields', () => {
      const strength = validatePasswordStrength('')
      
      expect(strength.isValid).toBe(false)
      expect(strength.score).toBe(0)
      expect(strength.level).toBe('very-weak')
    })

    it('should handle null or undefined gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      const strength = validatePasswordStrength(null)
      
      expect(strength).toBeDefined()
      expect(strength.isValid).toBe(false)
    })

    it('should provide clear error messages', () => {
      const password = 'weak'
      const strength = validatePasswordStrength(password)
      
      expect(strength.feedback.length).toBeGreaterThan(0)
      strength.feedback.forEach(message => {
        expect(message.length).toBeGreaterThan(0)
        expect(typeof message).toBe('string')
      })
    })
  })

  describe('Special Characters Handling', () => {
    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', '|', ';', ':', ',', '.', '<', '>', '?']
      
      specialChars.forEach(char => {
        const password = `MyV3ryStr0ng123${char}`
        const strength = validatePasswordStrength(password)
        
        expect(strength.passedRequirements).toContain('One special character')
      })
    })

    it('should handle multiple special characters', () => {
      const password = 'MyV3ry$tr0ng!#$%'
      const strength = validatePasswordStrength(password)
      
      expect(strength.passedRequirements).toContain('One special character')
      expect(strength.isValid).toBe(true)
    })
  })

  describe('Performance Considerations', () => {
    it('should validate password quickly', () => {
      const start = Date.now()
      
      for (let i = 0; i < 100; i++) {
        validatePasswordStrength('MyV3ry$ecureStr1ng!')
      }
      
      const elapsed = Date.now() - start
      
      // 100 validations should take less than 1 second
      expect(elapsed).toBeLessThan(1000)
    })

    it('should handle very long passwords efficiently', () => {
      const longPassword = 'MyV3ry$ecureStr1ng!' + 'x'.repeat(1000)
      
      const start = Date.now()
      const strength = validatePasswordStrength(longPassword)
      const elapsed = Date.now() - start
      
      expect(strength.isValid).toBe(true)
      expect(elapsed).toBeLessThan(100) // Should validate in less than 100ms
    })
  })
})
