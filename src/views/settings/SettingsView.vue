<template>
  <v-container class="pa-6" max-width="700">
    <!-- Section 1: User Profile -->
    <v-card v-if="auth.isAuthenticated" class="mb-6">
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.userProfile')
      }}</v-card-title>
      <v-divider />
      <v-list>
        <v-list-item :title="i18n.t('auth.name')" :subtitle="auth.user?.name" />
        <v-divider />
        <v-list-item
          :title="i18n.t('auth.email')"
          :subtitle="auth.user?.email"
        />
        <v-divider />
        <v-list-item :title="i18n.t('auth.role')">
          <template #subtitle>
            <v-chip size="small" color="primary" class="mt-1">{{
              auth.user?.role
            }}</v-chip>
          </template>
        </v-list-item>
        <v-divider />
        <v-list-item
          :title="i18n.t('auth.accountType')"
          :subtitle="
            auth.user?.org_id
              ? i18n.t('auth.organization')
              : i18n.t('auth.individual')
          "
        />
      </v-list>
    </v-card>

    <!-- Section 2: Language -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.language')
      }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex gap-2 flex-wrap">
          <v-btn
            v-for="lang in languages"
            :key="lang.code"
            :color="i18n.currentLocale === lang.code ? 'primary' : undefined"
            :variant="
              i18n.currentLocale === lang.code ? 'elevated' : 'outlined'
            "
            size="small"
            @click="i18n.setLocale(lang.code)"
          >
            {{ lang.label }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Section 3: Appearance -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.appearance')
      }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <span>{{
            isDark ? i18n.t('app.theme.dark') : i18n.t('app.theme.light')
          }}</span>
          <v-switch
            v-model="isDark"
            color="primary"
            hide-details
            @update:model-value="store.setDarkMode()"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Section 4: Connection -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.connection')
      }}</v-card-title>
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
          <v-btn
            color="primary"
            variant="tonal"
            :loading="testing"
            @click="testConnection"
          >
            {{ i18n.t('settings.testConnection') }}
          </v-btn>
          <v-btn color="secondary" variant="tonal" @click="save">
            {{ i18n.t('settings.save') }}
          </v-btn>
          <v-chip
            v-if="connectionStatus === 'ok'"
            color="success"
            prepend-icon="mdi-check-circle"
          >
            {{ i18n.t('settings.connectionSuccess') }}
          </v-chip>
          <v-chip
            v-else-if="connectionStatus === 'fail'"
            color="error"
            prepend-icon="mdi-alert-circle"
          >
            {{ i18n.t('settings.connectionFailed') }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Section 5: Account -->
    <v-card v-if="auth.isAuthenticated">
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.account')
      }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-btn
          color="error"
          variant="tonal"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          {{ i18n.t('auth.logout') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useSettingsStore } from '../../store/settings';
  import { useI18nStore } from '../../store/i18n';
  import { useAuthStore } from '../../store/auth';
  import { useStore } from '../../store/index';

  const router = useRouter();
  const settings = useSettingsStore();
  const i18n = useI18nStore();
  const auth = useAuthStore();
  const store = useStore();

  const backendUrlInput = ref(settings.backendUrl);
  const testing = ref(false);
  const connectionStatus = ref(null); // null | 'ok' | 'fail'

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
    { code: 'ja', label: 'JA' },
    { code: 'ru', label: 'RU' },
  ];

  const isDark = computed({
    get: () => store.isDarkMode === 'dark',
    set: () => store.setDarkMode(),
  });

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

  function logout() {
    auth.logout();
    router.push('/login');
  }
</script>
