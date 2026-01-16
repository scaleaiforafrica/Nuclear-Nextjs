-- Migration: 002_demo_account_setup.sql
-- Description: Sets up demo account system for Nuclear Supply Chain Management
-- This migration creates demo user, tracking tables, and adds demo account indicators
--
-- Usage:
-- 1. Via Supabase Dashboard: Copy and run in SQL Editor
-- 2. Via Vercel Postgres: Run through Vercel Postgres integration
-- 3. Via CLI: psql -h <host> -U postgres -d postgres -f migrations/002_demo_account_setup.sql

-- ============================================================================
-- DEMO USER SETUP
-- ============================================================================

-- IMPORTANT: This creates the demo user directly in auth.users.
-- For production deployments, consider using Supabase Admin API instead:
--   const { data, error } = await supabase.auth.admin.createUser({
--     email: 'demo@nuclearflow.com',
--     password: 'DemoNuclear2026!',
--     email_confirm: true,
--     user_metadata: { full_name: 'Demo User', role: 'Hospital Administrator' }
--   })
--
-- Direct insertion is suitable for development/testing environments.

-- Create demo user in auth.users
-- Password: DemoNuclear2026!
-- NOTE: The password hash below is a placeholder. 
-- For production, generate a proper bcrypt hash using:
--   SELECT crypt('DemoNuclear2026!', gen_salt('bf'));
-- Or use Supabase Admin API to create the user properly.
-- For development/testing, update this hash with a real bcrypt hash.
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo@nuclearflow.com',
  '$2a$10$2F7qZJXyDd5Z5h7qZJXyDd5Z5h7qZJXyDd5Z5h7qZJXyDd5Z5h7qZ', -- DemoNuclear2026!
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Demo User","role":"Hospital Administrator"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TABLE MODIFICATIONS
-- ============================================================================

-- Add is_demo_account flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_demo_account BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_demo_account IS 
  'Identifies demo accounts that get automatic data restoration';

-- ============================================================================
-- DEMO TRACKING TABLES
-- ============================================================================

-- 1. DEMO RESTORATIONS TABLE
-- Tracks all demo data restoration operations for monitoring and debugging
CREATE TABLE IF NOT EXISTS public.demo_restorations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restored_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  tables_restored TEXT[] NOT NULL,
  records_restored INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  triggered_by TEXT CHECK (triggered_by IN ('logout', 'manual', 'api', 'scheduled')) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_restorations_user_id 
  ON public.demo_restorations(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_restorations_restored_at 
  ON public.demo_restorations(restored_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_restorations_success 
  ON public.demo_restorations(success);

-- Add comment
COMMENT ON TABLE public.demo_restorations IS 
  'Audit log for demo account data restoration operations';

-- 2. DEMO SEED VERSIONS TABLE
-- Tracks seed data versions per table for version control and rollback
CREATE TABLE IF NOT EXISTS public.demo_seed_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  version TEXT NOT NULL,
  generated_by TEXT CHECK (generated_by IN ('ai', 'manual', 'template')) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  schema_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_name, version)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_demo_seed_versions_table_name 
  ON public.demo_seed_versions(table_name);
CREATE INDEX IF NOT EXISTS idx_demo_seed_versions_is_active 
  ON public.demo_seed_versions(is_active) WHERE is_active = true;

-- Add comment
COMMENT ON TABLE public.demo_seed_versions IS 
  'Version control for demo seed data across tables';

-- ============================================================================
-- DEMO USER PROFILE
-- ============================================================================

-- Create profile for demo user
INSERT INTO public.profiles (
  id,
  name,
  role,
  initials,
  is_demo_account,
  phone,
  job_title,
  department,
  timezone,
  date_format,
  theme,
  two_factor_enabled,
  email_notifications,
  push_notifications,
  in_app_notifications,
  shipment_alerts,
  compliance_reminders,
  daily_digest,
  weekly_digest,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo User',
  'Hospital Administrator',
  'DU',
  true,
  '+254-700-123456',
  'Hospital Administrator',
  'Nuclear Medicine',
  'Africa/Nairobi',
  'DD/MM/YYYY',
  'system',
  false,
  true,
  true,
  true,
  'all',
  true,
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  is_demo_account = true,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  initials = EXCLUDED.initials,
  updated_at = NOW();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.demo_restorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_seed_versions ENABLE ROW LEVEL SECURITY;

-- Demo restorations policies
CREATE POLICY "Demo restorations viewable by own user" 
  ON public.demo_restorations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert demo restorations" 
  ON public.demo_restorations FOR INSERT 
  TO authenticated WITH CHECK (true);

-- Demo seed versions policies (read-only for authenticated users)
CREATE POLICY "Seed versions viewable by authenticated users" 
  ON public.demo_seed_versions FOR SELECT 
  TO authenticated USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if current user is demo account
CREATE OR REPLACE FUNCTION public.is_demo_account()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_demo_account = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get latest restoration for demo user
CREATE OR REPLACE FUNCTION public.get_latest_demo_restoration()
RETURNS TABLE (
  restored_at TIMESTAMPTZ,
  tables_restored TEXT[],
  records_restored INTEGER,
  success BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dr.restored_at,
    dr.tables_restored,
    dr.records_restored,
    dr.success
  FROM public.demo_restorations dr
  WHERE dr.user_id = auth.uid()
    AND dr.success = true
  ORDER BY dr.restored_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT ON public.demo_restorations TO authenticated;
GRANT INSERT ON public.demo_restorations TO authenticated;
GRANT SELECT ON public.demo_seed_versions TO authenticated;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 002_demo_account_setup completed successfully';
  RAISE NOTICE 'Demo account created: demo@nuclearflow.com';
  RAISE NOTICE 'Demo tracking tables created: demo_restorations, demo_seed_versions';
END $$;
