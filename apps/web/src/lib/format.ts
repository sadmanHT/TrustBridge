import { Address } from 'viem';

/**
 * Format an Ethereum address to a shortened version
 * @param address - The full Ethereum address
 * @param startLength - Number of characters to show at the start (default: 6)
 * @param endLength - Number of characters to show at the end (default: 4)
 * @returns Formatted address like "0x1234...5678"
 */
export function formatAddress(
  address: string | Address,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address) return '';
  
  if (address.length <= startLength + endLength) {
    return address;
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format a transaction hash to a shortened version
 * @param hash - The full transaction hash
 * @param startLength - Number of characters to show at the start (default: 10)
 * @param endLength - Number of characters to show at the end (default: 8)
 * @returns Formatted hash like "0x1234567890...abcdef12"
 */
export function formatTxHash(
  hash: string,
  startLength: number = 10,
  endLength: number = 8
): string {
  if (!hash) return '';
  
  if (hash.length <= startLength + endLength) {
    return hash;
  }
  
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

/**
 * Format a document hash for display
 * @param hash - The document hash
 * @param length - Total length to display (default: 16)
 * @returns Formatted hash
 */
export function formatDocHash(hash: string, length: number = 16): string {
  if (!hash) return '';
  
  if (hash.length <= length) {
    return hash;
  }
  
  const halfLength = Math.floor(length / 2);
  return `${hash.slice(0, halfLength)}...${hash.slice(-halfLength)}`;
}

/**
 * Format file size in bytes to human readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size like "1.23 MB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format timestamp to human readable date
 * @param timestamp - Unix timestamp (in seconds or milliseconds)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatTimestamp(
  timestamp: number | bigint,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  
  // Convert to milliseconds if timestamp is in seconds
  const date = new Date(ts < 1e12 ? ts * 1000 : ts);
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param timestamp - Unix timestamp (in seconds or milliseconds)
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const date = new Date(ts < 1e12 ? ts * 1000 : ts);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

/**
 * Format IPFS CID for display
 * @param cid - IPFS Content Identifier
 * @param length - Total length to display (default: 20)
 * @returns Formatted CID
 */
export function formatCID(cid: string, length: number = 20): string {
  if (!cid) return '';
  
  if (cid.length <= length) {
    return cid;
  }
  
  const halfLength = Math.floor(length / 2);
  return `${cid.slice(0, halfLength)}...${cid.slice(-halfLength)}`;
}

/**
 * Get IPFS gateway URL for a CID
 * @param cid - IPFS Content Identifier
 * @param gateway - Gateway URL (default: ipfs.io)
 * @returns Full gateway URL
 */
export function getIPFSUrl(cid: string, gateway: string = 'https://ipfs.io'): string {
  if (!cid) return '';
  return `${gateway}/ipfs/${cid}`;
}

/**
 * Validate and format Ethereum address
 * @param address - Address to validate and format
 * @returns Formatted address or null if invalid
 */
export function validateAndFormatAddress(address: string): string | null {
  if (!address) return null;
  
  // Basic Ethereum address validation
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) {
    return null;
  }
  
  return address.toLowerCase();
}

/**
 * Validate document hash format
 * @param hash - Hash to validate
 * @returns True if valid hash format
 */
export function isValidDocumentHash(hash: string): boolean {
  if (!hash) return false;
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

/**
 * Format error message for user display
 * @param error - Error object or string
 * @returns User-friendly error message
 */
export function formatError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    // Handle common Web3 errors
    if (error.message.includes('User rejected')) {
      return 'Transaction was rejected by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('gas required exceeds allowance')) {
      return 'Transaction would exceed gas limit';
    }
    if (error.message.includes('nonce too low')) {
      return 'Transaction nonce is too low';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Format network name from chain ID
 * @param chainId - Chain ID number
 * @returns Human readable network name
 */
export function formatNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    5: 'Goerli Testnet',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
  };
  
  return networks[chainId] || `Unknown Network (${chainId})`;
}