<template>
<div>

    <div appsetting-body style="min-height:80vh;margin-bottom:3em;">

        <!-- ////////////////////////////////////////////////////////// -->
        <dl dl-half>
            <dt required-label>商品名</dt>
            <dd><el-input placeholder="商品名" v-model="item.product_name"></el-input></dd>

            <dt required-label>商品サイズ</dt>
            <el-radio-group v-model="item.size_code">
            <el-radio-button label="S" >Sサイズ</el-radio-button>
            <el-radio-button label="M">Mサイズ</el-radio-button>
            <el-radio-button label="L">Lサイズ</el-radio-button>
            </el-radio-group>
        </dl>

        <dl dl-half>
            <dt required-label>商品コード<br>（半角英数）</dt>
            <dd><el-input placeholder="商品コード（半角英数）" v-model="item.product_code"></el-input></dd>
        </dl>

        <!-- ////////////////////////////////////////////////////////// -->
        <dl dl-triple>

            <dt required-label style="width:8em;">キャプション</dt>
            <dd style="width:15%;"><el-input placeholder="キャプション" v-model="item.product_subname"></el-input></dd>

            <dt required-label style="width:8em;">商品説明</dt>
            <dd style="width:35%;">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 5}"
                  placeholder="商品説明が入ります"
                  v-model="item.product_description">
                </el-input>
            </dd>

            <dt v-if="isShowArticleLink" style="width:6em;" >リンク</dt>
            <dd v-if="isShowArticleLink" style="width:20%;">
                <select article-link @change="selectArticle">
                    <option value="0" :selected="item.article_id == 0">設定しない</option>
                    <option :value="article.article_id" v-for="article in articles" :selected="item.article_id == article.article_id">{{article.article_title}}</option>
                </select>
            </dd>

        </dl>

        <!-- ////////////////////////////////////////////////////////// -->
        <dl>
            <dt required-label>商品写真</dt>
            <dd tri-split>

                <div>
                    <div>メイン写真</div>

                    <ImageUploaderWithIndex
                        @uploadImage="uploadFile"
                        ref="imgUploader"
                        :currentImage = "item.main.thumb_url"
                        :index        = "item.product_id + '-1'"
                    />

                </div>

                <div>
                    <div>写真2</div>

                    <ImageUploaderWithIndex
                        @uploadImage="uploadFile"
                        ref="imgUploader"
                        :currentImage = "item.pict2.thumb_url"
                        :index        = "item.product_id + '-2'"
                    />


                </div>

                <div>
                    <div>写真3</div>


                    <ImageUploaderWithIndex
                        @uploadImage="uploadFile"
                        ref="imgUploader"
                        :currentImage = "item.pict3.thumb_url"
                        :index        = "item.product_id + '-3'"
                    />

                </div>

            </dd>
        </dl>

        <!-- ////////////////////////////////////////////////////////// -->
        <dl dl-one-two pt-2i pb-3i v-if="false">

                <dt>数量限定販売<br><el-switch v-model="item.in_limitedquantity"></el-switch></dt>
                <dd row-nowrap>
                    <span pr-1i pl-1i>在庫数</span><el-input placeholder="在庫数" v-model="item.product_stock" text-right></el-input>
                </dd>

                <dt>期間限定販売<br><el-switch v-model="item.in_limitedtime"></el-switch></dt>
                <dd row-nowrap>

                    <el-date-picker
                      v-model="startend"
                      type="datetimerange"
                      range-separator="To"
                      start-placeholder="Start date"
                      end-placeholder="End date">
                    </el-date-picker>

                </dd>

        </dl>


        <!-- ////////////////////////////////////////////////////////// -->

        <BtoCeditPrice
            :productData = "item"
        />

    </div>


    <div right pr-1i>
        <span slot="footer" class="dialog-footer">
            <el-button @click="close">閉じる（編集をキャンセル）</el-button>
            <el-button type="primary" v-if="isUpdate" @click="sendParent">内容を更新</el-button>
        </span>
    </div>


