'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { Upload, Hash, CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink, Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import contractConfig from '@/contractConfig.json';
import { sha256 } from '@/lib/sha256';
import { getIPFSGatewayUrl, isValidCID } from '../../lib/ipfs';

// Known issuer addresses mapping
const KNOWN_ISSUERS: Record<string, string> = {
  '0x1234567890123456789012345678901234567890': 'University of Technology',
  '0x2345678901234567890123456789012345678901': 'Professional Certification Board',
  '0x3456789012345678901234567890123456789012': 'Skills Academy',
  // Add more known issuers here
};

interface VerificationResult {
  issuer: string;
  valid: boolean;
  cid: string;
}

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // State management
  const [inputMethod, setInputMethod] = useState<'file' | 'hash' | 'qr'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [credentialHash, setCredentialHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [verificationHash, setVerificationHash] = useState('');
  
  // QR Scanner refs
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  // Load hash from URL params on mount
  useEffect(() => {
    const hashFromUrl = searchParams.get('hash');
    if (hashFromUrl) {
      setCredentialHash(hashFromUrl);
      setVerificationHash(hashFromUrl);
      setInputMethod('hash');
    }
  }, [searchParams]);

  // Contract read for verification
  const { data: verificationResult, isLoading: isVerifying, error: verificationError } = useReadContract({
    address: contractConfig.address as `0x${string}`,
    abi: contractConfig.abi,
    functionName: 'verifyCredential',
    args: verificationHash ? [verificationHash as `0x${string}`] : undefined,
    query: {
      enabled: !!verificationHash && verificationHash.length === 66, // 0x + 64 hex chars
    },
  });

  // File upload and hashing
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsHashing(true);
    setCredentialHash('');
    setVerificationHash('');
    
    try {
      const hash = await sha256(file);
      setCredentialHash(hash);
      setVerificationHash(hash);
      toast({
        title: "File processed",
        description: "SHA-256 hash generated successfully",
      });
    } catch (error) {
      console.error('Error hashing file:', error);
      toast({
        title: "Error",
        description: "Failed to generate file hash",
        variant: "destructive",
      });
    } finally {
      setIsHashing(false);
    }
  }, [toast]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle hash input verification
  const handleHashVerification = () => {
    if (!credentialHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter a credential hash",
        variant: "destructive",
      });
      return;
    }
    
    if (!credentialHash.startsWith('0x') || credentialHash.length !== 66) {
      toast({
        title: "Error",
        description: "Invalid hash format. Hash should be 0x followed by 64 hex characters",
        variant: "destructive",
      });
      return;
    }
    
    setVerificationHash(credentialHash);
    setSelectedFile(null);
  };

  // QR Scanner functions
  const startQRScanner = () => {
    setShowQRScanner(true);
    setTimeout(() => {
      if (qrReaderRef.current) {
        qrScannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        
        qrScannerRef.current.render(
          (decodedText) => {
            // Try to extract hash from QR code
            let extractedHash = '';
            
            try {
              // Check if it's a URL with hash parameter
              const url = new URL(decodedText);
              extractedHash = url.searchParams.get('hash') || '';
            } catch {
              // Check if it's JSON with hash property
              try {
                const qrData = JSON.parse(decodedText);
                extractedHash = qrData.hash || '';
              } catch {
                // Treat as direct hash if it looks like one
                if (decodedText.startsWith('0x') && decodedText.length === 66) {
                  extractedHash = decodedText;
                }
              }
            }
            
            if (extractedHash) {
              setCredentialHash(extractedHash);
              setVerificationHash(extractedHash);
              setInputMethod('hash');
              setSelectedFile(null);
              stopQRScanner();
              toast({
                title: "QR Code scanned",
                description: "Hash extracted successfully",
              });
            } else {
              toast({
                title: "Error",
                description: "No valid hash found in QR code",
                variant: "destructive",
              });
            }
          },
          (error) => {
            console.warn('QR scan error:', error);
          }
        );
      }
    }, 100);
  };

  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear();
      qrScannerRef.current = null;
    }
    setShowQRScanner(false);
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copied",
          description: `${label} copied to clipboard`,
        });
      }).catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Error",
        description: "Clipboard not available",
        variant: "destructive",
      });
    }
  };

  // Get issuer display name
  const getIssuerName = (address: string) => {
    return KNOWN_ISSUERS[address.toLowerCase()] || address;
  };

  // Reset verification
  const resetVerification = () => {
    setSelectedFile(null);
    setCredentialHash('');
    setVerificationHash('');
    setInputMethod('file');
  };

  // Parse verification result
  const result = verificationResult as VerificationResult | undefined;
  const isNotFound = result && result.issuer === '0x0000000000000000000000000000000000000000';
  const isRevoked = result && !isNotFound && !result.valid;
  const isVerified = result && !isNotFound && result.valid;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Verify Credential</h1>
        <p className="text-gray-600">Verify the authenticity of a credential using multiple input methods</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Input Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Method Selection */}
            <div className="flex space-x-2">
              <Button
                variant={inputMethod === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('file')}
              >
                <Upload className="w-4 h-4 mr-2" />
                File Upload
              </Button>
              <Button
                variant={inputMethod === 'hash' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('hash')}
              >
                <Hash className="w-4 h-4 mr-2" />
                Hash Input
              </Button>
              <Button
                variant={inputMethod === 'qr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setInputMethod('qr');
                  if (!showQRScanner) startQRScanner();
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan QR
              </Button>
            </div>

            {/* File Upload */}
            {inputMethod === 'file' && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Drop a file here or click to select</p>
                      <p className="text-sm text-gray-500">PDF, DOC, TXT, or image files</p>
                    </div>
                  )}
                </div>
                
                {selectedFile && (
                  <div className="space-y-2">
                    <Label>Generated Hash</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={isHashing ? 'Generating hash...' : credentialHash}
                        readOnly
                        className="font-mono text-sm"
                      />
                      {credentialHash && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(credentialHash, 'Hash')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hash Input */}
            {inputMethod === 'hash' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Credential Hash</Label>
                  <Input
                    value={credentialHash}
                    onChange={(e) => setCredentialHash(e.target.value)}
                    placeholder="0x..."
                    className="font-mono"
                  />
                  <p className="text-sm text-gray-500">
                    Enter the 64-character hash (with 0x prefix) or paste from URL
                  </p>
                </div>
                
                <Button
                  onClick={handleHashVerification}
                  disabled={!credentialHash.trim()}
                  className="w-full"
                >
                  Verify Hash
                </Button>
              </div>
            )}

            {/* QR Scanner */}
            {inputMethod === 'qr' && (
              <div className="space-y-4">
                {showQRScanner ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>QR Code Scanner</Label>
                      <Button size="sm" variant="outline" onClick={stopQRScanner}>
                        <X className="w-4 h-4 mr-2" />
                        Close Scanner
                      </Button>
                    </div>
                    <div id="qr-reader" ref={qrReaderRef} className="w-full"></div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Click to start QR code scanner</p>
                    <Button onClick={startQRScanner}>
                      <Camera className="w-4 h-4 mr-2" />
                      Start Scanner
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {(isHashing || isVerifying) && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">
                  {isHashing ? 'Generating hash...' : 'Verifying on blockchain...'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Results */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Result</CardTitle>
          </CardHeader>
          <CardContent>
            {!verificationHash ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select an input method to verify a credential</p>
              </div>
            ) : verificationError ? (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">Verification Error</h3>
                <p className="text-red-600">Failed to verify credential on blockchain</p>
              </div>
            ) : !result ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Verifying credential...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Display */}
                <div className="text-center">
                  {isNotFound && (
                    <div className="space-y-2">
                      <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                      <h3 className="text-2xl font-bold text-red-700">❌ NOT VERIFIED</h3>
                      <p className="text-red-600">Credential not found on blockchain</p>
                    </div>
                  )}
                  
                  {isRevoked && (
                    <div className="space-y-2">
                      <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />
                      <h3 className="text-2xl font-bold text-yellow-700">⚠️ REVOKED</h3>
                      <p className="text-yellow-600">
                        Revoked by {getIssuerName(result.issuer)}
                      </p>
                    </div>
                  )}
                  
                  {isVerified && (
                    <div className="space-y-2">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                      <h3 className="text-2xl font-bold text-green-700">✅ VERIFIED</h3>
                      <p className="text-green-600">Credential is authentic and valid</p>
                    </div>
                  )}
                </div>

                {/* Credential Details */}
                {!isNotFound && (
                  <div className="space-y-4">
                    {/* Hash */}
                    <div className="space-y-2">
                      <Label>Document Hash</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={verificationHash}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(verificationHash, 'Hash')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Issuer */}
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Input
                            value={result.issuer}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(result.issuer, 'Issuer address')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={`https://sepolia.etherscan.io/address/${result.issuer}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                        {KNOWN_ISSUERS[result.issuer.toLowerCase()] && (
                          <Badge variant="secondary">
                            {KNOWN_ISSUERS[result.issuer.toLowerCase()]}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* IPFS CID */}
                    {result.cid && (
                      <div className="space-y-2">
                        <Label>IPFS Document</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={result.cid}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(result.cid, 'IPFS CID')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a
                              href={getIPFSGatewayUrl(result.cid)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                          ⚠️ <strong>Demo Privacy Note:</strong> Files are stored publicly on IPFS for demonstration. In production, encrypt files or use access-controlled storage.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button onClick={resetVerification} variant="outline" className="flex-1">
                    Verify Another
                  </Button>
                  {isVerified && (
                    <Button
                      onClick={() => {
                        const verifyUrl = `${window.location.origin}/verify?hash=${verificationHash}`;
                        copyToClipboard(verifyUrl, 'Verification URL');
                      }}
                      className="flex-1"
                    >
                      Share Verification
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How Verification Works</h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>• <strong>File Upload:</strong> Computes SHA-256 hash and verifies against blockchain</p>
            <p>• <strong>Hash Input:</strong> Directly verify a known credential hash</p>
            <p>• <strong>QR Scanner:</strong> Scan QR codes containing verification URLs or hash data</p>
            <p>• <strong>URL Parameters:</strong> Share verification links with ?hash=... parameter</p>
            <p>• All verification is performed on the Ethereum Sepolia testnet</p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="mt-4 bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">🔒 Privacy Notice</h3>
          <div className="text-amber-700 text-sm space-y-2">
            <p>• Your files are processed locally in your browser - they are never uploaded to our servers</p>
            <p>• Only the SHA-256 hash is used for blockchain verification</p>
            <p>• IPFS documents are stored on a decentralized network and may be publicly accessible</p>
            <p>• Verification results are fetched directly from the blockchain</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}