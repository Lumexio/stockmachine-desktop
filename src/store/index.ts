import { defineStore } from 'pinia';

export type ColorScheme = 'light' | 'dark' | 'electric' | 'tokyo' | 'newspaper';

export interface MainStoreState {
  isDarkMode: ColorScheme;
  hasSeenWelcome: boolean;
}

export const useStore = defineStore({
  persist: true,
  id: 'storeIndex',
  state: (): MainStoreState => ({
    isDarkMode: 'light',
    hasSeenWelcome: false,
  }),
  actions: {
    setDarkMode(): void {
      this.isDarkMode = this.isDarkMode === 'dark' ? 'light' : 'dark';
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
  },
});

export default useStore;
