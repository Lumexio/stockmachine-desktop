import { openDB } from 'idb';

const dbPromise = openDB('ps', 1, {
  upgrade(db) {
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