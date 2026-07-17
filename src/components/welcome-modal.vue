<template>
  <v-dialog :model-value="show" max-width="480" persistent>
    <v-card rounded="lg">
      <!-- Header -->
      <v-card-text class="pa-8 text-center">
        <v-icon size="64" color="primary" class="mb-4"
          >mdi-package-variant-closed</v-icon
        >
        <div class="text-h5 font-weight-bold mb-2">
          {{ i18n.t('welcome.title') }}
        </div>
        <div class="text-body-1 text-medium-emphasis">
          {{ i18n.t('welcome.subtitle') }}
        </div>
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-6 d-flex flex-column ga-3">
        <!-- Login -->
        <v-btn
          color="primary"
          variant="elevated"
          elevation="2"
          size="large"
          block
          prepend-icon="mdi-login"
          @click="$emit('login')"
        >
          {{ i18n.t('welcome.loginBtn') }}
        </v-btn>

        <!-- Register on Web -->
        <v-btn
          color="primary"
          variant="outlined"
          size="large"
          block
          prepend-icon="mdi-open-in-new"
          @click="openRegister"
        >
          {{ i18n.t('welcome.registerBtn') }}
        </v-btn>

        <!-- Continue Offline -->
        <v-btn
          variant="text"
          size="large"
          block
          prepend-icon="mdi-wifi-off"
          @click="$emit('offline')"
        >
          {{ i18n.t('welcome.offlineBtn') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { useI18nStore } from '../store/i18n';

  const i18n = useI18nStore();

  defineProps({
    show: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['login', 'offline']);

  function openRegister() {
    window.api.send('toMain', {
      type: 'openExternal',
      url: 'http://165.227.205.129:8080/register',
    });
  }
</script>
