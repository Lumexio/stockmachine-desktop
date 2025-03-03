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
import { useGenericFetchQueries } from './api/generic-fetch-querys';
import { eventBus } from './utils/eventBus';
import { useI18nStore } from './store/i18n';
import { computed, watch } from 'vue';
const store = useStore();
const i18n = useI18nStore();

onMounted(() => {
 // Initialize language from localStorage if exists
 const savedLang = localStorage.getItem('language');
 if (savedLang) {
  i18n.setLocale(savedLang);
 }
});

const { fetchRelatedData } = useGenericFetchQueries();
const loadItems = async () => {
 const { products, categories, shelves, racks } = await fetchRelatedData();
 // This will refresh all data in the app
 return { products, categories, shelves, racks };
};

// Provide eventBus at the App level
provide('eventBus', eventBus);

// Change from computed to ref and create a function to update it
const list = ref([
 { title: `${i18n.t('navigation.products')}`, icon: 'mdi-package-variant-closed', to: '/products' },
 { title: `${i18n.t('navigation.categories')}`, icon: 'mdi-folder-multiple', to: '/category' },
 { title: `${i18n.t('navigation.racks')}`, icon: 'mdi-package-variant-closed', to: '/racks' },
 { title: `${i18n.t('navigation.shelves')}`, icon: 'mdi-package-variant-closed', to: '/shelves' },
]);

const updateList = () => {
 list.value = [
  { title: `${i18n.t('navigation.products')}`, icon: 'mdi-package-variant-closed', to: '/products' },
  { title: `${i18n.t('navigation.categories')}`, icon: 'mdi-folder-multiple', to: '/category' },
  { title: `${i18n.t('navigation.racks')}`, icon: 'mdi-package-variant-closed', to: '/racks' },
  { title: `${i18n.t('navigation.shelves')}`, icon: 'mdi-package-variant-closed', to: '/shelves' },
 ];
};

// Watch for language changes and update list
watch(() => i18n.currentLocale, () => {
 updateList();
}, { immediate: true });

</script>