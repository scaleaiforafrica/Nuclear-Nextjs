-- Migration 004: Procurement System Tables
-- Creates tables for procurement requests, suppliers, and quotes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL, -- City, Country
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_is_active ON public.suppliers(is_active);

COMMENT ON TABLE public.suppliers IS 'Suppliers/manufacturers for isotope procurement';
COMMENT ON COLUMN public.suppliers.location IS 'City, Country format (e.g., "Johannesburg, South Africa")';
COMMENT ON COLUMN public.suppliers.rating IS 'Supplier rating from 0 to 5';

-- ============================================================================
-- PROCUREMENT REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.procurement_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL, -- e.g., PR-2847
  isotope TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('mCi', 'GBq')),
  delivery_date DATE NOT NULL,
  delivery_time_window TEXT CHECK (delivery_time_window IN ('Morning', 'Afternoon', 'Evening')),
  delivery_location TEXT NOT NULL,
  origin TEXT, -- Based on selected supplier location
  destination TEXT, -- Hospital/delivery location
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Pending Quotes', 'Quotes Received', 'PO Approved', 'Completed', 'Cancelled')),
  status_color TEXT,
  clinical_indication TEXT,
  special_instructions TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procurement_requests_status ON public.procurement_requests(status);
CREATE INDEX idx_procurement_requests_created_at ON public.procurement_requests(created_at DESC);
CREATE INDEX idx_procurement_requests_delivery_date ON public.procurement_requests(delivery_date);
CREATE INDEX idx_procurement_requests_created_by ON public.procurement_requests(created_by);

COMMENT ON TABLE public.procurement_requests IS 'Procurement requests for isotopes';
COMMENT ON COLUMN public.procurement_requests.request_number IS 'Unique request identifier (e.g., PR-2847)';
COMMENT ON COLUMN public.procurement_requests.unit IS 'Activity unit: mCi or GBq';
COMMENT ON COLUMN public.procurement_requests.status IS 'Request status workflow';
COMMENT ON COLUMN public.procurement_requests.origin IS 'Supplier location (auto-populated)';
COMMENT ON COLUMN public.procurement_requests.destination IS 'Delivery destination hospital';

-- ============================================================================
-- PROCUREMENT QUOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.procurement_quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  procurement_request_id UUID REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  product_cost NUMERIC NOT NULL,
  shipping_cost NUMERIC NOT NULL,
  insurance_cost NUMERIC NOT NULL,
  total_cost NUMERIC GENERATED ALWAYS AS (product_cost + shipping_cost + insurance_cost) STORED,
  delivery_time TEXT NOT NULL, -- e.g., "24 hours"
  activity_at_arrival TEXT NOT NULL, -- e.g., "95%"
  is_best_value BOOLEAN DEFAULT false,
  compliance_passed BOOLEAN DEFAULT true,
  quote_valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_procurement_quotes_request_id ON public.procurement_quotes(procurement_request_id);
CREATE INDEX idx_procurement_quotes_supplier_id ON public.procurement_quotes(supplier_id);

COMMENT ON TABLE public.procurement_quotes IS 'Supplier quotes for procurement requests';
COMMENT ON COLUMN public.procurement_quotes.total_cost IS 'Computed total: product + shipping + insurance';
COMMENT ON COLUMN public.procurement_quotes.delivery_time IS 'Estimated delivery time (e.g., "24 hours")';
COMMENT ON COLUMN public.procurement_quotes.activity_at_arrival IS 'Expected activity percentage at arrival';
COMMENT ON COLUMN public.procurement_quotes.is_best_value IS 'Marked as best value option';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_quotes ENABLE ROW LEVEL SECURITY;

-- Suppliers: Read access for authenticated users
CREATE POLICY "Suppliers are viewable by authenticated users" 
  ON public.suppliers FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Suppliers: Insert/Update for authenticated users (admin-only in production)
CREATE POLICY "Suppliers are manageable by authenticated users" 
  ON public.suppliers FOR ALL 
  USING (auth.role() = 'authenticated');

-- Procurement Requests: Users can view their own requests
CREATE POLICY "Users can view their own procurement requests" 
  ON public.procurement_requests FOR SELECT 
  USING (auth.uid() = created_by OR auth.role() = 'authenticated');

-- Procurement Requests: Users can create their own requests
CREATE POLICY "Users can create procurement requests" 
  ON public.procurement_requests FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Procurement Requests: Users can update their own requests
CREATE POLICY "Users can update their own procurement requests" 
  ON public.procurement_requests FOR UPDATE 
  USING (auth.uid() = created_by);

-- Procurement Requests: Users can delete their own requests
CREATE POLICY "Users can delete their own procurement requests" 
  ON public.procurement_requests FOR DELETE 
  USING (auth.uid() = created_by);

