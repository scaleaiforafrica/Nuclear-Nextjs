// Shared types for controllers
// Result type for error handling

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

export interface ValidationError {
  code: string
  message: string
  fields?: string[]
}
