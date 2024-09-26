<template>
  <section class="mylist__wrapper">
    <dl class="mylist__set">
      <dt>リスト名：</dt>
      <dd><span id="modalOpen" @click="popup">{{list.list_name}}</span></dd>
      <dt>発注点数：</dt>
      <dd>{{list.cart.length}}点</dd>
      <dt>作成日時：</dt>
      <dd>{{ list?.mylistDateCreated }}</dd>
    </dl>

    <button type="button" class="mylist__delete" @click="deleteMylist">
      <img src="/resource/icon_cross.svg" alt="削除">
    </button>

    <Modal
      :list="list"
      v-show="list.popup"
      @popup="popup"
      @re-order="reOrder"
    />

  </section>

</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

// 配列の要素の合計を計算する
const array_sum = nums => nums.reduce((a, x) => a + x);

export default {
    props : ['list'],

    data: () => {
        return {
        }
    },
    mounted(){

        


    },
    computed: {

        nowPrice : function(e){

            console.dir( e )

            return 0

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

            this.list.popup = !this.list.popup

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

            await console.clear()

            var clone = await JSON.parse( JSON.stringify( this.list.cart ) )

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

        deleteMylist: function () {
            this.$axios.post(`${process.env.MAIN_API}/deleteMylist`, { list_id: this.list.list_id, user_id: this.list.user_id, list_name: this.list.list_name })
            .then(response => {
                const {status, message} = response.data
                if (status == 'success') {
                    this.$emit('deleteMylist', this.list.list_id)
                }
                this.alertBox(status, message, status)
            })
        }


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
    .mylist__delete {
        cursor: pointer !important;
    }
    .mylist__delete:hover {
        cursor: pointer;
    }
</style>
