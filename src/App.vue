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
import { provide, ref } from 'vue';
import NavDrawer from './components/generics/nav-drawer.vue';
import useStore from './store';
import { useGenericFetchQueries } from './api/generic-fetch-querys';
import { eventBus } from './utils/eventBus';

const store = useStore();

const { fetchRelatedData } = useGenericFetchQueries();
const loadItems = async () => {
 const { products, categories, shelves, racks } = await fetchRelatedData();
 // This will refresh all data in the app
 return { products, categories, shelves, racks };
};

// Provide eventBus at the App level
provide('eventBus', eventBus);

const list = ref([
 // { title: 'home', icon: 'mdi-home', to: '/' },
 { title: "Products", icon: "mdi-package-variant-closed", to: "/products" },
 { title: "Categories", icon: "mdi-folder-multiple", to: "/category" },
 { title: "Racks", icon: "mdi-package-variant-closed", to: "/racks" },
 { title: 'Shelves', icon: 'mdi-package-variant-closed', to: '/shelves' },
]);
</script>