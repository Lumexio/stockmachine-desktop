<template>
  <v-dialog v-model="isOpen" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center px-4 py-3">
        <span class="text-h6">Complete Subscription</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="closeModal" />
      </v-card-title>
      
      <v-divider />

      <v-card-text class="pa-4" style="min-height: 400px;">
        <div v-if="loading" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div id="checkout-mount-point"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

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
