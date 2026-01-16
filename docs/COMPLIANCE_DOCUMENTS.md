# Compliance Document Management System

## Overview

The Compliance Document Management System is a production-grade solution for managing compliance-related documents in the Nuclear-Nextjs application. It provides full CRUD operations, secure file storage, in-browser preview, and comprehensive audit logging.

## Features

### Core Functionality
- ✅ **Document Upload**: Multi-file upload with drag-and-drop support
- ✅ **Document Preview**: In-browser PDF and image preview
- ✅ **Document Download**: Secure file download with audit logging
- ✅ **Document Management**: Full CRUD operations (Create, Read, Update, Delete)
- ✅ **Status Management**: Dynamic status colors (pending → uploaded → verified)
- ✅ **Audit Logging**: Complete audit trail for all document operations
- ✅ **File Validation**: Size and type validation (PDF, PNG, JPEG - max 10MB)
- ✅ **Mobile Responsive**: Touch-friendly interface with responsive design

### Document Types Supported
1. Certificate of Analysis
2. Transport Permit
3. Customs Declaration
4. Radiation Safety Certificate
5. Insurance Certificate
6. Export License
7. Import License
8. Bill of Lading
9. Packing List
10. Material Safety Data Sheet

### Status Types
- **Pending** (🟠 Orange): Document awaiting upload
- **Uploaded** (🟢 Green): Document successfully uploaded
- **Verified** (🔵 Blue): Document verified and approved
- **Rejected** (🔴 Red): Document rejected during review
- **Expired** (⚫ Gray): Document past expiry date

## Architecture

### Database Schema

#### compliance_documents Table
```sql
CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY,
  shipment_id UUID REFERENCES shipments(id),
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
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
```

#### compliance_document_audit Table
```sql
CREATE TABLE compliance_document_audit (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES compliance_documents(id),
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### File Storage

Documents are stored in **Supabase Storage** with the following structure:

```
compliance-documents/
└── {shipment_id}/
    └── {document_type}/
        └── {timestamp}_{sanitized_filename}
```

**Security Features:**
- Signed URLs with 1-hour expiration for previews
- Row Level Security (RLS) policies
- File size validation (10MB max)
- File type validation (PDF, PNG, JPEG only)

### API Endpoints

#### 1. List Documents
```
GET /api/compliance-documents
Query Parameters:
  - shipment_id: Filter by shipment
  - document_type: Filter by type
  - status: Filter by status
  - uploaded_by: Filter by uploader
  - expiry_from: Filter by expiry start date
  - expiry_to: Filter by expiry end date
  - page: Page number (default: 1)
  - per_page: Results per page (default: 50)

Response: { success: boolean, data: ComplianceDocument[], count: number }
```

#### 2. Upload Document
```
POST /api/compliance-documents
Content-Type: multipart/form-data
Body:
  - file: File (required)
  - shipment_id: string (required)
  - document_type: DocumentType (required)
  - document_name: string (required)
  - expiry_date: string (optional)
  - jurisdiction: JSON string array (optional)
  - notes: string (optional)

