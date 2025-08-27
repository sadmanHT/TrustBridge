import { createPublicClient, createWalletClient, http, custom, PublicClient, WalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import { Address } from 'viem';

// Environment variables with fallbacks
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const RPC_URL = ALCHEMY_API_KEY 
  ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : 'https://rpc.sepolia.org';

/**
 * Create a public client for reading from the blockchain
 */
export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });
}

/**
 * Create a wallet client for writing to the blockchain
 * Requires window.ethereum (MetaMask or similar)
 */
export function getWalletClient(): WalletClient | null {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
}

/**
 * Check if the current network is Sepolia
 */
export async function isOnSepolia(): Promise<boolean> {
  try {
    const client = getPublicClient();
    const chainId = await client.getChainId();
    return chainId === sepolia.id;
  } catch (error) {
    console.error('Failed to check network:', error);
    return false;
  }
}

/**
 * Get the current chain ID
 */
export async function getCurrentChainId(): Promise<number | null> {
  try {
    const client = getPublicClient();
    return await client.getChainId();
  } catch (error) {
    console.error('Failed to get chain ID:', error);
    return null;
  }
}

/**
 * Check if the read provider is healthy
 */
export async function checkProviderHealth(): Promise<{
  healthy: boolean;
  chainId?: number;
  blockNumber?: bigint;
  error?: string;
}> {
  try {
    const client = getPublicClient();
    
    // Test basic connectivity
    const [chainId, blockNumber] = await Promise.all([
      client.getChainId(),
      client.getBlockNumber()
    ]);
    
    return {
      healthy: true,
      chainId,
      blockNumber
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get account balance in ETH
 */
export async function getAccountBalance(address: Address): Promise<{
  balance: bigint;
  formatted: string;
} | null> {
  try {
    const client = getPublicClient();
    const balance = await client.getBalance({ address });
    
    // Convert wei to ETH (18 decimals)
    const formatted = (Number(balance) / 1e18).toFixed(4);
    
    return {
      balance,
      formatted
    };
  } catch (error) {
    console.error('Failed to get balance:', error);
    return null;
  }
}

/**
 * Estimate gas for a transaction
 */
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
    const client = getPublicClient();
    
    const [gasEstimate, gasPrice] = await Promise.all([
      client.estimateGas({
        account,
        to,
        data,
        value
      }),
      client.getGasPrice()
    ]);
    
    const totalCost = gasEstimate * gasPrice + (value || BigInt(0));
    const formatted = (Number(totalCost) / 1e18).toFixed(6);
    
    return {
      gasEstimate,
      gasPrice,
      totalCost,
      formatted
    };
  } catch (error) {
    console.error('Failed to estimate gas:', error);
    return null;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  hash: `0x${string}`,
  confirmations: number = 1
): Promise<{
  success: boolean;
  receipt?: any;
  error?: string;
}> {
  try {
    const client = getPublicClient();
    
    const receipt = await client.waitForTransactionReceipt({
      hash,
      confirmations
    });
    
    return {
      success: receipt.status === 'success',
      receipt
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed'
    };
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(hash: `0x${string}`) {
  try {
    const client = getPublicClient();
    return await client.getTransaction({ hash });
  } catch (error) {
    console.error('Failed to get transaction:', error);
    return null;
  }
}

/**
 * Get current gas price in gwei
 */
export async function getGasPrice(): Promise<{
  wei: bigint;
  gwei: string;
  formatted: string;
} | null> {
  try {
    const client = getPublicClient();
    const gasPrice = await client.getGasPrice();
    
    const gwei = (Number(gasPrice) / 1e9).toFixed(2);
    const formatted = `${gwei} gwei`;
    
    return {
      wei: gasPrice,
      gwei,
      formatted
    };
  } catch (error) {
    console.error('Failed to get gas price:', error);
    return null;
  }
}

/**
 * Switch to Sepolia network (if supported by wallet)
 */
export async function switchToSepolia(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return {
        success: false,
        error: 'No wallet detected'
      };
    }
    
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
    });
    
    return { success: true };
  } catch (error: any) {
    // If the chain hasn't been added to the wallet
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: [RPC_URL],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
        
        return { success: true };
      } catch (addError) {
        return {
          success: false,
          error: 'Failed to add Sepolia network'
        };
      }
    }
    
    return {
      success: false,
      error: error.message || 'Failed to switch network'
    };
  }
}

/**
 * Get Etherscan URL for address or transaction
 */
export function getEtherscanUrl(
  hashOrAddress: string,
  type: 'address' | 'tx' = 'address'
): string {
  const baseUrl = 'https://sepolia.etherscan.io';
  return `${baseUrl}/${type}/${hashOrAddress}`;
}

/**
 * Format wei to ETH with specified decimals
 */
export function formatEther(wei: bigint, decimals: number = 4): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(decimals);
}

/**
 * Parse ETH to wei
 */
export function parseEther(eth: string): bigint {
  return BigInt(Math.floor(parseFloat(eth) * 1e18));
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if hash is valid transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}