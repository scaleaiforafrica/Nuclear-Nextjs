'use client'

import { useState } from 'react'
import { Monitor, Download, LogOut, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { UserSession, LoginHistoryEntry } from '@/models'

interface SecurityPrivacyProps {
  profile: any
  sessions: UserSession[]
  loginHistory: LoginHistoryEntry[]
  onSignOutOtherDevices: () => Promise<void>
  onExportData: () => Promise<void>
  isLoading: boolean
}

export function SecurityPrivacy({
  profile,
  sessions,
  loginHistory,
  onSignOutOtherDevices,
  onExportData,
  isLoading,
}: SecurityPrivacyProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          Security & Privacy
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your security settings and privacy preferences
        </p>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Active Sessions</h4>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={sessions.length <= 1}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out Other Devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out from other devices?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out from all other devices. You will remain
                  signed in on this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onSignOutOtherDevices}>
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <Monitor className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-sm">
                      {session.device || 'Unknown Device'}
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div>{session.browser || 'Unknown Browser'}</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location || session.ip_address || 'Unknown Location'}
                    </div>
                    <div>Last active: {formatDate(session.last_active)}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active sessions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Login History */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="font-medium">Login History</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loginHistory.length > 0 ? (
            loginHistory.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded text-sm"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{formatDate(entry.login_at)}</div>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div>{entry.device || 'Unknown Device'}</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {entry.location || entry.ip_address || 'Unknown Location'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No login history available</p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="font-medium">Privacy Settings</h4>
        
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-sm">Profile Visibility</div>
            <div className="text-xs text-gray-600">
              Make your profile visible to other users
            </div>
          </div>
          <Switch defaultChecked disabled={isLoading} />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-sm">Activity Status</div>
            <div className="text-xs text-gray-600">
              Show when you're active on the platform
            </div>
          </div>
          <Switch defaultChecked disabled={isLoading} />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium text-sm">Analytics</div>
            <div className="text-xs text-gray-600">
              Help improve our service by sharing usage data
            </div>
          </div>
          <Switch defaultChecked disabled={isLoading} />
        </div>
      </div>

      {/* Data Export */}
      <div className="border-t pt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium mb-2">Export Your Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download a copy of your data including profile information, settings,
            and activity history.
          </p>
          <Button
            onClick={onExportData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  )
}
