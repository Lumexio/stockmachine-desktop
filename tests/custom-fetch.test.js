import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiFetch, customFetch } from '../src/api/custom-fetch';

describe('Custom Fetch / apiFetch (src/api/custom-fetch.js)', () => {
  const BACKEND_URL = 'https://api.stockmachine.online/api/v1';
  let localStorageStore = {};
  let dispatchedEvents = [];

  beforeEach(() => {
    localStorageStore = {};
    dispatchedEvents = [];

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn((key) => localStorageStore[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageStore[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        localStorageStore = {};
      }),
    };
    vi.stubGlobal('localStorage', mockLocalStorage);

    // Mock window & CustomEvent
    const mockWindow = {
      dispatchEvent: vi.fn((event) => {
        dispatchedEvents.push(event);
        return true;
      }),
    };
    vi.stubGlobal('window', mockWindow);

    class MockCustomEvent {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options?.detail;
      }
    }
    vi.stubGlobal('CustomEvent', MockCustomEvent);

    // Mock fetch
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Request Execution & Header Injection', () => {
    it('should send request with default headers and correct URL concatenation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const res = await apiFetch('/products');

      expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/products`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(res).toEqual({ success: true });
    });

    it('should merge custom headers from options', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiFetch('/products', {
        headers: { 'X-Custom-Header': 'CustomValue' },
      });

      expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/products`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'CustomValue',
        },
      });
    });

    it('should inject Authorization header when accessToken is present in localStorage', async () => {
      localStorageStore['auth'] = JSON.stringify({ accessToken: 'test-token-123' });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiFetch('/profile');

      expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/profile`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-123',
        },
      });
    });

    it('should omit Authorization header when accessToken is missing', async () => {
      localStorageStore['auth'] = JSON.stringify({ accessToken: null });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiFetch('/public');

      const calledHeaders = global.fetch.mock.calls[0][1].headers;
      expect(calledHeaders.Authorization).toBeUndefined();
    });

    it('should inject X-Location-Id header when currentLocationId is present in localStorage', async () => {
      localStorageStore['auth'] = JSON.stringify({ currentLocationId: 42 });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await apiFetch('/inventory');

      const calledHeaders = global.fetch.mock.calls[0][1].headers;
      expect(calledHeaders['X-Location-Id']).toBe('42');
    });

    it('should forward custom HTTP method and body', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 10 }),
      });

      const bodyData = JSON.stringify({ name: 'New Item' });
      await apiFetch('/items', { method: 'POST', body: bodyData });

      expect(global.fetch).toHaveBeenCalledWith(`${BACKEND_URL}/items`, {
        method: 'POST',
        body: bodyData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Response Parsing & Error Handling', () => {
    it('should parse and return JSON response on success', async () => {
      const mockData = { id: 1, name: 'Sample' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const data = await apiFetch('/test');
      expect(data).toEqual(mockData);
    });

    it('should throw HTTP status error when response is not ok (non-401)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiFetch('/fail')).rejects.toThrow('HTTP 500');
    });

    it('should handle HTTP 404 error appropriately', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(apiFetch('/missing')).rejects.toThrow('HTTP 404');
    });

    it('should handle corrupted JSON in localStorage auth state gracefully', async () => {
      localStorageStore['auth'] = '{corrupted-json';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const res = await apiFetch('/corrupted-test');
      expect(res).toEqual({ success: true });
    });
  });

  describe('Token Refresh Flow (401 Handling)', () => {
    it('should attempt refresh on 401, update localStorage, and retry original request', async () => {
      localStorageStore['auth'] = JSON.stringify({
        accessToken: 'old-access-token',
        refreshToken: 'valid-refresh-token',
      });

      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        }) // First request returns 401
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { access_token: 'new-access-token-999' } }),
        }) // Refresh endpoint succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: ['product-1', 'product-2'] }),
        }); // Retried request succeeds

      const result = await apiFetch('/products');

      expect(result).toEqual({ data: ['product-1', 'product-2'] });

      // Verify refresh endpoint call
      expect(global.fetch).toHaveBeenNthCalledWith(2, `${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: 'valid-refresh-token' }),
      });

      // Verify localStorage was updated with new access token
      const updatedAuth = JSON.parse(localStorageStore['auth']);
      expect(updatedAuth.accessToken).toBe('new-access-token-999');

      // Verify retried request headers contain new token
      expect(global.fetch).toHaveBeenNthCalledWith(3, `${BACKEND_URL}/products`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer new-access-token-999',
        },
      });
    });

    it('should dispatch auth:logout event and throw Session expired when refresh fails', async () => {
      localStorageStore['auth'] = JSON.stringify({
        accessToken: 'old-token',
        refreshToken: 'invalid-refresh-token',
      });

      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        }) // First request returns 401
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        }); // Refresh fails with 401

      await expect(apiFetch('/protected')).rejects.toThrow('Session expired');

      expect(dispatchedEvents.length).toBe(1);
      expect(dispatchedEvents[0].type).toBe('auth:logout');
    });

    it('should dispatch auth:logout event when refresh network request throws', async () => {
      localStorageStore['auth'] = JSON.stringify({
        accessToken: 'old-token',
        refreshToken: 'token',
      });

      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        }) // Initial fetch returns 401
        .mockRejectedValueOnce(new Error('Network error during refresh'));

      await expect(apiFetch('/protected')).rejects.toThrow('Session expired');

      expect(dispatchedEvents.length).toBe(1);
      expect(dispatchedEvents[0].type).toBe('auth:logout');
    });

    it('should dispatch auth:logout and throw Session expired if retried request after refresh fails', async () => {
      localStorageStore['auth'] = JSON.stringify({
        accessToken: 'old-token',
        refreshToken: 'valid-refresh',
      });

      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        }) // Initial 401
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { access_token: 'new-token' } }),
        }) // Refresh succeeds
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        }); // Retried request returns 500

      await expect(apiFetch('/protected')).rejects.toThrow('Session expired');
      expect(dispatchedEvents.length).toBe(1);
      expect(dispatchedEvents[0].type).toBe('auth:logout');
    });
  });

  describe('Concurrent Request Refresh Queue', () => {
    it('should queue concurrent 401 requests and resolve all with new token when refresh completes', async () => {
      localStorageStore['auth'] = JSON.stringify({
        accessToken: 'expired-token',
        refreshToken: 'good-refresh-token',
      });

      let fetchCallCount = 0;
      global.fetch = vi.fn(async (url) => {
        fetchCallCount++;

        if (url.endsWith('/auth/refresh')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: { access_token: 'queued-new-token' } }),
          };
        }

        if (url.endsWith('/endpoint1')) {
          if (fetchCallCount === 1) {
            return { ok: false, status: 401 };
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: 'res1' }),
          };
        }

        if (url.endsWith('/endpoint2')) {
          if (fetchCallCount === 2) {
            return { ok: false, status: 401 };
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({ data: 'res2' }),
          };
        }

        return { ok: false, status: 404 };
      });

      const [p1, p2] = await Promise.all([apiFetch('/endpoint1'), apiFetch('/endpoint2')]);

      expect(p1).toEqual({ data: 'res1' });
      expect(p2).toEqual({ data: 'res2' });

      const refreshCalls = global.fetch.mock.calls.filter((call) =>
        call[0].endsWith('/auth/refresh')
      );
      expect(refreshCalls.length).toBe(1);
    });

    it('should reject all queued concurrent requests if token refresh fails', async () => {
      localStorageStore['auth'] = JSON.stringify({
        accessToken: 'expired-token',
        refreshToken: 'bad-refresh-token',
      });

      global.fetch = vi.fn(async (url) => {
        if (url.endsWith('/auth/refresh')) {
          return { ok: false, status: 401 };
        }
        return { ok: false, status: 401 };
      });

      const req1 = apiFetch('/endpoint1');
      const req2 = apiFetch('/endpoint2');

      await expect(Promise.all([req1, req2])).rejects.toThrow('Session expired');
    });
  });

  describe('Export Alias Parity', () => {
    it('should export customFetch as alias of apiFetch', () => {
      expect(customFetch).toBe(apiFetch);
    });
  });
});
