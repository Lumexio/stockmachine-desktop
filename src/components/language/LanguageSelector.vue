<template>
 <AppDropdown :items="languageItems" icon="mdi-translate" :show-as-icon="true" @selected="handleLanguageChange" />
</template>

<script setup>
import { computed } from 'vue';
import AppDropdown from '../common/AppDropdown.vue';
import { AVAILABLE_LANGUAGES } from '../../constants/languages.js';
import { useI18nStore } from '../../store/i18n';

const i18n = useI18nStore();

const languageItems = computed(() =>
 Object.values(AVAILABLE_LANGUAGES).map(lang => ({
  text: lang.name,
  value: lang.code,
  icon: lang.icon
 }))
);

const handleLanguageChange = (language) => {
 i18n.setLocale(language.value);
};
</script>
