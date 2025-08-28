import { format, subDays } from 'date-fns';
import type { Address, Hash } from 'viem';
import {
  getIssuedEvents,
  getRevokedEvents,
} from './indexer';
import type {
  EventAnalytics,
  VerificationData,
  VerificationStats,
  EventFilterOptions,
} from '../types/events';
import type {
  NormalizedIssuedEvent,
  NormalizedRevokedEvent,
} from './indexer';

// LocalStorage keys
const VERIFICATION_SUCCESS_KEY = 'tb_verifications_success';
const VERIFICATION_HISTORY_KEY = 'tb_verification_history';


// Session storage for deduplication
const sessionVerifications: Set<Hash> = new Set();

/**
 * Get analytics data from blockchain events
 */
export async function getEventAnalytics(options: EventFilterOptions = {}): Promise<EventAnalytics> {
  try {
    const [issuedEvents, revokedEvents] = await Promise.all([
      getIssuedEvents(options),
      getRevokedEvents(options),
    ]);

    const totalIssued = issuedEvents.length;
    const totalRevoked = revokedEvents.length;
    const activeCredentials = totalIssued - totalRevoked;

    // Group events by day
    const issuedByDay = groupEventsByDay(issuedEvents);
    const revokedByDay = groupEventsByDay(revokedEvents);

    // Get top issuers
    const topIssuers = getTopIssuers(issuedEvents);

    return {
      totalIssued,
      totalRevoked,
      activeCredentials,
      issuedByDay,
      revokedByDay,
      topIssuers,
    };
  } catch (error) {
    console.error('Error getting event analytics:', error);
    return {
      totalIssued: 0,
      totalRevoked: 0,
      activeCredentials: 0,
      issuedByDay: [],
      revokedByDay: [],
      topIssuers: [],
    };
  }
}

/**
 * Group events by day for chart visualization
 */
