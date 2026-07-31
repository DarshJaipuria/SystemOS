/**
 * Caching Abstraction Layer
 * Currently wraps a memory store, ready to be scaled to Redis.
 */

class MemoryCacheStore {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  get(key) {
    if (this.isExpired(key)) {
      this.delete(key);
      return null;
    }
    return this.store.get(key) ?? null;
  }

  set(key, value, ttlSeconds = 300) {
    this.store.set(key, value);
    this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    return true;
  }

  delete(key) {
    this.store.delete(key);
    this.ttls.delete(key);
    return true;
  }

  clear() {
    this.store.clear();
    this.ttls.clear();
    return true;
  }

  isExpired(key) {
    const expiry = this.ttls.get(key);
    if (!expiry) return true;
    return Date.now() > expiry;
  }

  invalidateNamespace(namespace) {
    for (const key of this.store.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        this.delete(key);
      }
    }
  }
}

const memoryStore = new MemoryCacheStore();

export const cache = {
  /**
   * Fetch a key from cache
   * @param {string} key
   * @returns {Promise<any>}
   */
  get: async (key) => {
    return memoryStore.get(key);
  },

  /**
   * Store a value in cache
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   * @returns {Promise<boolean>}
   */
  set: async (key, value, ttlSeconds = 300) => {
    return memoryStore.set(key, value, ttlSeconds);
  },

  /**
   * Delete a key from cache
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  delete: async (key) => {
    return memoryStore.delete(key);
  },

  /**
   * Invalidate all keys matching namespace pattern
   * @param {string} namespace
   * @returns {Promise<void>}
   */
  invalidateNamespace: async (namespace) => {
    memoryStore.invalidateNamespace(namespace);
  },

  /**
   * Helper to execute a function and cache its results
   */
  fetchOrCompute: async (key, computeFn, ttlSeconds = 300) => {
    const cached = await cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const computed = await computeFn();
    await cache.set(key, computed, ttlSeconds);
    return computed;
  }
};
