/**
 * Demo System Utility Functions
 * Helper functions for demo account detection, validation, and data operations
 */

import type { User as SupabaseUser } from '@supabase/supabase-js'
import { DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_ID } from './config'

/**
 * Check if a user is the demo account
 */
export function isDemoAccount(user: SupabaseUser | null): boolean {
  if (!user) return false
  return user.id === DEMO_ACCOUNT_ID || user.email === DEMO_ACCOUNT_EMAIL
}

/**
 * Check if a user ID matches the demo account
 */
export function isDemoAccountId(userId: string | undefined | null): boolean {
  if (!userId) return false
  return userId === DEMO_ACCOUNT_ID
}

/**
 * Check if an email is the demo account email
 */
export function isDemoAccountEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return email.toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase()
}

/**
 * Generate a deterministic ID for demo data
 * Ensures consistent IDs across restorations for testing
 * 
 * Note: This is primarily for development/testing purposes.
 * In production, Supabase will generate proper UUIDs automatically.
 * 
 * @param table - Table name for uniqueness
 * @param index - Record index within table
 * @returns A valid UUID v4 format string
 */
export function generateDemoId(table: string, index: number): string {
  // Create a simple hash from table name for uniqueness
  let tableHash = 0
  for (let i = 0; i < table.length; i++) {
    tableHash = ((tableHash << 5) - tableHash) + table.charCodeAt(i)
    tableHash = tableHash & tableHash // Convert to 32-bit integer
  }
  
  // Use absolute value and format as hex
  const tableHex = Math.abs(tableHash).toString(16).padStart(4, '0').substring(0, 4)
  const indexHex = index.toString(16).padStart(8, '0')
  
  // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `10000000-${tableHex}-4000-8000-${indexHex}`
}

/**
 * Validate seed data structure
 */
export function validateSeedData(
  data: unknown,
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!Array.isArray(data)) {
    errors.push('Seed data must be an array')
    return { valid: false, errors }
  }

  if (data.length === 0) {
    errors.push('Seed data cannot be empty')
    return { valid: false, errors }
  }

  data.forEach((record, index) => {
    if (typeof record !== 'object' || record === null) {
      errors.push(`Record at index ${index} is not an object`)
      return
    }

    requiredFields.forEach(field => {
      if (!(field in record)) {
        errors.push(`Record at index ${index} missing required field: ${field}`)
      }
    })
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

/**
 * Calculate percentage for coverage display
 */
export function calculateCoverage(
  tablesWithData: number,
  totalTables: number
): number {
  if (totalTables === 0) return 0
  return Math.round((tablesWithData / totalTables) * 100)
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry wrapper for async operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number,
  delayMs: number
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt) // Exponential backoff
      }
    }
  }

  throw lastError || new Error('Operation failed after retries')
}

/**
 * Parse JSON safely with error handling
 */
export function parseJSON<T>(
  json: string,
  fallback: T
): { data: T; error: string | null } {
  try {
    const data = JSON.parse(json) as T
    return { data, error: null }
  } catch (error) {
    return {
      data: fallback,
      error: error instanceof Error ? error.message : 'JSON parse error',
    }
  }
}

/**
 * Deep clone object safely
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

/**
 * Check if code is running on client side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check if code is running on server side
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}

/**
 * Safe localStorage access with fallback
 */
export function getLocalStorage<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback

  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

/**
 * Safe localStorage write
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  if (!isClient()) return false

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Remove localStorage item
 */
export function removeLocalStorage(key: string): boolean {
  if (!isClient()) return false

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Create a timeout promise that rejects after specified duration
 */
export function timeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ])
}

/**
 * Batch array into chunks
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Check if a timestamp is within the last N hours
 */
export function isRecent(timestamp: string | Date, hoursAgo: number): boolean {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
  return date >= cutoff
}