-- Procurement Quotes: Viewable by authenticated users
CREATE POLICY "Quotes are viewable by authenticated users" 
  ON public.procurement_quotes FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Procurement Quotes: Manageable by authenticated users
CREATE POLICY "Quotes are manageable by authenticated users" 
  ON public.procurement_quotes FOR ALL 
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert suppliers
INSERT INTO public.suppliers (name, location, rating, contact_email, contact_phone, is_active) VALUES
  ('NucMed Solutions', 'Johannesburg, South Africa', 4.8, 'sales@nucmed.co.za', '+27-11-555-0100', true),
  ('RadioPharma Inc', 'Cape Town, South Africa', 4.6, 'orders@radiopharma.co.za', '+27-21-555-0200', true),
  ('Isotope Global', 'Nairobi, Kenya', 4.9, 'info@isotopeglobal.ke', '+254-20-555-0300', true),
  ('AfricaNuclear Supply', 'Lagos, Nigeria', 4.5, 'sales@africannuclear.ng', '+234-1-555-0400', true),
  ('MedIsotopes Ltd', 'Cairo, Egypt', 4.7, 'contact@medisotopes.eg', '+20-2-555-0500', true),
  ('PharmaRadio Co', 'Accra, Ghana', 4.4, 'info@pharmaradio.gh', '+233-30-555-0600', true),
  ('NuclearMed Africa', 'Dar es Salaam, Tanzania', 4.6, 'sales@nuclearmedafrica.tz', '+255-22-555-0700', true),
  ('IsotopeSource SA', 'Pretoria, South Africa', 4.8, 'orders@isotopesource.co.za', '+27-12-555-0800', true)
ON CONFLICT DO NOTHING;

-- Insert procurement requests
INSERT INTO public.procurement_requests (
  request_number, isotope, quantity, unit, delivery_date, delivery_time_window,
  delivery_location, origin, destination, status, status_color, clinical_indication, special_instructions
) VALUES
  (
    'PR-2847', 'Tc-99m', 500, 'mCi', CURRENT_DATE + INTERVAL '3 days', 'Morning',
    'City Hospital, 123 Medical Ave, Cape Town', 'Johannesburg, South Africa', 'Cape Town, South Africa',
    'Quotes Received', 'bg-blue-100 text-blue-700', 'Cardiac imaging procedures', 'Handle with care - urgent'
  ),
  (
    'PR-2846', 'F-18 FDG', 250, 'mCi', CURRENT_DATE + INTERVAL '1 day', 'Afternoon',
    'University Medical Center, Nairobi', 'Nairobi, Kenya', 'Nairobi, Kenya',
    'PO Approved', 'bg-green-100 text-green-700', 'Oncology PET scans', NULL
  ),
  (
    'PR-2845', 'I-131', 100, 'mCi', CURRENT_DATE + INTERVAL '5 days', 'Morning',
    'National Cancer Institute, Lagos', NULL, 'Lagos, Nigeria',
    'Pending Quotes', 'bg-amber-100 text-amber-700', 'Thyroid cancer treatment', 'Requires special shielding'
  ),
  (
    'PR-2844', 'Lu-177', 50, 'mCi', CURRENT_DATE + INTERVAL '8 days', 'Afternoon',
    'Research Hospital, Cairo', NULL, 'Cairo, Egypt',
    'Draft', 'bg-gray-100 text-gray-700', 'PRRT clinical trial', 'Temperature sensitive'
  ),
  (
    'PR-2843', 'Tc-99m', 750, 'mCi', CURRENT_DATE + INTERVAL '2 days', 'Morning',
    'Central Hospital, Accra', 'Accra, Ghana', 'Accra, Ghana',
    'Quotes Received', 'bg-blue-100 text-blue-700', 'Bone scans', NULL
  ),
  (
    'PR-2842', 'F-18 FDG', 300, 'mCi', CURRENT_DATE + INTERVAL '10 days', 'Evening',
    'Kilimanjaro Medical Centre, Dar es Salaam', NULL, 'Dar es Salaam, Tanzania',
    'Draft', 'bg-gray-100 text-gray-700', 'Neurological imaging', NULL
  ),
  (
    'PR-2841', 'I-131', 150, 'mCi', CURRENT_DATE - INTERVAL '2 days', 'Morning',
    'Pretoria Academic Hospital, Pretoria', 'Pretoria, South Africa', 'Pretoria, South Africa',
    'Completed', 'bg-purple-100 text-purple-700', 'Hyperthyroidism treatment', NULL
  ),
  (
    'PR-2840', 'Tc-99m', 400, 'mCi', CURRENT_DATE - INTERVAL '1 day', 'Afternoon',
    'Mombasa General Hospital, Mombasa', 'Nairobi, Kenya', 'Mombasa, Kenya',
    'Completed', 'bg-purple-100 text-purple-700', 'Renal function studies', NULL
  ),
  (
    'PR-2839', 'Lu-177', 75, 'mCi', CURRENT_DATE + INTERVAL '7 days', NULL,
    'Addis Ababa Medical Center, Addis Ababa', NULL, 'Addis Ababa, Ethiopia',
    'Cancelled', 'bg-red-100 text-red-700', 'Cancelled by requester', 'Budget constraints'
  ),
  (
    'PR-2838', 'F-18 FDG', 200, 'mCi', CURRENT_DATE + INTERVAL '4 days', 'Morning',
    'Maputo Central Hospital, Maputo', NULL, 'Maputo, Mozambique',
    'Pending Quotes', 'bg-amber-100 text-amber-700', 'Infection imaging', NULL
  )
