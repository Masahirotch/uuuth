<template>
    <div center full>
        <Loader :text="text" v-if="loading" />
        <LoginBox />
    </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

export default {
    head() {
        script: [
          { src: 'https://static.line-scdn.net/liff/edge/2/sdk.js' },
        ]
    },
    data: () => {
        return {

            loading : true,
            text    : '読み込み中...'

        }
    },
    mounted : function(){

        this.loading = false

    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser','adminList']),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser','setAdminList']),

    },

};
</script>