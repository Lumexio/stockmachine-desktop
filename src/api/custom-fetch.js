/**
 * apiFetch — authenticated HTTP client for the stockmachine backend.
 *
 * Reads tokens directly from localStorage (where pinia-plugin-persistedstate
 * stores them) to avoid circular imports with the auth store.
 * On 401: attempts one token refresh, retries the request, then dispatches
 * a global 'auth:logout' event so App.vue can redirect to login.
 */

const getAuthState = () => {
  try {
    return JSON.parse(localStorage.getItem('auth') || '{}');
  } catch {
    return {};
  }
};

const saveAccessToken = (token) => {
  try {
    const state = getAuthState();
    state.accessToken = token;
    localStorage.setItem('auth', JSON.stringify(state));
  } catch {
    /* ignore */
  }
};

let isRefreshing = false;
let refreshQueue = [];

const onRefreshed = (newToken) => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

const BACKEND_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://api.stockmachine.online/api/v1'
).replace(/\/$/, '');

export const apiFetch = async (path, options = {}) => {
  const base = BACKEND_URL;
  const { accessToken } = getAuthState();

  const buildHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const doFetch = (token) =>
    fetch(`${base}${path}`, { ...options, headers: buildHeaders(token) });

  let response = await doFetch(accessToken);

  if (response.status !== 401) {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  // ── 401 handling ────────────────────────────────────────────────────────────
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push(async (newToken) => {
        try {
          const retried = await doFetch(newToken);
          if (!retried.ok) return reject(new Error(`HTTP ${retried.status}`));
          resolve(retried.json());
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  isRefreshing = true;
  const { refreshToken } = getAuthState();

  try {
    const refreshRes = await fetch(`${base}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshRes.ok) throw new Error('Refresh failed');

    const { data } = await refreshRes.json();
    const newToken = data.access_token;
    saveAccessToken(newToken);
    onRefreshed(newToken);

    response = await doFetch(newToken);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } catch {
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw new Error('Session expired');
  } finally {
    isRefreshing = false;
  }
};

// Legacy alias — keeps any existing imports working
export const customFetch = apiFetch;
