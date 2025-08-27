import { createPublicClient, http, getContract, parseAbiItem } from 'viem';
import { sepolia } from 'viem/chains';
import type { Address, Hash } from 'viem';
import contractConfig from '../contractConfig.json';
import type {
  CredentialIssuedEvent,
  CredentialRevokedEvent,
  CredentialRegistryEvent,
  EventFilterOptions
} from '../types/events';

// Types for normalized event data
export interface NormalizedIssuedEvent {
  hash: Hash;
  issuer: Address;
  dataURI: string;
  blockNumber: bigint;
  timestamp: bigint;
  logIndex: number;
}

export interface NormalizedRevokedEvent {
  hash: Hash;
  issuer: Address;
  blockNumber: bigint;
  timestamp: bigint;
  logIndex: number;
}

// In-memory cache interfaces
interface BlockTimestampCache {
  [blockNumber: string]: bigint;
}

interface BlockRangeCache {
  [key: string]: {
    issuedEvents: NormalizedIssuedEvent[];
    revokedEvents: NormalizedRevokedEvent[];
    timestamp: number;
  };
}

// Cache instances
const blockTimestampCache: BlockTimestampCache = {};
const blockRangeCache: BlockRangeCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Environment variables with fallbacks
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const RPC_URL = ALCHEMY_API_KEY 
  ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : 'https://rpc.sepolia.org';

// Contract configuration
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address) as Address;
const CONTRACT_ABI = contractConfig.abi;

/**
 * Create a public client for reading blockchain data
 */
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

/**
 * Get the CredentialRegistry contract instance
 */
export const getCredentialRegistryContract = () => {
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: publicClient,
  });
};

/**
 * Get cached block timestamp or fetch from blockchain
 */
async function getCachedBlockTimestamp(blockNumber: bigint): Promise<bigint> {
  const blockKey = blockNumber.toString();
  
  if (blockTimestampCache[blockKey]) {
    return blockTimestampCache[blockKey];
  }
  
  try {
    const block = await publicClient.getBlock({ blockNumber });
    blockTimestampCache[blockKey] = block.timestamp;
    return block.timestamp;
  } catch (error) {
    console.error(`Error fetching block ${blockNumber}:`, error);
    return BigInt(0);
  }
}

/**
 * Generate cache key for block range
 */
function generateCacheKey(fromBlock?: bigint | 'earliest', toBlock?: bigint | 'latest', issuer?: Address): string {
  const from = fromBlock === 'earliest' ? 'earliest' : fromBlock?.toString() || 'earliest';
  const to = toBlock === 'latest' ? 'latest' : toBlock?.toString() || 'latest';
  return `${from}-${to}-${issuer || 'all'}`;
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Get CredentialIssued events from the blockchain with normalized format
 */
export async function getIssuedEvents(options: EventFilterOptions = {}): Promise<NormalizedIssuedEvent[]> {
  try {
    const { fromBlock, toBlock, issuer, credentialId } = options;
    const cacheKey = generateCacheKey(fromBlock, toBlock, issuer);
    
    // Check cache first
    if (blockRangeCache[cacheKey] && isCacheValid(blockRangeCache[cacheKey].timestamp)) {
      return blockRangeCache[cacheKey].issuedEvents;
    }
    
    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: parseAbiItem('event CredentialIssued(bytes32 indexed hash, address indexed issuer, string cid)'),
      fromBlock: fromBlock || 'earliest',
      toBlock: toBlock || 'latest',
      args: issuer ? { issuer } : credentialId ? { hash: credentialId } : undefined,
    });

    // Fetch timestamps for all unique blocks
    // For both getIssuedEvents and getRevokedEvents functions
    const uniqueBlocks = Array.from(new Set(logs.map(log => log.blockNumber)));
    await Promise.all(uniqueBlocks.map(blockNumber => getCachedBlockTimestamp(blockNumber)));

    const normalizedEvents: NormalizedIssuedEvent[] = logs.map((log) => ({
      hash: log.args.hash!,
      issuer: log.args.issuer!,
      dataURI: log.args.cid!,
      blockNumber: log.blockNumber,
      timestamp: blockTimestampCache[log.blockNumber.toString()] || BigInt(0),
      logIndex: log.logIndex,
    }));

    // Update cache
    if (!blockRangeCache[cacheKey]) {
      blockRangeCache[cacheKey] = {
        issuedEvents: normalizedEvents,
        revokedEvents: [],
        timestamp: Date.now()
      };
    } else {
      blockRangeCache[cacheKey].issuedEvents = normalizedEvents;
      blockRangeCache[cacheKey].timestamp = Date.now();
    }

    return normalizedEvents;
  } catch (error) {
    console.error('Error fetching issued events:', error);
    return [];
  }
}

