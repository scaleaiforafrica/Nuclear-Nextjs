'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User, AuthResult, UserRole } from '@/models'
import { isDemoAccount } from '@/lib/demo/utils'
import { restoreDemoData } from '@/lib/demo/restore-demo-data'
import { DEMO_CONFIG } from '@/lib/demo/config'

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  const email = supabaseUser.email || ''
  const name = supabaseUser.user_metadata?.full_name || 
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  
  return {
    id: supabaseUser.id,
    name,
    role: (supabaseUser.user_metadata?.role as UserRole) || 'Hospital Administrator',
    initials: generateInitials(name)
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setSupabaseUser(session.user)
        setUser(mapSupabaseUser(session.user))
      }
      setIsLoading(false)
    }
    
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          setUser(mapSupabaseUser(session.user))
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) return { success: false, error: error.message }
    if (data.user) return { success: true, user: mapSupabaseUser(data.user) }
    return { success: false, error: 'Login failed' }
  }, [supabase.auth])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    
    if (error) return { success: false, error: error.message }
    if (data.user) return { success: true, user: mapSupabaseUser(data.user) }
    return { success: false, error: 'Sign up failed' }
  }, [supabase.auth])

  const logout = useCallback(async () => {
    // Check if demo account and restore data before logout
    if (supabaseUser && isDemoAccount(supabaseUser) && DEMO_CONFIG.restoration.onLogout) {
      try {
        await restoreDemoData('logout')
      } catch (error) {
        console.error('Failed to restore demo data on logout:', error)
        // Continue with logout even if restoration fails
      }
    }
    
    await supabase.auth.signOut()
    setSupabaseUser(null)
    setUser(null)
  }, [supabase.auth, supabaseUser])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return error ? { success: false, error: error.message } : { success: true }
  }, [supabase.auth])

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!supabaseUser,
      user,
      supabaseUser,
      isLoading,
      login,
      signUp,
      logout,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export { AuthContext }
