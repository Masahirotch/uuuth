<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />
        <div id="content-header" split>
            <h3>販売 商品管理</h3>
            <el-button type="success" size="mini" mr-3 text-white @click="addNewProduct">+ 商品を追加</el-button>
        </div>


        <div c-product-loop id="c-product-loop">


            <!-- ////////////////////////// -->
            <div c-product-box v-for="(item, index) in this.productList_for_child" >

                <div c-product-image><img :src="mainThumb(item)"></div>            

                <div c-product-summary>

                    <div c-product-captions>

                        <dl>
                            <dt>商品名</dt>
                            <dd>{{item.product_name}}</dd>
                        </dl>

                        <dl>
                            <dt>商品サイズ</dt>
                            <dd>{{item.size_name}}</dd>
                        </dl>

                        <dl>
                            <dd flglist>
                                <span v-if="item.in_limitedtime">期間限定</span>
                                <span v-if="item.in_limitedquantity" >数量限定</span>
                            </dd>
                        </dl>

                    </div>

                    <div c-product-description>
                        <div>{{item.product_description}}</div>
                    </div>

                    <div c-product-flgs>
                        <div>
                            <el-switch
                              v-model="item.in_sales"
                              active-text="販売中"
                              inactive-text="販売停止中"
                              active-color="#0093E9"
                              inactive-color="#cccccc"
                              @change="cngSales(item)"
                              >
                            </el-switch>
                        </div>
                        <div>
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="viewItem(index)">編集する</el-button>
                            <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="deleteAlert(item)" ml-1i></el-button>
                        </div>
                    </div>
                
                </div>

                <el-dialog
                  :title                 = "item.product_name"
                  :visible.sync          = "item.view"
                  :close-on-click-modal  = "false"
                  :close-on-press-escape = "false"
                  :show-close            = "false"
                  big-dialog
                  v-if="item.view">

                  <BtoCproductEdit
                        :item           = "item"
                        :item_index     = "index"
                        @updateProduct  = "updateProduct"
                        @updateThumb    = "updateThumb"
                        @deleteItem     = "deleteItem"
                        @addProduct     = "addProduct"
                  />

                </el-dialog>

            </div>
            <!-- ////////////////////////// -->

        </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    data: () => {
        return {

            loading : true,
            text    : '処理中...',

            productList : '',
            productList_for_child : '',
            dummy       : '/dummy.jpg',
            //apps        : '',

        }
    },

    created : async function(){

        console.clear()

        await this.getApps()        
        await this.getProducts()

    },

    beforeMount : async function() {

    },

    mounted : function(){
        
        

    },
    updated(){


    },
    computed: {

        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref' , 'appList' , 'products' , 'order' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref' , 'setAppList' , 'setProducts' , 'setOrder' , 'setArticles' ]),

        /* APPリストを取得
        ***************************************************/
        getApps : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.B2C_API + 'getAppList' , db ).then( function(result){

                this.setAppList(result.data)

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally( function(){ }.bind(this))

        },

        /* 商品リストを取得
        ***************************************************/
        getProducts : function(){

            var db = new URLSearchParams()
            axios.post( process.env.B2C_API + 'getAllProducts' , db ).then( function(result){

                this.productList = JSON.parse( JSON.stringify( result.data ))
                this.productList_for_child = JSON.parse( JSON.stringify( this.productList ))

                console.dir('getProduct')
                console.dir(this.productList)

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally( function(){ 

                this.getArticles()

            }.bind(this))

        },

        /* 記事リストを取得
        ***************************************************/
        getArticles : function(){

            var db = new URLSearchParams()
            axios.post( process.env.B2C_API + 'getArticles' , db ).then( function(result){

                this.setArticles(result.data)

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally( function(){ 

                this.loading = false

            }.bind(this))

        },

        /* 販売フラグの変更
        ***************************************************/
        cngSales : function(item){

            this.loading = true

            var flg = ( item.in_sales )? 1 : 0
            var db = new URLSearchParams()
            db.append( 'product_id' , item.product_id )
            db.append( 'in_sales'   , flg )
            axios.post( process.env.B2C_API + 'changeSalesFlag' , db ).then( function(result){

                console.dir( result.data )

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally( function(){ this.loading = false; }.bind(this))

        },

        /* 一覧のアイキャッチ
        ***************************************************/
        mainThumb : function( item ){

            return ( item.main.thumb_url )? item.main.thumb_url : this.dummy
            
        },

        /* main画像が変更された場合、一覧のアイキャッチも変更する
        ***************************************************/
        updateThumb : function(val){

            var temp = val.index.split('-')
            var product_id = Number(temp[0])
            var target = this.productList.find( p => p.product_id == product_id )
            target.product_main = val.file_id
            target.main = val

        },

        /* 商品ダイアログ表示
        ***************************************************/
        viewItem : function(index){
            //this.productList_for_child.splice()
            this.productList_for_child[index].view = true
        },

        /* 子コンポーネントから受け取った商品情報をアップデート
        ***************************************************/
        updateProduct : function( item ){

            console.dir(item)

            this.loading = true

            var product = JSON.parse( JSON.stringify( item ))


            product.in_limitedquantity = (product.in_limitedquantity)? 1:0
            product.in_limitedtime     = (product.in_limitedtime)? 1:0
            product.in_sales           = (product.in_sales)? 1:0

            product.sales_start = ( product.sales_start && product.sales_start != '0000-00-00 00:00:00' )? this.$dayjs( product.sales_start ).format('YYYY-MM-DD HH:mm:ss'):null
            product.sales_end   = ( product.sales_end && product.sales_end != '0000-00-00 00:00:00' )? this.$dayjs( product.sales_end   ).format('YYYY-MM-DD HH:mm:ss'):null

            var prices = product.prices
            product.prices.map( price => {

                price.price      = Number( price.price )
                price.tax_rate   = Number( price.tax_rate )
                price.active_flg = ( price.active_flg )? 1:0
                return price              

            })

            var db = new URLSearchParams()
            db.append( 'product' , JSON.stringify( product ) )
            axios.post( process.env.B2C_API + 'updateProduct' , db ).then( function(result){

                console.dir( result.data )
                this.getProducts()

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){ this.loading = false; }.bind(this))

        },

        /* 商品の削除
        ***************************************************/
        deleteAlert : function(item){

            this.$confirm(`<p>「${item.product_name}」を削除しますか？<br>この操作は取り消すことができません。`, '削除しますか？', {
              confirmButtonText : '削除する',
              cancelButtonText  : 'キャンセル',
              dangerouslyUseHTMLString: true,
              type: 'error'
            }).then(() => {

                this.deleteProduct(item)

            }).catch(() => { });

        },

        deleteProduct : function(item){

            this.loading = true
            var db = new URLSearchParams()
            db.append( 'product_id' , item.product_id )
            axios.post( process.env.B2C_API + 'deleteProduct' , db ).then( function(result){

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally( function(){ 

                this.getProducts();

            }.bind(this))

        },

        /* 子コンポーネントから受け取った新規商品情報を追加
        ***************************************************/
        addProduct : function(item){

            console.dir( 'addProduct' )
            console.dir(item)

            var product = JSON.parse( JSON.stringify( item ))

            this.loading = true

            product.in_limitedquantity = (product.in_limitedquantity)? 1:0
            product.in_limitedtime     = (product.in_limitedtime)? 1:0
            product.in_sales           = (product.in_sales)? 1:0

            product.sales_start = ( product.sales_start && product.sales_start != '0000-00-00 00:00:00' )? this.$dayjs( product.sales_start ).format('YYYY-MM-DD HH:mm:ss'):null
            product.sales_end   = ( product.sales_end && product.sales_end   != '0000-00-00 00:00:00' )? this.$dayjs( product.sales_end   ).format('YYYY-MM-DD HH:mm:ss'):null

            product.prices.map( price => {

                price.price      = Number( price.price )
                price.tax_rate   = Number( price.tax_rate )
                price.active_flg = ( price.active_flg )? 1:0
                return price              

            })

            console.dir( product )

            var db = new URLSearchParams()
            db.append( 'product' , JSON.stringify( product ) )
            axios.post( process.env.B2C_API + 'addProduct' , db ).then( function(result){

                console.dir( result.data )
                this.getProducts()
                
            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){ 

                this.loading = false

            }.bind(this))


        },











        /* 新規商品情報を追加
        ***************************************************/
        addNewProduct : function(){

            var newProduct = {
                in_limitedquantity  : false,
                in_limitedtime      : false,
                in_sales            : false,
                product_code        : '',
                product_description : '',
                product_id          : 0,
                product_main        : 1,
                product_name        : null,
                product_pict2       : null,
                product_pict3       : null,
                product_stock       : null,
                product_subname     : '',
                product_unit        : null,
                prices              : [],
                sales_end           : '0000-00-00 00:00:00',
                sales_start         : '0000-00-00 00:00:00',
                main                : [],
                pict2               : [],
                pict3               : [],
                view                : true,
                article_id          : 0,
                size_code           : null
            }

            this.productList.push( newProduct )

            this.setProducts( JSON.parse( JSON.stringify( this.productList )) )
            this.productList_for_child = JSON.parse( JSON.stringify( this.productList ))

        },

        /* 新規に追加した商品情報がデータ登録処理されていない場合は破棄する
        ***************************************************/
        deleteItem : function(index){

            this.productList_for_child[index].view = false
            var p_list  = JSON.parse( JSON.stringify( this.productList ))
            this.productList = p_list.filter( p => p.product_id > 0 )
            this.setProducts( JSON.parse( JSON.stringify( this.productList )) )
            this.productList_for_child = JSON.parse( JSON.stringify( this.productList ))

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
#c-product-loop{
    padding:2em;
}

[c-product-box]{
    border:1px solid #ccc;padding:0.6em;border-radius:6px;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    margin-bottom:1em;
}

[c-product-image]{
    width:110px;margin-right:1em;
}
    [c-product-image] img{width:110px;height:110px;object-fit:cover;display:block;}

[c-product-summary]{
    width:100%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

    [c-product-captions]{
        display: -webkit-flex; display: -ms-flexbox; display: flex;
        -ms-flex-flow:row nowrap; flex-flow:row nowrap;
        -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
        -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    }
            [c-product-captions] dl{
                display: -webkit-flex; display: -ms-flexbox; display: flex;
                -ms-flex-flow:row nowrap; flex-flow:row nowrap;
                -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
                -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
                width:100%;
                padding-top:0.2em;
                border-bottom:1px dashed #ccc;
            }
            [c-product-captions] dl:nth-of-type(1){width:50%;}
            [c-product-captions] dl:nth-of-type(2){width:50%;}

            [c-product-captions] dl dt{ font-size:14px;font-weight:bold;}
            [c-product-captions] dl dt::after{content:" : ";display:inline-block;margin:0 0.5em;}
            [c-product-captions] dl dd{ font-size:16px;margin-top:-0.1em; }


    [c-product-description]{
        padding:0.5em;
        width:100%;
    }

        [c-product-description] *{font-size:14px;}
        [c-product-description] > div{
            height:2.7em;overflow-y:hidden;position:relative;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;

        }

        [c-product-captions] dl dd[flglist]{
            display: -webkit-flex; display: -ms-flexbox; display: flex;
            -ms-flex-flow:row nowrap; flex-flow:row nowrap;
            -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
            -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
            margin-top: -0.8em;
            width:100%;
        }

        [c-product-captions] dl dd[flglist] span{
                font-size:11px;padding:0.2em 0.6em;border:1px solid #ccc;margin:0 0.2em;color:#666;
        }


    [c-product-flgs]{
        display: -webkit-flex; display: -ms-flexbox; display: flex;
        -ms-flex-flow:row nowrap; flex-flow:row nowrap;
        -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
        -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;

    }
    [c-product-flgs] > div:nth-of-type(1){
        display: -webkit-flex; display: -ms-flexbox; display: flex;
        -ms-flex-flow:row nowrap; flex-flow:row nowrap;
        -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
        -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    }
    [c-product-flgs] .el-switch__label span{color:#888;}
    [c-product-flgs] .el-switch__label--right.is-active span{color:#0093E9;}
    [c-product-flgs] .el-switch__label--left.is-active span{color:#222222;}

[price]::after{
    content:"円";
    font-size:0.8em;
    display:inline-block;
    margin-left:0.1em;
}
</style>
