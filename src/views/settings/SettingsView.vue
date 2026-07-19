<template>
  <v-container class="pa-6" max-width="850">
    <div class="text-h5 font-weight-bold mb-6">
      {{ i18n.t('settings.title') || 'Application Settings' }}
    </div>

    <!-- Section 1: Language Preferences -->
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

    <!-- Section 2: Appearance & Dual-Column Color Schemes -->
    <v-card class="mb-6">
      <v-card-title class="text-h6 pa-4">{{
        i18n.t('settings.appearance')
      }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <span class="font-weight-medium">Dark Theme Mode</span>
          <v-switch v-model="isDark" color="primary" hide-details />
        </div>
        <v-divider class="my-4" />
        <div class="text-subtitle-1 mb-2 font-weight-medium">
          {{ i18n.t('settings.colorSchemes') || 'Color Schemes' }}
        </div>

        <v-row class="mt-1">
          <!-- Light Themes Column -->
          <v-col cols="12" sm="6">
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
          <v-col cols="12" sm="6">
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
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useI18nStore } from '../../store/i18n';
import { useStore } from '../../store/index';

const i18n = useI18nStore();
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
</script>
