import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  add,
  getAll,
  getById,
  enqueueOperation,
  getAllQueued,
  getQueueLength,
  getIdMap,
  remove,
  dequeueOperation,
  clearAllIdMaps,
  saveIdMap,
} from '../src/api/indexeddb';
import { runSync } from '../src/utils/sync-service';
import { apiFetch } from '../src/api/custom-fetch';

// Mock the network custom-fetch client
vi.mock('../src/api/custom-fetch', () => ({
  apiFetch: vi.fn(),
}));

describe('Offline Sync Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Clear databases and queue
    const products = await getAll('products');
    for (const p of products) {
      await remove('products', p.id);
    }
    const categories = await getAll('categories');
    for (const c of categories) {
      await remove('categories', c.id);
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

  it('should successfully sync create, update, and delete actions', async () => {
    // 1. Mock API fetch to return new record ID
    apiFetch.mockImplementation(async (path, options) => {
      if (path === '/products' && options.method === 'POST') {
        return { data: { id: 12345 } };
      }
      // For backend cache refreshes at the end of runSync
      return { data: [] };
    });

    // 2. Add local product
    const localId = await add('products', { name: 'Local Product', quantity: 10 });
    await enqueueOperation({
      operation: 'create',
      endpoint: 'products',
      payload: { name: 'Local Product', quantity: 10, id: localId },
      localId,
    });

    expect(await getQueueLength()).toBe(1);

    // 3. Execute runSync
    await runSync();

    // Verify apiFetch post request
    expect(apiFetch).toHaveBeenCalledWith('/products', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Local Product', quantity: 10, id: localId }),
    }));

    // Queue should be processed and empty
    expect(await getQueueLength()).toBe(0);

    // ID should be mapped
    const mapping = await getIdMap('products', localId);
    expect(mapping).toBeDefined();
    expect(mapping.backendId).toBe(12345);

    // The local record should be updated with the backend ID
    const productWithBackendId = await getById('products', 12345);
    expect(productWithBackendId).toBeDefined();
    expect(productWithBackendId.name).toBe('Local Product');
    expect(productWithBackendId.id).toBe(12345);

    // 4. Mock UPDATE
    apiFetch.mockReset();
    apiFetch.mockImplementation(async (path, options) => {
      return { data: [] };
    });

    // Enqueue update action
    await enqueueOperation({
      operation: 'update',
      endpoint: 'products',
      payload: { id: 12345, name: 'Local Product Updated', quantity: 12 },
    });

    await runSync();

    expect(apiFetch).toHaveBeenCalledWith('/products/12345', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ id: 12345, name: 'Local Product Updated', quantity: 12 }),
    }));
    expect(await getQueueLength()).toBe(0);

    // 5. Mock DELETE
    apiFetch.mockReset();
    apiFetch.mockImplementation(async (path, options) => {
      return { data: [] };
    });

    // Enqueue delete action
    await enqueueOperation({
      operation: 'delete',
      endpoint: 'products',
      payload: { id: 12345 },
    });

    await runSync();

    expect(apiFetch).toHaveBeenCalledWith('/products/12345', expect.objectContaining({
      method: 'DELETE',
    }));
    expect(await getQueueLength()).toBe(0);

    // 6. Mock ENTRY with local ID resolving
    apiFetch.mockReset();
    apiFetch.mockImplementation(async (path, options) => {
      return { data: [] };
    });

    const localIdForEntry = 999;
    await saveIdMap({ localId: localIdForEntry, endpoint: 'products', backendId: 54321 });

    await enqueueOperation({
      operation: 'entry',
      endpoint: 'products',
      payload: { id: localIdForEntry, quantity: 5, notes: 'Restock' },
    });

    await runSync();

    expect(apiFetch).toHaveBeenCalledWith('/products/54321/entry', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ quantity: 5, notes: 'Restock' }),
    }));
    expect(await getQueueLength()).toBe(0);

    // 7. Mock WITHDRAWAL
    apiFetch.mockReset();
    apiFetch.mockImplementation(async (path, options) => {
      return { data: [] };
    });

    await enqueueOperation({
      operation: 'withdrawal',
      endpoint: 'products',
      payload: { id: 54321, quantity: 2, notes: 'Damaged' },
    });

    await runSync();

    expect(apiFetch).toHaveBeenCalledWith('/products/54321/withdrawal', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ quantity: 2, notes: 'Damaged' }),
    }));
    expect(await getQueueLength()).toBe(0);
  });
});
