/**
 * Internal cache entry wrapper.
 */
type CacheEntry<T> = { value: T; ts: number };

/**
 * Simple in-memory store for request-scoped caching.
 */
const store = new Map<string, CacheEntry<unknown>>();

/**
 * Read a cached value if it has not expired.
 */
export const cacheGet = <T>({ key, ttlMs }: { key: string; ttlMs: number }): T | null => {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

/**
 * Upsert a cached value with a timestamp.
 */
export const cacheSet = <T>({ key, value }: { key: string; value: T }): void => {
  store.set(key, { value, ts: Date.now() });
};
