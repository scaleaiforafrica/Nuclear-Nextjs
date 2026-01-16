-- Migration 006: Shipment Procurement Integration
-- Extends shipments table with procurement integration, route tracking, and activity decay

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ALTER SHIPMENTS TABLE
-- ============================================================================

-- Add procurement integration columns
ALTER TABLE public.shipments
ADD COLUMN IF NOT EXISTS procurement_request_id UUID REFERENCES public.procurement_requests(id),
ADD COLUMN IF NOT EXISTS shipment_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS batch_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Add activity tracking columns
ALTER TABLE public.shipments
ADD COLUMN IF NOT EXISTS initial_activity NUMERIC,
ADD COLUMN IF NOT EXISTS current_activity NUMERIC,
ADD COLUMN IF NOT EXISTS expected_activity_at_arrival NUMERIC;

-- Add route and delivery information
ALTER TABLE public.shipments
ADD COLUMN IF NOT EXISTS route_waypoints JSONB,
ADD COLUMN IF NOT EXISTS estimated_delivery_time TEXT,
ADD COLUMN IF NOT EXISTS special_handling_instructions TEXT,
ADD COLUMN IF NOT EXISTS temperature_requirements TEXT;

-- Add created_by for RLS
ALTER TABLE public.shipments
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shipments_procurement_request_id 
ON public.shipments(procurement_request_id);

CREATE INDEX IF NOT EXISTS idx_shipments_shipment_number 
ON public.shipments(shipment_number);

CREATE INDEX IF NOT EXISTS idx_shipments_created_by 
ON public.shipments(created_by);

CREATE INDEX IF NOT EXISTS idx_shipments_status 
ON public.shipments(status);

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.shipments.procurement_request_id IS 'Links shipment to a procurement request';
COMMENT ON COLUMN public.shipments.shipment_number IS 'Unique shipment identifier (e.g., SH-2851)';
COMMENT ON COLUMN public.shipments.batch_number IS 'Batch number of the isotope shipment';
COMMENT ON COLUMN public.shipments.carrier IS 'Shipping carrier/courier name';
COMMENT ON COLUMN public.shipments.initial_activity IS 'Initial activity at shipment origin (mCi or GBq)';
COMMENT ON COLUMN public.shipments.current_activity IS 'Current calculated activity based on decay';
COMMENT ON COLUMN public.shipments.expected_activity_at_arrival IS 'Expected activity at destination';
COMMENT ON COLUMN public.shipments.route_waypoints IS 'Array of waypoint objects with coordinates and status';
COMMENT ON COLUMN public.shipments.estimated_delivery_time IS 'Estimated delivery time string';
COMMENT ON COLUMN public.shipments.special_handling_instructions IS 'Special handling requirements';
COMMENT ON COLUMN public.shipments.temperature_requirements IS 'Temperature control requirements';
COMMENT ON COLUMN public.shipments.created_by IS 'User who created the shipment';

-- ============================================================================
-- FUNCTION TO GENERATE SHIPMENT NUMBERS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
  max_number INTEGER;
  new_number TEXT;
BEGIN
  -- Get the highest existing shipment number
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN shipment_number ~ '^SH-[0-9]+$' 
        THEN CAST(SUBSTRING(shipment_number FROM 4) AS INTEGER)
        ELSE 0
      END
    ), 
    2850  -- Start from SH-2851 if no shipments exist
  ) INTO max_number
  FROM public.shipments
  WHERE shipment_number IS NOT NULL;
  
  -- Generate new shipment number
  new_number := 'SH-' || (max_number + 1)::TEXT;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_shipment_number() IS 'Generates sequential shipment numbers (SH-2851, SH-2852, etc.)';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on shipments table (if not already enabled)
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can create shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can update their own shipments" ON public.shipments;

-- Policy: Authenticated users can view all shipments
CREATE POLICY "Users can view all shipments"
ON public.shipments
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can create shipments
CREATE POLICY "Users can create shipments"
ON public.shipments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Users can update their own shipments
CREATE POLICY "Users can update their own shipments"
ON public.shipments
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- ============================================================================
-- SEED DATA: Sample Shipments
-- ============================================================================

-- Get user ID for seed data (use first user or null)
DO $$
DECLARE
  seed_user_id UUID;
