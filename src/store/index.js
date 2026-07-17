import { defineStore } from 'pinia';

export const useStore = defineStore({
  persist: true,
  id: 'storeIndex',
  state: () => ({
    isDarkMode: 'light',
    hasSeenWelcome: false,
  }),
  actions: {
    setDarkMode() {
      this.isDarkMode = this.isDarkMode === 'dark' ? 'light' : 'dark';
    },
    setHasSeenWelcome() {
      this.hasSeenWelcome = true;
    },
  },
  getters: {
    hasDarkMode() {
      return this.isDarkMode;
    },
  },
});
export default useStore;
