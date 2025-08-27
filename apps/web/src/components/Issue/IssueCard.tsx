'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { Upload, FileText, Hash, Loader2, CheckCircle, AlertCircle, Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { QRCodeCard } from '@/components/ui/QR';
import { CopyField } from '@/components/ui/Copy';
import { CopyButton } from '@/components/ui/copy-button';
import { hashFile, hashFileWithProgress, isValidSHA256Hash } from '@/lib/sha256';
import { issueCredential, parseContractError, stringToBytes32 } from '@/lib/contract';
import { formatFileSize, formatTxHash } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { IssueSuccess } from './IssueSuccess';

interface IssueCardProps {
  className?: string;
  onSuccess?: (hash: string, txHash: string) => void;
  onError?: (error: string) => void;
}

interface FileData {
  file: File;
  hash: string;
  size: string;
  type: string;
}

type IssueStep = 'upload' | 'hashing' | 'ipfs' | 'contract' | 'success' | 'error';

export function IssueCard({ className, onSuccess, onError }: IssueCardProps) {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [step, setStep] = useState<IssueStep>('upload');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [hashProgress, setHashProgress] = useState(0);
  const [ipfsCid, setIpfsCid] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    query: {
      enabled: !!txHash && step === 'contract'
    }
  });

  // Handle successful transaction
  React.useEffect(() => {
    if (receipt && receipt.status === 'success' && fileData) {
      setStep('success');
      
      // Show success toast
      toast({
        title: "Credential Issued Successfully!",
        description: `Document ${fileData.file.name} has been verified on the blockchain.`,
      });
      
      onSuccess?.(fileData.hash, txHash);
    } else if (receipt && receipt.status === 'reverted') {
      const errorMessage = 'Transaction was reverted';
      setError(errorMessage);
      setStep('error');
      
      // Show error toast
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    }
  }, [receipt, fileData, txHash, onSuccess, onError, toast]);

  const resetState = useCallback(() => {
    setStep('upload');
    setFileData(null);
    setHashProgress(0);
    setIpfsCid('');
    setTxHash('');
    setError('');
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setStep('hashing');
      setError('');
      
      // Hash the file with progress tracking
      const hash = await hashFileWithProgress(file, (progress) => {
        setHashProgress(progress);
      });

      const fileData: FileData = {
        file,
        hash,
        size: formatFileSize(file.size),
        type: file.type || 'application/octet-stream'
      };

      setFileData(fileData);
      setStep('ipfs');
      
      // Simulate IPFS upload (replace with actual IPFS integration)
      await simulateIPFSUpload(file);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      setStep('error');
      onError?.(errorMessage);
    }
  }, [onError]);

  const simulateIPFSUpload = async (file: File): Promise<void> => {
    // Simulate IPFS upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock CID (in real implementation, this would come from IPFS)
    const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setIpfsCid(mockCid);
  };

  const handleIssueCredential = async () => {
    if (!fileData || !address || !isConnected) {
      setError('Wallet not connected or file not processed');
      setStep('error');
      return;
    }

    try {
      setStep('contract');
      setError('');
      
      // Show submitting toast
      toast({
        title: "Submitting Transaction",
        description: "Please confirm the transaction in your wallet...",
      });
      
      const documentHash = stringToBytes32(fileData.hash);
      const hash = await issueCredential(documentHash, ipfsCid, address);
      
      setTxHash(hash);
      
      // Show mining toast
      toast({
        title: "Transaction Submitted",
        description: `Mining transaction ${hash.slice(0, 10)}...`,
      });
      
    } catch (err) {
      const errorMessage = parseContractError(err);
      setError(errorMessage);
      setStep('error');
      
      // Show error toast
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    }
  };

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



  const getStepProgress = () => {
    switch (step) {
      case 'upload': return 0;
      case 'hashing': return 25;
      case 'ipfs': return 50;
      case 'contract': return 75;
      case 'success': return 100;
      default: return 0;
    }
  };

  const renderUploadArea = () => (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group",
        isDragOver 
          ? "border-blue-400 bg-blue-500/10 backdrop-blur-sm shadow-lg shadow-blue-500/25" 
          : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/30",
        step !== 'upload' && "opacity-50 pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="space-y-4">
        <div className={cn(
          "mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
          isDragOver ? "bg-blue-500/20 text-blue-400" : "bg-slate-700/50 text-slate-400 group-hover:text-slate-300"
        )}>
          <Upload className="h-8 w-8" />
        </div>
        <div>
          <p className="text-xl font-semibold text-slate-100 mb-2">
            Drop your document here or click to browse
          </p>
          <p className="text-sm text-slate-400">
            Supports PDF, DOC, DOCX, TXT, and image files (max 10MB)
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
      />
    </div>
  );

  const renderFileInfo = () => {
    if (!fileData) return null;

    return (
      <div className="space-y-6">
        {/* File Display Card */}
        <div className="glass border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {fileData.file.name}
              </p>
              <p className="text-xs text-slate-400">
                {fileData.size} • {fileData.type}
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              ✓ Processed
            </Badge>
          </div>
        </div>

        {/* Hash Preview with Copy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Document Hash (SHA-256)</label>
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
              Cryptographic Fingerprint
            </Badge>
          </div>
          <div className="glass border border-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-slate-400" />
              <code className="flex-1 text-xs font-mono text-slate-300 break-all">
                {fileData.hash}
              </code>
              <CopyButton text={fileData.hash} className="text-slate-400 hover:text-slate-200" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            This unique hash represents your document's digital fingerprint
          </p>
        </div>

        {/* IPFS Section */}
        {process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">IPFS Storage</label>
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                Decentralized
              </Badge>
            </div>
            {ipfsCid ? (
              <div className="glass border border-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <code className="flex-1 text-xs font-mono text-slate-300 break-all">
                    {ipfsCid}
                  </code>
                  <CopyButton text={ipfsCid} className="text-slate-400 hover:text-slate-200" />
                </div>
              </div>
            ) : step === 'ipfs' ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading to IPFS...</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => {
    const progress = step === 'hashing' ? hashProgress : getStepProgress();
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  };

  const renderStepStatus = () => {
    const steps = [
      { key: 'upload', label: 'File Upload', icon: Upload },
      { key: 'hashing', label: 'Computing Hash', icon: Hash },
      { key: 'ipfs', label: 'IPFS Storage', icon: FileText },
      { key: 'contract', label: 'Blockchain Issue', icon: CheckCircle }
    ];

    return (
      <div className="grid grid-cols-4 gap-2">
        {steps.map(({ key, label, icon: Icon }) => {
          const isActive = step === key;
          const isCompleted = getStepProgress() > steps.findIndex(s => s.key === key) * 25;
          const isLoading = isActive && (step === 'hashing' || step === 'ipfs' || step === 'contract');

          return (
            <div key={key} className="text-center">
              <div className={cn(
                "mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-1",
                isCompleted ? "bg-green-100 text-green-600" :
                isActive ? "bg-blue-100 text-blue-600" :
                "bg-gray-100 text-gray-400"
              )}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <p className={cn(
                "text-xs",
                isCompleted ? "text-green-600" :
                isActive ? "text-blue-600" :
                "text-gray-400"
              )}>
                {label}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSuccess = () => {
    if (!fileData) return null;

    return (
      <div className="space-y-6">
        <IssueSuccess 
          hash={fileData.hash}
          txHash={txHash}
          cid={ipfsCid || undefined}
          fileName={fileData.file.name}
        />
        
        <Button 
          onClick={resetState} 
          variant="outline"
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Issue Another Credential
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

  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-6">
        {!isConnected && (
          <Alert className="glass border-amber-500/30 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-200">
              Please connect your wallet to issue credentials
            </AlertDescription>
          </Alert>
        )}

        {step === 'upload' && renderUploadArea()}
        
        {(step === 'hashing' || step === 'ipfs' || step === 'contract') && (
          <div className="space-y-6">
            {renderFileInfo()}
            {renderProgress()}
            {renderStepStatus()}
            
            {step === 'ipfs' && ipfsCid && (
              <Button 
                onClick={handleIssueCredential} 
                disabled={!isConnected}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                <Shield className="h-4 w-4 mr-2" />
                Issue Credential on Blockchain
              </Button>
            )}
            
            {step === 'contract' && (
              <div className="text-center glass border border-white/10 rounded-lg p-6">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400 mb-3" />
                <p className="text-sm text-slate-300 font-medium">
                  {isWaitingForReceipt ? 'Waiting for confirmation...' : 'Submitting transaction...'}
                </p>
                {txHash && (
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    TX: {formatTxHash(txHash)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        {step === 'success' && renderSuccess()}
        {step === 'error' && renderError()}
      </div>
    </div>
  );
}