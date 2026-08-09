<template>
  <v-theme-provider :theme="store.hasDarkMode">
    <v-responsive>
      <v-app>
        <nav-drawer :items="list" />
        <v-main>
          <v-dialog v-model="showOnboardingConfig" persistent max-width="600">
            <v-card class="pa-4 rounded-xl">
              <v-card-title class="text-h5 font-weight-bold mb-2">
                <v-icon start color="primary" class="mr-2">mdi-cloud-sync</v-icon>
                Data Sync Configuration
              </v-card-title>
              <v-card-text>
                <p class="mb-4 text-body-1">
                  As a free user, you can choose where to securely sync your catalog across devices:
                </p>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-card
                      variant="outlined"
                      class="h-100 cursor-pointer d-flex flex-column"
                      color="grey-darken-1"
                      @click="selectStorage('server')"
                      hover
                    >
                      <v-card-item>
                        <template #prepend>
                          <v-icon size="x-large" color="grey-darken-1">mdi-server</v-icon>
                        </template>
                        <v-card-title class="text-subtitle-1 font-weight-bold">Comet Server</v-card-title>
                      </v-card-item>
                      <v-card-text class="flex-grow-1 pt-0">
                        Data is stored on our managed servers. Strict freemium storage limits apply.
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-card
                      variant="elevated"
                      elevation="4"
                      class="h-100 cursor-pointer d-flex flex-column"
                      style="border: 2px solid rgb(var(--v-theme-primary))"
                      @click="selectStorage('gdrive')"
                      hover
                    >
                      <v-card-item>
                        <template #prepend>
                          <v-icon size="x-large" color="primary">mdi-google-drive</v-icon>
                        </template>
                        <v-card-title class="text-subtitle-1 text-primary font-weight-bold">Google Drive</v-card-title>
                      </v-card-item>
                      <v-card-text class="flex-grow-1 pt-0">
                        Sync to your personal Drive. <strong class="text-primary">Unlimited capacity.</strong> (Recommended)
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-dialog>
          <router-view />
        </v-main>
        <!-- Sync result snackbar -->
        <v-snackbar
          v-model="syncSnackbar.show"
          :color="syncSnackbar.color"
          timeout="5000"
          location="bottom right"
        >
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
                  <v-list-item-title
                    >{{ e.entry?.endpoint }} /
                    {{ e.entry?.operation }}</v-list-item-title
                  >
                  <v-list-item-subtitle>{{ e.error }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="syncErrorDialog = false">{{
                i18n.t('actions.close')
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- Welcome modal (first launch) -->
        <welcome-modal
          :show="showWelcome"
          @login="onWelcomeLogin"
          @offline="onWelcomeOffline"
        />
      </v-app>
    </v-responsive>
  </v-theme-provider>
</template>

<script setup>
  import { provide, ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import NavDrawer from './components/generics/nav-drawer.vue';
  import WelcomeModal from './components/welcome-modal.vue';
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

  const storagePreference = ref(localStorage.getItem('storage_preference'));

  const showOnboardingConfig = computed(() =>
    auth.isAuthenticated &&
    !auth.isOfflineMode &&
    auth.user?.organization?.plan_id === 'free' &&
    ['owner', 'admin'].includes(auth.user?.role || '') &&
    !storagePreference.value
  );

  const selectStorage = async (type) => {
    localStorage.setItem('storage_preference', type);
    storagePreference.value = type;
    if (type === 'gdrive') {
      // Just show a quick toast since OAuth isn't supported inside the electron app right now
      syncSnackbar.value = {
        show: true,
        text: 'Please configure Google Drive sync on the Web Dashboard (stockmachine.online)',
        color: 'success',
      };
    }
  };

  const showWelcome = computed({
    get: () => !store.hasSeenWelcome && !auth.isAuthenticated && !auth.isOfflineMode,
    set: (val) => {
      if (!val) {
        store.setHasSeenWelcome();
      }
    },
  });

  function onWelcomeLogin() {
    store.setHasSeenWelcome();
    auth.setOfflineMode(false);
    router.push('/login');
  }

  function onWelcomeOffline() {
    store.setHasSeenWelcome();
    auth.setOfflineMode(true);
    router.push('/');
  }

  // Sync state
  const syncSnackbar = ref({ show: false, text: '', color: 'success' });
  const syncErrorDialog = ref(false);
  const syncErrors = ref([]);
  let isSyncing = false;

  // Run sync when canSync transitions to true
  watch(canSync, async (active) => {
    if (!active || isSyncing) return;
    isSyncing = true;
    try {
      await runSync();
    } finally {
      isSyncing = false;
    }
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
  const handleAuthLogout = async () => {
    import('./api/indexeddb').then(({ clearAllQueued }) => clearAllQueued());
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

  const createNavItems = () =>
    NAV_ITEMS.map((item) => ({
      ...item,
      title: i18n.t(`navigation.${item.key}`),
    }));

  const list = ref(createNavItems());

  watch(
    () => i18n.currentLocale,
    () => {
      list.value = createNavItems();
    },
    { immediate: true },
  );
</script>
