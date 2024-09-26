<template>
    <transition name="el-fade-in-linear">
    <div item-box>
        <div split-box>
            <div left-box>
                <img :src=product.thumb_url>
            </div>
            <div right-box>
                <h3>{{product.product_name}}</h3>
                <p>{{product.product_code}}</p>
            </div>
        </div>

        <div item-detail>
            <dl>
                <dt>商品単価</dt>
                <dd><span big-text>{{product.price|number_format}}</span><span yen-mark>円</span></dd>
            </dl>
            <dl>
                <dt>数量</dt>
                <dd>
                    <span big-text>{{productQuantity|number_format}}</span><span yen-mark>個</span>
                </dd>
            </dl>
            <dl>
                <dt>商品小計</dt>
                <dd><span big-text>{{productTotal|number_format}}</span><span yen-mark>円</span></dd>
            </dl>

            <div cartbtn-split>
                <div cart-btn @click="cartOut">- 商品を減らす</div>
                <div cart-btn @click="cartIn">商品を増やす +</div>
            </div>

        </div>
    </div>
    </transition>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    props : ['product'],
    data() {
        return {


        }
    },
    computed: {

        productQuantity(){

            return this.product.quantity

        },

        productTotal(){

            return Number( this.product.price ) * Number(this.product.quantity)

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
        ...mapActions('products',['setProducts','setShippingTable','setConstPref','getProductsByIds']),

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

        ///////////////////////////////////////////////////////////////////
        cartIn : async function(){

            var plusItem = JSON.parse( JSON.stringify( this.product ) )
            const prds = await this.getProductsByIds({ ids: plusItem.product_id, appId: this.config.app_id });
            const product = prds.find((p) => p.product_id === plusItem.product_id)
            var cartInItem = {
                product_id      : plusItem.product_id,
                product_name    : plusItem.product_name,
                product_code    : plusItem.product_code,
                price           : plusItem.price,
                quantity        : 1,
                size_code       : plusItem.size_code,
                thumb_url       : product ? product.main?.thumb_url : null
            }

            this.plusCart(cartInItem)

            if( liff.getOS() != 'ios' ){

                window.navigator.vibrate(100)

            }

        },
        cartOut : function(){

            var outItem = JSON.parse( JSON.stringify( this.product ) )
            var cartOutItem = {
                product_id             : outItem.product_id,
            }

            this.minusCart(cartOutItem)

            if( liff.getOS() != 'ios' ){

                window.navigator.vibrate(100)

            }



        },


        ///////////////////////////////////////////////////////////////////


        ///////////////////////////////////////////////////////////////////
        // getSrc : function(id){

        //     var temp = JSON.parse( JSON.stringify( this.products ) )
        //     let target = temp.find( p => Number(p.product_id) == Number(id) )

        //     return ( target != void 0 )? target.main.thumb_url : process.env.DUMMY_THUMB_IMAGE

        // },

        productSum : function(product){

            return Number(product.price) * Number(product.quantity)

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

[item-box]{
    background: var(--bg);
    flex: 1 1 200px;
    overflow-x: hidden;
    border-radius: 5px;
    scroll-snap-align: center;
    width: 50%;
    min-width: 98%;
    margin: 0 5px;
    padding: 10px;

    /*display: inline-block;*/
    display: flex;flex-flow:column nowrap;justify-content: flex-start; align-items: flex-start;

}

[item-box] [split-box]{
    display: flex; flex-flow:row nowrap; justify-content: flex-start;align-items:stretch;
}
[item-box] [split-box] [left-box]{
    width: 30%;
    max-width:120px;
    min-width:120px;
    max-height:120px;
    min-height:120px;
}
[item-box] [split-box] [left-box] img{
    height:100%;
    object-fit:cover;
    width:100%;
}
[item-box] [split-box] [right-box]{
    width: 70%;
    padding-left: 1em;
}
[item-box] [split-box] [right-box] *{color: var(--text-color);}

[item-box] [split-box] [right-box] h3{font-size: min(4vmin , 16px);padding-bottom: 0.3em;}
[item-box] [split-box] [right-box] h4{font-size: min(3.5vmin , 14px);}
[item-box] [split-box] [right-box] p{
    font-size: min(3.4vmin , 14px);padding-top: 0.5em;border-top: 1px dashed var(--main-light);
}

[item-box] [item-detail]{
    display : inline-flex;flex-flow:column nowrap;justify-content: flex-start; align-items: flex-start;
    width:100%;margin-top: 0.5em;
}
[item-box] [item-detail] > dl{
    display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:center;width: 100%;
    border-bottom: 1px dashed var(--main-light);
}
[item-box] [item-detail] > dl *{
    color: var(--text-color);
    letter-spacing: 0.05em;
    font-size: min(4.6vmin , 20px);
}
[big-text]{font-size: 1.2em;}


</style>
