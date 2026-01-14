import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines if a user is a demo user based on their email address
 * @param email - The user's email address
 * @returns true if the email starts with 'demo@' or has a domain of 'demo.*', false otherwise
 */
export function isDemoUser(email: string | null | undefined): boolean {
  if (!email) return false
  const lowerEmail = email.toLowerCase()
  // Check if email starts with 'demo@' (e.g., demo@example.com)
  if (lowerEmail.startsWith('demo@')) return true
  
  // Check if domain starts with 'demo.' (e.g., user@demo.example.com)
  const atIndex = lowerEmail.indexOf('@')
  if (atIndex !== -1) {
    const domain = lowerEmail.substring(atIndex + 1)
    if (domain.startsWith('demo.')) return true
  }
  
  return false
}
