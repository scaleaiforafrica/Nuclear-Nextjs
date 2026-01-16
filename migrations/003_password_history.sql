-- Password History and Audit Logging Migration
-- This migration adds tables for password history tracking and audit logging

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Password history table
-- Stores hashed passwords to prevent reuse of recent passwords
CREATE TABLE IF NOT EXISTS public.password_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint if auth.users exists
-- Note: In Supabase, auth.users is managed by Supabase Auth
-- We'll add the constraint if the table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.password_history 
    ADD CONSTRAINT fk_password_history_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_history_user_id 
  ON public.password_history(user_id);

CREATE INDEX IF NOT EXISTS idx_password_history_created_at 
  ON public.password_history(created_at);

-- Row Level Security
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own password history
DROP POLICY IF EXISTS "Users can view their own password history" 
  ON public.password_history;

CREATE POLICY "Users can view their own password history"
  ON public.password_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage password history
DROP POLICY IF EXISTS "Service role can manage password history" 
  ON public.password_history;

CREATE POLICY "Service role can manage password history"
  ON public.password_history FOR ALL
  USING (auth.role() = 'service_role');

-- Audit log table for password changes
-- Records all password change attempts for security monitoring
CREATE TABLE IF NOT EXISTS public.password_change_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true NOT NULL,
  failure_reason TEXT
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.password_change_audit 
    ADD CONSTRAINT fk_password_audit_user 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes for audit log
CREATE INDEX IF NOT EXISTS idx_password_audit_user_id 
  ON public.password_change_audit(user_id);

CREATE INDEX IF NOT EXISTS idx_password_audit_changed_at 
  ON public.password_change_audit(changed_at);

CREATE INDEX IF NOT EXISTS idx_password_audit_success 
  ON public.password_change_audit(success);

-- Row Level Security for audit log
ALTER TABLE public.password_change_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit log
DROP POLICY IF EXISTS "Users can view their own audit log" 
  ON public.password_change_audit;

CREATE POLICY "Users can view their own audit log"
  ON public.password_change_audit FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage audit log
DROP POLICY IF EXISTS "Service role can manage audit log" 
  ON public.password_change_audit;

CREATE POLICY "Service role can manage audit log"
  ON public.password_change_audit FOR ALL
  USING (auth.role() = 'service_role');

-- Function to automatically store password history when password is updated
-- Note: This trigger would need to be set up on the auth.users table
-- which requires Supabase Auth configuration
-- For now, we'll handle this in application code

-- Comment explaining the manual setup required
COMMENT ON TABLE public.password_history IS 
  'Stores password history to prevent password reuse. ' ||
  'Application code should insert entries when passwords are changed. ' ||
  'Only the last 5 passwords should be kept per user.';

COMMENT ON TABLE public.password_change_audit IS 
  'Audit log for password change attempts. ' ||
  'Records both successful and failed attempts for security monitoring.';
