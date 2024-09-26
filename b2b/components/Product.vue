<template>
  <div>
    <section class="product__wrapper">
      <div class="product__upper">
        <div class="product__image">
          <img :src="thumb" alt="">
        </div>

        <div class="product__title">
          <h2 class="product__name">{{data.product_name}}</h2>
          <p class="product__origin">{{data.origin}}</p>
        </div>
      </div>

      <div class="product__lower">
        <div class="product__price" v-if="isShowProductUnitPrice">{{price|number_format}}円 / {{data.unit_code}}</div>
        <div class="product__unit" v-if="!isShowProductUnitPrice"><span v-if="data.unit_code">単位 : {{data.unit_code}}</span></div>

        <div class="button__wrapper">
          <button type="button" class="button__inc-dec" @click="quantityCalc(-1)">-1</button>
          <button type="button" class="button__number" :class="{'notZero': product.quantity > 0}">{{product.quantity}}</button>
          <button type="button" class="button__inc-dec" @click="quantityCalc(1)">+1</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    props : ['product'],
    data: () => {
        return {
            text    : 'カートを更新しています',
            dialogVisible : false,
            cartinlock    : false,
        }
    },
    async mounted(){

        const cart_product = this.cart.find( c => c.product_id == this.product.product_id )
        if( this.cart.length < 1 || !cart_product ){
            // 予備カートの数量をリセット
            this.product.quantity = 0
        } else {
            // 予備カートの数量をリセット
            this.product.quantity = cart_product.quantity
        }

        // 商品追加ボタン等の情報を上書き（ クローン > 書き換え ）
        // var product_clone = await JSON.parse( JSON.stringify( this.products ) )
        // var new_product   = await product_clone.findIndex( p => p.product_id == this.product.product_id )     
        // product_clone[new_product] = await JSON.parse( JSON.stringify( this.product ))
        // await this.setProducts( product_clone )

    },
    computed: {

        data : function(){

            return this.product

        },

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

        isFavorite : function(){

            return this.favorites.includes( this.product.product_id )

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
        

        /* カートに入れる数量の増減を行う
        ******************************************************************************/
        quantityCalc: async function( quantity ){

            //if( this.product.lock ) return 

            this.product.quantity = this.product.quantity + quantity
            if( this.product.quantity < 0 ){
                this.product.quantity = 0
            }
            this.addCart()

        },

        /* カートに追加する
        ******************************************************************************/
        addCart : async function(){

            // if( this.product.quantity == 0 ) return
            // if( this.product.lock ) return 

            var price = ( this.product.now_price > 0 )? this.product.now_price : this.product.base_price

            var cart_item = [{
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
            let now_cart = await JSON.parse( JSON.stringify( this.cart ) )
            let new_cart = now_cart.filter((item) => item.product_id !== cart_item[0].product_id)
            if (cart_item[0].quantity > 0) new_cart = [...cart_item,...new_cart]
            await this.setCart(new_cart)

            // データベースの Temporary Cart を更新
            var add_cart = await this.setTempCart()

            if( add_cart.status == 'success' ){

                // 商品追加ボタンをロック
                this.product.lock = true

                // 商品追加ボタン等の情報を上書き（ クローン > 書き換え ）
                var product_clone = JSON.parse( JSON.stringify( this.products ) )
                var new_product   = product_clone.findIndex( p => p.product_id == this.product.product_id )     
                product_clone[new_product] = JSON.parse( JSON.stringify( this.product ))
                await this.setProducts( product_clone )

            }
            else{

                await this.alertBox( add_cart.status , add_cart.message , add_cart.status )

            }

        },

        /* カートに追加する */
        setTempCart : async function(){

            var db = await new URLSearchParams()
            await db.append( 'cart' , JSON.stringify( this.cart ) )
            return await this.$axios.put(`${process.env.MAIN_API}/cartin`, db ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* お気に入りの追加
        ******************************************************************************/
        addFavorite : async function(){

            var setFav = await this.setFavorite()
            await this.setFavorites( setFav.data )

        },

        setFavorite : async function(){

            return await this.$axios.put( process.env.API + `setFavorite/${this.product.product_id}` ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* お気に入りの解除
        ******************************************************************************/
        delFavorite : async function(){

            await console.clear()
            var setFav = await this.removeFavorite()
            await this.setFavorites( setFav.data )

        },

        removeFavorite : async function(){

            return await this.$axios.put( process.env.API + `removeFavorite/${this.product.product_id}` ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },





        /* 商品写真のポップアップ
        ******************************************************************************/
        productPopup : async function(){

            this.product.popup = !this.product.popup

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
.product__wrapper {
  margin-bottom: 12px;
  padding: 12px;
  background-color: var(--whiteColor);
  border: 1px solid var(--grayColor);
  border-radius: 8px;
}
.product__upper {
  display: flex;
  align-items: center;
}
.product__image {
  overflow: hidden;
  width: 60px;
  height: 60px;
  border: 1px solid var(--grayColor);
  border-radius: 8px;
}
.product__image img {
  width: 100%;
  max-width: none;
  height: 100%;
  object-fit: cover;
}
.product__title {
  flex: 1;
  padding-left: 12px;
}
.product__name {
  line-height: 1.2em;
}
.product__origin {
  padding-top: 4px;
  color: var(--grayColor);
  font-size: 0.8em;
  font-weight: normal;
}
.product__lower {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
}
.product__price {
  font-weight: bold;
}
.product__unit {
  font-weight: normal;
}
.product__period {
  color: var(--grayColor);
  font-size: 0.8em;
}
</style>
