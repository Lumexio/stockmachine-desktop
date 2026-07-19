import { defineStore } from 'pinia';
import { useSettingsStore } from './settings';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  account_type?: 'individual' | 'team';
  photo_url?: string | null;
  org_id: number | null;
  organization?: {
    id: number;
    name: string;
    plan_id: 'free' | 'pro' | 'max';
    account_type: 'individual' | 'team';
  } | null;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isOfflineMode: boolean;
}

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isOfflineMode: true,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken && !!state.user,
  },
  actions: {
    setOfflineMode(status: boolean): void {
      this.isOfflineMode = status;
    },

    async login(email: string, password: string): Promise<void> {
      const { backendUrl } = useSettingsStore();
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const { data } = (await res.json()) as {
        data: { access_token: string; refresh_token: string; user: User };
      };
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
      this.isOfflineMode = false;
    },

    async register(dto: {
      name: string;
      email: string;
      password: string;
      org_name?: string;
    }): Promise<void> {
      const { backendUrl } = useSettingsStore();
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const { data } = (await res.json()) as {
        data: { access_token: string; refresh_token: string; user: User };
      };
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.user;
      this.isOfflineMode = false;
    },

    async refreshTokens(): Promise<void> {
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
      const { data } = (await res.json()) as {
        data: { access_token: string };
      };
      this.accessToken = data.access_token;
    },

    logout(): void {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      this.isOfflineMode = true;
    },
  },
});
