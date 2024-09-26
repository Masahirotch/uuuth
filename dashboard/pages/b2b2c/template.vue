<template>
    <div>
        <Menu />

        オーダー情報

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {

            loading : true,
            text    : '読み込み中...',

            appList : [],
            productList : [],

        }
    },
    created(){

    },
    mounted : async function(){

        if( this.appList.length == 0 || this.productList.length == 0 ){

            this.appList      = await this.getAppSettings()
            this.productList  = await this.getProducts()
            await this.endInit()
        
        }

    },

    computed: {

        
        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' , 'setArticles' ]),

        /* 配信先アカウント一覧の取得
        ***************************************/
        getAppSettings : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getAppSettings' , db ).then( function(result){

                this.setApps( result.data )

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        getProducts : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getProducts' , db ).then( function(result){

                this.setProducts( result.data )
                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        endInit : function(){

            console.dir( this.appList )
            console.dir( this.productList )

            this.loading = false

        },





    },

};
</script>
<style>
</style>