BEGIN
  -- Get first user ID if exists
  SELECT id INTO seed_user_id FROM auth.users LIMIT 1;
  
  -- Insert sample shipments linked to procurement requests
  -- SH-2851: Linked to PR-2847 (PO Approved)
  INSERT INTO public.shipments (
    id, shipment_number, procurement_request_id, batch_number, isotope, 
    origin, destination, carrier, status, eta, status_color,
    initial_activity, current_activity, expected_activity_at_arrival,
    route_waypoints, estimated_delivery_time, 
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  )
  SELECT
    uuid_generate_v4(),
    'SH-2851',
    pr.id,
    'BATCH-TC99M-2024-001',
    pr.isotope,
    pr.origin,
    pr.destination,
    'MediTransport Express',
    'In Transit',
    NOW() + INTERVAL '18 hours',
    'bg-blue-100 text-blue-700',
    350.0,
    328.5,
    315.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Johannesburg', 'coordinates', ARRAY[-26.2041, 28.0473], 'status', 'completed', 'timestamp', NOW() - INTERVAL '6 hours'),
      jsonb_build_object('name', 'Gaborone Hub', 'coordinates', ARRAY[-24.6282, 25.9231], 'status', 'current', 'timestamp', NOW()),
      jsonb_build_object('name', 'Destination - Harare', 'coordinates', ARRAY[-17.8252, 31.0335], 'status', 'upcoming', 'timestamp', NOW() + INTERVAL '18 hours')
    ),
    '24 hours',
    'Handle with care - Radioactive material. Keep upright at all times.',
    '2-8°C controlled environment',
    seed_user_id,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '1 hour'
  FROM public.procurement_requests pr
  WHERE pr.request_number = 'PR-2847'
  ON CONFLICT (shipment_number) DO NOTHING;

  -- SH-2852: Linked to PR-2846 (Completed)
  INSERT INTO public.shipments (
    id, shipment_number, procurement_request_id, batch_number, isotope,
    origin, destination, carrier, status, eta, status_color,
    initial_activity, current_activity, expected_activity_at_arrival,
    route_waypoints, estimated_delivery_time,
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  )
  SELECT
    uuid_generate_v4(),
    'SH-2852',
    pr.id,
    'BATCH-I131-2024-015',
    pr.isotope,
    pr.origin,
    pr.destination,
    'AfriCourier Medical',
    'Delivered',
    NOW() - INTERVAL '2 days',
    'bg-purple-100 text-purple-700',
    500.0,
    485.2,
    480.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Nairobi', 'coordinates', ARRAY[-1.2921, 36.8219], 'status', 'completed', 'timestamp', NOW() - INTERVAL '50 hours'),
      jsonb_build_object('name', 'Kampala Hub', 'coordinates', ARRAY[0.3476, 32.5825], 'status', 'completed', 'timestamp', NOW() - INTERVAL '30 hours'),
      jsonb_build_object('name', 'Destination - Kigali', 'coordinates', ARRAY[-1.9403, 29.8739], 'status', 'completed', 'timestamp', NOW() - INTERVAL '2 days')
    ),
    '48 hours',
    'Refrigerated transport required. Time-sensitive medical material.',
    '2-8°C continuous monitoring',
    seed_user_id,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
  FROM public.procurement_requests pr
  WHERE pr.request_number = 'PR-2846'
  ON CONFLICT (shipment_number) DO NOTHING;

  -- SH-2853: Independent shipment (no procurement link)
  INSERT INTO public.shipments (
    id, shipment_number, batch_number, isotope,
    origin, destination, carrier, status, eta, status_color,
    initial_activity, current_activity, expected_activity_at_arrival,
    route_waypoints, estimated_delivery_time,
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  ) VALUES (
    uuid_generate_v4(),
    'SH-2853',
    'BATCH-F18-2024-042',
    'F-18',
    'Cape Town, South Africa',
    'Port Elizabeth, South Africa',
    'SwiftMed Logistics',
    'At Customs',
    NOW() + INTERVAL '12 hours',
    'bg-amber-100 text-amber-700',
    150.0,
    148.5,
    145.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Cape Town', 'coordinates', ARRAY[-33.9249, 18.4241], 'status', 'completed', 'timestamp', NOW() - INTERVAL '3 hours'),
      jsonb_build_object('name', 'Customs - George', 'coordinates', ARRAY[-33.9628, 22.4618], 'status', 'current', 'timestamp', NOW()),
      jsonb_build_object('name', 'Destination - Port Elizabeth', 'coordinates', ARRAY[-33.9608, 25.6022], 'status', 'upcoming', 'timestamp', NOW() + INTERVAL '12 hours')
    ),
    '18 hours',
    'Expedited customs clearance required. Medical emergency shipment.',
    'Ambient temperature acceptable',
    seed_user_id,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '30 minutes'
  ) ON CONFLICT (shipment_number) DO NOTHING;

  -- SH-2854: Linked to PR-2843
  INSERT INTO public.shipments (
    id, shipment_number, procurement_request_id, batch_number, isotope,
    origin, destination, carrier, status, eta, status_color,
    initial_activity, current_activity, expected_activity_at_arrival,
    route_waypoints, estimated_delivery_time,
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  )
  SELECT
    uuid_generate_v4(),
    'SH-2854',
    pr.id,
    'BATCH-LU177-2024-008',
    pr.isotope,
    pr.origin,
    pr.destination,
    'PharmaLogix Africa',
    'Dispatched',
    NOW() + INTERVAL '36 hours',
    'bg-green-100 text-green-700',
    200.0,
    198.0,
    195.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Accra', 'coordinates', ARRAY[5.6037, -0.1870], 'status', 'completed', 'timestamp', NOW() - INTERVAL '12 hours'),
      jsonb_build_object('name', 'Lagos Distribution', 'coordinates', ARRAY[6.5244, 3.3792], 'status', 'completed', 'timestamp', NOW() - INTERVAL '4 hours'),
      jsonb_build_object('name', 'Final Transit', 'coordinates', ARRAY[9.0765, 7.3986], 'status', 'current', 'timestamp', NOW()),
      jsonb_build_object('name', 'Destination - Abuja', 'coordinates', ARRAY[9.0765, 7.3986], 'status', 'upcoming', 'timestamp', NOW() + INTERVAL '36 hours')
    ),
    '48 hours',
    'Store in lead-lined container. Radiation monitoring required.',
    '15-25°C controlled',
    seed_user_id,
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '1 hour'
  FROM public.procurement_requests pr
  WHERE pr.request_number = 'PR-2843'
  ON CONFLICT (shipment_number) DO NOTHING;

  -- SH-2855: Pending shipment
  INSERT INTO public.shipments (
    id, shipment_number, batch_number, isotope,
    origin, destination, carrier, status, eta, status_color,
    initial_activity, route_waypoints, estimated_delivery_time,
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  ) VALUES (
    uuid_generate_v4(),
    'SH-2855',
    'BATCH-TC99M-2024-089',
    'Tc-99m',
    'Dar es Salaam, Tanzania',
    'Dodoma, Tanzania',
    'TanzaniaExpress Medical',
    'Pending',
    NOW() + INTERVAL '48 hours',
    'bg-gray-100 text-gray-700',
    400.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Dar es Salaam', 'coordinates', ARRAY[-6.7924, 39.2083], 'status', 'upcoming', 'timestamp', NOW() + INTERVAL '24 hours'),
      jsonb_build_object('name', 'Destination - Dodoma', 'coordinates', ARRAY[-6.1630, 35.7516], 'status', 'upcoming', 'timestamp', NOW() + INTERVAL '48 hours')
    ),
    '72 hours',
    'Awaiting regulatory approval for transport.',
    '2-8°C refrigeration required',
    seed_user_id,
    NOW(),
    NOW()
  ) ON CONFLICT (shipment_number) DO NOTHING;

  -- SH-2856: In transit - linked to PR-2841
  INSERT INTO public.shipments (
    id, shipment_number, procurement_request_id, batch_number, isotope,
    origin, destination, carrier, status, eta, status_color,
    initial_activity, current_activity, expected_activity_at_arrival,
    route_waypoints, estimated_delivery_time,
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  )
  SELECT
    uuid_generate_v4(),
    'SH-2856',
    pr.id,
    'BATCH-I123-2024-022',
    pr.isotope,
    pr.origin,
    pr.destination,
    'MediTransport Express',
    'In Transit',
    NOW() + INTERVAL '8 hours',
    'bg-blue-100 text-blue-700',
    120.0,
    115.0,
    110.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Pretoria', 'coordinates', ARRAY[-25.7479, 28.2293], 'status', 'completed', 'timestamp', NOW() - INTERVAL '10 hours'),
      jsonb_build_object('name', 'Johannesburg Airport', 'coordinates', ARRAY[-26.1392, 28.2460], 'status', 'completed', 'timestamp', NOW() - INTERVAL '8 hours'),
      jsonb_build_object('name', 'En Route', 'coordinates', ARRAY[-26.5, 28.0], 'status', 'current', 'timestamp', NOW()),
      jsonb_build_object('name', 'Destination - Bloemfontein', 'coordinates', ARRAY[-29.0852, 26.1596], 'status', 'upcoming', 'timestamp', NOW() + INTERVAL '8 hours')
    ),
    '24 hours',
    'Express delivery. Temperature monitoring required throughout transit.',
    '2-8°C strict control',
    seed_user_id,
    NOW() - INTERVAL '10 hours',
    NOW() - INTERVAL '15 minutes'
  FROM public.procurement_requests pr
  WHERE pr.request_number = 'PR-2841'
  ON CONFLICT (shipment_number) DO NOTHING;

  -- SH-2857: Delivered shipment
  INSERT INTO public.shipments (
    id, shipment_number, batch_number, isotope,
    origin, destination, carrier, status, eta, status_color,
    initial_activity, current_activity, expected_activity_at_arrival,
    route_waypoints, estimated_delivery_time,
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  ) VALUES (
    uuid_generate_v4(),
    'SH-2857',
    'BATCH-TC99M-2024-105',
    'Tc-99m',
    'Lusaka, Zambia',
    'Kitwe, Zambia',
    'ZambiaMed Couriers',
    'Delivered',
    NOW() - INTERVAL '1 day',
    'bg-purple-100 text-purple-700',
    300.0,
    275.0,
    270.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Lusaka', 'coordinates', ARRAY[-15.3875, 28.3228], 'status', 'completed', 'timestamp', NOW() - INTERVAL '28 hours'),
      jsonb_build_object('name', 'Kabwe Checkpoint', 'coordinates', ARRAY[-14.4469, 28.4464], 'status', 'completed', 'timestamp', NOW() - INTERVAL '26 hours'),
      jsonb_build_object('name', 'Destination - Kitwe', 'coordinates', ARRAY[-12.8024, 28.2132], 'status', 'completed', 'timestamp', NOW() - INTERVAL '1 day')
    ),
    '30 hours',
    'Standard radioactive material handling procedures.',
    '2-8°C recommended',
    seed_user_id,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
  ) ON CONFLICT (shipment_number) DO NOTHING;

  -- SH-2858: At customs
  INSERT INTO public.shipments (
    id, shipment_number, batch_number, isotope,
    origin, destination, carrier, status, eta, status_color,
    initial_activity, current_activity, expected_activity_at_arrival,
    route_waypoints, estimated_delivery_time,
    special_handling_instructions, temperature_requirements,
    created_by, created_at, updated_at
  ) VALUES (
    uuid_generate_v4(),
    'SH-2858',
    'BATCH-GA68-2024-033',
    'Ga-68',
    'Maputo, Mozambique',
    'Beira, Mozambique',
    'MozTransit Medical',
    'At Customs',
    NOW() + INTERVAL '20 hours',
    'bg-amber-100 text-amber-700',
    90.0,
    88.0,
    85.0,
    jsonb_build_array(
      jsonb_build_object('name', 'Origin - Maputo', 'coordinates', ARRAY[-25.9655, 32.5832], 'status', 'completed', 'timestamp', NOW() - INTERVAL '8 hours'),
      jsonb_build_object('name', 'Customs Check', 'coordinates', ARRAY[-19.8436, 34.8389], 'status', 'current', 'timestamp', NOW()),
      jsonb_build_object('name', 'Destination - Beira', 'coordinates', ARRAY[-19.8436, 34.8389], 'status', 'upcoming', 'timestamp', NOW() + INTERVAL '20 hours')
    ),
    '36 hours',
    'Awaiting customs documentation. Priority medical shipment.',
    'Ambient acceptable for short periods',
    seed_user_id,
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '10 minutes'
  ) ON CONFLICT (shipment_number) DO NOTHING;

END $$;

-- ============================================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- ============================================================================

/*
-- Verify shipments were created correctly
SELECT 
  s.shipment_number,
  s.isotope,
  s.status,
  s.carrier,
  s.origin,
  s.destination,
  pr.request_number as linked_procurement,
  s.initial_activity,
  s.current_activity,
  jsonb_array_length(s.route_waypoints) as waypoint_count
FROM public.shipments s
LEFT JOIN public.procurement_requests pr ON s.procurement_request_id = pr.id
ORDER BY s.created_at DESC;

-- Test shipment number generation
SELECT generate_shipment_number();

-- Verify RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'shipments';
*/
