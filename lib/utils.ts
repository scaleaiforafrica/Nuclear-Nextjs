import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines if a user is a demo user based on their email address
 * @param email - The user's email address
 * @returns true if the email contains 'demo', false otherwise
 */
export function isDemoUser(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase().includes('demo')
}
