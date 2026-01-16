/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfter?: number
}

/**
 * Rate limit entry stored in memory
 */
interface RateLimitEntry {
  attempts: number
  resetAt: Date
}

/**
 * Default rate limit configuration
 * 5 attempts per hour
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
}

/**
 * In-memory rate limiter for password change attempts
 * For production, consider using Redis or another persistent store
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if a request is allowed under rate limits
   * @param identifier - Unique identifier (e.g., user ID)
   * @param config - Rate limit configuration
   * @returns Rate limit result
   */
  check(
    identifier: string,
    config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
  ): RateLimitResult {
    const now = new Date()
    const entry = this.store.get(identifier)

    // No previous attempts or window has expired
    if (!entry || entry.resetAt <= now) {
      const resetAt = new Date(now.getTime() + config.windowMs)
      this.store.set(identifier, { attempts: 1, resetAt })

      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetAt,
      }
    }

    // Within rate limit window
    if (entry.attempts < config.maxAttempts) {
      entry.attempts++
      this.store.set(identifier, entry)

      return {
        allowed: true,
        remaining: config.maxAttempts - entry.attempts,
        resetAt: entry.resetAt,
      }
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil(
      (entry.resetAt.getTime() - now.getTime()) / 1000
    )

    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    }
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Clean up expired entries from the store
   */
  private cleanup(): void {
    const now = new Date()
    const expiredKeys: string[] = []

    this.store.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach((key) => this.store.delete(key))
  }

  /**
   * Get current rate limit status without incrementing
   * @param identifier - Unique identifier to check
   * @returns Current status or null if no entry exists
   */
  getStatus(identifier: string): RateLimitResult | null {
    const entry = this.store.get(identifier)
    if (!entry) return null

    const now = new Date()
    if (entry.resetAt <= now) {
      this.store.delete(identifier)
      return null
    }

    const retryAfter =
      entry.attempts >= DEFAULT_RATE_LIMIT_CONFIG.maxAttempts
        ? Math.ceil((entry.resetAt.getTime() - now.getTime()) / 1000)
        : undefined

    return {
      allowed: entry.attempts < DEFAULT_RATE_LIMIT_CONFIG.maxAttempts,
      remaining: Math.max(
        0,
        DEFAULT_RATE_LIMIT_CONFIG.maxAttempts - entry.attempts
      ),
      resetAt: entry.resetAt,
      retryAfter,
    }
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// Global rate limiter instance
let rateLimiterInstance: RateLimiter | null = null

/**
 * Get the global rate limiter instance
 * Creates a new instance if one doesn't exist
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter()
  }
  return rateLimiterInstance
}

/**
 * Reset the global rate limiter instance
 * Useful for testing
 */
export function resetRateLimiter(): void {
  if (rateLimiterInstance) {
    rateLimiterInstance.destroy()
    rateLimiterInstance = null
  }
}
