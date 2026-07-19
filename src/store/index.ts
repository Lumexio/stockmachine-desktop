import { defineStore } from 'pinia';

export type ColorScheme =
  | 'default-light'
  | 'default-dark'
  | 'electron-neon-light'
  | 'electron-neon-dark'
  | 'tokyo-day'
  | 'tokyo-night'
  | 'newspaper-light'
  | 'newspaper-dark';

export const SCHEME_PAIRS: Record<ColorScheme, ColorScheme> = {
  'default-light': 'default-dark',
  'default-dark': 'default-light',
  'electron-neon-light': 'electron-neon-dark',
  'electron-neon-dark': 'electron-neon-light',
  'tokyo-day': 'tokyo-night',
  'tokyo-night': 'tokyo-day',
  'newspaper-light': 'newspaper-dark',
  'newspaper-dark': 'newspaper-light',
};

export interface MainStoreState {
  isDarkMode: ColorScheme;
  hasSeenWelcome: boolean;
}

export const useStore = defineStore({
  persist: true,
  id: 'storeIndex',
  state: (): MainStoreState => ({
    isDarkMode: 'default-light',
    hasSeenWelcome: false,
  }),
  actions: {
    setDarkMode(): void {
      this.isDarkMode = SCHEME_PAIRS[this.isDarkMode] || 'default-dark';
    },
    setColorScheme(scheme: ColorScheme): void {
      this.isDarkMode = scheme;
    },
    setHasSeenWelcome(): void {
      this.hasSeenWelcome = true;
    },
  },
  getters: {
    hasDarkMode(state): ColorScheme {
      return state.isDarkMode;
    },
    isDarkActive(state): boolean {
      return state.isDarkMode.endsWith('-dark') || state.isDarkMode === 'tokyo-night';
    },
  },
});

export default useStore;
