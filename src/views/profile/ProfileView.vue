<template>
  <v-container class="pa-6" max-width="700">
    <!-- Section 1: User Profile -->
    <v-card v-if="auth.isAuthenticated" class="mb-6">
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
        <span>{{ i18n.t('settings.userProfile') }}</span>
        <v-chip color="primary" size="small">{{ userAccountType.toUpperCase() }} ACCOUNT</v-chip>
      </v-card-title>
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
            userAccountType === 'team'
              ? i18n.t('auth.organization')
              : i18n.t('auth.individual')
          "
        />
      </v-list>
    </v-card>

    <!-- Section 2: Account Actions & Logout -->
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

    <!-- Offline mode card -->
    <v-card v-else>
      <v-card-title class="text-h6 pa-4">Offline Account</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="text-body-1 mb-4">
          You are currently using STOCKMACHINE in offline mode. Your inventory data is stored locally in IndexedDB.
        </div>
        <v-btn color="primary" to="/login" prepend-icon="mdi-login">
          Connect / Login Account
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18nStore } from '../../store/i18n';
  import { useAuthStore } from '../../store/auth';

  const router = useRouter();
  const i18n = useI18nStore();
  const auth = useAuthStore();

  const userAccountType = computed(() => {
    return auth.user?.account_type || 'team';
  });

  function logout() {
    auth.logout();
    router.push('/login');
  }
</script>
