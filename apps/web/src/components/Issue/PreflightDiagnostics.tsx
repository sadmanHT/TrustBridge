'use client';

import React from 'react';
import { CheckCircle, AlertCircle, XCircle, ExternalLink, Loader2, Clock, Zap, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChainHealthResult } from '@/lib/chainHealth';

interface DiagnosticCheck {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'success' | 'warning' | 'error';
  message?: string;
  details?: string;
  helpLink?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PreflightDiagnosticsProps {
  isVisible: boolean;
  chainHealth?: ChainHealthResult;
  gasPrice?: { gasPrice: bigint | null; formatted: string; error?: string };
  accountBalance?: { balance: bigint | null; formatted: string; error?: string };
  simulationResult?: { success: boolean; error?: string; gas?: bigint };
  onRetry: () => void;
  onProceed: () => void;
  onCancel: () => void;
  isRunning: boolean;
}

export function PreflightDiagnostics({
  isVisible,
  chainHealth,
  gasPrice,
  accountBalance,
  simulationResult,
  onRetry,
  onProceed,
  onCancel,
  isRunning
}: PreflightDiagnosticsProps) {
  if (!isVisible) return null;

  const getNetworkStatus = (): DiagnosticCheck => {
    if (!chainHealth) {
      return {
        id: 'network',
        label: 'Network Connection',
        status: 'checking',
        message: 'Checking network connectivity...',
        icon: Globe
      };
    }

    if (chainHealth.error) {
      return {
        id: 'network',
        label: 'Network Connection',
        status: 'error',
        message: 'Network connection failed',
        details: chainHealth.error,
        helpLink: 'https://docs.alchemy.com/docs/how-to-add-alchemy-rpc-endpoints-to-metamask',
        icon: Globe
      };
    }

    return {
      id: 'network',
      label: 'Network Connection',
      status: 'success',
      message: `Connected to Sepolia (Chain ID: ${chainHealth.chainId})`,
      details: `Latency: ${chainHealth.latencyMs}ms | Block: ${chainHealth.blockNumber}`,
      icon: Globe
    };
  };

  const getContractStatus = (): DiagnosticCheck => {
    if (!chainHealth) {
      return {
        id: 'contract',
        label: 'Smart Contract',
        status: 'checking',
        message: 'Verifying contract deployment...',
        icon: Shield
      };
    }

    if (chainHealth.error) {
      return {
        id: 'contract',
        label: 'Smart Contract',
        status: 'error',
        message: 'Cannot verify contract',
        details: chainHealth.error,
        icon: Shield
      };
    }

    if (!chainHealth.contractHasCode) {
      return {
        id: 'contract',
        label: 'Smart Contract',
        status: 'error',
        message: 'Contract not deployed or invalid address',
        details: 'The TrustBridge contract is not found at the configured address',
        helpLink: 'https://sepolia.etherscan.io/',
        icon: Shield
      };
    }

    return {
      id: 'contract',
      label: 'Smart Contract',
      status: 'success',
      message: 'Contract verified and accessible',
      details: 'TrustBridge contract is deployed and responding',
      icon: Shield
    };
  };

  const getIssuerStatus = (): DiagnosticCheck => {
    if (!chainHealth) {
      return {
        id: 'issuer',
        label: 'Issuer Permission',
        status: 'checking',
        message: 'Checking issuer permissions...',
        icon: Shield
      };
    }

    if (chainHealth.error) {
      return {
        id: 'issuer',
        label: 'Issuer Permission',
        status: 'error',
        message: 'Cannot verify issuer status',
        details: chainHealth.error,
        icon: Shield
      };
    }

    if (!chainHealth.isIssuer) {
      return {
        id: 'issuer',
        label: 'Issuer Permission',
        status: 'error',
        message: 'Account not approved as issuer',
        details: 'Your wallet address is not authorized to issue credentials',
        helpLink: '/admin',
        icon: Shield
      };
    }

    return {
      id: 'issuer',
      label: 'Issuer Permission',
      status: 'success',
      message: 'Account authorized to issue credentials',
      details: 'Your wallet is approved as a credential issuer',
      icon: Shield
    };
  };

  const getGasStatus = (): DiagnosticCheck => {
    if (!gasPrice) {
      return {
        id: 'gas',
        label: 'Gas Price',
        status: 'checking',
        message: 'Fetching current gas prices...',
        icon: Zap
      };
    }

    if (gasPrice.error || !gasPrice.gasPrice) {
      return {
        id: 'gas',
        label: 'Gas Price',
        status: 'warning',
        message: 'Cannot fetch gas price',
        details: gasPrice.error || 'Gas price unavailable',
        icon: Zap
      };
    }

    const gweiPrice = Number(gasPrice.gasPrice) / 1e9;
    const status = gweiPrice > 50 ? 'warning' : 'success';
    const message = gweiPrice > 50 ? 'High gas prices detected' : 'Gas prices normal';

    return {
      id: 'gas',
      label: 'Gas Price',
      status,
      message,
      details: gasPrice.formatted,
      helpLink: 'https://etherscan.io/gastracker',
      icon: Zap
    };
  };

  const getBalanceStatus = (): DiagnosticCheck => {
    if (!accountBalance) {
      return {
        id: 'balance',
        label: 'Account Balance',
        status: 'checking',
        message: 'Checking account balance...',
        icon: Clock
      };
    }

    if (accountBalance.error || !accountBalance.balance) {
      return {
        id: 'balance',
        label: 'Account Balance',
        status: 'warning',
        message: 'Cannot fetch balance',
        details: accountBalance.error || 'Balance unavailable',
        icon: Clock
      };
    }

    const ethBalance = Number(accountBalance.balance) / 1e18;
    const status = ethBalance < 0.001 ? 'warning' : 'success';
    const message = ethBalance < 0.001 ? 'Low balance detected' : 'Sufficient balance';

    return {
      id: 'balance',
      label: 'Account Balance',
      status,
      message,
      details: accountBalance.formatted,
      helpLink: 'https://sepoliafaucet.com/',
      icon: Clock
    };
  };

  const getSimulationStatus = (): DiagnosticCheck => {
    if (!simulationResult) {
      return {
        id: 'simulation',
        label: 'Transaction Simulation',
        status: 'checking',
        message: 'Simulating transaction...',
        icon: Zap
      };
    }

    if (!simulationResult.success) {
      return {
        id: 'simulation',
        label: 'Transaction Simulation',
        status: 'error',
        message: 'Transaction simulation failed',
        details: simulationResult.error || 'Transaction would fail',
        icon: Zap
      };
    }

    return {
      id: 'simulation',
      label: 'Transaction Simulation',
      status: 'success',
      message: 'Transaction simulation successful',
      details: simulationResult.gas ? `Estimated gas: ${simulationResult.gas.toString()}` : undefined,
      icon: Zap
    };
  };

  const checks = [
    getNetworkStatus(),
    getContractStatus(),
    getIssuerStatus(),
    getGasStatus(),
    getBalanceStatus(),
    getSimulationStatus()
  ];

  const hasErrors = checks.some(check => check.status === 'error');
  const hasWarnings = checks.some(check => check.status === 'warning');
  const allComplete = checks.every(check => check.status !== 'checking' && check.status !== 'pending');
  const canProceed = allComplete && !hasErrors;

  const getStatusIcon = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: DiagnosticCheck['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'checking':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="glass border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <span>Pre-flight Diagnostics</span>
          {isRunning && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {hasErrors && (
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              Critical issues detected. Please resolve before proceeding.
            </AlertDescription>
          </Alert>
        )}
        
        {hasWarnings && !hasErrors && (
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              Warnings detected. Review before proceeding.
            </AlertDescription>
          </Alert>
        )}

        {canProceed && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              All checks passed. Ready to proceed with transaction.
            </AlertDescription>
          </Alert>
        )}

        {/* Diagnostic Checks */}
        <div className="space-y-3">
          {checks.map((check) => {
            const Icon = check.icon;
            return (
              <div key={check.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-200">{check.label}</span>
                  </div>
                  <p className={cn("text-sm mt-1", getStatusColor(check.status))}>
                    {check.message}
                  </p>
                  {check.details && (
                    <p className="text-xs text-slate-400 mt-1">{check.details}</p>
                  )}
                  {check.helpLink && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => window.open(check.helpLink, '_blank')}
                    >
                      Get help <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Running diagnostics...</span>
              <span>{checks.filter(c => c.status !== 'checking' && c.status !== 'pending').length}/{checks.length}</span>
            </div>
            <Progress 
              value={(checks.filter(c => c.status !== 'checking' && c.status !== 'pending').length / checks.length) * 100} 
              className="h-2" 
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          
          {(hasErrors || hasWarnings) && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex-1"
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                'Retry Checks'
              )}
            </Button>
          )}
          
          <Button
            onClick={onProceed}
            disabled={!canProceed || isRunning}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {canProceed ? 'Proceed with Transaction' : 'Resolve Issues First'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}