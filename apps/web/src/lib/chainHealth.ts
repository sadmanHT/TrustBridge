"use client";
import { getAddress } from "viem";
import { publicClient } from "@/lib/viem";
import { getContractAddress, contractABI as REGISTRY_ABI } from "@/lib/contract";

// Use fixed publicClient for all operations with timeout handling
const TIMEOUT_MS = 10000; // 10 second timeout

// Wrapper function to add timeout to any promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('RPC request timeout')), timeoutMs)
    )
  ]);
}

export async function checkChainHealth(account?: `0x${string}`) {
  const start = Date.now();
  const REGISTRY_ADDRESS = getContractAddress();
  
  if (!REGISTRY_ADDRESS) {
    return {
      chainId: null,
      expectedChainId: 11155111, // Sepolia
      blockNumber: null,
      contractHasCode: false,
      isIssuer: false,
      latencyMs: Date.now() - start,
      error: "Contract address not configured",
      userFriendlyError: "Configuration Error: Contract address is missing. Please check your environment setup."
    };
  }

  try {
    const [chainId, blockNumber, code] = await withTimeout(
      Promise.all([
        publicClient.getChainId(),
        publicClient.getBlockNumber(),
        publicClient.getCode({ address: REGISTRY_ADDRESS }),
      ])
    );
    const hasCode = Boolean(code && code !== "0x");

    let isIssuer = false;
    try {
      isIssuer = await withTimeout(
        publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: REGISTRY_ABI,
          functionName: "approvedIssuers",
          args: account ? [getAddress(account)] : [getAddress("0x0000000000000000000000000000000000000000")],
        })
      );
    } catch {}

    return {
      chainId,
      expectedChainId: 11155111, // Sepolia
      blockNumber,
      contractHasCode: hasCode,
      isIssuer,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userFriendlyError = "Network Error: Unable to connect to blockchain.";
    
    if (errorMessage.includes('timeout')) {
      userFriendlyError = "Connection Timeout: The blockchain network is not responding. Please check your internet connection and try again.";
    } else if (errorMessage.includes('fetch')) {
      userFriendlyError = "RPC Unreachable: Cannot connect to the blockchain network. Please verify your RPC configuration and try again.";
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('network')) {
      userFriendlyError = "Network Error: Please check your internet connection and RPC endpoint configuration.";
    }
    
    return {
      chainId: null,
      expectedChainId: 11155111, // Sepolia
      blockNumber: null,
      contractHasCode: false,
      isIssuer: false,
      latencyMs: Date.now() - start,
      error: errorMessage,
      userFriendlyError
    };
  }
}

export async function simulateIssue(docHash: `0x${string}`, cid: string, account: `0x${string}`) {
  const REGISTRY_ADDRESS = getContractAddress();
  
  if (!REGISTRY_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  try {
    // 1) Simulate with timeout
    const simulation = await withTimeout(
      publicClient.simulateContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "issueCredential",
        args: [docHash, cid ?? ""],
        account,
      })
    );
    
    // 2) Gas estimate with timeout
    const gas = await withTimeout(
      publicClient.estimateContractGas({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "issueCredential",
        args: [docHash, cid ?? ""],
        account,
      })
    );
    
    return { request: simulation.request, gas };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes('timeout')) {
      throw new Error('Connection Timeout: The blockchain network is not responding. Please check your internet connection and try again.');
    } else if (errorMessage.includes('fetch')) {
      throw new Error('RPC Unreachable: Cannot connect to the blockchain network. Please verify your RPC configuration and try again.');
    } else if (errorMessage.includes('insufficient funds')) {
      throw new Error('Insufficient Balance: You do not have enough ETH to cover the gas fees for this transaction.');
    } else if (errorMessage.includes('not approved') || errorMessage.includes('not issuer')) {
      throw new Error('Not Issuer-Approved: Your wallet address is not authorized to issue credentials.');
    }
    
    throw error; // Re-throw original error if no specific handling
  }
}

export interface ChainHealthResult {
  chainId: number | null;
  expectedChainId: number;
  blockNumber: bigint | null;
  contractHasCode: boolean;
  isIssuer: boolean;
  latencyMs: number;
  error?: string;
  userFriendlyError?: string;
}

export interface GasPriceResult {
  gasPrice: bigint | null;
  formatted: string;
  error?: string;
  userFriendlyError?: string;
}

export interface AccountBalanceResult {
  balance: bigint | null;
  formatted: string;
  error?: string;
  userFriendlyError?: string;
}

