import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import theme from './themes/theme'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { VFileUpload } from 'vuetify/labs/VFileUpload'

export default createVuetify({
  components: {
    ...components,
    VFileUpload,
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'default-light',
    themes: theme.themes,
  },
  defaults: {
    VCard: {
      elevation: 0,
      border: true,
      rounded: 'xl',
    },
    VBtn: {
      variant: 'flat',
      rounded: 'pill',
    },
    VTextField: {
      variant: 'solo-filled',
      flat: true,
      rounded: 'pill',
    },
    VSelect: {
      variant: 'solo-filled',
      flat: true,
      rounded: 'pill',
    },
  },
})