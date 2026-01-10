'use client'

import { useState, ChangeEvent } from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { PasswordChangeData } from '@/models'

interface AccountSettingsProps {
  profile: any
  onPasswordChange: (data: PasswordChangeData) => Promise<void>
  onToggle2FA: (enabled: boolean) => Promise<void>
  onToggleEmailNotifications: (enabled: boolean) => Promise<void>
  onDeleteAccount: () => Promise<void>
  isLoading: boolean
}

export function AccountSettings({
  profile,
  onPasswordChange,
  onToggle2FA,
  onToggleEmailNotifications,
  onDeleteAccount,
  isLoading,
}: AccountSettingsProps) {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setPasswordErrors([])
  }

  const validatePassword = (): boolean => {
    const errors: string[] = []
    
    if (!passwordData.current_password) {
      errors.push('Current password is required')
    }
    if (!passwordData.new_password) {
      errors.push('New password is required')
    }
    if (passwordData.new_password.length < 8) {
      errors.push('New password must be at least 8 characters')
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.push('Passwords do not match')
    }
    
    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handleSubmitPassword = async () => {
    if (!validatePassword()) return
    
    await onPasswordChange(passwordData)
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Account Settings</h3>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your account security and authentication
        </p>
      </div>

      {/* Change Password */}
      <div className="space-y-4">
        <h4 className="font-medium">Change Password</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              name="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
          </div>
          {passwordErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              {passwordErrors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-600">
                  • {error}
                </p>
              ))}
            </div>
          )}
          <Button
            onClick={handleSubmitPassword}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Update Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border-t pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium">Two-Factor Authentication</h4>
            </div>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
            {profile?.two_factor_enabled && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                <Shield className="w-4 h-4" />
                Enabled
              </div>
            )}
          </div>
          <Switch
            checked={profile?.two_factor_enabled || false}
            onCheckedChange={onToggle2FA}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Email Notifications */}
      <div className="border-t pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-medium mb-2">Email Notifications</h4>
            <p className="text-sm text-gray-600">
              Receive email notifications about account activity
            </p>
          </div>
          <Switch
            checked={profile?.email_notifications || false}
            onCheckedChange={onToggleEmailNotifications}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Account Deletion */}
      <div className="border-t pt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-1">Danger Zone</h4>
              <p className="text-sm text-red-700 mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
