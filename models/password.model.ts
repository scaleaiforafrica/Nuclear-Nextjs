/**
 * Password-related data models
 */

export interface PasswordChangeRequest {
  current_password: string
  new_password: string
  confirm_password?: string
}

export interface PasswordChangeResponse {
  success: boolean
  message: string
  data?: {
    passwordChanged: boolean
    sessionsSignedOut?: number
    emailSent?: boolean
  }
  error?: string
  validationErrors?: string[]
}

export interface PasswordHistoryEntry {
  id: string
  user_id: string
  password_hash: string
  created_at: string
}

export interface PasswordRequirement {
  id: string
  label: string
  met: boolean
  description?: string
}

export interface PasswordStrengthInfo {
  score: number
  level: string
  percentage: number
  color: string
  label: string
}
