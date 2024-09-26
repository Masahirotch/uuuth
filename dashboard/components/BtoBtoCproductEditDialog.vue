<template>
    <div>

        <div product-editor>
            <span>商品名</span>
            <el-input placeholder="" v-model="product.product_name"></el-input>
        </div>

        <div product-editor>
            <span>商品コード</span>
            <el-input placeholder="" v-model="product.product_code"></el-input>
        </div>

        <div product-editor>
            <span>商品説明</span>
            <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6}" placeholder="" v-model="product.product_detail"></el-input>
        </div>

        <div product-editor>
            <span>商品写真</span>
            <div style="width:250px;text-align:left;">
                <ImageUploaderWithDeleteMini :currentImage="productImage" @uploadImage="uploadImage" ref="imgUploader"/>
            </div>
        </div>

        <div product-editor>
            <span>商品価格</span>
            <el-input placeholder="" v-model="product.product_price" class="num-input yen-input" @keypress="validate" @input="product.product_price=format(product.product_price)"></el-input>
        </div>

        <div product-editor>
            <span>商品形態</span>
            <el-radio-group v-model="product.product_unit" size="mimi">
              <el-radio-button label="piece" >個</el-radio-button>
              <el-radio-button label="set">セット</el-radio-button>
              <el-radio-button label="kg">Kg</el-radio-button>
              <el-radio-button label="pac">パック</el-radio-button>
              <el-radio-button label="cs">箱</el-radio-button>
            </el-radio-group>
        </div>


        <div product-editor>
            <span>関連生産者DB記事</span>

            <el-select v-model="selectedArticle" multiple placeholder="複数選択" style="width:100%;">
                <el-option
                v-for="item in article_set"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>

        </div>


        <div product-editor>

            <span break><span>商品最大在庫</span><br><span style="font-size:11px;">最大値を入力</span></span>

            <el-input placeholder="" v-model="product.quantity_limit" class="num-input unit-input" @keypress="validate" @input="product.quantity_limit=format(product.quantity_limit)"></el-input>
            
            <span>販売個数 : <strong pl-05 pr-05>{{product.quantity_now}}</strong>個</span>
        
            <div status-switch ml-2>
                <span switch-false :class='{ active : !isQuantityLimit }'>未設定</span>
                <el-switch
                  v-model="product.quantity_limit_flg"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  @change="changeLimt">
                </el-switch>
                <span switch-true :class='{ active : isQuantityLimit }'>設定中</span>
            </div>

        </div>



        <div product-editor>

            <span>商品販売期間</span>

            <el-date-picker
              v-model="startEnd"
              type="datetimerange"
              range-separator="To"
              start-placeholder="販売開始日時"
              end-placeholder="販売終了日時">
            </el-date-picker>
        
            <div status-switch ml-2>
                <span switch-false :class='{ active : !isTimeLimit }'>未設定</span>
                <el-switch
                  v-model="product.limited_time_flg"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  @change="changeLimt">
                </el-switch>
                <span switch-true :class='{ active : isTimeLimit }'>設定中</span>
            </div>

        </div>


      <div center pt-4 pb-4>
        <el-button type="primary" @click="updateProduct" size="medium" :disabled="!isUpdate">この商品データを更新</el-button>
      </div>


    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'
export default {

    mixins:[util],

    props : [ 'product' ],

    data() {

        return {

            article_set     : [],
            selectedArticle : [],
            startEnd        : [ this.product.limited_time_start , this.product.limited_time_end ],

        }

    },
    watch:{

        product : {

            handler: function (val) {

                //console.log(val)
                
            },
            deep: true
        
        },

        startEnd : function( val ){

            console.dir( val )

            this.product.limited_time_start = (val && val[0])? this.$dayjs( val[0] ).format('YYYY-MM-DD HH:mm:ss') : ''
            this.product.limited_time_end   = (val && val[1])? this.$dayjs( val[1] ).format('YYYY-MM-DD HH:mm:ss') : ''

        },

        selectedArticle : function(val){

            this.product.articles = val.map( a => {

                if( a.article_id != void 0 ){
                
                    return a
                
                }
                else{

                    return { article_id : a , product_id : this.product.product_id }

                }

            })

        },


    },
    mounted(){

        this.article_set = this.articles.map( a => {

            var label = ( a.article_title.length > 10 )? a.article_title.substr(0, 10) + '...' : a.article_title

            return {
                value : a.article_id,
                label : label
            }

        })

        this.selectedArticle = this.product.articles.map( a => {

            return a.article_id

        })



    },
    
    computed: {

        productImage : function(){

            return ( this.product.product_image.thumb_url != void 0 )? this.product.product_image.thumb_url : '/dummy.jpg'

        },
        isQuantityLimit : function(){

            return this.product.quantity_limit_flg

        },
        isTimeLimit : function(){

            return this.product.limited_time_flg

        },

        isUpdate : function(){


            console.dir( this.product )

            if(

                this.product.product_name   == '' ||
                this.product.product_detail == '' ||
                this.product.product_code   == '' ||
                this.product.product_price  == '' ||

                ( this.product.limited_time_flg   == true && ( this.product.limited_time_end == '' || this.product.limited_time_start == '' ) ) ||

                ( this.product.quantity_limit_flg == true && this.product.quantity_limit < 1 )

            ){

                return false

            }

            else{

                return true

            }


        },


        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders' , 'articles' ]),

    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' , 'setArticles' ]),


        uploadImage : function( file ){

            this.product.product_photo_id = file.file_id
            this.product.product_image = file

        },

        updateProduct :function(){

            this.$emit( 'updateProduct' , this.product )

        },


        /* 商品在庫機能ステータスの変更
        ***************************/
        changeLimt : function(){

            //this.$emit( 'changeSaleStatus' , this.product )

        },











    },
};
</script>
<style scoped>
[product-edit]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    padding:1em;
    border-radius:0.4em;
    border:1px solid #efefef;
    margin-bottom:1em;
    background:#FFF;
    filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.15) );
}

[list-box]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

[list-image]{
    width:60px;
    height:60px;
}
[list-image] img{
    width:100%;
    height:100%;
    object-fit : cover;
}

/* edit */

div[product-editor]{
    width:100%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    padding-top:1.6em;
    padding-bottom:1.6em;
}

div[product-editor] > span{
    width:15em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row wrap;flex-flow:row wrap;
    -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    padding-right:1.5em;
}

div[product-editor] > span > span{
    display:block;
    width:100%;
    line-height:1.1em;
    text-align:right;
}






div[product-editor] > span + *{
    max-width: calc(100% - 15em);
}

div[product-editor] > span + *.num-input{
    max-width:9em !important;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}
div[product-editor] > span + *.yen-input::after{
     content:"円";
     display:inline-block;
     height:40px;
     line-height:40px;
     padding-left:1em;
}



div[product-editor] > span + *.unit-input::after{
     content:"個";
     display:inline-block;
     height:40px;
     line-height:40px;
     padding-left:1em;
}

.num-input .el-input__inner{
    text-align: right !important;
}


.el-radio-group label{
    padding: 0; 
    display: inline; 
}

[status-switch]{
    display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

[status-switch] [switch-false],[status-switch] [switch-true]{
    font-size:13px;
    font-weight:bold;
    display:inline-block;
    padding:0.2em 0.5em 0 0.5em;
    color:#CCC;
}

[status-switch] [switch-false].active{
    color:rgb(255, 73, 73);
}
[status-switch] [switch-true].active{
    color:rgb(19, 206, 102);
}



</style>