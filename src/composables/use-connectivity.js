import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

const PING_INTERVAL_MS = 30_000;

// Module-level so multiple callers share one poll loop
let pingTimer = null;
const _isOnline = ref(navigator.onLine);

async function pingBackend() {
  const settings = useSettingsStore();
  try {
    const res = await fetch(`${settings.backendUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    _isOnline.value = res.ok || res.status === 401;
  } catch {
    _isOnline.value = false;
  }
}

function startPing() {
  if (pingTimer) return;
  pingBackend();
  pingTimer = setInterval(pingBackend, PING_INTERVAL_MS);
}

function stopPing() {
  clearInterval(pingTimer);
  pingTimer = null;
}

let subscribers = 0;

export function useConnectivity() {
  const auth = useAuthStore();

  const isOnline = computed(() => _isOnline.value);
  const canSync = computed(() => _isOnline.value && auth.isAuthenticated);

  const handleOnline = () => {
    _isOnline.value = true;
    pingBackend();
  };
  const handleOffline = () => { _isOnline.value = false; };

  onMounted(() => {
    subscribers++;
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    startPing();
  });

  onUnmounted(() => {
    subscribers--;
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (subscribers <= 0) {
      subscribers = 0;
      stopPing();
    }
  });

  return { isOnline, canSync };
}
