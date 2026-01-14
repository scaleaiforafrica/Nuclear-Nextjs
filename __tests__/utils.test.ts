import { describe, it, expect } from 'vitest'
import { isDemoUser } from '@/lib/utils'

describe('isDemoUser', () => {
  it('should return true for emails starting with "demo@"', () => {
    expect(isDemoUser('demo@example.com')).toBe(true)
    expect(isDemoUser('Demo@example.com')).toBe(true)
    expect(isDemoUser('DEMO@example.com')).toBe(true)
  })

  it('should return true for emails with @demo. domain', () => {
    expect(isDemoUser('user@demo.example.com')).toBe(true)
    expect(isDemoUser('admin@demo.com')).toBe(true)
    expect(isDemoUser('test@demo.org')).toBe(true)
  })

  it('should return false for emails not matching demo pattern', () => {
    expect(isDemoUser('user@example.com')).toBe(false)
    expect(isDemoUser('admin@example.com')).toBe(false)
    expect(isDemoUser('test@example.com')).toBe(false)
    expect(isDemoUser('democracy@example.com')).toBe(false)
    expect(isDemoUser('remodel@example.com')).toBe(false)
    expect(isDemoUser('demo.user@example.com')).toBe(false)
    expect(isDemoUser('demouser@example.com')).toBe(false)
    expect(isDemoUser('user@notdemo.example.com')).toBe(false)
    expect(isDemoUser('user@mydemo.com')).toBe(false)
  })

  it('should return false for null or undefined email', () => {
    expect(isDemoUser(null)).toBe(false)
    expect(isDemoUser(undefined)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isDemoUser('')).toBe(false)
  })
})