export interface FullDiagnosticsResult {
  chainHealth: ChainHealthResult;
  gasPrice: GasPriceResult;
  accountBalance: AccountBalanceResult | null;
  timestamp: string;
  hasErrors?: boolean;
}

export interface SimulationResult {
  request: {
    address: `0x${string}`;
    abi: readonly unknown[];
    functionName: string;
    args: readonly unknown[];
    account: `0x${string}`;
  };
  gas: bigint;
}

// Additional utility functions for comprehensive diagnostics
export async function checkGasPrice() {
  try {
    const gasPrice = await withTimeout(publicClient.getGasPrice());
    return {
      gasPrice,
      formatted: `${Number(gasPrice) / 1e9} gwei`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userFriendlyError = "Unable to fetch gas price";
    
    if (errorMessage.includes('timeout')) {
      userFriendlyError = "Connection timeout while fetching gas price";
    } else if (errorMessage.includes('fetch')) {
      userFriendlyError = "RPC unreachable - cannot fetch gas price";
    }
    
    return {
      gasPrice: null,
      formatted: "Unable to fetch",
      error: errorMessage,
      userFriendlyError
    };
  }
}

export async function checkAccountBalance(account: `0x${string}`) {
  try {
    const balance = await withTimeout(publicClient.getBalance({ address: account }));
    return {
      balance,
      formatted: `${Number(balance) / 1e18} ETH`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let userFriendlyError = "Unable to fetch account balance";
    
    if (errorMessage.includes('timeout')) {
      userFriendlyError = "Connection timeout while fetching balance";
    } else if (errorMessage.includes('fetch')) {
      userFriendlyError = "RPC unreachable - cannot fetch balance";
    }
    
    return {
      balance: null,
      formatted: "Unable to fetch",
      error: errorMessage,
      userFriendlyError
    };
  }
}

export async function runFullDiagnostics(account?: `0x${string}`) {
  try {
    // Run all checks concurrently with individual error handling
    const [chainHealth, gasPrice, accountBalance] = await Promise.allSettled([
      checkChainHealth(account),
      checkGasPrice(),
      account ? checkAccountBalance(account) : Promise.resolve(null)
    ]);
    
    const diagnostics = {
      chainHealth: chainHealth.status === 'fulfilled' ? chainHealth.value : {
        chainId: null,
        expectedChainId: 11155111,
        blockNumber: null,
        contractHasCode: false,
        isIssuer: false,
        latencyMs: 0,
        error: chainHealth.status === 'rejected' ? chainHealth.reason?.message || 'Chain health check failed' : undefined,
        userFriendlyError: 'Unable to connect to blockchain network. Please check your connection and try again.'
      },
      gasPrice: gasPrice.status === 'fulfilled' ? gasPrice.value : {
        gasPrice: null,
        formatted: 'Unable to fetch',
        error: gasPrice.status === 'rejected' ? gasPrice.reason?.message || 'Gas price check failed' : undefined,
        userFriendlyError: 'Unable to fetch current gas prices. You can still proceed with the transaction.'
      },
      accountBalance: accountBalance.status === 'fulfilled' ? accountBalance.value : account ? {
        balance: null,
        formatted: 'Unable to fetch',
        error: accountBalance.status === 'rejected' ? accountBalance.reason?.message || 'Balance check failed' : undefined,
        userFriendlyError: 'Unable to fetch account balance. Please ensure your wallet is connected.'
      } : null,
      timestamp: new Date().toISOString(),
      hasErrors: chainHealth.status === 'rejected' || gasPrice.status === 'rejected' || (account && accountBalance.status === 'rejected')
    };
    
    return diagnostics;
  } catch (error) {
    console.warn('Diagnostics failed, but allowing user to proceed', error);
    // Return safe fallback that doesn't block user actions
    return {
      chainHealth: {
        chainId: null,
        expectedChainId: 11155111,
        blockNumber: null,
        contractHasCode: false,
        isIssuer: false,
        latencyMs: 0,
        error: error instanceof Error ? error.message : 'Diagnostics failed',
        userFriendlyError: 'Network diagnostics failed. You can still try to proceed with your transaction.'
      },
      gasPrice: {
        gasPrice: null,
        formatted: 'Unable to fetch',
        error: 'Diagnostics failed',
        userFriendlyError: 'Unable to fetch gas prices, but you can still proceed.'
      },
      accountBalance: null,
      timestamp: new Date().toISOString(),
      hasErrors: true
    };
  }
}