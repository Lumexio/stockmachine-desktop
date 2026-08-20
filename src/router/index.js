import { createWebHashHistory, createRouter } from 'vue-router'
import { useAuthStore } from '../store/auth';
import { useStore } from '../store';
import { useSettingsStore } from '../store/settings';

const routes = [
 {
  path: '/',
  component: () => import('../views/dashboard/DashboardView.vue')
 },
 {
  path: '/category',
  name: 'Category',
  component: () => import('../views/categories/category-main.vue')
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
  path: '/profile',
  name: 'Profile',
  component: () => import('../views/profile/ProfileView.vue')
 },
 {
  path: '/suppliers',
  name: 'Suppliers',
  component: () => import('../views/suppliers/suppliers-main.vue')
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
    const res = await fetch(`${backendUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok || res.status === 401;
  } catch {
    return false;
  }
}

router.beforeEach(async (to) => {
  if (to.meta.public) return true;

  const auth = useAuthStore();
  const store = useStore();

  // Allow unrestricted access to local views if authenticated, in offline mode, or has completed welcome
  if (auth.isAuthenticated || auth.isOfflineMode || store.hasSeenWelcome) {
    return true;
  }

  // Only redirect on first launch when backend is reachable
  const settings = useSettingsStore();
  const reachable = await isBackendReachable(settings.backendUrl);
  if (reachable && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router