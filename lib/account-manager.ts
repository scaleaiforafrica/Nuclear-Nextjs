/**
 * Account Manager
 * Manages multiple user accounts and their sessions
 */

import type { Session } from '@supabase/supabase-js'

export interface StoredAccount {
  id: string
  email: string
  name: string
  session: Session
  lastUsed: number
}

const STORAGE_KEY = 'nuclear_accounts'
const ACTIVE_ACCOUNT_KEY = 'nuclear_active_account'

/**
 * Get all stored accounts
 */
export function getStoredAccounts(): StoredAccount[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to get stored accounts:', error)
    return []
  }
}

/**
 * Get the active account ID
 */
export function getActiveAccountId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ACCOUNT_KEY)
  } catch (error) {
    console.error('Failed to get active account:', error)
    return null
  }
}

/**
 * Save an account
 */
export function saveAccount(account: StoredAccount): void {
  try {
    const accounts = getStoredAccounts()
    const existingIndex = accounts.findIndex(a => a.id === account.id)
    
    if (existingIndex >= 0) {
      accounts[existingIndex] = account
    } else {
      accounts.push(account)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch (error) {
    console.error('Failed to save account:', error)
  }
}

/**
 * Set the active account
 */
export function setActiveAccount(accountId: string): void {
  try {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId)
  } catch (error) {
    console.error('Failed to set active account:', error)
  }
}

/**
 * Get an account by ID
 */
export function getAccountById(accountId: string): StoredAccount | null {
  const accounts = getStoredAccounts()
  return accounts.find(a => a.id === accountId) || null
}

/**
 * Remove an account
 */
export function removeAccount(accountId: string): void {
  try {
    const accounts = getStoredAccounts()
    const filtered = accounts.filter(a => a.id !== accountId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    
    // If the removed account was active, clear active account
    if (getActiveAccountId() === accountId) {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY)
    }
  } catch (error) {
    console.error('Failed to remove account:', error)
  }
}

/**
 * Clear all accounts
 */
export function clearAllAccounts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY)
  } catch (error) {
    console.error('Failed to clear accounts:', error)
  }
}

/**
 * Update account last used timestamp
 */
export function updateAccountLastUsed(accountId: string): void {
  try {
    const accounts = getStoredAccounts()
    const account = accounts.find(a => a.id === accountId)
    if (account) {
      account.lastUsed = Date.now()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
    }
  } catch (error) {
    console.error('Failed to update account last used:', error)
  }
}
