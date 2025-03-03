<template>
 <v-menu :location="location">
  <template v-slot:activator="{ props }">
   <v-btn :color="color" v-bind="props" :variant="variant" :density="density" :icon="showAsIcon">
    <v-icon v-if="icon">{{ icon }}</v-icon>
    <span v-if="!showAsIcon">{{ label }}</span>
   </v-btn>
  </template>
  <v-list>
   <v-list-item v-for="(item, index) in items" :key="index" :value="item.value" @click="$emit('selected', item)">
    <template v-slot:prepend v-if="item.icon">
     <v-icon>{{ item.icon }}</v-icon>
    </template>
    <v-list-item-title>{{ item.text }}</v-list-item-title>
   </v-list-item>
  </v-list>
 </v-menu>
</template>

<script setup>
defineProps({
 items: {
  type: Array,
  required: true,
  validator: (items) => items.every(item => item.text && item.value)
 },
 label: String,
 icon: String,
 color: {
  type: String,
  default: 'primary'
 },
 variant: {
  type: String,
  default: 'text'
 },
 density: {
  type: String,
  default: 'comfortable'
 },
 location: {
  type: String,
  default: 'bottom end'
 },
 showAsIcon: {
  type: Boolean,
  default: false
 }
});

defineEmits(['selected']);
</script>
