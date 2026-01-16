'use client';

import { Shield, CheckCircle, AlertTriangle, Loader2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChainVerificationResult } from '@/models/blockchain.model';

interface VerifyShipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
}

export function VerifyShipmentDialog({ isOpen, onClose, shipmentId }: VerifyShipmentDialogProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    setError(null);
    
    try {
      const response = await fetch(`/api/traceability/shipments/${shipmentId}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to verify chain');
      }

      const data = await response.json();
      
      // Parse dates
      const result: ChainVerificationResult = {
        ...data.data,
        firstEvent: new Date(data.data.firstEvent),
        lastEvent: new Date(data.data.lastEvent),
        verifiedAt: new Date(data.data.verifiedAt),
      };

      setVerificationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setVerificationResult(null);
    setError(null);
    onClose();
  };

  const isSuccess = verificationResult?.isValid === true;
  const isFailed = verificationResult?.isValid === false || error !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify Shipment on Blockchain</DialogTitle>
          <DialogDescription>
            Verify the authenticity and integrity of shipment {shipmentId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isVerifying ? 'bg-blue-100' :
              isSuccess ? 'bg-green-100' :
              isFailed ? 'bg-red-100' :
              'bg-purple-100'
            }`}>
              {isVerifying ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : isFailed ? (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              ) : (
                <Shield className="w-8 h-8 text-purple-600" />
              )}
            </div>

            {!isVerifying && !verificationResult && !error && (
              <>
                <h3 className="font-medium mb-2">Blockchain Verification</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click verify to check this shipment against the Hyperledger Fabric blockchain
                </p>
              </>
            )}

            {isVerifying && (
              <>
                <h3 className="font-medium mb-2">Verifying...</h3>
                <p className="text-sm text-gray-600">
                  Checking blockchain records
                </p>
              </>
            )}

            {isSuccess && (
              <>
                <h3 className="font-medium text-green-900 mb-2">Verification Successful</h3>
                <p className="text-sm text-green-700">
                  All shipment events have been verified on the blockchain
                </p>
              </>
            )}

            {isFailed && (
              <>
                <h3 className="font-medium text-red-900 mb-2">Verification Failed</h3>
                <p className="text-sm text-red-700">
                  {error || 'Chain integrity compromised. See details below.'}
                </p>
              </>
            )}
          </div>

          {verificationResult && isSuccess && (
            <div className="space-y-3 border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900">Verified Data</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{verificationResult.eventCount} events verified on chain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>All timestamps verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>All hashes valid</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No tampering detected</span>
                </div>
              </div>
            </div>
          )}

          {verificationResult && isFailed && (
            <div className="space-y-3 border border-red-200 bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900">Verification Issues</h4>
              <div className="space-y-2 text-sm text-red-700">
                {verificationResult.brokenLinks.length > 0 && (
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{verificationResult.brokenLinks.length} broken chain link(s)</span>
                  </div>
                )}
                {verificationResult.invalidHashes.length > 0 && (
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{verificationResult.invalidHashes.length} invalid hash(es)</span>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-red-200">
                  <p className="text-xs">Events verified: {verificationResult.eventCount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> Blockchain verification provides cryptographic proof 
              that shipment data has not been tampered with and all events were recorded 
              in the correct sequence.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} className="min-h-[44px]">
            Close
          </Button>
          {!verificationResult && !error && (
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="flex items-center gap-2 min-h-[44px]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify on Blockchain
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
