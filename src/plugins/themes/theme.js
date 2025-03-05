import colors from 'vuetify/lib/util/colors'

export default {
 defaultTheme: 'light',
 themes: {
  light: {
   dark: false,
   colors: {
    primary: colors.red.base,
    secondary: colors.grey.base,
    accent: colors.red.accent2,
    error: colors.red.accent4,
    info: colors.blue.base,
    success: colors.green.base,
    warning: colors.orange.darken1,
    background: colors.red.lighten5,
    surface: colors.shades.white,
    'primary-darken-1': colors.red.darken1,
    'primary-darken-2': colors.red.darken2,
    'primary-lighten-1': colors.red.lighten1,
    'primary-lighten-2': colors.red.lighten2,
   }
  },
  dark: {
   dark: true,
   colors: {
    primary: colors.red.lighten1,
    secondary: colors.grey.darken1,
    accent: colors.red.accent2,
    error: colors.red.accent4,
    info: colors.blue.base,
    success: colors.green.base,
    warning: colors.orange.darken1,
    background: '#1A0F0D',
    surface: '#2C1814',
    'primary-darken-1': colors.red.darken1,
    'primary-darken-2': colors.red.darken2,
    'primary-lighten-1': colors.red.lighten2,
    'primary-lighten-2': colors.red.lighten3,
   }
  }
 }
}
