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

export interface Location {
  id: number;
  name: string;
  org_id: number;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isOfflineMode: boolean;
  pendingInviteCode: string | null;
  currentLocationId: number | null;
  locations: Location[];
}

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isOfflineMode: true,
    pendingInviteCode: null,
    currentLocationId: null,
    locations: [],
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken && !!state.user,
  },
  actions: {
    setOfflineMode(status: boolean): void {
      this.isOfflineMode = status;
    },
    
    setPendingInviteCode(code: string | null): void {
      this.pendingInviteCode = code;
    },

    setCurrentLocationId(id: number | null): void {
      this.currentLocationId = id;
    },

    async fetchLocations(): Promise<void> {
      if (!this.accessToken || !this.user?.org_id) return;
      const { backendUrl } = useSettingsStore();
      try {
        const res = await fetch(`${backendUrl}/organizations/${this.user.org_id}/locations`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        if (res.ok) {
          const json = await res.json();
          this.locations = json.data || [];
          if (this.locations.length > 0 && !this.currentLocationId) {
            this.currentLocationId = this.locations[0].id;
          }
        }
      } catch (e) {
        console.error('Failed to fetch locations', e);
      }
    },

    async fetchUser(): Promise<void> {
      if (!this.accessToken) return;
      const { backendUrl } = useSettingsStore();
      try {
        const res = await fetch(`${backendUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            this.user = json.data;
            await this.fetchLocations();
          }
        }
      } catch (e) {
        console.error('Failed to fetch current user', e);
      }
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
      await this.fetchUser();
      await this.processPendingInvite();
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
      await this.fetchUser();
      await this.processPendingInvite();
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
      this.pendingInviteCode = null;
    },

    async processPendingInvite(): Promise<void> {
      if (!this.pendingInviteCode || !this.accessToken) return;
      const { backendUrl } = useSettingsStore();
      try {
        const res = await fetch(`${backendUrl}/invitations/accept`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`
          },
          body: JSON.stringify({ code: this.pendingInviteCode }),
        });
        if (res.ok) {
          this.pendingInviteCode = null;
          await this.fetchUser();
        } else {
          console.error('Failed to accept pending invite');
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
});
