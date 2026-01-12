/**
 * In-memory cache with TTL (Time-To-Live) support
 * Used for caching frequently accessed data like allowed domains and auth data
 */

const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const STALE_TTL = 30 * 60 * 1000; // 30 minutes for stale fallback

/**
 * Cache entry structure:
 * {
 *   value: any,
 *   expiresAt: number (timestamp),
 *   staleExpiresAt: number (timestamp for stale fallback)
 * }
 */

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @param {boolean} allowStale - If true, return stale cache if available (within stale TTL)
 * @returns {any|null} Cached value or null if not found/expired
 */
export function get(key, allowStale = false) {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }

  const now = Date.now();

  // Check if cache is still fresh
  if (now < entry.expiresAt) {
    return entry.value;
  }

  // Check if stale cache is allowed and still valid
  if (allowStale && now < entry.staleExpiresAt) {
    return entry.value;
  }

  // Cache expired, remove it
  cache.delete(key);
  return null;
}

/**
 * Set a value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export function set(key, value, ttl = DEFAULT_TTL) {
  const now = Date.now();
  const expiresAt = now + ttl;
  const staleExpiresAt = now + STALE_TTL;

  cache.set(key, {
    value,
    expiresAt,
    staleExpiresAt
  });
}

/**
 * Delete a specific cache entry
 * @param {string} key - Cache key to delete
 */
export function del(key) {
  cache.delete(key);
}

/**
 * Clear cache entries matching a pattern
 * @param {string} pattern - Pattern to match (supports wildcard *)
 * Examples:
 *   - "allowed_domains" - exact match
 *   - "client:*" - all client entries
 *   - "admin:*" - all admin entries
 */
export function clear(pattern) {
  if (!pattern.includes('*')) {
    // Exact match
    cache.delete(pattern);
    return;
  }

  // Pattern match
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache entries
 */
export function clearAll() {
  cache.clear();
}

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export function getStats() {
  const now = Date.now();
  let freshCount = 0;
  let staleCount = 0;
  let expiredCount = 0;

  for (const entry of cache.values()) {
    if (now < entry.expiresAt) {
      freshCount++;
    } else if (now < entry.staleExpiresAt) {
      staleCount++;
    } else {
      expiredCount++;
    }
  }

  return {
    total: cache.size,
    fresh: freshCount,
    stale: staleCount,
    expired: expiredCount
  };
}

/**
 * Clean up expired cache entries
 * This should be called periodically to free memory
 */
export function cleanup() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of cache.entries()) {
    if (now >= entry.staleExpiresAt) {
      cache.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanup();
  }, 10 * 60 * 1000);
}