</div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'item', 'item_index' ],

    data() {

        return {

            startend : '',
            selectedArticle : ''

        }

    },
    watch:{

        startend : function(val){

            if( val && val.length > 1 ){

                this.item.sales_start = this.$dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
                this.item.sales_end   = this.$dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')

            }

        },

    },
    mounted(){

        this.init()

    },

    computed: {

        isUpdate : function(){

            if( this.item.product_code == '' ) return false
            if( this.item.product_description == '' ) return false
            if( this.item.product_name == '' ) return false
            if( this.item.product_subname == '' ) return false
            if( !this.item.main.thumb_url ) return false
            if( this.item.size_code == void 0 ) return false

            return true

        },

        isShowArticleLink: function () {
          return process.env.SHOW_ARTICLE_LINK?.toLowerCase() == 'true';
        },

        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref' , 'appList' , 'products' , 'order' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref' , 'setAppList' , 'setProducts' , 'setOrder' , 'setArticles' ]),

        init : function(){

            ///// 販売期間のセット ////////////////////
            var start_date = ''
            var end_date = ''

            if( this.item.sales_start != null && this.item.sales_start != '0000-00-00 00:00:00' ){

              var y = this.$dayjs(this.item.sales_start).year()
              var m = this.$dayjs(this.item.sales_start).month()
              var d = this.$dayjs(this.item.sales_start).date()
              var h = this.$dayjs(this.item.sales_start).hour()
              var min = this.$dayjs(this.item.sales_start).minute()

              start_date = new Date(y, m, d, h, min)

            }
            if( this.item.sales_end != null && this.item.sales_end != '0000-00-00 00:00:00' ){

              var end_y = this.$dayjs(this.item.sales_end).year()
              var end_m = this.$dayjs(this.item.sales_end).month()
              var end_d = this.$dayjs(this.item.sales_end).date()
              var end_h = this.$dayjs(this.item.sales_start).hour()
              var end_min = this.$dayjs(this.item.sales_start).minute()

              end_date = new Date(end_y, end_m, end_d, end_h, end_min)

            }

            if( start_date != '' && end_date != '' ){

                this.startend = [ start_date , end_date ]

            }


        },

        /* 画像データの更新があった場合
        ***************************************************/
        uploadFile : function( res ){

            var target = res.index.split('-');
            var key = ( Number(target[1]) == 1 )? 'product_main' : 'product_pict' + target[1]

            this.item[key] = res.file_id

            if( Number(target[1]) == 1 ){

                this.item.main.thumb_url = res.thumb_url

            }

        },

        uploadImage : function( index ){

            var key = ( index == 1 )? 'product_main' : 'product_pict' + index

            //this.$emit( 'updateThumb' , index )

            console.dir(index)

        },

        /* 画像データの削除があった場合
        ***************************************************/
        fileDelete : function( res ){

            var target = res.split('-');
            var key = ( Number(target[1]) == 1 )? 'product_main' : 'product_pict' + target[1]
            this.item[key] = null

        },

        /* 既存の登録データを削除
        ***************************************************/
        currentDelete: function( res ){

            var target = res.split('-');

            switch ( Number(target[1]) ){

              case 1:
                this.item.product_main = null
                this.item.thumb_main = null

                break;

              case 2:
                this.item.product_pict2 = null
                this.item.thumb_pict2 = null
                break;

              case 3:
                this.item.product_pict3 = null
                this.item.thumb_pict3 = null
                break;

            }


        },

        /* フォームデータを親コンポーネントへ送信
        ***************************************************/
        sendParent : function(){

            if( this.item.product_id > 0 ){

                this.item.product_stock = Number( this.item.product_stock )
                this.$emit( 'updateProduct' , this.item )

            }
            else{

                this.item.product_stock = Number( this.item.product_stock )
                this.$emit( 'addProduct' , this.item )

            }

        },

        /* 閉じる
        ***************************************************/
        close : function(){

            this.$emit('deleteItem' , this.item_index )

        },

        selectArticle : function(e){

            console.dir(e.target.value)

            this.item.article_id = Number( e.target.value )

        },

    },

    filters:{

        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

    },


};
</script>
<style>
[row-nowrap]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack:justify;justify-content: space-between;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
[row-nowrap] > span{display:inline-block;white-space: nowrap;}

.el-date-editor .el-range-separator{
    width: 2em;
}


select[article-link]{
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
}

.el-radio-group label{
    padding: 0;
    display: inline;
}

</style>
