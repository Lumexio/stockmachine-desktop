<template>
 <v-theme-provider :theme="store.hasDarkMode">
  <v-responsive>
   <v-app>
    <nav-drawer :items="list" />
    <v-main>
     <router-view />
    </v-main>
    <!-- Sync result snackbar -->
    <v-snackbar v-model="syncSnackbar.show" :color="syncSnackbar.color" timeout="5000" location="bottom right">
      {{ syncSnackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="syncSnackbar.show = false">✕</v-btn>
      </template>
    </v-snackbar>
    <!-- Sync error dialog -->
    <v-dialog v-model="syncErrorDialog" max-width="480">
      <v-card>
        <v-card-title>{{ i18n.t('sync.failed') }}</v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item v-for="(e, i) in syncErrors" :key="i">
              <v-list-item-title>{{ e.entry?.endpoint }} / {{ e.entry?.operation }}</v-list-item-title>
              <v-list-item-subtitle>{{ e.error }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="syncErrorDialog = false">{{ i18n.t('actions.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
   </v-app>
  </v-responsive>
 </v-theme-provider>
</template>

<script setup>
import { provide, ref, watch, onMounted, onUnmounted } from 'vue';
import NavDrawer from './components/generics/nav-drawer.vue';
import useStore from './store';
import { eventBus } from './utils/eventBus';
import { useI18nStore } from './store/i18n';
import { useAuthStore } from './store/auth';
import { NAV_ITEMS } from './constants/navigation';
import { useConnectivity } from './composables/use-connectivity';
import { runSync } from './utils/sync-service';
import { useRouter } from 'vue-router';

const store = useStore();
const i18n = useI18nStore();
const auth = useAuthStore();
const router = useRouter();
const { canSync } = useConnectivity();

// Sync state
const syncSnackbar = ref({ show: false, text: '', color: 'success' });
const syncErrorDialog = ref(false);
const syncErrors = ref([]);
let isSyncing = false;

// Run sync when canSync transitions to true
watch(canSync, async (active) => {
  if (!active || isSyncing) return;
  isSyncing = true;
  try { await runSync(); } finally { isSyncing = false; }
});

// Listen for sync completion
eventBus.on('syncComplete', ({ synced, failed, errors }) => {
  syncErrors.value = errors;
  if (failed > 0) {
    syncSnackbar.value = {
      show: true,
      text: i18n.t('sync.complete', { synced, failed }),
      color: 'warning',
    };
    syncErrorDialog.value = true;
  } else if (synced > 0) {
    syncSnackbar.value = {
      show: true,
      text: i18n.t('sync.complete', { synced, failed }),
      color: 'success',
    };
  }
});

// Handle forced logout (e.g. from apiFetch interceptor)
const handleAuthLogout = () => {
  auth.logout();
  router.push('/login');
};

onMounted(() => {
  const savedLang = localStorage.getItem('language');
  if (savedLang) i18n.setLocale(savedLang);
  window.addEventListener('auth:logout', handleAuthLogout);
});

onUnmounted(() => {
  window.removeEventListener('auth:logout', handleAuthLogout);
});

provide('eventBus', eventBus);

const createNavItems = () => NAV_ITEMS.map(item => ({
 ...item,
 title: i18n.t(`navigation.${item.key}`)
}));

const list = ref(createNavItems());

watch(() => i18n.currentLocale, () => {
 list.value = createNavItems();
}, { immediate: true });
</script>