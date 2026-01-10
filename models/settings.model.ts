// Profile settings model - Extended user profile with all settings
export interface ProfileSettings {
  // Basic profile info
  id: string
  name: string
  role: string
  initials: string
  phone?: string
  job_title?: string
  department?: string
  avatar_url?: string
  
  // Application preferences
  timezone: string
  date_format: string
  theme: 'light' | 'dark' | 'system'
  
  // Account settings
  two_factor_enabled: boolean
  email_notifications: boolean
  push_notifications: boolean
  in_app_notifications: boolean
  
  // Notification preferences
  shipment_alerts: 'all' | 'critical' | 'none'
  compliance_reminders: boolean
  daily_digest: boolean
  weekly_digest: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  name?: string
  phone?: string
  job_title?: string
  department?: string
  avatar_url?: string
}

export interface PreferencesUpdateData {
  timezone?: string
  date_format?: string
  theme?: 'light' | 'dark' | 'system'
  email_notifications?: boolean
  push_notifications?: boolean
  in_app_notifications?: boolean
  shipment_alerts?: 'all' | 'critical' | 'none'
  compliance_reminders?: boolean
  daily_digest?: boolean
  weekly_digest?: boolean
}

export interface PasswordChangeData {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface LoginHistoryEntry {
  id: string
  user_id: string
  login_at: string
  ip_address?: string
  user_agent?: string
  device?: string
  location?: string
}

export interface UserSession {
  id: string
  user_id: string
  device?: string
  browser?: string
  ip_address?: string
  location?: string
  last_active: string
  created_at: string
}
