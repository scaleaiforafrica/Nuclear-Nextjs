/**
 * Storage Service
 * Local storage and session storage utilities
 * Handles auth state persistence and general data storage
 */

import { Result } from '@/lib/types'

// Storage error type
export interface StorageError {
  code: string
  message: string
}

// Storage keys enum for type safety
export const STORAGE_KEYS = {
  AUTH_STATE: 'nuclear_auth_state',
  AUTH_TOKEN: 'nuclear_auth_token',
  USER_PREFERENCES: 'nuclear_user_preferences',
  SIDEBAR_COLLAPSED: 'nuclear_sidebar_collapsed',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safely parse JSON with error handling
 */
function safeJsonParse<T>(value: string): Result<T, StorageError> {
  try {
    const parsed = JSON.parse(value) as T
    return { success: true, data: parsed }
  } catch {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse stored value',
      },
    }
  }
}

/**
 * Safely stringify value with error handling
 */
function safeJsonStringify<T>(value: T): Result<string, StorageError> {
  try {
    const stringified = JSON.stringify(value)
    return { success: true, data: stringified }
  } catch {
    return {
      success: false,
      error: {
        code: 'STRINGIFY_ERROR',
        message: 'Failed to stringify value',
      },
    }
  }
}

// ============================================
// Local Storage Functions
// ============================================

/**
 * Get item from local storage
 */
export function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null
  
  try {
    const item = localStorage.getItem(key)
    if (item === null) return null
    
    const result = safeJsonParse<T>(item)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

/**
 * Get item from local storage with Result type
 */
export function getItemSafe<T>(key: string): Result<T | null, StorageError> {
  if (!isBrowser()) {
    return { success: true, data: null }
  }
  
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return { success: true, data: null }
    }
    
    const result = safeJsonParse<T>(item)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return result
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'STORAGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to access storage',
      },
    }
  }
}

/**
 * Set item in local storage
 */
export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return
  
  try {
    const stringified = JSON.stringify(value)
    localStorage.setItem(key, stringified)
  } catch {
    // Silently fail - use setItemSafe for error handling
  }
}

/**
 * Set item in local storage with Result type
 */
export function setItemSafe<T>(key: string, value: T): Result<void, StorageError> {
  if (!isBrowser()) {
    return { success: true, data: undefined }
  }
  
  try {
    const stringifyResult = safeJsonStringify(value)
    if (!stringifyResult.success) {
      return stringifyResult as Result<void, StorageError>
    }
    
    localStorage.setItem(key, stringifyResult.data)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'STORAGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to write to storage',
      },
    }
  }
}

/**
 * Remove item from local storage
 */
export function removeItem(key: string): void {
  if (!isBrowser()) return
  
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently fail
  }
}

/**
 * Remove item from local storage with Result type
 */
export function removeItemSafe(key: string): Result<void, StorageError> {
  if (!isBrowser()) {
    return { success: true, data: undefined }
  }
  
  try {
    localStorage.removeItem(key)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'STORAGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to remove from storage',
      },
    }
  }
}

/**
 * Clear all items from local storage
 */
export function clearStorage(): void {
  if (!isBrowser()) return
  
  try {
    localStorage.clear()
  } catch {
    // Silently fail
  }
}

// ============================================
// Session Storage Functions (for auth state)
// ============================================

/**
 * Get item from session storage
 */
export function getSessionItem<T>(key: string): T | null {
  if (!isBrowser()) return null
  
  try {
    const item = sessionStorage.getItem(key)
    if (item === null) return null
    
    const result = safeJsonParse<T>(item)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

/**
 * Get item from session storage with Result type
 */
export function getSessionItemSafe<T>(key: string): Result<T | null, StorageError> {
  if (!isBrowser()) {
    return { success: true, data: null }
  }
  
  try {
    const item = sessionStorage.getItem(key)
    if (item === null) {
      return { success: true, data: null }
    }
    
    const result = safeJsonParse<T>(item)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return result
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SESSION_STORAGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to access session storage',
      },
    }
  }
}

/**
 * Set item in session storage
 */
export function setSessionItem<T>(key: string, value: T): void {
  if (!isBrowser()) return
  
  try {
    const stringified = JSON.stringify(value)
    sessionStorage.setItem(key, stringified)
  } catch {
    // Silently fail
  }
}

/**
 * Set item in session storage with Result type
 */
export function setSessionItemSafe<T>(key: string, value: T): Result<void, StorageError> {
  if (!isBrowser()) {
    return { success: true, data: undefined }
  }
  
  try {
    const stringifyResult = safeJsonStringify(value)
    if (!stringifyResult.success) {
      return stringifyResult as Result<void, StorageError>
    }
    
    sessionStorage.setItem(key, stringifyResult.data)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SESSION_STORAGE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to write to session storage',
      },
    }
  }
}

/**
 * Remove item from session storage
 */
export function removeSessionItem(key: string): void {
  if (!isBrowser()) return
  
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Silently fail
  }
}

/**
 * Clear all items from session storage
 */
export function clearSessionStorage(): void {
  if (!isBrowser()) return
  
  try {
    sessionStorage.clear()
  } catch {
    // Silently fail
  }
}

// ============================================
// Auth-specific Storage Functions
// ============================================

import { AuthState } from '@/models/user.model'

/**
 * Get auth state from session storage
 */
export function getAuthState(): AuthState | null {
  return getSessionItem<AuthState>(STORAGE_KEYS.AUTH_STATE)
}

/**
 * Set auth state in session storage
 */
export function setAuthState(state: AuthState): void {
  setSessionItem(STORAGE_KEYS.AUTH_STATE, state)
}

/**
 * Clear auth state from session storage
 */
export function clearAuthState(): void {
  removeSessionItem(STORAGE_KEYS.AUTH_STATE)
  removeSessionItem(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Check if user is authenticated based on stored state
 */
export function isStoredAuthenticated(): boolean {
  const state = getAuthState()
  return state?.isAuthenticated ?? false
}
