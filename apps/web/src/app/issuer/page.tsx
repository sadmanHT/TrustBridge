'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { credentialRegistryConfig } from '../../lib/wagmi';
import { sha256 } from '../../lib/sha256';
import { uploadToIPFS } from '../../lib/ipfs';
import { CheckCircle, XCircle, Upload, FileText, ExternalLink, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface IssuedCredential {
  id: string;
  hash: string;
  cid: string;
  studentName: string;
  degree: string;
  graduationYear: string;
  fileName: string;
  txHash: string;
  timestamp: number;
}

export default function IssuerPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  // Form state
  const [studentName, setStudentName] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [lastIssuedCredential, setLastIssuedCredential] = useState<IssuedCredential | null>(null);
  
  // Check if current user is an approved issuer
  const { data: isApprovedIssuer, isLoading: isCheckingApproval } = useReadContract({
    ...credentialRegistryConfig,
    functionName: 'approvedIssuers',
    args: address ? [address] : undefined,
  });
  
  // Contract write hook
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Load issued credentials from localStorage
  const getIssuedCredentials = (): IssuedCredential[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('issuedCredentials');
    return stored ? JSON.parse(stored) : [];
  };
  
  // Save credential to localStorage
  const saveCredential = (credential: IssuedCredential) => {
    if (typeof window === 'undefined') return;
    const credentials = getIssuedCredentials();
    credentials.unshift(credential);
    localStorage.setItem('issuedCredentials', JSON.stringify(credentials));
  };
  

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    if (isApprovedIssuer !== true) {
      toast({
        title: 'Error',
        description: 'You are not an approved issuer',
        variant: 'destructive',
      });
      return;
    }
    
    setIsProcessing(true);
    let cid = '';
    
    try {
      // Compute SHA-256 hash
      toast({
        title: 'Processing',
        description: 'Computing document hash...',
      });
      
      const docHash = await sha256(file);
      
      // Validate hash format before proceeding
      if (!docHash || !docHash.startsWith('0x') || docHash.length !== 66) {
        throw new Error('Invalid document hash format');
      }
      
      // Upload to IPFS (optional)
      setIsUploadingToIPFS(true);
      toast({
        title: 'Processing',
        description: 'Uploading to IPFS...',
      });
      
      try {
        cid = await uploadToIPFS(file);
        setIpfsCid(cid);
      } catch (ipfsError) {
        console.warn('IPFS upload failed, continuing without CID:', ipfsError);
        toast({
          title: 'Warning',
          description: 'IPFS upload failed, issuing credential without file storage',
          variant: 'default',
        });
      } finally {
        setIsUploadingToIPFS(false);
      }
      
      // Issue credential on blockchain
      toast({
        title: 'Processing',
        description: 'Issuing credential on blockchain...',
      });
      
      try {
          await writeContract({
            ...credentialRegistryConfig,
            functionName: 'issueCredential',
            args: [docHash, cid || ''],
          });
          
          toast({
            title: 'Transaction Submitted',
            description: 'Waiting for blockchain confirmation...',
          });
        } catch (contractError: any) {
        console.error('Contract write error:', contractError);
        
        // Extract meaningful error message
        let errorMessage = 'Transaction failed';
        if (contractError?.message) {
          if (contractError.message.includes('User rejected')) {
            errorMessage = 'Transaction was rejected by user';
          } else if (contractError.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else if (contractError.message.includes('revert')) {
            errorMessage = 'Contract execution failed - check if you are an approved issuer';
          } else {
            errorMessage = contractError.message;
          }
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error: any) {
      console.error('Error processing credential:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to process credential',
        variant: 'destructive',
      });
      setIsProcessing(false);
      setIsUploadingToIPFS(false);
    }
  };
  
  // Handle successful transaction
  if (isConfirmed && hash && file && !lastIssuedCredential?.txHash.includes(hash)) {
    const processSuccess = async () => {
      try {
        const docHash = await sha256(file);
        let cid = ipfsCid;
        
        // Try to get CID if not already set
        if (!cid) {
          try {
            cid = await uploadToIPFS(file);
          } catch (ipfsError) {
            console.warn('IPFS upload failed during success processing:', ipfsError);
            cid = '';
          }
        }
        
        const credential: IssuedCredential = {
          id: Date.now().toString(),
          hash: docHash,
          cid: cid || '',
          studentName,
          degree,
          graduationYear,
          fileName: file.name,
          txHash: hash,
          timestamp: Date.now(),
        };
        
        saveCredential(credential);
        setLastIssuedCredential(credential);
        
        // Reset form
        setStudentName('');
        setDegree('');
        setGraduationYear('');
        setFile(null);
        setIpfsCid(null);
        setIsProcessing(false);
        
        toast({
          title: 'Success!',
          description: 'Credential issued successfully on blockchain',
        });
      } catch (error) {
        console.error('Error processing success:', error);
        setIsProcessing(false);
        toast({
          title: 'Warning',
          description: 'Transaction confirmed but failed to save credential details',
          variant: 'default',
        });
      }
    };
    
    processSuccess();
  }
  
  // Handle transaction error
  if (error) {
    setIsProcessing(false);
    setIsUploadingToIPFS(false);
    
    // Extract meaningful error message
    let errorMessage = 'Transaction failed';
    if (error?.message) {
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.message.includes('revert')) {
        errorMessage = 'Contract execution failed - check if you are an approved issuer';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast({
      title: 'Transaction Failed',
      description: errorMessage,
      variant: 'destructive',
    });
  }
  
  // Handle transaction receipt error
  if (receiptError) {
    setIsProcessing(false);
    setIsUploadingToIPFS(false);
    
    console.error('Transaction receipt error:', receiptError);
    toast({
      title: 'Transaction Failed',
      description: receiptError.message || 'Transaction was reverted or failed',
      variant: 'destructive',
    });
  }
  
  const verificationUrl = lastIssuedCredential && typeof window !== 'undefined'
    ? `${window.location.origin}/verify?hash=${lastIssuedCredential.hash}`
    : '';

  const downloadQRCode = (url: string) => {
    if (typeof window === 'undefined') return;
    
    const element = document.getElementById('qr-code-svg');
    if (!element || !(element instanceof SVGElement)) return;
    const svg = element as SVGElement;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (with some padding)
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Create an image from the SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Fill canvas with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      
      // Draw the QR code image
      ctx.drawImage(img, 0, 0, size, size);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = `credential-qr-${lastIssuedCredential?.id || 'code'}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          
          // Clean up
          URL.revokeObjectURL(link.href);
        }
      }, 'image/png');
      
      // Clean up
      URL.revokeObjectURL(svgUrl);
    };
    
    img.src = svgUrl;
  };

  return (
    <div className="bg-page bg-issuer">
      <div className="content-overlay space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">
          Issuer Dashboard
        </h1>
        <p className="text-lg text-gray-200">
          Issue verifiable credentials on the blockchain
        </p>
      </div>
      
      {/* Wallet Connection */}
      <div className="flex justify-center">
        <ConnectButton />
      </div>
      
      {/* Status Check */}
      {isConnected && (
        <div className="card-enhanced">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>Issuer Status</span>
              {isCheckingApproval ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : isApprovedIssuer ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </h2>
          </div>
          <div>
            {isCheckingApproval ? (
              <p className="text-gray-200">Checking approval status...</p>
            ) : isApprovedIssuer === true ? (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  Approved Issuer
                </Badge>
                <span className="text-sm text-gray-200">
                  You can issue credentials
                </span>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Not Approved
                  </span>
                </div>
                <p className="text-yellow-700 mt-2">
                  Ask the contract admin to approve this issuer address before you can issue credentials.
                </p>
                <p className="text-xs text-gray-300 mt-1 font-mono">
                  Your address: {address}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Issue Credential Form */}
      {isConnected && isApprovedIssuer === true && (
        <div className="card-enhanced">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">📋 Issue New Credential</h2>
            <p className="text-gray-600 mt-2">
              Upload a document and issue a verifiable credential on the blockchain
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="studentName">Student Name (Optional)</Label>
                  <Input
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <Label htmlFor="degree">Degree (Optional)</Label>
                  <Input
                    id="degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Enter degree"
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year (Optional)</Label>
                  <Input
                    id="graduationYear"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="Enter year"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="file">Document (PDF) *</Label>
                <div className="mt-1">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                {file && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  ⚠️ <strong>Privacy Note:</strong> Files will be stored publicly on IPFS for demonstration. In production, encrypt files or use access-controlled storage.
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={!file || isProcessing || isPending || isConfirming}
                className="w-full"
              >
                {isProcessing || isPending || isConfirming ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>
                      {isProcessing ? 'Processing...' : isPending ? 'Confirming...' : 'Waiting for confirmation...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Issue Credential</span>
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Result */}
      {lastIssuedCredential && (
        <div className="card-enhanced border-green-200 bg-green-50/95">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Credential Issued Successfully!</span>
            </h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Document Hash</Label>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {lastIssuedCredential.hash}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Transaction</Label>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${lastIssuedCredential.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <span>View on Etherscan</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                
                {lastIssuedCredential.cid && (
                  <div>
                    <Label className="text-sm font-medium">IPFS CID</Label>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                      {lastIssuedCredential.cid}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <Label className="text-sm font-medium">Verification QR Code</Label>
                <div className="bg-white p-4 rounded-lg border">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={verificationUrl} 
                    size={150} 
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Scan to verify this credential
                </p>
                <Button
                  onClick={() => downloadQRCode(verificationUrl)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PNG</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Credentials */}
      {isConnected && (
        <div className="card-enhanced">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">📋 Recent Credentials</h2>
            <p className="text-gray-600 mt-2">
              Your recently issued credentials (stored locally)
            </p>
          </div>
          <div>
            {getIssuedCredentials().length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No credentials issued yet
              </p>
            ) : (
              <div className="space-y-3">
                {getIssuedCredentials().slice(0, 5).map((credential) => (
                  <div key={credential.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{credential.fileName}</span>
                        {credential.studentName && (
                          <Badge variant="secondary">{credential.studentName}</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(credential.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 font-mono">
                      {credential.hash.slice(0, 20)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}