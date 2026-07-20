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
                label="Profile Photo (Upload)"
                variant="outlined"
                density="comfortable"
                hide-details
                prepend-icon="mdi-camera"
                @change="onFileChange"
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

    <!-- Plan & Subscription (Stripe Integration) -->
    <v-card v-if="auth.isAuthenticated" class="mb-6 elevation-1">
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between bg-surface-variant bg-opacity-20">
        <span class="font-weight-bold">Plan & Subscription</span>
        <v-chip :color="currentPlan === 'max' ? 'success' : currentPlan === 'pro' ? 'info' : 'warning'" variant="elevated" size="small" class="font-weight-bold tracking-tight px-4">
          {{ currentPlan.toUpperCase() }} PLAN
        </v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-6">
        <v-row class="mb-2" align="stretch">
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-5 h-100 tier-card d-flex flex-column rounded-xl">
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="text-h6 font-weight-bold">Current Limits</div>
                <v-icon color="primary" size="large">mdi-tune-vertical</v-icon>
              </div>
              <v-list density="compact" bg-color="transparent" class="flex-grow-1">
                <v-list-item class="px-0">
                  <template v-slot:prepend><v-icon color="success" size="small" class="mr-3">mdi-check-circle</v-icon></template>
                  <v-list-item-title>Max Products: <strong>{{ currentPlan === 'max' ? '500' : currentPlan === 'pro' ? '150' : '50' }}</strong></v-list-item-title>
                </v-list-item>
                <v-list-item class="px-0">
                  <template v-slot:prepend><v-icon color="success" size="small" class="mr-3">mdi-check-circle</v-icon></template>
                  <v-list-item-title>Max Locations: <strong>{{ currentPlan === 'max' ? '10' : currentPlan === 'pro' ? '5' : '1' }}</strong></v-list-item-title>
                </v-list-item>
                <v-list-item class="px-0">
                  <template v-slot:prepend><v-icon color="success" size="small" class="mr-3">mdi-check-circle</v-icon></template>
                  <v-list-item-title class="text-wrap">Exports: <strong>{{ currentPlan === 'max' ? 'Excel, CSV, JSON, PDF Reports' : currentPlan === 'pro' ? 'Excel, CSV, JSON' : 'Excel Only' }}</strong></v-list-item-title>
                </v-list-item>
                <v-list-item class="px-0">
                  <template v-slot:prepend><v-icon color="success" size="small" class="mr-3">mdi-check-circle</v-icon></template>
                  <v-list-item-title>Team Accounts: <strong>{{ currentPlan === 'max' ? '50 Accounts' : currentPlan === 'pro' ? '15 Accounts' : '5 Accounts' }}</strong></v-list-item-title>
                </v-list-item>
              </v-list>
              <div class="mt-4">
                <v-btn
                  v-if="userAccountType === 'individual'"
                  color="primary"
                  variant="outlined"
                  size="small"
                  block
                  class="rounded-lg"
                  @click="switchAccountType('team')"
                >
                  Switch to Organization Account
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-1 h-100 premium-card-wrapper rounded-xl elevation-4 d-flex">
              <div class="pa-4 flex-grow-1 premium-card-inner rounded-lg d-flex flex-column">
                <div class="d-flex justify-space-between align-start mb-2">
                  <div>
                    <div class="text-h5 font-weight-black tracking-tight bg-clip-text text-primary">Upgrade Plan</div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      Unlock higher limits and advanced analytics features instantly.
                    </div>
                  </div>
                  <v-icon color="primary" size="x-large" class="glow-icon">mdi-rocket-launch</v-icon>
                </div>
                
                <div class="d-flex flex-column ga-3 flex-grow-1 justify-center">
                  <v-btn
                    v-if="currentPlan === 'free'"
                    color="info"
                    size="large"
                    variant="tonal"
                    class="rounded-lg font-weight-bold"
                    @click="triggerStripeCheckout('pro', userAccountType)"
                  >
                    Upgrade to Pro <span class="ml-1 opacity-70">(${{ userAccountType === 'individual' ? '4' : '7' }}/mo)</span>
                  </v-btn>

                  <v-btn
                    v-if="currentPlan !== 'max'"
                    color="success"
                    size="large"
                    class="rounded-lg font-weight-bold text-white premium-btn shadow-success"
                    @click="triggerStripeCheckout('max', userAccountType)"
                  >
                    Upgrade to Max <span class="ml-1 opacity-90">(${{ userAccountType === 'individual' ? '11.99' : '19.99' }}/mo)</span>
                    <v-icon right size="small" class="ml-2">mdi-star-four-points</v-icon>
                  </v-btn>
                  
                  <div v-if="currentPlan === 'max'" class="d-flex align-center justify-center py-8 text-success font-weight-bold text-h6 tracking-tight">
                    <v-icon left size="large" class="mr-2">mdi-check-decagram</v-icon>
                    You have the Max Plan!
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Team Administration (Visible ONLY for Team Accounts & Owner/Admin) -->
    <v-card v-if="auth.isAuthenticated && userAccountType === 'team' && isOwnerOrAdmin" class="mb-6">
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
        <span>Team Member Administration</span>
        <v-chip color="info" size="small">{{ teamMembers.length }} Members</v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Email</th>
              <th class="text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in teamMembers" :key="member.id">
              <td>{{ member.name }}</td>
              <td>{{ member.email }}</td>
              <td>
                <v-chip size="x-small" :color="member.role === 'owner' ? 'primary' : 'secondary'">
                  {{ member.role }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
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

    <CheckoutModal
      v-model="checkoutModalOpen"
      :clientSecret="checkoutClientSecret"
      @closed="onCheckoutClosed"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18nStore } from '@/store/i18n';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/api/custom-fetch';
