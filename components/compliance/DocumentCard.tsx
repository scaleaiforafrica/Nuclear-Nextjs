'use client';

import { Eye, Download, Trash2, FileText } from 'lucide-react';
import type { ComplianceDocument } from '@/models/compliance-document.model';
import { getStatusColor, formatFileSize } from '@/models/compliance-document.model';

interface DocumentCardProps {
  document: ComplianceDocument;
  onView?: (document: ComplianceDocument) => void;
  onDownload?: (document: ComplianceDocument) => void;
  onDelete?: (document: ComplianceDocument) => void;
}

export function DocumentCard({
  document,
  onView,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  const statusColor = getStatusColor(document.status);

  return (
    <div className={`${statusColor.bg} border ${statusColor.border} rounded-xl p-4`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 ${statusColor.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <FileText className={`w-5 h-5 ${statusColor.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{document.document_name}</h4>
            <p className="text-xs text-gray-600 truncate">{document.file_name}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`px-2 py-1 text-xs rounded-lg ${statusColor.bg} ${statusColor.text} ${statusColor.border} border capitalize flex-shrink-0 ml-2`}>
          {document.status}
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-1 mb-3 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>Type:</span>
          <span className="font-medium text-gray-900 truncate ml-2">{document.document_type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Size:</span>
          <span className="font-medium text-gray-900">{formatFileSize(document.file_size)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Uploaded:</span>
          <span className="font-medium text-gray-900">
            {new Date(document.created_at).toLocaleDateString()}
          </span>
        </div>
        {document.expiry_date && (
          <div className="flex items-center justify-between">
            <span>Expires:</span>
            <span className="font-medium text-gray-900">
              {new Date(document.expiry_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        {onView && (
          <button
            onClick={() => onView(document)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            title="View"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        )}
        {onDownload && (
          <button
            onClick={() => onDownload(document)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            title="Download"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(document)}
            className="px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
