-- Migration: 008_notification_tracking.sql
-- Description: Adds notification tracking system to record when notifications are sent
-- This ensures compliance with the requirement to track notification delivery

-- ============================================================================
-- NOTIFICATION LOGS TABLE
-- ============================================================================
-- Tracks all notification attempts and their delivery status
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- User and recipient information
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'shipment_created',
    'shipment_updated', 
    'shipment_delivered',
    'shipment_delayed',
    'compliance_reminder',
    'permit_expiring',
    'procurement_approved',
    'daily_digest',
    'weekly_digest'
  )),
  
  -- Delivery channel
  channel TEXT NOT NULL CHECK (channel IN ('email', 'push', 'sms', 'in_app')),
  
  -- Notification content
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Related entities (optional references)
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  procurement_request_id UUID REFERENCES public.procurement_requests(id) ON DELETE SET NULL,
  
  -- Delivery status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sent',
    'delivered',
    'failed',
    'bounced',
    'skipped'
  )),
  
  -- User preference check result
  user_preference TEXT CHECK (user_preference IN ('all', 'critical', 'none')),
  should_send BOOLEAN DEFAULT true,
  skip_reason TEXT, -- Why notification was skipped (e.g., "user preference: none")
  
  -- Delivery metadata
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- External service tracking
  external_id TEXT, -- ID from email service (SendGrid, etc.)
  external_status TEXT,
  
  -- Retry information
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id 
  ON public.notification_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_type 
  ON public.notification_logs(notification_type);

CREATE INDEX IF NOT EXISTS idx_notification_logs_channel 
  ON public.notification_logs(channel);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status 
  ON public.notification_logs(status);

CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at 
  ON public.notification_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_shipment_id 
  ON public.notification_logs(shipment_id) 
  WHERE shipment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at 
  ON public.notification_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_status 
  ON public.notification_logs(user_id, status, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.notification_logs IS 
  'Tracks all notification attempts and delivery status for compliance and debugging';

COMMENT ON COLUMN public.notification_logs.notification_type IS 
  'Type of notification event that triggered this notification';

COMMENT ON COLUMN public.notification_logs.channel IS 
  'Delivery channel used (email, push, sms, in_app)';

COMMENT ON COLUMN public.notification_logs.user_preference IS 
  'User notification preference at the time of sending (all, critical, none)';

COMMENT ON COLUMN public.notification_logs.should_send IS 
  'Whether notification should be sent based on user preferences';

COMMENT ON COLUMN public.notification_logs.skip_reason IS 
  'Reason why notification was skipped (e.g., user preference set to none)';

-- ============================================================================
-- NOTIFICATION PREFERENCES HISTORY TABLE (OPTIONAL)
-- ============================================================================
-- Tracks changes to user notification preferences for audit trail
CREATE TABLE IF NOT EXISTS public.notification_preference_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Preference changes
  field_name TEXT NOT NULL, -- e.g., 'shipment_alerts', 'email_notifications'
  old_value TEXT,
  new_value TEXT,
  
  -- Change metadata
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notification_preference_history_user_id 
  ON public.notification_preference_history(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_preference_history_field 
  ON public.notification_preference_history(field_name);

CREATE INDEX IF NOT EXISTS idx_notification_preference_history_changed_at 
  ON public.notification_preference_history(changed_at DESC);

-- Add comment
COMMENT ON TABLE public.notification_preference_history IS 
  'Audit trail for changes to user notification preferences';

-- ============================================================================
-- UPDATE TRIGGER FOR NOTIFICATION LOGS
-- ============================================================================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_logs_updated_at
  BEFORE UPDATE ON public.notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_logs_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if notification should be sent based on user preferences
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_is_critical BOOLEAN DEFAULT false
)
RETURNS TABLE(
  should_send BOOLEAN,
  reason TEXT,
  user_preference TEXT
) AS $$
DECLARE
  v_shipment_alerts TEXT;
  v_email_notifications BOOLEAN;
  v_push_notifications BOOLEAN;
  v_in_app_notifications BOOLEAN;
  v_compliance_reminders BOOLEAN;
BEGIN
  -- Get user preferences
  SELECT 
    shipment_alerts,
    email_notifications,
    push_notifications,
    in_app_notifications,
    compliance_reminders
  INTO
    v_shipment_alerts,
    v_email_notifications,
    v_push_notifications,
    v_in_app_notifications,
    v_compliance_reminders
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check shipment-related notifications
  IF p_notification_type IN ('shipment_created', 'shipment_updated', 'shipment_delivered', 'shipment_delayed') THEN
    IF v_shipment_alerts = 'none' THEN
      RETURN QUERY SELECT false, 'User preference: shipment_alerts set to none'::TEXT, v_shipment_alerts;
      RETURN;
    ELSIF v_shipment_alerts = 'critical' AND NOT p_is_critical THEN
      RETURN QUERY SELECT false, 'User preference: shipment_alerts set to critical only'::TEXT, v_shipment_alerts;
      RETURN;
    END IF;
  END IF;
  
  -- Check compliance-related notifications
  IF p_notification_type IN ('compliance_reminder', 'permit_expiring') THEN
    IF NOT v_compliance_reminders THEN
      RETURN QUERY SELECT false, 'User preference: compliance_reminders disabled'::TEXT, v_shipment_alerts;
      RETURN;
    END IF;
  END IF;
  
  -- Default: send notification
  RETURN QUERY SELECT true, 'Notification allowed by user preferences'::TEXT, v_shipment_alerts;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION should_send_notification IS 
  'Checks user preferences to determine if notification should be sent';

-- Function to log notification attempt
CREATE OR REPLACE FUNCTION log_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_channel TEXT,
  p_message TEXT,
  p_subject TEXT DEFAULT NULL,
  p_shipment_id UUID DEFAULT NULL,
  p_procurement_request_id UUID DEFAULT NULL,
  p_recipient_email TEXT DEFAULT NULL,
  p_recipient_phone TEXT DEFAULT NULL,
  p_is_critical BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_should_send BOOLEAN;
  v_skip_reason TEXT;
  v_user_preference TEXT;
BEGIN
  -- Check if notification should be sent
  SELECT * INTO v_should_send, v_skip_reason, v_user_preference
  FROM should_send_notification(p_user_id, p_notification_type, p_is_critical);
  
  -- Insert notification log
  INSERT INTO public.notification_logs (
    user_id,
    recipient_email,
    recipient_phone,
    notification_type,
    channel,
    subject,
    message,
    shipment_id,
    procurement_request_id,
    user_preference,
    should_send,
    skip_reason,
    status
  ) VALUES (
    p_user_id,
    p_recipient_email,
    p_recipient_phone,
    p_notification_type,
    p_channel,
    p_subject,
    p_message,
    p_shipment_id,
    p_procurement_request_id,
    v_user_preference,
    v_should_send,
    v_skip_reason,
    CASE WHEN v_should_send THEN 'pending' ELSE 'skipped' END
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_notification IS 
  'Logs a notification attempt and checks user preferences';

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================
-- This migration is now complete
-- Next steps:
-- 1. Implement notification service in application code
-- 2. Integrate with email/push notification providers
-- 3. Call log_notification() function when sending notifications
