/**
 * Compliance Document Model
 * TypeScript types and interfaces for compliance document management
 */

// Document types allowed in the system
export type DocumentType = 
  | 'Certificate of Analysis'
  | 'Transport Permit'
  | 'Customs Declaration'
  | 'Radiation Safety Certificate'
  | 'Insurance Certificate'
  | 'Export License'
  | 'Import License'
  | 'Bill of Lading'
  | 'Packing List'
  | 'Material Safety Data Sheet';

// Document status types
export type DocumentStatus = 'pending' | 'uploaded' | 'verified' | 'rejected' | 'expired';

// Document audit action types
export type DocumentAuditAction = 'created' | 'updated' | 'deleted' | 'downloaded' | 'verified' | 'rejected';

/**
 * Main compliance document interface
 */
export interface ComplianceDocument {
  id: string;
  shipment_id: string;
  document_type: DocumentType;
  document_name: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  storage_path: string;
  status: DocumentStatus;
  version: number;
  uploaded_by: string;
  verified_by?: string;
  expiry_date?: string;
  jurisdiction?: string[];
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Request interface for creating a new document
 */
export interface CreateDocumentRequest {
  shipment_id: string;
  document_type: DocumentType;
  document_name: string;
  file: File;
  expiry_date?: string;
  jurisdiction?: string[];
  notes?: string;
}

/**
 * Request interface for updating an existing document
 */
export interface UpdateDocumentRequest {
  document_name?: string;
  status?: DocumentStatus;
  expiry_date?: string;
  jurisdiction?: string[];
  notes?: string;
  verified_by?: string;
}

/**
 * Filter interface for querying documents
 */
export interface DocumentFilter {
  shipment_id?: string;
  document_type?: DocumentType;
  status?: DocumentStatus;
  uploaded_by?: string;
  expiry_from?: string;
  expiry_to?: string;
}

/**
 * Document audit log interface
 */
export interface DocumentAuditLog {
  id: string;
  document_id: string;
  action: DocumentAuditAction;
  performed_by: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Upload progress interface for tracking file uploads
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Document with related data (for extended queries)
 */
export interface ComplianceDocumentExtended extends ComplianceDocument {
  uploader?: {
    id: string;
    email: string;
    full_name?: string;
  };
  verifier?: {
    id: string;
    email: string;
    full_name?: string;
  };
  shipment?: {
    id: string;
    shipment_number: string;
    isotope: string;
    status: string;
  };
  audit_count?: number;
}

/**
 * Status color configuration for UI rendering
 */
export interface StatusColor {
  bg: string;
  text: string;
  border: string;
}

/**
 * Document type configuration
 */
export interface DocumentTypeConfig {
  type: DocumentType;
  description: string;
  required_for: string[];
  typical_expiry_days?: number;
  max_file_size_mb: number;
  allowed_formats: string[];
}

/**
 * API Response types
 */
export interface DocumentApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DocumentListResponse extends DocumentApiResponse {
  data?: ComplianceDocument[];
  count?: number;
  page?: number;
  per_page?: number;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Constant for document types with configurations
 */
export const DOCUMENT_TYPE_CONFIGS: DocumentTypeConfig[] = [
  {
    type: 'Certificate of Analysis',
    description: 'Quality assurance documentation',
    required_for: ['South Africa', 'Namibia'],
    typical_expiry_days: 365,
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Transport Permit',
    description: 'Nuclear material transport authorization',
    required_for: ['South Africa'],
    typical_expiry_days: 180,
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Customs Declaration',
    description: 'International shipping documentation',
    required_for: ['South Africa', 'International'],
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Radiation Safety Certificate',
    description: 'Safety compliance certification',
    required_for: ['All jurisdictions'],
    typical_expiry_days: 365,
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Insurance Certificate',
    description: 'Shipment insurance documentation',
    required_for: ['International'],
    typical_expiry_days: 365,
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Export License',
    description: 'Export authorization for nuclear materials',
    required_for: ['International'],
    typical_expiry_days: 365,
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Import License',
    description: 'Import authorization for nuclear materials',
    required_for: ['International'],
    typical_expiry_days: 365,
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Bill of Lading',
    description: 'Shipping receipt and contract',
    required_for: ['International'],
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Packing List',
    description: 'Detailed cargo manifest',
    required_for: ['All shipments'],
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  },
  {
    type: 'Material Safety Data Sheet',
    description: 'Safety information for handling materials',
    required_for: ['All shipments'],
    max_file_size_mb: 10,
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  }
];

/**
 * Helper function to get status color configuration
 */
export function getDocumentStatusColor(status: DocumentStatus): StatusColor {
  const colors: Record<DocumentStatus, StatusColor> = {
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200'
    },
    uploaded: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    verified: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200'
    },
    expired: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200'
    }
  };
  
  return colors[status];
}

/**
 * Helper function to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper function to validate file type
 */
export function isValidFileType(fileName: string, allowedFormats: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedFormats.includes(extension) : false;
}

/**
 * Helper function to check if document is expired
 */
export function isDocumentExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

/**
 * Helper function to get days until expiry
 */
export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
