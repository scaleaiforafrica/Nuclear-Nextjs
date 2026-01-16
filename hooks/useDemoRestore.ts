/**
 * Demo Restore Hook
 * Provides state management and functions for demo data restoration
 */

'use client'

import { useState, useCallback } from 'react'
import type { RestorationResult } from '@/types/demo'
import { DEMO_ERROR_MESSAGES, DEMO_SUCCESS_MESSAGES } from '@/lib/demo/config'

interface UseDemoRestoreReturn {
  isRestoring: boolean
  error: string | null
  success: boolean
  result: RestorationResult | null
  restoreData: () => Promise<void>
  clearError: () => void
}

/**
 * Hook for managing demo data restoration
 * Provides UI state and functions to trigger manual restoration
 */
export function useDemoRestore(): UseDemoRestoreReturn {
  const [isRestoring, setIsRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<RestorationResult | null>(null)

  const restoreData = useCallback(async () => {
    if (isRestoring) return

    setIsRestoring(true)
    setError(null)
    setSuccess(false)
    setResult(null)

    try {
      const response = await fetch('/api/demo/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || DEMO_ERROR_MESSAGES.RESTORE_FAILED)
      }

      if (data.success) {
        setSuccess(true)
        setResult({
          success: true,
          tablesRestored: data.data.tablesRestored,
          recordsRestored: data.data.recordsRestored,
          duration: data.data.duration,
          errors: [],
        })
      } else {
        throw new Error(data.error || DEMO_ERROR_MESSAGES.RESTORE_FAILED)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : DEMO_ERROR_MESSAGES.RESTORE_FAILED
      setError(errorMessage)
      setResult({
        success: false,
        tablesRestored: [],
        recordsRestored: 0,
        duration: 0,
        errors: [
          {
            table: 'system',
            error: errorMessage,
            phase: 'restore',
          },
        ],
      })
    } finally {
      setIsRestoring(false)
    }
  }, [isRestoring])

  const clearError = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return {
    isRestoring,
    error,
    success,
    result,
    restoreData,
    clearError,
  }
}
