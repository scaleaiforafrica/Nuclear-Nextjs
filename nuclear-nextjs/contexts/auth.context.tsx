'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthState, User, LoginCredentials, AuthResult } from '@/models'
import { 
  login as authLogin, 
  logout as authLogout, 
  getAuthState, 
  setAuthState as setControllerAuthState 
} from '@/controllers/auth.controller'

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  })
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from storage on mount
  useEffect(() => {
    const storedState = getAuthState()
    setAuthState(storedState)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    const result = await authLogin(credentials)
    
    if (result.success && result.user) {
      const newState: AuthState = {
        isAuthenticated: true,
        user: result.user
      }
      setAuthState(newState)
    }
    
    return result
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setAuthState({
      isAuthenticated: false,
      user: null
    })
  }, [])

  const value: AuthContextValue = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export for testing purposes
export { AuthContext }
