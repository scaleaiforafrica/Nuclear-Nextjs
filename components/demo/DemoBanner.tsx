/**
 * Demo Banner Component
 * Displays a sticky banner when user is logged in with demo account
 */

'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoRestore } from '@/hooks/useDemoRestore'
import { DEMO_UI_CONFIG } from '@/lib/demo/config'

interface DemoBannerProps {
  className?: string
}

/**
 * Sticky banner shown at the top of the page for demo accounts
 * Shows demo mode indicator and provides quick restore button
 */
export function DemoBanner({ className = '' }: DemoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [cooldownActive, setCooldownActive] = useState(false)
  const { isRestoring, error, success, restoreData, clearError } =
    useDemoRestore()

  // Handle cooldown for restore button
  useEffect(() => {
    if (success) {
      setCooldownActive(true)
      const timer = setTimeout(() => {
        setCooldownActive(false)
        clearError()
      }, DEMO_UI_CONFIG.restoreButton.cooldownMs)
      return () => clearTimeout(timer)
    }
  }, [success, clearError])

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  if (isDismissed) {
    return null
  }

  const handleRestore = async () => {
    if (isRestoring || cooldownActive) return
    await restoreData()
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b shadow-sm ${className}`}
      style={{
        backgroundColor: DEMO_UI_CONFIG.banner.backgroundColor,
        borderColor: DEMO_UI_CONFIG.banner.borderColor,
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Demo indicator */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AlertCircle
              className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
              style={{ color: DEMO_UI_CONFIG.banner.iconColor }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
              <span
                className="text-xs sm:text-sm font-semibold whitespace-nowrap"
                style={{ color: DEMO_UI_CONFIG.banner.textColor }}
              >
                Demo Mode
              </span>
              <span
                className="text-xs sm:text-sm truncate"
                style={{ color: DEMO_UI_CONFIG.banner.textColor }}
              >
                {error
                  ? error
                  : success
                  ? '✓ Data restored successfully'
                  : 'Exploring with sample data. Changes will be reset on logout.'}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Restore button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={isRestoring || cooldownActive}
              className="text-xs whitespace-nowrap px-2 sm:px-3 h-8 sm:h-9"
              style={{
                borderColor: DEMO_UI_CONFIG.banner.borderColor,
                color: DEMO_UI_CONFIG.banner.textColor,
              }}
            >
              {isRestoring ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  <span className="hidden xs:inline">Restoring...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : cooldownActive ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  <span className="hidden xs:inline">Restored</span>
                  <span className="xs:hidden">✓</span>
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  <span className="hidden xs:inline">Reset Data</span>
                  <span className="xs:hidden">Reset</span>
                </>
              )}
            </Button>

            {/* Dismiss button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 p-0 flex-shrink-0"
              style={{ color: DEMO_UI_CONFIG.banner.textColor }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss banner</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
