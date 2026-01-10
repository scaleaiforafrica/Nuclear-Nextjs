'use client'

import { useState } from 'react'
import { Bell, Package, Shield, Mail, Smartphone } from 'lucide-react'
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

interface NotificationsConfigurationProps {
  profile: any
  onUpdate: (data: PreferencesUpdateData) => void
  isLoading: boolean
}

export function NotificationsConfiguration({
  profile,
  onUpdate,
  isLoading,
}: NotificationsConfigurationProps) {
  const [config, setConfig] = useState({
    shipment_alerts: profile?.shipment_alerts || 'all',
    compliance_reminders: profile?.compliance_reminders ?? true,
    daily_digest: profile?.daily_digest ?? false,
    weekly_digest: profile?.weekly_digest ?? true,
    email_notifications: profile?.email_notifications ?? true,
    push_notifications: profile?.push_notifications ?? true,
  })

  const handleShipmentAlertsChange = (value: string) => {
    const updated = { ...config, shipment_alerts: value as 'all' | 'critical' | 'none' }
    setConfig(updated)
    onUpdate(updated)
  }

  const handleToggle = (key: string, value: boolean) => {
    const updated = { ...config, [key]: value }
    setConfig(updated)
    onUpdate(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">
          Notifications Configuration
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Control what notifications you receive and how you receive them
        </p>
      </div>

      {/* Shipment Alerts */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-3">
            <div>
              <Label htmlFor="shipment_alerts" className="text-base font-medium">
                Shipment Alerts
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Choose which shipment notifications to receive
              </p>
            </div>
            <Select
              value={config.shipment_alerts}
              onValueChange={handleShipmentAlertsChange}
              disabled={isLoading}
            >
              <SelectTrigger id="shipment_alerts" className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="py-1">
                    <div className="font-medium">All Shipments</div>
                    <div className="text-xs text-gray-600">
                      Receive alerts for all shipment updates
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="py-1">
                    <div className="font-medium">Critical Only</div>
                    <div className="text-xs text-gray-600">
                      Only receive alerts for critical issues
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="none">
                  <div className="py-1">
                    <div className="font-medium">None</div>
                    <div className="text-xs text-gray-600">
                      Don't send shipment alerts
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Compliance Reminders */}
      <div className="border-t pt-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">Compliance Reminders</div>
                <p className="text-sm text-gray-600 mt-1">
                  Get notified about expiring permits and compliance issues
                </p>
              </div>
              <Switch
                checked={config.compliance_reminders}
                onCheckedChange={(val) => handleToggle('compliance_reminders', val)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Digest Options */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-4">
            <div>
              <div className="font-medium text-base mb-2">Email Digests</div>
              <p className="text-sm text-gray-600">
                Receive summary emails of your activity
              </p>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Daily Digest</div>
                <div className="text-xs text-gray-600">
                  Daily summary of activities and updates
                </div>
              </div>
              <Switch
                checked={config.daily_digest}
                onCheckedChange={(val) => handleToggle('daily_digest', val)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-sm">Weekly Digest</div>
                <div className="text-xs text-gray-600">
                  Weekly summary of activities and updates
                </div>
              </div>
              <Switch
                checked={config.weekly_digest}
                onCheckedChange={(val) => handleToggle('weekly_digest', val)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Push Notifications */}
      <div className="border-t pt-6">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">Mobile Push Notifications</div>
                <p className="text-sm text-gray-600 mt-1">
                  Receive push notifications on your mobile device
                </p>
              </div>
              <Switch
                checked={config.push_notifications}
                onCheckedChange={(val) => handleToggle('push_notifications', val)}
                disabled={isLoading}
              />
            </div>
            {config.push_notifications && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <Bell className="w-4 h-4 inline mr-1" />
                Push notifications are enabled. Make sure notifications are allowed in
                your device settings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="border-t pt-6">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <p className="text-sm text-gray-600 mt-1">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={config.email_notifications}
                onCheckedChange={(val) => handleToggle('email_notifications', val)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
