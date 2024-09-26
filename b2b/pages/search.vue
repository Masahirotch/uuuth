<template>
  <div full-height>
    <Loading v-if="loading" :text="text"/>

    <Header :htitle="htitle"/>

  <main>
    <div class="search__box">
      <input type="text" placeholder="キーワード検索" class="input-box" v-model="search_word">
    </div>

    <div class="search__scroll">
      <Product v-for="(product , index) in product_list" :product="product" :key="index" v-if="product.view"/>
    </div>
    <div style="margin-bottom: 12px;" v-if="canShowMore">
        <el-button
            style="width: 100%; text-align: center;border-radius: 8px;border: 1px solid var(--grayColor);" 
            @click="loadShopProducts(search_word)">もっと見る</el-button>
    </div>
    <el-button 
        class="btn-scroll-top"
        icon="el-icon-top"
        @click="scrollTop"></el-button>
  </main>

  <Footer/>

  </div>
</template>

<script>
import { mapState , mapGetters, mapActions } from 'vuex'

export default {

    // https://liff.line.me/1656948912-Y5M1R9m7

    head: {
        title: '商品一覧',
    },

    data: () => {
        return {
            loading: true,
            text : '設定を読み込んでいます...',

            product_list : '',
            search_word  : '',

            htitle : '商品一覧',
            currentPage: 0,
            perPage: process.env.B2B_PER_PAGE,
            canShowMore: true,
        }
    },

    watch : {

        search_word: async function( newer , older ) {
            this.currentPage = 0
            this.canShowMore = true
            await this.loadShopProducts(newer)
        },
    
    },

    async mounted(){

        await console.clear()

        // liff initialyze
        if( liff != void 0 && liff ){

            // LIFF アプリの初期化
            await liff.init({ liffId : process.env.LIFF_ID }).then( async() => {

                this.appInit()

            }).catch((err) => { console.log(err.code, err.message); })

        }

    },
    computed: {


        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),

        /************************************************
         *  User Initialyze
        ************************************************/
        appInit : async function(){

            if( liff != void 0 && liff ){

                await liff.ready.then( async () => {


                    if ( !liff.isLoggedIn() ){ 

                        await liff.login()

                    }

                    else{

                        if( this.userProfile.user_id == void 0 ){

                            this.text = await 'ユーザー情報をチェックしています'

                            // get id token
                            var token = await this.getIDToken()

                            // check user data in DataBase. ( if not in database, insert new user data )
                            var userCheck = await this.checkUser( token )

                            if( userCheck.status == 'success' ){

                                await this.setUserProfile( userCheck.user )

                                // カート情報
                                if( this.cart == '' ){

                                    var cart_data = await this.loadCart()
                                    await this.setCart( cart_data.cart )
                                    await this.appSetup()

                                }
                                else{

                                    await this.appSetup()

                                }

                            }
                            else{
                                this.loading = false
                                await liff.logout()
                                await this.$alert( userCheck.message, userCheck.status, {
                                    showConfirmButton: false,
                                    showClose: false,
                                    type : userCheck.status,
                                    dangerouslyUseHTMLString : true,
                                    callback: action => {
                                        liff.closeWindow();
                                    }
                                });
                            }
                        }

                        else{

                            // カート情報
                            if( this.cart == '' ){

                                var cart_data = await this.loadCart()
                                await this.setCart( cart_data.cart )
                                await this.appSetup()

                            }
                            else{

                                await this.appSetup()

                            }

                        }

                    }

                })

            }

        },

        /* get line login token.
        ************************************************/
        getIDToken : async function() {

            return await new Promise( function( resolve ) {

                resolve( liff.getIDToken() );

            });  

        },

        /* check user in DataBase.
        ************************************************/
        checkUser : async function( token ){

            return await this.$axios.get( process.env.MAIN_API + '/checkUser/' + token ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /************************************************
         * Application Set UP.
        ************************************************/
        appSetup : async function(){

            if( this.units == '' ){

                var product_units = await this.loadUnits()
                await this.setUnits( product_units.units )

            }

            if( this.favorites == '' ){

                var fav_data = await this.loadFavorites()
                await this.setFavorites( fav_data.data )

            }

            if( this.delivConfig == '' ){

                var delivData = await this.loadDeliv()
                await this.setDelivConfig( delivData.data )

            }

            this.text = '商品リストを読み込み中...'

            await this.loadShopProducts()
        },

        // Get product list with shop_code.
        loadShopProducts : async function(search = ''){
            const params = `?currentPage=${this.currentPage+1}&perPage=${this.perPage}&search=${search}`

            await this.$axios.get(`${process.env.MAIN_API}/b2b/products/${this.userProfile.shop_code}${params}`)
            .then(function(result) {
                const {totalProduct, currentPage, perPage, products, status, message} = result.data
                const productsData = currentPage == 1 ? products : [...this.products,...products]
                const countProduct = currentPage * perPage
                if( status == 'success' && !message ) {
                    this.setProducts(productsData)
                    this.perPage = perPage
                    this.canShowMore = (countProduct >= totalProduct)? false : true
                    this.currentPage = currentPage
                    this.product_list = JSON.parse( JSON.stringify(productsData) )                    
                    this.loading = false
                } else {
                    this.alertBox( status, message, status )
                    this.loading = false
                    liff.logout()
                }
            }.bind(this))
            .catch((err) => { console.dir(err); })
        },

        // Get unit list with shop_code.
        loadUnits : async function(){

            return await this.$axios.get( process.env.MAIN_API + '/units' ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        // Get user cart in data base.
        loadCart : async function(){

            return await this.$axios.get( process.env.MAIN_API + '/cart' ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        // Get user Favorites Data.
        loadFavorites : async function(){

            return await this.$axios.get( process.env.MAIN_API + '/favorites' ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        // Get delivery Config Data.
        loadDeliv : async function(){

            return await this.$axios.get( process.env.MAIN_API + '/deliveryConfig' ).then( function(result){

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
        scrollTop () {
            window.scrollTo({top: 0, behavior: 'smooth'});
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
    .btn-scroll-top {
        position: fixed;
        bottom: 92px;
        right: 12px;
        z-index: 100;
        border-radius: 8px;
        border: 1px solid var(--grayColor);
        box-shadow: 5px 5px 5px 0;
        padding: 12px !important;
    }
</style>