/**
 * Notification Log Models
 * TypeScript interfaces for notification tracking system
 */

export type NotificationType =
  | 'shipment_created'
  | 'shipment_updated'
  | 'shipment_delivered'
  | 'shipment_delayed'
  | 'compliance_reminder'
  | 'permit_expiring'
  | 'procurement_approved'
  | 'daily_digest'
  | 'weekly_digest';

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';

export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'skipped';

export type ShipmentAlertPreference = 'all' | 'critical' | 'none';

/**
 * Notification Log Entry
 * Represents a single notification attempt and its delivery status
 */
export interface NotificationLog {
  id: string;
  
  // User and recipient information
  user_id: string;
  recipient_email?: string;
  recipient_phone?: string;
  
  // Notification details
  notification_type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  message: string;
  
  // Related entities
  shipment_id?: string;
  procurement_request_id?: string;
  
  // Delivery status
  status: NotificationStatus;
  user_preference?: ShipmentAlertPreference;
  should_send: boolean;
  skip_reason?: string;
  
  // Delivery metadata
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_message?: string;
  
  // External service tracking
  external_id?: string;
  external_status?: string;
  
  // Retry information
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Create Notification Log Request
 * Data required to create a new notification log entry
 */
export interface CreateNotificationLogRequest {
  user_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  message: string;
  subject?: string;
  recipient_email?: string;
  recipient_phone?: string;
  shipment_id?: string;
  procurement_request_id?: string;
  is_critical?: boolean;
}

/**
 * Update Notification Log Request
 * Data for updating notification log status
 */
export interface UpdateNotificationLogRequest {
  status?: NotificationStatus;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_message?: string;
  external_id?: string;
  external_status?: string;
  retry_count?: number;
  next_retry_at?: string;
}

/**
 * Notification Preference History
 * Tracks changes to user notification preferences
 */
export interface NotificationPreferenceHistory {
  id: string;
  user_id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  changed_at: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Notification Filter
 * Query parameters for filtering notification logs
 */
export interface NotificationLogFilter {
  user_id?: string;
  notification_type?: NotificationType;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  start_date?: string;
  end_date?: string;
  shipment_id?: string;
  page?: number;
  per_page?: number;
}

/**
 * Notification Stats
 * Statistics about notification delivery
 */
export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  skipped: number;
  pending: number;
  by_type: Record<NotificationType, number>;
  by_channel: Record<NotificationChannel, number>;
}

/**
 * Should Send Notification Result
 * Result from checking if notification should be sent
 */
export interface ShouldSendNotificationResult {
  should_send: boolean;
  reason: string;
  user_preference: ShipmentAlertPreference;
}
