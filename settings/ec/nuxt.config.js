
/////
require('dotenv').config();
const {
  API, DB_HOST, DB_USER, DB_PASS, DB_NAME, CONNECT,LIFF_ID , HOME, STRIPE_PUBLICK_KEY , STRIPE_SECRET_KEY, ALLOW_CHOOSE_SHIPPING_METHOD, SHOW_ARTICLE_LINK, SHOW_REMARK_ETC, SHOW_PERSON_IN_CHARGE, INFO_TOKEN, SHOW_COUPON, MAIN_API, EC_PER_PAGE
} = process.env;

export default {

    telemetry: false,

  /////
  env: {
    API, DB_HOST, DB_USER, DB_PASS, DB_NAME, CONNECT,LIFF_ID , HOME,STRIPE_PUBLICK_KEY , STRIPE_SECRET_KEY, ALLOW_CHOOSE_SHIPPING_METHOD, SHOW_ARTICLE_LINK, SHOW_REMARK_ETC, SHOW_PERSON_IN_CHARGE, INFO_TOKEN, SHOW_COUPON, MAIN_API, EC_PER_PAGE
  },
  /////
  router: {
    middleware: ['auth'],
  },
  /////
  serverMiddleware: [
    { path: "/api", handler: "~/api/index.js" },
  ],
  /////
  loading: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - LINE',
    title: '',
    htmlAttrs: {
      lang: 'ja-JP'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'language', content: 'ja-JP' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
    { src: '@/plugins/swiper', mode: 'client' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    'nuxt-stripe-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    'nuxt-stripe-module',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  stripe: {
    //apiVersion: 'v3',
    apiVersion: '2020-08-27',
    publishableKey: process.env.STRIPE_PUBLICK_KEY,
    locale : 'ja'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
    extractCSS: true,
    vendor: ['axios'],
    loadingScreen: false,
  }
}
