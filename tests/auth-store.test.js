import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../src/store/auth';

describe('Auth Store (useAuthStore)', () => {
  const BACKEND_URL = 'https://api.stockmachine.online/api/v1';

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State & Getters', () => {
    it('should initialize with correct default state', () => {
      const authStore = useAuthStore();
      expect(authStore.accessToken).toBeNull();
      expect(authStore.refreshToken).toBeNull();
      expect(authStore.user).toBeNull();
      expect(authStore.isOfflineMode).toBe(true);
      expect(authStore.pendingInviteCode).toBeNull();
      expect(authStore.currentLocationId).toBeNull();
      expect(authStore.locations).toEqual([]);
    });

    it('should return correct isAuthenticated status', () => {
      const authStore = useAuthStore();
      expect(authStore.isAuthenticated).toBe(false);

      authStore.accessToken = 'test-token';
      expect(authStore.isAuthenticated).toBe(false); // user is still null

      authStore.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        org_id: 10,
      };
      expect(authStore.isAuthenticated).toBe(true);

      authStore.accessToken = null;
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('Offline & Local Location Management', () => {
    it('should update offline mode status', () => {
      const authStore = useAuthStore();
      expect(authStore.isOfflineMode).toBe(true);

      authStore.setOfflineMode(false);
      expect(authStore.isOfflineMode).toBe(false);

      authStore.setOfflineMode(true);
      expect(authStore.isOfflineMode).toBe(true);
    });

    it('should set pending invite code', () => {
      const authStore = useAuthStore();
      authStore.setPendingInviteCode('INV-999');
      expect(authStore.pendingInviteCode).toBe('INV-999');

      authStore.setPendingInviteCode(null);
      expect(authStore.pendingInviteCode).toBeNull();
    });

    it('should set current location id', () => {
      const authStore = useAuthStore();
      authStore.setCurrentLocationId(42);
      expect(authStore.currentLocationId).toBe(42);

      authStore.setCurrentLocationId(null);
      expect(authStore.currentLocationId).toBeNull();
    });

    it('should add local location with negative ID and set as current', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        org_id: 5,
      };

      authStore.addLocalLocation('Main Store');
      expect(authStore.locations.length).toBe(1);
      const addedLoc = authStore.locations[0];
      expect(addedLoc.name).toBe('Main Store');
      expect(addedLoc.org_id).toBe(5);
      expect(addedLoc.id).toBeLessThan(0);
      expect(authStore.currentLocationId).toBe(addedLoc.id);
    });

    it('should default org_id to 0 when user is null during addLocalLocation', () => {
      const authStore = useAuthStore();
      authStore.addLocalLocation('Offline Branch');
      expect(authStore.locations.length).toBe(1);
      expect(authStore.locations[0].org_id).toBe(0);
      expect(authStore.locations[0].id).toBeLessThan(0);
    });
  });

  describe('Login & Register Flows', () => {
    it('should perform login successfully, update auth state and fetch user/locations', async () => {
      const authStore = useAuthStore();
      const mockLoginResponse = {
        data: {
          access_token: 'access-123',
          refresh_token: 'refresh-123',
          user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', org_id: 7 },
        },
      };
      const mockMeResponse = {
        data: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', org_id: 7 },
      };
      const mockLocationsResponse = {
        data: [
          { id: 101, name: 'Location A', org_id: 7 },
          { id: 102, name: 'Location B', org_id: 7 },
        ],
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLoginResponse,
        }) // POST /auth/login
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMeResponse,
        }) // GET /auth/me (fetchUser)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLocationsResponse,
        }); // GET /organizations/7/locations (fetchLocations)

      await authStore.login('john@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'john@example.com', password: 'password123' }),
      });

      expect(authStore.accessToken).toBe('access-123');
      expect(authStore.refreshToken).toBe('refresh-123');
      expect(authStore.user).toEqual(mockMeResponse.data);
      expect(authStore.isOfflineMode).toBe(false);
      expect(authStore.locations).toEqual(mockLocationsResponse.data);
      expect(authStore.currentLocationId).toBe(101);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should throw an error on login failure', async () => {
      const authStore = useAuthStore();
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(authStore.login('wrong@example.com', 'badpass')).rejects.toThrow('Invalid credentials');
      expect(authStore.accessToken).toBeNull();
      expect(authStore.user).toBeNull();
    });

    it('should fall back to HTTP status error message if login response JSON lacks message', async () => {
      const authStore = useAuthStore();
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(authStore.login('user@example.com', 'pass')).rejects.toThrow('HTTP 500');
    });

    it('should perform register successfully', async () => {
      const authStore = useAuthStore();
      const registerDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'secretpassword',
        org_name: 'Jane Corp',
      };
      const mockRegisterResponse = {
        data: {
          access_token: 'access-reg-456',
          refresh_token: 'refresh-reg-456',
          user: { id: 2, name: 'Jane Doe', email: 'jane@example.com', role: 'admin', org_id: 8 },
        },
      };
      const mockMeResponse = {
        data: { id: 2, name: 'Jane Doe', email: 'jane@example.com', role: 'admin', org_id: 8 },
      };
      const mockLocationsResponse = {
        data: [{ id: 201, name: 'Main HQ', org_id: 8 }],
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegisterResponse,
        }) // POST /auth/register
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMeResponse,
        }) // GET /auth/me
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockLocationsResponse,
        }); // GET /organizations/8/locations

      await authStore.register(registerDto);

      expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerDto),
      });

      expect(authStore.accessToken).toBe('access-reg-456');
      expect(authStore.refreshToken).toBe('refresh-reg-456');
      expect(authStore.user).toEqual(mockMeResponse.data);
      expect(authStore.isOfflineMode).toBe(false);
      expect(authStore.locations).toEqual(mockLocationsResponse.data);
      expect(authStore.currentLocationId).toBe(201);
    });

    it('should throw an error on register failure', async () => {
      const authStore = useAuthStore();
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Email already registered' }),
      });

      await expect(
        authStore.register({ name: 'Jane', email: 'jane@example.com', password: 'pass' })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('User & Location Fetching', () => {
    it('should do nothing in fetchUser if accessToken is null', async () => {
      const authStore = useAuthStore();
      await authStore.fetchUser();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch user and call fetchLocations when accessToken is present', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'valid-token';

      const mockMe = { id: 3, name: 'Alice', email: 'alice@example.com', role: 'user', org_id: 12 };
      const mockLocs = [{ id: 301, name: 'Loc 301', org_id: 12 }];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockMe }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockLocs }),
        });

      await authStore.fetchUser();

      expect(global.fetch).toHaveBeenNthCalledWith(1, `${BACKEND_URL}/auth/me`, {
        headers: { Authorization: 'Bearer valid-token' },
      });
      expect(global.fetch).toHaveBeenNthCalledWith(2, `${BACKEND_URL}/organizations/12/locations`, {
        headers: { Authorization: 'Bearer valid-token' },
      });

      expect(authStore.user).toEqual(mockMe);
      expect(authStore.locations).toEqual(mockLocs);
      expect(authStore.currentLocationId).toBe(301);
    });

    it('should not override existing currentLocationId during fetchLocations', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'valid-token';
      authStore.user = { id: 3, name: 'Alice', email: 'a@a.com', role: 'user', org_id: 12 };
      authStore.currentLocationId = 999;

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 301, name: 'Loc 301', org_id: 12 }] }),
      });

      await authStore.fetchLocations();

      expect(authStore.locations.length).toBe(1);
      expect(authStore.currentLocationId).toBe(999);
    });

    it('should do nothing in fetchLocations if accessToken or user org_id is missing', async () => {
      const authStore = useAuthStore();
      await authStore.fetchLocations();
      expect(global.fetch).not.toHaveBeenCalled();

      authStore.accessToken = 'token';
      await authStore.fetchLocations();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Token Refresh & Logout', () => {
    it('should refresh tokens successfully', async () => {
      const authStore = useAuthStore();
      authStore.refreshToken = 'old-refresh-token';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { access_token: 'new-access-token' } }),
      });

      await authStore.refreshTokens();

      expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: 'old-refresh-token' }),
      });

      expect(authStore.accessToken).toBe('new-access-token');
    });

    it('should call logout and throw error on failed refreshTokens', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'old-access';
      authStore.refreshToken = 'bad-refresh';
      authStore.user = { id: 1, name: 'Bob', email: 'b@b.com', role: 'user', org_id: 1 };
      authStore.isOfflineMode = false;

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(authStore.refreshTokens()).rejects.toThrow('Refresh failed');

      expect(authStore.accessToken).toBeNull();
      expect(authStore.refreshToken).toBeNull();
      expect(authStore.user).toBeNull();
      expect(authStore.isOfflineMode).toBe(true);
    });

    it('should reset all auth state on logout', () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'acc';
      authStore.refreshToken = 'ref';
      authStore.user = { id: 1, name: 'Test', email: 't@t.com', role: 'user', org_id: 1 };
      authStore.isOfflineMode = false;
      authStore.pendingInviteCode = 'INV-123';

      authStore.logout();

      expect(authStore.accessToken).toBeNull();
      expect(authStore.refreshToken).toBeNull();
      expect(authStore.user).toBeNull();
      expect(authStore.isOfflineMode).toBe(true);
      expect(authStore.pendingInviteCode).toBeNull();
    });
  });

  describe('Pending Invitation Processing', () => {
    it('should do nothing in processPendingInvite if code or token is missing', async () => {
      const authStore = useAuthStore();
      await authStore.processPendingInvite();
      expect(global.fetch).not.toHaveBeenCalled();

      authStore.pendingInviteCode = 'INV-100';
      await authStore.processPendingInvite();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should process pending invite successfully and refresh user data', async () => {
      const authStore = useAuthStore();
      authStore.accessToken = 'valid-token';
      authStore.pendingInviteCode = 'INV-100';
      authStore.user = { id: 5, name: 'Invited User', email: 'iu@example.com', role: 'user', org_id: 20 };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
        }) // POST /invitations/accept
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 5, name: 'Invited User Updated', email: 'iu@example.com', role: 'member', org_id: 20 },
          }),
        }) // GET /auth/me
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        }); // GET /organizations/20/locations

      await authStore.processPendingInvite();

      expect(global.fetch).toHaveBeenNthCalledWith(1, `${BACKEND_URL}/invitations/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid-token',
        },
        body: JSON.stringify({ code: 'INV-100' }),
      });

      expect(authStore.pendingInviteCode).toBeNull();
      expect(authStore.user.role).toBe('member');
    });
  });
});
