'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadDocument } from '@/services/compliance-document.service';
import type { DocumentType } from '@/models/compliance-document.model';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  documentType: DocumentType;
  onUploadSuccess?: () => void;
}

export function DocumentUploadDialog({
  isOpen,
  onClose,
  shipmentId,
  documentType,
  onUploadSuccess,
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [jurisdiction, setJurisdiction] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      // Auto-populate document name from file name if not set
      if (!documentName) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setDocumentName(nameWithoutExt);
      }
      setError(null);
    }
  }, [documentName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleJurisdictionToggle = (jur: string) => {
    setJurisdiction(prev =>
      prev.includes(jur) ? prev.filter(j => j !== jur) : [...prev, jur]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!documentName.trim()) {
      setError('Please enter a document name');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      await uploadDocument(
        {
          shipment_id: shipmentId,
          document_type: documentType,
          document_name: documentName.trim(),
          file,
          expiry_date: expiryDate || undefined,
          jurisdiction: jurisdiction.length > 0 ? jurisdiction : undefined,
          notes: notes.trim() || undefined,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setSuccess(true);
      setUploadProgress(100);
      
      // Wait a bit to show success message
      setTimeout(() => {
        onUploadSuccess?.();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setDocumentName('');
      setExpiryDate('');
      setJurisdiction([]);
      setNotes('');
      setError(null);
      setSuccess(false);
      setUploadProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  const jurisdictions = ['South Africa', 'Kenya', 'Nigeria', 'Egypt', 'International'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Upload Document</h2>
            <p className="text-sm text-gray-600 mt-1">{documentType}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Document File *</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-purple-600 bg-purple-50'
                  : file
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-green-600 mb-3" />
                    <p className="font-medium text-green-900">{file.name}</p>
                    <p className="text-sm text-green-700 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-600 mt-2">Click or drag to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="font-medium text-gray-900">
                      {isDragActive ? 'Drop file here' : 'Drag & drop or click to select'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      PDF, PNG, or JPEG (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Document Name *</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Jurisdiction */}
          <div>
            <label className="block text-sm font-medium mb-2">Jurisdiction (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {jurisdictions.map((jur) => (
                <button
                  key={jur}
                  type="button"
                  onClick={() => handleJurisdictionToggle(jur)}
                  disabled={uploading}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    jurisdiction.includes(jur)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {jur}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or comments"
              rows={3}
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-medium text-purple-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Upload Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Upload Successful</p>
                <p className="text-sm text-green-700 mt-1">Document has been uploaded successfully</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !documentName.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
