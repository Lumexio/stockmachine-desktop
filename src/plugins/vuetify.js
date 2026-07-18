import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import theme from './themes/theme'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { VFileUpload } from 'vuetify/labs/VFileUpload'
export default createVuetify({
 components,
 directives,
 icons: {
  defaultSet: 'mdi',
  aliases,
  sets: {
   mdi,
  },
 },
 components: {
  VFileUpload,
 },
 theme: {
  defaultTheme: 'light',
  themes: {
   light: theme.themes.light,
   dark: theme.themes.dark,
   electric: {
    dark: true,
    colors: {
     primary: '#00F0FF',
     secondary: '#9D00FF',
     background: '#0B001A',
     surface: '#170033',
     error: '#FF0055',
     info: '#00E8FF',
     success: '#00FF66',
     warning: '#FFE600'
    }
   },
   tokyo: {
    dark: true,
    colors: {
     primary: '#bb9af7',
     secondary: '#7aa2f7',
     background: '#1a1b26',
     surface: '#24283b',
     error: '#f7768e',
     info: '#0db9d7',
     success: '#9ece6a',
     warning: '#e0af68'
    }
   },
   newspaper: {
    dark: false,
    colors: {
     primary: '#111111',
     secondary: '#555555',
     background: '#f4ecd8',
     surface: '#fbf7eb',
     error: '#900C3F',
     info: '#2980b9',
     success: '#27ae60',
     warning: '#d35400'
    }
   }
  }
 }
})