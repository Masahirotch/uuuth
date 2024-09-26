require('dotenv').config();

import express from 'express';

const {
    APP_URL,API_URL,PUSH_API,TOKEN,INFO_TOKEN,B2B_TOKEN,B2C_TOKEN,
    ADMIN_ID,ADMIN_PASS,HIYOSHI_DASHBOARD,HIYOSHI_ADMIN,
    CHANNEL_ID,CHANNEL_SECRET,ACCESS_TOKEN,ADMIN_TOKEN,INFO_TEST_MSG_TO,
    DB_API ,INFO_API,B2B_API,B2C_API,UPLOADER,CSV,DB_HOST ,DB_USER ,DB_PASS ,DB_B2B  ,DB_B2C  ,DB_INFO ,DB_MEDIA ,DB_CDN,CONNECT,
    SMTP_HOST , SMTP_USER ,SMTP_PASS ,SMTP_PORT,
    CDN_PATH , CDN_URL , VEGEMEDIA, SHOW_ARTICLE_LINK, SHOW_REMARK_ETC
} = process.env;


export default {

    telemetry: false,

    env: {
        APP_URL,API_URL,PUSH_API,TOKEN,INFO_TOKEN,B2B_TOKEN,B2C_TOKEN,
        ADMIN_ID,ADMIN_PASS,HIYOSHI_DASHBOARD,HIYOSHI_ADMIN,
        CHANNEL_ID,CHANNEL_SECRET,ACCESS_TOKEN,ADMIN_TOKEN,INFO_TEST_MSG_TO,
        DB_API ,INFO_API,B2B_API,B2C_API,UPLOADER,CSV,DB_HOST ,DB_USER ,DB_PASS ,DB_B2B  ,DB_B2C  ,DB_INFO ,DB_MEDIA,DB_CDN,CONNECT ,
        SMTP_HOST , SMTP_USER ,SMTP_PASS ,SMTP_PORT,
        CDN_PATH , CDN_URL , VEGEMEDIA, SHOW_ARTICLE_LINK, SHOW_REMARK_ETC
    },

    loading: false,

    router: {
        middleware: 'auth',
    },

    // Express
    serverMiddleware: [
        { path: '/API', handler: '~/API/index.js' },
        { path: '/API/info'   , handler: '~/API/info.js' },
        { path: '/API/b2c'    , handler: '~/API/b2c.js' },
        { path: '/API/b2b'    , handler: '~/API/b2b.js' },
        { path: '/API/upload' , handler: '~/API/upload.js' },
        { path: '/API/csv'  , handler: '~/API/csv.js' },
        { path: '/API/vegemedia'  , handler: '~/API/vegemedia.js' },
    ],

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
        extend(config, ctx) {
          if (ctx.isDev) {
            config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
          }
        }
    },

}
