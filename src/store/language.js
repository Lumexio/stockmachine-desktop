import { defineStore } from 'pinia';
import { AVAILABLE_LANGUAGES } from '../constants/languages';

export const useLanguageStore = defineStore('language', {
 state: () => ({
  currentLanguage: AVAILABLE_LANGUAGES.EN.code
 }),

 actions: {
  setLanguage(code) {
   if (Object.values(AVAILABLE_LANGUAGES).some(lang => lang.code === code)) {
    this.currentLanguage = code;
   }
  }
 }
});
