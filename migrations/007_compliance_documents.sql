-- Migration 007: Compliance Documents Management System
-- Description: Creates tables for comprehensive compliance document management with audit logging

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- COMPLIANCE DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.compliance_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'Certificate of Analysis',
    'Transport Permit',
    'Customs Declaration',
    'Radiation Safety Certificate',
    'Insurance Certificate',
    'Export License',
    'Import License',
    'Bill of Lading',
    'Packing List',
    'Material Safety Data Sheet'
  )),
  document_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'verified', 'rejected', 'expired')),
  version INTEGER DEFAULT 1,
  uploaded_by UUID REFERENCES auth.users(id),
  verified_by UUID REFERENCES auth.users(id),
  expiry_date DATE,
  jurisdiction TEXT[],
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_compliance_documents_shipment_id ON public.compliance_documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_compliance_documents_status ON public.compliance_documents(status);
CREATE INDEX IF NOT EXISTS idx_compliance_documents_document_type ON public.compliance_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_compliance_documents_uploaded_by ON public.compliance_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_compliance_documents_expiry_date ON public.compliance_documents(expiry_date);

-- Row Level Security
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compliance documents" 
ON public.compliance_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create compliance documents" 
ON public.compliance_documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update compliance documents" 
ON public.compliance_documents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete compliance documents" 
ON public.compliance_documents FOR DELETE TO authenticated USING (true);

-- =============================================
-- COMPLIANCE DOCUMENT AUDIT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.compliance_document_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.compliance_documents(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'downloaded', 'verified', 'rejected')),
  performed_by UUID REFERENCES auth.users(id),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit table
CREATE INDEX IF NOT EXISTS idx_compliance_audit_document_id ON public.compliance_document_audit(document_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_performed_by ON public.compliance_document_audit(performed_by);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_created_at ON public.compliance_document_audit(created_at DESC);

-- Row Level Security for audit table
ALTER TABLE public.compliance_document_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document audit logs" 
ON public.compliance_document_audit FOR SELECT TO authenticated USING (true);

-- =============================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_compliance_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_compliance_documents_timestamp ON public.compliance_documents;
CREATE TRIGGER update_compliance_documents_timestamp
BEFORE UPDATE ON public.compliance_documents
FOR EACH ROW
EXECUTE FUNCTION update_compliance_documents_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.compliance_documents IS 'Stores compliance document metadata and references to files in storage';
COMMENT ON TABLE public.compliance_document_audit IS 'Audit log for all compliance document operations';
COMMENT ON COLUMN public.compliance_documents.status IS 'Document status: pending (awaiting upload), uploaded (file uploaded), verified (approved), rejected (failed review), expired (past expiry date)';
COMMENT ON COLUMN public.compliance_documents.storage_path IS 'Path to file in Supabase Storage bucket';
COMMENT ON COLUMN public.compliance_documents.metadata IS 'Additional metadata stored as JSON (e.g., checksums, signatures)';
