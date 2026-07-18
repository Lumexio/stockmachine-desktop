import { defineStore } from 'pinia';
import en from '../locales/en';
import es from '../locales/es';
import fr from '../locales/fr';
import ru from '../locales/ru';
import ja from '../locales/ja';

type LocaleCode = 'en' | 'es' | 'fr' | 'ru' | 'ja';

type Messages = Record<string, any>;

const messages: Record<LocaleCode, Messages> = { en, es, fr, ru, ja };

function getNestedValue(obj: unknown, keys: string[]): string | undefined {
  let current: unknown = obj;
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[k];
  }
  return typeof current === 'string' ? current : undefined;
}

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale:
      (localStorage.getItem('language') as LocaleCode) || ('en' as LocaleCode),
  }),
  getters: {
    currentLocale: (state): string => state.locale,
    t:
      (state) =>
      (key: string): string => {
        const keys = key.split('.');
        return getNestedValue(messages[state.locale], keys) ?? key;
      },
  },
  actions: {
    setLocale(code: string): void {
      if (code in messages) {
        this.locale = code as LocaleCode;
        localStorage.setItem('language', code);
        this.$patch({ locale: code as LocaleCode });
      }
    },
  },
});
