'use client';

import { useChainId, useAccount } from 'wagmi';
import { Badge } from '../ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

const SEPOLIA_CHAIN_ID = 11155111;

interface NetworkBadgeProps {
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function NetworkBadge({ showIcon = true, size = 'md' }: NetworkBadgeProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;
  const isCorrectNetwork = isConnected && isOnSepolia;

  const getVariant = () => {
    if (!isConnected) return 'secondary';
    return isOnSepolia ? 'default' : 'destructive';
  };

  const getText = () => {
    if (!isConnected) return 'Not Connected';
    if (isOnSepolia) return 'Sepolia Testnet';
    return `Wrong Network (${chainId})`;
  };

  const getIcon = () => {
    if (!showIcon) return null;
    return isCorrectNetwork ? (
      <Wifi className="h-3 w-3" />
    ) : (
      <WifiOff className="h-3 w-3" />
    );
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant={getVariant()}
      className={`flex items-center space-x-1 ${sizeClasses[size]}`}
    >
      {getIcon()}
      <span>{getText()}</span>
    </Badge>
  );
}

export function NetworkStatus() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Network:</span>
        <NetworkBadge />
      </div>
      
      {isConnected && (
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Chain ID:</span>
            <span className="ml-1">{chainId}</span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className={`ml-1 ${isOnSepolia ? 'text-green-600' : 'text-red-600'}`}>
              {isOnSepolia ? 'Ready' : 'Switch Required'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}