require('dotenv').config();

const {
    CDN_PATH , CDN_URL , API , MEDIA , DB_HOST , DB_USER , DB_PASS , DB_NAME , CONNECT , LIFF_ID , LIFF_URL , END_POINT
} = process.env;

export default {

    env: {
        CDN_PATH , CDN_URL , API , MEDIA , DB_HOST , DB_USER , DB_PASS , DB_NAME , CONNECT , LIFF_ID , LIFF_URL , END_POINT
    },

    telemetry: false,

    loading: false,

    serverMiddleware: [
        { path: '/API', handler: '~/API/index.js' },
    ],

    router: {
        middleware: 'auth',
    },

    head: {
        title: '%s – ベジメディア',
        htmlAttrs: {
            lang: 'ja-JP'
        },
      meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover' },
          { hid: 'description', name: 'description', content: 'LINEアカウント向けに野菜情報を発信する「ベジメディア」からの配信内容です。' },
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

    css: [
      'element-ui/lib/theme-chalk/index.css'
    ],

    plugins: [
        '@/plugins/element-ui',
        '@/plugins/dayjs',
        { src: '@/plugins/swiper', mode: 'client' },
    ],

    components: true,

    buildModules: [
        '@nuxtjs/axios',
        '@nuxtjs/dotenv',
    ],

    modules: [
        '@nuxtjs/axios',
        '@nuxtjs/dotenv',
    ],

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {},

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: [/^element-ui/],
        extractCSS: true,
        vendor: ['axios'],
        loadingScreen: false,
    }
  }
