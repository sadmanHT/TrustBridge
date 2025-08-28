import { recoverMessageAddress } from 'viem'
import { Address } from 'viem'

/**
 * Verify a wallet signature and return the recovered address
 * @param message - The original message that was signed
 * @param signature - The signature to verify
 * @returns Promise<Address> - The recovered Ethereum address
 * @throws Error if signature verification fails
 */
export async function verifyWalletSignature(
  message: string,
  signature: `0x${string}`
): Promise<Address> {
  try {
    // Use viem's recoverMessageAddress to recover the address
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    })
    
    return recoveredAddress
  } catch (error) {
    throw new Error(`Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Verify that a signature was created by a specific address
 * @param message - The original message that was signed
 * @param signature - The signature to verify
 * @param expectedAddress - The address that should have created the signature
 * @returns Promise<boolean> - True if the signature is valid for the expected address
 */
export async function verifySignatureForAddress(
  message: string,
  signature: `0x${string}`,
  expectedAddress: Address
): Promise<boolean> {
  try {
    const recoveredAddress = await verifyWalletSignature(message, signature)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch {
    return false
  }
}

/**
 * Generate a message for wallet linking verification
 * @param nonce - Random nonce for security
 * @param timestamp - Timestamp for the message
 * @returns string - Formatted message for signing
 */
export function generateWalletLinkMessage(nonce: string, timestamp: number): string {
  return `Link wallet to TrustBridge account\n\nNonce: ${nonce}\nTimestamp: ${timestamp}`
}

/**
 * Validate signature format
 * @param signature - Signature to validate
 * @returns boolean - True if signature format is valid
 */
export function isValidSignatureFormat(signature: string): boolean {
  // Ethereum signatures are 65 bytes (130 hex chars + 0x prefix)
  const signatureRegex = /^0x[a-fA-F0-9]{130}$/
  return signatureRegex.test(signature)
}