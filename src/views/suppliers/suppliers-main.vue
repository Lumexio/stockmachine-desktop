<template>
  <generic-table-crud :title="title" :columns="columns" :endpoint="endpoint" :formFields="formFields" />
</template>

<script setup>
import GenericTableCrud from '../../components/generics/generic-table-crud.js';
import { ref } from 'vue';
import { useI18nStore } from '../../store/i18n';

const i18n = useI18nStore();

let title = ref(i18n.t('tables.suppliers.title'));
let columns = ref([
  { id: 0, key: 'id', title: 'ID' },
  { id: 1, key: 'name', title: i18n.t('tables.suppliers.columns.name') },
  { id: 2, key: 'contact_name', title: i18n.t('tables.suppliers.columns.contact_name') },
  { id: 3, key: 'email', title: i18n.t('tables.suppliers.columns.email') },
  { id: 4, key: 'phone', title: i18n.t('tables.suppliers.columns.phone') },
]);
let endpoint = ref('suppliers');
let formFields = ref([
  { key: 'name', label: i18n.t('forms.label.suppliers.name'), value: '', rules: [v => !!v || i18n.t('forms.validation.required')] },
  { key: 'contact_name', label: i18n.t('forms.label.suppliers.contact_name'), value: '' },
  { key: 'email', label: i18n.t('forms.label.suppliers.email'), value: '' },
  { key: 'phone', label: i18n.t('forms.label.suppliers.phone'), value: '' },
  { key: 'address', label: i18n.t('forms.label.suppliers.address'), value: '' },
]);
</script>
