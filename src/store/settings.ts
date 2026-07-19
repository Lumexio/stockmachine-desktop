import { defineStore } from 'pinia';

const BACKEND_URL = (
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'https://api.stockmachine.online/api/v1'
).replace(/\/$/, '');

export const useSettingsStore = defineStore('settings', {
  getters: {
    backendUrl: (): string => BACKEND_URL,
  },
});
