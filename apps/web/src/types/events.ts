import type { Address, Hash } from 'viem';

/**
 * Base event interface for all CredentialRegistry events
 */
export interface BaseEvent {
  blockNumber: bigint;
  blockHash: Hash;
  transactionHash: Hash;
  transactionIndex: number;
  logIndex: number;
  removed: boolean;
}

/**
 * CredentialIssued event data
 */
export interface CredentialIssuedEventArgs {
  credentialId: Hash;
  issuer: Address;
  subject: Address;
  metadataURI: string;
  timestamp: bigint;
}

export interface CredentialIssuedEvent extends BaseEvent {
  eventName: 'CredentialIssued';
  args: CredentialIssuedEventArgs;
}

/**
 * CredentialRevoked event data
 */
export interface CredentialRevokedEventArgs {
  credentialId: Hash;
  issuer: Address;
  reason: string;
  timestamp: bigint;
}

export interface CredentialRevokedEvent extends BaseEvent {
  eventName: 'CredentialRevoked';
  args: CredentialRevokedEventArgs;
}

/**
 * Union type for all credential registry events
 */
export type CredentialRegistryEvent = CredentialIssuedEvent | CredentialRevokedEvent;

/**
 * Event filter options
 */
export interface EventFilterOptions {
  fromBlock?: bigint;
  toBlock?: bigint | 'latest';
  issuer?: Address;
  subject?: Address;
  credentialId?: Hash;
}

/**
 * Analytics data derived from events
 */
export interface EventAnalytics {
  totalIssued: number;
  totalRevoked: number;
  activeCredentials: number;
  issuedByDay: Array<{
    date: string;
    count: number;
  }>;
  revokedByDay: Array<{
    date: string;
    count: number;
  }>;
  topIssuers: Array<{
    address: Address;
    count: number;
  }>;
}

/**
 * Verification tracking data stored in localStorage
 */
export interface VerificationData {
  credentialId: Hash;
  timestamp: number;
  success: boolean;
  issuer?: Address;
  subject?: Address;
}

export interface VerificationStats {
  totalVerifications: number;
  successfulVerifications: number;
  successRate: number;
  recentVerifications: VerificationData[];
}