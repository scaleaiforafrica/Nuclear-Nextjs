-- Migration 005: Procurement Origin and Destination Enhancement
-- Adds selected_supplier_id column and automatic origin population

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ALTER PROCUREMENT REQUESTS TABLE
-- ============================================================================

-- Add selected_supplier_id column
ALTER TABLE public.procurement_requests
ADD COLUMN IF NOT EXISTS selected_supplier_id UUID REFERENCES public.suppliers(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_procurement_requests_selected_supplier_id 
ON public.procurement_requests(selected_supplier_id);

COMMENT ON COLUMN public.procurement_requests.selected_supplier_id IS 'The supplier selected for this procurement request';

-- ============================================================================
-- FUNCTION TO AUTO-POPULATE ORIGIN FROM SUPPLIER LOCATION
-- ============================================================================

-- Function to update origin when supplier is selected
CREATE OR REPLACE FUNCTION auto_populate_origin_from_supplier()
RETURNS TRIGGER AS $$
DECLARE
  supplier_location TEXT;
BEGIN
  -- If selected_supplier_id is being set or changed
  IF NEW.selected_supplier_id IS NOT NULL AND 
     (OLD.selected_supplier_id IS NULL OR OLD.selected_supplier_id != NEW.selected_supplier_id) THEN
    
    -- Fetch supplier location and set as origin
    SELECT location INTO supplier_location
    FROM public.suppliers
    WHERE id = NEW.selected_supplier_id;
    
    -- Only update origin if supplier was found
    IF supplier_location IS NOT NULL THEN
      NEW.origin := supplier_location;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_populate_origin_from_supplier() IS 'Automatically populates origin field from supplier location when a supplier is selected';

-- ============================================================================
-- TRIGGER TO UPDATE ORIGIN WHEN SUPPLIER IS SELECTED
-- ============================================================================

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_auto_populate_origin ON public.procurement_requests;

-- Create trigger
CREATE TRIGGER trigger_auto_populate_origin
  BEFORE INSERT OR UPDATE OF selected_supplier_id
  ON public.procurement_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_origin_from_supplier();

COMMENT ON TRIGGER trigger_auto_populate_origin ON public.procurement_requests IS 'Triggers automatic origin population when supplier is selected';

-- ============================================================================
-- UPDATE EXISTING SEED DATA WITH SUPPLIER REFERENCES
-- ============================================================================

-- Update existing procurement requests to link them with suppliers based on origin
-- This establishes the relationship retroactively for existing data

-- PR-2847: Johannesburg supplier
UPDATE public.procurement_requests pr
SET selected_supplier_id = (
  SELECT id FROM public.suppliers WHERE name = 'NucMed Solutions' LIMIT 1
)
WHERE pr.request_number = 'PR-2847'
  AND pr.origin = 'Johannesburg, South Africa';

-- PR-2846: Nairobi supplier  
UPDATE public.procurement_requests pr
SET selected_supplier_id = (
  SELECT id FROM public.suppliers WHERE name = 'Isotope Global' LIMIT 1
)
WHERE pr.request_number = 'PR-2846'
  AND pr.origin = 'Nairobi, Kenya';

-- PR-2843: Accra supplier
UPDATE public.procurement_requests pr
SET selected_supplier_id = (
  SELECT id FROM public.suppliers WHERE name = 'PharmaRadio Co' LIMIT 1
)
WHERE pr.request_number = 'PR-2843'
  AND pr.origin = 'Accra, Ghana';

-- PR-2841: Pretoria supplier
UPDATE public.procurement_requests pr
SET selected_supplier_id = (
  SELECT id FROM public.suppliers WHERE name = 'IsotopeSource SA' LIMIT 1
)
WHERE pr.request_number = 'PR-2841'
  AND pr.origin = 'Pretoria, South Africa';

-- PR-2840: Nairobi supplier
UPDATE public.procurement_requests pr
SET selected_supplier_id = (
  SELECT id FROM public.suppliers WHERE name = 'Isotope Global' LIMIT 1
)
WHERE pr.request_number = 'PR-2840'
  AND pr.origin = 'Nairobi, Kenya';

-- ============================================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- ============================================================================

/*
-- Verify the migration worked correctly
SELECT 
  pr.request_number,
  pr.isotope,
  pr.origin,
  pr.destination,
  pr.selected_supplier_id,
  s.name as supplier_name,
  s.location as supplier_location
FROM public.procurement_requests pr
LEFT JOIN public.suppliers s ON pr.selected_supplier_id = s.id
ORDER BY pr.created_at DESC
LIMIT 10;

-- Test the trigger by updating a supplier selection
-- This should automatically populate the origin
UPDATE public.procurement_requests
SET selected_supplier_id = (SELECT id FROM public.suppliers WHERE name = 'NucMed Solutions' LIMIT 1)
WHERE request_number = 'PR-2845';

-- Verify the origin was auto-populated
SELECT request_number, origin, selected_supplier_id
FROM public.procurement_requests
WHERE request_number = 'PR-2845';
*/
