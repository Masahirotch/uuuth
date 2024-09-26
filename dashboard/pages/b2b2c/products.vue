<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />

        <h2 id="content-header" split>
            <h3>野菜情報 for カスタマー 商品管理</h3>
            <div pr-2 right><el-button type="success" size="mini" @click="addNewProduct">商品を追加</el-button></div>
        </h2>

        <div pl-2 pr-2 pt-2 pb-2 >
            <div v-for="product in productList">

                <BtoBtoCproductEdit :product="product" 
                    @changeSaleStatus="changeSaleStatus" 
                    @openDialog="openDialog"
                    @productDelete="productDelete"

                />

                <el-dialog
                    :title="product.product_name"
                    :visible.sync="product.dialog"
                    big-dialog
                    >

                    <BtoBtoCproductEditDialog :product="product" @updateProduct="updateProduct" />

                </el-dialog>

            </div>
        </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {

            loading             : true,
            text                : '',

            appList             : [],
            productList         : [],
            articleList         : [],

            dialog              :false,

            targetProduct       : '',

        }
    },
    watch:{


    },
    created(){

      console.clear()

    },
    mounted : async function(){

        if( this.productList.length == 0 ){

            this.initProducts()

        }
        else{

            this.loading = false

        }

    },

    computed: {





        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' , 'setArticles' ]),

        ///// [ initialyze : 初期化処理 ] //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /* 初期化処理
        ***************************************/
        initProducts : async function(){

            this.appList      = await this.getAppSettings()

            this.articleList  = await this.getArticles()

            this.productList  = await this.getProducts()

            await this.endInit()

        },

        /* 配信先アカウント一覧の取得
        ***************************************/
        getAppSettings : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getAppSettings' , db ).then( function(result){

                this.setApps( result.data )

                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* 生産者DB(記事)一覧の取得
        **************************************/
        getArticles : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getArticles' , db ).then( function(result){

                this.setArticles( result.data )

                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /* 商品一覧の取得
        **************************************/
        getProducts : async function(){

            this.loading = true

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getProducts' , db ).then( function(result){

                this.setProducts( result.data )
                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        endInit : function(){

            this.loading = false

        },



        ///// [ 販売ステータスの変更 ] /////////////////////////////////////////////////////////////////////////////////////////////////////////

        changeSaleStatus : function( product ){

            this.loading = true

            var db = new URLSearchParams()
            db.append( 'product' , JSON.stringify( product ) )
            axios.post( process.env.VEGEMEDIA + 'changeSaleStatus' , db ).then( function(result){

            }.bind(this)).catch((err) => { console.dir(err); }).finally(function() { this.endInit(); }.bind(this));

        },

        ///// [ 編集ダイアログ ] /////////////////////////////////////////////////////////////////////////////////////////////////////////
       
        /* 編集ダイアログ
        ***************************************/
        openDialog : function( product ){

            product.dialog = true

        },


        ///// [ 商品の削除 ] /////////////////////////////////////////////////////////////////////////////////////////////////////////

        /* 削除の確認
        ***************************************/
        productDelete : function( product ){

            this.$confirm(
                `<p>${product.product_name} を削除しますか？<br>この操作は取り消せません</p>`,
                '削除の確認', 
                {
                    dangerouslyUseHTMLString  : true,
                    distinguishCancelAndClose : true,
                    confirmButtonText         : '削除する',
                    cancelButtonText          : 'キャンセル'
            
                }
            ).then(() => {

                this.doDeleteProduct( product )

            }).catch( action => {} );

        },

        doDeleteProduct : function( product ){

            this.loading = true

            var db = new URLSearchParams()
            db.append( 'product' , JSON.stringify( product ) )
            axios.post( process.env.VEGEMEDIA + 'deleteProduct' , db ).then( function(result){

                console.dir( result.data )

            }.bind(this)).catch((err) => { console.dir(err); }).finally(function() { this.initProducts(); }.bind(this));

        },



        ///// [ 商品データの更新、追加DB処理 ] //////////////////////////////////////////////////////////////////////////////////////////////////

        updateProduct : async function( product ){

            if( product.product_id == 0 ){

                this.addProduct(product)

            }

            else{

                var db = new URLSearchParams()
                db.append( 'product' , JSON.stringify( product ) )
                await axios.post( process.env.VEGEMEDIA + 'updateProduct' , db ).then( function(result){

                    this.$alert('データを更新しました', 'データ更新', {
                      confirmButtonText: 'OK',
                      callback: action => {

                        product.dialog = false
                        this.initProducts()

                      }
                    });


                }.bind(this)).catch((err) => { console.dir(err); }).finally(function() { //this.initProducts(); 
                }.bind(this));

            }

        },

        addProduct : async function( product ){


            var db = new URLSearchParams()
            db.append( 'product' , JSON.stringify( product ) )
            await axios.post( process.env.VEGEMEDIA + 'addProduct' , db ).then( function(result){

                    this.$alert('新規データを更新しました', 'データ登録', {
                      confirmButtonText: 'OK',
                      callback: action => {

                        product.dialog = false
                        this.initProducts()

                      }
                    });

            }.bind(this)).catch((err) => { console.dir(err); }).finally(function() { //this.initProducts(); 
            }.bind(this));

        },






        ///// [ 商品データの追加 ] /////////////////////////////////////////////////////////////////////////////////////////////////////////

        addNewProduct : function(){

            console.dir(this.productList)

            //  新規追加済みで登録がないProduct( product_id が0のもの )がある場合は、追加処理を行わない。
            var target = this.productList.find( p => p.product_id == 0 )
            if( target != void 0 ) return

            // 新規商品を追加
            var newProduct = {

                delete_flg         : 0,
                dialog             : false,
                is_sale            : false,
                limited_time_flg   : false, 
                limited_time_end   : '',
                limited_time_start : '',
                product_code       : '',
                product_detail     : '',
                product_id         : 0,
                product_name       : '',
                product_price      : '',
                product_unit       : '',
                quantity_limit     : 0,
                quantity_limit_flg : false,
                quantity_now       : 0,
                articles           : [] ,
                product_photo_id: 0,
                product_image : {
                    file_id     : 0,
                    file_url    : 'https://cdn.hiyoshi.app/images/dummy.jpg',
                    origin_name : 'dummy.jpg',
                    thumb_url   : 'https://cdn.hiyoshi.app/images/thumb_dummy.jpg'
                }


            }

            this.productList.push( newProduct )

        },







    }

};
</script>
<style>












</style>
