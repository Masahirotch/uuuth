<template>
     <div article-editbox>
        <Loader :text="text" v-if="loading" />

        <!-- //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
        <div article-edit>
            <h4>編集</h4>

            <div edit-area>

                <!-- ステータス変更と保存ボタン -->
                <div pb-1 change-status>
                    <div status-select>
                        <select v-model="article.status" @change="changeStatus">
                            <option value="false">下書き</option>
                            <option value="true">公開中</option>
                        </select>
                    </div>

                    <span>で</span>

                    <div status-btn>
                        <el-button type="primary" size="small" style="margin-top:0;" @click="updateArticle" :disabled="!isActive">保存する</el-button>
                    </div>
                </div>

                <!-- 記事カテゴリ -->
                <div mt-2>
                    <h5 required>記事カテゴリ</h5>
                    <el-radio-group v-model="category" @change="categoryChange" size="small">
                      <el-radio-button :label="category.categy_id" v-for="category in categories">{{category.category_name}}</el-radio-button>
                    </el-radio-group>
                </div>

                <!-- 記事タイトルとメイン画像 -->
                <div title-main mt-2 mb-3>
                    <div>
                        <h5 center mb-05 required>記事タイトル</h5>
                        <el-input type="textarea" placeholder="記事タイトル" v-model="article.article_title"
                          :autosize="{ minRows: 2, maxRows: 3}" maxlength="40" show-word-limit>
                        </el-input>
                    </div>

                    <div>
                        <h5 center required>メイン写真</h5>
                        <ImageUploaderWithDeleteMini
                            @uploadImage="uploadFile"
                            ref="imgUploader"
                            :currentImage = "article.main_image.thumb_url"
                            @fileDelete="fileDelete"
                        />
                    </div>
                </div>

                <!-- 並び替えにコンテンツ追加 -->
                <el-button size="mini" @click="addSection">
                    <span add-text>追加する</span>
                    <span add-front>&raquo;</span>
                </el-button>

                <!-- コンテンツ追加ボックス -->
                <MsgRegBox
                    @fromRegbox="fromRegbox"
                    :value="content"
                    :position="false"
                    ref="regBox"/>



            </div>

        </div>


        <!-- //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
        <div article-sort>
            <h4>並び替え</h4>

            <!-- Draggable content -->
            <draggable v-model="editSection">
                <MediaSortItem :section="section" v-for="(section) in editSection" :key="section.position" @sectionDelete="sectionDelete"/>
            </draggable>

        </div>


        <!-- //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
        <div article-preview>
            <h4>プレビュー</h4>

            <MediaCard :content="article" :cardtext="article.article_title" />

            <hr>

            <div preview-box>

                <div main-image>
                    <img :src="previewMainImage">
                </div>

                <div article-type center-center :class="article.category_code">{{article.category_code}}</div>

                <div header-title v-html="nl2br(article.article_title)"></div>

                <div v-for="item in editSection" preview-content>

                    <div v-if="isText(item)" v-html="nl2br(item.content)" content-text></div>
                    <div v-if="isImage(item)" content-image><img :src="itemSrc(item)"></div>
                    <div v-if="isMovie(item)" >
                        <video controls preload="none" :poster="itemSrc(item)" style="width:100%;">
                            <source :src='itemFull(item)' type='video/mp4'>
                        <p>動画を再生するには、videoタグをサポートしたブラウザが必要です。</p>
                        </video>
                    </div>

                </div>

            </div>

        </div>



    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import draggable from 'vuedraggable'
import {util} from '../mixin/mixinUtils'

