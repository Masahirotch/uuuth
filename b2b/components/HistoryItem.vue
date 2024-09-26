<template>
  <section class="mylist__wrapper">
    <dl class="mylist__set">
      <dt>納品希望日：</dt>
      <dd @click="popup"><span id="modalOpen">{{delivDate}}</span></dd>
      <dt v-if="isShowOrderTotalAmount">発注金額：</dt>
      <dd v-if="isShowOrderTotalAmount">{{orderTotal|number_format}}円</dd>
      <dt>発注点数：</dt>
      <dd>{{orderTypes}}点</dd>
      <dt>発注メモ：</dt>
      <dd v-html="nl2br(history.order_memo) || '.'" :class="{'color-white': !nl2br(history.order_memo)}" />
      <dt>発注日：</dt>
      <dd>{{orderDate}}</dd>
    </dl>

    <button type="button" class="mylist__delete">
      <img src="img/icon_cross.svg" alt="削除">
    </button>

    <!-- リスト内容表示モーダル -->
    <div id="content-modal" class="modal-wrapper" v-if="history.popup && !showConfirm">
      <div class="modal__inner--large">
        <button type="button" id="content-close" class="modal__close--small" @click="popup">
          <img src="/resource/icon_cross.svg" alt="閉じる">
        </button>

        <section class="modal__scroll">
          <h2 class="modal__title">発注日：{{orderDate}}</h2>
          <p class="modal__item-number">発注点数：{{orderTypes}}点</p>

          <ul class="modal__list">
            <li v-for="( item , index ) in history.cart">
              <span class="modal__list--name">{{item.product_name}} <label v-if="!Boolean(item.available)">※取扱停止中</label></span>
              <div class="modal__list--unit">
                <span v-if="isShowProductUnitPrice">{{item.price|number_format}}円 × </span>
                <span>{{item.quantity}}</span>
              </div>
            </li>
          </ul>

          <div class="modal__total" v-if="isShowOrderTotalAmount">
            小計：
            <span>{{orderTotal|number_format}}</span>
          </div>
        </section>
        <button v-if="hasItemWithNotAvailable" type="button" class="modal__order">再発注不可</button>
        <button v-else type="button" id="mylistOrder" class="modal__order" @click="changeModal">この内容で再発注</button>
      </div>
    </div>

    <!-- カート内容更新確認モーダル -->
    <div id="order-modal" class="modal-wrapper" v-if="showConfirm">
      <div class="modal__inner--small">
        <p class="modal__text">この内容でカートを上書きします</p>

        <div class="modal__button-wrapper">
          <button type="button" id="orderCancel" class="modal__cancel" @click="changeModal">キャンセル</button>
          <button type="button" id="orderOk" class="modal__ok" @click="reOrder">OK</button>
        </div>
      </div>
    </div>
  </section>

</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

// 配列の要素の合計を計算する
const array_sum = nums => nums.reduce((a, x) => a + x);

export default {
    props : ['history'],

    data: () => {
        return {
          showConfirm : false,
        }
    },
    mounted(){

        


    },
    computed: {

        orderDate : function(){

            return this.$dayjs( this.history.order_date ).format('YYYY-MM-DD HH:mm')

        },

        orderTotal : function(){

            return array_sum( this.history.cart.map( c => { return c.price * c.quantity }) )

        },

        orderTypes : function(){

            return this.history.cart.length

        },

        isShowOrderTotalAmount: () => {
            return process.env.SHOW_ORDER_TOTAL_AMOUNT?.toLowerCase() == 'true';
        },

        isShowProductUnitPrice: () => {
            return process.env.SHOW_PRODUCT_UNIT_PRICE?.toLowerCase() == 'true';
        },

        delivDate : function(){
          return this.$dayjs( this.history.deliv_date ).format('YYYY-MM-DD')
        },

        hasItemWithNotAvailable: function() {
          const items =  this.history.cart
          if(items){
            return items.some(item => item.available === 0);
          }
          return false;
        },

        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),
        ...mapActions( 'products'    ,[ 'getProductsByIds'] ),
        
        /* popup order detail
        ****************************************************************/
        popup : function(){

            this.history.popup = !this.history.popup

        },
        changeModal() {
          this.showConfirm = !this.showConfirm
        },

        /***************************************************************
         * 過去のオーダー情報でカート情報を上書きする
         * 
         * カートアイテムオブジェクト
         *
         *  {
         *  group_code   : "9999"
         *  price        : 228
         *  product_code : "53201"
         *  product_id   : 3359
         *  product_name : "玉子　Ｍ"
         *  quantity     : 10
         *  shop_code    : "1000"
         *  user_id      : "U4617*******"
         * }
         * 
        ****************************************************************/
        reOrder : async function(){

            var clone = await JSON.parse( JSON.stringify( this.history.cart ) )

            const ids = clone.map(item => item.product_id).toString();
            const prds = await this.getProductsByIds(ids);

            var newCart = await Promise.all( clone.map( async ( item )=>{

                var nowPrice  = await prds.find( p => p.product_id == item.product_id ).now_price
                var basePrice = await prds.find( p => p.product_id == item.product_id ).base_price
                var price = ( nowPrice != void 0 && nowPrice > 0 )? nowPrice : basePrice

                return await {
                    group_code   : item.group_code,
                    price        : price,
                    product_code : item.product_code,
                    product_id   : item.product_id,
                    product_name : item.product_name,
                    quantity     : item.quantity,
                    shop_code    : this.userProfile.shop_code,
                    user_id      : this.userProfile.user_id
                }


            }))

            await this.clearCart()

            await this.setCart( newCart )

            var doUpdate = await this.tempCartUpdate()

            if( doUpdate.status == 'success' ){

                await this.$router.push( '/cart/' )

            }
            else{

                await this.alertBox( add_cart.status , add_cart.message , add_cart.status )

            }

        },

        /* サーバー上の　temp_cart を新しいカート情報で上書きする
        ****************************************************************/
        tempCartUpdate : async function(){

            await console.dir( this.cart )

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

        nl2br : function(value){

            return (value != undefined)? value.replace(/\r?\n/g, '<br>'):value;

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
<style scoped>
  .color-white {
    color: white !important;
  }
</style>
