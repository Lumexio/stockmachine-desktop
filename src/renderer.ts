import './index.css';
import { createApp } from 'vue';
import vuetify from './plugins/vuetify';
import router from './router';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createPinia } from 'pinia';
import App from './App.vue';
import ToastPlugin from 'vue-toast-notification';
import '@mdi/font/css/materialdesignicons.css';
import 'vue-toast-notification/dist/theme-sugar.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
  .use(vuetify)
  .use(ToastPlugin)
  .use(pinia)
  .use(router)
  .mount('#app');