export default {

    // vue draggable component /////////////////
    components: { draggable },

    mixins:[util],

    props : [ 'article' ],

    data() {

        return {

            loading : false,
            text    : '処理しています...',

            // 入力されたコンテンツ
            content   : '',
            category  : this.article.category_id,


            // vue draggable 設定
            editSection : this.article.section,


        }

    },

    watch:{

        article: {
            handler: function (val) {

                console.dir( 'this.article' )
                console.dir( val )

            },
            deep: true
        },

        /* 並び替え完了時またはデータ削除時にpositionをindexで振り直す
        ****************************************************************/
        editSection : {
            handler: function (val) {

                val.forEach( ( item , index ) => {

                    item.position = index

                })

                this.article.section = val

            },
            deep: true
        }


    },


    mounted(){

        //console.dir( this.article )

    },

    computed: {
        ...mapGetters( 'admin'   , ['adminUser']),
        ...mapGetters( 'article' , ['articles' ,'categories' , 'apps' ]),

        previewMainImage : function(){

            return ( this.article.main_image.thumb_url != void 0 )? this.article.main_image.thumb_url : '/dummy.jpg'

        },

        // 保存できる状態か
        isActive : function(){

            return ( this.article.main_file_id != 132 && this.article.category_id != '' && this.article.article_title != '' )? true : false

        }

    },

    methods:{
        ...mapActions( 'admin'   , ['setAdminUser']),
        ...mapActions( 'article' , ['setArticles' , 'setCategories' , 'setApps' ]),

        /* カテゴリの変更
        **************************************************/
        categoryChange : function(e){

            var target = JSON.parse( JSON.stringify( this.categories ) )
            var targetCategory = target.find( c => c.categy_id == Number(e) )

            this.article.category_id = Number(e)
            this.article.category_code = targetCategory.category_code
            this.article.category_name = targetCategory.category_name

        },

        /* メイン画像データの更新があった場合
        ***************************************************/
        uploadFile : function( res ){

            this.article.main_file_id = res.file_id
            this.article.main_image = res

        },
        /* メイン画像データが削除された場合
        ***************************************************/
        fileDelete : function( res ){

            this.article.main_file_id = 132
            this.article.main_image = res

        },

        /* コンテンツ登録ボックスからの戻り値
        **************************************************/
        fromRegbox : function( content ){

            // 登録されたコンテンツ
            this.content = content

        },

        /* article.section に追加する
        **************************************************/
        addSection : function(){

            console.clear()

            if( this.content == '' || this.content.origin_name == '' ){

                this.$message.error('登録する内容が入力されていません。');

            }
            else{

                // text
                if( this.content.file_id == 0 ){

                    var type = 'text';

                }
                // image or movie
                else{

                    var type = ( this.content.file_url.includes('.mp4') )? 'movie':'image'

                }

                var content = ( type == 'text' )? this.content.origin_name : null
                var file    = ( type == 'text' )? [] : this.content
                var file_id = this.content.file_id

                var addSection = {
                    article_id : this.article.article_id,
                    content    : content,
                    file       : file,
                    file_id    : file_id,
                    position   : this.article.section.length,
                    section_id : null,
                    type       : type
                }

                this.editSection.push( addSection )
                this.content = ''

                // 更新時データクリア ////////////////////////////////
                if( this.$refs.regBox != void 0 ){

                    this.$refs.regBox.fileClear();

                }
                if( this.$refs.regBox.$refs.imgUploader != void 0 ){

                    this.$refs.regBox.$refs.imgUploader.fileClear();

                }
                if( this.$refs.regBox.$refs.movUploader != void 0 ){

                    this.$refs.regBox.$refs.movUploader.fileClear();

                }

            }

        },

        /* article.section から sectionデータを削除する
        **************************************************/
        sectionDelete : function(section){

            var newSections = this.editSection.filter( s => {

                if( s.position != section.position ) return s

            })

            this.editSection = newSections

        },

        /* 記事ステータスの変更
        **************************************************/
        changeStatus : function( e ){

            this.article.status = this.toBoolean(e.target.value)

        },
        // str to bool
        toBoolean : function (data) {
          return data.toLowerCase() === 'true';
        },


















        //////////// アップデート処理 ////////////////////////////////////////////////////////////////////////

        /* 記事の更新
        **************************************************/
        updateArticle : function(){

            this.loading = true

            if( this.article.article_id != null ){

                this.updateExistingArticle()

            }
            else{

                this.addNewArticle()

            }



        },


        updateExistingArticle : function(){

            console.dir( '更新' )

            var article = JSON.parse( JSON.stringify( this.article ) )
            article.status       = ( article.status )? 1:0
            article.publish_date = this.$dayjs( article.publish_date ).format('YYYY-MM-DD HH:mm:ss')

            var db = new URLSearchParams()
            db.append( 'article' , JSON.stringify( article ) )
            axios.post( process.env.VEGEMEDIA + 'updateArticle' , db ).then( function(result){

                console.dir( result.data )

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){  this.loading = false; }.bind(this))

        },


        // 新規追加
        addNewArticle : function(){

            console.dir( '新規追加' )

            var article = JSON.parse( JSON.stringify( this.article ) )
            article.status       = ( article.status == 'true' )? 1:0
            article.publish_date = this.$dayjs( article.publish_date ).format('YYYY-MM-DD HH:mm:ss')

            var db = new URLSearchParams()
            db.append( 'article' , JSON.stringify( article ) )
            axios.post( process.env.VEGEMEDIA + 'addNewArticle' , db ).then( function(result){

                console.dir( result.data )
                this.article.article_id = result.data.article_id

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){  this.loading = false; }.bind(this))




        },











        //////////// HELPER ////////////////////////////////////////////////////////////////////////////////

        /* TEXT or FILE 判定
        **************************************************/
        isText : function( item ){

            return ( item.type == 'text' )? true:false

        },

        /* image 判定
        **************************************************/
        isImage : function( item ){

            return ( item.type == 'image' )? true:false

        },

        /* movie 判定
        **************************************************/
        isMovie : function( item ){

            return ( item.type == 'movie' )? true:false

        },

        /* サムネイルを返す
        **************************************************/
        itemSrc : function( item ){

            return item.file.thumb_url

        },

        itemFull : function(item){

            return item.file.file_url

        },


        /* 日付フォーマット変更
        **************************************************/
        contentDate : function(){

            return ( this.article.publish_date != null )? this.$dayjs( this.article.publish_date ).format('YYYY.MM.DD') : '未設定'
        },

    },

};
</script>
<style scoped>
[article-editbox]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    max-height:calc(100vh - 8em);
}

