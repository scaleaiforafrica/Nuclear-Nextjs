// User model - Data types for user and authentication
export interface User {
  id: string
  name: string
  role: UserRole
  initials: string
}

export type UserRole = 
  | 'Hospital Administrator' 
  | 'Logistics Manager' 
  | 'Compliance Officer'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}
