<template>
  <div content>
    


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

</style>
