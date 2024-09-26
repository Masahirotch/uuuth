<template>
    <div>

        ご利用方法の編集

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [  ],

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
        ...mapGetters( 'b2c'   , ['constPref' , 'salesAccounts' ]),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref' , 'setSalesAccounts' ]),




    },
};
</script>
<style>

</style>