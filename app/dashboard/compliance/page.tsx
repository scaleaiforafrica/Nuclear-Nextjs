'use client';

import { Shield, AlertTriangle, CheckCircle, FileText, Download, Eye, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  RenewDocumentDialog, 
  ViewDocumentDialog, 
  GenerateDocumentDialog,
  DocumentUploadDialog,
  DocumentPreviewDialog
} from '@/components/compliance';
import { downloadDocumentPDF } from '@/lib/compliance-utils';
import { 
  fetchDocumentsForShipment, 
  downloadDocument 
} from '@/services/compliance-document.service';
import type { ComplianceDocument, DocumentType } from '@/models/compliance-document.model';
import { getStatusColor } from '@/models/compliance-document.model';

export default function CompliancePage() {
  const [selectedShipment, setSelectedShipment] = useState('SH-2851');
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<ComplianceDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showExpiringPermits, setShowExpiringPermits] = useState(false);

  // Fetch uploaded documents for the selected shipment
  useEffect(() => {
    if (selectedShipment) {
      loadDocuments();
    }
  }, [selectedShipment]);

  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      // For now, we'll use a mock shipment ID since we don't have real shipments in the system yet
      // In production, this would use the actual shipment ID
      const docs = await fetchDocumentsForShipment(selectedShipment);
      setUploadedDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      // Silently fail for now as shipment might not exist in database
      setUploadedDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleUploadClick = (docType: DocumentType) => {
    setSelectedDocumentType(docType);
    setUploadDialogOpen(true);
  };

  const handleUploadSuccess = () => {
    loadDocuments(); // Reload documents after successful upload
  };

  const handleViewDocument = (doc: ComplianceDocument) => {
    setSelectedDocument(doc);
    setPreviewDialogOpen(true);
  };

  const handleDownloadDocument = async (doc: ComplianceDocument) => {
    try {
      await downloadDocument(doc.id, doc.file_name);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  // Check if a document type has been uploaded
  const getDocumentStatus = (docType: string): { hasDocument: boolean; document?: ComplianceDocument } => {
    const doc = uploadedDocuments.find(d => d.document_type === docType);
    return { hasDocument: !!doc, document: doc };
  };

  // Handle generating all missing documents
  const handleGenerateAllMissing = () => {
    // Find all documents that are not complete or expired/not-started
    const missingDocs = documents.filter(doc => 
      doc.status === 'not-started' || doc.status === 'expired' || doc.status === 'in-progress'
    );
    
    if (missingDocs.length === 0) {
      toast.info('All documents are complete!');
      return;
    }
    
    if (missingDocs.length > 1) {
      toast.info(`Found ${missingDocs.length} missing documents. Starting with ${missingDocs[0].name}...`, {
        description: 'You can generate the remaining documents after completing this one.'
      });
    }
    
    // Open generate dialog with the first missing document
    setSelectedDocument({ name: missingDocs[0].name, shipmentId: selectedShipment });
    setGenerateDialogOpen(true);
  };

  // Handle reviewing expiring permits
  const handleReviewPermits = () => {
    setShowExpiringPermits(true);
    // Scroll to document checklist section
    const checklistSection = document.getElementById('document-checklist');
    if (checklistSection) {
      checklistSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const documents = [
    { 
      name: 'Certificate of Analysis', 
      description: 'Quality assurance documentation',
      required: ['South Africa', 'Namibia'],
      status: 'complete', 
      statusColor: 'text-green-600',
      statusBg: 'bg-green-50',
      icon: CheckCircle
    },
    { 
      name: 'Transport Permit', 
      description: 'Nuclear material transport authorization',
      required: ['South Africa'],
      status: 'complete', 
      statusColor: 'text-green-600',
      statusBg: 'bg-green-50',
      icon: CheckCircle
    },
    { 
      name: 'Customs Declaration', 
      description: 'International shipping documentation',
      required: ['South Africa', 'International'],
      status: 'in-progress', 
      statusColor: 'text-amber-600',
      statusBg: 'bg-amber-50',
      icon: AlertTriangle
    },
    { 
      name: 'Radiation Safety Certificate', 
      description: 'Safety compliance certification',
      required: ['All jurisdictions'],
      status: 'expired', 
      statusColor: 'text-red-600',
      statusBg: 'bg-red-50',
      icon: AlertTriangle
    },
    { 
      name: 'Insurance Certificate', 
      description: 'Shipment insurance documentation',
      required: ['International'],
      status: 'complete', 
      statusColor: 'text-green-600',
      statusBg: 'bg-green-50',
      icon: CheckCircle
    },
    { 
      name: 'Export License', 
      description: 'Export authorization for nuclear materials',
      required: ['International'],
      status: 'not-started', 
      statusColor: 'text-gray-600',
      statusBg: 'bg-gray-50',
      icon: FileText
    },
  ];


  return (
    <div>
      <h2 className="text-xl sm:text-2xl mb-6">Compliance & Regulatory</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl">87%</div>
              <div className="text-xs sm:text-sm text-gray-600">Documents Compliant</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl">5</div>
              <div className="text-xs sm:text-sm text-gray-600">Expiring Soon</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-amber-600">Review within 7 days</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl">2</div>
              <div className="text-xs sm:text-sm text-gray-600">Action Required</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-red-600">Immediate attention needed</p>
        </div>
      </div>

      {/* Jurisdiction Map */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <h3 className="text-lg sm:text-xl mb-4">Compliance by Jurisdiction</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { country: 'South Africa', status: 'compliant', color: 'bg-green-100 text-green-700' },
            { country: 'Kenya', status: 'compliant', color: 'bg-green-100 text-green-700' },
            { country: 'Nigeria', status: 'review', color: 'bg-amber-100 text-amber-700' },
            { country: 'Egypt', status: 'action-needed', color: 'bg-red-100 text-red-700' },
          ].map((jurisdiction) => (
            <div key={jurisdiction.country} className={`${jurisdiction.color} rounded-lg p-4 text-center`}>
              <div className="font-medium mb-1">{jurisdiction.country}</div>
              <div className="text-xs capitalize">{jurisdiction.status.replace('-', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6">
        <h3 className="text-lg sm:text-xl mb-4">Urgent Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-red-900 mb-1">Radiation Safety Certificate Expired</div>
              <p className="text-sm text-red-700">Shipment #SH-2851 - Renew immediately to avoid shipment delays</p>
              <button 
                onClick={() => {
                  setSelectedDocument({ 
                    name: 'Radiation Safety Certificate', 
                    shipmentId: 'SH-2851' 
                  });
                  setRenewDialogOpen(true);
                }}
                className="text-sm text-red-600 hover:text-red-700 mt-2 underline"
              >
                Renew Now
              </button>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-amber-900 mb-1">3 Transport Permits Expiring in 7 Days</div>
              <p className="text-sm text-amber-700">Review and renew transport permits for continued operations</p>
              <button 
                onClick={handleReviewPermits}
                className="text-sm text-amber-600 hover:text-amber-700 mt-2 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded-sm"
              >
                Review Permits
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Document Checklist */}
      <div id="document-checklist" className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl mb-1">Document Checklist</h3>
            <p className="text-xs sm:text-sm text-gray-600">Shipment #SH-2851</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="SH-2851">SH-2851</option>
              <option value="SH-2850">SH-2850</option>
              <option value="SH-2849">SH-2849</option>
            </select>
            <button 
              onClick={handleGenerateAllMissing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
            >
              Generate All Missing
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {documents.map((doc, index) => {
              const Icon = doc.icon;
              const docStatus = getDocumentStatus(doc.name as DocumentType);
              const uploadedDoc = docStatus.document;
              
              // Determine display status based on whether document is uploaded
              let displayStatus = doc.status;
              let displayStatusBg = doc.statusBg;
              let displayStatusColor = doc.statusColor;
              
              if (uploadedDoc) {
                // Use the actual uploaded document status with dynamic colors
                const statusColors = getStatusColor(uploadedDoc.status);
                displayStatus = uploadedDoc.status;
                displayStatusBg = statusColors.bg;
                displayStatusColor = statusColors.text;
              }
              
              return (
                <div 
                  key={index}
                  className={`${displayStatusBg} border ${displayStatusColor.replace('text-', 'border-')} rounded-xl p-4 sm:p-6`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className={`w-12 h-12 ${displayStatusBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${displayStatusColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm sm:text-base font-medium mb-1">{doc.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{doc.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>Required for:</span>
                          {doc.required.map((jurisdiction, i) => (
                            <span key={i} className="px-2 py-1 bg-white rounded border border-gray-200">
                              {jurisdiction}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 ml-0 lg:ml-4">
                      {uploadedDoc ? (
                        // Show View/Download buttons for uploaded documents
                        <>
                          <button 
                            onClick={() => handleViewDocument(uploadedDoc)}
                            className="p-2 hover:bg-white rounded-lg transition-colors" 
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(uploadedDoc)}
                            className="p-2 hover:bg-white rounded-lg transition-colors" 
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        </>
                      ) : (
                        // Show Upload button for documents not yet uploaded
                        <button 
                          onClick={() => handleUploadClick(doc.name as DocumentType)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </button>
                      )}
                      {doc.status === 'expired' && (
                        <button 
                          onClick={() => {
                            setSelectedDocument({ name: doc.name, shipmentId: selectedShipment });
                            setRenewDialogOpen(true);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Renew Now
                        </button>
                      )}
                      {doc.status === 'not-started' && !uploadedDoc && (
                        <button 
                          onClick={() => {
                            setSelectedDocument({ name: doc.name, shipmentId: selectedShipment });
                            setGenerateDialogOpen(true);
                          }}
                          className="px-4 py-2 bg-white border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                        >
                          Generate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs ${displayStatusColor} capitalize`}>
                      Status: {displayStatus.replace('-', ' ')}
                    </span>
                    {uploadedDoc && (
                      <span className="text-xs text-gray-500">
                        • Uploaded {new Date(uploadedDoc.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <RenewDocumentDialog
        isOpen={renewDialogOpen}
        onClose={() => setRenewDialogOpen(false)}
        document={selectedDocument}
      />
      <ViewDocumentDialog
        isOpen={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        document={selectedDocument}
      />
      <GenerateDocumentDialog
        isOpen={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        document={selectedDocument}
      />
      {selectedDocumentType && (
        <DocumentUploadDialog
          isOpen={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false);
            setSelectedDocumentType(null);
          }}
          shipmentId={selectedShipment}
          documentType={selectedDocumentType}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
      <DocumentPreviewDialog
        isOpen={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </div>
  );
}
