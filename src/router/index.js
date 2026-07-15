import { createWebHashHistory, createRouter } from 'vue-router'
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

const routes = [
 {
  path: '/',
  component: () => import('../views/products/products-main.vue')
 },
 {
  path: '/category',
  name: 'Category',
  component: () => import('../views/categorys/category-main.vue')
 },
 {
  path: '/racks',
  name: 'Rack',
  component: () => import('../views/racks/rack-main.vue')
 },
 {
  path: '/products',
  name: 'Products',
  component: () => import('../views/products/products-main.vue')
 },
 {
  path: '/shelves',
  name: 'Shelve',
  component: () => import('../views/shelves/shelve-main.vue')
 },
 {
  path: '/settings',
  name: 'Settings',
  component: () => import('../views/settings/SettingsView.vue')
 },
 {
  path: '/login',
  name: 'Login',
  component: () => import('../views/auth/LoginView.vue'),
  meta: { public: true }
 },
 {
  path: '/register',
  name: 'Register',
  component: () => import('../views/auth/RegisterView.vue'),
  meta: { public: true }
 },
]

const router = createRouter({
 history: createWebHashHistory(),
 routes
})

/** Check if backend is reachable (non-blocking, 3s timeout). */
async function isBackendReachable(backendUrl) {
  try {
    const res = await fetch(`${backendUrl}/auth/me`, {
      signal: AbortSignal.timeout(3000),
    });
    // 401 = backend is up, just not authenticated
    return res.status === 401 || res.ok;
  } catch {
    return false;
  }
}

router.beforeEach(async (to) => {
  if (to.meta.public) return true;

  const auth = useAuthStore();
  const settings = useSettingsStore();

  if (auth.isAuthenticated) return true;

  // Only redirect to login when backend is actually reachable
  const reachable = await isBackendReachable(settings.backendUrl);
  if (reachable && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } };
  }

  // Offline or backend unreachable — allow access to local data
  return true;
});

export default router