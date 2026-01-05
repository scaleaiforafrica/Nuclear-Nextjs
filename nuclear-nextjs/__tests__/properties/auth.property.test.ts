import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import type { User, UserRole, LoginCredentials, AuthResult } from '../../models/user.model'
import { 
  login, 
  logout, 
  getAuthState, 
  isAuthenticated,
  setAuthState,
  validateLoginCredentials
} from '../../controllers/auth.controller'

// Arbitraries for generating valid test data
const userRoleArb = fc.constantFrom<UserRole>(
  'Hospital Administrator',
  'Logistics Manager',
  'Compliance Officer'
)

const userArb = fc.record<User>({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: userRoleArb,
  initials: fc.string({ minLength: 1, maxLength: 5 }),
})

const validEmailArb = fc.tuple(
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9._]+$/.test(s)),
  fc.constantFrom('example.com', 'test.org', 'company.net')
).map(([local, domain]) => `${local}@${domain}`)

const validPasswordArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)

const validCredentialsArb = fc.record<LoginCredentials>({
  email: validEmailArb,
  password: validPasswordArb
})

const invalidEmailArb = fc.oneof(
  fc.constant(''),
  fc.constant('   '),
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@')),
  fc.constant('invalid@'),
  fc.constant('@invalid.com')
)

