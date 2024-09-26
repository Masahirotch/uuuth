<template>
     <div article-box>
        
        <div article-image @click="editArticle"><img :src="mainimage"></div>
        
        <div article-title v-html="articleTitle(article.article_title)" @click="editArticle"></div>
        
        <div article-category :class="targetCategoryCode">
            <span category-icon>{{targetCategoryName}}</span>
        </div>
        
        <div article-publish>{{days(article.update_date)}}</div>
        
        <div article-status>
            <span v-bind:class="{ draft : !status }">下書き</span>
            <el-switch v-model="article.status" @change="updateStatus"></el-switch>
            <span v-bind:class="{ public : status }">公開中</span>
        </div>
            
        <div article-delete>
            <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteArticle"></el-button>
        </div>
        
        <div article-sendline>
            <div linebtn @click="sendLine" v-if="article.status">
                <div linebtn-overlay>LINEで配信</div>        
            </div>
            <div linebtn btn-invalid v-if="!article.status">
                <div linebtn-overlay>LINEで配信</div>        
            </div>
        </div>

        <!-- 記事編集ダイアログ -->
        <el-dialog
          :visible.sync="article.dialog_edit"
          big-dialog>

            <div pt-2>
                <BtoBtoCinArticleEditBox :article="article"/>
            </div>

        </el-dialog>


        <!-- 削除確認ダイアログ -->
        <el-dialog
          :visible.sync="article.dialog_delete"
          delete-box
          >

            <MediaCard :content="article" :cardtext="article.article_title"/>

            <span slot="footer" class="dialog-footer">
                <span style="margin-right:2em;">削除しますか？</span>
                <el-button @click="article.dialog_delete = false">閉じる</el-button>
                <el-button type="danger" @click="articleDelete">削除する</el-button>
            </span>

        </el-dialog>


        <!-- 配信確認ダイアログ -->
        <el-dialog
          :visible.sync="article.dialog_sendline">

            <div>
                <MediaCard :content="article" :cardtext="article.article_title"/> 
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button @click="article.dialog_sendline = false">閉じる</el-button>
                <el-button type="primary" @click="sendMessageToLine">配信する</el-button>
            </span>

        </el-dialog>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'
