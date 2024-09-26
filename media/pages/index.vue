<template>
  <transition name="el-fade-in-linear">
    <div>

        <Loading :text="text" v-if="loading"/>

        <!-- page not found. -->
        <Article v-if="isArticle" :data="article" @cartToggle="cartToggle"/>

        <!-- page not found. -->
        <PageNotFound v-if="!isPage" />

        <Footer @cartToggle="cartToggle" v-if="isArticle" />

        <el-drawer
          :visible.sync="cartDrawer"
          :direction="direction"
          :with-header="true">
          <Cart @checkOut="checkOut"/>
        </el-drawer>

        <el-drawer
          :visible.sync="checkoutDrawer"
          :direction="direction"
          :with-header="true">
          <Buy @sendOrder="sendOrder"/>
        </el-drawer>

    </div>
  </transition>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

/*

https://liff.line.me/1656856248-pbNvvKP4?app=vegemedia
https://liff.line.me/1656856248-pbNvvKP4?app=vegemedia&article=1

https://liff.line.me/1656807928-WmmAn0LR?app=adop_cafe
https://liff.line.me/1656807928-WmmAn0LR?app=adop_cafe&article=13

*/

export default {
    head(){
        return {
            title : this.pageTitle,
            htmlAttrs: {
                lang: 'ja-JP'
            },
        }
    },
    data: () => {

        return {
            loading: true,
            text   : '起動中...',

            isPage    : true,
            isArticle : false,

            cartDrawer     : false,
            checkoutDrawer : false,
            direction      : 'btt',

            // order id
            order_id       : '',
  
        }

    },
    mounted : async function(){

        /////////[ パラメータから公式アカウント設定の読み込み ]//////////////////////////////////////////////
        if( this.$route.query['liff.state'] != void 0 || this.$route.query.app != void 0 ){

            // Liff.state
            if( this.$route.query['liff.state'] != void 0 ){

                var c = this.$route.query['liff.state'].slice( 1 ).split('&').map( s => {

                    var splited = s.split('=')
                    var key = splited[0]
                    var val = splited[1]

                    return { [key] : val }

                });


                this.set_app_code( c[0].app )

                if( c.length > 1 ){

                    this.set_article_id( c[1].article )

                }

            }

            // Redirect query
            if( this.$route.query.app != void 0 ){

                this.set_app_code( this.$route.query.app )

                if( this.$route.query.article != void 0  ){

                    this.set_article_id( Number( this.$route.query.article ) )

                }

            }

            var db = new URLSearchParams()
            db.append( 'app_code' , this.app_code )
            await axios.post( process.env.API + 'getAppConfig' , db ).then( function( result ){

                this.setAppConfig( result.data )

                liff.init({ liffId : result.data.liff_id }).then( async() => {

                    this.text = '設定を読み込んでいます...'
                    this.liffLogin()

                }).catch((err) => { console.log(err.code, err.message); })

            }.bind(this))
            .catch((err) => { console.dir(err); return false; })

        }
        ///////////////////////////////////////////////////////



    },
    computed: {

        pageTitle : function(){

            if( this.appConfig == '' ){

                return 'VegeMedia - ベジメディア'

            }
            if( this.appConfig != '' ){

                return ( this.article == '' )?  this.appConfig.app_name : this.article.article_title

            }

        },

        ...mapGetters( 'user'    ,[ 'userProfile' , 'userConfig' , 'history' ]),
        ...mapGetters( 'config'  ,[ 'appConfig' , 'article_id' , 'app_code' ]),
        ...mapGetters( 'article' ,[ 'article' , 'articles' ]),
        ...mapGetters( 'cart'    ,[ 'cart' , 'quantity' ]),

    },
    methods:{
        ...mapActions( 'user'    ,[ 'setUserProfile' , 'setUserConfig' , 'setHistory' ]),
        ...mapActions( 'config'  ,[ 'setAppConfig' , 'set_article_id' , 'set_app_code' ]),
        ...mapActions( 'article' ,[ 'setArticle' , 'setArticles'  ]),
        ...mapActions( 'cart'    ,[ 'setCart' , 'clearCart' ]),

        ////// LIFF Login & get user Profile Data. ////////////////////////////////////
        liffLogin : function(){

            if ( !liff.isLoggedIn() ){ 
            
                //liff.login( { redirectUri: process.env.LIFF_URL + '?app=' + this.$route.query.app } ); 
                liff.login({ redirectUri: location.href });

            }
            else {  

                this.getUserProfile()

            }

        },
        getUserProfile : function(){

            liff.getProfile().then( (profile) => {

                this.setUserProfile(profile)

            }).catch((err) => { console.log( err.code , err.message , err ); }).finally( function(){ this.settingApp() }.bind(this))

        },
        ////////////////////////////////////////////////////////////////////////



        ///////// intialize App Settings ///////////////////////////////////////
        settingApp : async function(){

            /////////////////////////////////////////////
            console.log( liff.getIDToken() )
            console.log( liff.getDecodedIDToken() )
            /////////////////////////////////////////////

            this.text = 'アプリを初期化中...'
            var user = await this.userCheckin()
            await this.chkArticle()

        },


        ///////// ユーザーチェックイン（初回はデータベースにユーザー情報を保存）
        userCheckin : async function(){

            this.text = 'ユーザー情報を更新しています...'
            var db = new URLSearchParams()
            db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
            db.append( 'app_config'  , JSON.stringify( this.appConfig ) )
            return await axios.post( process.env.API + 'userCheckin' , db ).then( function( result ){

                return result.data

            }.bind(this))
            .catch((err) => { console.dir(err); return false; })
        },

        ///////// 記事パラメーターがあるか（ &article= ）
        chkArticle : async function(){

            if( this.article_id != void 0 && this.article_id != '' ){

                this.isPage = true
                var story = await this.getArticle()

            }
            else{

                this.notArticle()

            }

        },

        ///////// 記事パラメーターがない場合は Page Not Found を表示
        notArticle : function(){

            this.isPage    = false
            this.loading   = false

        },

        ///////// 記事パラメーターがある場合はDBから記事を取得
        getArticle : async function(){

            this.text = '記事を読み込み中...'

            var db = new URLSearchParams()
            db.append( 'article_id' , this.article_id )
            return await axios.post( process.env.API + 'getArticle' , db ).then( function( result ){

                this.setArticle(result.data)
                this.isArticle = true
                this.loading = false

                return result.data

            }.bind(this))
            .catch((err) => { console.dir(err); return false; })

        },

        ///////// cart toggle
        cartToggle : function(){

            this.cartDrawer = !this.cartDrawer

        },

        checkOut : function(){

            this.cartDrawer = !this.cartDrawer
            this.checkoutDrawer = !this.checkoutDrawer

        },


        ////////////// 注文の送信 ///////////////////////////////////////////////
        sendOrder : async function(){

            this.text    = 'ご注文を送信しています...'
            this.loading = true
            this.checkoutDrawer = false

            var sendDB   = await this.sendOrderToDataBase()

            var receipt  = await this.makeReceipt()

            var sendLine = await this.sendReceipt(receipt)

            await this.orderClose( receipt )

        },

            //// DB 処理 ////
            sendOrderToDataBase : async function(){

                var db = new URLSearchParams()
                db.append( 'cart'        , JSON.stringify( this.cart        ) )
                db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
                db.append( 'appConfig'   , JSON.stringify( this.appConfig   ) )

                return await axios.post( process.env.API + 'orderComplete' , db ).then( function( result ){

                    this.order_id = result.data.order_id
                    return result.data

                }.bind(this))
                .catch((err) => { console.dir(err); return false; })

            },

            //// FLEX MESSAGE (RECEIPT) 作成 ////
            makeReceipt : async function(){

                console.clear()

                var db = new URLSearchParams()
                db.append( 'cart'        , JSON.stringify( this.cart        ) )
                db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
                db.append( 'appConfig'   , JSON.stringify( this.appConfig   ) )
                db.append( 'order_id'    , Number( this.order_id            ) )
                return await axios.post( process.env.API + 'makeReceipt' , db ).then( function( result ){

                    return result.data

                }.bind(this))
                .catch((err) => { console.dir(err); return false; })

            },

            //// FLEX MESSAGE (RECEIPT) をユーザーに送信 ////
            sendReceipt : async function( receipt ){

                var messages = [ receipt ]
                var db = new URLSearchParams()
                db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
                db.append( 'appConfig'   , JSON.stringify( this.appConfig   ) )
                db.append( 'messages'    , JSON.stringify( messages         ) )
                return await axios.post( process.env.API + 'pushMessage' , db ).then( function( result ){

                    console.dir( result.data )
                    return result.data

                }.bind(this))
                .catch((err) => { console.dir(err); return false; })
            },

            orderClose : function(){

                this.clearCart()
                this.text    = 'ご注文を送信しています...'
                this.loading = false

                this.$alert('注文を送信しました', '', {
                  confirmButtonText: 'OK'
                });




            },




    },

}
</script>
<style>
.el-drawer.btt{
    height:initial !important;
    border-radius:0.5em 0.5em 0 0;
    padding:0.5em;
}

.el-message-box{

    max-width: 280px;

}
.el-button--primary span{
    color: #FFF;
}


</style>
