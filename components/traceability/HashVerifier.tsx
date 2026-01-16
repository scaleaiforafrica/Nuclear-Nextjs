'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';

interface HashVerifierProps {
  onVerify?: (result: { valid: boolean; hash: string }) => void;
}

/**
 * Client-side hash generation using Web Crypto API
 */
async function generateHash(data: unknown): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function HashVerifier({ onVerify }: HashVerifierProps) {
  const [data, setData] = useState('');
  const [expectedHash, setExpectedHash] = useState('');
  const [result, setResult] = useState<{ valid: boolean; hash: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!data || !expectedHash) {
      return;
    }

    setIsVerifying(true);
    setResult(null);

    // Simulate async verification with small delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(data);
      } catch {
        // If not valid JSON, treat as string
        parsedData = data;
      }

      const calculatedHash = await generateHash(parsedData);
      const valid = calculatedHash === expectedHash;

      const verificationResult = {
        valid,
        hash: calculatedHash,
      };

      setResult(verificationResult);
      onVerify?.(verificationResult);
    } catch (error) {
      console.error('Hash verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateHash = async () => {
    if (!data) {
      return;
    }

    setIsVerifying(true);
    
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }
      const hash = await generateHash(parsedData);
      setExpectedHash(hash);
    } catch (error) {
      console.error('Hash generation error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg">Hash Verifier</h3>
      </div>

      <div className="space-y-4">
        {/* Data input */}
        <div className="space-y-2">
          <Label htmlFor="data">Data (JSON or text)</Label>
          <Textarea
            id="data"
            placeholder='{"shipmentId": "SH-001", "eventType": "dispatch"}'
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="font-mono text-sm min-h-[120px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateHash}
            disabled={!data || isVerifying}
            className="min-h-[44px]"
          >
            Generate Hash from Data
          </Button>
        </div>

        {/* Expected hash input */}
        <div className="space-y-2">
          <Label htmlFor="expectedHash">Expected Hash</Label>
          <Input
            id="expectedHash"
            placeholder="Enter hash to verify against..."
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            className="font-mono text-sm min-h-[44px]"
          />
        </div>

        {/* Verify button */}
        <Button
          onClick={handleVerify}
          disabled={!data || !expectedHash || isVerifying}
          className="w-full min-h-[44px]"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Verify Hash
            </>
          )}
        </Button>

        {/* Result */}
        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.valid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.valid ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium mb-2 ${
                    result.valid ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.valid ? 'Hash Verified Successfully' : 'Hash Verification Failed'}
                </p>
                <div className="space-y-1 text-sm">
                  <p
                    className={result.valid ? 'text-green-700' : 'text-red-700'}
                  >
                    Calculated Hash:
                  </p>
                  <p
                    className={`font-mono text-xs break-all ${
                      result.valid ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.hash}
                  </p>
                  {!result.valid && (
                    <>
                      <p className="text-red-700 mt-2">Expected Hash:</p>
                      <p className="font-mono text-xs break-all text-red-900">
                        {expectedHash}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

