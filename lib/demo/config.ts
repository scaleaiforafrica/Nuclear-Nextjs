/**
 * Demo Account System Configuration
 * Central configuration for demo account behavior, restoration settings, and feature flags
 */

import type { DemoConfig } from '@/types/demo'

/**
 * Demo account credentials
 * Email: demo@nuclearflow.com
 * Password: DemoNuclear2026!
 */
export const DEMO_ACCOUNT_EMAIL = 'demo@nuclearflow.com'
export const DEMO_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Tables included in demo data restoration
 * Order matters - foreign key dependencies must come after their parents
 */
export const DEMO_TABLES = [
  'shipments',
  'compliance_alerts',
  'permits',
  'activities',
  'deliveries',
] as const

export type DemoTable = typeof DEMO_TABLES[number]

/**
 * Current seed data version
 * Update this when seed data changes to track versions
 */
export const SEED_VERSION = '1.0.0'

/**
 * Comprehensive demo system configuration
 */
export const DEMO_CONFIG: DemoConfig = {
  account: {
    email: DEMO_ACCOUNT_EMAIL,
    password: 'DemoNuclear2026!',
    name: 'Demo User',
    role: 'Hospital Administrator',
  },

  autoDetect: {
    enabled: false, // Future feature
    checkInterval: '0 2 * * *', // Daily at 2 AM (cron format)
    excludeTables: [
      'profiles',
      'login_history',
      'user_sessions',
      'demo_restorations',
      'demo_seed_versions',
    ],
  },

  aiGeneration: {
    enabled: false, // Future feature
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    recordsPerTable: {
      min: 5,
      max: 20,
    },
    temperature: 0.7,
    fallbackToTemplate: true,
  },

  restoration: {
    automatic: true,
    onLogout: true,
    manualEnabled: true,
    validateAfter: true,
  },

  notifications: {
    // Future feature - notify admin of demo issues
    slack: process.env.DEMO_SLACK_WEBHOOK,
    email: process.env.DEMO_NOTIFICATION_EMAIL,
  },
}

/**
 * Validation settings for restored data
 */
export const VALIDATION_CONFIG = {
  minRecordsPerTable: 3,
  maxRecordsPerTable: 100,
  requiredFields: {
    shipments: ['isotope', 'origin', 'destination', 'status', 'eta'],
    activities: ['event', 'type', 'time'],
    compliance_alerts: ['severity', 'title'],
    permits: ['name', 'expiry_date', 'status'],
    deliveries: ['date', 'time', 'isotope', 'destination'],
  },
} as const

/**
 * Restoration timing configuration
 */
export const RESTORATION_CONFIG = {
  timeoutMs: 30000, // 30 seconds max for restoration
  retryAttempts: 2,
  retryDelayMs: 1000,
  batchSize: 50, // Records per batch insert
} as const

/**
 * Feature flags for demo system
 */
export const DEMO_FEATURES = {
  showBanner: true,
  allowManualRestore: true,
  trackRestorations: true,
  validateOnRestore: true,
  logToConsole: process.env.NODE_ENV === 'development',
} as const

/**
 * UI configuration for demo components
 */
export const DEMO_UI_CONFIG = {
  banner: {
    backgroundColor: '#FEF3C7', // Tailwind yellow-100
    textColor: '#92400E', // Tailwind yellow-800
    borderColor: '#FCD34D', // Tailwind yellow-300
    iconColor: '#F59E0B', // Tailwind yellow-500
  },
  restoreButton: {
    cooldownMs: 5000, // 5 seconds between manual restores
  },
} as const

/**
 * Error messages for demo system
 */
export const DEMO_ERROR_MESSAGES = {
  NOT_DEMO_ACCOUNT: 'This action is only available for demo accounts',
  RESTORE_IN_PROGRESS: 'Data restoration is already in progress',
  RESTORE_FAILED: 'Failed to restore demo data. Please try again.',
  RESTORE_TIMEOUT: 'Data restoration timed out. Please try again.',
  INVALID_SEED_DATA: 'Seed data validation failed. Please contact support.',
  NO_SEED_DATA: 'No seed data found for restoration',
} as const

/**
 * Success messages for demo system
 */
export const DEMO_SUCCESS_MESSAGES = {
  RESTORE_COMPLETE: 'Demo data restored successfully',
  LOGOUT_RESTORE: 'Your demo session has been reset',
} as const
