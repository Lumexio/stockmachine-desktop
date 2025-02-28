import { getAll, add, update, remove, exportAllData } from './indexeddb';
import * as XLSX from 'xlsx';

export function useGenericFetchQueries(endpoint) {
  const fetchQuery = async () => {
    return await getAll(endpoint);
  };

  const fetchRelatedData = async () => {
    const products = await getAll('products');

    const categories = await getAll('categories');

    const shelves = await getAll('shelves');
    const racks = await getAll('racks');


    return { products, categories, shelves, racks };
  };

  const createMutation = async (newData) => {
    // Sanitize the object to ensure it only contains serializable properties
    const sanitizedData = JSON.parse(JSON.stringify(newData));
    await add(endpoint, sanitizedData);
  };

  const updateMutation = async (updatedData) => {
    const sanitizedData = JSON.parse(JSON.stringify(updatedData));
    await update(endpoint, sanitizedData);
  };

  const deleteMutation = async (id) => {
    await remove(endpoint, id);
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
        // Why null adn 2?
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

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', endpoint ? `${endpoint}.${format}` : `ps.${format}`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
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
      if (format === 'json') {
        data = JSON.parse(event.target.result);
      } else if (format === 'csv') {
        const csv = event.target.result;
        const rows = csv.split('\n');
        const keys = rows[0].split(',');
        data = rows.slice(1).map(row => {
          const values = row.split(',');
          return keys.reduce((obj, key, index) => ({ ...obj, [key]: values[index] }), {});
        });
      } else if (format === 'xlsx') {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
      for (const item of data) {
        await add(endpoint, item);
      }
    };
    if (format === 'xlsx') {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  return { fetchQuery, fetchRelatedData, createMutation, updateMutation, deleteMutation, exportDataToFile, importDataFromFile };
}