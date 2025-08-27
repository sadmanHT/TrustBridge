import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';
import contractConfig from '../contractConfig.json';
import {
  metaMaskWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';

// Get Alchemy API key from environment
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!alchemyApiKey) {
  console.warn('NEXT_PUBLIC_ALCHEMY_API_KEY not found in environment variables');
}

// WalletConnect warnings are now suppressed in the Providers component

// Configure wagmi with RainbowKit (optimized wallet selection)
export const config = getDefaultConfig({
  appName: 'TrustBridge',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
  },
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        injectedWallet,
      ],
    },
  ],
  ssr: true, // Enable SSR support
  batch: {
    multicall: true,
  },
  pollingInterval: 4000, // Reduce polling frequency
});

// Export contract configuration
export const credentialRegistryConfig = {
  address: contractConfig.address as `0x${string}`,
  abi: contractConfig.abi,
} as const;

// Export chain configuration
export { sepolia };