function groupEventsByDay(events: (NormalizedIssuedEvent | NormalizedRevokedEvent)[]): Array<{ date: string; count: number }> {
  const eventsByDay = new Map<string, number>();

  // Initialize last 30 days with 0 counts
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    eventsByDay.set(date, 0);
  }

  // Count actual events using the timestamp from normalized events
  events.forEach((event) => {
    const date = format(new Date(Number(event.timestamp) * 1000), 'yyyy-MM-dd');
    const currentCount = eventsByDay.get(date) || 0;
    eventsByDay.set(date, currentCount + 1);
  });

  return Array.from(eventsByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top issuers by credential count
 */
function getTopIssuers(events: NormalizedIssuedEvent[], limit = 10): Array<{ address: Address; count: number }> {
  const issuerCounts = new Map<Address, number>();

  events.forEach((event) => {
    const issuer = event.issuer;
    const currentCount = issuerCounts.get(issuer) || 0;
    issuerCounts.set(issuer, currentCount + 1);
  });

  return Array.from(issuerCounts.entries())
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Bump verification success with session-based deduplication
 * Only tracks unique hashes per session to avoid duplicate counting
 */
export function bumpVerificationSuccess(hash: Hash): void {
  try {
    // Check if already verified in this session
    if (sessionVerifications.has(hash)) {
      return; // Skip duplicate verification in same session
    }

    // Add to session tracking
    sessionVerifications.add(hash);

    // Store timestamped entry in localStorage
    const verificationData: VerificationData = {
      credentialId: hash,
      timestamp: Date.now(),
      success: true,
    };

    addToVerificationHistory(verificationData);

    // Increment success counter
    const currentCount = getVerificationSuccessCount();
    localStorage.setItem(VERIFICATION_SUCCESS_KEY, (currentCount + 1).toString());
  } catch (error) {
    console.error('Error bumping verification success:', error);
  }
}

/**
 * Track a successful verification in localStorage
 */
export function trackVerificationSuccess(
  credentialId: Hash,
  issuer?: Address,
  subject?: Address
): void {
  try {
    // Increment success counter
    const currentCount = getVerificationSuccessCount();
    localStorage.setItem(VERIFICATION_SUCCESS_KEY, (currentCount + 1).toString());

    // Add to verification history
    const verificationData: VerificationData = {
      credentialId,
      timestamp: Date.now(),
      success: true,
      issuer,
      subject,
    };

    addToVerificationHistory(verificationData);
  } catch (error) {
    console.error('Error tracking verification success:', error);
  }
}

/**
 * Track a failed verification in localStorage
 */
export function trackVerificationFailure(
  credentialId: Hash,
  issuer?: Address,
  subject?: Address
): void {
  try {
    const verificationData: VerificationData = {
      credentialId,
      timestamp: Date.now(),
      success: false,
      issuer,
      subject,
    };

    addToVerificationHistory(verificationData);
  } catch (error) {
    console.error('Error tracking verification failure:', error);
  }
}

/**
 * Get the current verification success count from localStorage
 */
export function getVerificationSuccessCount(): number {
  try {
    const count = localStorage.getItem(VERIFICATION_SUCCESS_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting verification success count:', error);
    return 0;
  }
}

/**
 * Add verification data to history (keep last 100 entries)
 */
function addToVerificationHistory(data: VerificationData): void {
  try {
    const history = getVerificationHistory();
    history.unshift(data); // Add to beginning
    
    // Keep only last 100 entries
    const trimmedHistory = history.slice(0, 100);
    
    localStorage.setItem(VERIFICATION_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error adding to verification history:', error);
  }
}

/**
 * Get verification history from localStorage
 */
export function getVerificationHistory(): VerificationData[] {
  try {
    const history = localStorage.getItem(VERIFICATION_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting verification history:', error);
    return [];
  }
}

/**
 * Get comprehensive verification statistics
 */
export function getVerificationStats(): VerificationStats {
  try {
    const history = getVerificationHistory();
    const totalVerifications = history.length;
    const successfulVerifications = history.filter(v => v.success).length;
    const successRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0;
    
    // Get recent verifications (last 10)
    const recentVerifications = history.slice(0, 10);

    return {
      totalVerifications,
      successfulVerifications,
      successRate,
      recentVerifications,
    };
  } catch (error) {
    console.error('Error getting verification stats:', error);
    return {
      totalVerifications: 0,
      successfulVerifications: 0,
      successRate: 0,
      recentVerifications: [],
    };
  }
}

/**
 * Clear all verification data from localStorage
 */
export function clearVerificationData(): void {
  try {
    localStorage.removeItem(VERIFICATION_SUCCESS_KEY);
    localStorage.removeItem(VERIFICATION_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing verification data:', error);
  }
}

/**
 * Get analytics for a specific time period
 */
export async function getAnalyticsForPeriod(): Promise<EventAnalytics> {
  const fromBlock = BigInt(0);
  const toBlock = 'latest' as const;
  
  return getEventAnalytics({ fromBlock, toBlock });
}

/**
 * Get analytics for a specific issuer
 */
export async function getIssuerAnalytics(issuer: Address): Promise<EventAnalytics> {
  return getEventAnalytics({ issuer });
}

/**
 * Export verification data as JSON for backup/analysis
 */
export function exportVerificationData(): string {
  const stats = getVerificationStats();
  const history = getVerificationHistory();
  
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    stats,
    history,
  }, null, 2);
}

/**
 * Import verification data from JSON backup
 */
export function importVerificationData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.history && Array.isArray(data.history)) {
      localStorage.setItem(VERIFICATION_HISTORY_KEY, JSON.stringify(data.history));
      
      // Recalculate success count
      const successCount = data.history.filter((v: VerificationData) => v.success).length;
      localStorage.setItem(VERIFICATION_SUCCESS_KEY, successCount.toString());
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error importing verification data:', error);
    return false;
  }
}