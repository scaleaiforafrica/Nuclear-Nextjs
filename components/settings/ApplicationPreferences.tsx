'use client'

import { useState, ChangeEvent } from 'react'
import { Monitor, Sun, Moon, Globe, Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { PreferencesUpdateData } from '@/models'

interface ApplicationPreferencesProps {
  profile: any
  onUpdate: (data: PreferencesUpdateData) => void
  isLoading: boolean
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Africa/Johannesburg', label: 'South Africa (SAST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
]

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2024)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2024)' },
]

export function ApplicationPreferences({
  profile,
  onUpdate,
  isLoading,
}: ApplicationPreferencesProps) {
  const [preferences, setPreferences] = useState({
    theme: profile?.theme || 'system',
    timezone: profile?.timezone || 'UTC',
    date_format: profile?.date_format || 'MM/DD/YYYY',
    email_notifications: profile?.email_notifications ?? true,
    push_notifications: profile?.push_notifications ?? true,
    in_app_notifications: profile?.in_app_notifications ?? true,
  })

  const handleThemeChange = (theme: string) => {
    const updated = { ...preferences, theme: theme as 'light' | 'dark' | 'system' }
    setPreferences(updated)
    onUpdate(updated)
  }

  const handleTimezoneChange = (timezone: string) => {
    const updated = { ...preferences, timezone }
    setPreferences(updated)
    onUpdate(updated)
  }

  const handleDateFormatChange = (date_format: string) => {
    const updated = { ...preferences, date_format }
    setPreferences(updated)
    onUpdate(updated)
  }

  const handleNotificationToggle = (key: string, value: boolean) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    onUpdate(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          Application Preferences
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Customize your application experience
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base mb-3 block">Theme</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleThemeChange('light')}
              disabled={isLoading}
              className={`p-4 rounded-lg border-2 transition-all ${
                preferences.theme === 'light'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-gray-700" />
              <div className="text-sm font-medium">Light</div>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              disabled={isLoading}
              className={`p-4 rounded-lg border-2 transition-all ${
                preferences.theme === 'dark'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
              <div className="text-sm font-medium">Dark</div>
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              disabled={isLoading}
              className={`p-4 rounded-lg border-2 transition-all ${
                preferences.theme === 'system'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-700" />
              <div className="text-sm font-medium">System</div>
            </button>
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone" className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Timezone
        </Label>
        <Select
          value={preferences.timezone}
          onValueChange={handleTimezoneChange}
          disabled={isLoading}
        >
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map(tz => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Format */}
      <div className="space-y-2">
        <Label htmlFor="date_format" className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date Format
        </Label>
        <Select
          value={preferences.date_format}
          onValueChange={handleDateFormatChange}
          disabled={isLoading}
        >
          <SelectTrigger id="date_format">
            <SelectValue placeholder="Select date format" />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMATS.map(fmt => (
              <SelectItem key={fmt.value} value={fmt.value}>
                {fmt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notification Settings */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="font-medium">Notification Channels</h4>
        
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-sm">Email Notifications</div>
            <div className="text-xs text-gray-600">
              Receive notifications via email
            </div>
          </div>
          <Switch
            checked={preferences.email_notifications}
            onCheckedChange={(val) => handleNotificationToggle('email_notifications', val)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-sm">Push Notifications</div>
            <div className="text-xs text-gray-600">
              Receive push notifications on your device
            </div>
          </div>
          <Switch
            checked={preferences.push_notifications}
            onCheckedChange={(val) => handleNotificationToggle('push_notifications', val)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-sm">In-App Notifications</div>
            <div className="text-xs text-gray-600">
              Show notifications within the application
            </div>
          </div>
          <Switch
            checked={preferences.in_app_notifications}
            onCheckedChange={(val) => handleNotificationToggle('in_app_notifications', val)}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
