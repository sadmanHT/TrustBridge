import { createPublicClient, createWalletClient, http, custom, PublicClient, WalletClient, TransactionReceipt } from 'viem';
import { sepolia } from 'viem/chains';
import { Address } from 'viem';

// Fail fast if RPC key is missing
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
if (!ALCHEMY_KEY) throw new Error("Missing NEXT_PUBLIC_ALCHEMY_API_KEY");

// Environment-driven Alchemy URL
const ALCHEMY_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;

// Centralized public client for Alchemy reads
// Use proxy route in browser to avoid CORS issues, direct Alchemy on server
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: typeof window !== 'undefined' 
    ? http('/api/rpc', { batch: true })
    : http(ALCHEMY_URL, { batch: true }),
});

// Centralized wallet client for MetaMask writes
export const walletClient = 
  typeof window !== 'undefined' && window.ethereum
    ? createWalletClient({ chain: sepolia, transport: custom(window.ethereum) })
    : null;

// Public client via server-side proxy (for CORS-free browser reads)
export const publicClientViaProxy = createPublicClient({
  chain: sepolia,
  transport: http('/api/rpc'),
});

// Utility functions
export function getPublicClient(): PublicClient {
  return publicClient;
}

// Get wallet client (MetaMask)
export function getWalletClient(): WalletClient | null {
  return walletClient;
}

// Check if user is on Sepolia network
export async function isOnSepolia(): Promise<boolean> {
  try {
    if (!walletClient) return false;
    const chainId = await walletClient.getChainId();
    return chainId === sepolia.id;
  } catch (error) {
    console.error('Error checking chain:', error);
    return false;
  }
}

// Get current chain ID
export async function getCurrentChainId(): Promise<number | null> {
  try {
    if (!walletClient) return null;
    return await walletClient.getChainId();
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
}

// Check provider health
export async function checkProviderHealth(): Promise<{
  healthy: boolean;
  chainId?: number;
  blockNumber?: bigint;
  error?: string;
}> {
  try {
    const chainId = await publicClient.getChainId();
    const blockNumber = await publicClient.getBlockNumber();
    
    return {
      healthy: true,
      chainId,
      blockNumber,
    };
  } catch (error: unknown) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get account balance
export async function getAccountBalance(address: Address): Promise<{
  balance: bigint;
  formatted: string;
} | null> {
  try {
    const balance = await publicClient.getBalance({ address });
    const formatted = (Number(balance) / 1e18).toFixed(4);
    
    return {
      balance,
      formatted: `${formatted} ETH`,
    };
  } catch (error) {
    console.error('Error getting balance:', error);
    return null;
  }
}

// Estimate gas for transaction
export async function estimateGas({
  account,
  to,
  data,
  value
}: {
  account: Address;
  to: Address;
  data?: `0x${string}`;
  value?: bigint;
}): Promise<{
  gasEstimate: bigint;
  gasPrice: bigint;
  totalCost: bigint;
  formatted: string;
} | null> {
  try {
    const gasEstimate = await publicClient.estimateGas({
      account,
      to,
      data,
      value,
    });
    
    const gasPrice = await publicClient.getGasPrice();
    const totalCost = gasEstimate * gasPrice;
    const formatted = (Number(totalCost) / 1e18).toFixed(6);
    
    return {
      gasEstimate,
      gasPrice,
      totalCost,
      formatted: `${formatted} ETH`,
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    return null;
  }
}

// Wait for transaction confirmation
export async function waitForTransaction(
  hash: `0x${string}`,
  confirmations: number = 1
): Promise<{
  success: boolean;
  receipt?: TransactionReceipt;
  error?: string;
}> {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations,
    });
    
    return {
      success: receipt.status === 'success',
      receipt,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

// Get transaction details
export async function getTransaction(hash: `0x${string}`) {
  try {
    return await publicClient.getTransaction({ hash });
  } catch (error) {
    console.error('Error getting transaction:', error);
    return null;
  }
}

// Get current gas price
export async function getGasPrice(): Promise<{
  wei: bigint;
  gwei: string;
  formatted: string;
} | null> {
  try {
    const gasPrice = await publicClient.getGasPrice();
    const gwei = (Number(gasPrice) / 1e9).toFixed(2);
    
    return {
      wei: gasPrice,
      gwei: `${gwei} gwei`,
      formatted: `${gwei} gwei`,
    };
  } catch (error) {
    console.error('Error getting gas price:', error);
    return null;
  }
}

// Switch to Sepolia network
export async function switchToSepolia(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!walletClient) {
      return {
        success: false,
        error: 'Wallet not connected',
      };
    }

    await walletClient.switchChain({ id: sepolia.id });
    return { success: true };
  } catch (error: unknown) {
    // If the chain hasn't been added to MetaMask, add it
    if (error && typeof error === 'object' && 'code' in error && error.code === 4902) {
      try {
        await walletClient!.addChain({ chain: sepolia });
        return { success: true };
      } catch (addError: unknown) {
        return {
          success: false,
          error: addError instanceof Error ? addError.message : 'Failed to add Sepolia network',
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to switch network',
    };
  }
}

// Utility functions
export function getEtherscanUrl(
  hashOrAddress: string,
  type: 'address' | 'tx' = 'address'
): string {
  return `https://sepolia.etherscan.io/${type}/${hashOrAddress}`;
}

export function formatEther(wei: bigint, decimals: number = 4): string {
  return (Number(wei) / 1e18).toFixed(decimals);
}

export function parseEther(eth: string): bigint {
  return BigInt(Math.floor(parseFloat(eth) * 1e18));
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}