import { describe, it, expect } from 'vitest'
import { 
  formatDeliveryDateTime, 
  isDeliveryPast, 
  combineDateAndTime,
  formatRelativeTime 
} from '../lib/dateUtils'

describe('dateUtils', () => {
  describe('formatDeliveryDateTime', () => {
    it('should format today\'s delivery as "Today, HH:MM"', () => {
      const today = new Date().toISOString().split('T')[0]
      const result = formatDeliveryDateTime(today, '14:30:00')
      expect(result).toBe('Today, 14:30')
    })

    it('should format tomorrow\'s delivery as "Tomorrow, HH:MM"', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      const result = formatDeliveryDateTime(tomorrowStr, '09:00:00')
      expect(result).toBe('Tomorrow, 09:00')
    })

    it('should format future delivery with day name', () => {
      const dayAfter = new Date()
      dayAfter.setDate(dayAfter.getDate() + 2)
      const dayAfterStr = dayAfter.toISOString().split('T')[0]
      const result = formatDeliveryDateTime(dayAfterStr, '16:45:00')
      const expectedDay = dayAfter.toLocaleDateString('en-US', { weekday: 'long' })
      expect(result).toBe(`${expectedDay}, 16:45`)
    })
  })

  describe('isDeliveryPast', () => {
    it('should return true for past deliveries', () => {
      const pastDate = new Date()
      pastDate.setHours(pastDate.getHours() - 2)
      const dateStr = pastDate.toISOString().split('T')[0]
      const timeStr = `${String(pastDate.getHours()).padStart(2, '0')}:${String(pastDate.getMinutes()).padStart(2, '0')}`
      
      const result = isDeliveryPast(dateStr, timeStr)
      expect(result).toBe(true)
    })

    it('should return false for future deliveries', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 2)
      const dateStr = futureDate.toISOString().split('T')[0]
      const timeStr = `${String(futureDate.getHours()).padStart(2, '0')}:${String(futureDate.getMinutes()).padStart(2, '0')}`
      
      const result = isDeliveryPast(dateStr, timeStr)
      expect(result).toBe(false)
    })
  })

  describe('combineDateAndTime', () => {
    it('should combine date and time strings correctly', () => {
      const result = combineDateAndTime('2026-01-10', '14:30:00')
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(0) // January is 0
      expect(result.getDate()).toBe(10)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })

    it('should handle Date objects', () => {
      const date = new Date(2026, 0, 10, 0, 0, 0)
      const result = combineDateAndTime(date, '14:30')
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(10)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "Just now" for very recent times', () => {
      const now = new Date()
      const result = formatRelativeTime(now)
      expect(result).toBe('Just now')
    })

    it('should return minutes ago for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatRelativeTime(fiveMinutesAgo)
      expect(result).toBe('5 minutes ago')
    })

    it('should return hours ago for times within a day', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
      const result = formatRelativeTime(threeHoursAgo)
      expect(result).toBe('3 hours ago')
    })

    it('should return days ago for times within a week', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(twoDaysAgo)
      expect(result).toBe('2 days ago')
    })
  })
})
