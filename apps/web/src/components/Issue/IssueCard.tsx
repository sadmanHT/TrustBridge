'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Hash, Loader2, CheckCircle, AlertCircle, Shield, Bug, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToastAction } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/Copy';
import { hashFileWithProgress } from '@/lib/sha256';
import { parseContractError, stringToBytes32, getContractAddress, contractABI, getReadClient } from '@/lib/contract';
import { walletClient } from '@/lib/viem';
import { formatFileSize } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { IssueSuccess } from './IssueSuccess';
import { PreflightDiagnostics } from './PreflightDiagnostics';
import { runFullDiagnostics, simulateIssue, ChainHealthResult, GasPriceResult, AccountBalanceResult, FullDiagnosticsResult } from '@/lib/chainHealth';
import { TxDiagnostics } from '@/components/debug/TxDiagnostics';
import { Drawer } from '@/components/ui/drawer';

interface IssueCardProps {
  className?: string;
  onSuccess?: (hash: string, txHash: string) => void;
  onError?: (error: string) => void;
  onFileProcessed?: (hash: string, ipfsCid: string) => void;
}

interface FileData {
  file: File;
  hash: string;
  size: string;
  type: string;
}

type IssueStep = 'upload' | 'hashing' | 'ipfs' | 'preflight' | 'contract' | 'success' | 'error';

