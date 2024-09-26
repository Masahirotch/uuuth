require('dotenv').config();

const { 
    API_URL,
    PUSH_API,
    TOKEN,
    INFO_TOKEN,
    B2B_TOKEN,
    ADMIN_ID,
    ADMIN_PASS,
    CHANNEL_SECRET,
    ACCESS_TOKEN,
    OUENTAI_TOKEN,
    INFO_TEST_MSG_TO
} = process.env;


export default {

  env: {
    API_URL,
    PUSH_API,
    TOKEN,
    INFO_TOKEN,
    B2B_TOKEN,
    ADMIN_ID,
    ADMIN_PASS,
    CHANNEL_SECRET,
    ACCESS_TOKEN,
    OUENTAI_TOKEN,
    INFO_TEST_MSG_TO
  },

  loading: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '日吉LINE業務運用管理システム',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/resource/fav.jpg' }
    ],
    script: [
      { src: 'https://static.line-scdn.net/liff/edge/2/sdk.js' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/dayjs',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    }
  }
}
