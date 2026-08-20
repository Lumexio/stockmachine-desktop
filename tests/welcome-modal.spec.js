import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import vuetify from '../src/plugins/vuetify';
import WelcomeModal from '../src/components/welcome-modal.vue';

// Mock the i18n store
vi.mock('../src/store/i18n', () => ({
  useI18nStore: vi.fn(() => ({
    t: (key) => key // Just return the key for testing
  }))
}));

describe('welcome-modal.vue Molecular Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock window.api for the openRegister test
    window.api = { send: vi.fn() };
  });

  it('renders correctly when show is true', () => {
    const wrapper = mount(WelcomeModal, {
      global: { plugins: [vuetify], stubs: { VDialog: { template: '<div><slot/></div>' } } },
      props: { show: true }
    });
    
    expect(wrapper.exists()).toBe(true);
    // The dialog content should be rendered, looking for translation keys
    expect(wrapper.html()).toContain('welcome.title');
    expect(wrapper.html()).toContain('welcome.subtitle');
  });

  it('emits login event when login button is clicked', async () => {
    const wrapper = mount(WelcomeModal, {
      global: { plugins: [vuetify], stubs: { VDialog: { template: '<div><slot/></div>' } } },
      props: { show: true }
    });
    
    // Find login button and click it
    const buttons = wrapper.findAll('.v-btn');
    const loginBtn = buttons.find(b => b.text().includes('welcome.loginBtn'));
    await loginBtn.trigger('click');
    
    expect(wrapper.emitted()).toHaveProperty('login');
  });

  it('emits offline event when offline button is clicked', async () => {
    const wrapper = mount(WelcomeModal, {
      global: { plugins: [vuetify], stubs: { VDialog: { template: '<div><slot/></div>' } } },
      props: { show: true }
    });
    
    const buttons = wrapper.findAll('.v-btn');
    const offlineBtn = buttons.find(b => b.text().includes('welcome.offlineBtn'));
    await offlineBtn.trigger('click');
    
    expect(wrapper.emitted()).toHaveProperty('offline');
  });

  it('sends toMain event when register button is clicked', async () => {
    const wrapper = mount(WelcomeModal, {
      global: { plugins: [vuetify], stubs: { VDialog: { template: '<div><slot/></div>' } } },
      props: { show: true }
    });
    
    const buttons = wrapper.findAll('.v-btn');
    const registerBtn = buttons.find(b => b.text().includes('welcome.registerBtn'));
    await registerBtn.trigger('click');
    
    expect(window.api.send).toHaveBeenCalledWith('toMain', {
      type: 'openExternal',
      url: 'https://app.stockmachine.online/register',
    });
  });
});
