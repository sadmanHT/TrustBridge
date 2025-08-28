'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useBlockNumber, useChainId } from 'wagmi';
import { formatEther, formatGwei } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  AlertTriangle,
  Network,
  Wallet,
  Zap,
  Clock,
  Hash
} from 'lucide-react';
import { checkChainHealth, simulateIssue, ChainHealthResult } from '@/lib/chainHealth';
import { getPublicClient } from '@/lib/viem';
import { stringToBytes32 } from '@/lib/contract';

interface TxDiagnosticsProps {
  docHash?: string;
  ipfsCid?: string;
  txHash?: string;
  onTxSubmitted?: (txHash: string) => void;
}

interface GasEstimate {
  wei: bigint;
  gwei: string;
  eth: string;
}

interface TxMonitoring {
  txHash: string;
  startTime: number;
  isPending: boolean;
}

export function TxDiagnostics({ docHash, ipfsCid, txHash }: TxDiagnosticsProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  
  // State for diagnostics
  const [chainHealth, setChainHealth] = useState<ChainHealthResult | null>(null);
  const [isRunningPreFlight, setIsRunningPreFlight] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{ success: boolean; error?: string; gas?: bigint } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);
  const [txMonitoring, setTxMonitoring] = useState<TxMonitoring | null>(null);
  
  // Check if contract code is present
  const [contractCodePresent, setContractCodePresent] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkContractCode = async () => {
      try {
        const client = getPublicClient();
        const code = await client.getBytecode({
          address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`
        });
        setContractCodePresent(code !== undefined && code !== '0x');
      } catch {
        setContractCodePresent(false);
      }
    };
    
    if (isConnected) {
      checkContractCode();
    }
  }, [isConnected, chainId]);
  
  // Set up transaction monitoring when txHash is provided
  useEffect(() => {
    if (txHash && !txMonitoring) {
      setTxMonitoring({
        txHash,
        startTime: Date.now(),
        isPending: true
      });
    }
  }, [txHash, txMonitoring]);
  
  // Monitor pending transactions
  useEffect(() => {
    if (!txMonitoring) return;
    
    const checkTxStatus = async () => {
      try {
        const client = getPublicClient();
        const receipt = await client.getTransactionReceipt({
          hash: txMonitoring.txHash as `0x${string}`
        });
        if (receipt) {
          setTxMonitoring(prev => prev ? { ...prev, isPending: false } : null);
        }
      } catch {
        // Transaction still pending
      }
    };
    
    const interval = setInterval(checkTxStatus, 3000);
    return () => clearInterval(interval);
  }, [txMonitoring]);
  
  const runPreFlight = async () => {
    if (!address) return;
    
    setIsRunningPreFlight(true);
    try {
      const result = await checkChainHealth(address);
      setChainHealth(result);
    } catch (error) {
      console.error('Pre-flight check failed:', error);
    } finally {
      setIsRunningPreFlight(false);
    }
  };
  
  const runSimulation = async () => {
    if (!address || !docHash || !ipfsCid) return;
    
    setIsSimulating(true);
    try {
      const docHashBytes = stringToBytes32(docHash);
      const result = await simulateIssue(docHashBytes, ipfsCid, address);
      setSimulationResult({ success: true, gas: result.gas });
    } catch (error) {
      setSimulationResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Simulation failed' 
      });
    } finally {
      setIsSimulating(false);
    }
  };
  
  const estimateGas = async () => {
    if (!address || !docHash || !ipfsCid) return;
    
    setIsEstimatingGas(true);
    try {
      const docHashBytes = stringToBytes32(docHash);
      const result = await simulateIssue(docHashBytes, ipfsCid, address);
      const client = getPublicClient();
      const gasPrice = await client.getGasPrice();
      const totalCost = result.gas * gasPrice;
      
      setGasEstimate({
        wei: totalCost,
        gwei: formatGwei(totalCost),
        eth: formatEther(totalCost)
      });
    } catch (error) {
      console.error('Gas estimation failed:', error);
    } finally {
      setIsEstimatingGas(false);
    }
  };
  
  const getEtherscanUrl = (txHash: string) => {
    const baseUrl = chainId === 11155111 ? 'https://sepolia.etherscan.io' : 'https://etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
  };
  
  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };
  
  const isPendingTooLong = txMonitoring && txMonitoring.isPending && 
    (Date.now() - txMonitoring.startTime) > 20000;
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Transaction Diagnostics
        </CardTitle>
        <CardDescription>
          Debug and monitor transaction status with detailed network information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Network Status */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Network className="h-4 w-4" />
            Network Status
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Chain ID:</span>
              <Badge variant="outline">{chainId}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Block Number:</span>
              <Badge variant="outline">{blockNumber?.toString() || 'Loading...'}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Contract Code:</span>
              <div className="flex items-center gap-1">
                <StatusIcon status={contractCodePresent} />
                <span className="text-xs">
                  {contractCodePresent === null ? 'Checking...' : 
                   contractCodePresent ? 'Present' : 'Missing'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Network:</span>
              <Badge variant={chainId === 11155111 ? 'default' : 'destructive'}>
                {chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}`}
              </Badge>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Account Status */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Wallet className="h-4 w-4" />
            Account Status
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Connected Account:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </code>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Is Approved Issuer:</span>
              <div className="flex items-center gap-1">
                <StatusIcon status={chainHealth?.isIssuer || null} />
                <span className="text-xs">
                  {chainHealth?.isIssuer === undefined ? 'Unknown' :
                   chainHealth?.isIssuer ? 'Approved' : 'Not Approved'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Diagnostic Actions */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Zap className="h-4 w-4" />
            Diagnostic Tools
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={runPreFlight}
              disabled={!isConnected || isRunningPreFlight}
              variant="outline"
              className="justify-start"
            >
              {isRunningPreFlight ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Run Pre-flight Checks
            </Button>
            
            <Button 
              onClick={runSimulation}
              disabled={!docHash || !ipfsCid || !address || isSimulating}
              variant="outline"
              className="justify-start"
            >
              {isSimulating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Dry-run (Simulate)
            </Button>
            
            <Button 
              onClick={() => window.open('/api/health/chain', '_blank')}
              variant="outline"
              className="justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Chain Health API
            </Button>
            
            <Button 
              onClick={estimateGas}
              disabled={!docHash || !ipfsCid || !address || isEstimatingGas}
              variant="outline"
              className="justify-start"
            >
              {isEstimatingGas ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Estimate Gas
            </Button>
          </div>
        </div>
        
        {/* Results */}
        {(simulationResult || gasEstimate) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">Results</h3>
              
              {simulationResult && (
                <Alert className={simulationResult.success ? 'border-green-200' : 'border-red-200'}>
                  <AlertDescription>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={simulationResult.success} />
                      <span className="font-medium">
                        Simulation: {simulationResult.success ? 'OK' : 'Failed'}
                      </span>
                    </div>
                    {simulationResult.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Revert reason: {simulationResult.error}
                      </div>
                    )}
                    {simulationResult.gas && (
                      <div className="mt-2 text-sm text-gray-600">
                        Estimated gas: {simulationResult.gas.toString()}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {gasEstimate && (
                <Alert className="border-blue-200">
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Gas Estimate:</div>
                      <div className="text-sm space-y-1">
                        <div>Wei: {gasEstimate.wei.toString()}</div>
                        <div>Gwei: {gasEstimate.gwei}</div>
                        <div>ETH: {gasEstimate.eth}</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
        
        {/* Transaction Monitoring */}
        {txMonitoring && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4" />
                Transaction Monitoring
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {txMonitoring.txHash.slice(0, 10)}...{txMonitoring.txHash.slice(-8)}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => window.open(getEtherscanUrl(txMonitoring.txHash), '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {isPendingTooLong && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Pending in mempool for over 20 seconds. You can check Etherscan or speed up from MetaMask.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}