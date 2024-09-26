<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />

        <!-- ///// Article Search Header /////////////////////////////////////////////////////////////////////////////// -->
        <div header-split>

            <h3>記事管理</h3>

            <div article-search>

                <label >
                    <span input-caption>タイトル</span>
                    <el-input placeholder="" v-model="articleTitle"></el-input>
                </label>

                <label >
                    <span input-caption>カテゴリ</span>
                    <el-select v-model="category" multiple placeholder="Select">
                        <el-option
                        v-for="item in categoryOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                    </el-select>
                </label>

                <label >
                    <span input-caption>ステータス</span>
                    <el-select v-model="status" multiple placeholder="Select">
                        <el-option
                        v-for="item in statusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                    </el-select>
                </label>
                
            </div>

            <el-button type="success" size="mini" mr-3 text-white @click="addArticleSetApp">+ 記事を追加</el-button>

        </div>


        <!-- ///// Article Lists ///////////////////////////////////////////////////////////////////////////////// -->
        <div inner>
            <Article v-for="article in articleList" :article="article" @deleteArticle="getArticles"/>
        </div>


        <!-- ///// Add Article Dialog //////////////////////////////////////////////////////////////////////////// -->
        <el-dialog
          title="新規記事を追加する"
          :visible.sync="addNewArticleDialog"
          width="30%"
          center>
          <h5>記事の追加先選択</h5>
          <div>

            <el-radio-group v-model="selectApp" size="small" @change="selectAppForNewApp">
                <el-radio :label="app.app_id" v-for="app in apps">{{app.app_name}}</el-radio>
            </el-radio-group>

          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addNewArticleDialog = false">キャンセル</el-button>
            <el-button type="primary" @click="addArticle" :disabled="!isSelectApp">追加する</el-button>
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

            loading : true,
            text    : '読み込み中...',


            //// 検索項目 ///////////////////////////////////
            
            // 検索文字列
            articleTitle : '',

            // カテゴリ
            category : '',

            categoryOptions: [
                { value: 'farmers'    , label: '生産者'}, 
                { value: 'recipe'     , label: 'レシピ'},
                { value: 'restaurant' , label: 'レストラン'},
            ],


            // カテゴリ
            status : '',

            statusOptions: [
                { value: 'active'     , label: '公開中'}, 
                { value: 'draft'      , label: '下書き'},
            ],
            

            //// 記事取得 ///////////////////////////////////
            articleList : [],



            //// 新規追加 ///////////////////////////////////
            
            //ダイアログ
            addNewArticleDialog : false,

            // 追加先
            selectApp : '',

            // 追加先が選択されているか
            isSelectApp : false,





        }

    },
    created(){

        console.clear()


    },
    mounted : async function(){

        await this.getArticles()
        await this.getCategories()
        await this.getAppSettings()
        this.loading = false

    },

    computed: {
        ...mapGetters( 'admin'   , ['adminUser']),
        ...mapGetters( 'article' , ['articles' ,'categories' , 'apps' ]),

    },
    methods:{
        ...mapActions( 'admin'   , ['setAdminUser']),
        ...mapActions( 'article' , ['setArticles' , 'setCategories' , 'setApps' ]),

        /////////// [カテゴリリスト] ///////////////////////////////////////////////////////////////

        /* カテゴリリストの取得
        *******************************************/
        getCategories : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.MEDIA + 'getCategories' , db ).then( function(result){

                this.setCategories(result.data)

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /////////// [記事取得] ///////////////////////////////////////////////////////////////

        /* 記事一覧の取得
        ***************************************/
        getArticles : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.MEDIA + 'getArticles' , db ).then( function(result){

                console.dir( result.data )

                //this.setArticles( result.data )
                //this.articleList = JSON.parse( JSON.stringify( result.data ) )

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /////////// [アプリセッティングの取得] /////////////////////////////////////////////////

        /* 記事一覧の取得
        ***************************************/
        getAppSettings : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.MEDIA + 'getAppSettings' , db ).then( function(result){

                this.setApps( result.data )

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /////////// [新規追加] ///////////////////////////////////////////////////////////////

        /* 新規に作成する記事をどのアカウントに追加するか
        ********************************************/
        addArticleSetApp : function(){

            this.addNewArticleDialog = true

        },


        selectAppForNewApp : function(e){

            if( this.selectApp != '' ) { this.isSelectApp = true; }

        },





        /* 記事の追加
        ***************************************/
        addArticle : function(){

            var appSetting = this.apps.find( a => a.app_id == this.selectApp ) 


            var newArticle = {
                app_config      : appSetting,
                app_id          : this.selectApp,
                article_id      : null,
                article_title   : '',
                browsing        : 0,
                browsing_user   : 0,
                category_code   : '',
                category_id     : '',
                category_name   : '',
                closed          : 0,
                deliveries      : 0,
                dialog_delete   : false,
                dialog_edit     : false,
                dialog_sendline : false,
                main_file_id    : 132,
                main_image      : {
                    file_id: 132,
                    file_url: process.env.DUMMY_IMAGE,
                    origin_name: "dummy.jpg",
                    thumb_url: process.env.DUMMY_THUMB_IMAGE
                },
                publish_date    : null,
                reach           : 0,
                status          : false,
                update_date     : this.getNow(),
            }

            this.articleList.push( newArticle )

            this.addNewArticleDialog = false

        },




        /////////// [ HELPER ] ///////////////////////////////////////////////////////////////

        getNow : function(){

          var d     = new Date();
          var year  = d.getFullYear();
          var month = d.getMonth() + 1;
          var day   = d.getDate();
          var hour  = ( '00' + d.getHours() ).slice( -2 );
          var min   = ( '00' + d.getMinutes() ).slice( -2 );
          var sec   = ( '00' + d.getSeconds() ).slice( -2 );
          return `${year}-${month}-${day} ${hour}:${min}:${sec}`

        },




    },

};
</script>
<style>
[header-split]{
    font-size: 16px;
    line-height: 3em;
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    z-index: 9;
    padding: 0.5em;
    background: #f0f0f1;
    margin-top: -1px;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    width:100%;
}

[header-split] h3{
    display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    min-width:6em;
    padding-left:1em;
}


[article-search]{
    width:100%;padding-left:1em;padding-right:1em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

[article-search] label{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: flex-start; align-items: flex-start;
    position:relative;
    width:auto;
    padding: 12px 6px;
}

[article-search] label > span[input-caption]{
    position:absolute;
    font-size:12px;
    top:-1em;
}
[article-search] label > span[input-caption] + *{
    margin-top:0.3em;
}




</style>
