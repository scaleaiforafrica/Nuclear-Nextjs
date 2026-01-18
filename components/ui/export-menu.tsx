'use client';

import { useState } from 'react';
import { Download, Share2, Mail, Loader2, FileText, FileSpreadsheet, FileJson, Cloud, LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json';
export type ShareDestination = 'email' | 'google-drive' | 'dropbox' | 'onedrive' | 'sharepoint';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => Promise<void> | void;
  onShare?: (destination: ShareDestination) => Promise<void> | void;
  formats?: ExportFormat[];
  shareDestinations?: ShareDestination[];
  disabled?: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  showShareOptions?: boolean;
}

const formatIcons: Record<ExportFormat, LucideIcon> = {
  pdf: FileText,
  csv: FileSpreadsheet,
  excel: FileSpreadsheet,
  json: FileJson,
};

const formatLabels: Record<ExportFormat, string> = {
  pdf: 'Export as PDF',
  csv: 'Export as CSV',
  excel: 'Export as Excel',
  json: 'Export as JSON',
};

const shareIcons: Record<ShareDestination, LucideIcon> = {
  email: Mail,
  'google-drive': Cloud,
  dropbox: Cloud,
  onedrive: Cloud,
  sharepoint: Cloud,
};

const shareLabels: Record<ShareDestination, string> = {
  email: 'Send via Email',
  'google-drive': 'Save to Google Drive',
  dropbox: 'Save to Dropbox',
  onedrive: 'Save to OneDrive',
  sharepoint: 'Upload to SharePoint',
};

export function ExportMenu({
  onExport,
  onShare,
  formats = ['pdf', 'csv', 'excel'],
  shareDestinations = ['email', 'google-drive', 'dropbox', 'onedrive'],
  disabled = false,
  buttonText = 'Export',
  buttonVariant = 'default',
  showShareOptions = true,
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async (destination: ShareDestination) => {
    if (!onShare) return;
    
    setIsSharing(true);
    try {
      await onShare(destination);
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share file');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          disabled={disabled || isExporting || isSharing}
          className="min-h-[44px]"
        >
          {isExporting || isSharing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isExporting ? 'Exporting...' : 'Sharing...'}
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {formats.map((format) => {
          const Icon = formatIcons[format];
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting || isSharing}
            >
              <Icon className="w-4 h-4 mr-2" />
              {formatLabels[format]}
            </DropdownMenuItem>
          );
        })}

        {showShareOptions && onShare && shareDestinations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Share To</DropdownMenuLabel>
            {shareDestinations.map((destination) => {
              const Icon = shareIcons[destination];
              return (
                <DropdownMenuItem
                  key={destination}
                  onClick={() => handleShare(destination)}
                  disabled={isExporting || isSharing}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {shareLabels[destination]}
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
