<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <span>Export Wizard</span>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-stepper v-model="step" class="elevation-0">
          <v-stepper-header class="elevation-0">
            <v-stepper-item value="1" title="Format" :complete="Number(step) > 1"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item value="2" title="Preview" :complete="Number(step) > 2"></v-stepper-item>
          </v-stepper-header>

          <v-stepper-window>
            <!-- Step 1: Format -->
            <v-stepper-window-item value="1">
              <v-alert v-if="currentPlan === 'free'" type="info" variant="tonal" class="mb-4">
                Freemium users are limited to Excel exports. Upgrade to unlock CSV and JSON backups.
              </v-alert>
              
              <v-radio-group v-model="format">
                <v-radio label="Excel (.xlsx)" value="excel"></v-radio>
                <v-radio label="CSV" value="csv" :disabled="currentPlan === 'free'"></v-radio>
                <v-radio label="JSON" value="json" :disabled="currentPlan === 'free'"></v-radio>
              </v-radio-group>
            </v-stepper-window-item>

            <!-- Step 2: Preview -->
            <v-stepper-window-item value="2">
              <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
              <div v-if="loadingPreview" class="d-flex justify-center py-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
              <div v-else>
                <h3 class="text-subtitle-1 mb-2">Preview (first {{ previewData.length }} rows)</h3>
                <v-table density="compact" class="border">
                  <thead>
                    <tr>
                      <th v-for="col in previewColumns" :key="col">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in previewData" :key="i">
                      <td v-for="col in previewColumns" :key="col">{{ row[col] }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn v-if="Number(step) > 1" variant="text" @click="step = String(Number(step) - 1)">Back</v-btn>
        <v-btn v-if="step === '1'" color="primary" variant="elevated" @click="generatePreview">Next</v-btn>
        <v-btn v-if="step === '2'" color="success" variant="elevated" @click="executeExport" :loading="exporting" prepend-icon="mdi-download">Export Data</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/api/custom-fetch';

const props = defineProps<{
  modelValue: boolean;
  endpoint: string;
}>();

const emit = defineEmits(['update:modelValue']);
const auth = useAuthStore();
const currentPlan = computed(() => auth.user?.organization?.plan_id || 'free');

const step = ref('1');
const format = ref('excel');
const previewData = ref<any[]>([]);
const previewColumns = ref<string[]>([]);
const loadingPreview = ref(false);
const exporting = ref(false);
const error = ref('');

async function generatePreview() {
  loadingPreview.value = true;
  error.value = '';
  step.value = '2';
  try {
    const res = await apiFetch(`/${props.endpoint}`);
    const items = res.data || res || [];
    previewData.value = items.slice(0, 5);
    
    if (previewData.value.length > 0) {
      previewColumns.value = Object.keys(previewData.value[0]).filter(k => k !== 'id' && !k.endsWith('_id'));
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to load preview';
  } finally {
    loadingPreview.value = false;
  }
}

async function executeExport() {
  exporting.value = true;
  try {
    const token = localStorage.getItem('sm_access_token');
    const url = `${import.meta.env.VITE_API_URL}/${props.endpoint}/export/${format.value}?token=${token}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.endpoint}_export.${format.value === 'excel' ? 'xls' : format.value}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    emit('update:modelValue', false);
    step.value = '1';
  } catch (e) {
    error.value = 'Export failed.';
  } finally {
    exporting.value = false;
  }
}
</script>
