import { Address } from 'viem';

// Contract ABI - generated from the TrustBridge contract
export const contractABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approveIssuer",
    "inputs": [
      {
        "name": "issuer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approvedIssuers",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "credentials",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "issuer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "valid",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "cidOrEmpty",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getApprovedIssuers",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCredentialDetails",
    "inputs": [
      {
        "name": "docHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "issuer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "valid",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "cidOrEmpty",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isApprovedIssuer",
    "inputs": [
      {
        "name": "issuer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "issueCredential",
    "inputs": [
      {
        "name": "docHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "cidOrEmpty",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "issuerList",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeCredential",
    "inputs": [
      {
        "name": "docHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeIssuer",
    "inputs": [
      {
        "name": "issuer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyCredential",
    "inputs": [
      {
        "name": "docHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "issuer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "valid",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "cidOrEmpty",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CredentialIssued",
    "inputs": [
      {
        "name": "docHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "issuer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "cidOrEmpty",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CredentialRevoked",
    "inputs": [
      {
        "name": "docHash",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "issuer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "IssuerApproved",
    "inputs": [
      {
        "name": "issuer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "IssuerRevoked",
    "inputs": [
      {
        "name": "issuer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "revoker",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "CredentialAlreadyExists",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CredentialAlreadyRevoked",
    "inputs": []
  },
  {
    "type": "error",
    "name": "CredentialNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "IssuerAlreadyApproved",
    "inputs": []
  },
  {
    "type": "error",
    "name": "IssuerNotApproved",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotApprovedIssuer",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnauthorizedRevocation",
    "inputs": []
  }
] as const;

// Contract address - will be set after deployment
export const contractAddress: Address = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) || '0x0000000000000000000000000000000000000000';

// Contract configuration for wagmi
export const contractConfig = {
  address: contractAddress,
  abi: contractABI,
} as const;

// Type definitions
export interface Credential {
  issuer: Address;
  valid: boolean;
  cidOrEmpty: string;
  timestamp: bigint;
}

export interface VerificationResult {
  issuer: Address;
  valid: boolean;
  cidOrEmpty: string;
}

export interface CredentialDetails extends VerificationResult {
  timestamp: bigint;
}

export interface ContractInfo {
  address: Address;
  owner: Address | null;
  isDeployed: boolean;
}

export interface IssuerStatus {
  address: Address;
  isApproved: boolean;
  error?: string;
}

// Re-export for compatibility
export { contractABI as TRUSTBRIDGE_ABI };

/**
 * Get contract address with validation
 */
export function getContractAddress(): Address | null {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    console.error('Invalid or missing NEXT_PUBLIC_CONTRACT_ADDRESS');
    return null;
  }
  return address as Address;
}

/**
 * Get read-only client for contract interactions
 */
export function getReadClient() {
  const { getPublicClient } = require('./viem');
  return getPublicClient();
}

/**
 * Get write client for contract interactions
 */
export function getWriteClient() {
  const { getWalletClient } = require('./viem');
  return getWalletClient();
}

/**
 * Verify a credential by document hash
 */
export async function verifyCredential(documentHash: `0x${string}`): Promise<VerificationResult> {
  try {
    const client = getReadClient();
    const address = getContractAddress();
    
    if (!address) {
      throw new Error('Contract address not configured');
    }

    const result = await client.readContract({
      address,
      abi: contractABI,
      functionName: 'verifyCredential',
      args: [documentHash]
    });

    const [issuer, valid, cidOrEmpty] = result as [Address, boolean, string];
    
    return {
      issuer,
      valid,
      cidOrEmpty
    };
  } catch (error) {
    console.error('Failed to verify credential:', error);
    throw new Error('Failed to verify credential on-chain');
  }
}

/**
 * Issue a new credential
 */
export async function issueCredential(
  documentHash: `0x${string}`,
  cid: string = '',
  account: Address
): Promise<`0x${string}`> {
  try {
    const client = getWriteClient();
    const address = getContractAddress();
    
    if (!client) {
      throw new Error('Wallet not connected');
    }
    
    if (!address) {
      throw new Error('Contract address not configured');
    }

    const hash = await client.writeContract({
      address,
      abi: contractABI,
      functionName: 'issueCredential',
      args: [documentHash, cid],
      account
    });

    return hash;
  } catch (error) {
    console.error('Failed to issue credential:', error);
    throw error;
  }
}

/**
 * Revoke a credential
 */
export async function revokeCredential(
  documentHash: `0x${string}`,
  account: Address
): Promise<`0x${string}`> {
  try {
    const client = getWriteClient();
    const address = getContractAddress();
    
    if (!client) {
      throw new Error('Wallet not connected');
    }
    
    if (!address) {
      throw new Error('Contract address not configured');
    }

    const hash = await client.writeContract({
      address,
      abi: contractABI,
      functionName: 'revokeCredential',
      args: [documentHash],
      account
    });

    return hash;
  } catch (error) {
    console.error('Failed to revoke credential:', error);
    throw error;
  }
}

/**
 * Check if an address is an approved issuer
 */
export async function checkIssuerStatus(issuerAddress: Address): Promise<IssuerStatus> {
  try {
    const client = getReadClient();
    const address = getContractAddress();
    
    if (!address) {
      return {
        address: issuerAddress,
        isApproved: false,
        error: 'Contract address not configured'
      };
    }

    const isApproved = await client.readContract({
      address,
      abi: contractABI,
      functionName: 'approvedIssuers',
      args: [issuerAddress]
    }) as boolean;

    return {
      address: issuerAddress,
      isApproved
    };
  } catch (error) {
    console.error('Failed to check issuer status:', error);
    return {
      address: issuerAddress,
      isApproved: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get contract information (address, owner, deployment status)
 */
export async function getContractInfo(): Promise<ContractInfo> {
  try {
    const client = getReadClient();
    const address = getContractAddress();
    
    if (!address) {
      return {
        address: '0x0000000000000000000000000000000000000000' as Address,
        owner: null,
        isDeployed: false
      };
    }

    // Check if contract is deployed by getting bytecode
    const bytecode = await client.getBytecode({ address });
    const isDeployed = !!bytecode && bytecode !== '0x';
    
    let owner: Address | null = null;
    
    if (isDeployed) {
      try {
        owner = await client.readContract({
          address,
          abi: contractABI,
          functionName: 'owner'
        }) as Address;
      } catch (error) {
        console.warn('Failed to get contract owner:', error);
      }
    }

    return {
      address,
      owner,
      isDeployed
    };
  } catch (error) {
    console.error('Failed to get contract info:', error);
    const address = getContractAddress();
    return {
      address: address || '0x0000000000000000000000000000000000000000' as Address,
      owner: null,
      isDeployed: false
    };
  }
}

/**
 * Parse contract error messages
 */
export function parseContractError(error: any): string {
  if (error?.message) {
    // Common error patterns
    if (error.message.includes('User rejected')) {
      return 'Transaction was rejected by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('execution reverted')) {
      return 'Transaction failed: Contract execution reverted';
    }
    if (error.message.includes('nonce too low')) {
      return 'Transaction failed: Nonce too low';
    }
    if (error.message.includes('gas')) {
      return 'Transaction failed: Gas estimation error';
    }
    
    return error.message;
  }
  
  return 'Unknown contract error';
}

/**
 * Convert string hash to bytes32 format
 */
export function stringToBytes32(str: string): `0x${string}` {
  if (str.startsWith('0x') && str.length === 66) {
    return str as `0x${string}`;
  }
  
  // If it's a 64-character hex string without 0x prefix
  if (str.length === 64 && /^[0-9a-fA-F]+$/.test(str)) {
    return `0x${str}` as `0x${string}`;
  }
  
  throw new Error('Invalid hash format. Expected 0x followed by 64 hex characters.');
}

/**
 * Validate document hash format
 */
export function isValidDocumentHash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}