// Simple in-memory rate limiter for development
// In production, consider using Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 30) {
    this.windowMs = windowMs; // 1 minute default
    this.maxRequests = maxRequests; // 30 requests default
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // If no entry exists or the window has expired, create a new one
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.store.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    // Check if limit is exceeded
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  // Get current stats for debugging
  getStats(): { totalEntries: number; activeEntries: number } {
    const now = Date.now();
    let activeEntries = 0;
    
    for (const entry of this.store.values()) {
      if (now < entry.resetTime) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.store.size,
      activeEntries
    };
  }
}

// Create a singleton instance for the activity endpoint
export const activityRateLimiter = new InMemoryRateLimiter(60000, 30); // 30 requests per minute

// Helper function to create rate limit response headers
export function createRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Limit': '30',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  };
}