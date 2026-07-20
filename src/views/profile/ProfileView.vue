<template>
  <v-container class="pa-6" max-width="850">
    <!-- User Profile Details -->
    <v-card v-if="auth.isAuthenticated" class="mb-6">
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" size="40">
            <v-img v-if="profileForm.photo_url" :src="profileForm.photo_url" alt="Avatar" />
            <span v-else class="text-white font-weight-bold">{{ userInitials }}</span>
          </v-avatar>
          <div>
            <div>{{ auth.user?.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ auth.user?.email }}</div>
          </div>
        </div>
        <v-chip color="primary" size="small">{{ userAccountType.toUpperCase() }} ACCOUNT</v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-form @submit.prevent="updateProfile">
          <v-row class="ga-3 mb-2">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="profileForm.name"
                :label="i18n.t('auth.name')"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-file-input
                v-model="photoFile"
                accept="image/png, image/jpeg, image/webp"
                label="Profile Photo"
                prepend-icon="mdi-camera"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="onPhotoSelected"
                show-size
              />
            </v-col>
          </v-row>
          <div class="d-flex ga-3 flex-wrap mt-4">
            <v-btn color="primary" type="submit" :loading="savingProfile">
              Save Profile Changes
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Password Change Section -->
    <v-card v-if="auth.isAuthenticated" class="mb-6">
      <v-card-title class="text-h6 pa-4">Security & Password</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-form @submit.prevent="changePassword">
          <v-row class="ga-3 mb-2">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="passwordForm.newPassword"
                label="New Password"
                type="password"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Confirm New Password"
                type="password"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
          <div class="d-flex ga-3 flex-wrap mt-4">
            <v-btn color="primary" variant="tonal" type="submit" :loading="savingPassword">
              Update Password
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Plan & Subscription (Placeholder since Stripe is not on desktop yet) -->
    <v-card v-if="auth.isAuthenticated" class="mb-6">
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
        <span>Plan & Subscription</span>
        <v-chip :color="currentPlan === 'max' ? 'success' : currentPlan === 'pro' ? 'info' : 'warning'" size="small">
          {{ currentPlan.toUpperCase() }} PLAN
        </v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-2">Current Plan Limits</div>
              <div class="text-body-2 text-medium-emphasis">
                • Max Products: <strong>{{ currentPlan === 'max' ? '500' : currentPlan === 'pro' ? '150' : '50' }}</strong><br />
                • Max Locations: <strong>{{ currentPlan === 'max' ? '10' : currentPlan === 'pro' ? '5' : '1' }}</strong><br />
                • Exports: <strong>{{ currentPlan === 'max' ? 'Excel, CSV, JSON, PDF Reports' : currentPlan === 'pro' ? 'Excel, CSV, JSON' : 'Excel Only' }}</strong><br />
                • Max Team Accounts: <strong>{{ currentPlan === 'max' ? '50 Accounts' : currentPlan === 'pro' ? '15 Accounts' : '5 Accounts' }}</strong>
              </div>
            </v-card>
          </v-col>
        </v-row>
        <div class="text-caption text-medium-emphasis mt-2">
          Billing and subscription upgrades are managed through the Web Application.
        </div>
      </v-card-text>
    </v-card>

    <!-- Section: Account Actions -->
    <v-card v-if="auth.isAuthenticated">
      <v-card-title class="text-h6 pa-4">{{ i18n.t('settings.account') }}</v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex ga-3 flex-wrap">
          <v-btn color="error" variant="tonal" prepend-icon="mdi-logout" @click="logout">
            {{ i18n.t('auth.logout') }}
          </v-btn>
        </div>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18nStore } from '../../store/i18n';
import { useAuthStore } from '../../store/auth';
import { apiFetch } from '../../api/custom-fetch';

const router = useRouter();
const i18n = useI18nStore();
const auth = useAuthStore();

const savingProfile = ref(false);
const savingPassword = ref(false);

const profileForm = ref({
  name: auth.user?.name || '',
  photo_url: auth.user?.photo_url || '',
});
const photoFile = ref(null);

const passwordForm = ref({
  newPassword: '',
  confirmPassword: '',
});

const userInitials = computed(() => {
  const name = auth.user?.name || '';
  return name.slice(0, 2).toUpperCase() || 'US';
});

const userAccountType = computed(() => {
  return auth.user?.account_type || 'team';
});

const currentPlan = computed(() => {
  return auth.user?.organization?.plan_id || 'free';
});

onMounted(() => {
  if (auth.isAuthenticated) {
    fetchProfile();
  }
});

async function fetchProfile() {
  try {
    const me = await apiFetch('/auth/me');
    if (me) {
      profileForm.value.name = me.name || auth.user?.name || '';
      profileForm.value.photo_url = me.photo_url || auth.user?.photo_url || '';
    }
  } catch (e) {
    // fallback
  }
}

function onPhotoSelected(fileOrArray) {
  const file = Array.isArray(fileOrArray) ? fileOrArray[0] : fileOrArray;
  if (!file) {
    // Revert to original user photo if cleared
    profileForm.value.photo_url = auth.user?.photo_url || '';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    profileForm.value.photo_url = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function updateProfile() {
  savingProfile.value = true;
  try {
    const { backendUrl } = (await import('../../store/settings')).useSettingsStore();
    
    // Instead of directly updating if custom-fetch isn't ready for photo updates,
    // we use standard API calls, but for base64 strings standard JSON works perfectly.
    await apiFetch('/auth/profile', {
      method: 'POST',
      body: JSON.stringify(profileForm.value),
    });
    
    // Force a fresh user pull
    const me = await apiFetch('/auth/me');
    if (me && auth.user) {
       auth.user.name = me.name;
       auth.user.photo_url = me.photo_url;
    }
  } catch (e) {
    console.error(e);
  } finally {
    savingProfile.value = false;
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  savingPassword.value = true;
  try {
    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword: passwordForm.value.newPassword }),
    });
    passwordForm.value.newPassword = '';
    passwordForm.value.confirmPassword = '';
    alert('Password updated successfully');
  } catch (e) {
    console.error(e);
  } finally {
    savingPassword.value = false;
  }
}

function logout() {
  auth.logout();
  router.push('/login');
}
</script>
