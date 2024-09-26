import colors from 'vuetify/es5/util/colors'

const {
  API, PORT, INFO_TOKEN, AEC_ADMIN, ADMIN_CHAT_AVATAR, APP_URL, CHANNEL_ID, CHANNEL_SECRET, BTOB, SPOT, HIYOSHI_ADMIN, CAN_SHOW_SPOT_ORDER_STATUS, CUSTOMIZED_CSV_DOWNLOAD_NAME, TOOLTIP_B2B, TOOLTIP_SPOT, TOOLTIP_B2C, TOOLTIP_B2B2C, DUMMY_THUMB_IMAGE, PRODUCT_PRICE_M_SETTING, ADD_ACCOUNT_PERSON_IN_CHARGE_SETTING, ADD_ACCOUNT_ADMIN_SETTING, SHOW_COLUMN_ACCESS_SETTING
} = process.env;

export default {

  env: {
    API, PORT, INFO_TOKEN, AEC_ADMIN, ADMIN_CHAT_AVATAR, APP_URL, CHANNEL_ID, CHANNEL_SECRET, BTOB, SPOT, HIYOSHI_ADMIN, CAN_SHOW_SPOT_ORDER_STATUS, CUSTOMIZED_CSV_DOWNLOAD_NAME, TOOLTIP_B2B, TOOLTIP_SPOT, TOOLTIP_B2C, TOOLTIP_B2B2C, DUMMY_THUMB_IMAGE, PRODUCT_PRICE_M_SETTING, ADD_ACCOUNT_PERSON_IN_CHARGE_SETTING, ADD_ACCOUNT_ADMIN_SETTING, SHOW_COLUMN_ACCESS_SETTING
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - aecadmin',
    title: 'ADOP EC System',
    htmlAttrs: {
      lang: 'jp'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/dayjs.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  server: {
    port: PORT
  }
}
