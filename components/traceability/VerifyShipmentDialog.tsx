'use client';

import { Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface VerifyShipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
}

export function VerifyShipmentDialog({ isOpen, onClose, shipmentId }: VerifyShipmentDialogProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    
    // Simulate blockchain verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock result - in real app, this would verify against blockchain
    const isValid = Math.random() > 0.1; // 90% success rate for demo
    setVerificationResult(isValid ? 'success' : 'failed');
    setIsVerifying(false);
  };

  const handleClose = () => {
    setVerificationResult(null);
    onClose();
  };

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
              verificationResult === 'success' ? 'bg-green-100' :
              verificationResult === 'failed' ? 'bg-red-100' :
              'bg-purple-100'
            }`}>
              {isVerifying ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : verificationResult === 'success' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : verificationResult === 'failed' ? (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              ) : (
                <Shield className="w-8 h-8 text-purple-600" />
              )}
            </div>

            {!isVerifying && !verificationResult && (
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

            {verificationResult === 'success' && (
              <>
                <h3 className="font-medium text-green-900 mb-2">Verification Successful</h3>
                <p className="text-sm text-green-700">
                  All shipment events have been verified on the blockchain
                </p>
              </>
            )}

            {verificationResult === 'failed' && (
              <>
                <h3 className="font-medium text-red-900 mb-2">Verification Failed</h3>
                <p className="text-sm text-red-700">
                  Some events could not be verified. Please contact support.
                </p>
              </>
            )}
          </div>

          {verificationResult === 'success' && (
            <div className="space-y-3 border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900">Verified Data</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>6 events verified on chain</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Timestamps verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Digital signatures valid</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No tampering detected</span>
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
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {!verificationResult && (
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying}
              className="flex items-center gap-2"
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
