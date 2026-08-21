<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800" persistent>
    <v-card>
      <v-card-title class="pa-4 bg-primary text-white d-flex justify-space-between align-center">
        <span>Global Import Wizard</span>
        <v-btn icon="mdi-close" variant="text" @click="close" color="white" density="comfortable"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-stepper v-model="step" class="elevation-0">
          <v-stepper-header class="elevation-0">
            <v-stepper-item value="1" title="Select Entity"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item value="2" title="Upload File"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item value="3" title="Map Columns"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item value="4" title="Confirm"></v-stepper-item>
          </v-stepper-header>

          <v-stepper-window>
            <v-stepper-window-item value="1">
              <p class="mb-4">Select the entity you want to import data into.</p>
              <v-select
                v-model="selectedEntity"
                :items="entities"
                item-title="label"
                item-value="value"
                variant="outlined"
                label="Target Entity"
                @update:modelValue="onEntitySelected"
              ></v-select>
              <v-alert v-if="selectedEntity === 'snapshot'" type="info" variant="tonal" class="mt-4">
                Snapshot import expects a JSON file containing the full database backup. No column mapping is required.
              </v-alert>
            </v-stepper-window-item>

            <v-stepper-window-item value="2">
              <v-file-input
                v-model="file"
                :accept="selectedEntity === 'snapshot' ? '.json' : (canImportAll ? '.xlsx, .xls, .csv, .json' : '.xlsx, .xls')"
                label="Select File"
                variant="outlined"
                prepend-icon="mdi-file-excel"
                @update:modelValue="handleFileUpload"
              ></v-file-input>
              <v-alert v-if="!canImportAll && selectedEntity !== 'snapshot'" type="info" class="mt-4" variant="tonal">
                Free plan supports Excel (.xlsx, .xls) imports. Upgrade to Pro/Max for CSV/JSON support.
              </v-alert>
            </v-stepper-window-item>

            <v-stepper-window-item value="3">
              <v-alert v-if="selectedEntity === 'snapshot'" type="info" class="mb-4">
                Snapshot file uploaded. Click Next to preview the import.
              </v-alert>
              <template v-else>
                <p class="mb-4">Map your file columns to the database fields.</p>
                <v-table>
                  <thead>
                    <tr>
                      <th>File Column</th>
                      <th>Database Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="col in fileColumns" :key="col">
                      <td class="font-weight-bold">{{ col }}</td>
                      <td>
                        <v-select
                          v-model="mapping[col]"
                          :items="availableFields"
                          item-title="label"
                          item-value="key"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                          placeholder="Ignore this column"
                        ></v-select>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
            </v-stepper-window-item>

            <v-stepper-window-item value="4">
              <template v-if="selectedEntity === 'snapshot'">
                <v-alert type="success" variant="tonal" v-if="!error">
                  {{ snapshotPreviewMessage }}
                </v-alert>
                <v-alert type="error" class="mb-4" v-if="error">{{ error }}</v-alert>
              </template>
              <template v-else>
                <v-alert type="success" variant="tonal">
                  Ready to import {{ rawData.length }} records into {{ selectedEntityLabel }}.
                </v-alert>
                <div class="mt-4">
                  <strong>Mapped Fields:</strong>
                  <ul>
                    <li v-for="(dbField, fileCol) in mapping" :key="fileCol">
                      <span v-if="dbField">{{ fileCol }} &rarr; {{ getFieldLabel(dbField) }}</span>
                    </li>
                  </ul>
                </div>
              </template>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn v-if="Number(step) > 1" variant="text" @click="step = String(Number(step) - 1)">Back</v-btn>
        <v-btn v-if="Number(step) < 4" color="primary" variant="elevated" @click="nextStep" :disabled="(step === '1' && !selectedEntity) || (step === '2' && !file)">Next</v-btn>
        <v-btn v-if="step === '4'" color="success" variant="elevated" @click="executeImport" :loading="loading">Import Data</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import * as XLSX from 'xlsx';
import { useAuthStore } from '@/store/auth';
import { useI18nStore } from '@/store/i18n';
import { apiFetch } from '@/api/custom-fetch';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'confirm']);

const auth = useAuthStore();
const i18n = useI18nStore();
const currentPlan = computed(() => auth.user?.organization?.plan_id || 'free');
const canImportAll = computed(() => currentPlan.value === 'pro' || currentPlan.value === 'max');

const step = ref('1');
const file = ref<File | null>(null);
const rawData = ref<any[]>([]);
const fileColumns = ref<string[]>([]);
const mapping = ref<Record<string, string>>({});
const loading = ref(false);
const error = ref('');

const selectedEntity = ref('');
const snapshotPreviewMessage = ref('');
const snapshotPayload = ref<any>(null);

const entities = [
  { label: 'Products', value: 'products' },
  { label: 'Categories', value: 'categories' },
  { label: 'Shelves', value: 'shelves' },
  { label: 'Racks', value: 'racks' },
  { label: 'Suppliers', value: 'suppliers' },
  { label: 'All Data (JSON Snapshot)', value: 'snapshot' },
];

