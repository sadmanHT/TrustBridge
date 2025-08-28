'use client';

import { useReadContract } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, FileText, CheckCircle } from 'lucide-react';
import { contractConfig } from '../../lib/contract';
import { CopyButton } from '../ui/Copy';
import { formatAddress } from '../../lib/format';
import { Skeleton } from '../ui/Skeleton';

interface ContractCardProps {
  className?: string;
}

export function ContractCard({ className }: ContractCardProps) {
  const { data: owner, isLoading: ownerLoading } = useReadContract({
    ...contractConfig,
    functionName: 'owner',
  });

  const contractAddress = contractConfig.address;
  const isDeployed = contractAddress !== '0x0000000000000000000000000000000000000000';

  const getEtherscanUrl = (address: string, type: 'address' | 'tx' = 'address') => {
    const baseUrl = 'https://sepolia.etherscan.io';
    return `${baseUrl}/${type}/${address}`;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Contract</CardTitle>
        <FileText className="h-4 w-4 ml-auto" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contract Status */}
          <div className="flex items-center space-x-2">
            {isDeployed ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Deployed
                </Badge>
              </>
            ) : (
              <>
                <div className="h-5 w-5 rounded-full bg-red-500" />
                <Badge variant="destructive">
                  Not Deployed
                </Badge>
              </>
            )}
          </div>

          {/* Contract Address */}
          {isDeployed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Address:
                </span>
                <div className="flex items-center space-x-1">
                  <CopyButton 
                    text={contractAddress}
                    className="h-6 w-6"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(getEtherscanUrl(contractAddress), '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs font-mono bg-muted p-2 rounded border">
                {formatAddress(contractAddress)}
              </p>
            </div>
          )}

          {/* Contract Owner */}
          {isDeployed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Owner:
                </span>
                {owner && typeof owner === 'string' && (
                  <div className="flex items-center space-x-1">
                    <CopyButton 
                      text={owner}
                      className="h-6 w-6"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open(getEtherscanUrl(owner), '_blank');
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {ownerLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : owner && typeof owner === 'string' ? (
                <p className="text-xs font-mono bg-muted p-2 rounded border">
                  {formatAddress(owner)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Unable to load owner
                </p>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {isDeployed && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(getEtherscanUrl(contractAddress), '_blank');
                  }
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Etherscan
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}