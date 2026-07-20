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
        <v-divider class="w-100 my-2" />
        <v-btn color="secondary" variant="tonal" size="small" block @click="inviteModalOpen = true">
          Got an invite code?
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Invite Code Dialog -->
    <v-dialog v-model="inviteModalOpen" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4 bg-primary text-white">Accept Invitation</v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-2 mb-4">Enter the 6-character invite code you received via email.</p>
          <v-text-field
            v-model="inviteCodeInput"
            label="Invite Code"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            autofocus
            @keyup.enter="validateInviteCode"
          />
          <v-alert v-if="inviteError" type="error" variant="tonal" class="mb-4 text-caption">
            {{ inviteError }}
          </v-alert>
          <v-alert v-if="inviteSuccessMsg" type="success" variant="tonal" class="mb-4 text-caption">
            {{ inviteSuccessMsg }}
          </v-alert>
          <div class="d-flex justify-end ga-2 mt-4">
            <v-btn variant="text" @click="inviteModalOpen = false">Cancel</v-btn>
            <v-btn color="primary" @click="validateInviteCode" :loading="validatingInvite">Verify</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../store/auth';
  import { useI18nStore } from '../../store/i18n';
  import { apiFetch } from '../../api/custom-fetch';

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
  
  const inviteModalOpen = ref(false);
  const inviteCodeInput = ref('');
  const validatingInvite = ref(false);
  const inviteError = ref('');
  const inviteSuccessMsg = ref('');

  async function validateInviteCode() {
    if (!inviteCodeInput.value) return;
    validatingInvite.value = true;
    inviteError.value = '';
    inviteSuccessMsg.value = '';
    
    try {
      const res = await apiFetch(`/invitations/${inviteCodeInput.value}`);
      if (res && res.organization_name) {
        auth.setPendingInviteCode(inviteCodeInput.value);
        inviteSuccessMsg.value = `You've been invited to ${res.organization_name}! Please complete registration to join.`;
        if (!email.value && res.email) {
          email.value = res.email;
        }
        // Force individual account type visually, as they are joining a team anyway
        accountType.value = 'individual';
        
        setTimeout(() => {
          inviteModalOpen.value = false;
        }, 2500);
      }
    } catch (e) {
      inviteError.value = e.message || 'Invalid or expired invite code.';
    } finally {
      validatingInvite.value = false;
    }
  }

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
