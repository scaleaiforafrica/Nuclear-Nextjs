/**
 * Audit Logger Utility
 * 
 * Logs security-related events for compliance and security monitoring.
 */

import { createClient } from '@/lib/supabase/server'

export interface PasswordChangeAuditLog {
  user_id: string
  changed_at?: Date
  ip_address?: string
  user_agent?: string
  success: boolean
  failure_reason?: string
}

/**
 * Log a password change attempt to the audit table
 */
export async function logPasswordChangeAttempt(
  log: PasswordChangeAuditLog
): Promise<void> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('password_change_audit')
      .insert({
        user_id: log.user_id,
        changed_at: log.changed_at || new Date(),
        ip_address: log.ip_address || null,
        user_agent: log.user_agent || null,
        success: log.success,
        failure_reason: log.failure_reason || null,
      })
    
    if (error) {
      console.error('Failed to log password change audit:', error)
    }
  } catch (error) {
    // Don't throw errors from audit logging - it should not break the main flow
    console.error('Audit logging error:', error)
  }
}

/**
 * Store password in history table
 */
export async function storePasswordHistory(
  userId: string,
  passwordHash: string
): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Insert new password history entry
    const { error: insertError } = await supabase
      .from('password_history')
      .insert({
        user_id: userId,
        password_hash: passwordHash,
      })
    
    if (insertError) {
      console.error('Failed to store password history:', insertError)
      return
    }
    
    // Keep only last 5 passwords
    const { data: history, error: fetchError } = await supabase
      .from('password_history')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (fetchError || !history) {
      console.error('Failed to fetch password history:', fetchError)
      return
    }
    
    // Delete entries beyond the last 5
    if (history.length > 5) {
      const idsToDelete = history.slice(5).map(entry => entry.id)
      
      const { error: deleteError } = await supabase
        .from('password_history')
        .delete()
        .in('id', idsToDelete)
      
      if (deleteError) {
        console.error('Failed to delete old password history:', deleteError)
      }
    }
  } catch (error) {
    console.error('Password history error:', error)
  }
}

/**
 * Check if password matches any in user's password history
 * 
 * **LIMITATION**: This function currently cannot perform bcrypt comparison
 * because we don't have access to Supabase Auth's internal password hashing.
 * A complete implementation would require:
 * 1. Custom password hashing/comparison logic, OR
 * 2. Supabase Auth API extension to check password history
 * 
 * For now, this function is a placeholder that always returns false,
 * allowing password changes to proceed. The password_history table
 * still stores hashes for future implementation.
 * 
 * @param userId - User ID to check history for
 * @param newPassword - Plain text password to check (not used currently)
 * @returns Always returns false - password history check not implemented
 */
export async function checkPasswordHistory(
  userId: string,
  newPassword: string
): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Get user's password history for logging purposes
    const { data: history, error } = await supabase
      .from('password_history')
      .select('password_hash')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Failed to check password history:', error)
    }
    
    // TODO: Implement password comparison when bcrypt utilities are available
    // This would require either:
    // 1. Implementing custom password hashing outside Supabase Auth
    // 2. Using Supabase Edge Functions with password comparison capability
    // 3. Waiting for Supabase Auth API to expose password history checking
    
    // For now, return false (no match found) to allow password changes
    return false
  } catch (error) {
    console.error('Password history check error:', error)
    return false
  }
}

/**
 * Get user's audit log entries
 */
export async function getUserAuditLog(
  userId: string,
  limit: number = 10
): Promise<PasswordChangeAuditLog[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('password_change_audit')
      .select('*')
      .eq('user_id', userId)
      .order('changed_at', { ascending: false })
      .limit(limit)
    
    if (error || !data) {
      console.error('Failed to fetch audit log:', error)
      return []
    }
    
    return data.map(entry => ({
      user_id: entry.user_id,
      changed_at: new Date(entry.changed_at),
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      success: entry.success,
      failure_reason: entry.failure_reason,
    }))
  } catch (error) {
    console.error('Audit log fetch error:', error)
    return []
  }
}
