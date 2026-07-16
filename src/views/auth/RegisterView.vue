<template>
  <v-container
    class="d-flex align-center justify-center"
    style="min-height: 100vh"
  >
    <v-card width="480" class="pa-2">
      <v-card-title class="d-flex align-center justify-center gap-2 pa-6 pb-2">
        <v-icon color="primary" size="28">mdi-package-variant-closed</v-icon>
        <span class="text-h5 font-weight-bold text-primary">{{
          i18n.t('app.title')
        }}</span>
      </v-card-title>
      <v-card-text class="pt-4">
        <!-- Account type selector -->
        <div class="text-body-2 text-medium-emphasis mb-2">
          {{ i18n.t('auth.accountType') }}
        </div>
        <div class="d-flex gap-3 mb-6">
          <v-card
            :color="accountType === 'individual' ? 'primary' : undefined"
            :variant="accountType === 'individual' ? 'elevated' : 'outlined'"
            class="flex-grow-1 pa-3 text-center cursor-pointer"
            @click="accountType = 'individual'"
          >
            <v-icon
              :color="accountType === 'individual' ? 'white' : undefined"
              size="28"
              class="mb-1"
              >mdi-account</v-icon
            >
            <div class="text-body-2 font-weight-medium">
              {{ i18n.t('auth.individual') }}
            </div>
            <div class="text-caption">{{ i18n.t('auth.individualDesc') }}</div>
          </v-card>
          <v-card
            :color="accountType === 'organization' ? 'primary' : undefined"
            :variant="accountType === 'organization' ? 'elevated' : 'outlined'"
            class="flex-grow-1 pa-3 text-center cursor-pointer"
            @click="accountType = 'organization'"
          >
            <v-icon
              :color="accountType === 'organization' ? 'white' : undefined"
              size="28"
              class="mb-1"
              >mdi-office-building</v-icon
            >
            <div class="text-body-2 font-weight-medium">
              {{ i18n.t('auth.organization') }}
            </div>
            <div class="text-caption">{{ i18n.t('auth.orgDesc') }}</div>
          </v-card>
        </div>

        <v-form ref="formRef" @submit.prevent="submit">
          <v-text-field
            v-model="name"
            :label="i18n.t('auth.name')"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || i18n.t('forms.validation.required')]"
            class="mb-4"
          />
          <v-text-field
            v-model="email"
            :label="i18n.t('auth.email')"
            type="email"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || i18n.t('forms.validation.required')]"
            class="mb-4"
          />
          <v-text-field
            v-model="password"
            :label="i18n.t('auth.password')"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => (!!v && v.length >= 8) || 'Min 8 characters']"
            class="mb-4"
          />
          <v-text-field
            v-if="accountType === 'organization'"
            v-model="orgName"
            :label="i18n.t('auth.orgName')"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || i18n.t('forms.validation.required')]"
            class="mb-4"
          />
          <v-alert
            v-if="error"
            type="error"
            density="compact"
            class="mb-4"
            closable
            @click:close="error = null"
          >
            {{ error }}
          </v-alert>
          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
          >
            {{ i18n.t('auth.createAccount') }}
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions class="flex-column pa-4 pt-0">
        <v-btn variant="text" size="small" @click="router.push('/login')">
          {{ i18n.t('auth.hasAccount') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../store/auth';
  import { useI18nStore } from '../../store/i18n';

  const router = useRouter();
  const auth = useAuthStore();
  const i18n = useI18nStore();

  const formRef = ref(null);
  const name = ref('');
  const email = ref('');
  const password = ref('');
  const orgName = ref('');
  const accountType = ref('individual');
  const showPassword = ref(false);
  const loading = ref(false);
  const error = ref(null);

  async function submit() {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
    loading.value = true;
    error.value = null;
    try {
      await auth.register({
        name: name.value,
        email: email.value,
        password: password.value,
        ...(accountType.value === 'organization' && orgName.value
          ? { org_name: orgName.value }
          : {}),
      });
      router.push('/');
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }
</script>
