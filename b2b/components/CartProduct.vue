<template>
  <div>
    <Loading v-if="loading" :text="text"/>

    <section class="cart__wrapper">
      <div class="cart__image">
        <img :src="thumb" alt="">
      </div>

      <div class="cart__explanation">
        <p class="cart__name">{{product.product_name}}</p>

        <div v-if="isShowProductUnitPrice" class="cart__calculation">
          <div class="cart__price">{{price|number_format}}円 / {{product.unit_code}}</div>
          <div class="cart__unit">{{product_cart?.quantity}}</div>
          <div class="cart__subtotal">{{price * product_cart?.quantity|number_format}}</div>
        </div>
        <div v-if="!isShowProductUnitPrice" class="cart__calculation">
          <div class="cart__unit_only" v-if="product.unit_code">単位 :  {{product.unit_code}}</div>
        </div>

        <div class="button__wrapper button__wrapper--cart">
          <button type="button" class="button__inc-dec"><img src="/resource/icon_minus.svg" alt="減らす" @click="quantityCalc(-1)"></button>
          <button type="button" class="button__number" :class="{'notZero': product_cart?.quantity > 0}">{{product_cart?.quantity}}</button>
          <button type="button" class="button__inc-dec"><img src="/resource/icon_plus.svg" alt="増やす" @click="quantityCalc(1)"></button>
        </div>
      </div>

      <button type="button" class="cart__delete" @click="quantityCalc(product_cart?.quantity * (-1))">
        <img src="/resource/icon_trash.svg" alt="削除">
      </button>
    </section>

  </div>
</template>

<script>
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    props : ['product'],
    data: () => {
        return {
            loading: false,
            
            dialogVisible : false,

            cartinlock    : false,

            
        }
    },
    async mounted(){

    },
    computed: {

        thumb : function(){

            return this.product.product_image_thumb

        },

        src : function(){

            return this.product.product_image_origin

        },

        price : function(){

            if( this.product.now_price > 0 ){

                return this.product.now_price

            }
            else{

                if( this.product.new_price > 0 ){

                    return this.product.new_price

                }
                else{

                    return this.product.base_price

                }

            }

        },

        product_cart : function(){
            const product = this.cart.find(cart => cart.product_id == this.product.product_id)
            return product ? JSON.parse(JSON.stringify(product)) : ''
        },

        isShowProductArea : () => {
            return process.env.SHOW_PRODUCT_AREA?.toLowerCase() == 'true';
        },

        isShowProductUnitPrice: () => {
            return process.env.SHOW_PRODUCT_UNIT_PRICE?.toLowerCase() == 'true';
        },

        isShowAddSubTenQuantity: () => {
            return process.env.SHOW_ADD_SUB_TEN_QUANTITY?.toLowerCase() == 'true';
        },


        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),

        quantityCalc: async function( quantity ){

            // 現在のカートをクローン
            var now_cart = await JSON.parse( JSON.stringify( this.cart ) )

            var target_item      = await this.product_cart
            target_item.quantity = await target_item.quantity + quantity

            var result   = await Promise.all( now_cart.map( async ( c )=>{

                if( c.product_id == target_item.product_id ){

                    if( target_item.quantity > 0 ){

                        c = await target_item
                        return await c

                    }

                }
                else{

                    return await c

                }

            }))

            var new_cart = await result.filter(　function( f ){

                return !( f == void 0 ); 

            })

            await this.setCart( new_cart )

            await this.setTempCart()


        },

        addCart : async function(){

            if( this.product.quantity == 0 ) return
            if( this.product.lock ) return 

            var price = await ( this.product.now_price > 0 )? this.product.now_price : this.product.base_price

            var cart_item = await [{
                product_id   : this.product.product_id,
                user_id      : this.userProfile.user_id,
                price        : price,
                quantity     : this.product.quantity,
                group_code   : this.product.group_code,
                product_code : this.product.product_code,
                product_name : this.product.product_name,
                shop_code    : this.userProfile.shop_code
            }]

            // カート情報をセット（クローンしたカートに新たなアイテムを加えて、カート情報を上書き）
            var now_cart = await JSON.parse( JSON.stringify( this.cart ) )
            var new_cart = [...now_cart,...cart_item]
            await this.setCart(new_cart)

            // データベースの Temporary Cart を更新
            var add_cart = await this.setTempCart()

            if( add_cart.status == 'success' ){

                // 商品追加ボタンをロック
                this.product.lock = await true

                // 商品追加ボタン等の情報を上書き（ クローン > 書き換え ）
                var product_clone = await JSON.parse( JSON.stringify( this.products ) )
                var new_product   = product_clone.findIndex( p => p.product_id == this.product.product_id )     
                product_clone[new_product] = await this.product
                await this.setProducts( product_clone )

            }
            else{

                await this.alertBox( add_cart.status , add_cart.message , add_cart.status )

            }

        },

        productPopup : async function(){

            this.product.popup = !this.product.popup

        },

        setTempCart : async function(){

            var db = await new URLSearchParams()
            await db.append( 'cart' , JSON.stringify( this.cart ) )
            return await this.$axios.put(`${process.env.MAIN_API}/cartin`, db ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /***************************************************************
         * type (str) : success / info / warning / error
         * https://element.eleme.io/#/en-US/component/message-box
        ****************************************************************/
        alertBox : async function( title , message , type ){

            this.$alert( message , title , {
              confirmButtonText: 'OK',
              type : type,
              dangerouslyUseHTMLString : true,
              callback: action => {

                return

              }
            });

        },



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
.cart__wrapper + .cart__wrapper {
  border-top: 1px solid var(--grayColor);
}
.cart__image {
  overflow: hidden;
  width: 48px;
  height: 48px;
  border: 1px solid var(--grayColor);
  border-radius: 8px;
}
.cart__explanation {
  flex: 1;
  padding-left: 12px;
}
.cart__name {
  padding: 0.25em 2em 0.25em 0;
  font-weight: bold;
  line-height: 1.2em;
}
.cart__price,
.cart__unit,
.cart__subtotal,
.cart__unit_only {
  position: relative;
  padding-right: 1.5em;
}
.cart__unit {
  padding-right: 1.25em;
}
.cart__subtotal {
  padding-right: 1em;
}
.cart__price::after,
.cart__unit::after,
.cart__subtotal::after {
  content: "×";
  position: absolute;
  top: 0;
  right: 0;
  width: 1.5em;
  height: 100%;
  text-align: center;
}
.cart__unit::after {
  content: "=";
  width: 1.25em;
}
.cart__subtotal::after {
  content: "円";
  width: 1em;
}
.cart__calculation {
  display: flex;
}
.cart__delete {
  position: absolute;
  top: 12px;
  right: 0;
  padding: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
}
</style>
