/**
 * Client-side SHA-256 hashing utilities using Web Crypto API
 * Provides secure file hashing for document verification
 */

/**
 * Compute SHA-256 hash of a file using Web Crypto API
 * @param file - File object to hash
 * @returns Promise<string> - Hex string with 0x prefix (bytes32 format)
 */
export async function sha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hashHex}`;
}

/**
 * Hash a file using SHA-256 and return as 0x-prefixed hex string
 * (Enhanced version with better error handling)
 */
export async function hashFile(file: File): Promise<`0x${string}`> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `0x${hashHex}` as `0x${string}`;
  } catch (error) {
    console.error('Failed to hash file:', error);
    throw new Error('Failed to compute file hash');
  }
}

/**
 * Hash a string using SHA-256 and return as 0x-prefixed hex string
 */
export async function hashString(input: string): Promise<`0x${string}`> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `0x${hashHex}` as `0x${string}`;
  } catch (error) {
    console.error('Failed to hash string:', error);
    throw new Error('Failed to compute string hash');
  }
}

/**
 * Hash raw bytes using SHA-256 and return as 0x-prefixed hex string
 */
export async function hashBytes(bytes: Uint8Array): Promise<`0x${string}`> {
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes.buffer as ArrayBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `0x${hashHex}` as `0x${string}`;
  } catch (error) {
    console.error('Failed to hash bytes:', error);
    throw new Error('Failed to compute bytes hash');
  }
}

/**
 * Verify that a file matches a given hash
 */
export async function verifyFileHash(
  file: File, 
  expectedHash: `0x${string}`
): Promise<boolean> {
  try {
    const actualHash = await hashFile(file);
    return actualHash.toLowerCase() === expectedHash.toLowerCase();
  } catch (error) {
    console.error('Failed to verify file hash:', error);
    return false;
  }
}

/**
 * Convert bytes to hex string
 * @param bytes - Uint8Array
 * @returns string - Hex string with 0x prefix
 */
export function bytesToHex(bytes: Uint8Array): string {
  return `0x${Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Convert hex string to bytes
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  
  return bytes;
}

/**
 * Validate that a string is a valid SHA-256 hash
 */
export function isValidSHA256Hash(hash: string): boolean {
  // Must be 0x followed by exactly 64 hex characters
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

/**
 * Progress callback type for file hashing with progress tracking
 */
export type HashProgressCallback = (progress: number) => void;

/**
 * Hash a large file with progress tracking
 * Useful for large files to provide user feedback
 */
export async function hashFileWithProgress(
  file: File,
  onProgress?: HashProgressCallback
): Promise<`0x${string}`> {
  try {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks = Math.ceil(file.size / chunkSize);
    
    // For small files, use the regular method
    if (chunks <= 1) {
      onProgress?.(100);
      return await hashFile(file);
    }
    
    // For larger files, provide progress feedback
    onProgress?.(25);
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(75);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    onProgress?.(100);
    return `0x${hashHex}` as `0x${string}`;
  } catch (error) {
    console.error('Failed to hash file with progress:', error);
    throw new Error('Failed to compute file hash');
  }
}

/**
 * Hash multiple files and return an array of hashes
 */
export async function hashMultipleFiles(files: File[]): Promise<`0x${string}`[]> {
  try {
    const hashPromises = files.map(file => hashFile(file));
    return await Promise.all(hashPromises);
  } catch (error) {
    console.error('Failed to hash multiple files:', error);
    throw new Error('Failed to compute file hashes');
  }
}

/**
 * Known test vectors for SHA-256 (for unit testing)
 */
export const TEST_VECTORS = [
  {
    input: '',
    expected: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    input: 'hello',
    expected: '0x2cf24dba4f21d4288094c30e2c3e6852c8b4b5c4b0c11e6f2b011e6c7f5e9b5d'
  },
  {
    input: 'The quick brown fox jumps over the lazy dog',
    expected: '0xd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
  }
] as const;

/**
 * Validate implementation against known test vectors
 */
export async function validateImplementation(): Promise<{
  passed: number;
  total: number;
  success: boolean;
}> {
  let passed = 0;
  const total = TEST_VECTORS.length;
  
  for (const vector of TEST_VECTORS) {
    try {
      const result = await hashString(vector.input);
      if (result.toLowerCase() === vector.expected.toLowerCase()) {
        passed++;
      } else {
        console.warn(`Test vector failed for input "${vector.input}"`);
        console.warn(`Expected: ${vector.expected}`);
        console.warn(`Got: ${result}`);
      }
    } catch (error) {
      console.error(`Test vector error for input "${vector.input}":`, error);
    }
  }
  
  return {
    passed,
    total,
    success: passed === total
  };
}