Response: { success: boolean, data: ComplianceDocument }
```

#### 3. Get Document
```
GET /api/compliance-documents/{id}
Response: { success: boolean, data: ComplianceDocument }
```

#### 4. Update Document
```
PATCH /api/compliance-documents/{id}
Body: {
  document_name?: string,
  status?: DocumentStatus,
  expiry_date?: string,
  jurisdiction?: string[],
  notes?: string,
  verified_by?: string
}
Response: { success: boolean, data: ComplianceDocument }
```

#### 5. Delete Document
```
DELETE /api/compliance-documents/{id}
Response: { success: boolean }
```

#### 6. Preview Document
```
GET /api/compliance-documents/{id}/preview
Response: { success: boolean, data: { url: string, file_type: string, file_name: string } }
```

#### 7. Download Document
```
GET /api/compliance-documents/{id}/download
Response: Binary file with Content-Disposition header
```

## User Guide

### Uploading Documents

1. Navigate to the **Compliance & Regulatory** page
2. Find the document type you want to upload
3. Click the **"Upload Document"** button
4. In the upload dialog:
   - Drag and drop a file or click to browse
   - Enter a document name
   - (Optional) Set an expiry date
   - (Optional) Select applicable jurisdictions
   - (Optional) Add notes
5. Click **"Upload Document"**
6. Wait for the upload to complete
7. The document status will change from **Pending** (🟠) to **Uploaded** (🟢)

### Previewing Documents

1. Find an uploaded document in the document list
2. Click the **"View"** (👁️) icon
3. The preview dialog will open showing:
   - PDF documents: Rendered in browser with scrolling
   - Images: Displayed with zoom controls
4. Use the download button in the preview to save the file
5. Click the **"X"** to close the preview

### Downloading Documents

1. Find an uploaded document in the document list
2. Click the **"Download"** (⬇️) icon
3. The file will be downloaded to your device

### Status Colors

Documents use dynamic status colors:
- **🟠 Orange (Pending)**: Document needs to be uploaded
- **🟢 Green (Uploaded)**: Document is uploaded and ready
- **🔵 Blue (Verified)**: Document has been verified
- **🔴 Red (Rejected)**: Document was rejected
- **⚫ Gray (Expired)**: Document has expired

## Component Reference

### DocumentUploadDialog
Multi-step upload dialog with drag-and-drop support.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  documentType: DocumentType;
  onUploadSuccess?: () => void;
}
```

### DocumentPreviewDialog
In-browser document preview with zoom controls.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  document: ComplianceDocument | null;
}
```

### DocumentListTable
Sortable table view for document lists.

**Props:**
```typescript
{
  documents: ComplianceDocument[];
  onView?: (document: ComplianceDocument) => void;
  onDownload?: (document: ComplianceDocument) => void;
  onDelete?: (document: ComplianceDocument) => void;
  loading?: boolean;
}
```

### DocumentCard
Mobile-friendly card view for individual documents.

**Props:**
```typescript
{
  document: ComplianceDocument;
  onView?: (document: ComplianceDocument) => void;
  onDownload?: (document: ComplianceDocument) => void;
  onDelete?: (document: ComplianceDocument) => void;
}
```

## Service Layer

### compliance-document.service.ts

**Key Functions:**

```typescript
// Upload a document
uploadDocument(
  data: CreateDocumentRequest, 
  onProgress?: (progress: number) => void
): Promise<ComplianceDocument>

// Fetch all documents with filters
fetchDocuments(filters?: DocumentFilter): Promise<ComplianceDocument[]>

// Fetch single document
fetchDocumentById(id: string): Promise<ComplianceDocument>

// Update document
updateDocument(id: string, data: UpdateDocumentRequest): Promise<ComplianceDocument>

// Delete document
deleteDocument(id: string): Promise<void>

// Generate preview URL
generatePreviewUrl(id: string): Promise<string>

// Download document
downloadDocument(id: string, fileName?: string): Promise<void>

// Fetch audit logs
fetchDocumentAudit(documentId: string): Promise<DocumentAuditLog[]>

// Helper: Get documents for shipment
fetchDocumentsForShipment(shipmentId: string): Promise<ComplianceDocument[]>

