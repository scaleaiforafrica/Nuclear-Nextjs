'use client'

import { useState, ChangeEvent, useMemo, useEffect } from 'react'
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react'
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
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator'
import { PasswordRequirementsChecklist } from '@/components/ui/password-requirements-checklist'
import { validatePasswordStrength } from '@/lib/password-validator'
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Calculate password strength in real-time
  const passwordStrength = useMemo(() => {
    if (!passwordData.new_password) {
      return null
    }
    return validatePasswordStrength(passwordData.new_password, {
      email: profile?.email,
      name: profile?.name,
    })
  }, [passwordData.new_password, profile?.email, profile?.name])

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
    
    if (!passwordData.confirm_password) {
      errors.push('Please confirm your new password')
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.push('Passwords do not match')
    }
    
    // Use the password strength validation
    if (passwordStrength && !passwordStrength.isValid) {
      errors.push('Password does not meet security requirements')
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

  // Handle Enter key to submit
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmitPassword()
    } else if (e.key === 'Escape') {
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setPasswordErrors([])
    }
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
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <Input
                id="current_password"
                name="current_password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyPress}
                placeholder="Enter current password"
                className="pr-10"
                autoComplete="current-password"
                aria-label="Current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                tabIndex={0}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                name="new_password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyPress}
                placeholder="Enter new password"
                className="pr-10"
                autoComplete="new-password"
                aria-label="New password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                tabIndex={0}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {passwordStrength && passwordData.new_password && (
            <div className="space-y-3">
              <PasswordStrengthIndicator
                strength={passwordStrength}
                showLabel={true}
                showFeedback={false}
              />
              <PasswordRequirementsChecklist strength={passwordStrength} />
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyPress}
                placeholder="Confirm new password"
                className="pr-10"
                autoComplete="new-password"
                aria-label="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                tabIndex={0}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {passwordErrors.length > 0 && (
            <div 
              className="bg-red-50 border border-red-200 rounded-lg p-3"
              role="alert"
              aria-live="polite"
            >
              {passwordErrors.map((error, idx) => (
                <p key={idx} className="text-sm text-red-600">
                  • {error}
                </p>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmitPassword}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[44px] min-h-[44px]"
            aria-label="Update password"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>

          {/* Keyboard Shortcuts Help */}
          <p className="text-xs text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> to submit or{' '}
            <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> to clear
          </p>
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
            aria-label="Toggle two-factor authentication"
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
            aria-label="Toggle email notifications"
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
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="min-w-[44px] min-h-[44px]"
                  >
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
