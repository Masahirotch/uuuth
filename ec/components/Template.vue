<template>
  <transition name="el-fade-in-linear">
		<div>



		</div>
  </transition>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    props : ['item'],
    data() {
        return {


        }
    },
    created(){

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


    },





};
</script>

<style>


</style>
