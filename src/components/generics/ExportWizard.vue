<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white">
        <span>Global Export Wizard</span>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <p class="mb-4">Export all data (Products, Categories, Racks, Shelves, Suppliers, History) across all your active locations.</p>
        <v-alert v-if="currentPlan === 'free'" type="info" variant="tonal" class="mb-4">
          Freemium users are limited to Excel exports. Upgrade to unlock JSON backups.
        </v-alert>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        
        <v-radio-group v-model="format">
          <v-radio label="Excel (.xlsx) - Multi-Sheet" value="excel"></v-radio>
          <v-radio label="JSON Snapshot (Best for backups)" value="json" :disabled="currentPlan === 'free'"></v-radio>
        </v-radio-group>
      </v-card-text>
      
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" @click="confirmExport" :loading="exporting">Export All Data</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/api/custom-fetch';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);

const auth = useAuthStore();
const currentPlan = computed(() => auth.user?.organization?.plan_id || 'free');

const step = ref('1');
const format = ref('excel');
const error = ref('');
const exporting = ref(false);

async function confirmExport() {
  exporting.value = true;
  error.value = '';
  try {
    if (format.value === 'json') {
      const token = localStorage.getItem('sm_access_token');
      const url = `${import.meta.env.VITE_API_URL}/snapshots/catalog?token=${token}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `CometPocketMachinery_AllData.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const res = await apiFetch(`/snapshots/catalog`) as any;
      const data = res.data || res;
      
      const wb = XLSX.utils.book_new();
      
      if (data.categories) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.categories), 'Categories');
      if (data.shelves) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.shelves), 'Shelves');
      if (data.racks) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.racks), 'Racks');
      if (data.products) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.products), 'Products');
      if (data.suppliers) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.suppliers), 'Suppliers');
      if (data.history) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.history), 'History');
      
      XLSX.writeFile(wb, `CometPocketMachinery_AllData.${format.value === 'csv' ? 'csv' : 'xlsx'}`);
    }
    emit('update:modelValue', false);
  } catch (err: any) {
    error.value = err.message || 'Export failed';
  } finally {
    exporting.value = false;
  }
}
</script>