export function IssueCard({ className, onSuccess, onError, onFileProcessed }: IssueCardProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<IssueStep>('upload');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [hashProgress, setHashProgress] = useState(0);
  const [ipfsCid, setIpfsCid] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [txStartTime, setTxStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('0s');
  const [showSuccessInline, setShowSuccessInline] = useState(false);
  const [successData, setSuccessData] = useState<{ hash: string; txHash: string; cid?: string } | null>(null);
  
  // Diagnostics states
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [chainHealth, setChainHealth] = useState<ChainHealthResult | null>(null);
  const [gasPrice, setGasPrice] = useState<GasPriceResult | null>(null);
  const [accountBalance, setAccountBalance] = useState<AccountBalanceResult | null>(null);
  const [simulationResult, setSimulationResult] = useState<{ success: boolean; error?: string; gas?: bigint } | null>(null);
  const [showDiagnosticsDrawer, setShowDiagnosticsDrawer] = useState(false);

  // Timer effect for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (txStartTime && step === 'contract') {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - txStartTime) / 1000);
        setElapsedTime(`${elapsed}s`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [txStartTime, step]);

  const resetState = useCallback(() => {
    setStep('upload');
    setFileData(null);
    setHashProgress(0);
    setIpfsCid('');
    setTxHash('');
    setError('');
    setIsDragOver(false);
    setTxStartTime(null);
    setElapsedTime('0s');
    setShowSuccessInline(false);
    setSuccessData(null);
    setShowDiagnostics(false);
    setDiagnosticsRunning(false);
    setChainHealth(null);
    setGasPrice(null);
    setAccountBalance(null);
    setSimulationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setStep('error');
      return;
    }

    const fileData: FileData = {
      file,
      hash: '',
      size: formatFileSize(file.size),
      type: file.type || 'application/octet-stream'
    };

    setFileData(fileData);
    setStep('hashing');
    setError('');
    setHashProgress(0);

    try {
      const hash = await hashFileWithProgress(file, (progress) => {
        setHashProgress(progress);
      });

      const updatedFileData = { ...fileData, hash };
      setFileData(updatedFileData);
      
      // Move to IPFS step if Web3.Storage token is available
      if (process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN) {
        setStep('ipfs');
        await uploadToIPFS(file, hash);
      } else {
        // Skip IPFS and go directly to preflight
        setStep('preflight');
        await runPreflightChecks();
      }
      
      onFileProcessed?.(hash, ipfsCid);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to process file');
      setStep('error');
    }
  }, [ipfsCid, onFileProcessed]);

  const uploadToIPFS = async (file: File, hash: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hash', hash);

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setIpfsCid(data.cid);
      
      toast({
        title: "IPFS Upload Complete",
        description: `File uploaded to IPFS: ${data.cid}`,
      });
    } catch (err: unknown) {
      console.error('IPFS upload failed:', err);
      toast({
        title: "IPFS Upload Failed",
        description: (err as Error).message || 'Failed to upload to IPFS',
        variant: "destructive",
      });
      // Continue without IPFS
    }
  };

  const runPreflightChecks = async () => {
    if (!address || !fileData) return;
    
    setDiagnosticsRunning(true);
    setShowDiagnostics(true);
    setStep('preflight');
    
    try {
      const diagnostics: FullDiagnosticsResult = await runFullDiagnostics(address);
      setChainHealth(diagnostics.chainHealth);
      setGasPrice(diagnostics.gasPrice);
      setAccountBalance(diagnostics.accountBalance);
      
      // Run simulation
      const documentHash = stringToBytes32(fileData.hash);
      try {
        const simulation = await simulateIssue(documentHash, ipfsCid || '', address);
        setSimulationResult({ success: true, gas: simulation.gas });
      } catch (simError: unknown) {
        setSimulationResult({ success: false, error: (simError as Error).message });
      }
    } catch (err: unknown) {
      console.error('Preflight checks failed:', err);
      setError((err as Error).message || 'Preflight checks failed');
      setStep('error');
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const handleIssueCredential = async () => {
    console.log('🚀 Issue Credential button clicked');
    console.log('📊 State check:', { fileData: !!fileData, address, isConnected, walletClient: !!walletClient });
    
    // 1. Check if window.ethereum is present and connected
    if (!window.ethereum) {
      const errorMessage = 'MetaMask not detected. Please install MetaMask extension.';
      setError(errorMessage);
      setStep('error');
      
      toast({
        title: "MetaMask Required",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
      return;
    }

    if (!isConnected || !address) {
      const errorMessage = 'Please connect your wallet first.';
      setError(errorMessage);
      setStep('error');
      
      toast({
        title: "Wallet Not Connected",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
      return;
    }

    // 2. Check if active chain is Sepolia
    const SEPOLIA_CHAIN_ID = 11155111;
    let currentChainId;
    
    try {
      currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      currentChainId = parseInt(currentChainId, 16);
    } catch {
      const errorMessage = 'Unable to detect current network. Please check your wallet connection.';
      setError(errorMessage);
      setStep('error');
      
      toast({
        title: "Network Detection Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
      return;
    }

    if (currentChainId !== SEPOLIA_CHAIN_ID) {
      try {
        // Request network switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
        });
        
        toast({
          title: "Network Switched",
          description: "Successfully switched to Sepolia Testnet",
        });
      } catch (switchError: unknown) {
        // If the chain hasn't been added to MetaMask, add it
        if ((switchError as { code?: number }).code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              }],
            });
            
            toast({
              title: "Network Added",
              description: "Sepolia Testnet added and switched successfully",
            });
          } catch {
            const errorMessage = 'Please manually switch to Sepolia Testnet in your wallet.';
            setError(errorMessage);
            setStep('error');
            
            toast({
              title: "Network Switch Required",
              description: errorMessage,
              variant: "destructive",
            });
            
            onError?.(errorMessage);
            return;
          }
        } else {
          const errorMessage = 'Please switch to Sepolia Testnet in your wallet to continue.';
          setError(errorMessage);
          setStep('error');
          
          toast({
            title: "Wrong Network",
            description: errorMessage,
            variant: "destructive",
          });
          
          onError?.(errorMessage);
          return;
        }
      }
    }
    
    // Check if RPC is configured
    if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
      toast({
        title: "RPC Configuration Error",
        description: "RPC not configured. Set NEXT_PUBLIC_ALCHEMY_API_KEY",
        variant: "destructive",
      });
      return;
    }
    
    if (!fileData) {
      const errorMessage = 'Please upload and process a file first.';
      setError(errorMessage);
      setStep('error');
      
      toast({
        title: "File Required",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
      return;
    }

    // Validate document hash with proper regex pattern
    const docHashRegex = /^0x[0-9a-fA-F]{64}$/;
    if (!fileData.hash || !docHashRegex.test(fileData.hash)) {
      const errorMessage = 'Invalid document hash format. Expected 0x followed by 64 hex characters.';
      setError(errorMessage);
      setStep('error');
      
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
      return;
    }

    let transactionHash = '';
    
    try {
      setStep('contract');
      setError('');
      setTxStartTime(Date.now());
      
      // Check chain health before proceeding
      toast({
        title: "Checking Chain Health",
        description: "Validating contract and chain status...",
      });
      
      const chainHealth = await runFullDiagnostics(address);
      
      // 3. Check if contract requires issuer approval
      console.log('🔍 Checking issuer status for address:', address);
      try {
        const { checkIssuerStatus } = await import('@/lib/contract');
        const issuerStatus = await checkIssuerStatus(address);
        console.log('👤 Issuer status result:', issuerStatus);
        
        if (!issuerStatus.isApproved) {
          const errorMessage = `Your wallet address (${address}) is not approved as an issuer. Please contact the administrator to get approval before you can issue credentials.`;
          console.error('❌ Issuer not approved:', issuerStatus);
          setError(errorMessage);
          setStep('error');
          
          toast({
            title: "Need Approval",
            description: "Your address is not authorized to issue credentials. Contact admin for approval.",
            variant: "destructive",
            action: (
                <ToastAction
                  altText="Contact Admin"
                  onClick={() => {
                    // You can customize this to open email, support chat, etc.
                    window.open('mailto:admin@trustbridge.com?subject=Issuer Approval Request&body=Please approve my wallet address: ' + address, '_blank');
                  }}
                >
                  Contact Admin
                </ToastAction>
              ),
          });
          
          onError?.(errorMessage);
          return; // Do not continue to write if not approved
        }
        
        console.log('✅ Issuer approved, proceeding with transaction');
      } catch (issuerCheckError: unknown) {
        console.warn('⚠️ Could not verify issuer status:', issuerCheckError);
        
        // Show warning but allow transaction attempt - let the contract handle validation
        toast({
          title: "Issuer Status Check Failed",
          description: "Could not verify issuer status. Transaction will proceed but may fail if not authorized.",
          variant: "default",
        });
      }
      
      if (!chainHealth?.chainHealth?.contractHasCode) {
        const errorMessage = 'Contract not deployed or invalid contract address';
        setError(errorMessage);
        setStep('error');
        
        toast({
          title: "Chain Health Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        onError?.(errorMessage);
        return;
      }
      
      if (chainHealth.chainHealth.chainId !== chainHealth.chainHealth.expectedChainId) {
        const errorMessage = `Wrong chain. Expected chain ${chainHealth.chainHealth.expectedChainId}, but connected to ${chainHealth.chainHealth.chainId}`;
        setError(errorMessage);
        setStep('error');
        
        toast({
          title: "Wrong Chain",
          description: errorMessage,
          variant: "destructive",
        });
        
        onError?.(errorMessage);
        return;
      }
      
      // Simulate transaction before sending
      toast({
        title: "Simulating Transaction",
        description: "Testing transaction parameters...",
      });
      
      const documentHash = stringToBytes32(fileData.hash);
      
      // Validate args before proceeding to prevent silent failures
      if (!documentHash || documentHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const errorMessage = 'Invalid document hash - cannot proceed with transaction';
        setError(errorMessage);
        setStep('error');
        
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        onError?.(errorMessage);
        throw new Error(errorMessage);
      }
      
      try {
        const simulationResult = await simulateIssue(documentHash, ipfsCid || '', address);
        
        // Show simulation success
        toast({
          title: "Simulation Successful",
          description: `Gas estimate: ${simulationResult.gas || 'N/A'}`,
        });
      } catch (simulationError: unknown) {
        console.error('🚨 Simulation failed with error:', simulationError);
        
        let errorMessage = 'Transaction simulation failed';
        let errorTitle = "Simulation Failed";
        
        // Check if it's an issuer permission error
        const errorObj = simulationError as { message?: string; shortMessage?: string };
        if (errorObj?.message?.includes('NotApprovedIssuer') || 
            errorObj?.shortMessage?.includes('NotApprovedIssuer')) {
          errorMessage = `Your wallet address (${address}) is not approved as an issuer. Please contact the contract owner to get approval.`;
          errorTitle = "Not Issuer-Approved";
        } else if (errorObj?.message?.includes('insufficient funds')) {
          errorMessage = 'Insufficient balance for gas fees. Please add funds to your wallet.';
          errorTitle = "Insufficient Balance";
        } else if (errorObj?.message?.includes('chain')) {
          errorMessage = 'Chain mismatch. Please switch to the correct network in your wallet.';
          errorTitle = "Chain Mismatch";
        } else {
          const revertReason = errorObj?.shortMessage || errorObj?.message || 'Unknown simulation error';
          errorMessage = `Simulation failed: ${revertReason}`;
        }
        
        setError(errorMessage);
        setStep('error');
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        
        onError?.(errorMessage);
        throw simulationError;
      }
      
      // Show submitting toast with explicit wallet signature state
      toast({
        title: "Awaiting Signature",
        description: "Please check your wallet and confirm the transaction...",
      });
      
      console.log('🔐 Waiting for wallet signature...');
      
      // Debug logging before transaction call
      console.log("Issuing with args:", {
        documentHash,
        ipfsCid: ipfsCid || '',
        account: address
      });
      
      // Check if wallet client is available
      if (!walletClient) {
        const errorMessage = 'Wallet client not available. Please ensure MetaMask is connected.';
        setError(errorMessage);
        setStep('error');
        
        toast({
          title: "Wallet Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        onError?.(errorMessage);
        return;
      }

      let result;
      try {
        // Use wagmi wallet client directly for proper MetaMask integration
        const contractAddress = getContractAddress();
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }

        console.log('🔗 About to call writeContract with:', {
          contractAddress,
          functionName: 'issueCredential',
          args: [documentHash, ipfsCid || ''],
          account: address,
          walletClientType: typeof walletClient,
          envContractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          windowEthereum: !!window.ethereum,
          walletClientChain: walletClient?.chain?.id
        });

        // Additional validation before transaction
        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
          const errorMessage = 'Contract address not configured. Please check NEXT_PUBLIC_CONTRACT_ADDRESS environment variable.';
          console.error('❌ Contract address validation failed:', {
            contractAddress,
            envVar: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
          });
          setError(errorMessage);
          setStep('error');
          
          toast({
            title: "Configuration Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          onError?.(errorMessage);
          return;
        }

        if (!window.ethereum) {
          const errorMessage = 'MetaMask not detected. Please install MetaMask extension.';
          console.error('❌ MetaMask not available');
          setError(errorMessage);
          setStep('error');
          
          toast({
            title: "MetaMask Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          onError?.(errorMessage);
          return;
        }

        console.log('🚀 Calling walletClient.writeContract...');
        
        const txHash = await walletClient.writeContract({
          address: contractAddress,
          abi: contractABI,
          functionName: 'issueCredential',
          args: [documentHash, ipfsCid || ''],
          account: address
        });
        
        transactionHash = txHash;
        setTxHash(txHash);
        
        console.log('✅ Transaction submitted successfully:', txHash);
        
        // Show transaction submitted feedback
        toast({
          title: "Transaction Submitted ✅",
          description: `Waiting for confirmation... Hash: ${txHash.slice(0, 10)}...`,
        });
        
        console.log('⏳ Waiting for transaction confirmation...');
      
        // Wait for transaction receipt with better timeout handling
        const publicClient = getReadClient();
        let receipt;
        try {
          receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 1,
            pollingInterval: 2_000,
            timeout: 60_000 // Reduced to 1 minute
          });
        } catch {
          // Handle timeout gracefully
          const etherscanUrl = `https://etherscan.io/tx/${txHash}`;
          toast({
            title: "Transaction Still Pending",
            description: (
              <div>
                <div>Transaction is taking longer than expected.</div>
                <a href={etherscanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  Check status on Etherscan
                </a>
              </div>
            ),
            variant: "default",
          });
          
          // Keep checking in background
          setTimeout(async () => {
            try {
              const laterReceipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 1,
                pollingInterval: 5_000,
                timeout: 300_000 // 5 minutes for background check
              });
              
              if (laterReceipt.status === 'success') {
                toast({
                  title: "Transaction Confirmed! ✅",
                  description: "Your credential has been issued successfully.",
                });
                setStep('success');
              }
            } catch (e) {
              console.log('Background transaction check failed:', e);
            }
          }, 5000);
          
          // Don't throw, let user know transaction is pending
          setError(`Transaction submitted but confirmation is taking longer than expected. Hash: ${txHash}`);
          return;
        }
        
        result = { txHash, receipt };
        
        // Show mining toast with Etherscan link
        const etherscanUrl = `https://etherscan.io/tx/${result.txHash}`;
        toast({
          title: "Transaction Submitted",
          description: (
            <div>
              <div>Mining: {result.txHash.slice(0, 10)}...</div>
              <a href={etherscanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                View on Etherscan
              </a>
            </div>
          ),
        });
      } catch (error: unknown) {
        // Enhanced error logging
        console.error("💥 Transaction failed:", error);
        console.error("💥 Error details:", {
          name: (error as Error)?.name,
          message: (error as { message?: string })?.message,
          shortMessage: (error as { shortMessage?: string })?.shortMessage,
          code: (error as { code?: number })?.code,
          cause: (error as { cause?: unknown })?.cause
        });
        
        // Check for specific MetaMask/wallet errors
        if ((error as { code?: number })?.code === 4001) {
          const errorMessage = 'Transaction rejected by user in MetaMask';
          setError(errorMessage);
          setStep('error');
          
          toast({
            title: "Transaction Cancelled",
            description: errorMessage,
            variant: "destructive",
          });
          
          onError?.(errorMessage);
          return;
        }
        
        if ((error as { code?: number })?.code === -32002) {
          const errorMessage = 'MetaMask is already processing a request. Please check your wallet.';
          setError(errorMessage);
          setStep('error');
          
          toast({
            title: "Wallet Busy",
            description: errorMessage,
            variant: "destructive",
          });
          
          onError?.(errorMessage);
          return;
        }
        
        if ((error as { message?: string })?.message?.includes('User denied') || (error as { message?: string })?.message?.includes('rejected')) {
          const errorMessage = 'Transaction was rejected by the user';
          setError(errorMessage);
          setStep('error');
          
          toast({
            title: "Transaction Rejected",
            description: errorMessage,
            variant: "destructive",
          });
          
          onError?.(errorMessage);
          return;
        }
        
        // Handle timeout specifically
        if ((error as { message?: string })?.message?.includes('timeout') || (error as { name?: string })?.name === 'TimeoutError') {
          const etherscanUrl = `https://etherscan.io/tx/${transactionHash}`;
          const errorMessage = 'Transaction is still pending. It may take longer to confirm.';
          
          toast({
            title: "Still Pending",
            description: (
              <div>
                <div>{errorMessage}</div>
                <div className="mt-2 space-x-2">
                  <a href={etherscanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    Open Etherscan
                  </a>
                  <span>or</span>
                  <a href={etherscanUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 underline">
                    Speed Up
                  </a>
                </div>
              </div>
            ),
            variant: "default",
          });
          
          // Keep the transaction in pending state, don't throw
          setError(errorMessage);
          return;
        }
        
        // Parse the error to provide specific feedback
        const parsedError = parseContractError(error);
        let errorMessage = parsedError;
        let errorTitle = "Transaction Failed";
        
        // Check for specific error types
        const errorObj = error as { message?: string; code?: number };
        if (errorObj?.message?.includes('User rejected') || errorObj?.code === 4001) {
          errorMessage = 'Transaction was rejected by user';
          errorTitle = "Transaction Rejected";
        } else if (errorObj?.message?.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas fees';
          errorTitle = "Insufficient Balance";
        } else if (errorObj?.message?.includes('network')) {
          errorMessage = 'Network connection error. Please check your internet connection.';
          errorTitle = "Network Error";
        } else if (errorObj?.message?.includes('RPC')) {
          errorMessage = 'RPC endpoint unreachable. Please try again later.';
          errorTitle = "RPC Error";
        } else if (errorObj?.message?.includes('chain')) {
          errorMessage = 'Chain mismatch. Please switch to the correct network.';
          errorTitle = "Chain Mismatch";
        }
        
        setError(errorMessage);
        setStep('error');
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        
        onError?.(errorMessage);
        return;
      }
      
      // Only advance to success when receipt status is confirmed as success
      if (result.receipt && result.receipt.status === 'success') {
        setStep('success');
        
        // Show blockchain success toast
        toast({
          title: "Blockchain Issue ✅",
          description: "Transaction confirmed successfully on the blockchain!",
        });
        
        // Show success toast with checkmark
        toast({
          title: "Credential issued ✅",
          description: `Document ${fileData.file.name} has been verified on the blockchain.`,
        });
        
        // Record successful activity
        try {
          await fetch('/api/activity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'ISSUE',
              wallet: address,
              docHash: fileData.hash,
              txHash: result.receipt.transactionHash,
              cid: ipfsCid || undefined,
              status: 'success'
            })
          });
        } catch (activityError) {
          console.error('Failed to record activity:', activityError);
        }
        
        // Safe redirect with URL-encoded parameters
        try {
          const url = `/issue/success?hash=${encodeURIComponent(fileData.hash)}&tx=${encodeURIComponent(result.receipt.transactionHash)}${ipfsCid ? `&cid=${encodeURIComponent(ipfsCid)}` : ""}`;
          console.log('[ISSUE] Redirecting to success page:', url);
          router.push(url);
        } catch (e) {
          console.error('[ISSUE] post-tx redirect failed', e);
          // Fallback: show success inline instead of crashing
          setSuccessData({
            hash: fileData.hash,
            txHash: result.receipt.transactionHash,
            cid: ipfsCid || undefined
          });
          setShowSuccessInline(true);
        }
        
        onSuccess?.(fileData.hash, result.txHash);
      } else {
        throw new Error('Transaction was reverted');
      }
      
    } catch (error: unknown) {
      console.error('🚨 Outer catch - Unexpected error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = "Unexpected Error";
      
      // Handle specific outer-level errors
      const errorObj = error as { message?: string };
      if (errorObj?.message?.includes('fetch')) {
        errorMessage = 'RPC endpoint unreachable. Please check your connection.';
        errorTitle = "RPC Unreachable";
      } else if (errorObj?.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
        errorTitle = "Request Timeout";
      } else if (errorObj?.message) {
        errorMessage = errorObj.message;
      }
      
      setError(errorMessage);
      setStep('error');
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    } finally {
      // Always reset loading state to ensure button reappears
      console.log('🔄 Resetting UI state in finally block');
      // The step state manages the loading/button visibility
      // If we're not in success state, ensure we're in a state that shows the button
      if (step !== 'success') {
        // Only reset to upload if we're in contract state (loading)
        if (step === 'contract') {
          setStep('upload');
        }
      }
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
            This unique hash represents your document&apos;s digital fingerprint
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
        
        {(step === 'hashing' || step === 'ipfs' || step === 'preflight' || step === 'contract') && (
          <div className="space-y-6">
            <div className="relative">
              {renderFileInfo()}
              {renderProgress()}
              {renderStepStatus()}
              
              {/* Diagnostics Button - Top Right */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiagnosticsDrawer(true)}
                className="absolute top-0 right-0 h-8 w-8 p-0"
              >
                <Bug className="h-4 w-4" />
              </Button>
            </div>
            
            {step === 'ipfs' && ipfsCid && (
              <Button 
                onClick={runPreflightChecks} 
                disabled={!isConnected}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
              >
                <Shield className="h-4 w-4 mr-2" />
                Issue Credential on Blockchain
              </Button>
            )}
            
            {step === 'preflight' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {diagnosticsRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span>
                    {diagnosticsRunning ? 'Running pre-flight checks...' : 'Pre-flight checks complete'}
                  </span>
                </div>
                
                {showDiagnostics && (
                  <PreflightDiagnostics
                    isVisible={showDiagnostics}
                    chainHealth={chainHealth || undefined}
                    gasPrice={gasPrice || undefined}
                    accountBalance={accountBalance || undefined}
                    simulationResult={simulationResult || undefined}
                    isRunning={diagnosticsRunning}
                    onRetry={runPreflightChecks}
                    onProceed={handleIssueCredential}
                    onCancel={() => setStep('ipfs')}
                  />
                )}
                
                {!diagnosticsRunning && (
                  <div className="space-y-3">
                    {/* Show inline error if diagnostics failed but keep button visible */}
                    {simulationResult && !simulationResult.success && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <strong>Diagnostics Warning:</strong> {simulationResult.error || 'Pre-flight checks detected issues.'} 
                          You can still proceed, but the transaction may fail. Your wallet provider will handle the final validation.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Show inline error for chain health issues */}
                    {chainHealth && chainHealth.error && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          <strong>Network Issue:</strong> {chainHealth.userFriendlyError || chainHealth.error}
                          You can still attempt the transaction using your wallet provider.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Show inline error for issuer status */}
                    {chainHealth && !chainHealth.isIssuer && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Authorization Warning:</strong> Your address may not be approved as an issuer. 
                          The transaction may fail, but you can still attempt it.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleIssueCredential}
                        disabled={!isConnected}
                        className="flex-1"
                        variant={simulationResult && !simulationResult.success ? "outline" : "default"}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {simulationResult && !simulationResult.success ? 'Proceed Anyway' : 'Proceed to Issue'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setStep('ipfs')}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 'contract' && (
              <div className="text-center glass border border-white/10 rounded-lg p-6">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400 mb-3" />
                <p className="text-sm text-slate-300 font-medium">
                  {txHash ? 'Waiting for confirmation...' : 'Submitting transaction...'}
                </p>
                
                {/* Elapsed Time */}
                <p className="text-xs text-slate-400 mt-2">
                  Elapsed: {elapsedTime}
                </p>
                
                {/* Transaction Hash and Actions */}
                {txHash && (
                  <div className="mt-4 space-y-3">
                    <div className="glass border border-white/10 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-2">Transaction Hash:</p>
                      <code className="text-xs font-mono text-slate-300 break-all">
                        {txHash}
                      </code>
                    </div>
                    
                    <div className="flex space-x-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                        className="flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Open Etherscan</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(txHash)}
                        className="flex items-center space-x-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy Hash</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {step === 'success' && renderSuccess()}
        {step === 'error' && renderError()}
        
        {showSuccessInline && successData && (
          <div className="space-y-6">
            <IssueSuccess 
              hash={successData.hash}
              txHash={successData.txHash}
              cid={successData.cid}
              fileName={fileData?.file.name || 'Unknown'}
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
        )}
      </div>
      
      {/* Diagnostics Drawer */}
      <Drawer open={showDiagnosticsDrawer} onOpenChange={setShowDiagnosticsDrawer}>
        <TxDiagnostics
          docHash={fileData?.hash}
          ipfsCid={ipfsCid || undefined}
          txHash={txHash || undefined}
          onTxSubmitted={(hash) => setTxHash(hash)}
        />
      </Drawer>
    </div>
  );
}