require('dotenv').config();

const {
    APP_NAME, API, DB_HOST, DB_USER, DB_PASS, DB_NAME, CONNECT , LIFF_ID , LOGIN_CHANNEL_ID , MSG_ACCESS_TOKEN , MSG_CHANNEL_SECRET, 
    SHOW_PRODUCT_AREA,
    SHOW_PRODUCT_UNIT_PRICE,
    SHOW_ADD_SUB_TEN_QUANTITY,
    SHOW_ORDER_TOTAL_AMOUNT,
    SHOW_CART_TOTAL_AMOUNT,
    LINE_ID_CUSTOMER,
    MAIN_API,
    B2B_PER_PAGE,
} = process.env;


export default {

    telemetry: false,

    env: {
        APP_NAME, API, DB_HOST, DB_USER, DB_PASS, DB_NAME, CONNECT , LIFF_ID , LOGIN_CHANNEL_ID , MSG_ACCESS_TOKEN , MSG_CHANNEL_SECRET, 
        SHOW_PRODUCT_AREA,
        SHOW_PRODUCT_UNIT_PRICE,
        SHOW_ADD_SUB_TEN_QUANTITY,
        SHOW_ORDER_TOTAL_AMOUNT,
        SHOW_CART_TOTAL_AMOUNT,
        LINE_ID_CUSTOMER,
        MAIN_API,
        B2B_PER_PAGE,
    },

    serverMiddleware: [
        { path: "/api", handler: "~/api/index.js" },
    ],

    loading: false,

    head: {
        title: '日吉 LINE受発注システム',
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
            { rel: 'icon', type: 'image/x-icon', href: '/resource/favicon.ico' }
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
        '@/plugins/axios',
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
        '@nuxtjs/axios',
        '@nuxtjs/dotenv',
    ],

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {
      // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
      baseURL: '/',
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: [/^element-ui/],
        extractCSS: true,
        vendor: ['axios'],
        loadingScreen: false,
    }
}
