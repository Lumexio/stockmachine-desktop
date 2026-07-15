import { defineStore } from 'pinia';
import { useSettingsStore } from './settings';

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: () => ({
    accessToken: null,
    refreshToken: null,
    user: null, // { id, name, email, role, org_id }
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
  },
  actions: {
    async login(email, password) {
      const { backendUrl } = useSettingsStore();
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const { data } = await res.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
    },

    async register(dto) {
      const { backendUrl } = useSettingsStore();
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const { data } = await res.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
    },

    async refreshTokens() {
      const { backendUrl } = useSettingsStore();
      const res = await fetch(`${backendUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (!res.ok) {
        this.logout();
        throw new Error('Refresh failed');
      }
      const { data } = await res.json();
      this.accessToken = data.access_token;
    },

    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
    },
  },
});
