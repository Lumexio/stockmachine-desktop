/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { createApp } from 'vue';
import vuetify from './plugins/vuetify';  // This is the correct import with our theme
import router from './router';
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia } from 'pinia'
import App from './App.vue';
import ToastPlugin from 'vue-toast-notification';
import '@mdi/font/css/materialdesignicons.css';
import 'vue-toast-notification/dist/theme-sugar.css';


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate);


createApp(App)
 .use(vuetify)        // Use only this one

 .use(ToastPlugin)
 .use(pinia)
 .use(router)
 .mount('#app');