import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if an email belongs to a demo user
 * Demo users are identified by email addresses starting with "demo@" or "test@"
 */
export function isDemoUser(email: string | undefined | null): boolean {
  if (!email) return false
  const lowerEmail = email.toLowerCase()
  return lowerEmail.startsWith('demo@') || lowerEmail.startsWith('test@')
}
