import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { RateLimiter, resetRateLimiter } from '@/lib/api/rate-limiter'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter()
  })

  afterEach(() => {
    rateLimiter.destroy()
    resetRateLimiter()
  })

  describe('check', () => {
    it('allows first request', () => {
      const result = rateLimiter.check('user1', {
        maxAttempts: 5,
        windowMs: 60000,
      })

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('tracks multiple requests within limit', () => {
      const config = { maxAttempts: 3, windowMs: 60000 }

      const result1 = rateLimiter.check('user1', config)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = rateLimiter.check('user1', config)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(1)

      const result3 = rateLimiter.check('user1', config)
      expect(result3.allowed).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('blocks requests exceeding limit', () => {
      const config = { maxAttempts: 2, windowMs: 60000 }

      rateLimiter.check('user1', config)
      rateLimiter.check('user1', config)

      const result = rateLimiter.check('user1', config)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeDefined()
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('isolates different users', () => {
      const config = { maxAttempts: 1, windowMs: 60000 }

      rateLimiter.check('user1', config)
      const result = rateLimiter.check('user1', config)
      expect(result.allowed).toBe(false)

      // Different user should be allowed
      const result2 = rateLimiter.check('user2', config)
      expect(result2.allowed).toBe(true)
    })

    it('resets after time window expires', async () => {
      const config = { maxAttempts: 1, windowMs: 100 } // 100ms window

      rateLimiter.check('user1', config)
      const blocked = rateLimiter.check('user1', config)
      expect(blocked.allowed).toBe(false)

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150))

      const allowed = rateLimiter.check('user1', config)
      expect(allowed.allowed).toBe(true)
    })
  })

  describe('reset', () => {
    it('resets rate limit for specific user', () => {
      const config = { maxAttempts: 1, windowMs: 60000 }

      rateLimiter.check('user1', config)
      const blocked = rateLimiter.check('user1', config)
      expect(blocked.allowed).toBe(false)

      rateLimiter.reset('user1')

      const allowed = rateLimiter.check('user1', config)
      expect(allowed.allowed).toBe(true)
    })

    it('does not affect other users', () => {
      const config = { maxAttempts: 1, windowMs: 60000 }

      rateLimiter.check('user1', config)
      rateLimiter.check('user2', config)

      rateLimiter.reset('user1')

      const user1Result = rateLimiter.check('user1', config)
      expect(user1Result.allowed).toBe(true)

      const user2Result = rateLimiter.check('user2', config)
      expect(user2Result.allowed).toBe(false)
    })
  })

  describe('getStatus', () => {
    it('returns null for users with no attempts', () => {
      const status = rateLimiter.getStatus('user1')
      expect(status).toBeNull()
    })

    it('returns current status without incrementing', () => {
      const config = { maxAttempts: 3, windowMs: 60000 }

      rateLimiter.check('user1', config)
      rateLimiter.check('user1', config)

      const status = rateLimiter.getStatus('user1')
      expect(status).toBeDefined()
      expect(status?.remaining).toBe(1)
      expect(status?.allowed).toBe(true)

      // Check again - should be the same
      const status2 = rateLimiter.getStatus('user1')
      expect(status2?.remaining).toBe(1)
    })

    it('shows blocked status when limit exceeded', () => {
      const config = { maxAttempts: 1, windowMs: 60000 }

      rateLimiter.check('user1', config)
      rateLimiter.check('user1', config)

      const status = rateLimiter.getStatus('user1')
      expect(status?.allowed).toBe(false)
      expect(status?.retryAfter).toBeDefined()
    })
  })

  describe('cleanup', () => {
    it('removes expired entries', async () => {
      const config = { maxAttempts: 1, windowMs: 100 }

      rateLimiter.check('user1', config)
      const status1 = rateLimiter.getStatus('user1')
      expect(status1).toBeDefined()

      // Wait for window to expire plus cleanup interval
      await new Promise((resolve) => setTimeout(resolve, 150))

      // Trigger cleanup by checking again
      rateLimiter.check('user2', config)

      const status2 = rateLimiter.getStatus('user1')
      expect(status2).toBeNull()
    })
  })

  describe('destroy', () => {
    it('cleans up resources', () => {
      const limiter = new RateLimiter()
      limiter.check('user1', { maxAttempts: 5, windowMs: 60000 })

      limiter.destroy()

      // Should still work but with fresh state
      const status = limiter.getStatus('user1')
      expect(status).toBeNull()
    })
  })

  describe('default configuration', () => {
    it('uses default config when not specified', () => {
      const result = rateLimiter.check('user1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4) // Default is 5 attempts
    })
  })
})