const selectedEntityLabel = computed(() => entities.find(e => e.value === selectedEntity.value)?.label || '');

const formFieldsMap: Record<string, any[]> = {
  products: [
    { key: 'name', label: 'Name' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'description', label: 'Description' },
    { key: 'category_name', label: 'Category Name', fk: 'category_id' },
    { key: 'shelve_name', label: 'Shelf Name', fk: 'shelve_id' }
  ],
  categories: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' }
  ],
  shelves: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' }
  ],
  racks: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'shelve_name', label: 'Shelf Name', fk: 'shelve_id' }
  ],
  suppliers: [
    { key: 'name', label: 'Name' },
    { key: 'contact_name', label: 'Contact Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' }
  ]
};

const availableFields = computed(() => {
  if (!selectedEntity.value || selectedEntity.value === 'snapshot') return [];
  return formFieldsMap[selectedEntity.value] || [];
});

function getFieldLabel(key: string) {
  const field = availableFields.value.find(f => f.key === key);
  return field ? field.label : key;
}

watch(() => props.modelValue, (val) => {
  if (val) {
    step.value = '1';
    file.value = null;
    rawData.value = [];
    fileColumns.value = [];
    mapping.value = {};
    selectedEntity.value = '';
    snapshotPreviewMessage.value = '';
    snapshotPayload.value = null;
    error.value = '';
  }
});

function onEntitySelected() {
  file.value = null;
  rawData.value = [];
  fileColumns.value = [];
  mapping.value = {};
  snapshotPreviewMessage.value = '';
}

async function handleFileUpload(v: any) {
  const f = Array.isArray(v) ? v[0] : v;
  if (!f) {
    rawData.value = [];
    snapshotPayload.value = null;
    return;
  }

  const reader = new FileReader();
  if (selectedEntity.value === 'snapshot') {
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        snapshotPayload.value = JSON.parse(text);
      } catch(err) {
        error.value = 'Invalid JSON file';
      }
    };
    reader.readAsText(f);
  } else {
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      if (json.length > 0) {
        rawData.value = json as any[];
        fileColumns.value = Object.keys(json[0] as any);
        
        fileColumns.value.forEach(col => {
          const match = availableFields.value.find(f => f.label.toLowerCase() === col.toLowerCase() || f.key.toLowerCase() === col.toLowerCase());
          if (match) mapping.value[col] = match.key;
        });
      }
    };
    reader.readAsArrayBuffer(f);
  }
}

async function nextStep() {
  if (step.value === '1') step.value = '2';
  else if (step.value === '2') {
    if (selectedEntity.value === 'snapshot') {
      step.value = '4';
      loading.value = true;
      try {
        const res = await apiFetch('/snapshots/catalog/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshot: snapshotPayload.value, dryRun: true })
        }) as any;
        snapshotPreviewMessage.value = res.message || 'Snapshot valid.';
        error.value = '';
      } catch (err: any) {
        error.value = err.message || 'Failed to preview snapshot';
      } finally {
        loading.value = false;
      }
    } else {
      step.value = '3';
    }
  }
  else if (step.value === '3') step.value = '4';
}

async function executeImport() {
  loading.value = true;
  error.value = '';
  try {
    if (selectedEntity.value === 'snapshot') {
      await apiFetch('/snapshots/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot: snapshotPayload.value, dryRun: false })
      });
      alert('Snapshot imported successfully!');
      window.location.reload();
    } else {
      const mappedData = rawData.value.map(row => {
        const cleanRow: any = {};
        for (const fileCol in mapping.value) {
          const dbField = mapping.value[fileCol];
          if (dbField) {
             const val = row[fileCol];
             cleanRow[dbField] = dbField === 'quantity' ? Number(val) : val;
          }
        }
        return cleanRow;
      });
      
      const endpoint = selectedEntity.value;
      const failedRows: any[] = [];
      let successCount = 0;

      const BATCH_SIZE = 10;
      for (let i = 0; i < mappedData.length; i += BATCH_SIZE) {
        const batch = mappedData.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (item) => {
          try {
            await apiFetch(`/${endpoint}`, {
              method: 'POST',
              body: JSON.stringify(item)
            });
            successCount++;
          } catch (e: any) {
            failedRows.push({ item, error: e.message || 'Import failed' });
          }
        }));
      }

      if (failedRows.length > 0) {
        const blob = new Blob([JSON.stringify(failedRows, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `import-errors-${endpoint}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert(`Imported ${successCount}/${mappedData.length}. ${failedRows.length} failed. Downloading error log...`);
      } else {
        alert(`Imported ${successCount}/${mappedData.length} records into ${selectedEntityLabel.value}`);
      }
      window.location.reload();
    }
    close();
  } catch (err: any) {
    error.value = err.message || 'Import failed';
  } finally {
    loading.value = false;
  }
}

function close() {
  emit('update:modelValue', false);
}
</script>
