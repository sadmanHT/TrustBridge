/**
 * Crypto utilities for TrustBridge
 * Handles SHA-256 hash generation using Web Crypto API
 */

/**
 * Generate SHA-256 hash of a file
 * @param file - File object to hash
 * @returns Promise<string> - Hex string of the hash with 0x prefix
 */
export async function generateFileHash(file: File): Promise<string> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return with 0x prefix for Ethereum compatibility
    return `0x${hashHex}`;
  } catch (error) {
    console.error('Error generating file hash:', error);
    throw new Error('Failed to generate file hash');
  }
}

/**
 * Generate SHA-256 hash of a string
 * @param text - String to hash
 * @returns Promise<string> - Hex string of the hash with 0x prefix
 */
export async function generateTextHash(text: string): Promise<string> {
  try {
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return with 0x prefix for Ethereum compatibility
    return `0x${hashHex}`;
  } catch (error) {
    console.error('Error generating text hash:', error);
    throw new Error('Failed to generate text hash');
  }
}

/**
 * Validate if a string is a valid SHA-256 hash
 * @param hash - Hash string to validate
 * @returns boolean - True if valid hash format
 */
export function isValidHash(hash: string): boolean {
  // Check if it starts with 0x and has 64 hex characters
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  return hashRegex.test(hash);
}

/**
 * Convert bytes32 to hex string
 * @param bytes32 - Bytes32 value
 * @returns string - Hex string with 0x prefix
 */
export function bytes32ToHex(bytes32: string): string {
  if (bytes32.startsWith('0x')) {
    return bytes32;
  }
  return `0x${bytes32}`;
}

/**
 * Convert hex string to bytes32
 * @param hex - Hex string (with or without 0x prefix)
 * @returns string - Bytes32 string
 */
export function hexToBytes32(hex: string): string {
  let cleanHex = hex;
  if (hex.startsWith('0x')) {
    cleanHex = hex.slice(2);
  }
  
  // Pad to 64 characters if needed
  return cleanHex.padStart(64, '0');
}

/**
 * Truncate hash for display purposes
 * @param hash - Full hash string
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns string - Truncated hash with ellipsis
 */
export function truncateHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (hash.length <= startChars + endChars) {
    return hash;
  }
  
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if Web Crypto API is available
 * @returns boolean - True if Web Crypto API is supported
 */
export function isCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' && 
         typeof crypto.subtle.digest === 'function';
}

/**
 * Generate a random hex string for testing purposes
 * @param length - Length of hex string (default: 64 for SHA-256)
 * @returns string - Random hex string with 0x prefix
 */
export function generateRandomHash(length: number = 64): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}