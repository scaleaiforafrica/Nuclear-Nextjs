'use client';

import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { generatePreviewUrl, downloadDocument } from '@/services/compliance-document.service';
import type { ComplianceDocument } from '@/models/compliance-document.model';

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: ComplianceDocument | null;
}

export function DocumentPreviewDialog({
  isOpen,
  onClose,
  document,
}: DocumentPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (isOpen && document) {
      loadPreview();
    } else {
      // Reset state when closing
      setPreviewUrl(null);
      setError(null);
      setZoom(100);
    }
  }, [isOpen, document]);

  const loadPreview = async () => {
    if (!document) return;

    setLoading(true);
    setError(null);

    try {
      const url = await generatePreviewUrl(document.id);
      setPreviewUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      await downloadDocument(document.id, document.file_name);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  if (!isOpen || !document) return null;

  const isPDF = document.file_type === 'application/pdf';
  const isImage = document.file_type.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isPDF ? (
              <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold truncate">{document.document_name}</h2>
              <p className="text-sm text-gray-600 truncate">{document.file_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Zoom Controls for images */}
            {isImage && previewUrl && (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
              </>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium mb-2">Failed to load preview</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={loadPreview}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && previewUrl && (
            <>
              {isPDF && (
                <div className="bg-white rounded-lg overflow-hidden shadow-lg h-full">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title={document.document_name}
                  />
                </div>
              )}

              {isImage && (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={previewUrl}
                    alt={document.document_name}
                    style={{ maxWidth: `${zoom}%`, maxHeight: `${zoom}%` }}
                    className="object-contain shadow-lg rounded-lg"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with metadata */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Type:</span>
              <p className="font-medium truncate">{document.document_type}</p>
            </div>
            <div>
              <span className="text-gray-600">Size:</span>
              <p className="font-medium">
                {(document.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium capitalize">{document.status}</p>
            </div>
            <div>
              <span className="text-gray-600">Uploaded:</span>
              <p className="font-medium">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
