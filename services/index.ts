/**
 * Services Layer Exports
 * External API integrations and data fetching
 */

// API Service
export {
  fetchApi,
  get,
  post,
  put,
  patch,
  del,
  type ApiError,
  type ApiRequestConfig,
} from './api.service'

// Storage Service
export {
  // Local Storage
  getItem,
  getItemSafe,
  setItem,
  setItemSafe,
  removeItem,
  removeItemSafe,
  clearStorage,
  // Session Storage
  getSessionItem,
  getSessionItemSafe,
  setSessionItem,
  setSessionItemSafe,
  removeSessionItem,
  clearSessionStorage,
  // Auth-specific
  getAuthState,
  setAuthState,
  clearAuthState,
  isStoredAuthenticated,
  // Constants
  STORAGE_KEYS,
  type StorageKey,
  type StorageError,
} from './storage.service'

// Blockchain Services
export type { BlockchainService } from './blockchain'
export { hashService, HashService } from './blockchain/hash.service'
export { hyperledgerService, HyperledgerService } from './blockchain/hyperledger.service'
export { eventRecorderService, EventRecorderService } from './blockchain/event-recorder.service'

// Notification Service
export {
  shouldSendNotification,
  logNotification,
  updateNotificationLog,
  sendNotification,
  notifyShipmentCreated,
  notifyShipmentUpdated,
  notifyShipmentDelivered,
  notifyShipmentDelayed,
} from './notification.service'
