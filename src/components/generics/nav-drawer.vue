<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>
      STOCKMACHINE
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-switch :prepend-icon="iconTheme" class="mr-3" @click="setDark" v-model="darkMode" hide-details inset></v-switch>
    <v-btn icon>
      <v-icon>mdi-content-save</v-icon>
      <v-menu offset-y activator="parent">
        <v-list>
          <FileMenuItem v-for="item in menuItems" :key="item.type" v-bind="item"
            :menu-options="Object.values(FILE_FORMATS)" @action="handleMenuAction" />
        </v-list>
      </v-menu>
    </v-btn>
  </v-app-bar>
  <v-navigation-drawer app v-model="drawer">
    <v-list>
      <v-list-item :append-icon="item.icon" v-for="item in items" :key="item.title" :to="item.to">
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <modal-generic ref="modalRef" title="Import Data" :form-fields="fileUploadFields" mode="create">
    <template #buttonAction>
      <v-btn color="primary" variant="tonal" @click="handleFileUpload">
        Import
        <v-icon>mdi-upload</v-icon>
      </v-btn>
    </template>
  </modal-generic>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { useStore } from '../../store';
import { useGenericFetchQueries } from "../../api/generic-fetch-querys";
import ModalGeneric from './modal-generic.js';
import { useToast } from 'vue-toast-notification';
import { FILE_FORMATS, MENU_ITEMS } from '../../constants/fileOperations';
import FileMenuItem from '../menus/FileMenuItem.vue';

const store = useStore();
const props = defineProps({
  items: Array,
});

const { exportDataToFile, importDataFromFile } = useGenericFetchQueries();
let drawer = ref(false);

let iconTheme = computed(() => (darkMode.value ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny'));
const darkMode = computed({
  get() {
    return store.hasDarkMode === 'dark';
  },
  set(value) {
    store.setDarkMode(value ? 'dark' : 'light');
  }
});

onMounted(() => {
  hasDarkMode();
});

function setDark() {
  store.setDarkMode(darkMode.value ? 'light' : 'dark');
}

function hasDarkMode() {
  return store.hasDarkMode === 'dark';
}

const toast = useToast();
const eventBus = inject('eventBus');

async function handleExport(param) {
  try {
    await exportDataToFile(param);
    eventBus.emit('refreshData');
    toast.success('Data exported and refreshed successfully');
  } catch (error) {
    toast.error('Error during export');
    console.error(error);
  }
}

const fileFormat = ref('');
const fileUploadFields = ref([
  {
    key: 'file',
    label: 'Select File',
    value: [], // Initialize as empty array
    type: 'file',
    rules: [v => !!v?.length || 'File is required'],
    isFileUpload: true,
    accept: computed(() => {
      switch (fileFormat.value) {
        case 'json': return '.json';
        case 'xlsx': return '.xlsx';
        case 'csv': return '.csv';
        default: return '';
      }
    })
  }
]);

const modalRef = ref(null);

function openImportModal(format) {
  fileFormat.value = format;
  modalRef.value?.handleOpen();
}

async function handleFileUpload() {
  const files = fileUploadFields.value[0].value;
  if (files?.length) {
    try {
      await importDataFromFile(files[0], fileFormat.value);
      modalRef.value?.handleClose();
      await new Promise(resolve => setTimeout(resolve, 100));
      eventBus.emit('refreshData');
      toast.success('Data imported and refreshed successfully');
      fileUploadFields.value[0].value = []; // Reset as empty array
    } catch (error) {
      toast.error('Error during import');
      console.error(error);
    }
  }
}

const menuItems = [
  MENU_ITEMS.EXPORT,
  MENU_ITEMS.IMPORT
];

const handleMenuAction = async ({ type, format }) => {
  try {
    if (type === 'export') {
      await handleExport(format);
    } else {
      openImportModal(format);
    }
  } catch (error) {
    toast.error(`Error during ${type}`);
    console.error(error);
  }
};
</script>