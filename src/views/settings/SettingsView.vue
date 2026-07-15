<template>
  <v-container class="pa-6" max-width="600">
    <v-card>
      <v-card-title class="text-h6 pa-4">{{ i18n.t('settings.title') }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-text-field
          v-model="backendUrlInput"
          :label="i18n.t('settings.backendUrl')"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-4"
        />
        <div class="d-flex align-center gap-3">
          <v-btn color="primary" variant="tonal" :loading="testing" @click="testConnection">
            {{ i18n.t('settings.testConnection') }}
          </v-btn>
          <v-btn color="secondary" variant="tonal" @click="save">
            {{ i18n.t('settings.save') }}
          </v-btn>
          <v-chip v-if="connectionStatus === 'ok'" color="success" prepend-icon="mdi-check-circle">
            {{ i18n.t('settings.connectionSuccess') }}
          </v-chip>
          <v-chip v-else-if="connectionStatus === 'fail'" color="error" prepend-icon="mdi-alert-circle">
            {{ i18n.t('settings.connectionFailed') }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '../../store/settings';
import { useI18nStore } from '../../store/i18n';

const settings = useSettingsStore();
const i18n = useI18nStore();

const backendUrlInput = ref(settings.backendUrl);
const testing = ref(false);
const connectionStatus = ref(null); // null | 'ok' | 'fail'

async function testConnection() {
  testing.value = true;
  connectionStatus.value = null;
  const url = backendUrlInput.value.replace(/\/$/, '');
  try {
    const res = await fetch(`${url}/auth/me`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    // 401 means backend is reachable (just not authenticated)
    connectionStatus.value = res.status === 401 || res.ok ? 'ok' : 'fail';
  } catch {
    connectionStatus.value = 'fail';
  } finally {
    testing.value = false;
  }
}

function save() {
  settings.setBackendUrl(backendUrlInput.value);
}
</script>
