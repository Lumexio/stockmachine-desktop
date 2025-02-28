<template>
  <v-app-bar app>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>
      STOCKMACHINE
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-switch :prepend-icon="iconTheme" class="mr-3" @click="setDark" v-model="darkMode" hide-details inset></v-switch>
    <v-btn icon>
      <v-icon>mdi-content-save</v-icon>

      <v-menu offset-y activator="parent">

        <v-list>
          <v-list-item>

            <v-list-item-title>
              <v-list-item-action>
                <v-icon>
                  mdi-file-export
                </v-icon>
              </v-list-item-action>
              Export stock</v-list-item-title>
            <v-menu :open-on-focus="false" activator="parent" open-on-hover submenu>
              <v-list>
                <v-list-item @Click="handleExport('json')">
                  <v-list-item-title>
                    <v-list-item-action>
                      <v-icon>
                        mdi-code-json
                      </v-icon>
                    </v-list-item-action>
                    Json</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleExport('xlsx')">
                  <v-list-item-title>
                    <v-list-item-action>
                      <v-icon>
                        mdi-file-excel
                      </v-icon>
                    </v-list-item-action>
                    Excel</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleExport('csv')">
                  <v-list-item-title>
                    <v-list-item-action>
                      <v-icon>
                        mdi-file-delimited
                      </v-icon>
                    </v-list-item-action>
                    CSV</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item>




          <v-list-item>
            <v-list-item-title>
              <v-list-item-action>
                <v-icon>
                  mdi-file-import
                </v-icon>
              </v-list-item-action>
              Import stock</v-list-item-title>
            <v-menu :open-on-focus="false" activator="parent" open-on-hover submenu>
              <v-list>
                <v-list-item @click="handleImport('json')">
                  <v-list-item-title>
                    <v-list-item-action>
                      <v-icon>
                        mdi-code-json
                      </v-icon>
                    </v-list-item-action>
                    Json</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleImport('xlsx')">
                  <v-list-item-title>
                    <v-list-item-action>
                      <v-icon>
                        mdi-file-excel
                      </v-icon>
                    </v-list-item-action>
                    Excel</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleImport('csv')">
                  <v-list-item-title>
                    <v-list-item-action>
                      <v-icon>
                        mdi-file-delimited
                      </v-icon>
                    </v-list-item-action>
                    CSV</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item>
          <v-menu :open-on-focus="false" activator="parent-import" open-on-hover submenu>
            <v-list>
              <v-list-item @click="handleImport('json')">
                <v-list-item-title>
                  <v-list-item-action>
                    <v-icon>
                      mdi-code-json
                    </v-icon>
                  </v-list-item-action>
                  Json</v-list-item-title>
              </v-list-item>

              <v-list-item @click="handleImport('xlsx')">
                <v-list-item-title>
                  <v-list-item-action>
                    <v-icon>
                      mdi-file-excel
                    </v-icon>
                  </v-list-item-action>
                  Excel</v-list-item-title>
              </v-list-item>

              <v-list-item @click="handleImport('csv')">
                <v-list-item-title>
                  <v-list-item-action>
                    <v-icon>
                      mdi-file-delimited
                    </v-icon>
                  </v-list-item-action>
                  CSV</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list>
      </v-menu>
    </v-btn>
  </v-app-bar>
  <v-navigation-drawer app v-model="drawer">
    <v-list>
      <v-list-item :append-icon="item.icon" v-for="item in items" :key="item.title" :to="item.to">
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>


</template>

<script setup>
import { ref, defineProps, onMounted, computed } from 'vue'
import { useStore } from '../../store'
import { useGenericFetchQueries } from "../../api/generic-fetch-querys"
const store = useStore();
const props = defineProps({
  items: Array,
});

const { exportDataToFile, importDataFromFile } = useGenericFetchQueries();
let drawer = ref(false);

let iconTheme = computed(() => (darkMode.value ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny'));
const darkMode = computed({
  get() {
    return store.hasDarkMode === 'dark';
  },
  set(value) {
    store.setDarkMode(value ? 'dark' : 'light');
  }
});

onMounted(() => {
  hasDarkMode();
});

function setDark() {
  store.setDarkMode(darkMode.value ? 'light' : 'dark');
}

function hasDarkMode() {
  return store.hasDarkMode === 'dark';
}

function handleExport(param) {
  console.log(param);
  exportDataToFile(param);
}

function handleImport(param) {
  importDataFromFile(param);
}


</script>