ON CONFLICT DO NOTHING;

-- Get supplier IDs for quotes (using subqueries)
-- Insert quotes for PR-2847 (Tc-99m - Quotes Received)
INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  4500,
  350,
  150,
  '24 hours',
  '95%',
  true,
  true,
  CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2847' AND s.name = 'NucMed Solutions'
ON CONFLICT DO NOTHING;

INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  4200,
  450,
  200,
  '36 hours',
  '92%',
  false,
  true,
  CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2847' AND s.name = 'RadioPharma Inc'
ON CONFLICT DO NOTHING;

INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  4800,
  300,
  125,
  '18 hours',
  '97%',
  false,
  true,
  CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2847' AND s.name = 'Isotope Global'
ON CONFLICT DO NOTHING;

-- Insert quotes for PR-2846 (F-18 FDG - PO Approved)
INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  3200,
  250,
  100,
  '12 hours',
  '98%',
  true,
  true,
  CURRENT_TIMESTAMP + INTERVAL '5 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2846' AND s.name = 'Isotope Global'
ON CONFLICT DO NOTHING;

INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  3400,
  200,
  120,
  '18 hours',
  '96%',
  false,
  true,
  CURRENT_TIMESTAMP + INTERVAL '5 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2846' AND s.name = 'MedIsotopes Ltd'
ON CONFLICT DO NOTHING;

-- Insert quotes for PR-2843 (Tc-99m - Quotes Received)
INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  6500,
  400,
  180,
  '24 hours',
  '94%',
  false,
  true,
  CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2843' AND s.name = 'PharmaRadio Co'
ON CONFLICT DO NOTHING;

INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  6200,
  450,
  200,
  '30 hours',
  '91%',
  true,
  true,
  CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2843' AND s.name = 'AfricaNuclear Supply'
ON CONFLICT DO NOTHING;

INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  6800,
  350,
  150,
  '20 hours',
  '96%',
  false,
  true,
  CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2843' AND s.name = 'NucMed Solutions'
ON CONFLICT DO NOTHING;

-- Insert quotes for PR-2841 (Completed)
INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  2800,
  200,
  100,
  '24 hours',
  '93%',
  true,
  true,
  CURRENT_TIMESTAMP - INTERVAL '10 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2841' AND s.name = 'IsotopeSource SA'
ON CONFLICT DO NOTHING;

-- Insert quotes for PR-2840 (Completed)
INSERT INTO public.procurement_quotes (
  procurement_request_id, supplier_id, product_cost, shipping_cost, insurance_cost,
  delivery_time, activity_at_arrival, is_best_value, compliance_passed, quote_valid_until
)
SELECT 
  pr.id,
  s.id,
  4000,
  300,
  120,
  '18 hours',
  '95%',
  true,
  true,
  CURRENT_TIMESTAMP - INTERVAL '5 days'
FROM public.procurement_requests pr
CROSS JOIN public.suppliers s
WHERE pr.request_number = 'PR-2840' AND s.name = 'Isotope Global'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_requests_updated_at
  BEFORE UPDATE ON public.procurement_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procurement_quotes_updated_at
  BEFORE UPDATE ON public.procurement_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION TO GENERATE REQUEST NUMBERS
-- ============================================================================

-- Function to generate the next procurement request number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  request_num TEXT;
BEGIN
  -- Get the highest existing number
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 4) AS INTEGER)), 2800)
  INTO next_number
  FROM public.procurement_requests
  WHERE request_number ~ '^PR-[0-9]+$';
  
  -- Increment and format
  next_number := next_number + 1;
  request_num := 'PR-' || next_number::TEXT;
  
  RETURN request_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_request_number() IS 'Generates the next sequential procurement request number';