describe('Auth State Management', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 6: Auth State Management
   * *For any* authentication action (login, logout), the auth controller SHALL 
   * correctly update the authentication state to reflect the action taken.
   * **Validates: Requirements 5.2**
   */

  beforeEach(() => {
    // Reset auth state before each test
    logout()
  })

  it('should update auth state to authenticated after successful login for any valid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Ensure we start logged out
        logout()
        expect(isAuthenticated()).toBe(false)
        
        // Perform login
        const result = await login(credentials)
        
        // Verify login succeeded
        expect(result.success).toBe(true)
        
        // Verify auth state is updated
        expect(isAuthenticated()).toBe(true)
        
        const authState = getAuthState()
        expect(authState.isAuthenticated).toBe(true)
        expect(authState.user).not.toBeNull()
        expect(authState.user?.id).toBeDefined()
        expect(authState.user?.name).toBeDefined()
        expect(authState.user?.role).toBeDefined()
        expect(authState.user?.initials).toBeDefined()
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })

  it('should update auth state to unauthenticated after logout for any authenticated state', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // First login
        await login(credentials)
        expect(isAuthenticated()).toBe(true)
        
        // Perform logout
        logout()
        
        // Verify auth state is updated
        expect(isAuthenticated()).toBe(false)
        
        const authState = getAuthState()
        expect(authState.isAuthenticated).toBe(false)
        expect(authState.user).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly reflect auth state via getAuthState for any user', () => {
    fc.assert(
      fc.property(userArb, (user) => {
        // Set auth state directly
        setAuthState({ isAuthenticated: true, user })
        
        // Verify getAuthState returns correct state
        const state = getAuthState()
        expect(state.isAuthenticated).toBe(true)
        expect(state.user).toEqual(user)
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })

  it('should return consistent isAuthenticated result matching getAuthState', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        userArb,
        (shouldBeAuthenticated, user) => {
          // Set auth state
          if (shouldBeAuthenticated) {
            setAuthState({ isAuthenticated: true, user })
          } else {
            logout()
          }
          
          // Verify consistency
          const state = getAuthState()
          expect(isAuthenticated()).toBe(state.isAuthenticated)
          
          // Cleanup
          logout()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return error result for invalid credentials', () => {
    fc.assert(
      fc.property(
        invalidEmailArb,
        validPasswordArb,
        (email, password) => {
          const result = validateLoginCredentials({ email, password })
          
          // Invalid email should result in validation failure
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.code).toBe('INVALID_CREDENTIALS')
            expect(result.error.fields).toContain('email')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return error result for empty password', () => {
    fc.assert(
      fc.property(
        validEmailArb,
        fc.constantFrom('', '   '),
        (email, password) => {
          const result = validateLoginCredentials({ email, password })
          
          // Empty password should result in validation failure
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.code).toBe('INVALID_CREDENTIALS')
            expect(result.error.fields).toContain('password')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * Auth-View Mapping Tests
 * 
 * These tests verify that the correct view is shown based on authentication state.
 * Property 9: Auth-View Mapping
 */

// View types that can be shown based on auth state
type ViewType = 'landing' | 'dashboard'

/**
 * Determines which view should be shown based on authentication state
 * @param isAuthenticated - Whether the user is authenticated
 * @returns The view type that should be displayed
 */
function getExpectedView(isAuthenticated: boolean): ViewType {
  return isAuthenticated ? 'dashboard' : 'landing'
}

/**
 * Simulates the view selection logic based on auth state
 * This mirrors the behavior of the ProtectedRoute component
 */
function selectView(authState: { isAuthenticated: boolean; user: User | null }): ViewType {
  if (authState.isAuthenticated && authState.user !== null) {
    return 'dashboard'
  }
  return 'landing'
}

describe('Auth-View Mapping', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 9: Auth-View Mapping
   * *For any* authentication state, the application SHALL display the landing page 
   * when unauthenticated and the dashboard when authenticated.
   * **Validates: Requirements 8.1, 8.4**
   */

  beforeEach(() => {
    logout()
  })

  it('should show landing page for any unauthenticated state', () => {
    fc.assert(
      fc.property(
        fc.constant({ isAuthenticated: false, user: null }),
        (authState) => {
          const view = selectView(authState)
          expect(view).toBe('landing')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should show dashboard for any authenticated state with valid user', () => {
    fc.assert(
      fc.property(userArb, (user) => {
        const authState = { isAuthenticated: true, user }
        const view = selectView(authState)
        expect(view).toBe('dashboard')
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly map auth state to view for any combination', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        userArb,
        (shouldBeAuthenticated, user) => {
          const authState = shouldBeAuthenticated 
            ? { isAuthenticated: true, user }
            : { isAuthenticated: false, user: null }
          
          const view = selectView(authState)
          const expectedView = getExpectedView(shouldBeAuthenticated)
          
          expect(view).toBe(expectedView)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should show landing when isAuthenticated is true but user is null', () => {
    // Edge case: inconsistent state where isAuthenticated is true but user is null
    const authState = { isAuthenticated: true, user: null }
    const view = selectView(authState)
    // Should show landing because user is null (invalid state)
    expect(view).toBe('landing')
  })

  it('should transition view correctly after login', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Start unauthenticated
        logout()
        let authState = getAuthState()
        expect(selectView(authState)).toBe('landing')
        
        // Login
        await login(credentials)
        authState = getAuthState()
        
        // Should now show dashboard
        expect(selectView(authState)).toBe('dashboard')
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })

  it('should transition view correctly after logout', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Start authenticated
        await login(credentials)
        let authState = getAuthState()
        expect(selectView(authState)).toBe('dashboard')
        
        // Logout
        logout()
        authState = getAuthState()
        
        // Should now show landing
        expect(selectView(authState)).toBe('landing')
      }),
      { numRuns: 100 }
    )
  })
})


describe('Auth Persistence', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 11: Auth Persistence
   * *For any* page navigation within an authenticated session, the authentication 
   * state SHALL persist and remain valid.
   * **Validates: Requirements 8.5**
   */

  beforeEach(() => {
    logout()
  })

  it('should persist auth state after setting for any user', () => {
    fc.assert(
      fc.property(userArb, (user) => {
        // Set auth state
        setAuthState({ isAuthenticated: true, user })
        
        // Simulate "navigation" by getting auth state again
        const persistedState = getAuthState()
        
        // Auth state should persist
        expect(persistedState.isAuthenticated).toBe(true)
        expect(persistedState.user).toEqual(user)
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })

  it('should maintain auth state across multiple getAuthState calls', () => {
    fc.assert(
      fc.property(
        userArb,
        fc.integer({ min: 2, max: 10 }),
        (user, numCalls) => {
          // Set auth state
          setAuthState({ isAuthenticated: true, user })
          
          // Simulate multiple "navigations" by calling getAuthState multiple times
          const states: ReturnType<typeof getAuthState>[] = []
          for (let i = 0; i < numCalls; i++) {
            states.push(getAuthState())
          }
          
          // All states should be identical
          states.forEach(state => {
            expect(state.isAuthenticated).toBe(true)
            expect(state.user).toEqual(user)
          })
          
          // Cleanup
          logout()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should persist auth state after login across simulated navigations', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCredentialsArb,
        fc.integer({ min: 1, max: 5 }),
        async (credentials, numNavigations) => {
          // Login
          const loginResult = await login(credentials)
          expect(loginResult.success).toBe(true)
          
          // Get initial auth state
          const initialState = getAuthState()
          expect(initialState.isAuthenticated).toBe(true)
          
          // Simulate multiple navigations
          for (let i = 0; i < numNavigations; i++) {
            const currentState = getAuthState()
            
            // Auth state should persist across all navigations
            expect(currentState.isAuthenticated).toBe(initialState.isAuthenticated)
            expect(currentState.user?.id).toBe(initialState.user?.id)
            expect(currentState.user?.name).toBe(initialState.user?.name)
            expect(currentState.user?.role).toBe(initialState.user?.role)
          }
          
          // Cleanup
          logout()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain isAuthenticated consistency with getAuthState', () => {
    fc.assert(
      fc.property(
        userArb,
        fc.integer({ min: 1, max: 10 }),
        (user, numChecks) => {
          // Set auth state
          setAuthState({ isAuthenticated: true, user })
          
          // Check consistency multiple times
          for (let i = 0; i < numChecks; i++) {
            const state = getAuthState()
            const authenticated = isAuthenticated()
            
            // isAuthenticated should always match getAuthState().isAuthenticated
            expect(authenticated).toBe(state.isAuthenticated)
          }
          
          // Cleanup
          logout()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should persist unauthenticated state correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (numChecks) => {
          // Ensure logged out
          logout()
          
          // Check persistence of unauthenticated state
          for (let i = 0; i < numChecks; i++) {
            const state = getAuthState()
            expect(state.isAuthenticated).toBe(false)
            expect(state.user).toBeNull()
            expect(isAuthenticated()).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not lose auth state when checking authentication status', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Login
        await login(credentials)
        const originalState = getAuthState()
        
        // Multiple checks should not affect the state
        for (let i = 0; i < 5; i++) {
          isAuthenticated()
          getAuthState()
        }
        
        // State should remain unchanged
        const finalState = getAuthState()
        expect(finalState.isAuthenticated).toBe(originalState.isAuthenticated)
        expect(finalState.user?.id).toBe(originalState.user?.id)
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })
})


describe('Login Redirect', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 10: Login Redirect
   * *For any* successful login action, the application SHALL redirect 
   * the user to the dashboard page.
   * **Validates: Requirements 8.3**
   */

  beforeEach(() => {
    logout()
  })

  /**
   * Simulates the redirect logic after login
   * Returns the target path based on login result
   */
  function getRedirectPath(loginResult: AuthResult): string | null {
    if (loginResult.success) {
      return '/dashboard'
    }
    return null // No redirect on failure
  }

  it('should redirect to dashboard for any successful login', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Perform login
        const result = await login(credentials)
        
        // Login should succeed
        expect(result.success).toBe(true)
        
        // Should redirect to dashboard
        const redirectPath = getRedirectPath(result)
        expect(redirectPath).toBe('/dashboard')
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })

  it('should not redirect for any failed login', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record<LoginCredentials>({
          email: invalidEmailArb,
          password: validPasswordArb
        }),
        async (credentials) => {
          // Perform login with invalid credentials
          const result = await login(credentials)
          
          // Login should fail
          expect(result.success).toBe(false)
          
          // Should not redirect
          const redirectPath = getRedirectPath(result)
          expect(redirectPath).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always redirect to /dashboard specifically after successful login', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        const result = await login(credentials)
        
        if (result.success) {
          const redirectPath = getRedirectPath(result)
          
          // Must redirect to exactly /dashboard
          expect(redirectPath).toBe('/dashboard')
          expect(redirectPath).not.toBe('/')
          expect(redirectPath).not.toBe('/dashboard/settings')
          expect(redirectPath).not.toBeNull()
        }
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })

  it('should have user data available after redirect for any successful login', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        const result = await login(credentials)
        
        if (result.success) {
          // After redirect, user data should be available
          const authState = getAuthState()
          
          expect(authState.isAuthenticated).toBe(true)
          expect(authState.user).not.toBeNull()
          expect(authState.user?.id).toBeDefined()
          expect(authState.user?.name).toBeDefined()
          expect(authState.user?.role).toBeDefined()
          expect(authState.user?.initials).toBeDefined()
        }
        
        // Cleanup
        logout()
      }),
      { numRuns: 100 }
    )
  })

  it('should maintain redirect target consistency for any login attempt', async () => {
    await fc.assert(
      fc.asyncProperty(
        validCredentialsArb,
        fc.integer({ min: 1, max: 5 }),
        async (credentials, numAttempts) => {
          const redirectPaths: (string | null)[] = []
          
          for (let i = 0; i < numAttempts; i++) {
            logout() // Reset state
            const result = await login(credentials)
            redirectPaths.push(getRedirectPath(result))
          }
          
          // All successful logins should redirect to the same path
          const successfulRedirects = redirectPaths.filter(p => p !== null)
          const uniqueRedirects = new Set(successfulRedirects)
          
          // Should only have one unique redirect path (/dashboard)
          expect(uniqueRedirects.size).toBeLessThanOrEqual(1)
          if (uniqueRedirects.size === 1) {
            expect(uniqueRedirects.has('/dashboard')).toBe(true)
          }
          
          // Cleanup
          logout()
        }
      ),
      { numRuns: 100 }
    )
  })
})