export default {

    mixins:[util],

    props : [ 'article' ],

    data() {

        return {
            // LINE送信時のanalysis データ            
            analy : '',
        }

    },
    watch:{

        article : {
            handler: function (val) {
                
            },
            deep: true
        }

    },
    mounted(){

        

    },
    
    computed: {
        ...mapGetters( 'admin'   , ['adminUser']),
        ...mapGetters( 'article' , ['articles' ,'categories' , 'apps' ]),

        mainimage : function(){

            return ( this.article.main_image.thumb_url != void 0)? this.article.main_image.thumb_url : '/dummy.jpg'

        },

        status : function(){

            return this.article.status

        },

        targetCategoryCode : function(){

            if( this.article.category_id != '' ){

                var findTarget = JSON.parse( JSON.stringify( this.categories ) )
                return( findTarget )? findTarget.find( c => c.categy_id == this.article.category_id ).category_code : ''

            }
            else{

                return ''

            }

        },

        targetCategoryName : function(){

            if( this.article.category_id != '' ){

                var findTarget = JSON.parse( JSON.stringify( this.categories ) )
                return( findTarget )? findTarget.find( c => c.categy_id == this.article.category_id ).category_name : ''

            }
            else{

                return ''

            }

        },

    },
    methods:{
        ...mapActions( 'admin'   , ['setAdminUser']),
        ...mapActions( 'article' , ['setArticles' , 'setCategories' , 'setApps' ]),

        /////////// [配信ステータス] ///////////////////////////////////////////////////////////////

        /* 配信ステータスの更新　（　下書き | 公開中　）
        *******************************************/
        updateStatus : function(){

            var db = new URLSearchParams()
            db.append( 'article_id' , this.article.article_id )
            db.append( 'status' , this.article.status )
            axios.post( process.env.VEGEMEDIA + 'changeStatus' , db ).then( function(result){

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /////////// [記事削除] ///////////////////////////////////////////////////////////////

        /* 記事の削除ボックス表示
        *******************************************/
        deleteArticle : function(){

            this.article.dialog_delete = !this.article.dialog_delete

        },

        /* 記事の削除
        *******************************************/
        articleDelete : async function(){

            await this.deleteFunction()
            await this.$emit('deleteArticle')

        },

        /* 記事の削除DB処理
        *******************************************/
        deleteFunction : async function(){

            var db = new URLSearchParams()
            db.append( 'article_id' , this.article.article_id )
            return await axios.post( process.env.VEGEMEDIA + 'articleDelete' , db ).then( function(result){

            }.bind(this)).catch((err) => { console.dir(err); })

        },


        /////////// [LINE メッセージ送信] ///////////////////////////////////////////////////////////////

        /* LINE 送信ボックスをオープン
        *******************************************/
        sendLine : function(){

            this.article.dialog_sendline = !this.article.dialog_sendline

        },

        /* LINE 送信アクション
        *******************************************/
        sendMessageToLine : async function(){

            var messages = await this.createMessage()
            await this.$emit('sendLine' , messages )

        },

        /* 送信メッセージの作成
        ******************************************/
        createMessage : function(){


            var flex = {
              "type": "bubble",
              "hero": {
                "type": "image",
                "url": this.article.main_image.thumb_url,
                "size": "full",
                "aspectMode": "cover",
                "action": {
                  "type": "uri",
                  "uri": ""
                }
              },
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": this.article.article_title,
                    "weight": "bold",
                    "size": "sm",
                    "align": "start",
                    "wrap": true,
                    "maxLines": 3
                  }
                ],
                "action": {
                  "type": "uri",
                  "label": this.article.article_title,
                  "uri": "" 
                }
              }
            }

            var message = [{
                        "type"     : "flex",
                        "altText"  : this.article.article_title,
                        "contents" : flex
                    }]

            return { message : message , article : this.article }



        },

        /* LINE 送信
        *******************************************/
        sendAction : function( messages ){



        },

        /* Analy データを更新
        *******************************************/
        updateAnaly :function(){

            this.article.deliveries = JSON.parse( JSON.stringify( this.analy[0].deliveries ) )
            this.article.reach = JSON.parse( JSON.stringify( this.analy[0].reach ) )

            this.$alert('LINEメッセージを配信しました', '成功', {
              confirmButtonText: 'OK',
              callback: action => {

                this.article.dialog_sendline = false
              
              }
            });

        },



        /////////// [記事編集] ///////////////////////////////////////////////////////////////

        /* 記事の編集
        *******************************************/
        editArticle : async function(){

            // 記事セクションの取得
            await this.getArticleSectionsById()

            // 記事編集ダイアログの表示
            await this.openArticle()

        },

        /* 記事セクションの取得
        *******************************************/
        getArticleSectionsById : async function(){

            var db = new URLSearchParams()
            db.append( 'article_id' , this.article.article_id )
            return await axios.post( process.env.VEGEMEDIA + 'getArticleSectionsById' , db ).then( function(result){

                this.article.section = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* 記事編集ダイアログの表示
        *******************************************/
        openArticle : function(){

            this.article.dialog_edit = !this.article.dialog_edit
            return

        },


        articleTitle : function( title ){

            if( title == '' ){

                return 'まだ未登録です<br>クリックして編集してください'

            }
            else{


                return this.nl2br( title )

            }



        },




        ////////////////////////////////////////////////////////////////////////
        /////// Helper Functions ///////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////

        // 日付フォーマット
        days : function( value ){

            return ( value )? this.$dayjs(value).format('YYYY.MM.DD'):'未設定'

        },









    },
    filters:{

        number_format : function ( value ) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

        categories : function( value ){

            if( value == 'restaurant' ) return 'レストラン'
            if( value == 'farmers'    ) return '生産者'
            if( value == 'recipe'     ) return 'レシピ'

        }


    },

};
</script>
<style scoped>
[article-box]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    width:100%;padding:0.4em;border:1px solid #ccc;border-radius:0.2em;
    margin-bottom:0.3em;
}

[article-box] > div{
    padding:0 0.5em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
}

[article-box] > [article-image]{width:100px;padding:0;}
[article-box] > [article-image] img{width:100%;}
[article-box] > [article-image] img:hover{cursor:pointer;}

[article-box] > [article-title]{width:18em;font-size:14px;font-weight:600;line-height:1.5em;}
[article-box] > [article-title]:hover{cursor:pointer;color:#409EFF;}


[article-box] > [article-category]{padding:1em;}

    .recipe > [category-icon]{background:#ee808b;}
    .restaurant > [category-icon]{background:#f7b467;}
    .farmers > [category-icon]{background:#21b74f;}
        [category-icon]{padding:0.2em;font-size:11px;font-weight:600;border-radius:2em;color:#FFF;text-align:center;min-width:6em;}

[article-box] > [article-publish]{font-size:14px;font-weight:600;}

[article-box] > [article-status]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

    [article-box] > [article-status] span{font-size:13px;font-weight:600;padding:0 0.4em;color:#ccc;}
    [article-box] > [article-status] span.draft{color:#333;}
    [article-box] > [article-status] span.public{color:#409EFF;}




[article-box] > [article-image]{min-width:100px;width:100px;}
[article-box] > [article-title]{min-width:18em;width:100%;}
[article-box] > [article-category]{min-width:8em;}
[article-box] > [article-publish]{min-width:8em;}
[article-box] > [article-status]{min-width:10em;}
[article-box] > [article-browsing]{min-width:6em;}
[article-box] > [article-delete]{width:2.8em;}
[article-box] > [article-deliveries]{min-width:6em;}
[article-box] > [article-sendline]{min-width:10em;}

[article-box] > [article-publish],
[article-box] > [article-browsing],
[article-box] > [article-delete],
[article-box] > [article-deliveries],
[article-box] > [article-sendline]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;

}


.el-dialog__wrapper[delete-box] .el-dialog{
    max-width:500px !important;
    width:500px !important;
}

[chat-bubble]{
    border:1px solid #eee;
    max-width:300px;
    margin:0 auto 1em auto;
    padding:0.8em 1em;
    font-weight:600;
    border-radius:0 0.8em 0.8em 0.8em;
    background:#FFF;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

</style>