// Helper: Check compliance
checkShipmentDocumentCompliance(
  shipmentId: string, 
  requiredDocumentTypes: string[]
): Promise<{ complete: boolean; missing: string[] }>
```

## Security Considerations

### Authentication & Authorization
- All API endpoints require authentication via Supabase Auth
- Row Level Security (RLS) policies enforce access control
- Users can only access documents they have permission to view

### File Validation
- File size limited to 10MB
- Only PDF, PNG, and JPEG files accepted
- File type validation on both client and server
- Malware scanning placeholder (for future implementation)

### Data Protection
- Signed URLs expire after 1 hour
- Files stored in private Supabase Storage bucket
- Audit logging for all operations
- HTTPS encryption for all transfers

### Rate Limiting
- Upload endpoint should be rate-limited (max 10 per minute recommended)
- Download endpoint should track bandwidth usage

## Performance Optimization

### File Uploads
- Progress tracking for user feedback
- Chunked uploads for large files (future enhancement)
- Client-side validation before upload

### File Downloads
- Signed URLs for direct CDN access
- Lazy loading for document lists
- Thumbnail generation (future enhancement)

### Caching
- Preview URLs cached for 1 hour
- Document metadata cached on client
- List queries paginated for performance

## Testing Guide

### Manual Testing Checklist

**Upload Flow:**
- [ ] Upload PDF document (< 10MB)
- [ ] Upload PNG image (< 10MB)
- [ ] Upload JPEG image (< 10MB)
- [ ] Try uploading file > 10MB (should fail)
- [ ] Try uploading unsupported type (should fail)
- [ ] Upload with expiry date
- [ ] Upload with jurisdiction selection
- [ ] Upload with notes
- [ ] Verify status changes to "uploaded" (green)
- [ ] Verify upload progress indicator works

**Preview Flow:**
- [ ] Preview PDF document
- [ ] Preview PNG image
- [ ] Preview JPEG image
- [ ] Test zoom controls on images
- [ ] Test download from preview dialog
- [ ] Verify preview loads within 3 seconds

**Download Flow:**
- [ ] Download PDF document
- [ ] Download PNG image
- [ ] Download JPEG image
- [ ] Verify correct filename
- [ ] Verify file integrity (can open)

**List/Table View:**
- [ ] View documents in table
- [ ] Sort by name, type, status, size, date
- [ ] Filter by status
- [ ] Test pagination
- [ ] Test on mobile device

**Status Management:**
- [ ] Verify pending status shows orange
- [ ] Verify uploaded status shows green
- [ ] Verify status updates on upload
- [ ] Verify upload button becomes view/download buttons

### Automated Testing

Create test files:
- `__tests__/api/compliance-documents.test.ts` - API endpoint tests
- `__tests__/services/compliance-document.service.test.ts` - Service layer tests
- `__tests__/components/DocumentUploadDialog.test.tsx` - Component tests

## Troubleshooting

### Common Issues

**Issue: "Failed to upload file"**
- Check file size (must be < 10MB)
- Verify file type (PDF, PNG, JPEG only)
- Ensure user is authenticated
- Check network connection
- Verify Supabase Storage bucket exists

**Issue: "Failed to load preview"**
- Check document exists in database
- Verify storage path is correct
- Check signed URL expiration (1 hour)
- Ensure user has permission to view

**Issue: "Document not showing in list"**
- Verify shipment_id matches
- Check RLS policies
- Ensure document status is not filtered out
- Refresh the page to reload data

**Issue: Status not updating to green**
- Check if upload completed successfully
- Verify status field in database is 'uploaded'
- Ensure page is refreshing after upload
- Check browser console for errors

## Future Enhancements

### Planned Features
- [ ] Bulk upload support (multiple files at once)
- [ ] Document versioning with history
- [ ] OCR for PDF text extraction
- [ ] Automated expiry notifications
- [ ] Document templates
- [ ] Digital signatures
- [ ] Malware scanning integration
- [ ] Thumbnail generation for quick preview
- [ ] Full-text search within documents
- [ ] Document comparison tools
- [ ] Export compliance reports as PDF
- [ ] Integration with external compliance systems

### Performance Improvements
- [ ] Implement chunked uploads for large files
- [ ] Add CDN caching for frequently accessed documents
- [ ] Optimize database queries with materialized views
- [ ] Implement background job queue for processing
- [ ] Add Redis caching layer

## Migration Guide

### Running the Migration

```bash
# Connect to your Supabase project
psql "postgresql://[YOUR_CONNECTION_STRING]"

# Run the migration
\i migrations/007_compliance_documents.sql

# Verify tables were created
\dt compliance_*
```

### Creating the Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `compliance-documents`
3. Set to **Private** (not public)
4. Configure RLS policies for the bucket

### Environment Variables

No additional environment variables required. Uses existing Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check the browser console for errors
4. Review server logs for API errors
5. Contact the development team

## License

This feature is part of the Nuclear-Nextjs project and follows the same license terms.

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-16  
**Maintained By:** Nuclear-Nextjs Development Team
