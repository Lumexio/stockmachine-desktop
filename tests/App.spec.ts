import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ToastPlugin from 'vue-toast-notification';
import vuetify from '../src/plugins/vuetify';
import router from '../src/router';
import App from '../src/App.vue';

describe('App Root Component Smoke Test', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      }),
    );
    pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    setActivePinia(pinia);
    await router.push('/');
    await router.isReady();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the root App component without crashing', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia, vuetify, router, ToastPlugin],
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.v-application').exists() || wrapper.html().length > 0).toBe(true);
    wrapper.unmount();
  });

  it('initializes router and navigation state without errors', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [pinia, vuetify, router, ToastPlugin],
      },
    });

    await router.isReady();
    expect(router.currentRoute.value.path).toBeDefined();
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });
});

