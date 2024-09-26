<template>
    <div>
        <Menu />

        <Loader :text="text" v-if="loading" />

        <h2 id="content-header">
            <h3>野菜情報一般向け受注</h3>

            <div id="sort-box">
                <div ml-2i mr-1i id="order-search">
                    <select select-month v-model="selectedMonth">
                        <option value="" disabled selected>年 / 月</option>
                        <option :value="item.value" v-for="item in yearmonth">{{item.label}}</option>
                    </select>

                    <select select-day v-model="selectedDay">
                        <option value="" disabled selected>-</option>
                        <option :value="day.value" v-for="day in days">{{day.label}}</option>
                    </select>

                    <el-input placeholder="受注番号 / LINE名" v-model="filterText" class="order-filter"></el-input>
                    <el-button size="mini" icon="el-icon-search" circle type="success" @click="getFilterOrder"></el-button>

                    <el-button size="mini" icon="el-icon-refresh" circle @click="resetSearch" style="margin-left:1em;"></el-button>
                </div>
            </div>
        </h2>


        <div order-list>

            <dl orderlist-header>
                <dd order-check> <span>全て</span><el-checkbox v-model="allChecked"></el-checkbox> </dd>
                <dd order-id>受注番号</dd>
                <dd order-date>受注日</dd>
                <dd order-linename>LINE名</dd>
                <dd order-app>販売先</dd>
                <dd order-detail>受注内容</dd>
            </dl>
            <BtoBtoCorderItem v-for="order in orderList" :detail="order" @updatedOrder="updatedOrder"/>
        </div>

        <div operation-btns>
            <div split-right>
                <el-button size="mini" type="primary" @click="downloadComfirm" >チェックした受注をCSVでダウンロード</el-button>
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

            loading : true,
            text    : '読み込み中...',

            appList     : [],
            productList : [],
            orderList   : [],

            // 検索文字列
            filterText  : '',

            // 選択されているステータス変更
            selectedMonth : '',

            selectedDay   : '',

            // 全てを選択しているか
            allChecked : false,

            // 検索年月
            yearmonth : [],

            // 検索日
            days      : [],


            // 出力CSVヘッダー
            csvFields : [
                                'order_id'     ,
                                'line_name'    ,
                                'order_shop'   ,
                                'order_date'   ,
                                'order_price'  ,
                                'order_product',
                                'unit_price'   ,
                                'quantity'     ,
                        ],


        }
    },

    watch: {

        allChecked : function(val){

            if( this.orderList != '' ){

                this.orderList = this.orderList.map( o => { 
                
                    o.checked = val; return o; 

                })

            }

        },

        selectedMonth : function(val){

            var lastDay  = this.$dayjs( val ).endOf('month').format('DD')
            var daysList = []

            for( let i = 1; i <= lastDay; i++ ){

                daysList.push( {value : ( '00' + i ).slice( -2 ) , label : i + '日' } )

            }

            this.days = daysList

        }

    },

    created(){

        console.clear()

    },
    mounted : async function(){

        if( this.appList.length == 0 || this.productList.length == 0 || this.orders.length == 0 ){

            this.appList      = await this.getAppSettings()
            this.productList  = await this.getProducts()
            this.orderList    = await this.getOrders()
            await this.endInit()
        
        }

        this.makeYearMonth()

    },

    computed: {

        
        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' , 'setArticles' ]),


        //////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////

        /* 配信先アカウント一覧の取得
        ***************************************/
        getAppSettings : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getAppSettings' , db ).then( function(result){

                this.setApps( result.data )

                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* オーダーリストの取得
        ***************************************/
        getOrders : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getOrders' , db ).then( function(result){

                this.setOrders( result.data )
                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* 商品リストの取得
        ***************************************/
        getProducts : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.VEGEMEDIA + 'getProducts' , db ).then( function(result){

                this.setProducts( result.data )
                return JSON.parse( JSON.stringify( result.data ))

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* イニシャライズ 終了
        ***************************************/
        endInit : function(){

            this.loading = false

        },

        /* 検索フィルターを全て解除して初期状態に戻す
        ***************************************/
        resetSearch : async function(){

            this.loading       = true
            this.filterText    = ''
            this.selectedMonth = ''
            this.selectedDay   = ''
            this.allChecked    = false
            this.orderList  = await this.getOrders()
            await this.endInit()


        },

        //////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////

        /* 年/月 選択肢の作成
        ***************************************/
        makeYearMonth : function(){
      
            this.yearmonth.push( {value : '2021-10' , label : '2021年10月' } )
            var loop     = '2021-10'

            var today    = this.$dayjs().format('YYYY-MM-DD')
            var endMonth = this.$dayjs().endOf('month').format('YYYY-MM')

            for( let i = 0; i < 20; i++ ){
            
                var newOption = { value : this.$dayjs(loop).add( 1 , 'month').format('YYYY-MM') , label : this.$dayjs(loop).add( 1 , 'month').format('YYYY年MM月') }

                this.yearmonth.push( newOption )

                loop = this.$dayjs(loop).add( 1 , 'month').format('YYYY-MM')

                if( loop == this.$dayjs().format('YYYY-MM') ) {

                    break

                }

            }

        },



        //////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////

        /* 再検索
        ***************************************/
        getFilterOrder : function(){

            this.loading = true

            console.dir( this.selectedDay )

            var searchDate = ( this.selectedDay != '' )? this.selectedMonth + '-' + this.selectedDay : this.selectedMonth


            var db = new URLSearchParams()
            db.append( 'selectedMonth' , searchDate )
            db.append( 'filterText'    , this.filterText  )
            axios.post( process.env.VEGEMEDIA + 'getOrdersBySearch' , db ).then( function(result){

                this.allChecked = false

                this.setOrders( result.data )
                this.orderList = JSON.parse( JSON.stringify( result.data ))
                this.loading = false

            }.bind(this)).catch((err) => { console.dir(err); })

        },







        /****************************************************************************************************************
        * オーダーアップデート後の処理
        ****************************************************************************************************************/
        updatedOrder : function( status ){

            this.getOrders( status )
            this.getOrderCount()

        },








        /****************************************************************************************************************
        * CSVのダウンロード
        ****************************************************************************************************************/

        downloadComfirm : function(){

            const targetOrder = this.orderList.filter( o => o.checked )
            

            if( targetOrder.length == 0 ){

                this.$alert( 
                    'ダウンロード対象が選択されていません。' , 
                    {
                        confirmButtonText : 'OK',
                        type              : 'error'

                    }
                );

            }

            else{

                this.$confirm(
                    'チェックした' + targetOrder.length + '件をダウンロードしますか？', 
                    'ダウンロード', 
                    {
                        confirmButtonText : 'ダウンロード',
                        cancelButtonText  : 'キャンセル',
                        type              : 'info '
                    }
                ).then(() => {

                    this.createB2cloudCSV( targetOrder )

                }).catch(() => {
             
                });

            }

        },

        createB2cloudCSV : async function( targetOrder ){

            console.dir('createB2cloudCSV')
            console.dir(targetOrder)

            var order_list = []


            var createOrderCsv = await targetOrder.map( order => {

                var cart = order.order_cart.map( cart => {
    
                    var targetApp = this.apps.find( app => app.app_id == order.order_app_id )
                    var targetProduct = this.products.find( product => product.product_id == cart.product_id )

                    var re = {
                        order_id      : order.order_id,
                        line_name     : order.displayName,
                        order_shop    : targetApp.app_name,
                        order_date    : this.$dayjs(order.order_date).format('YYYY-MM-DD'),
                        order_price   : order.order_price,
                        order_product : targetProduct.product_name,
                        unit_price    : cart.price,
                        quantity      : cart.quantity
                    }

                    order_list.push( re )

                })

                return order

            })

            await console.dir(order_list)

            var filename = this.$dayjs().format('YYYY-MM-DD') + '.csv'

            var db = new URLSearchParams()
            await db.append( 'order_fields' , JSON.stringify( this.csvFields ) )
            await db.append( 'order_list' , JSON.stringify( order_list ) )
            await db.append( 'filename' , filename )
            await axios.post( process.env.CSV + 'downloadB2B2CorderCSV' , db ).then( function(result){

                console.dir( '--- ▼ CSV ▼ ---' )
                console.dir( result.data )
                console.dir( '--- ▲ CSV ▲ ---' )

                const data = result.data;
                const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
                const blob = new Blob([bom, data], { type: "text/csv" });

                const url = (window.URL || window.webkitURL).createObjectURL(blob);
                //ダウンロード用にリンクを作成する
                const download = document.createElement("a");
                //リンク先に上記で生成したURLを指定する
                download.href = url;
                //download属性にファイル名を指定する
                download.download = filename;
                //作成したリンクをクリックしてダウンロードを実行する
                download.click();
                //createObjectURLで作成したオブジェクトURLを開放する
                (window.URL || window.webkitURL).revokeObjectURL(url);

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){  }.bind(this))

        },










    },

};
</script>
<style scoped>
h3 > span[filter-caption]{font-size:12px;padding-left:1em;}
[order-list]{padding:1em;}
[orderlist-header]{
    width:100%;
    background:#eee;padding:0.3em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
[orderlist-header] dd{
    padding:3px 1em;
    font-weight:bold;
    font-size:14px;
}
[orderlist-header] dd[order-check]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
[orderlist-header] dd[order-check] > span{font-size:0.8em;}
[orderlist-header] dd[order-check] label.el-checkbox{padding : 1px;width: auto;}

dd[order-check]{width:5%;}
dd[order-id]{ width:10%; }
dd[order-date]{ width:10%; }
dd[order-linename]{ width:15%; }
dd[order-app]{ width:20%; }
dd[order-detail]{ width:40%;}





[operation-btns]{
    padding:2em 1em 4em 1em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

#content-header h3{
    min-width:15em;
}

#sort-box{
    width:calc(100% - 15em);
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

#sort-box > div#sort-button{
    width:calc( 100% - 15em );
    padding-left:2em;
}

#sort-box > div#order-search{
    width:100%; 
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: flex-start; justify-content: flex-start;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

#sort-box > div#order-search .order-filter{
    margin-right:1em;
    max-width: 20em;
}

#sort-box > div#order-search select{
    width: 12em;
}


[linebtn][mini-size]{
    height:28px;
    padding:0;
    border:none;
}

[linebtn][mini-size] [linebtn-overlay]{
    font-size: 13px;
    height:28px;
    border-radius: 0.3em;

}

select[select-mini]{
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: 13px;
    height: 28px;
    line-height: 28px;
    outline: 0;
    padding: 0 15px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
}

[operation-btns] [split-left] span{
    font-size:13px;
    display:inline-block;
}

[select-month]{
    margin-top: 1px;
    margin-right: 1em; 
    height: 40px;
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width: 100%;
}


#sort-box > div#order-search select[select-day]{
    margin-top: 1px;
    margin-right: 1em; 
    height: 40px;
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width:5em;
}






</style>
