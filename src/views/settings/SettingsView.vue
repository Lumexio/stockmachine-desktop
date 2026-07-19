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
        <div class="d-flex ga-2 flex-wrap">
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

    <!-- Section 3: Appearance & Dual-Column Color Schemes -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.appearance')
      }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <span class="font-weight-medium">{{
            isDark ? i18n.t('app.theme.dark') : i18n.t('app.theme.light')
          }}</span>
          <v-switch
            v-model="isDark"
            color="primary"
            hide-details
          />
        </div>
        <v-divider class="my-4" />
        <div class="text-subtitle-1 mb-2 font-weight-medium">
          {{ i18n.t('settings.colorSchemes') }}
        </div>

        <v-row class="mt-1">
          <!-- Light Themes Column -->
          <v-col cols="6">
            <div class="text-subtitle-2 mb-2 font-weight-bold text-medium-emphasis">
              Light Schemes
            </div>
            <div class="d-flex flex-column ga-2">
              <v-btn
                v-for="scheme in lightSchemes"
                :key="scheme.value"
                :color="store.isDarkMode === scheme.value ? 'primary' : undefined"
                :variant="
                  store.isDarkMode === scheme.value ? 'elevated' : 'outlined'
                "
                size="small"
                class="justify-start text-none"
                @click="store.setColorScheme(scheme.value)"
              >
                {{ scheme.label }}
              </v-btn>
            </div>
          </v-col>

          <!-- Dark Themes Column -->
          <v-col cols="6">
            <div class="text-subtitle-2 mb-2 font-weight-bold text-medium-emphasis">
              Dark Schemes
            </div>
            <div class="d-flex flex-column ga-2">
              <v-btn
                v-for="scheme in darkSchemes"
                :key="scheme.value"
                :color="store.isDarkMode === scheme.value ? 'primary' : undefined"
                :variant="
                  store.isDarkMode === scheme.value ? 'elevated' : 'outlined'
                "
                size="small"
                class="justify-start text-none"
                @click="store.setColorScheme(scheme.value)"
              >
                {{ scheme.label }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Section 4: Account -->
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

    <!-- Section 5: Connect account (shown when offline / not logged in) -->
    <v-card v-else>
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.connectAccount')
      }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ i18n.t('settings.loginToSync') }}
        </p>
        <div class="d-flex ga-3 flex-wrap">
          <v-btn
            color="primary"
            variant="elevated"
            elevation="2"
            prepend-icon="mdi-login"
            @click="router.push('/login')"
          >
            {{ i18n.t('auth.login') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-open-in-new"
            @click="openRegister"
          >
            {{ i18n.t('settings.registerOnWeb') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18nStore } from '../../store/i18n';
  import { useAuthStore } from '../../store/auth';
  import { useStore } from '../../store/index';

  const router = useRouter();
  const i18n = useI18nStore();
  const auth = useAuthStore();
  const store = useStore();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
    { code: 'ja', label: 'JA' },
    { code: 'ru', label: 'RU' },
  ];

  const lightSchemes = [
    { value: 'default-light', label: 'Default Light' },
    { value: 'electron-neon-light', label: 'Electron Neon Light' },
    { value: 'tokyo-day', label: 'Tokyo Day' },
    { value: 'newspaper-light', label: 'Newspaper Light' },
  ];

  const darkSchemes = [
    { value: 'default-dark', label: 'Default Dark' },
    { value: 'electron-neon-dark', label: 'Electron Neon Dark' },
    { value: 'tokyo-night', label: 'Tokyo Night' },
    { value: 'newspaper-dark', label: 'Newspaper Dark' },
  ];

  const isDark = computed({
    get: () => store.isDarkActive,
    set: (val) => {
      if (val !== store.isDarkActive) {
        store.setDarkMode();
      }
    },
  });

  function openRegister() {
    window.api.send('toMain', {
      type: 'openExternal',
      url: 'https://app.stockmachine.online/register',
    });
  }

  function logout() {
    auth.logout();
    router.push('/login');
  }
</script>
