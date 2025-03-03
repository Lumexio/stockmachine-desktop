import { defineStore } from 'pinia';
import en from '../locales/en';
import es from '../locales/es';
import fr from '../locales/fr';
import ru from '../locales/ru';
import ja from '../locales/ja';

export const useI18nStore = defineStore('i18n', {
 state: () => ({
  locale: localStorage.getItem('language') || 'en',
  messages: {
   en,
   es,
   fr,
   ru,
   ja
  }
 }),

 getters: {
  t: (state) => (key) => {
   const keys = key.split('.');
   return keys.reduce((obj, k) => obj?.[k], state.messages[state.locale]) || key;
  },
  currentLocale: (state) => state.locale
 },

 actions: {
  setLocale(locale) {
   if (this.messages[locale]) {
    this.locale = locale;
    localStorage.setItem('language', locale);
    // Force a reactivity update
    this.$patch({ locale });
   }
  }
 }
});
