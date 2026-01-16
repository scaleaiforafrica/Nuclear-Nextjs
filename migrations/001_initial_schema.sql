-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Nuclear Supply Chain Management application
-- This migration creates all necessary tables, policies, triggers, and indexes
-- for Vercel/Supabase deployment
-- 
-- Usage:
-- 1. Via Supabase Dashboard: Copy and run in SQL Editor
-- 2. Via Vercel Postgres: Run through Vercel Postgres integration
-- 3. Via CLI: psql -h <host> -U postgres -d postgres -f migrations/001_initial_schema.sql

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with additional user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT CHECK (role IN ('Hospital Administrator', 'Logistics Manager', 'Compliance Officer')),
  initials TEXT,
  -- Contact information
  phone TEXT,
  job_title TEXT,
  department TEXT,
  avatar_url TEXT,
  -- Application preferences
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  -- Account settings
  two_factor_enabled BOOLEAN DEFAULT false,
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  shipment_alerts TEXT DEFAULT 'all' CHECK (shipment_alerts IN ('all', 'critical', 'none')),
  compliance_reminders BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHIPMENTS TABLE
-- Tracks radioactive isotope shipments through the supply chain
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  isotope TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT CHECK (status IN ('In Transit', 'At Customs', 'Dispatched', 'Delivered', 'Pending')),
  eta TIMESTAMPTZ NOT NULL,
  status_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPLIANCE ALERTS TABLE
-- Stores compliance-related alerts and notifications
CREATE TABLE IF NOT EXISTS public.compliance_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  severity TEXT CHECK (severity IN ('warning', 'info', 'error')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PERMITS TABLE
-- Manages regulatory permits and their expiration dates
CREATE TABLE IF NOT EXISTS public.permits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('valid', 'expiring', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACTIVITIES TABLE
-- Tracks user activities and system events
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  time TIMESTAMPTZ DEFAULT NOW(),
  event TEXT NOT NULL,
  type TEXT CHECK (type IN ('delivery', 'procurement', 'customs', 'alert', 'approval')),
  user_id UUID REFERENCES auth.users(id)
);

-- 6. DELIVERIES TABLE
-- Manages scheduled deliveries for dashboard and calendar views
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  isotope TEXT NOT NULL,
  destination TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LOGIN HISTORY TABLE
-- Tracks user login history for security and audit purposes
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  device TEXT,
  location TEXT
);

-- 8. USER SESSIONS TABLE
-- Manages active user sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  device TEXT,
  browser TEXT,
  ip_address TEXT,
  location TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Shipments policies
CREATE POLICY "Shipments are viewable by authenticated users" 
ON public.shipments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create shipments" 
ON public.shipments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update shipments" 
ON public.shipments FOR UPDATE TO authenticated USING (true);

-- Compliance alerts policies
CREATE POLICY "Alerts are viewable by authenticated users" 
ON public.compliance_alerts FOR SELECT TO authenticated USING (true);

-- Permits policies
CREATE POLICY "Permits are viewable by authenticated users" 
ON public.permits FOR SELECT TO authenticated USING (true);

-- Activities policies
CREATE POLICY "Activities are viewable by authenticated users" 
ON public.activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert activities" 
ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

-- Deliveries policies
CREATE POLICY "Deliveries viewable by authenticated users" 
ON public.deliveries FOR SELECT TO authenticated USING (true);

