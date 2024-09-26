<template>
    <div>
        <Menu />

        <Loader v-if="loading" :text="text" />

        <h2 id="content-header" split>
            <h3>接続先アカウント</h3>
            <div pr-2><el-button type="success" size="mini" @click="addNewAccountDialog = true">接続先公式アカウントを追加</el-button></div>
        </h2>


        <div id="account-list">

            <el-collapse v-model="activeNames" accordion>
              <el-collapse-item :title=" 'LINE公式アカウント : ' + app.app_name" :name="app.app_id" v-for="( app , index ) in appList">
                <BtoBtoCappEdit :app="app" @updateApp = "updateApp" @deleteApp="deleteApp"/>
              </el-collapse-item>
            </el-collapse>

        </div>




        <!-- アカウント追加ダイアログ -->
        <el-dialog
          title="アカウントの追加"
          :visible.sync="addNewAccountDialog"
          width="50%">

                <label account-editor>
                    <span>アカウント名</span>
                    <el-input placeholder="公式アカウント名" v-model="newAccount.app_name"></el-input>
                </label>

          <span slot="footer" class="dialog-footer">
            <el-button @click="addNewAccountDialog = false" size="mini">キャンセル</el-button>
            <el-button type="primary" @click="addNewAccount" size="mini" :disabled="isName">追加する</el-button>
          </span>

        </el-dialog>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {

            loading             : true,
            text                : '読み込み中...',

            appList             : [],
            productList         : [],

            activeNames         : [],

            addNewAccountDialog : false,

            newAccount          : {
                app_id               : null,
                app_name             : '',
                app_code             : '',
                channel_access_token : '',
                channel_id           : '',
                channel_secret       : '',
                client_code          : '',
                client_name          : '',
                liff_id              : ''
            },




        }
    },
    created(){

        console.clear()

    },
    mounted : async function(){

        if( this.appList.length == 0 || this.productList.length == 0 ){

            this.appList      = await this.getAppSettings() 
            this.productList  = await this.getProducts() 
            await this.endInit()
        
        }
    
    },

    computed: {
        
        isName : function(){

            return ( this.newAccount.app_name != '' )? false : true

        },


        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' , 'setArticles' ]),


        ///// [ initialyze ] //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /* 配信先アカウント一覧の取得
        ***************************************/
        getAppSettings : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getAppSettings' , db ).then( function(result){

                this.setApps( result.data )

                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        getProducts : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getProducts' , db ).then( function(result){

                this.setProducts( result.data )
                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        endInit : function(){

            this.loading = false

        },



        ///////// [ edit account ] //////////////////////////////////////////////////////////////////////////////////////////////////////////

        /* 配信先アカウント情報のアップデート
        ***************************************/
        updateApp : function( app ){

            this.text    = '更新中...'
            this.loading = true

            var db = new URLSearchParams()
            db.append( 'app' ,  JSON.stringify( app ) )
            axios.post( process.env.VEGEMEDIA + 'updateApp' , db ).then( function(result){


            }.bind(this)).catch((err) => { console.dir(err); }).finally(function() {

                this.loading = false
                this.text    = '読み込んでいます...'
                
            }.bind(this))

        },

        deleteApp : function( app ){

            var db = new URLSearchParams()
            db.append( 'app' ,  JSON.stringify( app ) )
            axios.post( process.env.VEGEMEDIA + 'deleteAccount' , db ).then( function(result){

                console.dir( result.data )

            }.bind(this)).catch((err) => { console.dir(err); }).finally( async function() {

                this.appList = await this.getAppSettings()
                await this.clearNewAccount()

            }.bind(this))

        },




        /* 配信先アカウントの新規追加
        ***************************************/
        addNewAccount : function(){

            this.text    = 'アカウント追加中...'
            this.loading = true

            var db = new URLSearchParams()
            db.append( 'app' ,  JSON.stringify( this.newAccount ) )
            axios.post( process.env.VEGEMEDIA + 'addAccount' , db ).then( function(result){


            }.bind(this)).catch((err) => { console.dir(err); }).finally( async function() {

                this.appList = await this.getAppSettings()
                await this.clearNewAccount()

            }.bind(this))

        },

        clearNewAccount : function(){

            this.newAccount = {
                app_id               : null,
                app_name             : '',
                app_code             : '',
                channel_access_token : '',
                channel_id           : '',
                channel_secret       : '',
                client_code          : '',
                client_name          : '',
                liff_id              : ''
            }
            this.loading = false
            this.text    = '読み込んでいます...'
            this.addNewAccountDialog = false

        },







    },

};
</script>
<style>
#account-list{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: flex-start; align-items: flex-start;
    padding:2em;
}

#account-list .el-collapse{
    width:100%;
}

#account-list .el-collapse-item__content{
    pading:2em !important;
    background:#FFF;
}

#account-list .el-collapse-item__header.is-active{
    font-weight:bold;
    color:rgb(34, 103, 255);
}

label[account-editor]{
    width:100%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

label[account-editor] span{
    width:15em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    padding-right:1.5em;
}

</style>
