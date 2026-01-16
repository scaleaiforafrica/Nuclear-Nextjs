'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User, AuthResult, UserRole } from '@/models'
import { isDemoAccount } from '@/lib/demo/utils'
import { restoreDemoData } from '@/lib/demo/restore-demo-data'
import { DEMO_CONFIG } from '@/lib/demo/config'

interface Profile {
  name: string
  role: UserRole
  initials: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  availableProfiles: Profile[]
  switchProfile: (profile: Profile) => void
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

function mapSupabaseUser(supabaseUser: SupabaseUser, selectedRole?: UserRole): User {
  const email = supabaseUser.email || ''
  const name = supabaseUser.user_metadata?.full_name || 
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  
  // Use selected role if provided, otherwise use role from metadata or default
  const role = selectedRole || (supabaseUser.user_metadata?.role as UserRole) || 'Hospital Administrator'
  
  return {
    id: supabaseUser.id,
    name,
    role,
    initials: generateInitials(name)
  }
}

// Generate available profiles for a user
function getAvailableProfiles(supabaseUser: SupabaseUser): Profile[] {
  const email = supabaseUser.email || ''
  const name = supabaseUser.user_metadata?.full_name || 
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const initials = generateInitials(name)
  
  // Get roles from user metadata, or default to all roles
  const userRoles = supabaseUser.user_metadata?.available_roles as UserRole[] | undefined
  
  // If user has specific roles defined, use those; otherwise provide all three roles
  const roles: UserRole[] = userRoles && userRoles.length > 0 
    ? userRoles 
    : ['Hospital Administrator', 'Logistics Manager', 'Compliance Officer']
  
  return roles.map(role => ({
    name,
    role,
    initials
  }))
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined)
  
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setSupabaseUser(session.user)
        const profiles = getAvailableProfiles(session.user)
        setAvailableProfiles(profiles)
        
        // Try to get stored role preference from localStorage
        const storedRole = localStorage.getItem('selectedRole') as UserRole | null
        const roleToUse = storedRole && profiles.some(p => p.role === storedRole) 
          ? storedRole 
          : undefined
        
        setSelectedRole(roleToUse)
        setUser(mapSupabaseUser(session.user, roleToUse))
      }
      setIsLoading(false)
    }
    
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          const profiles = getAvailableProfiles(session.user)
          setAvailableProfiles(profiles)
          
          // Try to get stored role preference from localStorage
          const storedRole = localStorage.getItem('selectedRole') as UserRole | null
          const roleToUse = storedRole && profiles.some(p => p.role === storedRole) 
            ? storedRole 
            : undefined
          
          setSelectedRole(roleToUse)
          setUser(mapSupabaseUser(session.user, roleToUse))
        } else {
          setSupabaseUser(null)
          setUser(null)
          setAvailableProfiles([])
          setSelectedRole(undefined)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const switchProfile = useCallback((profile: Profile) => {
    if (supabaseUser && profile.role !== user?.role) {
      setSelectedRole(profile.role)
      setUser(mapSupabaseUser(supabaseUser, profile.role))
      // Store the selected role in localStorage for persistence
      localStorage.setItem('selectedRole', profile.role)
    }
  }, [supabaseUser, user?.role])

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
    
    // Clear stored role preference
    localStorage.removeItem('selectedRole')
    
    await supabase.auth.signOut()
    setSupabaseUser(null)
    setUser(null)
    setAvailableProfiles([])
    setSelectedRole(undefined)
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
      availableProfiles,
      switchProfile,
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