-- Login history policies
CREATE POLICY "Users can view their own login history" 
ON public.login_history FOR SELECT USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, initials)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'Hospital Administrator'),
    COALESCE(
      new.raw_user_meta_data->>'initials',
      -- Extract first 2 chars of username (before @) as fallback, with minimum length handling
      CASE 
        WHEN LENGTH(SPLIT_PART(new.email, '@', 1)) >= 2 
          THEN UPPER(SUBSTRING(SPLIT_PART(new.email, '@', 1), 1, 2))
        WHEN LENGTH(SPLIT_PART(new.email, '@', 1)) = 1
          THEN UPPER(SPLIT_PART(new.email, '@', 1)) || 'X'
        ELSE 'XX'
      END
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_eta ON public.shipments(eta);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_time ON public.activities(time DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON public.deliveries(date);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON public.login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_permits_status ON public.permits(status);
CREATE INDEX IF NOT EXISTS idx_permits_expiry_date ON public.permits(expiry_date);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_severity ON public.compliance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_created_at ON public.compliance_alerts(created_at DESC);

-- ============================================================================
-- SEED DATA (OPTIONAL - Uncomment to populate with sample data)
-- ============================================================================
-- NOTE: The status_color field contains Tailwind CSS classes for backward 
-- compatibility with the existing application UI. For new implementations,
-- consider storing only the semantic status value and mapping to CSS classes 
-- in the application layer for better maintainability and theme support.
--
-- Alternatively, you could modify the shipments table to remove status_color
-- and use a status-to-color mapping in your application code:
-- const statusColors = {
--   'In Transit': 'bg-blue-100 text-blue-800',
--   'At Customs': 'bg-yellow-100 text-yellow-800',
--   ...
-- }

/*
-- Sample Shipments (includes status_color for legacy compatibility)
INSERT INTO public.shipments (isotope, origin, destination, status, eta, status_color) VALUES 
('Tc-99m', 'Oak Ridge, TN', 'Memorial Hospital, NYC', 'In Transit', NOW() + INTERVAL '2 days', 'bg-blue-100 text-blue-800'),
('I-131', 'Chalk River, ON', 'Johns Hopkins, MD', 'At Customs', NOW() + INTERVAL '3 days', 'bg-yellow-100 text-yellow-800'),
('Mo-99', 'ANSTO, Australia', 'Mayo Clinic, MN', 'Dispatched', NOW() + INTERVAL '5 days', 'bg-purple-100 text-purple-800'),
('F-18', 'Nordion, Canada', 'Cleveland Clinic, OH', 'Delivered', NOW() - INTERVAL '1 day', 'bg-green-100 text-green-800'),
('Ga-68', 'IRE, Belgium', 'Stanford Medical, CA', 'Pending', NOW() + INTERVAL '7 days', 'bg-gray-100 text-gray-800');

-- Sample Compliance Alerts
INSERT INTO public.compliance_alerts (severity, title, description) VALUES 
('warning', 'License Renewal', 'License renewal due in 30 days'),
('info', 'Quality Check', 'Routine quality inspection scheduled for next week');

-- Sample Activities
INSERT INTO public.activities (event, type, time) VALUES 
('Shipment cleared customs in Newark', 'customs', NOW() - INTERVAL '2 hours'),
('New procurement request submitted for Tc-99m', 'procurement', NOW() - INTERVAL '4 hours'),
('Delivery confirmed at Memorial Hospital', 'delivery', NOW() - INTERVAL '1 day'),
('Compliance alert: License renewal due', 'alert', NOW() - INTERVAL '2 days'),
('Quality inspection approved for batch B-2024-001', 'approval', NOW() - INTERVAL '3 days');

-- Sample Deliveries (Upcoming)
INSERT INTO public.deliveries (date, time, isotope, destination) VALUES 
(CURRENT_DATE, '18:00', 'Tc-99m', 'Memorial Hospital, NYC'),
(CURRENT_DATE, '20:30', 'Ga-68', 'UCLA Medical Center, CA'),
(CURRENT_DATE + 1, '09:00', 'I-131', 'Johns Hopkins, MD'),
(CURRENT_DATE + 1, '14:30', 'Mo-99', 'Massachusetts General, MA'),
(CURRENT_DATE + 1, '16:45', 'Y-90', 'Cleveland Clinic, OH'),
(CURRENT_DATE + 2, '08:30', 'Lu-177', 'Houston Methodist, TX'),
(CURRENT_DATE + 2, '10:15', 'Tc-99m', 'Mayo Clinic, MN'),
(CURRENT_DATE + 2, '15:00', 'F-18', 'Stanford Medical, CA'),
(CURRENT_DATE + 3, '11:00', 'Ga-68', 'Northwestern Memorial, IL'),
(CURRENT_DATE + 3, '13:30', 'I-131', 'Barnes-Jewish, MO');

-- Sample Permits
INSERT INTO public.permits (name, expiry_date, status) VALUES 
('Import License US-2024', NOW() + INTERVAL '30 days', 'expiring'),
('Transport Permit CA-99', NOW() + INTERVAL '180 days', 'valid'),
('Handling Cert H-55', NOW() - INTERVAL '5 days', 'expired');
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- This migration has created:
-- - 8 tables (profiles, shipments, compliance_alerts, permits, activities, deliveries, login_history, user_sessions)
-- - Row Level Security policies for all tables
-- - 1 function (handle_new_user)
-- - 1 trigger (on_auth_user_created)
-- - 14 indexes for query optimization
-- 
-- Next steps:
-- 1. Verify all tables were created: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 2. Verify RLS policies: SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
-- 3. (Optional) Uncomment and run the seed data section above to populate sample data
-- 4. Configure environment variables in Vercel:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 
