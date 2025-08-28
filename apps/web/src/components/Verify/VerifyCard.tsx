'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Search, Upload, Hash, QrCode, XCircle, AlertCircle, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { QRScanner } from '@/components/ui/QR';
import { CopyField } from '@/components/ui/Copy';
import { HashField } from '@/components/ui/Field';
import { hashFile, isValidSHA256Hash } from '@/lib/sha256';
import { verifyCredential, VerificationResult } from '@/lib/contract';
import { formatTimestamp, formatFileSize, getIPFSUrl } from '@/lib/format';
import { getEtherscanUrl } from '@/lib/viem';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { VerifySuccess } from './VerifySuccess';
import { bumpVerificationSuccess } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

interface VerifyCardProps {
  className?: string;
  initialHash?: string;
  onVerificationComplete?: (result: VerificationResult & { hash: string }) => void;
}

type VerifyMode = 'file' | 'hash' | 'qr';
type VerifyState = 'idle' | 'processing' | 'success' | 'invalid' | 'error';

interface VerificationData extends VerificationResult {
  hash: string;
  timestamp?: number;
}

export function VerifyCard({ className, initialHash, onVerificationComplete }: VerifyCardProps) {
  const [mode, setMode] = useState<VerifyMode>('file');
  const [state, setState] = useState<VerifyState>('idle');
  const [hashInput, setHashInput] = useState(initialHash || '');
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setState('idle');
    setVerificationData(null);
    setError('');
    setSelectedFile(null);
  }, []);

  const performVerification = useCallback(async (hash: string) => {
    if (!isValidSHA256Hash(hash)) {
      setError('Invalid hash format. Expected 0x followed by 64 hex characters.');
      setState('error');
      return;
    }

    try {
      setState('processing');
      setError('');
      
      const result = await verifyCredential(hash as `0x${string}`);
      
      const verificationData: VerificationData = {
        ...result,
        hash,
        timestamp: Date.now()
      };
      
      setVerificationData(verificationData);
      
      if (result.valid && result.issuer !== '0x0000000000000000000000000000000000000000') {
        setState('success');
        // Track successful verification and show success toast
        bumpVerificationSuccess(hash as `0x${string}`);
        toast({
          title: "Verification successful",
          description: "Document has been verified on the blockchain",
          variant: "default"
        });
      } else {
        setState('invalid');
        // Show warning toast for invalid/revoked credentials
        toast({
          title: "Not found / Revoked",
          description: "Document was not found or has been revoked",
          variant: "destructive"
        });
      }
      
      onVerificationComplete?.(verificationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify credential';
      setError(errorMessage);
      setState('error');
    }
  }, [onVerificationComplete, toast]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setState('processing');
      setSelectedFile(file);
      setError('');
      
      const hash = await hashFile(file);
      await performVerification(hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      setState('error');
    }
  }, [performVerification]);

  const handleHashSubmit = useCallback(() => {
    if (!hashInput.trim()) {
      setError('Please enter a document hash');
      setState('error');
      return;
    }
    performVerification(hashInput.trim());
  }, [hashInput, performVerification]);

  const handleQRScan = useCallback((data: string) => {
    setShowQRScanner(false);
    
    // Try to extract hash from URL or use data directly
    let hash = data;
    
    try {
      const url = new URL(data);
      const hashParam = url.searchParams.get('hash');
      if (hashParam) {
        hash = hashParam;
      }
    } catch {
      // Not a URL, use data as-is
    }
    
    if (isValidSHA256Hash(hash)) {
      setHashInput(hash);
      setMode('hash');
      performVerification(hash);
    } else {
      setError('QR code does not contain a valid document hash');
      setState('error');
    }
  }, [performVerification]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const renderFileUpload = () => (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer backdrop-blur-sm",
          isDragOver 
            ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/25" 
            : "border-white/20 hover:border-white/40 hover:bg-white/5",
          state === 'processing' && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={cn(
          "mx-auto h-12 w-12 mb-4 transition-colors",
          isDragOver ? "text-blue-400" : "text-slate-400"
        )} />
        <p className="text-lg font-medium text-white mb-2">
          Drop your document here or click to browse
        </p>
        <p className="text-sm text-slate-400">
          Upload the same file you want to verify
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
        />
      </div>
      
      {selectedFile && (
        <div className="flex items-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <FileText className="h-8 w-8 text-blue-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-slate-400">
              {formatFileSize(selectedFile.size)} • {selectedFile.type}
            </p>
          </div>
          {state === 'processing' && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <span className="text-xs text-slate-400">Processing...</span>
            </div>
          )}
        </div>
      )}
      
      {state === 'processing' && !verificationData && (
        <div className="space-y-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-sm text-slate-300">Computing file hash and verifying...</span>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}
    </div>
  );

  const renderHashInput = () => (
    <div className="space-y-4">
      <HashField
        value={hashInput}
        onChange={setHashInput}
        placeholder="Enter document hash (0x...)"
      />
      
      <Button 
        onClick={handleHashSubmit}
        disabled={!hashInput.trim() || state === 'processing'}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'processing' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Verify Hash
          </>
        )}
      </Button>
    </div>
  );

  const renderQRScanner = () => (
    <div className="space-y-4">
      {!showQRScanner ? (
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4">
            <QrCode className="h-10 w-10 text-slate-400" />
          </div>
          <p className="text-lg font-medium text-white mb-2">
            Scan QR Code
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Scan a QR code from a TrustBridge credential
          </p>
          <Button 
            onClick={() => setShowQRScanner(true)} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Open Camera
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <QRScanner
            onScan={handleQRScan}
            onError={(error) => {
              setError(`QR Scanner Error: ${error}`);
              setState('error');
              setShowQRScanner(false);
            }}
          />
          <Button 
            variant="outline" 
            onClick={() => setShowQRScanner(false)}
            className="w-full"
          >
            Cancel Scan
          </Button>
        </div>
      )}
    </div>
  );

  const renderVerificationResult = () => {
    if (!verificationData) return null;

    const isValid = state === 'success';
    const isInvalid = state === 'invalid';
    
    // Determine if credential is revoked vs not found
    const isRevoked = verificationData.issuer !== '0x0000000000000000000000000000000000000000' && !verificationData.valid;
    const isNotFound = verificationData.issuer === '0x0000000000000000000000000000000000000000';
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          {isValid && (
            <VerifySuccess
              issuer={verificationData.issuer}
              cid={verificationData.cidOrEmpty}
              hash={verificationData.hash}
            />
          )}
          
          {isInvalid && isRevoked && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">
                ⚠️ Revoked
              </h3>
              <p className="text-slate-400">
                This credential has been revoked by the issuer
              </p>
            </>
          )}
          
          {isInvalid && isNotFound && (
            <>
              <div className="mx-auto h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">
                ❌ Not Found
              </h3>
              <p className="text-slate-400">
                This document was not found on the blockchain
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Document Hash</label>
              <CopyField 
                label="Hash"
                value={verificationData.hash} 
                className="font-mono text-xs"
                truncate={true}
                maxLength={20}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="flex items-center space-x-2">
                <Badge variant={isValid ? "default" : "destructive"}>
                  {isValid ? 'Valid' : 'Invalid/Revoked'}
                </Badge>
                {verificationData.timestamp && (
                  <span className="text-xs text-gray-500">
                    Verified {formatTimestamp(verificationData.timestamp)}
                  </span>
                )}
              </div>
            </div>
            
            {verificationData.issuer !== '0x0000000000000000000000000000000000000000' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Issuer</label>
                <div className="flex items-center space-x-2">
                  <CopyField 
                    label="Address"
                    value={verificationData.issuer} 
                    className="font-mono text-xs"
                    truncate={true}
                    maxLength={10}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getEtherscanUrl(verificationData.issuer, 'address'), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            {verificationData.cidOrEmpty && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">IPFS Storage</label>
                <div className="flex items-center space-x-2">
                  <CopyField 
                    label="CID"
                    value={verificationData.cidOrEmpty} 
                    className="font-mono text-xs"
                    truncate={true}
                    maxLength={15}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getIPFSUrl(verificationData.cidOrEmpty), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Button onClick={resetState} variant="outline" className="w-full">
          Verify Another Document
        </Button>
      </div>
    );
  };

  const renderError = () => (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <Button onClick={resetState} variant="outline" className="w-full">
        Try Again
      </Button>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="mx-auto h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
      </div>
      <p className="text-lg font-medium text-white mb-2">
        Verifying Document...
      </p>
      <p className="text-sm text-slate-400">
        Checking blockchain for credential validity
      </p>
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {state === 'processing' && renderProcessing()}
      
      {(state === 'success' || state === 'invalid') && renderVerificationResult()}
      
      {state === 'error' && renderError()}
      
      {state === 'idle' && (
        <div className="space-y-6">
          {/* Custom Pill Tabs */}
          <div className="flex space-x-1 p-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <button
              onClick={() => setMode('file')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                mode === 'file'
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Verify by File
            </button>
            <button
              onClick={() => setMode('hash')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                mode === 'hash'
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Hash className="w-4 h-4 mr-2 inline" />
              Verify by Hash
            </button>
            <button
              onClick={() => setMode('qr')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                mode === 'qr'
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <QrCode className="w-4 h-4 mr-2 inline" />
              Verify by QR Scan
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="mt-6">
            {mode === 'file' && renderFileUpload()}
            {mode === 'hash' && renderHashInput()}
            {mode === 'qr' && renderQRScanner()}
          </div>
        </div>
      )}
    </div>
  );
}