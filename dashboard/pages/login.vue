<template>
    <div center full>
        <Loader :text="text" v-if="loading" />
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
            text    : 'ログイン中...'

        }
    },
    created(){

    },
    mounted : function(){

        console.clear()

        console.dir(this.$route)
        this.loading = false
        this.$store.commit('setLogin')

    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser','adminList']),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser','setAdminList']),





    },

};
</script>
