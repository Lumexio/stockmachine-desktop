<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card>
      <v-card-title class="pa-4 bg-primary text-white" style="display: flex; justify-content: space-between; align-items: center;">
        <span>{{ i18n.t('actions.import') || 'Import Data' }}</span>
        <v-btn icon="mdi-close" variant="text" @click="close" color="white" density="comfortable"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-stepper v-model="step" class="elevation-0">
          <v-stepper-header>
            <v-stepper-item value="1" title="Upload File"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item value="2" title="Map Columns"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item value="3" title="Confirm"></v-stepper-item>
          </v-stepper-header>

          <v-stepper-window>
            <v-stepper-window-item value="1">
              <v-file-input
                v-model="file"
                :accept="canImportAll ? '.xlsx, .xls, .csv, .json' : '.xlsx, .xls'"
                label="Select File"
                variant="outlined"
                prepend-icon="mdi-file-excel"
                @update:modelValue="handleFileUpload"
              ></v-file-input>
              <v-alert v-if="!canImportAll" type="info" class="mt-4" variant="tonal">
                Free plan supports Excel (.xlsx, .xls) imports. Upgrade to Pro/Max for CSV/JSON support.
              </v-alert>
            </v-stepper-window-item>

            <v-stepper-window-item value="2">
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
            </v-stepper-window-item>

            <v-stepper-window-item value="3">
              <v-alert type="success" variant="tonal">
                Ready to import {{ rawData.length }} records.
              </v-alert>
              <div class="mt-4">
                <strong>Mapped Fields:</strong>
                <ul>
                  <li v-for="(dbField, fileCol) in mapping" :key="fileCol">
                    <span v-if="dbField">{{ fileCol }} &rarr; {{ getFieldLabel(dbField) }}</span>
                  </li>
                </ul>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn v-if="Number(step) > 1" variant="text" @click="step = String(Number(step) - 1)">Back</v-btn>
        <v-btn v-if="Number(step) < 3" color="primary" variant="elevated" @click="nextStep" :disabled="step === '1' && !file">Next</v-btn>
        <v-btn v-if="step === '3'" color="success" variant="elevated" @click="executeImport" :loading="loading">Import Data</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import * as XLSX from 'xlsx';
import { useAuthStore } from '@/store/auth';
import { useI18nStore } from '@/store/i18n';

const props = defineProps<{
  modelValue: boolean;
  formFields: any[];
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const auth = useAuthStore();
const i18n = useI18nStore();

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const currentPlan = computed(() => auth.user?.organization?.plan_id || 'free');
const canImportAll = computed(() => currentPlan.value === 'pro' || currentPlan.value === 'max');

const step = ref('1');
const file = ref<File | null>(null);
const rawData = ref<any[]>([]);
const fileColumns = ref<string[]>([]);
const mapping = ref<Record<string, string>>({});
const loading = ref(false);

const availableFields = computed(() => {
  return props.formFields.map(f => ({
    key: f.fk || f.key,
    label: f.label
  }));
});

function getFieldLabel(key: string) {
  const field = availableFields.value.find(f => f.key === key);
  return field ? field.label : key;
}

watch(dialog, (val) => {
  if (val) {
    step.value = '1';
    file.value = null;
    rawData.value = [];
    fileColumns.value = [];
    mapping.value = {};
  }
});

async function handleFileUpload(v: any) {
  const f = Array.isArray(v) ? v[0] : v;
  if (!f) {
    rawData.value = [];
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target?.result;
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);
    
    if (json.length > 0) {
      rawData.value = json as any[];
      fileColumns.value = Object.keys(json[0] as any);
      
      // Auto-map if names match
      fileColumns.value.forEach(col => {
        const match = availableFields.value.find(f => f.label.toLowerCase() === col.toLowerCase() || f.key.toLowerCase() === col.toLowerCase());
        if (match) {
          mapping.value[col] = match.key;
        }
      });
    }
  };
  reader.readAsArrayBuffer(f);
}

function nextStep() {
  if (step.value === '1') step.value = '2';
  else if (step.value === '2') step.value = '3';
}

function executeImport() {
  loading.value = true;
  // Construct clean mapped data
  const mappedData = rawData.value.map(row => {
    const cleanRow: any = {};
    for (const fileCol in mapping.value) {
      const dbField = mapping.value[fileCol];
      if (dbField) {
        cleanRow[dbField] = row[fileCol];
      }
    }
    return cleanRow;
  });

  emit('confirm', mappedData);
  loading.value = false;
  close();
}

function close() {
  dialog.value = false;
}
</script>
