<template>
    <div bg-logo>
        <Loading v-if="loading" />


        ショップ情報




    </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    components: { Loading },
    data: () => {
        return {
            loading: true,
        }
    },
    mounted(){
        this.loading = false
    },
    computed: {
        ...mapGetters( 'user',['userProfile','userConfig','userShipping'] ),
        ...mapGetters( 'cart',['cart','cartCount','session_id' , 'orderMethod' , 'stripeToken' , 'delivery' ] ),
        ...mapGetters( 'products',['products','kuroneko'] ),

    },
    methods:{
        ...mapActions('user',['setUserProfile','setUserConfig','setUserShipping']),
        ...mapActions('cart',[ 'plusCart' , 'minusCart' , 'clearCart' , 'setSession' , 'cartInit' , 'setOrderMethod' , 'setStripeToken','setDelivery' ]),
        ...mapActions('products',['setProducts','setKuroneko']),
        




    },

};
</script>
<style>

</style>
