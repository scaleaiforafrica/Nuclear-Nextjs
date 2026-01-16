/**
 * Rate Limiter Utility
 * 
 * Implements rate limiting for password change attempts to prevent brute force attacks.
 * Uses in-memory storage for simplicity, but can be extended to use Redis or database.
 */

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfter?: number // seconds until next attempt allowed
}

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  resetAt: number
}

// In-memory store for rate limiting
// In production, this should use Redis or a distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

/**
 * Check if an action is rate limited
 * 
 * @param userId - User ID to rate limit
 * @param action - Action being rate limited (e.g., 'password-change')
 * @returns RateLimitResult with allowed status and remaining attempts
 */
export async function checkRateLimit(
  userId: string,
  action: string = 'password-change'
): Promise<RateLimitResult> {
  const key = `${action}:${userId}`
  const now = Date.now()
  
  // Get or create entry
  let entry = rateLimitStore.get(key)
  
  // Clean up expired entries
  if (entry && now > entry.resetAt) {
    rateLimitStore.delete(key)
    entry = undefined
  }
  
  // Create new entry if needed
  if (!entry) {
    entry = {
      attempts: 0,
      firstAttempt: now,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    }
  }
  
  // Increment attempts first
  entry.attempts++
  
  // Check if rate limit exceeded
  const allowed = entry.attempts <= RATE_LIMIT_CONFIG.maxAttempts
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - entry.attempts)
  const resetAt = new Date(entry.resetAt)
  
  // Calculate retry after in seconds
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000)
  
  // Save updated entry
  rateLimitStore.set(key, entry)
  
  return {
    allowed,
    remaining,
    resetAt,
    retryAfter,
  }
}

/**
 * Reset rate limit for a user
 * Useful after successful password change
 */
export async function resetRateLimit(userId: string, action: string = 'password-change'): Promise<void> {
  const key = `${action}:${userId}`
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  userId: string,
  action: string = 'password-change'
): Promise<RateLimitResult> {
  const key = `${action}:${userId}`
  const now = Date.now()
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetAt) {
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxAttempts,
      resetAt: new Date(now + RATE_LIMIT_CONFIG.windowMs),
    }
  }
  
  const allowed = entry.attempts < RATE_LIMIT_CONFIG.maxAttempts
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - entry.attempts)
  const resetAt = new Date(entry.resetAt)
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000)
  
  return {
    allowed,
    remaining,
    resetAt,
    retryAfter,
  }
}

/**
 * Clean up expired entries (should be called periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}
