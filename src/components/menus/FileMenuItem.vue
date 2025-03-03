<template>
 <v-list-item link>
  <template #title>
   <v-icon>{{ icon }}</v-icon>
   {{ title }}
  </template>
  <template #append>
   <v-icon size="x-small">mdi-menu-right</v-icon>
  </template>

  <FileOperationsMenu :options="menuOptions" @action="(format) => $emit('action', { type, format })" />
 </v-list-item>

</template>

<script setup>
import FileOperationsMenu from './FileOperationsMenu.vue';

defineProps({
 title: {
  type: String,
  required: true
 },
 icon: {
  type: String,
  required: true
 },
 type: {
  type: String,
  required: true,
  validator: (value) => ['export', 'import'].includes(value)
 },
 menuOptions: {
  type: Array,
  required: true
 }
});

defineEmits(['action']);
</script>
