import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines if a user is a demo user based on their email address
 * @param email - The user's email address
 * @returns true if the email starts with 'demo@' or has a domain starting with '@demo.', false otherwise
 */
export function isDemoUser(email: string | null | undefined): boolean {
  if (!email) return false
  const lowerEmail = email.toLowerCase()
  // Check if email starts with 'demo@' (e.g., demo@example.com)
  // or has domain starting with '@demo.' (e.g., user@demo.example.com)
  return lowerEmail.startsWith('demo@') || lowerEmail.includes('@demo.')
}
