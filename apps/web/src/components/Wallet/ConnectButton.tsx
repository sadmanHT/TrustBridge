'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, Wallet } from 'lucide-react';
import { sepolia } from 'viem/chains';

const SEPOLIA_CHAIN_ID = 11155111;

export function ConnectButton() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;

  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <RainbowConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div className="flex flex-col items-center space-y-3">
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="flex items-center space-x-2 px-6 py-3"
                      size="lg"
                    >
                      <Wallet className="h-5 w-5" />
                      <span>Connect Wallet</span>
                    </Button>
                  );
                }

                return (
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-mono text-sm">
                        {account.displayName}
                      </span>
                    </Button>
                    
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      size="sm"
                    >
                      {chain.name}
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </RainbowConnectButton.Custom>

      {/* Network Warning */}
      {isConnected && !isOnSepolia && (
        <div className="flex flex-col items-center space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Wrong Network</span>
          </div>
          <p className="text-sm text-yellow-700 text-center">
            Please switch to Sepolia Testnet to use TrustBridge
          </p>
          <Button
            onClick={handleSwitchToSepolia}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Switch to Sepolia
          </Button>
        </div>
      )}

      {/* Network Status Badge */}
      {isConnected && (
        <Badge 
          variant={isOnSepolia ? "default" : "destructive"}
          className="text-xs"
        >
          {isOnSepolia ? "✅ Sepolia Testnet" : "⚠️ Wrong Network"}
        </Badge>
      )}
    </div>
  );
}