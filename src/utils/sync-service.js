import { apiFetch } from '../api/custom-fetch';
import {
  getAll,
  update,
  getAllQueued,
  dequeueOperation,
  incrementRetries,
  clearAllIdMaps,
  saveIdMap,
  getIdMap,
  replaceRecordId,
  getQueueLength,
} from '../api/indexeddb';
import { eventBus } from './eventBus';

const SYNC_STORES = ['products', 'categories', 'shelves', 'racks', 'status'];

/** Resolve a potentially-local ID against the id_map. */
async function resolveId(endpoint, id) {
  const mapped = await getIdMap(endpoint, id);
  return mapped ? mapped.backendId : id;
}

/**
 * Resolve any FK fields in a payload that might point to locally-created records.
 * FK fields follow the convention: `{entity}_id` (e.g. category_id, shelve_id, rack_id).
 */
async function resolvePayloadIds(payload) {
  const FK_MAP = {
    category_id: 'categories',
    shelve_id: 'shelves',
    rack_id: 'racks',
    status_id: 'status',
  };
  const resolved = { ...payload };
  for (const [field, endpoint] of Object.entries(FK_MAP)) {
    if (resolved[field] != null) {
      resolved[field] = await resolveId(endpoint, resolved[field]);
    }
  }
  return resolved;
}

/**
 * Run the sync queue against the backend.
 * Emits 'syncComplete' on eventBus when done.
 */
export async function runSync() {
  const queue = await getAllQueued();
  if (queue.length === 0) return;

  let synced = 0;
  const errors = [];

  for (const entry of queue) {
    const { id: queueId, operation, endpoint, payload, localId } = entry;
    try {
      if (operation === 'create') {
        const resolved = await resolvePayloadIds(payload);
        // Remove internal fields before sending
        const { _unsynced, ...body } = resolved;
        const result = await apiFetch(`/${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        const backendId = result.data?.id;
        if (backendId && localId) {
          await saveIdMap({ localId, endpoint, backendId });
          // Replace the local record with the backend-assigned ID
          const localRecord = (await getAll(endpoint)).find((r) => r.id === localId);
          if (localRecord) {
            const { _unsynced: _u, ...clean } = localRecord;
            await replaceRecordId(endpoint, localId, { ...clean, id: backendId });
          }
        }
      } else if (operation === 'update') {
        const resolved = await resolvePayloadIds(payload);
        const backendId = await resolveId(endpoint, resolved.id);
        const { _unsynced, ...body } = resolved;
        await apiFetch(`/${endpoint}/${backendId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...body, id: backendId }),
        });
      } else if (operation === 'delete') {
        const backendId = await resolveId(endpoint, payload.id);
        await apiFetch(`/${endpoint}/${backendId}`, { method: 'DELETE' });
      } else if (operation === 'entry' || operation === 'withdrawal') {
        const backendId = await resolveId(endpoint, payload.id);
        await apiFetch(`/${endpoint}/${backendId}/${operation}`, {
          method: 'POST',
          body: JSON.stringify({
            quantity: payload.quantity,
            notes: payload.notes,
          }),
        });
      }

      await dequeueOperation(queueId);
      synced++;
    } catch (e) {
      await incrementRetries(queueId);
      errors.push({ entry, error: e.message });
    }
  }

  // Refresh IndexedDB cache from backend after sync
  try {
    await Promise.all(
      SYNC_STORES.map(async (store) => {
        const result = await apiFetch(`/${store}`);
        const items = result.data ?? [];
        // Clear and repopulate the store
        const db = await import('../api/indexeddb');
        const current = await getAll(store);
        for (const item of current) {
          try { await db.remove(store, item.id); } catch { /* ignore */ }
        }
        for (const item of items) {
          try { await db.add(store, item); } catch { /* ignore */ }
        }
      })
    );

    // Sync operation history
    try {
      const historyResult = await apiFetch('/history');
      const historyItems = historyResult.data ?? [];
      const db = await import('../api/indexeddb');
      const currentHistory = await getAll('operation_history');
      for (const item of currentHistory) {
        try { await db.remove('operation_history', item.id); } catch { /* ignore */ }
      }
      for (const item of historyItems) {
        try { await db.add('operation_history', item); } catch { /* ignore */ }
      }
    } catch (e) {
      console.error('Failed to sync operation history:', e);
    }

    await clearAllIdMaps();
  } catch { /* cache refresh is best-effort */ }

  eventBus.emit('refreshData');
  eventBus.emit('syncComplete', { synced, failed: errors.length, errors });
}