/**
 * Get CredentialRevoked events from the blockchain with normalized format
 */
export async function getRevokedEvents(options: EventFilterOptions = {}): Promise<NormalizedRevokedEvent[]> {
  try {
    const { fromBlock, toBlock, issuer, credentialId } = options;
    const cacheKey = generateCacheKey(fromBlock, toBlock, issuer);
    
    // Check cache first
    if (blockRangeCache[cacheKey] && isCacheValid(blockRangeCache[cacheKey].timestamp)) {
      return blockRangeCache[cacheKey].revokedEvents;
    }
    
    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: parseAbiItem('event CredentialRevoked(bytes32 indexed hash, address indexed issuer)'),
      fromBlock: fromBlock || 'earliest',
      toBlock: toBlock || 'latest',
      args: issuer ? { issuer } : credentialId ? { hash: credentialId } : undefined,
    });

    // Fetch timestamps for all unique blocks
    const uniqueBlocks = Array.from(new Set(logs.map(log => log.blockNumber)));
    await Promise.all(uniqueBlocks.map(blockNumber => getCachedBlockTimestamp(blockNumber)));

    const normalizedEvents: NormalizedRevokedEvent[] = logs.map((log) => ({
      hash: log.args.hash!,
      issuer: log.args.issuer!,
      blockNumber: log.blockNumber,
      timestamp: blockTimestampCache[log.blockNumber.toString()] || BigInt(0),
      logIndex: log.logIndex,
    }));

    // Update cache
    if (!blockRangeCache[cacheKey]) {
      blockRangeCache[cacheKey] = {
        issuedEvents: [],
        revokedEvents: normalizedEvents,
        timestamp: Date.now()
      };
    } else {
      blockRangeCache[cacheKey].revokedEvents = normalizedEvents;
      blockRangeCache[cacheKey].timestamp = Date.now();
    }

    return normalizedEvents;
  } catch (error) {
    console.error('Error fetching revoked events:', error);
    return [];
  }
}

/**
 * Get all credential registry events (issued + revoked)
 */
export async function getAllEvents(options: EventFilterOptions = {}): Promise<(NormalizedIssuedEvent | NormalizedRevokedEvent)[]> {
  const [issuedEvents, revokedEvents] = await Promise.all([
    getIssuedEvents(options),
    getRevokedEvents(options),
  ]);

  // Combine and sort by block number and log index
  const allEvents = [...issuedEvents, ...revokedEvents];
  return allEvents.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return Number(a.blockNumber - b.blockNumber);
    }
    return a.logIndex - b.logIndex;
  });
}

/**
 * Get events for a specific credential ID
 */
export async function getCredentialEvents(credentialId: Hash): Promise<(NormalizedIssuedEvent | NormalizedRevokedEvent)[]> {
  const [issuedEvents, revokedEvents] = await Promise.all([
    getIssuedEvents({ credentialId }),
    getRevokedEvents({ credentialId }),
  ]);

  const allEvents = [...issuedEvents, ...revokedEvents];
  return allEvents.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return Number(a.blockNumber - b.blockNumber);
    }
    return a.logIndex - b.logIndex;
  });
}

/**
 * Get the current block number
 */
export async function getCurrentBlockNumber(): Promise<bigint> {
  return await publicClient.getBlockNumber();
}

/**
 * Get block timestamp for a given block number
 */
export async function getBlockTimestamp(blockNumber: bigint): Promise<bigint> {
  const block = await publicClient.getBlock({ blockNumber });
  return block.timestamp;
}

/**
 * Check if a credential is currently valid (issued and not revoked)
 */
export async function isCredentialValid(credentialId: Hash): Promise<boolean> {
  try {
    const contract = getCredentialRegistryContract();
    const credential = await contract.read.credentials([credentialId]) as [Address, boolean, string];
    return credential[1]; // valid field
  } catch (error) {
    console.error('Error checking credential validity:', error);
    return false;
  }
}

/**
 * Get credential details from the contract
 */
export async function getCredentialDetails(credentialId: Hash) {
  try {
    const contract = getCredentialRegistryContract();
    const result = await contract.read.credentials([credentialId]) as [Address, boolean, string];
    const [issuer, valid, cid] = result;
    return {
      issuer: issuer as Address,
      valid,
      cid,
    };
  } catch (error) {
    console.error('Error fetching credential details:', error);
    return null;
  }
}