import { getAll, add, update, remove, exportAllData, getById, enqueueOperation } from './indexeddb';
import * as XLSX from 'xlsx';
import { apiFetch } from './custom-fetch';
import { eventBus } from '../utils/eventBus';
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

export function useGenericFetchQueries(endpoint) {
  /** True when the user is authenticated and a backend URL is configured. */
  const isSyncMode = () => {
    try {
      const auth = useAuthStore();
      const settings = useSettingsStore();
      return !!(auth.isAuthenticated && settings.backendUrl);
    } catch {
      return false;
    }
  };

  /** Silently refresh one IndexedDB store from the backend. */
  const refreshStoreFromBackend = async (store) => {
    try {
      const result = await apiFetch(`/${store}`);
      const items = result.data ?? [];
      const current = await getAll(store);
      for (const item of current) {
        try { await remove(store, item.id); } catch { /* ignore */ }
      }
      for (const item of items) {
        try { await add(store, item); } catch { /* ignore */ }
      }
    } catch { /* background refresh is best-effort */ }
  };

  const fetchQuery = async () => {
    const cached = await getAll(endpoint);
    // Stale-while-revalidate: update cache in background, then notify views
    if (isSyncMode() && endpoint) {
      refreshStoreFromBackend(endpoint).then(() => eventBus.emit('refreshData'));
    }
    return cached;
  };

  const fetchRelatedData = async () => {
    const [products, categories, shelves, racks, suppliers] = await Promise.all([
      getAll('products'),
      getAll('categories'),
      getAll('shelves'),
      getAll('racks'),
      getAll('suppliers'),
    ]);
    if (isSyncMode()) {
      Promise.all(['products', 'categories', 'shelves', 'racks', 'suppliers'].map(refreshStoreFromBackend))
        .then(() => eventBus.emit('refreshData'));
    }
    return { products, categories, shelves, racks, suppliers };
  };

  const createMutation = async (newData) => {
    const sanitizedData = JSON.parse(JSON.stringify(newData));
    sanitizedData._unsynced = true;
    const localId = await add(endpoint, sanitizedData);
    await enqueueOperation({ operation: 'create', endpoint, payload: { ...sanitizedData, id: localId }, localId });

    const storesToLog = ['products', 'categories', 'racks', 'shelves', 'suppliers'];
    if (storesToLog.includes(endpoint)) {
      const entityTypeMap = {
        products: 'product',
        categories: 'category',
        racks: 'rack',
        shelves: 'shelf',
        suppliers: 'supplier'
      };
      const historyEntry = {
        entity_type: entityTypeMap[endpoint],
        entity_id: localId,
        operation: 'create',
        created_at: new Date().toISOString()
      };
      if (endpoint === 'products') {
        historyEntry.quantity_before = 0;
        historyEntry.quantity_after = Number(sanitizedData.quantity) || 0;
      }
      await add('operation_history', historyEntry);
    }
  };

  const updateMutation = async (updatedData) => {
    const sanitizedData = JSON.parse(JSON.stringify(updatedData));
    const storesToLog = ['products', 'categories', 'racks', 'shelves', 'suppliers'];
    let quantityBefore = undefined;
    let quantityAfter = undefined;
    if (storesToLog.includes(endpoint)) {
      const oldItem = await getById(endpoint, sanitizedData.id);
      if (endpoint === 'products') {
        quantityBefore = oldItem ? (Number(oldItem.quantity) || 0) : undefined;
        quantityAfter = Number(sanitizedData.quantity) || 0;
      }
    }

    await update(endpoint, sanitizedData);
    await enqueueOperation({ operation: 'update', endpoint, payload: sanitizedData });

    if (storesToLog.includes(endpoint)) {
      const entityTypeMap = {
        products: 'product',
        categories: 'category',
        racks: 'rack',
        shelves: 'shelf',
        suppliers: 'supplier'
      };
      const historyEntry = {
        entity_type: entityTypeMap[endpoint],
        entity_id: sanitizedData.id,
        operation: 'update',
        created_at: new Date().toISOString()
      };
      if (endpoint === 'products') {
        historyEntry.quantity_before = quantityBefore;
        historyEntry.quantity_after = quantityAfter;
      }
      await add('operation_history', historyEntry);
    }
  };

  const deleteMutation = async (id) => {
    const storesToLog = ['products', 'categories', 'racks', 'shelves', 'suppliers'];
    let quantityBefore = undefined;
    let quantityAfter = undefined;
    if (storesToLog.includes(endpoint)) {
      const oldItem = await getById(endpoint, id);
      if (endpoint === 'products') {
        quantityBefore = oldItem ? (Number(oldItem.quantity) || 0) : undefined;
        quantityAfter = 0;
      }
    }

    await remove(endpoint, id);
    await enqueueOperation({ operation: 'delete', endpoint, payload: { id } });

    if (storesToLog.includes(endpoint)) {
      const entityTypeMap = {
        products: 'product',
        categories: 'category',
        racks: 'rack',
        shelves: 'shelf',
        suppliers: 'supplier'
      };
      const historyEntry = {
        entity_type: entityTypeMap[endpoint],
        entity_id: id,
        operation: 'delete',
        created_at: new Date().toISOString()
      };
      if (endpoint === 'products') {
        historyEntry.quantity_before = quantityBefore;
        historyEntry.quantity_after = quantityAfter;
      }
      await add('operation_history', historyEntry);
    }
  };

  const exportDataToFile = async (format = 'json') => {
    try {
      let data;
      if (endpoint) {
        data = await getAll(endpoint);
      } else {
        data = await exportAllData();
      }

      let blob;
      let mimeType;

      if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        mimeType = 'application/json';

      } else if (format === 'csv') {
        const csv = Object.keys(data).map(store => {
          return data[store].map(row => Object.values(row).join(',')).join('\n');
        }).join('\n');
        blob = new Blob([csv], { type: 'text/csv' });
        mimeType = 'text/csv';
      } else if (format === 'xlsx') {
        const workbook = XLSX.utils.book_new();
        Object.keys(data).forEach(store => {
          const worksheet = XLSX.utils.json_to_sheet(data[store]);
          XLSX.utils.book_append_sheet(workbook, worksheet, store);
        });
        const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        blob = new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', endpoint ? `${endpoint}.${format}` : `ps.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting file:', error);
    }
  };

  const importDataFromFile = async (file, format = 'json') => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      let data;
      try {
        if (format === 'json' || format === 'csv') {
          data = event.target.result;
          if (format === 'json') {
            data = JSON.parse(data);
            if (Array.isArray(data)) {
              for (const item of data) {
                try {
                  const localId = await add(endpoint, item);
                  await enqueueOperation({ operation: 'create', endpoint, payload: { ...item, id: localId }, localId });
                } catch (err) {
                  if (err.name === 'ConstraintError') {
                    const existingItem = await getById(endpoint, item.id);
                    const mergedItem = { ...existingItem, ...item };
                    await update(endpoint, mergedItem);
                    await enqueueOperation({ operation: 'update', endpoint, payload: mergedItem });
                  } else {
                    throw err;
                  }
                }
              }
            } else {
              for (const store in data) {
                for (const item of data[store]) {
                  try {
                    const localId = await add(store, item);
                    await enqueueOperation({ operation: 'create', endpoint: store, payload: { ...item, id: localId }, localId });
                  } catch (err) {
                    if (err.name === 'ConstraintError') {
                      const existingItem = await getById(store, item.id);
                      const mergedItem = { ...existingItem, ...item };
                      await update(store, mergedItem);
                      await enqueueOperation({ operation: 'update', endpoint: store, payload: mergedItem });
                    } else {
                      throw err;
                    }
                  }
                }
              }
            }
          } else {
            const rows = data.split('\n');
            const keys = rows[0].split(',');
            data = rows.slice(1).map(row => {
              const values = row.split(',');
              return keys.reduce((obj, key, index) => ({ ...obj, [key]: values[index] }), {});
            });
            for (const item of data) {
              try {
                const localId = await add(endpoint, item);
                await enqueueOperation({ operation: 'create', endpoint, payload: { ...item, id: localId }, localId });
              } catch (err) {
                if (err.name === 'ConstraintError') {
                  const existingItem = await getById(endpoint, item.id);
                  const mergedItem = { ...existingItem, ...item };
                  await update(endpoint, mergedItem);
                  await enqueueOperation({ operation: 'update', endpoint, payload: mergedItem });
                } else {
                  throw err;
                }
              }
            }
          }
        } else if (format === 'xlsx') {
          const arrayBuffer = event.target.result;
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          data = XLSX.utils.sheet_to_json(worksheet);
          for (const item of data) {
            try {
              const localId = await add(endpoint, item);
              await enqueueOperation({ operation: 'create', endpoint, payload: { ...item, id: localId }, localId });
            } catch (err) {
              if (err.name === 'ConstraintError') {
                const existingItem = await getById(endpoint, item.id);
                const mergedItem = { ...existingItem, ...item };
                await update(endpoint, mergedItem);
                await enqueueOperation({ operation: 'update', endpoint, payload: mergedItem });
              } else {
                throw err;
              }
            }
          }
        }
      } catch (error) {
        throw error;
      }
    };

    if (format === 'xlsx') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return { fetchQuery, fetchRelatedData, createMutation, updateMutation, deleteMutation, exportDataToFile, importDataFromFile };
}