import CheckoutModal from './CheckoutModal.vue';

const route = useRoute();
const router = useRouter();
const i18n = useI18nStore();
const auth = useAuthStore();

const savingProfile = ref(false);
const savingPassword = ref(false);
const checkoutModalOpen = ref(false);
const checkoutClientSecret = ref<string | null>(null);
const teamMembers = ref<Array<{ id: number; name: string; email: string; role: string }>>([]);

const profileForm = ref({
  name: auth.user?.name || '',
  photo_url: '',
});

const photoFile = ref<File[]>([]);

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

const isOwnerOrAdmin = computed(() => {
  return auth.user?.role === 'owner' || auth.user?.role === 'admin';
});

onMounted(async () => {
  if (auth.isAuthenticated) {
    fetchProfile();
    if (userAccountType.value === 'team' && isOwnerOrAdmin.value) {
      fetchTeamMembers();
    }
    
    // Stripe automatic checkout integration
    const plan = route.query.plan as string;
    const type = route.query.type as string;
    if (plan && type && (plan === 'pro' || plan === 'max')) {
      // If we returned from Stripe checkout and we have the session id, we can apply upgrade.
      const sessionId = route.query.session_id as string;
      if (sessionId) {
        applyUpgradeAfterCheckout(plan as 'pro' | 'max', type as 'individual' | 'team', sessionId);
      } else {
        // If we arrived from the SPA landing page, trigger the checkout modal
        triggerStripeCheckout(plan as 'pro' | 'max', type as 'individual' | 'team');
      }
      router.replace({ query: {} }); // clear params
    }
  }
});

async function applyUpgradeAfterCheckout(targetPlan: 'pro' | 'max', targetAccountType: 'individual' | 'team', sessionId: string) {
  try {
    await apiFetch('/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan_id: targetPlan, account_type: targetAccountType }), 
    });
    await (auth as any).fetchUser();
    alert('Subscription upgraded successfully!');
  } catch (e) {
    console.error('Failed to apply upgrade:', e);
  }
}

async function fetchProfile() {
  try {
    const me = await apiFetch('/auth/me') as { name?: string; photo_url?: string };
    if (me) {
      profileForm.value.name = me.name || auth.user?.name || '';
      profileForm.value.photo_url = me.photo_url || '';
    }
  } catch (e) {
    // fallback
  }
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileForm.value.photo_url = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    profileForm.value.photo_url = '';
  }
}

async function fetchTeamMembers() {
  try {
    const res = await apiFetch('/users') as { data?: Array<any> };
    if (res?.data) {
      teamMembers.value = res.data;
    }
  } catch (e) {
    // fallback
  }
}

async function updateProfile() {
  savingProfile.value = true;
  try {
    await apiFetch('/auth/profile', {
      method: 'POST',
      body: JSON.stringify(profileForm.value),
    });
    await (auth as any).fetchUser();
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

async function triggerStripeCheckout(targetPlan: 'pro' | 'max', targetAccountType: 'individual' | 'team') {
  try {
    const res = await apiFetch('/billing/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ 
        target_plan: targetPlan, 
        target_account_type: targetAccountType,
        return_url: window.location.href.split('?')[0] + '?session_id={CHECKOUT_SESSION_ID}&plan=' + targetPlan + '&type=' + targetAccountType
      }),
    }) as { checkout_url?: string; client_secret?: string };
    if (res?.client_secret) {
      checkoutClientSecret.value = res.client_secret;
      checkoutModalOpen.value = true;
    }
  } catch (e: any) {
    console.error(e);
    alert('Failed to initialize Stripe checkout. Ensure your backend is running and your Stripe API keys are valid. Error: ' + (e.message || 'Unknown error'));
  }
}

function onCheckoutClosed() {
  checkoutClientSecret.value = null;
}

async function switchAccountType(targetType: 'individual' | 'team') {
  try {
    await apiFetch('/auth/profile', {
      method: 'POST',
      body: JSON.stringify({ account_type: targetType }),
    });
    await (auth as any).fetchUser();
    if (targetType === 'team' && isOwnerOrAdmin.value) {
      fetchTeamMembers();
    }
  } catch (e) {
    console.error(e);
  }
}

function logout(): void {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.tracking-tight {
  letter-spacing: -0.025em !important;
}

.tier-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1) !important;
}

.tier-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px -10px rgba(var(--v-theme-on-surface), 0.15) !important;
}

.premium-card-wrapper {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-success)));
  background-size: 200% 200%;
  animation: gradientAnimation 6s ease infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.premium-card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px -5px rgba(var(--v-theme-success), 0.4) !important;
}

.premium-card-inner {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
}

.premium-btn {
  background: linear-gradient(90deg, rgb(var(--v-theme-success)), rgb(var(--v-theme-info)));
  background-size: 200% auto;
  transition: 0.5s;
}

.premium-btn:hover {
  background-position: right center;
}

.shadow-success {
  box-shadow: 0 8px 20px -6px rgba(var(--v-theme-success), 0.6) !important;
}

.glow-icon {
  filter: drop-shadow(0 0 8px rgba(var(--v-theme-primary), 0.5));
}

@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
