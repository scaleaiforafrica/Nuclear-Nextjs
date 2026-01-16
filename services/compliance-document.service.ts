/**
 * Compliance Document Service
 * Client-side service for managing compliance documents
 */

import { createClient } from '@/lib/supabase/client';
import type {
  ComplianceDocument,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentFilter,
  DocumentAuditLog,
  DocumentApiResponse,
  DocumentListResponse,
  FileValidationResult
} from '@/models/compliance-document.model';

const API_BASE = '/api/compliance-documents';

/**
 * Validate file before upload
 */
export function validateFile(file: File): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  // Check file type
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type must be PDF, PNG, or JPEG');
  }
  
  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    errors.push('File must have a valid name');
  }
  
  // Warning for large files
  const warningSize = 5 * 1024 * 1024; // 5MB
  if (file.size > warningSize && file.size <= maxSize) {
    warnings.push('Large file size may take longer to upload');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Upload a new compliance document
 */
export async function uploadDocument(
  data: CreateDocumentRequest,
  onProgress?: (progress: number) => void
): Promise<ComplianceDocument> {
  try {
    // Validate file
    const validation = validateFile(data.file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('shipment_id', data.shipment_id);
    formData.append('document_type', data.document_type);
    formData.append('document_name', data.document_name);
    
    if (data.expiry_date) {
      formData.append('expiry_date', data.expiry_date);
    }
    
    if (data.jurisdiction && data.jurisdiction.length > 0) {
      formData.append('jurisdiction', JSON.stringify(data.jurisdiction));
    }
    
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    // Upload with progress tracking
    const xhr = new XMLHttpRequest();
    
    const uploadPromise = new Promise<ComplianceDocument>((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: DocumentApiResponse<ComplianceDocument> = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
              resolve(response.data);
            } else {
              reject(new Error(response.error || 'Upload failed'));
            }
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });
      
      xhr.open('POST', API_BASE);
      xhr.send(formData);
    });
    
    return await uploadPromise;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Fetch all compliance documents with optional filters
 */
export async function fetchDocuments(filters?: DocumentFilter): Promise<ComplianceDocument[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.shipment_id) {
      params.append('shipment_id', filters.shipment_id);
    }
    if (filters?.document_type) {
      params.append('document_type', filters.document_type);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.uploaded_by) {
      params.append('uploaded_by', filters.uploaded_by);
    }
    if (filters?.expiry_from) {
      params.append('expiry_from', filters.expiry_from);
    }
    if (filters?.expiry_to) {
      params.append('expiry_to', filters.expiry_to);
    }
    
    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch documents');
    }
    
    const result: DocumentListResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Fetch a single compliance document by ID
 */
export async function fetchDocumentById(id: string): Promise<ComplianceDocument> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch document');
    }
    
    const result: DocumentApiResponse<ComplianceDocument> = await response.json();
    if (!result.data) {
      throw new Error('Document not found');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

/**
 * Update an existing compliance document
 */
export async function updateDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<ComplianceDocument> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update document');
    }
    
    const result: DocumentApiResponse<ComplianceDocument> = await response.json();
    if (!result.data) {
      throw new Error('Failed to update document');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a compliance document
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete document');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

/**
 * Generate a preview URL for a document
 */
export async function generatePreviewUrl(id: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/${id}/preview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate preview URL');
    }
    
    const result: DocumentApiResponse<{ url: string }> = await response.json();
    if (!result.data?.url) {
      throw new Error('Failed to generate preview URL');
    }
    
    return result.data.url;
  } catch (error) {
    console.error('Error generating preview URL:', error);
    throw error;
  }
}

/**
 * Download a compliance document
 */
export async function downloadDocument(id: string, fileName?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}/download`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to download document');
    }
    
    // Get the blob from response
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `document-${id}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
}

/**
 * Fetch audit logs for a document
 * Note: This function requires direct database access or a dedicated audit API endpoint
 * For now, this is a placeholder that returns an empty array
 */
export async function fetchDocumentAudit(documentId: string): Promise<DocumentAuditLog[]> {
  try {
    // TODO: Implement audit log fetching
    // Option 1: Create /api/compliance-documents/[id]/audit endpoint
    // Option 2: Use Supabase client directly from client components
    console.warn('fetchDocumentAudit is not fully implemented yet');
    return [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Helper function to get documents for a specific shipment
 */
export async function fetchDocumentsForShipment(shipmentId: string): Promise<ComplianceDocument[]> {
  return fetchDocuments({ shipment_id: shipmentId });
}

/**
 * Helper function to check if all required documents are uploaded for a shipment
 */
export async function checkShipmentDocumentCompliance(
  shipmentId: string,
  requiredDocumentTypes: string[]
): Promise<{ complete: boolean; missing: string[] }> {
  try {
    const documents = await fetchDocumentsForShipment(shipmentId);
    const uploadedTypes = documents
      .filter(doc => doc.status === 'uploaded' || doc.status === 'verified')
      .map(doc => doc.document_type as string);
    
    const missing = requiredDocumentTypes.filter(
      type => !uploadedTypes.includes(type)
    );
    
    return {
      complete: missing.length === 0,
      missing
    };
  } catch (error) {
    console.error('Error checking document compliance:', error);
    throw error;
  }
}
