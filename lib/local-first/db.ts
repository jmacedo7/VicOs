import type { LocalMutation } from "./types";

const DB_NAME = "vicos-local";
const DB_VERSION = 2;
const CACHE_STORE = "cache";
const MUTATION_STORE = "mutations";

type CacheRecord = {
  key: string;
  table: string;
  value: unknown;
  updatedAt: number;
};

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(MUTATION_STORE)) {
        const store = db.createObjectStore(MUTATION_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
        store.createIndex("nextAttemptAt", "nextAttemptAt");
        store.createIndex("status", "status");
      } else {
        const store = request.transaction?.objectStore(MUTATION_STORE);
        if (store && !store.indexNames.contains("nextAttemptAt")) {
          store.createIndex("nextAttemptAt", "nextAttemptAt");
        }
        if (store && !store.indexNames.contains("status")) {
          store.createIndex("status", "status");
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local database"));
  });
}

async function transaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest | T
): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result: T;

    try {
      const request = callback(store);
      if (request instanceof IDBRequest) {
        request.onsuccess = () => {
          result = request.result as T;
        };
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
      } else {
        result = request as T;
      }
    } catch (error) {
      reject(error);
      return;
    }

    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    };
  });
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    return await transaction<CacheRecord | undefined>(CACHE_STORE, "readonly", (store) => store.get(key)).then(
      (record) => (record?.value as T | undefined) ?? null
    );
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, table: string, value: T): Promise<void> {
  try {
    await transaction(CACHE_STORE, "readwrite", (store) =>
      store.put({ key, table, value, updatedAt: Date.now() } satisfies CacheRecord)
    );
  } catch {
    // Local cache must never break the primary application flow.
  }
}

export async function enqueueMutation(mutation: LocalMutation): Promise<void> {
  await transaction(MUTATION_STORE, "readwrite", (store) => store.put(mutation));
}

export async function listMutations(): Promise<LocalMutation[]> {
  try {
    const mutations = await transaction<LocalMutation[]>(MUTATION_STORE, "readonly", (store) => store.getAll());
    return mutations.sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export async function removeMutation(id: string): Promise<void> {
  await transaction(MUTATION_STORE, "readwrite", (store) => store.delete(id));
}

export async function updateMutation(mutation: LocalMutation): Promise<void> {
  await transaction(MUTATION_STORE, "readwrite", (store) => store.put(mutation));
}

export async function clearLocalFirstData(): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not clear local database"));
    request.onblocked = () => resolve();
  }).catch(() => {
    // Local cleanup must never prevent Supabase logout.
  });
}
