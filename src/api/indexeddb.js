import { openDB } from 'idb';

const dbPromise = openDB('ps', 4, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      // Create 'categories' object store and indexes
      const categoriesStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      categoriesStore.createIndex('name', 'name', { unique: false });
      categoriesStore.createIndex('description', 'description', { unique: false });
      categoriesStore.createIndex('created_at', 'created_at', { unique: false });
      categoriesStore.createIndex('updated_at', 'updated_at', { unique: false });

      // Create 'racks' object store and indexes
      const racksStore = db.createObjectStore('racks', { keyPath: 'id', autoIncrement: true });
      racksStore.createIndex('name', 'name', { unique: false });
      racksStore.createIndex('created_at', 'created_at', { unique: false });
      racksStore.createIndex('updated_at', 'updated_at', { unique: false });

      // Create 'products' object store and indexes
      const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      productsStore.createIndex('name', 'name', { unique: false });
      productsStore.createIndex('quantity', 'quantity', { unique: false });
      productsStore.createIndex('description', 'description', { unique: false });
      productsStore.createIndex('category_id', 'category_id', { unique: false });
      productsStore.createIndex('shelve_id', 'shelve_id', { unique: false });
      productsStore.createIndex('rack_id', 'rack_id', { unique: false });
      productsStore.createIndex('status_id', 'status_id', { unique: false });
      productsStore.createIndex('foto_product', 'foto_product', { unique: false });
      productsStore.createIndex('created_at', 'created_at', { unique: false });
      productsStore.createIndex('updated_at', 'updated_at', { unique: false });

      // Create 'shelves' object store and indexes
      const shelvesStore = db.createObjectStore('shelves', { keyPath: 'id', autoIncrement: true });
      shelvesStore.createIndex('name', 'name', { unique: false });
      shelvesStore.createIndex('created_at', 'created_at', { unique: false });
      shelvesStore.createIndex('updated_at', 'updated_at', { unique: false });

      // Create 'status' object store and indexes
      const statusStore = db.createObjectStore('status', { keyPath: 'id', autoIncrement: true });
      statusStore.createIndex('name', 'name', { unique: false });
      statusStore.createIndex('created_at', 'created_at', { unique: false });
      statusStore.createIndex('updated_at', 'updated_at', { unique: false });
    } // end oldVersion < 1

    if (oldVersion < 2) {
      // Sync queue: pending operations to replay to backend
      const syncQueueStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      syncQueueStore.createIndex('endpoint', 'endpoint', { unique: false });
      syncQueueStore.createIndex('createdAt', 'createdAt', { unique: false });

      // ID map: maps local IndexedDB IDs → backend-assigned IDs after a create syncs
      const idMapStore = db.createObjectStore('id_map', { keyPath: 'id', autoIncrement: true });
      idMapStore.createIndex('localId_endpoint', ['localId', 'endpoint'], { unique: false });
    }

    if (oldVersion < 3) {
      const historyStore = db.createObjectStore('operation_history', { keyPath: 'id', autoIncrement: true });
      historyStore.createIndex('created_at', 'created_at', { unique: false });
    }

    if (oldVersion < 4) {
      const suppliersStore = db.createObjectStore('suppliers', { keyPath: 'id', autoIncrement: true });
      suppliersStore.createIndex('name', 'name', { unique: false });
      suppliersStore.createIndex('created_at', 'created_at', { unique: false });
      suppliersStore.createIndex('updated_at', 'updated_at', { unique: false });
    }
  },
});

export const getAll = async (storeName) => {
  const db = await dbPromise;
  return db.getAll(storeName);
};

export const getById = async (storeName, id) => {
  const db = await dbPromise;
  return db.get(storeName, id);
};

export const add = async (storeName, value) => {
  const db = await dbPromise;
  return db.add(storeName, value);
};

export const update = async (storeName, value) => {
  const db = await dbPromise;
  return db.put(storeName, value);
};

export const remove = async (storeName, id) => {
  const db = await dbPromise;
  return db.delete(storeName, id);
};

export const exportAllData = async () => {
  const db = await dbPromise;
  const stores = db.objectStoreNames;
  const data = {};
  for (const store of stores) {
    data[store] = await db.getAll(store);
  }
  return data;
};

export const importAllData = async (data) => {
  const db = await dbPromise;
  for (const store in data) {
    for (const item of data[store]) {
      await db.add(store, item);
    }
  }
};

// ── Sync queue helpers ────────────────────────────────────────────────────────

/**
 * Enqueue a pending operation.
 * @param {{ operation: 'create'|'update'|'delete', endpoint: string, payload: object, localId?: number }} op
 */
export const enqueueOperation = async (op) => {
  const db = await dbPromise;
  return db.add('sync_queue', { ...op, retries: 0, createdAt: Date.now() });
};

/** Fetch all pending operations in creation order (FIFO). */
export const getAllQueued = async () => {
  const db = await dbPromise;
  return db.getAllFromIndex('sync_queue', 'createdAt');
};

/** Remove a processed queue entry by its id. */
export const dequeueOperation = async (id) => {
  const db = await dbPromise;
  return db.delete('sync_queue', id);
};

/** Increment retries count on a failed queue entry. */
export const incrementRetries = async (id) => {
  const db = await dbPromise;
  const entry = await db.get('sync_queue', id);
  if (entry) {
    entry.retries = (entry.retries || 0) + 1;
    await db.put('sync_queue', entry);
  }
};

/** Count pending queue entries. */
export const getQueueLength = async () => {
  const db = await dbPromise;
  return db.count('sync_queue');
};

// ── ID map helpers ────────────────────────────────────────────────────────────

/**
 * Save a mapping from a local IndexedDB ID to a backend-assigned ID.
 * @param {{ localId: number, endpoint: string, backendId: number }} entry
 */
export const saveIdMap = async (entry) => {
  const db = await dbPromise;
  return db.add('id_map', entry);
};

/**
 * Resolve a local ID to its backend ID. Returns null if not mapped.
 * @param {string} endpoint
 * @param {number} localId
 */
export const getIdMap = async (endpoint, localId) => {
  const db = await dbPromise;
  const results = await db.getAllFromIndex('id_map', 'localId_endpoint', [localId, endpoint]);
  return results.length > 0 ? results[0] : null;
};

/** Remove a mapping once it's no longer needed (after full cache refresh). */
export const clearIdMap = async (endpoint, localId) => {
  const db = await dbPromise;
  const results = await db.getAllFromIndex('id_map', 'localId_endpoint', [localId, endpoint]);
  for (const r of results) {
    await db.delete('id_map', r.id);
  }
};

/** Clear ALL id_map entries (called after a successful full cache refresh). */
export const clearAllIdMaps = async () => {
  const db = await dbPromise;
  return db.clear('id_map');
};

/**
 * Replace a record's IndexedDB key with a new one (used after syncing a create).
 * Deletes the old record and inserts a new one with the backend id.
 */
export const replaceRecordId = async (storeName, oldId, newRecord) => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.delete(oldId);
  await tx.store.put(newRecord);
  await tx.done;
};