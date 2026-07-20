<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>
      {{ i18n.t('app.title') }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-chip
      :color="(isOnline && !auth.isOfflineMode) ? 'success' : 'default'"
      :prepend-icon="(isOnline && !auth.isOfflineMode) ? 'mdi-wifi' : 'mdi-wifi-off'"
      size="small"
      class="mr-2"
    >
      {{ (isOnline && !auth.isOfflineMode) ? i18n.t('sync.online') : i18n.t('sync.offline') }}
      <v-badge v-if="pendingCount > 0" :content="pendingCount" color="warning" floating />
    </v-chip>
    <LanguageSelector @change-language="handleLanguageChange" />
    <v-switch :prepend-icon="iconTheme" class="mr-3" v-model="darkMode" hide-details inset></v-switch>
    <v-btn icon>
      <v-icon>mdi-content-save</v-icon>
      <v-menu offset-y activator="parent">
        <v-list>
          <FileMenuItem v-for="item in menuItems" :key="item.type" v-bind="item"
            :menu-options="getAllowedFileFormats(item.type)" @action="handleMenuAction" />
        </v-list>
      </v-menu>
    </v-btn>
    <!-- User Profile & Settings side-by-side buttons -->
    <template v-if="auth.isAuthenticated">
      <v-chip
        to="/profile"
        size="small"
        class="mr-2"
        prepend-icon="mdi-account"
        variant="outlined"
      >
        {{ auth.user?.name }}
      </v-chip>
     <v-btn icon size="small" to="/settings" title="Settings" class="mr-2">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </template>

    <template v-else>
      <v-btn to="/login" variant="outlined" size="small" class="mr-2" prepend-icon="mdi-login">
        {{ i18n.t('welcome.loginBtn') }}
      </v-btn>
      <v-btn icon size="small" to="/settings" title="Settings" class="mr-2">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </template>
  </v-app-bar>
  <v-navigation-drawer app v-model="drawer">
    <v-list nav density="compact">
      <v-list-item :append-icon="item.icon" v-for="item in items" :key="item.title" :to="item.to">
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <div v-if="auth.isAuthenticated" class="ma-2 d-flex align-center justify-space-between">
        <v-list-item
          to="/profile"
          rounded="xl"
          prepend-icon="mdi-account-circle"
          :title="auth.user?.name ?? ''"
          class="pa-2 flex-grow-1"
        >
          <template #subtitle>
            <v-chip size="x-small" color="primary" class="mt-1">
              {{ auth.user?.account_type === 'individual' ? 'Individual' : (auth.user?.role || '') }}
            </v-chip>
          </template>
        </v-list-item>
        <v-btn icon size="small" to="/settings" variant="text" title="Settings">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </div>
    </template>
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
import { ref, computed, inject } from 'vue';
import { useStore } from '../../store';
import { useAuthStore } from '../../store/auth';
import { useGenericFetchQueries } from "../../api/generic-fetch-queries";
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
const { isOnline } = useConnectivity();
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

const iconTheme = computed(() => (darkMode.value ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny'));
const darkMode = computed({
  get() {
    return store.isDarkActive;
  },
  set(val) {
    if (val !== store.isDarkActive) {
      store.setDarkMode();
    }
  }
});

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
    value: [],
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
      fileUploadFields.value[0].value = [];
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

const getAllowedFileFormats = (type) => {
  const formats = Object.values(FILE_FORMATS);
  if (type === 'import') return formats;
  const plan = auth.user?.organization?.plan_id || 'free';
  if (plan === 'free') {
    return formats.filter(f => f.format === 'xlsx');
  }
  return formats;
};

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

const handleLanguageChange = (languageCode) => {
  i18n.setLocale(languageCode);
  eventBus.emit('languageChanged', languageCode);
};
</script>
