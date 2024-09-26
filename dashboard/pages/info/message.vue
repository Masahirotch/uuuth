<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />
        <InfoNewMsg />

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
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),



    },

};
</script>
<style>
</style>
