import { describe, it, expect, beforeEach } from 'vitest';
import {
  add,
  getAll,
  getById,
  update,
  remove,
  enqueueOperation,
  getAllQueued,
  dequeueOperation,
  getQueueLength,
  saveIdMap,
  getIdMap,
  clearIdMap,
  clearAllIdMaps,
  replaceRecordId,
} from '../src/api/indexeddb';

describe('IndexedDB Client Operations', () => {
  beforeEach(async () => {
    // Clear stores before each test run
    const categories = await getAll('categories');
    for (const c of categories) {
      await remove('categories', c.id);
    }
    const products = await getAll('products');
    for (const p of products) {
      await remove('products', p.id);
    }
    const queued = await getAllQueued();
    for (const q of queued) {
      await dequeueOperation(q.id);
    }
    const history = await getAll('operation_history');
    for (const h of history) {
      await remove('operation_history', h.id);
    }
    await clearAllIdMaps();
  });

  it('should successfully add and retrieve operations from operation_history', async () => {
    const op = {
      entity_type: 'product',
      entity_id: 101,
      operation: 'entry',
      quantity_before: 10,
      quantity_after: 15,
      notes: 'Test restock',
      created_at: new Date().toISOString(),
    };
    const localId = await add('operation_history', op);
    expect(localId).toBeTypeOf('number');

    const retrieved = await getById('operation_history', localId);
    expect(retrieved).toBeDefined();
    expect(retrieved.entity_type).toBe('product');
    expect(retrieved.quantity_before).toBe(10);
    expect(retrieved.quantity_after).toBe(15);
  });

  it('should successfully add, retrieve, update, and delete categories', async () => {
    // Add category
    const category = { name: 'Electronics', description: 'Gadgets' };
    const localId = await add('categories', category);
    expect(localId).toBeTypeOf('number');

    // Get category by ID
    const retrieved = await getById('categories', localId);
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('Electronics');
    expect(retrieved.description).toBe('Gadgets');

    // Get all categories
    const all = await getAll('categories');
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(localId);

    // Update category
    retrieved.name = 'Home Electronics';
    await update('categories', retrieved);
    const updated = await getById('categories', localId);
    expect(updated.name).toBe('Home Electronics');

    // Remove category
    await remove('categories', localId);
    const deleted = await getById('categories', localId);
    expect(deleted).toBeUndefined();
  });

  it('should manage the sync queue correctly', async () => {
    expect(await getQueueLength()).toBe(0);

    // Enqueue
    const op = {
      operation: 'create',
      endpoint: 'products',
      payload: { name: 'Phone', quantity: 5 },
      localId: 101,
    };
    await enqueueOperation(op);
    expect(await getQueueLength()).toBe(1);

    // Get queued items
    const queued = await getAllQueued();
    expect(queued.length).toBe(1);
    expect(queued[0].payload.name).toBe('Phone');
    expect(queued[0].operation).toBe('create');

    // Dequeue
    await dequeueOperation(queued[0].id);
    expect(await getQueueLength()).toBe(0);
  });

  it('should manage local-to-backend ID maps correctly', async () => {
    // Save map
    await saveIdMap({ localId: 45, endpoint: 'products', backendId: 9999 });

    // Retrieve map
    const mapped = await getIdMap('products', 45);
    expect(mapped).toBeDefined();
    expect(mapped.backendId).toBe(9999);

    // Clear specific ID map
    await clearIdMap('products', 45);
    const cleared = await getIdMap('products', 45);
    expect(cleared).toBeNull();

    // Clear all ID maps
    await saveIdMap({ localId: 46, endpoint: 'products', backendId: 10000 });
    await clearAllIdMaps();
    const allCleared = await getIdMap('products', 46);
    expect(allCleared).toBeNull();
  });

  it('should support replacing a local record ID with backend ID', async () => {
    const item = { name: 'ItemA', quantity: 1 };
    const localId = await add('products', item);

    // Replace the ID
    const newRecord = { ...item, id: 777 };
    await replaceRecordId('products', localId, newRecord);

    const oldRecord = await getById('products', localId);
    expect(oldRecord).toBeUndefined();

    const newRecordRetrieved = await getById('products', 777);
    expect(newRecordRetrieved).toBeDefined();
    expect(newRecordRetrieved.name).toBe('ItemA');
  });
});
