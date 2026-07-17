import { defineStore } from 'pinia';

const BACKEND_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://165.227.205.129:8080/api/v1'
).replace(/\/$/, '');

export const useSettingsStore = defineStore('settings', {
  getters: {
    backendUrl: () => BACKEND_URL,
  },
});
