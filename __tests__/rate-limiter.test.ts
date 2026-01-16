/**
 * Rate Limiter Tests
 * 
 * Tests for rate limiting functionality to prevent brute force attacks
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
} from '@/lib/rate-limiter'

describe('Rate Limiter', () => {
  const testUserId = 'test-user-123'
  const testAction = 'password-change'

  beforeEach(async () => {
    // Reset rate limit before each test
    await resetRateLimit(testUserId, testAction)
  })

  describe('checkRateLimit', () => {
    it('should allow first attempt', async () => {
      const result = await checkRateLimit(testUserId, testAction)
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeLessThanOrEqual(5)
      expect(result.resetAt).toBeInstanceOf(Date)
    })

    it('should track multiple attempts', async () => {
      const first = await checkRateLimit(testUserId, testAction)
      const second = await checkRateLimit(testUserId, testAction)
      
      expect(first.remaining).toBe(4)
      expect(second.remaining).toBe(3)
    })

    it('should block after max attempts', async () => {
      // Make 5 attempts (max allowed)
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(testUserId, testAction)
      }
      
      // 6th attempt should be blocked
      const result = await checkRateLimit(testUserId, testAction)
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeDefined()
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should provide retry after time when blocked', async () => {
      // Exhaust attempts
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(testUserId, testAction)
      }
      
      const result = await checkRateLimit(testUserId, testAction)
      
      expect(result.retryAfter).toBeDefined()
      expect(result.retryAfter).toBeGreaterThan(0)
      expect(result.retryAfter).toBeLessThanOrEqual(15 * 60) // Max 15 minutes
    })

    it('should have different limits for different users', async () => {
      const user1 = 'user-1'
      const user2 = 'user-2'
      
      const result1 = await checkRateLimit(user1, testAction)
      const result2 = await checkRateLimit(user2, testAction)
      
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(4)
      expect(result2.remaining).toBe(4)
    })

    it('should have different limits for different actions', async () => {
      const action1 = 'password-change'
      const action2 = 'login-attempt'
      
      const result1 = await checkRateLimit(testUserId, action1)
      const result2 = await checkRateLimit(testUserId, action2)
      
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(4)
      expect(result2.remaining).toBe(4)
    })
  })

  describe('resetRateLimit', () => {
    it('should reset rate limit for user', async () => {
      // Make some attempts
      await checkRateLimit(testUserId, testAction)
      await checkRateLimit(testUserId, testAction)
      
      // Reset
      await resetRateLimit(testUserId, testAction)
      
      // Check that limit is reset
      const result = await checkRateLimit(testUserId, testAction)
      expect(result.remaining).toBe(4) // First new attempt
    })

    it('should allow attempts after reset even if previously blocked', async () => {
      // Exhaust attempts
      for (let i = 0; i < 6; i++) {
        await checkRateLimit(testUserId, testAction)
      }
      
      // Reset
      await resetRateLimit(testUserId, testAction)
      
      // Should be allowed now
      const result = await checkRateLimit(testUserId, testAction)
      expect(result.allowed).toBe(true)
    })
  })

  describe('getRateLimitStatus', () => {
    it('should return status without incrementing counter', async () => {
      await checkRateLimit(testUserId, testAction)
      
      const status1 = await getRateLimitStatus(testUserId, testAction)
      const status2 = await getRateLimitStatus(testUserId, testAction)
      
      expect(status1.remaining).toBe(status2.remaining)
      expect(status1.remaining).toBe(4)
    })

    it('should return correct status after attempts', async () => {
      await checkRateLimit(testUserId, testAction)
      await checkRateLimit(testUserId, testAction)
      
      const status = await getRateLimitStatus(testUserId, testAction)
      
      expect(status.remaining).toBe(3)
      expect(status.allowed).toBe(true)
    })

    it('should indicate when blocked', async () => {
      // Exhaust attempts
      for (let i = 0; i < 5; i++) {
        await checkRateLimit(testUserId, testAction)
      }
      
      const status = await getRateLimitStatus(testUserId, testAction)
      
      expect(status.allowed).toBe(false)
      expect(status.remaining).toBe(0)
      expect(status.retryAfter).toBeDefined()
    })

    it('should return fresh status for new user', async () => {
      const newUser = 'new-user-456'
      const status = await getRateLimitStatus(newUser, testAction)
      
      expect(status.allowed).toBe(true)
      expect(status.remaining).toBe(5)
    })
  })

  describe('Time-based behavior', () => {
    it('should maintain reset time across attempts', async () => {
      const first = await checkRateLimit(testUserId, testAction)
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const second = await checkRateLimit(testUserId, testAction)
      
      // Reset times should be the same (or very close)
      const timeDiff = Math.abs(second.resetAt.getTime() - first.resetAt.getTime())
      expect(timeDiff).toBeLessThan(1000) // Less than 1 second difference
    })

    it('should have reset time in the future', async () => {
      const result = await checkRateLimit(testUserId, testAction)
      const now = new Date()
      
      expect(result.resetAt.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const result = await checkRateLimit('', testAction)
      expect(result.allowed).toBe(true)
    })

    it('should handle empty action', async () => {
      const result = await checkRateLimit(testUserId, '')
      expect(result.allowed).toBe(true)
    })

    it('should handle concurrent requests', async () => {
      const promises = [
        checkRateLimit(testUserId, testAction),
        checkRateLimit(testUserId, testAction),
        checkRateLimit(testUserId, testAction),
      ]
      
      const results = await Promise.all(promises)
      
      // All should be processed
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.allowed).toBeDefined()
        expect(result.remaining).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
