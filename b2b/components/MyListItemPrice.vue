<template>
    <div>
        <span v-if="isShowProductUnitPrice">@{{itemPrice|number_format}}円 x </span>{{item.quantity}}  
    </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    props : ['item'],
    data: () => {
        return {

            
        }
    },
    mounted(){

    },
    computed: {

        itemPrice : function(){

            var nowPrice  = this.products.find( p => p.product_id == this.item.product_id ).now_price
            var basePrice = this.products.find( p => p.product_id == this.item.product_id ).base_price
            return ( nowPrice != void 0 && nowPrice > 0 )? nowPrice : basePrice





        },

        isShowProductUnitPrice: () => {
            return process.env.SHOW_PRODUCT_UNIT_PRICE?.toLowerCase() == 'true';
        },

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
