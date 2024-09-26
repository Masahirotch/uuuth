<template>
  <div content info-order>
    <Loader text="サーバー処理中です" v-if="loading" />

野菜情報発注リスト


  </div>
</template>

<script>
    import { mapState , mapGetters, mapActions } from 'vuex'
    import axios from 'axios'

export default {
    props : [
        ''
    ],
    data() {
        return {
            loading : false,


        }
    },
    watch : {

    },
    mounted(){



    },

    computed: {
        ...mapGetters( 'user' , ['userProfile','login']),
        ...mapGetters( 'info' , ['allParent']),
    },
    methods:{
        ...mapActions( 'user' , ['setProfile','setLogin']),
        ...mapActions( 'info' , ['setAllParent']),


    },

};
</script>
<style>
[info-order]{
    padding:1em;
}
</style>
