const CACHE_PREFIX = 'insperMind:api-cache:';
export const DEFAULT_CACHE_TTL = 10 * 60 * 1000;

const memoryCache = new Map();
const inFlightRequests = new Map();
let cacheRevision = 0;

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getStorageKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

function isFresh(entry) {
  return entry && entry.expiresAt > Date.now();
}

function readFromStorage(key) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const storageKey = getStorageKey(key);

  try {
    const rawEntry = storage.getItem(storageKey);

    if (!rawEntry) {
      return null;
    }

    const entry = JSON.parse(rawEntry);

    if (!isFresh(entry)) {
      storage.removeItem(storageKey);
      return null;
    }

    return entry;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
}

function writeToStorage(key, entry) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch {
    // Storage quota can fail silently for the app without breaking requests.
  }
}

function removeFromStorage(matcher) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const storageKey = storage.key(index);

      if (!storageKey?.startsWith(CACHE_PREFIX)) {
        continue;
      }

      const key = storageKey.slice(CACHE_PREFIX.length);

      if (matcher(key)) {
        storage.removeItem(storageKey);
      }
    }
  } catch {
    // If storage access fails, memory invalidation still protects this tab.
  }
}

export function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(',')}}`;
  }

  const serialized = JSON.stringify(value);
  return serialized === undefined ? String(value) : serialized;
}

export function createCacheKey(resource, action = 'default', params = {}) {
  return `${resource}:${action}:${stableSerialize(params)}`;
}

export async function cachedGet(key, fetcher, options = {}) {
  const { ttl = DEFAULT_CACHE_TTL, force = false } = options;

  if (!force) {
    const memoryEntry = memoryCache.get(key);

    if (isFresh(memoryEntry)) {
      return memoryEntry.data;
    }

    if (memoryEntry) {
      memoryCache.delete(key);
    }

    const storedEntry = readFromStorage(key);

    if (storedEntry) {
      memoryCache.set(key, storedEntry);
      return storedEntry.data;
    }

    const inFlight = inFlightRequests.get(key);

    if (inFlight) {
      return inFlight;
    }
  }

  const requestRevision = cacheRevision;
  const request = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      if (requestRevision === cacheRevision) {
        const entry = {
          data,
          expiresAt: Date.now() + ttl,
        };

        memoryCache.set(key, entry);
        writeToStorage(key, entry);
      }

      return data;
    })
    .finally(() => {
      if (inFlightRequests.get(key) === request) {
        inFlightRequests.delete(key);
      }
    });

  inFlightRequests.set(key, request);
  return request;
}

export function invalidateCache(scopes) {
  const scopeList = Array.isArray(scopes) ? scopes : [scopes];
  const normalizedScopes = scopeList.filter(Boolean);

  if (normalizedScopes.length === 0) {
    return;
  }

  cacheRevision += 1;

  const matches = (key) => normalizedScopes.some((scope) => key.startsWith(scope));

  for (const key of memoryCache.keys()) {
    if (matches(key)) {
      memoryCache.delete(key);
    }
  }

  for (const key of inFlightRequests.keys()) {
    if (matches(key)) {
      inFlightRequests.delete(key);
    }
  }

  removeFromStorage(matches);
}

export function clearApiCache() {
  cacheRevision += 1;
  memoryCache.clear();
  inFlightRequests.clear();
  removeFromStorage(() => true);
}
