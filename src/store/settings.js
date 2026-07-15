import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  persist: true,
  state: () => ({
    backendUrl: 'http://localhost:3000/api/v1',
  }),
  actions: {
    setBackendUrl(url) {
      this.backendUrl = url.replace(/\/$/, '');
    },
  },
});