[article-editbox] > *{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    padding:1em;

}

[article-editbox] h4{margin-bottom:1em;}

[article-editbox] > *[article-edit]{border-right:1px solid #ccc;width:40%;overflow-y: scroll;width:50%;}
[article-editbox] > *[article-sort]{border-right:1px solid #ccc;width:27%;overflow-y: scroll;max-width:330px;}
[article-editbox] > *[article-preview]{width:33%;overflow-y: scroll;max-width:330px;}






/* edit-area inner */
[edit-area]{position:relative;}
[edit-area] button{ position:absolute;right:1em;margin-top:1.2em; }
[edit-area] button [add-text]{display:block;margin-right:1em;}
[edit-area] button [add-front]{font-size:2em;position:absolute;top:-0.1em;width:3em;display:block;margin-left:1em;}




[change-status]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

[change-status] > *{
    width:100%;
}

[change-status] > [status-select]{
    width:10em;
}
[change-status] > span{
    width:2em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
[change-status] > [status-btn]{
    width:7em;
    position:relative;
    left:0;
}

h5[required]{}
h5[required]::after{
    content:"必須";
    font-size:10px;
    display:inline-block;
    border:1px solid #f15205;
    padding:0.2em;
    color:#f15205;
    margin-left:0.4em;
    border-radius:0.2em;
}


[change-status] select{
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 32px;
    line-height: 32px;
    outline: none;
    padding: 0 10px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
}


label.el-radio-button{
    position: relative;
    display: inline-block !important;
    outline: 0;
    padding:0 !important;
    width:auto;
}

[title-main]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-self: stretch;-ms-flex-item-align: stretch;align-self: stretch;
}

[title-main] > *:nth-of-type(1){width:60%;}
[title-main] > *:nth-of-type(2){width:40%;}




/* article-preview */
[article-editbox] > *[article-preview] .el-card{overflow: unset;}

[preview-box]{margin-top:3em;width:100%;}

[main-image]{
    position:relative;
}

[main-image] img{
    width:100%;
}
[header-title]{
    padding:1em 0.4em;
    text-align:center;
    color:#454545;
    font-weight:600;
}
[preview-content]{max-width:100%;padding:0.5em;}
[preview-content] img{width:100%;}
[preview-content] [content-text]{padding:1em 0.3em;font-size:11px;text-align:justify;}


[article-type]{
    padding-top:2em;
    text-align:center;
    text-transform:capitalize;
    font-weight:200;
    letter-spacing:0.1em;
    font-size:min( 4vmin , 18px );
}
[article-type].farmers{
    color: #21b74f;
}
[article-type].recipe{
    color: #ee808b;
}
[article-type].restaurant{
    color: #f7b467;

}

</style>
