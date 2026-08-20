<template>
  <v-dialog v-model="isOpen" max-width="600" persistent transition="dialog-bottom-transition">
    <v-card class="glass-modal rounded-xl border-thin">
      <v-card-title class="d-flex justify-space-between align-center px-6 py-4">
        <span class="text-h5 font-weight-bold tracking-tight">Complete Subscription</span>
        <v-btn icon="mdi-close" variant="tonal" size="small" rounded="lg" @click="closeModal" />
      </v-card-title>
      
      <v-divider class="opacity-20" />

      <v-card-text class="pa-6" style="min-height: 400px; position: relative;">
        <!-- Premium Skeleton Loader -->
        <div v-if="loading" class="skeleton-wrapper position-absolute w-100 h-100 top-0 left-0 pa-6">
          <v-skeleton-loader type="list-item-two-line, image, list-item-three-line, actions" class="bg-transparent" />
        </div>
        
        <!-- Stripe Elements Mount Point -->
        <div id="checkout-mount-point" :class="{'opacity-0': loading, 'checkout-ready': !loading}"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.glass-modal {
  background: rgba(var(--v-theme-surface), 0.75) !important;
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.tracking-tight {
  letter-spacing: -0.025em !important;
}

.skeleton-wrapper {
  z-index: 10;
  transition: opacity 0.3s ease;
}

.checkout-ready {
  transition: opacity 0.5s ease 0.1s;
}
</style>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeEmbeddedCheckout } from '@stripe/stripe-js';

const props = defineProps<{
  modelValue: boolean;
  clientSecret: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'closed'): void;
  (e: 'success'): void;
}>();

const isOpen = ref(props.modelValue);
const loading = ref(false);
let checkoutInstance: StripeEmbeddedCheckout | null = null;

watch(() => props.modelValue, (val) => {
  isOpen.value = val;
  if (val && props.clientSecret) {
    initializeCheckout();
  }
});

watch(isOpen, (val) => {
  emit('update:modelValue', val);
});

async function initializeCheckout() {
  loading.value = true;
  try {
    const stripe = await loadStripe('pk_test_51OaocLLziPoKDnBfC3llEbiKqhUI7CBTRnkjdwi7XpEcsuo9juKCPHKEZpq1RP9cmnt55xI2ztbAB3iy5z7ydCrg00HAyJwBqe');
    if (!stripe || !props.clientSecret) return;

    await nextTick(); // Wait for DOM element #checkout-mount-point

    checkoutInstance = await (stripe as any).initEmbeddedCheckout({
      clientSecret: props.clientSecret,
      onComplete: () => {
        emit('success');
        closeModal();
      }
    });
    
    checkoutInstance?.mount('#checkout-mount-point');
  } catch (e) {
    console.error('Failed to initialize Stripe checkout:', e);
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  if (checkoutInstance) {
    checkoutInstance.destroy();
    checkoutInstance = null;
  }
  isOpen.value = false;
  emit('closed');
}
</script>
