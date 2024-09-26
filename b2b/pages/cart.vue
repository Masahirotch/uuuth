<template>
  <div full-height>
    <Loading v-if="loading" />

    <Header :htitle="htitle"/>

    <main>

      <div class="cart__scroll">
        <p class="cart__no-item" v-if="product_list.length == 0">カートにアイテムはありません。</p>
        <CartProduct v-for="(product , index) in product_list" :product="product" :key="index" v-if="product.view"/>

        <div v-if="isShowCartTotalAmount" class="cart__total">
          小計：
          <span>{{total|number_format}}</span>
        </div>

        <section>
          <h2 class="cart__title">希望納品日</h2>
          <div class="cart__delv-date">
            <select v-model="deliv_date">
              <option disabled value="">日付を選択 &darr;</option>
              <option v-for="deliv in deliv_list" :value="deliv">{{deliv}}</option>
            </select>
          </div>
        </section>

        <section class="cart__mylist-wrapper" v-if="isCartData">
          <!-- マイリスト未登録 -->
          <div id="unregistered" v-if="added_mylist_name == ''">
            <h2 class="cart__title">カート内容をマイリストとして登録</h2>
            <p>カート内容をマイリストとして登録しておくと、同じ内容をすぐにカートに反映させることが出来ます。登録リスト名を入力して「マイリストに登録」ボタンでリスト登録が出来ます。</p>
            <input type="text" placeholder="登録リスト名を入力" class="cart__list-name-input" v-model="list_name">
            <button type="button" id="registerBtn" class="cart__list-button" @click="addMyList">マイリストに登録</button>
          </div>

          <!-- マイリスト登録済 -->
          <div id="registered" v-if="added_mylist_name != ''">
            <h2 class="cart__title">登録リスト名</h2>
            <p class="cart__list-name">{{ added_mylist_name }}</p>
          </div>
        </section>

        <section>
          <h2 class="cart__title">備考・発注メモ</h2>
          <input type="text" placeholder="商品についてのご要望などを記載" class="input-box" v-model="order_memo">
        </section>

        <button type="button" id="orderBtn" class="cart__order-button" v-if="isSetDate && isCartData" @click="sendOrder" :disabled="!canSendOrder">この内容で発注する</button>

      </div>
    </main>

    <!-- マイリスト登録完了モーダル -->
    <div id="mylist-modal" class="modal-wrapper" v-if="showMyListModal">
      <div class="modal__inner--small">
        <p class="modal__text">マイリストに登録しました</p>
        <button type="button" id="mylistModalClose" class="modal__close" @click="closeModal">カートへ戻る</button>
      </div>
    </div>

    <!-- 発注処理完了モーダル -->
    <div id="complete-modal" class="modal-wrapper" v-if="showOrderModal">
      <div class="modal__inner--small">
        <p class="modal__text">発注処理を行いました</p>
        <button type="button" id="completeModalClose" class="modal__close" @click="closeModal">閉じる</button>
      </div>
    </div>

    <Footer/>

  </div>
</template>

