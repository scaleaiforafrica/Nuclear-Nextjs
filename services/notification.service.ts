/**
 * Notification Service
 * Handles sending notifications and logging notification attempts
 */

import { createClient } from '@/lib/supabase/server';
import type {
  NotificationType,
  NotificationChannel,
  NotificationLog,
  CreateNotificationLogRequest,
  UpdateNotificationLogRequest,
  ShouldSendNotificationResult,
} from '@/models/notification-log.model';

/**
 * Check if a notification should be sent based on user preferences
 * 
 * @param userId - User ID to check preferences for
 * @param notificationType - Type of notification
 * @param isCritical - Whether the notification is critical
 * @returns Result indicating if notification should be sent
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: NotificationType,
  isCritical: boolean = false
): Promise<ShouldSendNotificationResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('should_send_notification', {
      p_user_id: userId,
      p_notification_type: notificationType,
      p_is_critical: isCritical,
    });

    if (error) {
      console.error('Error checking notification preferences:', error);
      // Default to sending if we can't check preferences
      return {
        should_send: true,
        reason: 'Error checking preferences, defaulting to send',
        user_preference: 'all',
      };
    }

    // Extract the result from the RPC response
    const result = Array.isArray(data) ? data[0] : data;
    return {
      should_send: result.should_send,
      reason: result.reason,
      user_preference: result.user_preference,
    };
  } catch (error) {
    console.error('Unexpected error in shouldSendNotification:', error);
    // Default to sending if error occurs
    return {
      should_send: true,
      reason: 'Unexpected error, defaulting to send',
      user_preference: 'all',
    };
  }
}

/**
 * Log a notification attempt in the database
 * This function checks user preferences and logs the attempt
 * 
 * @param request - Notification log request data
 * @returns Notification log ID
 */
export async function logNotification(
  request: CreateNotificationLogRequest
): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('log_notification', {
      p_user_id: request.user_id,
      p_notification_type: request.notification_type,
      p_channel: request.channel,
      p_message: request.message,
      p_subject: request.subject || null,
      p_shipment_id: request.shipment_id || null,
      p_procurement_request_id: request.procurement_request_id || null,
      p_recipient_email: request.recipient_email || null,
      p_recipient_phone: request.recipient_phone || null,
      p_is_critical: request.is_critical || false,
    });

    if (error) {
      console.error('Error logging notification:', error);
      return null;
    }

    return data as string;
  } catch (error) {
    console.error('Unexpected error in logNotification:', error);
    return null;
  }
}

/**
 * Update notification log status
 * 
 * @param notificationId - Notification log ID
 * @param updates - Fields to update
 * @returns Updated notification log or null if failed
 */
export async function updateNotificationLog(
  notificationId: string,
  updates: UpdateNotificationLogRequest
): Promise<NotificationLog | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notification_logs')
      .update(updates)
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification log:', error);
      return null;
    }

    return data as NotificationLog;
  } catch (error) {
    console.error('Unexpected error in updateNotificationLog:', error);
    return null;
  }
}

/**
 * Send a notification (email, push, SMS, or in-app)
 * This is a placeholder for actual notification sending logic
 * 
 * @param request - Notification request data
 * @returns Notification log ID if logged successfully
 */
