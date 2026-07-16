<script setup>
import GenericTableCrud from '../../components/generics/generic-table-crud.js';
import StockAdjustmentModal from '../../components/generics/StockAdjustmentModal.vue';
import { ref, inject } from 'vue';
import { useI18nStore } from '../../store/i18n';

const i18n = useI18nStore();
const eventBus = inject('eventBus');

let title = ref('Products');
let columns = ref([
  { id: 0, key: 'name', title: 'Name' },
  { id: 1, key: 'category_name', title: 'Category' },
  { id: 2, key: 'shelve_name', title: 'Shelve' },
  { id: 3, key: 'rack_name', title: 'Rack' },
  { id: 4, key: 'quantity', title: 'Quantity' },
]);
let endpoint = ref('products');
let formFields = ref([
  { key: 'name', label: 'Name', value: '', rules: [v => !!v || 'Name is required'] },
  { key: 'quantity', label: 'Quantity', value: '', rules: [v => !!v || 'Quantity is required'] },
  { key: 'description', label: 'Description', value: '', rules: [v => !!v || 'Description is required'] },
  { key: 'category_name', fk: 'category_id', label: 'Category', value: '', selector: true },
  { key: 'shelve_name', fk: 'shelve_id', label: 'Shelve', value: '', selector: true },
  { key: 'rack_name', fk: 'rack_id', label: 'Rack', value: '', selector: true },
]);
let relations = ref([
  { key: 'category_id', endpoint: 'categories' },
  { key: 'shelve_id', endpoint: 'shelves' },
  { key: 'rack_id', endpoint: 'racks' }
]);

// Stock adjustment extra row actions
const extraRowActions = ref([
  { label: i18n.t('actions.entry'), icon: 'mdi-plus-circle', color: 'success', event: 'stock:entry' },
  { label: i18n.t('actions.withdrawal'), icon: 'mdi-minus-circle', color: 'warning', event: 'stock:withdrawal' },
]);

// Stock adjustment modal state
const adjustModal = ref(false);
const adjustProduct = ref(null);
const adjustOperation = ref('entry');

eventBus.on('stock:entry', (product) => {
  adjustProduct.value = product;
  adjustOperation.value = 'entry';
  adjustModal.value = true;
});

eventBus.on('stock:withdrawal', (product) => {
  adjustProduct.value = product;
  adjustOperation.value = 'withdrawal';
  adjustModal.value = true;
});
</script>
<template>
  <generic-table-crud
    :title="title"
    :columns="columns"
    :endpoint="endpoint"
    :formFields="formFields"
    :relations="relations"
    :extraRowActions="extraRowActions"
  />
  <stock-adjustment-modal
    v-model="adjustModal"
    :product="adjustProduct"
    :operation="adjustOperation"
    @done="eventBus.emit('refreshData')"
  />
</template>
