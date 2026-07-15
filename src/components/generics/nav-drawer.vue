<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>
      {{ i18n.t('app.title') }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <!-- Online/offline + pending badge -->
    <v-chip
      :color="isOnline ? 'success' : 'default'"
      :prepend-icon="isOnline ? 'mdi-wifi' : 'mdi-wifi-off'"
      size="small"
      class="mr-2"
    >
      {{ isOnline ? i18n.t('sync.online') : i18n.t('sync.offline') }}
      <v-badge v-if="pendingCount > 0" :content="pendingCount" color="warning" floating />
    </v-chip>
    <LanguageSelector @change-language="handleLanguageChange" />
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
    <!-- User info + logout -->
    <template v-if="auth.isAuthenticated">
      <v-chip size="small" class="mr-1" prepend-icon="mdi-account">{{ auth.user?.name }}</v-chip>
      <v-btn icon size="small" @click="logout" :title="i18n.t('auth.logout')">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </template>
  </v-app-bar>
  <v-navigation-drawer app v-model="drawer">
    <v-list>
      <v-list-item :append-icon="item.icon" v-for="item in items" :key="item.title" :to="item.to">
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <modal-generic ref="modalRef" :title="i18n.t('modals.import.title')" :form-fields="fileUploadFields" mode="create">
    <template #buttonAction>
      <v-btn color="primary" variant="tonal" @click="handleFileUpload">
        {{ i18n.t('actions.import') }}
        <v-icon>mdi-upload</v-icon>
      </v-btn>
    </template>
  </modal-generic>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/auth';
import { useGenericFetchQueries } from "../../api/generic-fetch-querys";
import ModalGeneric from './modal-generic.js';
import { useToast } from 'vue-toast-notification';
import { FILE_FORMATS, MENU_ITEMS } from '../../constants/fileOperations';
import FileMenuItem from '../menus/FileMenuItem.vue';
import LanguageSelector from '../language/LanguageSelector.vue';
import { useI18nStore } from '../../store/i18n';
import { useConnectivity } from '../../composables/use-connectivity';
import { getQueueLength } from '../../api/indexeddb';
import { useRouter } from 'vue-router';

const store = useStore();
const i18n = useI18nStore();
const auth = useAuthStore();
const router = useRouter();
const { isOnline, canSync } = useConnectivity();
const props = defineProps({
  items: Array,
});

const { exportDataToFile, importDataFromFile } = useGenericFetchQueries();
let drawer = ref(false);

// Pending sync queue count
const pendingCount = ref(0);
async function refreshPendingCount() {
  pendingCount.value = await getQueueLength();
}
refreshPendingCount();
setInterval(refreshPendingCount, 5000);

async function logout() {
  auth.logout();
  router.push('/login');
}

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
    toast.success(i18n.t('messages.success.exported'));
  } catch (error) {
    toast.error(i18n.t('messages.error.export'));
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


const menuItems = computed(() => [
  { ...MENU_ITEMS.EXPORT, title: i18n.t('actions.export') },
  { ...MENU_ITEMS.IMPORT, title: i18n.t('actions.import') }
]);

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

// Add language handling
const handleLanguageChange = (languageCode) => {
  i18n.setLocale(languageCode);
  // Emit a custom event for language change
  eventBus.emit('languageChanged', languageCode);
};
</script>