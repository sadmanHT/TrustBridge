import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';
import contractConfig from '../contractConfig.json';
import {
  metaMaskWallet,
  injectedWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { getEnvConfigSafe } from './env';

// Load validated environment configuration
const env = getEnvConfigSafe();

// WalletConnect warnings are now suppressed in the Providers component

// Configure wagmi with RainbowKit (optimized wallet selection)
export const config = getDefaultConfig({
  appName: env.NEXT_PUBLIC_APP_NAME || 'TrustBridge',
  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [sepolia],
  transports: {
    [sepolia.id]: typeof window !== 'undefined'
      ? http('/api/rpc')
      : http(`https://eth-sepolia.g.alchemy.com/v2/${env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
  },
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        injectedWallet,
      ],
    },
    {
      groupName: 'Other',
      wallets: [
        walletConnectWallet,
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
  address: (env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address) as `0x${string}`,
  abi: contractConfig.abi,
} as const;

// Export chain configuration
export { sepolia };