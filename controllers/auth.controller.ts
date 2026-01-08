// Auth controller - Business logic for authentication
import type { AuthState, LoginCredentials, AuthResult, User } from '@/models'
import { getItem, setItem, removeItem } from '@/services/storage.service'
import type { Result, ValidationError } from '@/lib/types'

// Storage key for auth state
const AUTH_STORAGE_KEY = 'nuclear_auth_state'

// In-memory auth state (for SSR compatibility)
let authState: AuthState = {
  isAuthenticated: false,
  user: null
}

// Initialize auth state from storage (client-side only)
function initializeAuthState(): void {
  if (typeof window === 'undefined') return
  
  const stored = getItem<AuthState>(AUTH_STORAGE_KEY)
  if (stored) {
    authState = stored
  }
}

// Persist auth state to storage
function persistAuthState(): void {
  if (typeof window === 'undefined') return
  setItem(AUTH_STORAGE_KEY, authState)
}

// Validate login credentials
function validateCredentials(credentials: LoginCredentials): Result<LoginCredentials, ValidationError> {
  const errors: string[] = []
  
  if (!credentials.email || credentials.email.trim() === '') {
    errors.push('email')
  } else if (!isValidEmail(credentials.email)) {
    errors.push('email')
  }
  
  if (!credentials.password || credentials.password.trim() === '') {
    errors.push('password')
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid login credentials provided',
        fields: errors
      }
    }
  }
  
  return { success: true, data: credentials }
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate user initials from name
function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Login with credentials
 * Returns AuthResult with user data on success or error message on failure
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  // Validate credentials
  const validation = validateCredentials(credentials)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.message
    }
  }
  
  // Simulate authentication (in real app, this would call an API)
  // For demo purposes, accept any valid email/password combination
  const user: User = {
    id: `user_${Date.now()}`,
    name: credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    role: 'Hospital Administrator',
    initials: generateInitials(credentials.email.split('@')[0])
  }
  
  // Update auth state
  authState = {
    isAuthenticated: true,
    user
  }
  
  // Persist to storage
  persistAuthState()
  
  return {
    success: true,
    user
  }
}

/**
 * Logout current user
 * Clears auth state and removes from storage
 */
export function logout(): void {
  authState = {
    isAuthenticated: false,
    user: null
  }
  
  // Remove from storage
  if (typeof window !== 'undefined') {
    removeItem(AUTH_STORAGE_KEY)
  }
}

/**
 * Get current authentication state
 * Initializes from storage if not already done
 */
export function getAuthState(): AuthState {
  initializeAuthState()
  return { ...authState }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  initializeAuthState()
  return authState.isAuthenticated
}

/**
 * Validate login credentials and return Result type
 * Used for form validation before submission
 */
export function validateLoginCredentials(credentials: LoginCredentials): Result<LoginCredentials, ValidationError> {
  return validateCredentials(credentials)
}

/**
 * Set auth state directly (useful for testing and SSR hydration)
 */
export function setAuthState(state: AuthState): void {
  authState = { ...state }
  persistAuthState()
}
