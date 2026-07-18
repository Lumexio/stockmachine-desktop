<template>
  <v-dialog v-model="open" max-width="420" @keydown.esc="close">
    <v-card>
      <v-card-title class="pa-4">
        {{ title }}
        <span v-if="product" class="text-body-2 text-medium-emphasis ml-2">— {{ product.name }}</span>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-form ref="formRef" @submit.prevent="submit">
          <v-text-field
            v-model.number="quantity"
            :label="i18n.t('forms.label.products.quantity')"
            type="number"
            min="1"
            variant="outlined"
            density="comfortable"
            :rules="[v => (!!v && v > 0) || i18n.t('forms.validation.required')]"
            class="mb-3"
          />
          <v-textarea
            v-model="notes"
            :label="i18n.t('common.notes')"
            variant="outlined"
            density="comfortable"
            rows="2"
            auto-grow
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="close">{{ i18n.t('actions.cancel') }}</v-btn>
        <v-btn
          :color="operation === 'entry' ? 'success' : 'warning'"
          variant="elevated"
          :loading="loading"
          @click="submit"
        >
          <v-icon class="mr-1">{{ operation === 'entry' ? 'mdi-plus' : 'mdi-minus' }}</v-icon>
          {{ i18n.t(`actions.${operation}`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useI18nStore } from '../../store/i18n';
import { add, update, enqueueOperation } from '../../api/indexeddb';
import { runSync } from '../../utils/sync-service';
import { useConnectivity } from '../../composables/use-connectivity';

const i18n = useI18nStore();
const toast = useToast();
const { isOnline } = useConnectivity();

const props = defineProps({
  modelValue: Boolean,  // v-model:open
  product: Object,      // current product row
  operation: {          // 'entry' | 'withdrawal'
    type: String,
    default: 'entry',
  },
});
const emit = defineEmits(['update:modelValue', 'done']);

const formRef = ref(null);
const quantity = ref(1);
const notes = ref('');
const loading = ref(false);

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const title = computed(() =>
  props.operation === 'entry'
    ? i18n.t('actions.entry')
    : i18n.t('actions.withdrawal')
);

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid || !props.product) return;
  loading.value = true;
  try {
    const quantityBefore = Number(props.product.quantity) || 0;
    const localProduct = { ...props.product };
    const adjQty = Number(quantity.value);
    if (props.operation === 'entry') {
      localProduct.quantity = quantityBefore + adjQty;
    } else if (props.operation === 'withdrawal') {
      localProduct.quantity = quantityBefore - adjQty;
    }
    const quantityAfter = localProduct.quantity;

    await update('products', localProduct);

    await add('operation_history', { entity_type: 'product', entity_id: props.product.id, operation: props.operation, quantity_before: quantityBefore, quantity_after: quantityAfter, notes: notes.value || undefined, created_at: new Date().toISOString() });

    await enqueueOperation({
      operation: props.operation,
      endpoint: 'products',
      payload: {
        id: props.product.id,
        quantity: quantity.value,
        notes: notes.value || undefined,
      },
    });

    if (isOnline.value) {
      runSync().catch((err) => console.error('Sync failed in background:', err));
    }

    toast.success(i18n.t('messages.success.updated'));
    emit('done');
    close();
  } catch (e) {
    toast.error(e.message || i18n.t('messages.error.update'));
  } finally {
    loading.value = false;
  }
}

function close() {
  open.value = false;
  quantity.value = 1;
  notes.value = '';
}
</script>
