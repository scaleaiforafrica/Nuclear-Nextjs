import { describe, it, expect } from 'vitest'
import { isDemoUser } from '../lib/utils'

describe('isDemoUser', () => {
  it('should return true for demo@ emails', () => {
    expect(isDemoUser('demo@example.com')).toBe(true)
    expect(isDemoUser('DEMO@example.com')).toBe(true)
    expect(isDemoUser('Demo@Company.com')).toBe(true)
  })

  it('should return true for test@ emails', () => {
    expect(isDemoUser('test@example.com')).toBe(true)
    expect(isDemoUser('TEST@example.com')).toBe(true)
    expect(isDemoUser('Test@Company.com')).toBe(true)
  })

  it('should return false for regular emails', () => {
    expect(isDemoUser('user@example.com')).toBe(false)
    expect(isDemoUser('admin@company.com')).toBe(false)
    expect(isDemoUser('john.doe@example.com')).toBe(false)
  })

  it('should return false for undefined or null', () => {
    expect(isDemoUser(undefined)).toBe(false)
    expect(isDemoUser(null)).toBe(false)
  })

  it('should not match emails containing demo or test but not starting with them', () => {
    expect(isDemoUser('mydemo@example.com')).toBe(false)
    expect(isDemoUser('mytest@example.com')).toBe(false)
    expect(isDemoUser('user.demo@example.com')).toBe(false)
  })
})
