import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStore } from '../src/store/index';

describe('Main Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with default light scheme', () => {
    const store = useStore();
    expect(store.isDarkMode).toBe('light');
    expect(store.hasDarkMode).toBe('light');
  });

  it('should toggle dark mode state', () => {
    const store = useStore();
    store.setDarkMode();
    expect(store.isDarkMode).toBe('dark');
    expect(store.hasDarkMode).toBe('dark');

    store.setDarkMode();
    expect(store.isDarkMode).toBe('light');
  });

  it('should set custom color scheme', () => {
    const store = useStore();
    store.setColorScheme('electric');
    expect(store.isDarkMode).toBe('electric');
    expect(store.hasDarkMode).toBe('electric');

    store.setColorScheme('tokyo');
    expect(store.isDarkMode).toBe('tokyo');

    store.setColorScheme('newspaper');
    expect(store.isDarkMode).toBe('newspaper');
  });
});
