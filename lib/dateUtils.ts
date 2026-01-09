// Date and time utility functions for deliveries

/**
 * Format a date and time for display in the Upcoming Deliveries section
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @param time - Time string (HH:MM or HH:MM:SS)
 * @returns Formatted string like "Today, 14:30", "Tomorrow, 09:00", or "Friday, 16:45"
 */
export function formatDeliveryDateTime(date: string | Date, time: string): string {
  // Parse date string as UTC to avoid timezone issues
  const deliveryDate = typeof date === 'string' ? new Date(date + 'T00:00:00Z') : date
  const now = new Date()
  
  // Reset time parts to compare dates only (using UTC)
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const compareDate = new Date(Date.UTC(deliveryDate.getUTCFullYear(), deliveryDate.getUTCMonth(), deliveryDate.getUTCDate()))
  
  const diffDays = Math.floor((compareDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  // Extract time without seconds
  const timeWithoutSeconds = time.split(':').slice(0, 2).join(':')
  
  if (diffDays === 0) {
    return `Today, ${timeWithoutSeconds}`
  } else if (diffDays === 1) {
    return `Tomorrow, ${timeWithoutSeconds}`
  } else {
    // Return day name for other days (using UTC to be consistent)
    const dayName = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
    return `${dayName}, ${timeWithoutSeconds}`
  }
}

/**
 * Check if a delivery has passed its scheduled time
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @param time - Time string (HH:MM or HH:MM:SS)
 * @returns true if the delivery time has passed
 */
export function isDeliveryPast(date: string | Date, time: string): boolean {
  const deliveryDateTime = combineDateAndTime(date, time)
  return new Date() > deliveryDateTime
}

/**
 * Combine date and time into a single Date object
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @param time - Time string (HH:MM or HH:MM:SS)
 * @returns Date object representing the scheduled date/time in local timezone
 */
export function combineDateAndTime(date: string | Date, time: string): Date {
  // Treat the date as a local calendar date and combine with local time components
  const [hoursStr, minutesStr] = time.split(':')
  const hours = Number(hoursStr) || 0
  const minutes = Number(minutesStr) || 0

  let year: number
  let month: number
  let day: number

  if (typeof date === 'string') {
    const [yearStr, monthStr, dayStr] = date.split('-')
    year = Number(yearStr)
    month = Number(monthStr) - 1 // JS months are 0-based
    day = Number(dayStr)
  } else {
    year = date.getFullYear()
    month = date.getMonth()
    day = date.getDate()
  }

  return new Date(year, month, day, hours, minutes)
}

/**
 * Get dates for today and the next N days
 * @param daysAhead - Number of days ahead to generate (default: 3)
 * @returns Array of Date objects
 */
export function getUpcomingDates(daysAhead: number = 3): Date[] {
  const dates: Date[] = []
  const now = new Date()
  
  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() + i)
    dates.push(date)
  }
  
  return dates
}

/**
 * Format a time for activity display (e.g., "2 hours ago", "Just now")
 * @param date - Date object or ISO string
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const activityDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - activityDate.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else {
    return activityDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
