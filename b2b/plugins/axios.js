export default function ({ $axios, store, redirect }) {

    $axios.onRequest( ( config ) => {

        if ( store.getters['config/userProfile'] != void 0 && store.getters['config/userProfile'] != '' ) {

            config.headers.Authorization = 'Bearer ' + store.getters['config/userProfile'].user_id

        }

        return config

    })

    $axios.onResponse(() => {



    })

    $axios.onError((error) => {



    })

}