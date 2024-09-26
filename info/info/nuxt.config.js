require('dotenv').config();
const { APP_TITLE,LIFF_ID,API_URL,API_TOKEN,SALE_LIFF_ID, SPOT_PER_PAGE, DUMMY_THUMB_IMAGE } = process.env;

export default {

  env: { APP_TITLE,LIFF_ID,API_URL,API_TOKEN,SALE_LIFF_ID, SPOT_PER_PAGE, DUMMY_THUMB_IMAGE },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '丸長サービス',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'X-UA-Compatible', content: 'IE=edge' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'keyword', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/resource/favicon.ico' },
      { rel: 'stylesheet', href: '/resource/reset.css' },
      { rel: 'stylesheet', href: '/resource/style.css' },
    ],
    script: [
      { src: 'https://static.line-scdn.net/liff/edge/2/sdk.js' },
    ],

  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'element-ui/lib/theme-chalk/index.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/dayjs',
    { src: '@/plugins/VueAwesomeSwiper.js', mode: 'client' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
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
    loadingScreen: false,
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    }
  }


}
