/**
 * Demo Data Restoration Engine
 * Handles restoration of demo account data from seed files
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  RestorationResult,
  RestorationError,
  DemoRestoration,
} from '@/types/demo'
import {
  DEMO_TABLES,
  DEMO_ACCOUNT_ID,
  RESTORATION_CONFIG,
  VALIDATION_CONFIG,
  SEED_VERSION,
} from './config'
import {
  validateSeedData,
  batchArray,
  timeout,
  withRetry,
  sleep,
} from './utils'

// Import seed data
import shipmentsData from './seeds/shipments.json'
import activitiesData from './seeds/activities.json'
import complianceAlertsData from './seeds/compliance_alerts.json'
import permitsData from './seeds/permits.json'
import deliveriesData from './seeds/deliveries.json'

/**
 * Seed data registry mapping table names to their seed data
 */
const SEED_DATA_REGISTRY = {
  shipments: shipmentsData,
  activities: activitiesData,
  compliance_alerts: complianceAlertsData,
  permits: permitsData,
  deliveries: deliveriesData,
} as const

/**
 * Restore demo data for the demo account
 * @param triggeredBy - Source that triggered the restoration
 * @returns Restoration result with success status and details
 */
export async function restoreDemoData(
  triggeredBy: 'logout' | 'manual' | 'api' | 'scheduled' = 'manual'
): Promise<RestorationResult> {
  const startTime = Date.now()
  const errors: RestorationError[] = []
  const tablesRestored: string[] = []
  let totalRecords = 0

  const supabase = createClient()

  try {
    // Verify user is authenticated and is demo account
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    if (user.id !== DEMO_ACCOUNT_ID) {
      throw new Error('Only demo accounts can restore data')
    }

    // Wrap entire restoration in timeout
    await timeout(
      performRestoration(
        supabase,
        errors,
        tablesRestored,
        (count) => {
          totalRecords += count
        }
      ),
      RESTORATION_CONFIG.timeoutMs,
      'Restoration timed out'
    )

    const duration = Date.now() - startTime
    const success = errors.length === 0

    // Log restoration
    await logRestoration(supabase, {
      user_id: DEMO_ACCOUNT_ID,
      tables_restored: tablesRestored,
      records_restored: totalRecords,
      duration_ms: duration,
      success,
      error: errors.length > 0 ? JSON.stringify(errors) : null,
      triggered_by: triggeredBy,
    })

    return {
      success,
      tablesRestored,
      recordsRestored: totalRecords,
      duration,
      errors,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    errors.push({
      table: 'system',
      error: errorMessage,
      phase: 'restore',
    })

    // Attempt to log failed restoration
    try {
      await logRestoration(supabase, {
        user_id: DEMO_ACCOUNT_ID,
        tables_restored: tablesRestored,
        records_restored: totalRecords,
        duration_ms: duration,
        success: false,
        error: errorMessage,
        triggered_by: triggeredBy,
      })
    } catch {
      // Ignore logging errors
    }

    return {
      success: false,
      tablesRestored,
      recordsRestored: totalRecords,
      duration,
      errors,
    }
  }
}

/**
 * Perform the actual restoration process
 */
async function performRestoration(
  supabase: SupabaseClient,
  errors: RestorationError[],
  tablesRestored: string[],
  onRecordsRestored: (count: number) => void
): Promise<void> {
  // Process each table in order
  for (const table of DEMO_TABLES) {
    try {
      // Get seed data for table
      const seedData = SEED_DATA_REGISTRY[table]
      if (!seedData) {
        errors.push({
          table,
          error: 'No seed data found',
          phase: 'restore',
        })
        continue
      }

      // Validate seed data
      const requiredFields = VALIDATION_CONFIG.requiredFields[table] || []
      const validation = validateSeedData(seedData, Array.from(requiredFields))

      if (!validation.valid) {
        errors.push({
          table,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          phase: 'validate',
        })
        continue
      }

      // Delete existing demo data for this table
      await withRetry(
        async () => {
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .gte('created_at', '1970-01-01T00:00:00Z') // Delete all records

          if (deleteError) throw deleteError
        },
        RESTORATION_CONFIG.retryAttempts,
        RESTORATION_CONFIG.retryDelayMs
      )

      // Insert seed data in batches
      const batches = batchArray(seedData as unknown[], RESTORATION_CONFIG.batchSize)
      let recordsInserted = 0

      for (const batch of batches) {
        await withRetry(
          async () => {
            const { error: insertError, count } = await supabase
              .from(table)
              .insert(batch)

            if (insertError) throw insertError
            // Only increment if count is available, otherwise assume batch length
            // Note: In case of partial failure, this may be inaccurate
            if (typeof count === 'number') {
              recordsInserted += count
            } else {
              recordsInserted += batch.length
            }
          },
          RESTORATION_CONFIG.retryAttempts,
          RESTORATION_CONFIG.retryDelayMs
        )

        // Small delay between batches to avoid rate limits
        if (batches.length > 1) {
          await sleep(100)
        }
      }

      tablesRestored.push(table)
      onRecordsRestored(recordsInserted)
    } catch (error) {
      errors.push({
        table,
        error: error instanceof Error ? error.message : 'Restoration failed',
        phase: 'restore',
      })
    }
  }
}

/**
 * Log restoration to tracking table
 */
async function logRestoration(
  supabase: SupabaseClient,
  restoration: Omit<DemoRestoration, 'id' | 'restored_at' | 'created_at'>
): Promise<void> {
  try {
    await supabase.from('demo_restorations').insert({
      user_id: restoration.user_id,
      tables_restored: restoration.tables_restored,
      records_restored: restoration.records_restored,
      duration_ms: restoration.duration_ms,
      success: restoration.success,
      error: restoration.error,
      triggered_by: restoration.triggered_by,
    })
  } catch (error) {
    // Silent fail - logging is not critical
    console.error('Failed to log restoration:', error)
  }
}

/**
 * Get the latest restoration status for demo account
 */
export async function getDemoStatus(): Promise<{
  lastRestore: string | null
  coverage: number
  version: string
}> {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== DEMO_ACCOUNT_ID) {
      return {
        lastRestore: null,
        coverage: 0,
        version: SEED_VERSION,
      }
    }

    // Get latest successful restoration
    const { data: restoration } = await supabase
      .from('demo_restorations')
      .select('restored_at, tables_restored')
      .eq('user_id', DEMO_ACCOUNT_ID)
      .eq('success', true)
      .order('restored_at', { ascending: false })
      .limit(1)
      .single()

    const coverage = restoration
      ? Math.round(
          (restoration.tables_restored.length / DEMO_TABLES.length) * 100
        )
      : 0

    return {
      lastRestore: restoration?.restored_at || null,
      coverage,
      version: SEED_VERSION,
    }
  } catch {
    return {
      lastRestore: null,
      coverage: 0,
      version: SEED_VERSION,
    }
  }
}

/**
 * Check if demo account needs restoration
 */
export async function needsRestoration(): Promise<boolean> {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== DEMO_ACCOUNT_ID) {
      return false
    }

    // Check if any demo tables are empty
    for (const table of DEMO_TABLES) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (count === 0) {
        return true
      }
    }

    return false
  } catch {
    return true // Default to restoration needed on error
  }
}
