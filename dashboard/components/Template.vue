<template>
     <div>




    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'index' ],

    data() {

        return {


        }

    },
    watch:{


    },
    mounted(){



    },
    
    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref']),
    },

    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref']),




    },
};
</script>
<style scoped>



</style>