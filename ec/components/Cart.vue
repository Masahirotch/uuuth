<template>
  <transition name="el-fade-in-linear">
		<div cart-box>

            <div v-if="totalQuantity == 0">
                <div center-row pt-2 no-item>カート内に商品はありません</div>
            </div>

            <div item-list>

                <CartItem v-for="product in cart" :product = "product" v-if="totalQuantity > 0" item-box/>

            </div>

            <dl ttl-price  v-if="totalQuantity > 0">
                <dt>商品合計</dt>
                <dd>
                    <span big-text>{{totalQuantity|number_format}}</span><span yen-mark>点</span> : 
                    <span big-text>{{totalPrice|number_format}}</span><span yen-mark>円</span>
                </dd>
            </dl>

            <div checkout-area v-if="totalQuantity > 0">
                <div checkout-btn @click="goShipping">購入する</div>
            </div>

		</div>
  </transition>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    data() {
        return {


        }
    },
    mounted(){


    },
    computed: {

        totalPrice (){

            let cartClone = JSON.parse( JSON.stringify( this.cart ) )

            var total = 0
            cartClone.forEach( v => { total += Number(v.price) * Number(v.quantity) } )

            return total

        },
        totalQuantity(){

            let cartClone = JSON.parse( JSON.stringify( this.cart ) )
            var total = 0
            cartClone.forEach( v => { total += v.quantity } )
            return total

        },

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


        nl2br(value) {

           if(value != undefined){

              if( value.indexOf('http') != -1 ){

                var exp = /(http(s)?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                var test = value.replace( exp , "<a href='$1"+"?openExternalBrowser=1"+"' target='_blank'>$1</a>")
                return test.replace(/\r?\n/g, '<br>')
                //return linkUrl.link(linkUrl + '?openExternalBrowser=1')

              }
              else{

                return value.replace(/\r?\n/g, '<br>')

              }


           }

        },

        // getSrc : function(id){

        //     var temp = JSON.parse( JSON.stringify( this.products ) )
        //     let target = temp.find( p => Number(p.product_id) == Number(id) )

        //     return '';//'/products/' + target.product_id + '.jpg' 

        // },

        productSum : function(product){

            return Number(product.productPrice) * Number(product.productQuantity)

        },
        goShipping : function(){


            if( this.$route.name == 'shipping' ){
                this.$emit('cartToggle')
            }

            this.$router.push('/shipping/')

        },






    },
    filters:{

        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

    },




};
</script>

<style>
[cart-box]{padding-bottom: 3em;}

[no-item]{font-weight: bold;}

[item-list]{
    padding: 15px 5vmin;
    scroll-snap-type: x mandatory;
    overflow-x: scroll;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-align-items: stretch;
    -ms-flex-align: stretch;
    align-items:  stretch;
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
}

[item-list]::after {
    content: "\00a0";
    width: 36px;
    display: block;
}



[ttl-price]{display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:center;width: 100%;padding:0 2em;}
[ttl-price] dt{font-weight: bold;color: var(--main-color);}
[ttl-price] dd{font-weight: bold;border-bottom: 1px dotted var(--main-color);padding-bottom: 0.2em;color: var(--main-color);font-size: 20px;}
[ttl-price] dd span{color: var(--main-color);}






[checkout-area]{
    padding:1em;display: flex; flex-flow:row nowrap;justify-content: center; align-items:center;width:100%;
}
[checkout-btn]{
    color     : var(--cart-btn);
    background: var(--cart-btn-bg);
    font-weight: 100;
    padding: 0.4em;
    font-size:min(4.6vmin , 18px);
    letter-spacing: 0.05em;
    position: relative;display: flex; flex-flow:row nowrap;justify-content: center; align-items:center;border-radius: 2em;
    box-shadow: 2px 5px 7px rgba(124, 136, 160,0.6);
    width: 90%;
    transition: all 0.2s ease;
}
[checkout-btn]:focus,[checkout-btn]:active{
    color     : var(--cart-btn);
    background: var(--cart-btn-light);
    box-shadow: 0px 2px 4px rgba(124, 136, 160,0.8);
    transition: all 0.2s ease;
}

[checkout-btn]::after{
    content: "\0bb";
    transform: scale(2.5);
    transform-origin: center;
    right: 1.2em;
    position: absolute;
    top: 0.4em;
}
</style>
