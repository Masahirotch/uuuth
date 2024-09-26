<template>
    <div>
        
    </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    data: () => {
        return {

            
        }
    },
    mounted(){
        //this.loading = false
    },
    computed: {

        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),





    },
    filters:{

        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

    },

}
</script>
<style>

</style>
