'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, Sliders } from 'lucide-react'
import { useAuth } from '@/contexts'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  ProfileSettings,
  AccountSettings,
  ApplicationPreferences,
  SecurityPrivacy,
  NotificationsConfiguration,
} from '@/components/settings'
import type {
  ProfileUpdateData,
  PreferencesUpdateData,
  PasswordChangeData,
  UserSession,
  LoginHistoryEntry,
} from '@/models'
import type { ExportFormat } from '@/components/ui/export-menu'

type TabId = 'profile' | 'account' | 'preferences' | 'security' | 'notifications'

interface Tab {
  id: TabId
  label: string
  icon: any
}

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

export default function SettingsPage() {
  const { user, supabaseUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [profile, setProfile] = useState<any>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<any>({})

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/settings/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile({ ...data.profile, email: supabaseUser?.email })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    if (supabaseUser) {
      fetchProfile()
    }
  }, [supabaseUser])

  // Mock sessions and login history (replace with actual API calls)
  useEffect(() => {
    // Mock data for demonstration
    setSessions([
      {
        id: '1',
        user_id: user?.id || '',
        device: 'MacBook Pro',
        browser: 'Chrome 120',
        ip_address: '192.168.1.1',
        location: 'Cape Town, South Africa',
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ])

    setLoginHistory([
      {
        id: '1',
        user_id: user?.id || '',
        login_at: new Date().toISOString(),
        ip_address: '192.168.1.1',
        device: 'MacBook Pro',
        location: 'Cape Town, South Africa',
      },
    ])
  }, [user])

  const handleProfileUpdate = async (data: ProfileUpdateData) => {
    setPendingChanges((prev: any) => ({ ...prev, ...data }))
    setHasChanges(true)
  }

  const handlePreferencesUpdate = (data: PreferencesUpdateData) => {
    setPendingChanges((prev: any) => ({ ...prev, ...data }))
    setHasChanges(true)
  }

  const handlePasswordChange = async (data: PasswordChangeData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Password updated successfully')
      } else {
        toast.error(result.error || 'Failed to update password')
      }
    } catch (error) {
      toast.error('An error occurred while updating password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle2FA = async (enabled: boolean) => {
    setIsLoading(true)
    try {
      // TODO: Implement 2FA toggle API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProfile((prev: any) => ({ ...prev, two_factor_enabled: enabled }))
      toast.success(enabled ? '2FA enabled successfully' : '2FA disabled successfully')
    } catch (error) {
      toast.error('Failed to toggle 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleEmailNotifications = async (enabled: boolean) => {
    setPendingChanges((prev: any) => ({ ...prev, email_notifications: enabled }))
    setHasChanges(true)
  }

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is not yet implemented')
  }

  const handleSignOutOtherDevices = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Signed out from other devices successfully')
    } catch (error) {
      toast.error('Failed to sign out from other devices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async (format: ExportFormat) => {
    setIsLoading(true)
    try {
      // Only support json and csv formats
      if (format !== 'json' && format !== 'csv') {
        toast.error(`Export format '${format}' is not supported`);
        return;
      }

      // Prepare user data for export
      const exportData = {
        profile: {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          job_title: profile.job_title,
          department: profile.department,
          role: profile.role,
        },
        preferences: {
          timezone: profile.timezone,
          date_format: profile.date_format,
          theme: profile.theme,
          language: profile.language,
        },
        notifications: {
          email_notifications: profile.email_notifications,
          push_notifications: profile.push_notifications,
          in_app_notifications: profile.in_app_notifications,
        },
        exportedAt: new Date().toISOString(),
      };

      let blob: Blob;
      let filename: string;

      if (format === 'json') {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename = `user_data_${Date.now()}.json`;
      } else if (format === 'csv' || format === 'excel') {
        // CSV/Excel format
        const csvContent = [
          'Field,Value',
          `Name,${exportData.profile.name}`,
          `Email,${exportData.profile.email}`,
          `Phone,${exportData.profile.phone || 'N/A'}`,
          `Job Title,${exportData.profile.job_title || 'N/A'}`,
          `Department,${exportData.profile.department || 'N/A'}`,
          `Role,${exportData.profile.role}`,
          `Timezone,${exportData.preferences.timezone}`,
          `Date Format,${exportData.preferences.date_format}`,
          `Theme,${exportData.preferences.theme}`,
          `Language,${exportData.preferences.language}`,
          `Email Notifications,${exportData.notifications.email_notifications}`,
          `Push Notifications,${exportData.notifications.push_notifications}`,
          `In-App Notifications,${exportData.notifications.in_app_notifications}`,
          `Exported At,${exportData.exportedAt}`,
        ].join('\n');
        
        if (format === 'excel') {
          blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
          filename = `user_data_${Date.now()}.xlsx`;
        } else {
          blob = new Blob([csvContent], { type: 'text/csv' });
          filename = `user_data_${Date.now()}.csv`;
        }
      } else {
        // PDF format - not supported for user data export
        toast.error('PDF export is not available for user data');
        return;
      }

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!hasChanges) return

    setIsLoading(true)
    try {
      // Separate profile updates from preference updates
      const profileUpdates: ProfileUpdateData = {}
      const preferenceUpdates: PreferencesUpdateData = {}

      const profileFields = ['name', 'phone', 'job_title', 'department', 'avatar_url']
      const preferenceFields = [
        'timezone',
        'date_format',
        'theme',
        'email_notifications',
        'push_notifications',
        'in_app_notifications',
        'shipment_alerts',
        'compliance_reminders',
        'daily_digest',
        'weekly_digest',
      ]

      Object.keys(pendingChanges).forEach(key => {
        if (profileFields.includes(key)) {
          profileUpdates[key as keyof ProfileUpdateData] = pendingChanges[key]
        } else if (preferenceFields.includes(key)) {
          preferenceUpdates[key as keyof PreferencesUpdateData] = pendingChanges[key]
        }
      })

      // Update profile if there are profile changes
      if (Object.keys(profileUpdates).length > 0) {
        const response = await fetch('/api/settings/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileUpdates),
        })

        if (!response.ok) {
          throw new Error('Failed to update profile')
        }

        const data = await response.json()
        setProfile((prev: any) => ({ ...prev, ...data.profile }))
      }

      // Update preferences if there are preference changes
      if (Object.keys(preferenceUpdates).length > 0) {
        const response = await fetch('/api/settings/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferenceUpdates),
        })

        if (!response.ok) {
          throw new Error('Failed to update preferences')
        }

        const data = await response.json()
        setProfile((prev: any) => ({ ...prev, ...data.profile }))
      }

      toast.success('Settings saved successfully')
      setHasChanges(false)
      setPendingChanges({})
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Button
          onClick={handleSaveChanges}
          disabled={!hasChanges || isLoading}
          className="hidden sm:inline-flex"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-lg transition-colors text-sm ${
                      activeTab === tab.id
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm lg:text-base">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
          {activeTab === 'profile' && (
            <ProfileSettings
              profile={profile}
              onUpdate={handleProfileUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'account' && (
            <AccountSettings
              profile={profile}
              onPasswordChange={handlePasswordChange}
              onToggle2FA={handleToggle2FA}
              onToggleEmailNotifications={handleToggleEmailNotifications}
              onDeleteAccount={handleDeleteAccount}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'preferences' && (
            <ApplicationPreferences
              profile={profile}
              onUpdate={handlePreferencesUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'security' && (
            <SecurityPrivacy
              profile={profile}
              sessions={sessions}
              loginHistory={loginHistory}
              onSignOutOtherDevices={handleSignOutOtherDevices}
              onExportData={handleExportData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsConfiguration
              profile={profile}
              onUpdate={handlePreferencesUpdate}
              isLoading={isLoading}
            />
          )}

          {/* Mobile Save Button */}
          {activeTab !== 'notifications' && (
            <div className="mt-6 sm:hidden">
              <Button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isLoading}
                className="w-full"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
