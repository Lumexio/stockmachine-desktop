<template>
 <v-menu :open-on-focus="false" activator="parent" :open-on-hover="false" submenu>
  <v-list>
   <v-list-item v-for="option in options" :key="option.format" @click="handleAction(option.format)">
    <template #title>
     <v-list-item-action>
      <v-icon>{{ option.icon }}</v-icon>
     </v-list-item-action>
     {{ option.label }}
    </template>
   </v-list-item>
  </v-list>
 </v-menu>
</template>

<script setup>
defineProps({
 options: {
  type: Array,
  required: true,
  validator: (options) => options.every(opt =>
   opt.format && opt.icon && opt.label
  )
 }
});

const emit = defineEmits(['action']);

const handleAction = (format) => {
 emit('action', format);
};
</script>
