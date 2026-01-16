'use client'

import { useState, ChangeEvent } from 'react'
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'
import { validatePasswordChange } from '@/lib/validation/password'
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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setPasswordErrors([])
    setPasswordSuccess(false)
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validatePassword = (): boolean => {
    const errors: string[] = []
    
    if (!passwordData.current_password) {
      errors.push('Current password is required')
    }

    if (!passwordData.new_password) {
      errors.push('New password is required')
      setPasswordErrors(errors)
      return false
    }

    // Use comprehensive validation
    const validation = validatePasswordChange(
      passwordData.new_password,
      passwordData.confirm_password
    )

    if (!validation.isValid) {
      // Combine requirement failures into error messages
      if (!validation.requirements.minLength) {
        errors.push('Password must be at least 8 characters')
      }
      if (!validation.requirements.hasUppercase) {
        errors.push('Password must contain at least one uppercase letter')
      }
      if (!validation.requirements.hasLowercase) {
        errors.push('Password must contain at least one lowercase letter')
      }
      if (!validation.requirements.hasNumber) {
        errors.push('Password must contain at least one number')
      }
      if (!validation.requirements.hasSpecialChar) {
        errors.push('Password must contain at least one special character')
      }
      if (!validation.requirements.notCommon) {
        errors.push('This password is too common. Please choose a more unique password')
      }
      if (!validation.passwordsMatch && passwordData.confirm_password) {
        errors.push('Passwords do not match')
      }
    }
    
    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handleSubmitPassword = async () => {
    if (!validatePassword()) return
    
    try {
      await onPasswordChange(passwordData)
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setPasswordErrors([])
      setPasswordSuccess(true)
      // Clear success message after 5 seconds
      setTimeout(() => setPasswordSuccess(false), 5000)
    } catch (error) {
      // Error handling is done by parent component
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
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <Input
                id="current_password"
                name="current_password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded"
                aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                name="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded"
                aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* Password Strength Meter */}
          {passwordData.new_password && (
            <PasswordStrengthMeter
              password={passwordData.new_password}
              showRequirements={true}
              className="mt-3"
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                name="confirm_password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded"
                aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                ✓ Password updated successfully!
              </p>
            </div>
          )}

          {/* Error Messages */}
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
            className="w-full sm:w-auto min-h-[44px]"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
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
