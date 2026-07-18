<script setup>
import GenericTableCrud from '../../components/generics/generic-table-crud.js';
import StockAdjustmentModal from '../../components/generics/StockAdjustmentModal.vue';
import { ref, inject } from 'vue';
import { useI18nStore } from '../../store/i18n';

const i18n = useI18nStore();
const eventBus = inject('eventBus');

let title = ref(i18n.t('tables.products.title'));
let columns = ref([
  { id: 0, key: 'name', title: i18n.t('tables.products.columns.name') },
  { id: 1, key: 'category_name', title: i18n.t('tables.products.columns.category_name') },
  { id: 2, key: 'shelve_name', title: i18n.t('tables.products.columns.shelve_name') },
  { id: 3, key: 'rack_name', title: i18n.t('tables.products.columns.rack_name') },
  { id: 4, key: 'supplier_name', title: i18n.t('tables.products.columns.supplier_name') },
  { id: 5, key: 'cost_price', title: i18n.t('tables.products.columns.cost_price') },
  { id: 6, key: 'selling_price', title: i18n.t('tables.products.columns.selling_price') },
  { id: 7, key: 'min_stock', title: i18n.t('tables.products.columns.min_stock') },
  { id: 8, key: 'quantity', title: i18n.t('tables.products.columns.quantity') },
]);
let endpoint = ref('products');
let formFields = ref([
  { key: 'name', label: i18n.t('forms.label.products.name'), value: '', rules: [v => !!v || i18n.t('forms.validation.required')] },
  { key: 'quantity', label: i18n.t('forms.label.products.quantity'), value: '', rules: [v => !!v || i18n.t('forms.validation.required')] },
  { key: 'description', label: i18n.t('forms.label.products.description'), value: '' },
  { key: 'category_name', fk: 'category_id', label: i18n.t('forms.label.products.category_name'), value: '', selector: true },
  { key: 'shelve_name', fk: 'shelve_id', label: i18n.t('forms.label.products.shelve_name'), value: '', selector: true },
  { key: 'rack_name', fk: 'rack_id', label: i18n.t('forms.label.products.rack_name'), value: '', selector: true },
  { key: 'supplier_name', fk: 'supplier_id', label: i18n.t('forms.label.products.supplier_name'), value: '', selector: true },
  { key: 'cost_price', label: i18n.t('forms.label.products.cost_price'), value: 0 },
  { key: 'selling_price', label: i18n.t('forms.label.products.selling_price'), value: 0 },
  { key: 'min_stock', label: i18n.t('forms.label.products.min_stock'), value: 10 },
]);
let relations = ref([
  { key: 'category_id', endpoint: 'categories' },
  { key: 'shelve_id', endpoint: 'shelves' },
  { key: 'rack_id', endpoint: 'racks' },
  { key: 'supplier_id', endpoint: 'suppliers' },
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
