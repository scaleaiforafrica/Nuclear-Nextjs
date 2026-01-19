'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User, AuthResult, UserRole } from '@/models'
import { isDemoAccount } from '@/lib/demo/utils'
import { restoreDemoData } from '@/lib/demo/restore-demo-data'
import { DEMO_CONFIG } from '@/lib/demo/config'
import {
  getStoredAccounts,
  saveAccount,
  setActiveAccount,
  getActiveAccountId,
  removeAccount,
  clearAllAccounts,
  updateAccountLastUsed,
  type StoredAccount,
} from '@/lib/account-manager'

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
  storedAccounts: StoredAccount[]
  switchAccount: (accountId: string) => Promise<void>
  addAccount: (email: string, password: string) => Promise<AuthResult>
  removeStoredAccount: (accountId: string) => void
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

function getUserName(supabaseUser: SupabaseUser): string {
  const email = supabaseUser.email || ''
  return (
    supabaseUser.user_metadata?.full_name || 
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  )
}

function mapSupabaseUser(supabaseUser: SupabaseUser, selectedRole?: UserRole): User {
  const name = getUserName(supabaseUser)
  
  // Use selected role if provided, otherwise use role from metadata or default
  const role = selectedRole || (supabaseUser.user_metadata?.role as UserRole) || 'Hospital Administrator'
  
  return {
    id: supabaseUser.id,
    name,
    role,
    initials: generateInitials(name)
  }
}

// Type guard to check if a value is a valid UserRole
function isValidUserRole(role: any): role is UserRole {
  return ['Hospital Administrator', 'Logistics Manager', 'Compliance Officer'].includes(role)
}

// Generate available profiles for a user
function getAvailableProfiles(supabaseUser: SupabaseUser): Profile[] {
  const name = getUserName(supabaseUser)
  const initials = generateInitials(name)
  
  // Valid role values
  const validRoles: UserRole[] = ['Hospital Administrator', 'Logistics Manager', 'Compliance Officer']
  
  // Get roles from user metadata with type guard validation
  const userRolesRaw = supabaseUser.user_metadata?.available_roles
  const userRoles = Array.isArray(userRolesRaw) 
    ? userRolesRaw.filter(isValidUserRole) 
    : []
  
  // Use validated user roles if available, otherwise use all roles
  const roles: UserRole[] = userRoles.length > 0 ? userRoles : validRoles
  
  return roles.map(role => ({
    name,
    role,
    initials
  }))
}

// Helper function to get stored role from localStorage
function getStoredRole(profiles: Profile[]): UserRole | undefined {
  const storedRole = localStorage.getItem('selectedRole') as UserRole | null
  return storedRole && profiles.some(p => p.role === storedRole) 
    ? storedRole 
    : undefined
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
  const [storedAccounts, setStoredAccounts] = useState<StoredAccount[]>([])
  
  const supabase = createClient()

  // Load stored accounts
  useEffect(() => {
    setStoredAccounts(getStoredAccounts())
  }, [])

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setSupabaseUser(session.user)
        const profiles = getAvailableProfiles(session.user)
        setAvailableProfiles(profiles)
        
        const roleToUse = getStoredRole(profiles)
        setSelectedRole(roleToUse)
        setUser(mapSupabaseUser(session.user, roleToUse))

        // Save/update account in storage
        const accountName = getUserName(session.user)
        const existingAccount: StoredAccount = {
          id: session.user.id,
          email: session.user.email || '',
          name: accountName,
          session: session,
          lastUsed: Date.now(),
        }
        saveAccount(existingAccount)
        setActiveAccount(session.user.id)
        setStoredAccounts(getStoredAccounts())
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
          
          const roleToUse = getStoredRole(profiles)
          setSelectedRole(roleToUse)
          setUser(mapSupabaseUser(session.user, roleToUse))

          // Save/update account in storage
          const accountName = getUserName(session.user)
          const existingAccount: StoredAccount = {
            id: session.user.id,
            email: session.user.email || '',
            name: accountName,
            session: session,
            lastUsed: Date.now(),
          }
          saveAccount(existingAccount)
          setActiveAccount(session.user.id)
          setStoredAccounts(getStoredAccounts())
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

  const switchAccount = useCallback(async (accountId: string) => {
    const account = getStoredAccounts().find(a => a.id === accountId)
    if (!account) {
      console.error('Account not found:', accountId)
      return
    }

    // Set the session for the selected account
    const { error } = await supabase.auth.setSession(account.session)
    if (error) {
      console.error('Failed to switch account:', error)
      // If session is invalid, remove it
      removeAccount(accountId)
      setStoredAccounts(getStoredAccounts())
      return
    }

    // Update last used timestamp
    updateAccountLastUsed(accountId)
    setActiveAccount(accountId)
    setStoredAccounts(getStoredAccounts())
  }, [supabase.auth])

  const addAccount = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    // Sign out current user temporarily
    const currentSession = await supabase.auth.getSession()
    
    // Sign in with new account
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      // Restore previous session if login failed
      if (currentSession.data.session) {
        await supabase.auth.setSession(currentSession.data.session)
      }
      return { success: false, error: error.message }
    }

    if (data.user && data.session) {
      // Save the new account
      const accountName = getUserName(data.user)
      const newAccount: StoredAccount = {
        id: data.user.id,
        email: data.user.email || '',
        name: accountName,
        session: data.session,
        lastUsed: Date.now(),
      }
      saveAccount(newAccount)
      setStoredAccounts(getStoredAccounts())

      return { success: true, user: mapSupabaseUser(data.user) }
    }
    
    return { success: false, error: 'Failed to add account' }
  }, [supabase.auth])

  const removeStoredAccount = useCallback((accountId: string) => {
    removeAccount(accountId)
    setStoredAccounts(getStoredAccounts())
  }, [])

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
      storedAccounts,
      switchAccount,
      addAccount,
      removeStoredAccount,
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