<script>
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    head: {
        title: '発注確認',
    },

    data: () => {
        return {
            loading: true,
            text : '処理しています...',

            order_memo : '',
        
            deliv_date : '',

            list_name  : '',

            htitle : 'カート',

            added_mylist_name : '',
            showMyListModal : false,
            showOrderModal :false,
            product_list: [],
            deliv_list: [],
            canSendOrder: true,
        }
    
    },
    async created(){

        if( !this.delivConfig ){

            var delivData = await this.loadDeliv()
            await this.setDelivConfig( delivData?.data || '')
        }
        this.loadDeliveryList()
    },

    async mounted(){

        this.loading = false
    
    },

    watch: {
        cart: {
            handler: async function (newValue, oldValue) {
                if ((newValue?.length || 0) != (oldValue?.length || 0)) {
                    const ids = JSON.parse(JSON.stringify(newValue.map( c => c.product_id)))
                    const result = await this.loadShopProducts(ids)
                    this.product_list = result.products
                }
            },
            deep: true,
            immediate: true
        }
    },

    computed: {
        total : function(){

            var ttl = 0

            this.cart.map( c => {

                ttl += c.price * c.quantity
                return c

            })

            return ttl

        },

        // 納品希望日時が選択されているか
        isSetDate : function(){

            return ( this.deliv_date != '' )? true : false

        },

        isCartData: function(){

            return this.total >= 0 && this.cartCount > 0  ? true : false

        },

        isListName : function(){

            return ( this.list_name != '' )? true : false

        },

        isShowCartTotalAmount: () => {
            return process.env.SHOW_CART_TOTAL_AMOUNT?.toLowerCase() == 'true';
        },

        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),

        /***************************************************************
         * Get products Data.
        ****************************************************************/
        loadShopProducts : async function(ids = []){
            if (ids.length == 0) return {products: []};
            return await this.$axios.get(`${process.env.MAIN_API}/b2b/products/${this.userProfile.shop_code}?productIds=${ids.join()}&getAll=true`)
            .then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /***************************************************************
         * Get delivery Config Data.
        ****************************************************************/
        loadDeliv : async function(){

            return await this.$axios.get(`${process.env.MAIN_API}/deliveryConfig`).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },
        // get delivery list
        loadDeliveryList: async function () {
            try {
                const {data} = await this.$axios.get(`${process.env.MAIN_API}/b2b/deliveryList`)
                this.deliv_list = data.list
            } catch (err) {
                console.dir(err);
            }
        },
        /***************************************************************
         * 注文の送信
        ****************************************************************/
        sendOrder : async function(){
            //this.loading = await true
            await console.clear()
            this.canSendOrder = false;
            // 注文内容を送信してデータベースに登録
            var order_sending = await this.sendToDB()

            // エラー時の処理
            if( order_sending.status != void 0 && order_sending.status == 'error' ){

                this.loading = await false
                this.canSendOrder = true;
                await this.alertBox( order_sending.status , order_sending.message , order_sending.status )

            }
            else{

                await this.clearCart()
                await this.sendChat( order_sending.order_id )
                this.showOrderModal = true;

            }

        },

        // オーダーをDBに保存
        sendToDB : async function(){

            var put = await new URLSearchParams()
            await put.append( 'cart'       , JSON.stringify( this.cart ) )
            await put.append( 'deliv_date' , JSON.stringify( this.deliv_date ) )
            await put.append( 'order_memo' , JSON.stringify( this.order_memo ) )
            await put.append( 'user'       , JSON.stringify( this.userProfile ) )
            return await this.$axios.put(`${process.env.MAIN_API}/ordering`, put ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); this.canSendOrder = true; return err; })

        },


        /***************************************************************
         * トークルームにレシートを送信
        ****************************************************************/
        sendChat : async function(order_id){
            if (!liff.isLoggedIn()) {
                await liff.login()
                return null
            }
            const receipt = await this.getReceipt(order_id);
            if (receipt.status == 'success') {
                this.deliv_date = ''
                this.order_memo = ''
                this.loading = false
                
                liff.sendMessages(receipt.receipt)
                .then(() => console.log("liffSendMessage: success"))
                .catch((err) => console.log("error", err))
            } else {
                this.loading = await false
                this.alertBox('error' , '注文は作成されましたが、LINEメッセージの送信に失敗しました。' , 'error' )
            }
        },

        // 注文内容のレシート(Flex Message)を取得する
        getReceipt : async function(order_id){ 

            return await this.$axios.get(`${process.env.MAIN_API}/receipt/${order_id}?token=${liff.getIDToken()}`).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /***************************************************************
         * Register the my list from cart
        ****************************************************************/
        addMyList : async function(){

            this.text    = await '登録しています...'
            this.loading = await true

            var add_list = await this.addMyListToDataBase()

            if( add_list.status == 'success' ){

                this.added_mylist_name = this.list_name
                this.text      = await ''
                this.loading   = await false
                this.list_name = await ''
                this.showMyListModal = true

            }
            else{

                this.added_mylist_name = ''
                this.text    = await ''
                this.loading = await false
                await this.alertBox( add_list.status , add_list.message , add_list.status )

            }

        },

        // send mylist to database
        addMyListToDataBase : async function(){

            var post = await new URLSearchParams()
            await post.append( 'cart'      , JSON.stringify( this.cart ) )
            await post.append( 'list_name' , this.list_name )
            return await this.$axios.put(`${process.env.MAIN_API}/addMyList`, post ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); return err; })

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

        closeModal() {
          this.showMyListModal = false
          if (this.showOrderModal) liff.closeWindow()
          this.showOrderModal = false
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

</style>
