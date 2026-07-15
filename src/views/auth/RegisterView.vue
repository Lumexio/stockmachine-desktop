<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-card width="420" class="pa-2">
      <v-card-title class="text-h5 text-center pa-6">
        {{ i18n.t('app.title') }}
      </v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="submit">
          <v-text-field
            v-model="name"
            :label="i18n.t('auth.name')"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || i18n.t('forms.validation.required')]"
            class="mb-3"
          />
          <v-text-field
            v-model="email"
            :label="i18n.t('auth.email')"
            type="email"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || i18n.t('forms.validation.required')]"
            class="mb-3"
          />
          <v-text-field
            v-model="password"
            :label="i18n.t('auth.password')"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            density="comfortable"
            :rules="[v => (!!v && v.length >= 8) || 'Min 8 characters']"
            class="mb-3"
          />
          <v-text-field
            v-model="orgName"
            :label="i18n.t('auth.orgName')"
            :hint="i18n.t('auth.orgNameHint')"
            persistent-hint
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-alert v-if="error" type="error" density="compact" class="mb-3" closable @click:close="error = null">
            {{ error }}
          </v-alert>
          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
          >
            {{ i18n.t('auth.register') }}
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
      ...(orgName.value ? { org_name: orgName.value } : {}),
    });
    router.push('/');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>
