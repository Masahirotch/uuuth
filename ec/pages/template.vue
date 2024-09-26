<template>
    <div bg-logo full-height>
        <Loading v-if="loading" />








        <Footer @cartToggle="cartToggle" />

        <el-drawer
          title="現在のカートの中"
          :visible.sync="drawer"
          :direction="direction">    
          <Cart />
        </el-drawer>

    </div>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/Loading'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    components: { Loading },
    data: () => {
        return {
            loading: true,
            //////////
            drawer: false,
            direction: 'btt',
            
        }
    },
    mounted(){
        this.loading = false
    },
    computed: {
        ...mapGetters( 'config'  ,['config'] ),
        ...mapGetters( 'user'    ,['userProfile','userConfig','userShipping','history'] ),
        ...mapGetters( 'cart'    ,['cart','cartCount','session_id' , 'orderMethod' , 'stripeToken' , 'delivery' ] ),
        ...mapGetters( 'products',['products','shippingTable','constPref'] ),

    },
    methods:{
        ...mapActions('config'  ,['setConfig']),
        ...mapActions('user'    ,['setUserProfile','setUserConfig','setUserShipping','setHistory']),
        ...mapActions('cart'    ,[ 'plusCart' , 'minusCart' , 'clearCart' , 'setSession' , 'cartInit' , 'setOrderMethod' , 'setStripeToken','setDelivery' ]),
        ...mapActions('products',['setProducts','setShippingTable','setConstPref']),

        cartToggle : function(){

            this.drawer = !this.drawer

        },


    },

}
</script>
<style>

</style>
