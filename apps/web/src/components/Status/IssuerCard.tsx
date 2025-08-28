'use client';

import { useAccount, useReadContract } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { contractConfig } from '../../lib/contract';

import { Skeleton } from '../ui/Skeleton';

interface IssuerCardProps {
  className?: string;
}

export function IssuerCard({ className }: IssuerCardProps) {
  const { address, isConnected } = useAccount();

  const { 
    data: isApprovedIssuer, 
    isLoading, 
    refetch 
  } = useReadContract({
    ...contractConfig,
    functionName: 'approvedIssuers',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const getStatusDisplay = () => {
    if (!isConnected) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
        badge: <Badge variant="secondary">Not Connected</Badge>,
        message: "Connect your wallet to check issuer status"
      };
    }

    if (isLoading) {
      return {
        icon: <Skeleton className="h-5 w-5 rounded-full" />,
        badge: <Skeleton className="h-6 w-24" />,
        message: "Checking issuer approval status..."
      };
    }

    if (isApprovedIssuer === true) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        badge: (
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✅ Approved Issuer
          </Badge>
        ),
        message: "You can issue credentials on the blockchain"
      };
    }

    return {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      badge: (
        <Badge variant="destructive">
          ⛔ Not Approved
        </Badge>
      ),
      message: "Ask the contract admin to approve this address as an issuer"
    };
  };

  const status = getStatusDisplay();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Issuer Status</CardTitle>
        <div className="ml-auto flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Display */}
          <div className="flex items-center space-x-2">
            {status.icon}
            {status.badge}
          </div>

          {/* Status Message */}
          <p className="text-xs text-muted-foreground">
            {status.message}
          </p>

          {/* Connected Address */}
          {isConnected && address && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Your Address:
                </span>
              </div>
              <p className="text-xs font-mono bg-muted p-2 rounded border mt-1">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          )}

          {/* Help Text for Non-Approved Users */}
          {isConnected && isApprovedIssuer === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Need Approval?</p>
                  <p>
                    Contact the contract administrator to get your address approved as an issuer. 
                    Only approved issuers can create credentials on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}