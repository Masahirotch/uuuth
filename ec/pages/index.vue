<template>
    <div center-col pl-2 pr-2 app-index>
        <Loading v-if="loading" :text="text"/>

        <el-button mt-1i @click="goProducts" go-shop v-if="isProducts">商品の購入はこちら</el-button>

        <Footer @cartToggle="cartToggle" />

        <el-drawer
          title="現在のカートの中"
          :visible.sync="drawer"
          :direction="direction">
          <Cart />
        </el-drawer>

    </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {
            loading : true,
            text    : '起動しています...',
            //////////
            drawer: false,
            direction: 'btt',

        }
    },
    async created(){

        console.dir( this.config )

    },
    async mounted(){

        if( this.config != '' && this.config.liff_id != void 0){

            // liff initialyze
            if( liff != void 0 && liff ){

                // LIFF アプリの初期化
                await liff.init({ liffId : this.config.liff_id }).then( async() => {

                    await this.checkLogin()

                }).catch((err) => { console.log(err.code, err.message); })


            }

        }

        else{

            if( this.$route.query.app != void 0 ){

                await axios.get( process.env.MAIN_API + '/appConfig/' + this.$route.query.app ).then( async function(result){

                    if( result.data.length > 0 ){

                      await this.setConfig(result.data[0])

                        await liff.init({ liffId : this.config.liff_id }).then( async() => {

                          await this.checkLogin()

                        }).catch((err) => { console.log(err.code, err.message); })

                    }

                }.bind(this)).catch((err) => { console.dir(err); })

            }

            if( this.$route.query['liff.state'] != void 0 ){

                var appname = await this.$route.query['liff.state'].replace( /\?app\=/g , '')

                await axios.get( process.env.MAIN_API + '/appConfig/' + appname ).then( async function(result){

                    if( result.data.length > 0 ){

                      await this.setConfig(result.data[0])

                        await liff.init({ liffId : this.config.liff_id }).then( async() => {

                          await this.checkLogin()

                        }).catch((err) => { console.log(err.code, err.message); })

                    }

                }.bind(this)).catch((err) => { console.dir(err); })

            }

        }

    },
    computed: {
        isProducts : function(){
            return this.products?.length > 0 || false;
        },

        ...mapGetters( 'config'  ,['config'] ),
        ...mapGetters( 'user'    ,['userProfile','userConfig','userShipping','history'] ),
        ...mapGetters( 'cart'    ,['cart','cartCount','session_id' , 'orderMethod' , 'stripeToken' , 'delivery' ] ),
        ...mapGetters( 'products',['products','shippingTable','constPref'] ),

    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig']),
        ...mapActions('user'    ,[ 'setUserProfile' , 'setUserConfig' , 'setUserShipping' , 'setHistory']),
        ...mapActions('cart'    ,[ 'plusCart' , 'minusCart' , 'clearCart' , 'setSession' , 'cartInit' , 'setOrderMethod' , 'setStripeToken','setDelivery' ]),
        ...mapActions('products',[ 'setProducts','setShippingTable','setConstPref', 'getProductsByIds']),

        /* LIFF ログイン チェック
        *****************************************************/
        async checkLogin() {

            if ( !liff.isLoggedIn() ){

                await liff.login({ redirectUri: location.href });

            }
            else {

              await this.getProfile()

            }

        },

        /* LINE ユーザー情報の取得
        *****************************************************/
        async getProfile() {

            await liff.getProfile().then( (profile) => {

                this.setUserProfile(profile)

                if( this.userProfile != ''){

                    this.getStatus()

                }

            })
            .catch((err) => { console.log( err.code , err.message , err ); })
            .finally( function(){  }.bind(this))

        },

        /* LINE ユーザーの初期設定（初めてのユーザーはDBに登録）
        *****************************************************/
        getStatus : async function(){

            var chkUser = await new URLSearchParams()
            await chkUser.append( 'userProfile' , JSON.stringify( this.userProfile ) )
            await chkUser.append( 'app_id'      , this.config.app_id )
            await axios.post( process.env.MAIN_API + '/initUser' , chkUser ).then( function(result){

                if( result.data.length > 0 ){

                    this.appInit()

                }

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){}.bind(this))

        },

        /******************************************************
         *
         * アプリケーションのイニシャライズ
         *
        *****************************************************/
        appInit : async function(){

            // 商品情報の呼出し
            var product_list = await this.loadProducts()
            await this.setProducts( product_list )

            // ユーザーのカートセッションの呼出しとカートの生成
            var user_cart = await this.getCartSession()

            if( user_cart.length == 0 ){

                await this.clearCart()

            }
            else{

                await this.setSession(user_cart[0].session_id)

                let cartData = await JSON.parse( JSON.stringify( user_cart ) )
                const ids = cartData.map(item => item.product_id).toString();
                const prds = await this.getProductsByIds({ ids, appId: this.config.app_id });

                let tempCart = [];
                for (let cart of cartData) {
                  const product = prds.find(p => p.product_id === cart.product_id)
                  if (!!product) {
                    cart = {
                      price        : cart.price,
                      product_code : cart.product_code,
                      product_id   : cart.product_id,
                      product_name : cart.product_name,
                      product_unit : cart.unit,
                      quantity     : Number(cart.quantity),
                      size_code    : cart.size_code,
                      thumb_url    : product.main?.thumb_url
                    }
                    tempCart.push(cart);
                  }
                }

                await this.cartInit( tempCart )

            }

            // ユーザー設定による配送を取得
            var user_shipping_list = await this.getUserShipping()
            await this.setUserShipping( user_shipping_list )

            await console.dir( 'user_shipping_list' )
            await console.dir( user_shipping_list )


            // 送料テーブルの呼び出し
            var shipping_table = await this.getPrefShipping()
            await this.setShippingTable( shipping_table )

            await console.dir( 'getPrefShipping' )
            await console.dir( shipping_table )


            // 県一覧データの呼び出し
            var pref_data = await this.getConstPref()
            await this.setConstPref(pref_data)

            await console.dir( 'getConstPref' )
            await console.dir( pref_data )


            // 購入履歴の呼び出し
            var user_history_data = await this.getUserHistory()
            this.setHistory( user_history_data )

            await console.dir( 'getUserHistory' )
            await console.dir( user_history_data )

            // 記事ページかどうかを判断。
            await this.articlePage()

        },

        /* 商品情報の呼び出し
        *****************************************************/
        loadProducts : async function(){

            return await axios.get( process.env.MAIN_API + '/ec/products/' + this.config.app_id ).then( function(result){

                return result.data.products || []

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* ユーザーのカートセッションを呼び出し
        *****************************************************/
        getCartSession : async function(){

            var db = await new URLSearchParams()
            await db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
            return await axios.post( process.env.MAIN_API + '/getCartSession' , db ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* ユーザーが登録している配送先住所の呼び出し
        *****************************************************/
        getUserShipping : async function(){

            var db = await new URLSearchParams()
            await db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
            return await axios.post( process.env.MAIN_API + '/getUserShipping' , db ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* 送料テーブルの呼び出し
        *****************************************************/
        getPrefShipping : async function(){

            var db = await new URLSearchParams()
            await db.append( 'app_id' , this.config.app_id )
            return await axios.post( process.env.MAIN_API + '/getPrefShipping' , db ).then( function(result){

                return result.data

            }.bind(this))
            .catch((err) => { console.dir(err); })

        },

        /* 県一覧データの呼び出し
        *****************************************************/
        getConstPref : async function(){

            var db = await new URLSearchParams()
            return await axios.post( process.env.MAIN_API + '/getConstPref' , db ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /*  購入履歴の呼び出し
        *****************************************************/
        getUserHistory : async function(){

            var db = await new URLSearchParams()
            await db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
            await db.append( 'app_id' , this.config.app_id )
            return await axios.post( process.env.MAIN_API + '/getUserHistory' , db ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /* media page遷移　article={article_id} があった場合は記事ページへ遷移
        *****************************************************/
        articlePage : function(){

            if( this.$route.query.article != void 0 && this.$route.query.article != '' ){
                this.$router.push('/article/' + this.$route.query.article )
            }
            else{
                this.goProducts()
            }

        },

        goProducts : function(){

          this.loading = false;
          this.$router.push('/products/')

        },

        cartToggle : function(){

            this.drawer = !this.drawer

        },

    },

};
</script>
<style>
[app-index]{position:fixed;min-height: -webkit-fill-available;overflow: hidden;max-width: 500px;}
[app-index] > img{margin-top:-15vh;}
[go-shop]{font-size: 18px;font-weight: bold;background:var(--text-color);}
.el-button.el-button--default[go-shop] span{color:var(--bg)}

.el-button.el-button--default[go-shop]:active,.el-button.el-button--default[go-shop]:hover,.el-button.el-button--default[go-shop]:focus{
    backgeound:var(--bg);
}
.el-button.el-button--default[go-shop]:active span,.el-button.el-button--default[go-shop]:hover span,.el-button.el-button--default[go-shop]:focus span{
    color:var(--text-color);
}
</style>