export async function sendNotification(
  request: CreateNotificationLogRequest
): Promise<string | null> {
  // First, log the notification attempt
  const notificationId = await logNotification(request);

  if (!notificationId) {
    console.error('Failed to log notification attempt');
    return null;
  }

  // Check if we should send based on user preferences
  const checkResult = await shouldSendNotification(
    request.user_id,
    request.notification_type,
    request.is_critical || false
  );

  if (!checkResult.should_send) {
    console.log(
      `Notification ${notificationId} skipped: ${checkResult.reason}`
    );
    return notificationId;
  }

  try {
    // TODO: Implement actual notification sending logic
    // This is where you would integrate with email services (SendGrid, AWS SES, etc.)
    // or push notification services (Firebase, OneSignal, etc.)

    switch (request.channel) {
      case 'email':
        // await sendEmailNotification(request);
        console.log(`Email notification would be sent to ${request.recipient_email}`);
        break;

      case 'push':
        // await sendPushNotification(request);
        console.log(`Push notification would be sent to user ${request.user_id}`);
        break;

      case 'sms':
        // await sendSMSNotification(request);
        console.log(`SMS notification would be sent to ${request.recipient_phone}`);
        break;

      case 'in_app':
        // In-app notifications are handled by the frontend NotificationContext
        console.log(`In-app notification logged for user ${request.user_id}`);
        break;

      default:
        throw new Error(`Unsupported notification channel: ${request.channel}`);
    }

    // Update notification log as sent
    await updateNotificationLog(notificationId, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return notificationId;
  } catch (error) {
    console.error('Error sending notification:', error);

    // Update notification log as failed
    await updateNotificationLog(notificationId, {
      status: 'failed',
      failed_at: new Date().toISOString(),
      error_message:
        error instanceof Error ? error.message : 'Unknown error',
    });

    return notificationId;
  }
}

/**
 * Send notification for new shipment
 * 
 * @param userId - User ID to notify
 * @param shipmentId - Shipment ID
 * @param shipmentNumber - Shipment number for display
 * @param userEmail - User's email address
 * @returns Notification log ID
 */
export async function notifyShipmentCreated(
  userId: string,
  shipmentId: string,
  shipmentNumber: string,
  userEmail?: string
): Promise<string | null> {
  return sendNotification({
    user_id: userId,
    notification_type: 'shipment_created',
    channel: 'email',
    subject: `New Shipment Created: ${shipmentNumber}`,
    message: `A new shipment (${shipmentNumber}) has been created and is ready for tracking.`,
    recipient_email: userEmail,
    shipment_id: shipmentId,
    is_critical: false,
  });
}

/**
 * Send notification for shipment status update
 * 
 * @param userId - User ID to notify
 * @param shipmentId - Shipment ID
 * @param shipmentNumber - Shipment number for display
 * @param status - New status
 * @param userEmail - User's email address
 * @param isCritical - Whether this is a critical update
 * @returns Notification log ID
 */
export async function notifyShipmentUpdated(
  userId: string,
  shipmentId: string,
  shipmentNumber: string,
  status: string,
  userEmail?: string,
  isCritical: boolean = false
): Promise<string | null> {
  return sendNotification({
    user_id: userId,
    notification_type: 'shipment_updated',
    channel: 'email',
    subject: `Shipment Status Updated: ${shipmentNumber}`,
    message: `Shipment ${shipmentNumber} status has been updated to: ${status}`,
    recipient_email: userEmail,
    shipment_id: shipmentId,
    is_critical: isCritical,
  });
}

/**
 * Send notification for shipment delivery
 * 
 * @param userId - User ID to notify
 * @param shipmentId - Shipment ID
 * @param shipmentNumber - Shipment number for display
 * @param userEmail - User's email address
 * @returns Notification log ID
 */
export async function notifyShipmentDelivered(
  userId: string,
  shipmentId: string,
  shipmentNumber: string,
  userEmail?: string
): Promise<string | null> {
  return sendNotification({
    user_id: userId,
    notification_type: 'shipment_delivered',
    channel: 'email',
    subject: `Shipment Delivered: ${shipmentNumber}`,
    message: `Shipment ${shipmentNumber} has been successfully delivered.`,
    recipient_email: userEmail,
    shipment_id: shipmentId,
    is_critical: false,
  });
}

/**
 * Send notification for delayed shipment
 * 
 * @param userId - User ID to notify
 * @param shipmentId - Shipment ID
 * @param shipmentNumber - Shipment number for display
 * @param userEmail - User's email address
 * @returns Notification log ID
 */
export async function notifyShipmentDelayed(
  userId: string,
  shipmentId: string,
  shipmentNumber: string,
  userEmail?: string
): Promise<string | null> {
  return sendNotification({
    user_id: userId,
    notification_type: 'shipment_delayed',
    channel: 'email',
    subject: `Shipment Delayed: ${shipmentNumber}`,
    message: `Shipment ${shipmentNumber} has been delayed. Please check the dashboard for details.`,
    recipient_email: userEmail,
    shipment_id: shipmentId,
    is_critical: true,
  });
}
