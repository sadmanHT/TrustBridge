'use client';

import React, { useState, useCallback } from 'react';
import { useContractRead } from 'wagmi';
import { Upload, FileText, Hash, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Camera, Scan } from 'lucide-react';
import Link from 'next/link';
import { contractConfig } from '@/lib/contract';
import { generateFileHash } from '@/lib/crypto';

interface VerificationResult {
  issuer: string;
  valid: boolean;
  cidOrEmpty: string;
  timestamp?: number;
  fileName?: string;
}

export default function VerifierPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'qr'>('file');
  const [isVerifying, setIsVerifying] = useState(false);

  // Contract read for verification
  const { data: contractResult, isLoading: isVerifyingContract } = useContractRead({
    ...contractConfig,
    functionName: 'getCredentialDetails',
    args: [fileHash as `0x${string}`],
    query: {
      enabled: !!fileHash && fileHash.length === 66, // 0x + 64 hex chars
    },
  });

  // Handle contract result changes
  React.useEffect(() => {
    if (contractResult && Array.isArray(contractResult) && contractResult.length === 4) {
      const [issuer, valid, cidOrEmpty, timestamp] = contractResult;
      
      // Type guard to ensure proper types
      if (typeof issuer === 'string' && 
          typeof valid === 'boolean' && 
          typeof cidOrEmpty === 'string' && 
          (typeof timestamp === 'bigint' || typeof timestamp === 'number')) {
        setVerificationResult({
          issuer,
          valid,
          cidOrEmpty,
          timestamp: typeof timestamp === 'bigint' ? Number(timestamp) : timestamp,
          fileName: selectedFile?.name,
        });
        setIsVerifying(false);
      }
    }
  }, [contractResult, selectedFile?.name]);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsHashing(true);
    setVerificationResult(null);
    
    try {
      const hash = await generateFileHash(file);
      setFileHash(hash);
      setIsVerifying(true);
    } catch (error) {
      console.error('Error generating hash:', error);
      alert('Error generating file hash');
      setIsHashing(false);
    } finally {
      setIsHashing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleQRVerification = () => {
    try {
      // Try to parse as JSON (QR code from issuer)
      const qrData = JSON.parse(qrInput);
      if (qrData.hash) {
        setFileHash(qrData.hash);
        setSelectedFile(null);
        setVerificationResult(null);
        setIsVerifying(true);
        return;
      }
    } catch {
      // If not JSON, treat as direct hash
      if (qrInput.startsWith('0x') && qrInput.length === 66) {
        setFileHash(qrInput);
        setSelectedFile(null);
        setVerificationResult(null);
        setIsVerifying(true);
        return;
      }
    }
    
    alert('Invalid QR code or hash format');
  };

  const resetVerification = () => {
    setSelectedFile(null);
    setFileHash('');
    setVerificationResult(null);
    setQrInput('');
    setIsVerifying(false);
  };

  const getStatusDisplay = () => {
    if (!verificationResult) return null;
    
    const { issuer, valid } = verificationResult;
    
    if (issuer === '0x0000000000000000000000000000000000000000') {
      return (
        <div className="status-not-verified flex items-center space-x-2">
          <XCircle className="w-4 h-4" />
          <span>❌ NOT VERIFIED - Document not found on blockchain</span>
        </div>
      );
    }
    
    if (!valid) {
      return (
        <div className="status-revoked flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>⚠️ REVOKED - Document was revoked or issuer not approved</span>
        </div>
      );
    }
    
    return (
      <div className="status-verified flex items-center space-x-2">
        <CheckCircle className="w-4 h-4" />
        <span>✅ VERIFIED</span>
      </div>
    );
  };

  return (
    <div className="bg-page bg-verifier">
      <div className="content-overlay space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">🔍 Document Verifier</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Verification Input */}
        <div className="card-enhanced">
          <h2 className="text-xl font-semibold mb-4">Verify Document</h2>
          
          {/* Tab Selection */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'file'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'qr'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Scan className="w-4 h-4 inline mr-2" />
              Scan QR / Hash
            </button>
          </div>
          
          {activeTab === 'file' ? (
            /* File Upload Tab */
            <div className="space-y-4">
              <div
                className="file-upload-area"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('verify-file-input')?.click()}
              >
                <input
                  id="verify-file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-primary-600 mx-auto" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-gray-200">Drop a file here or click to select</p>
                    <p className="text-sm text-gray-300">
                      Upload the document you want to verify
                    </p>
                  </div>
                )}
              </div>
              
              {selectedFile && (
                <div>
                  <label className="label">Generated Hash</label>
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={isHashing ? 'Generating hash...' : fileHash}
                      readOnly
                      className="input font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* QR/Hash Input Tab */
            <div className="space-y-4">
              <div>
                <label className="label">QR Code Data or Document Hash</label>
                <textarea
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Paste QR code data or enter document hash (0x...)"  
                  className="input h-24 resize-none font-mono text-sm"
                />
              </div>
              
              <button
                onClick={handleQRVerification}
                disabled={!qrInput.trim()}
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Scan className="w-4 h-4" />
                <span>Verify from QR/Hash</span>
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Or use your camera to scan QR code</p>
                <button className="btn btn-secondary flex items-center space-x-2 mx-auto">
                  <Camera className="w-4 h-4" />
                  <span>Open Camera Scanner</span>
                </button>
                <p className="text-xs text-gray-300 mt-1">
                  Camera scanner coming soon
                </p>
              </div>
            </div>
          )}
          
          {(isHashing || isVerifying || isVerifyingContract) && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <div className="spinner"></div>
              <span className="text-gray-200">
                {isHashing ? 'Generating hash...' : 'Verifying on blockchain...'}
              </span>
            </div>
          )}
        </div>
        
        {/* Verification Results */}
        <div className="card-enhanced">
          <h2 className="text-xl font-semibold mb-4">Verification Results</h2>
          
          {!verificationResult ? (
            <div className="text-center py-12 text-gray-300">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Upload a document or scan QR code to verify</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div className="text-center">
                {getStatusDisplay()}
              </div>
              
              {/* Document Info */}
              {verificationResult.fileName && (
                <div>
                  <label className="label">Document</label>
                  <p className="text-gray-900 font-medium">{verificationResult.fileName}</p>
                </div>
              )}
              
              {/* Hash */}
              <div>
                <label className="label">Document Hash</label>
                <p className="text-gray-700 font-mono text-sm break-all bg-gray-50 p-2 rounded">
                  {fileHash}
                </p>
              </div>
              
              {/* Issuer */}
              {verificationResult.issuer !== '0x0000000000000000000000000000000000000000' && (
                <div>
                  <label className="label">Issued By</label>
                  <p className="text-gray-700 font-mono text-sm break-all bg-gray-50 p-2 rounded">
                    {verificationResult.issuer}
                  </p>
                </div>
              )}
              
              {/* Timestamp */}
              {verificationResult.timestamp && verificationResult.timestamp > 0 && (
                <div>
                  <label className="label">Issued Date</label>
                  <p className="text-gray-700">
                    {new Date(verificationResult.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
              )}
              
              {/* IPFS CID */}
              {verificationResult.cidOrEmpty && (
                <div>
                  <label className="label">IPFS Document</label>
                  <p className="text-gray-700 font-mono text-sm break-all bg-gray-50 p-2 rounded">
                    {verificationResult.cidOrEmpty}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <a
                      href={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}${verificationResult.cidOrEmpty}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary text-sm flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Document</span>
                    </a>
                    <a
                      href={`https://ipfs.io/ipfs/${verificationResult.cidOrEmpty}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                    >
                      View on IPFS →
                    </a>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={resetVerification}
                  className="btn btn-secondary flex-1"
                >
                  Verify Another
                </button>
                
                {verificationResult.issuer !== '0x0000000000000000000000000000000000000000' && (
                  <a
                    href={`https://sepolia.etherscan.io/address/${verificationResult.issuer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary flex-1 text-center"
                  >
                    View Issuer
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Info Section */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How Verification Works</h3>
        <div className="text-blue-700 text-sm space-y-1">
          <p>• Upload a document to generate its SHA-256 hash</p>
          <p>• The system checks if this hash exists on the Ethereum Sepolia blockchain</p>
          <p>• If found, it verifies the issuer is approved and the credential is not revoked</p>
          <p>• QR codes contain document metadata for quick verification</p>
        </div>
      </div>
      </div>
    </div>
  );
}