<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />

        メッセージ作成

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {

            loading : true,
            text    : '読み込み中...'

        }
    },
    created(){

    },
    mounted : function(){

        this.loading = false

    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref' , 'appList' , 'products' , 'order' ]),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref' , 'setAppList' , 'setProducts' , 'setOrder' ]),



    },

};
</script>
<style>
</style>
