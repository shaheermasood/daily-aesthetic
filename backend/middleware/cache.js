/**
 * Simple in-memory caching middleware
 */

class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live for each cache entry
  }

  /**
   * Generate cache key from request
   */
  generateKey(req) {
    const query = JSON.stringify(req.query || {});
    return `${req.method}:${req.path}:${query}`;
  }

  /**
   * Get value from cache
   */
  get(key) {
    const ttl = this.ttl.get(key);

    // Check if cache entry has expired
    if (ttl && Date.now() > ttl) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Set value in cache with TTL
   */
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlSeconds * 1000));
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Clear cache entries matching pattern
   */
  clearPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton cache instance
const cache = new Cache();

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 * @returns {Function} Express middleware
 */
function cacheMiddleware(ttl = 300) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = cache.generateKey(req);
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // Send cached response
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data) => {
      cache.set(key, data, ttl);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
}

/**
 * Middleware to invalidate cache after mutations
 * @param {string} pattern - Pattern to match cache keys
 */
function invalidateCache(pattern) {
  return (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Invalidate cache after successful response
    const invalidate = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.clearPattern(pattern);
      }
      return data;
    };

    res.json = (data) => {
      invalidate(data);
      return originalJson(data);
    };

    res.send = (data) => {
      invalidate(data);
      return originalSend(data);
    };

    next();
  };
}

/**
 * Clear all cache
 */
function clearAllCache() {
  cache.clear();
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return cache.getStats();
}

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache,
  clearAllCache,
  getCacheStats
};
