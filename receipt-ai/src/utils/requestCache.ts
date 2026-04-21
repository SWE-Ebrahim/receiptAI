/**
 * Request Cache Utility
 * 
 * Caches API responses to reduce redundant network calls
 * Uses TTL (Time-To-Live) for automatic expiration
 * Perfect for data that doesn't change frequently
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time-to-live in milliseconds
}

class RequestCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  // Default TTLs for different types of data
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SHORT_TTL = 1 * 60 * 1000;   // 1 minute
  private readonly LONG_TTL = 10 * 60 * 1000;   // 10 minutes

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Cache data with custom TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  /**
   * Remove specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific pattern (e.g., all receipts)
   */
  clearPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Predefined TTL helpers
  shortTTL(): number {
    return this.SHORT_TTL;
  }

  longTTL(): number {
    return this.LONG_TTL;
  }
}

// Singleton instance
export const requestCache = new RequestCache();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of requestCache['cache'].entries()) {
    if (now > item.timestamp + item.ttl) {
      requestCache['cache'].delete(key);
    }
  }
}, 5 * 60 * 1000);
