<template>
 <v-theme-provider :theme="store.hasDarkMode">
  <v-responsive>
   <v-app>
    <nav-drawer :items="list" />
    <v-main>
     <router-view />
    </v-main>
   </v-app>
  </v-responsive>
 </v-theme-provider>
</template>

<script setup>
import { provide, ref, onMounted } from 'vue';
import NavDrawer from './components/generics/nav-drawer.vue';
import useStore from './store';
import { watch } from 'vue';

import { eventBus } from './utils/eventBus';
import { useI18nStore } from './store/i18n';
import { NAV_ITEMS } from './constants/navigation';

const store = useStore();
const i18n = useI18nStore();

onMounted(() => {
 // Initialize language from localStorage if exists
 const savedLang = localStorage.getItem('language');
 if (savedLang) {
  i18n.setLocale(savedLang);
 }
});



// Provide eventBus at the App level
provide('eventBus', eventBus);

const createNavItems = () => NAV_ITEMS.map(item => ({
 ...item,
 title: i18n.t(`navigation.${item.key}`)
}));

const list = ref(createNavItems());

// Watch for language changes and update list
watch(() => i18n.currentLocale, () => {
 list.value = createNavItems();
}, { immediate: true });

</script>