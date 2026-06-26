type CacheEntry<T> = {
  promise?: Promise<T>;
  timestamp: number;
  value?: T;
};

const DEFAULT_TTL = 15_000;
const cache = new Map<string, CacheEntry<unknown>>();

export function getCachedValue<T>(key: string, ttl = DEFAULT_TTL): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry || entry.value === undefined) {
    return undefined;
  }

  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return undefined;
  }

  return entry.value;
}

export function setCachedValue<T>(key: string, value: T): void {
  cache.set(key, { timestamp: Date.now(), value });
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function cached<T>(key: string, loader: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const hit = getCachedValue<T>(key, ttl);

  if (hit !== undefined) {
    return Promise.resolve(hit);
  }

  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing?.promise) {
    return existing.promise;
  }

  const promise = loader()
    .then((value) => {
      setCachedValue(key, value);
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { promise, timestamp: Date.now() });
  return promise;
}
