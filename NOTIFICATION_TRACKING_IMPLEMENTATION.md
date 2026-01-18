# Notification Tracking System Implementation

## Overview

This document describes the implementation of the notification tracking system for the Nuclear Supply Chain Management application. The system addresses two key requirements:

1. **Don't hardcode notification settings to 'none'** - Ensures user notification preferences are respected
2. **Record when notifications are sent** - Comprehensive logging of all notification attempts

## Database Schema

### Migration: `008_notification_tracking.sql`

#### Tables Created

1. **`notification_logs`** - Primary table for tracking all notification attempts
   - Stores notification type, channel, status, and delivery metadata
   - Links to users, shipments, and procurement requests
   - Tracks retry attempts and external service IDs
   - Indexes optimized for common query patterns

2. **`notification_preference_history`** - Audit trail for notification preference changes
   - Tracks when users change their notification settings
   - Records old and new values for compliance
   - Includes IP address and user agent for security audit

#### Database Functions

1. **`should_send_notification()`** - Checks if a notification should be sent based on user preferences
   - Parameters: `user_id`, `notification_type`, `is_critical`
   - Returns: `should_send`, `reason`, `user_preference`
   - Respects `shipment_alerts` preference (all/critical/none)
   - Respects `compliance_reminders` preference

2. **`log_notification()`** - Logs a notification attempt
   - Automatically checks user preferences
   - Creates log entry with appropriate status
   - Returns notification ID for tracking

## TypeScript Models

### File: `models/notification-log.model.ts`

#### Types Defined

- `NotificationType` - Enum of supported notification types
- `NotificationChannel` - Email, push, SMS, in-app
- `NotificationStatus` - Pending, sent, delivered, failed, bounced, skipped
- `NotificationLog` - Complete notification log entry
- `CreateNotificationLogRequest` - Request data for creating logs
- `UpdateNotificationLogRequest` - Update data for log status
- `NotificationStats` - Statistics about notification delivery

## Notification Service

### File: `services/notification.service.ts`

#### Core Functions

1. **`shouldSendNotification()`** - Checks user preferences
   ```typescript
   shouldSendNotification(userId, notificationType, isCritical)
   ```

2. **`logNotification()`** - Creates a notification log entry
   ```typescript
   logNotification(request: CreateNotificationLogRequest)
   ```

3. **`sendNotification()`** - Main function for sending notifications
   - Logs the attempt
   - Checks user preferences
   - Sends via appropriate channel (placeholder for now)
   - Updates log with delivery status

#### Helper Functions

- `notifyShipmentCreated()` - Send notification for new shipment
- `notifyShipmentUpdated()` - Send notification for shipment status update
- `notifyShipmentDelivered()` - Send notification for delivery
- `notifyShipmentDelayed()` - Send notification for delays (marked as critical)

## API Endpoints

### 1. `GET /api/notifications`

List notification logs for the current user with filtering and pagination.

**Query Parameters:**
- `notification_type` - Filter by type
- `channel` - Filter by channel
- `status` - Filter by status
- `shipment_id` - Filter by shipment
- `start_date` / `end_date` - Date range filter
- `page` / `per_page` - Pagination

**Response:**
```json
{
  "success": true,
  "message": "Notification logs fetched successfully",
  "data": [...],
  "count": 42
}
```

### 2. `GET /api/notifications/stats`

Get notification statistics for the current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "sent": 85,
    "delivered": 80,
    "failed": 5,
    "skipped": 10,
    "pending": 0,
    "by_type": { "shipment_created": 30, ... },
    "by_channel": { "email": 90, "push": 10 }
  }
}
```

## Integration

### Shipment Creation

File: `app/api/shipments/route.ts`

When a shipment is created, the system now:
1. Creates the shipment record
2. Sends a notification (async, non-blocking)
3. Logs the notification attempt
4. Returns success immediately

```typescript
// Send notification about shipment creation (async, don't block response)
notifyShipmentCreated(
  user.id,
  shipment.id,
  shipment.shipment_number,
  user.email
).catch((error) => {
  console.error('Failed to send shipment creation notification:', error);
  // Don't fail the request if notification fails
});
```

### Settings Updates

File: `app/api/settings/preferences/route.ts`

When notification preferences are updated:
1. Fetches current preferences
2. Updates the profile
3. Logs preference changes to audit trail (async)

## User Preference Checking

The system respects user preferences at notification time:

- **Shipment Alerts = 'none'**: No shipment notifications sent
- **Shipment Alerts = 'critical'**: Only critical shipment notifications sent
- **Shipment Alerts = 'all'**: All shipment notifications sent
- **Compliance Reminders = false**: No compliance notifications sent

All checks are performed by the `should_send_notification()` database function, ensuring consistency.

## Notification Tracking Flow

```
1. Event occurs (e.g., shipment created)
   ↓
2. Call notifyShipmentCreated()
   ↓
3. Call logNotification() - Creates log entry
   ↓
4. Call should_send_notification() - Check preferences
   ↓
5a. If should_send = false: Mark as 'skipped' with reason
5b. If should_send = true: Attempt to send
   ↓
6. Update log with delivery status
   ↓
7. Return notification ID
```

## Default Configuration

- **Notification Preference Defaults:**
  - `shipment_alerts`: 'all' (NOT hardcoded to 'none')
  - `email_notifications`: true
  - `push_notifications`: true
  - `compliance_reminders`: true
  - `daily_digest`: false
  - `weekly_digest`: true

- **Retry Configuration:**
  - `max_retries`: 3
  - `retry_count`: starts at 0

## Security Considerations

1. **User Isolation**: All notification logs are filtered by authenticated user ID
2. **Audit Trail**: Preference changes are logged with timestamp, IP, and user agent
3. **Error Handling**: Notification failures don't block primary operations
4. **Data Validation**: All inputs are validated via TypeScript types and database constraints

## Future Enhancements

1. **Email Integration**: Implement actual email sending (SendGrid, AWS SES, etc.)
2. **Push Notifications**: Integrate Firebase or OneSignal
3. **SMS Integration**: Add Twilio or similar service
4. **Retry Logic**: Implement automatic retry for failed notifications
5. **Rate Limiting**: Add rate limiting to prevent notification spam
6. **Template System**: Create notification templates for consistent messaging
7. **Scheduled Notifications**: Implement daily/weekly digest functionality
8. **Notification Preferences UI**: Add user interface to view notification history

## Testing

### Manual Testing Steps

1. Create a new shipment via API
2. Check notification_logs table for entry
3. Verify `should_send` is true (default: shipment_alerts = 'all')
4. Change shipment_alerts to 'none' in settings
5. Create another shipment
6. Verify notification is logged with status = 'skipped'
7. Check notification_preference_history for the preference change

### Query Examples

```sql
-- View all notifications for a user
SELECT * FROM notification_logs 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;

-- Check notification statistics
SELECT 
  notification_type,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE user_id = 'user-uuid'
GROUP BY notification_type, status;

-- View preference change history
SELECT * FROM notification_preference_history
WHERE user_id = 'user-uuid'
ORDER BY changed_at DESC;
```

## Compliance

This implementation ensures compliance with the requirements:

1. ✅ **Don't hardcode to 'none'**: Default is 'all', user can change via settings
2. ✅ **Record when sent**: Every notification attempt is logged with timestamp
3. ✅ **User preferences respected**: `should_send_notification()` checks before sending
4. ✅ **Audit trail**: Preference changes are tracked
5. ✅ **Non-blocking**: Notification failures don't impact primary operations

## Conclusion

The notification tracking system provides a robust foundation for managing user notifications while ensuring compliance, auditability, and user control over notification preferences.
