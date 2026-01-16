import { describe, it, expect } from 'vitest'
import {
  validatePasswordStrength,
  checkPasswordRequirements,
  calculatePasswordScore,
  getPasswordStrength,
  checkPasswordMatch,
  validatePasswordChange,
} from '@/lib/validation/password'
import { isCommonPassword } from '@/lib/validation/common-passwords'

describe('Password Validation', () => {
  describe('checkPasswordRequirements', () => {
    it('validates minimum length requirement', () => {
      const result = checkPasswordRequirements('Short1!')
      expect(result.minLength).toBe(false)

      const result2 = checkPasswordRequirements('LongEnough1!')
      expect(result2.minLength).toBe(true)
    })

    it('validates uppercase requirement', () => {
      const result = checkPasswordRequirements('lowercase123!')
      expect(result.hasUppercase).toBe(false)

      const result2 = checkPasswordRequirements('Uppercase123!')
      expect(result2.hasUppercase).toBe(true)
    })

    it('validates lowercase requirement', () => {
      const result = checkPasswordRequirements('UPPERCASE123!')
      expect(result.hasLowercase).toBe(false)

      const result2 = checkPasswordRequirements('Lowercase123!')
      expect(result2.hasLowercase).toBe(true)
    })

    it('validates number requirement', () => {
      const result = checkPasswordRequirements('NoNumbers!')
      expect(result.hasNumber).toBe(false)

      const result2 = checkPasswordRequirements('HasNumber1!')
      expect(result2.hasNumber).toBe(true)
    })

    it('validates special character requirement', () => {
      const result = checkPasswordRequirements('NoSpecial123')
      expect(result.hasSpecialChar).toBe(false)

      const result2 = checkPasswordRequirements('HasSpecial123!')
      expect(result2.hasSpecialChar).toBe(true)
    })

    it('checks against common passwords', () => {
      const result = checkPasswordRequirements('password')
      expect(result.notCommon).toBe(false)

      const result2 = checkPasswordRequirements('UniqueP@ssw0rd!')
      expect(result2.notCommon).toBe(true)
    })

    it('validates all requirements for a strong password', () => {
      const result = checkPasswordRequirements('StrongP@ssw0rd!')
      expect(result.minLength).toBe(true)
      expect(result.hasUppercase).toBe(true)
      expect(result.hasLowercase).toBe(true)
      expect(result.hasNumber).toBe(true)
      expect(result.hasSpecialChar).toBe(true)
      expect(result.notCommon).toBe(true)
    })
  })

  describe('calculatePasswordScore', () => {
    it('gives low score to weak passwords', () => {
      const score = calculatePasswordScore('abc')
      expect(score).toBeLessThanOrEqual(3)
    })

    it('gives medium score to fair passwords', () => {
      const score = calculatePasswordScore('Fairpass1!')
      expect(score).toBeGreaterThan(3)
      expect(score).toBeLessThanOrEqual(7)
    })

    it('gives high score to strong passwords', () => {
      const score = calculatePasswordScore('StrongP@ssw0rd!')
      expect(score).toBeGreaterThan(7)
    })

    it('penalizes common passwords', () => {
      const commonScore = calculatePasswordScore('password')
      const uniqueScore = calculatePasswordScore('password')
      expect(commonScore).toBeLessThanOrEqual(3)
    })

    it('rewards longer passwords', () => {
      const short = calculatePasswordScore('Short1!')
      const medium = calculatePasswordScore('Medium12345!')
      const long = calculatePasswordScore('VeryLongPassword123!')
      expect(long).toBeGreaterThan(medium)
      expect(medium).toBeGreaterThan(short)
    })

    it('rewards character variety', () => {
      const simple = calculatePasswordScore('aaaaaaaaaa')
      const varied = calculatePasswordScore('Aa1!Bb2@Cc')
      expect(varied).toBeGreaterThan(simple)
    })
  })

  describe('getPasswordStrength', () => {
    it('returns weak for low scores', () => {
      expect(getPasswordStrength(0)).toBe('weak')
      expect(getPasswordStrength(3)).toBe('weak')
    })

    it('returns fair for medium-low scores', () => {
      expect(getPasswordStrength(4)).toBe('fair')
      expect(getPasswordStrength(5)).toBe('fair')
    })

    it('returns good for medium-high scores', () => {
      expect(getPasswordStrength(6)).toBe('good')
      expect(getPasswordStrength(7)).toBe('good')
    })

    it('returns strong for high scores', () => {
      expect(getPasswordStrength(8)).toBe('strong')
      expect(getPasswordStrength(10)).toBe('strong')
    })
  })

  describe('validatePasswordStrength', () => {
    it('validates a weak password correctly', () => {
      const result = validatePasswordStrength('weak')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('validates a strong password correctly', () => {
      const result = validatePasswordStrength('StrongP@ssw0rd123!')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
      expect(result.requirements.minLength).toBe(true)
      expect(result.requirements.hasUppercase).toBe(true)
      expect(result.requirements.hasLowercase).toBe(true)
      expect(result.requirements.hasNumber).toBe(true)
      expect(result.requirements.hasSpecialChar).toBe(true)
      expect(result.requirements.notCommon).toBe(true)
    })

    it('provides helpful feedback for weak passwords', () => {
      const result = validatePasswordStrength('weak')
      expect(result.feedback).toContain('Use at least 8 characters')
      expect(result.feedback.some(f => f.includes('uppercase'))).toBe(true)
      expect(result.feedback.some(f => f.includes('number'))).toBe(true)
      expect(result.feedback.some(f => f.includes('special'))).toBe(true)
    })

    it('identifies common passwords', () => {
      const result = validatePasswordStrength('password123')
      expect(result.requirements.notCommon).toBe(false)
      expect(result.isValid).toBe(false)
    })
  })

  describe('checkPasswordMatch', () => {
    it('returns true for matching passwords', () => {
      expect(checkPasswordMatch('password', 'password')).toBe(true)
    })

    it('returns false for non-matching passwords', () => {
      expect(checkPasswordMatch('password1', 'password2')).toBe(false)
    })

    it('returns false for empty passwords', () => {
      expect(checkPasswordMatch('', '')).toBe(false)
    })
  })

  describe('validatePasswordChange', () => {
    it('validates matching strong passwords', () => {
      const result = validatePasswordChange('StrongP@ssw0rd!', 'StrongP@ssw0rd!')
      expect(result.isValid).toBe(true)
      expect(result.passwordsMatch).toBe(true)
    })

    it('fails validation for non-matching passwords', () => {
      const result = validatePasswordChange('StrongP@ssw0rd!', 'DifferentP@ssw0rd!')
      expect(result.isValid).toBe(false)
      expect(result.passwordsMatch).toBe(false)
      expect(result.feedback.some(f => f.includes('do not match'))).toBe(true)
    })

    it('fails validation for weak passwords even if they match', () => {
      const result = validatePasswordChange('weak', 'weak')
      expect(result.isValid).toBe(false)
      expect(result.passwordsMatch).toBe(true)
    })
  })

  describe('isCommonPassword', () => {
    it('identifies common passwords', () => {
      expect(isCommonPassword('password')).toBe(true)
      expect(isCommonPassword('123456')).toBe(true)
      expect(isCommonPassword('qwerty')).toBe(true)
      expect(isCommonPassword('admin')).toBe(true)
    })

    it('identifies unique passwords', () => {
      expect(isCommonPassword('UniqueP@ssw0rd123!')).toBe(false)
      expect(isCommonPassword('MyVeryUniquePassword2024!')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(isCommonPassword('PASSWORD')).toBe(true)
      expect(isCommonPassword('PaSsWoRd')).toBe(true)
    })
  })
})
