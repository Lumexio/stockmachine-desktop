import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStore } from '../src/store/index';

describe('Main Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default light scheme', () => {
    const store = useStore();
    expect(store.isDarkMode).toBe('default-light');
    expect(store.hasDarkMode).toBe('default-light');
  });

  it('should toggle dark mode state', () => {
    const store = useStore();
    store.setDarkMode();
    expect(store.isDarkMode).toBe('default-dark');
    expect(store.hasDarkMode).toBe('default-dark');

    store.setDarkMode();
    expect(store.isDarkMode).toBe('default-light');
  });

  it('should set custom color scheme', () => {
    const store = useStore();
    store.setColorScheme('electron-neon-dark');
    expect(store.isDarkMode).toBe('electron-neon-dark');
    expect(store.hasDarkMode).toBe('electron-neon-dark');

    store.setColorScheme('tokyo-night');
    expect(store.isDarkMode).toBe('tokyo-night');

    store.setColorScheme('newspaper-dark');
    expect(store.isDarkMode).toBe('newspaper-dark');
  });
});
