<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />

        <div page-content>


          <div main-content>

              <h2 content-header between-content>
                  <span>日吉の野菜情報受注リスト</span>
                  <div>
                      <el-select v-model="selectMonth" placeholder="年・月を選択">
                        <el-option
                          v-for="item in monthList"
                          :key="item"
                          :label="jpDate(item)"
                          :value="item"
                          >
                        {{jpDate(item)}}
                        </el-option>
                      </el-select>
                  </div>
              </h2>

              <div select-days>

                  <el-radio
                    v-for="day in daysInMonth"
                    days-btn
                    v-model="selectDay"
                    :label="day"
                  >{{daySlash(day)}}</el-radio>
              </div>

              <div data-list inner>

    			<table class="list-item" datalist-table >
    				<tr v-for="(item , index) in selectedOrder" v-if="item.isView">
    					<td>{{item.order_id}}</td>
    					<td>
    						{{jpDateMonthDay(item.orderDate)}}
    					</td>
    					<th>{{jpDateDay(item.orderDate)}}</th>
    					<th>{{item.user.bizName}} ({{item.user.displayName}})</th>
    					<td>点数 : {{item.orderNum}}点</td>
    					<td>
    						<p v-for="(oreder) in item.orderArray">{{oreder.productName}} x {{oreder.quantity}}</p>
    					</td>

    				</tr>
    			</table>

              </div>

              <div right v-if="isItemView()" dl-btn>

                <div linebtn mr-3>
                    <div linebtn-overlay>LINEで商品データを送信</div>        
                </div>

                <el-button type="primary" plain @click="download">csvダウンロード</el-button>
                <!--
                  <VueJsonToCsv :json-data="csvData" :csv-title="csvName" :labels="labels">
                      <el-button type="primary" plain @click="download">csvダウンロード</el-button>
                  </VueJsonToCsv>
                -->
              </div>

              <div center v-if="!isItemView()" dl-btn>
                  <div>指定日時の受注データはありません</div>
              </div>

          </div>

        </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import VueJsonToCsv from "vue-json-to-csv"

export default {
    components: { VueJsonToCsv },
    data: () => {
        return {

            loading       : true,
            text          : '読み込み中...',
            monthList     : [],
            selectMonth   : '',
            selectedOrder : [],
            daysInMonth   : [],
            selectYear    : '',
            selectDay     : '',

            // Download csv
            csvData: [],
            // CSV LABEL
            labels: {
                ID          : { title: "order_id" },
                bizName     : { title: "事業所名" },
                shopCode    : { title: "店舗コード" },
                shop_tel    : { title: "電話" },
                displayName : { title: "担当者" },
                orderDate   : { title: "受注日時" },
                productName : { title: "受注商品" },
                quantity    : { title: "受注数" },
            },
            csvName : 'csvData'

        }
    },
    created(){

        console.clear()

    },
    watch: {

        /* 年月を選択
        ***************************************/
        selectMonth : function(value){

            console.clear()

            // 日にちをリセット
            this.selectDay = ''

            // 年をセット
            this.selectYear = this.$dayjs(value).format('YYYY')

            var temp = []
            // 全てのデータから該当月間のデータのみを抽出して新たな配列を作成
            Object.entries(this.order).map( (entry) => {
                if( entry[0] ==  value ){
                    this.selectedOrder  = JSON.parse( JSON.stringify( entry[1] ) )
                }
            })

            // daysInMonth()で該当月の最終日を取得
            var days = this.$dayjs(value).daysInMonth()
            var month = this.$dayjs(value).format('M')

            // 1日から最終日までを配列に
            this.daysInMonth = []
            for (let i = 1; i <= days; i++) {
                this.daysInMonth.push( month + '-' + i )
            }

        },

        /* 日にちを選択
        ***************************************/
        selectDay : function(value){

            if( this.selectDay == '' ) return

            // 条件判定でisViewを制御
            let compare　= this.$dayjs(value).format('MM-DD')
            //  月間データから該当月間のデータのみを抽出
            this.selectedOrder.forEach( item => {

                if( this.$dayjs(item.orderDate).format('MM-DD') == compare ){
                    item.isView = true
                }
                else{
                    item.isView = false
                }

            })

        }

    },

    mounted : function(){

        this.loading = false
        this.getOrder()

    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'order' , ['order']),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'order' , ['setOrder']),

        /* 全てのオーダーリストを取得
        ***************************************/
        getOrder : function(){

            const params = new URLSearchParams()
            params.append( 'token'  , process.env.INFO_TOKEN )
            params.append( 'action' , 'getInfoOrder' )

            axios.post( process.env.API_URL , params )
            .then( function(result){

                this.setOrder(result.data)
                this.setMonthList()
                console.dir('取得したオーダーリスト')
                console.dir(this.order)


            }.bind(this))
            .catch(function(error) {
              console.error( "Error writing document: ", error );
            }.bind(this))
            .finally(function(){

                this.loading = false

            }.bind(this))

        },

        /* CSVのダウンロード
        ***************************************/
        download : function() {

            // 表示データのみを抽出
            let csvOrderList = this.selectedOrder.filter( item => item.isView == true )

            //データ初期化
            this.csvData = []

            if( this.selectDay != '' ){
                var selectdaydata = this.$dayjs(this.selectDay).format('-DD')
            }
            else{
                var selectdaydata = ''
            }

            this.csvName = this.selectMonth + selectdaydata

            var csv = []

            csvOrderList.forEach( val => {

                var order_date = this.$dayjs(val.orderDate).format('YYYY/MM/DD')

                console.dir(val.user.shopCode)

                var shop_code  = ( val.user.shopCode != null )? val.user.shopCode:'なし'

                Object.entries( val.orderArray ).map( (entry) => {

                    csv.push(
                        {
                            shopCode    : shop_code,
                            orderDate   : order_date,
                            productCode : entry[1].productCode,
                            quantity    : entry[1].quantity
                        }
                    )


                })

            })

            //////////////////////////
            var json = csv
            var fields = Object.keys(json[0])
            var replacer = function(key, value) { return value === null ? '' : value } 
            var csv = json.map(function(row){
              return fields.map(function(fieldName){
                return JSON.stringify(row[fieldName], replacer)
              }).join(',')
            })
            csv.unshift(fields.join(',')) // add header column
            csv = csv.join('\r\n');
            csv = csv.replace(/\"/g,"")
            let firstRowEndPos = csv.indexOf('\n', 0);
            csv = csv.substr( firstRowEndPos + 1 );

            console.dir(csv)



            const filename = this.csvName + '.csv';
            const data = csv;
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



/*
            csv.forEach( (data) => {

                var temp = {
                    ID          : data.ID,
                    bizName     : data.bizName,
                    shopCode    : data.shopCode,
                    shop_tel    : data.shop_tel,
                    displayName : data.displayName,
                    orderDate   : data.orderDate,
                    productName : data.productName,
                    quantity    : data.quantity
                }

                this.csvData.push(temp)

            });

*/

        },

        /* 月間リストをセット
        ***************************************/
        setMonthList : function(){

            let list = []
            Object.keys(this.order).forEach(function (key) {
                list.push(key)
            })

            this.monthList = list

        },

        /* 表示データの有無を判定
        ***************************************/
        isItemView : function(){

            let v = this.selectedOrder.find( item => item.isView == true )

            if ( v === void 0 ) return false
            if ( v !== void 0 ) return true

        },

        /* 日付フォーマット関係
        ***************************************/
        jpDate : function(value){

            return this.$dayjs(value).format('YYYY年M月')

        },
        jpDateMonthDay : function(value){

            return this.$dayjs(value).format('YYYY-MM-DD')

        },
        jpDateDay : function(value){

            return this.$dayjs(value).format('M月D日')

        },
        daySlash : function(value){

            return value.replace('-' , '/')

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
[content-header][between-content]{
    display: flex;flex-flow:row nowrap;justify-content: space-between;align-items: center;
    padding: 0.5em 1.5em;
    margin-bottom:1em;
    border-bottom:1px solid #ccc;
    position:sticky;
    top:0;
    background:#FFF;
    z-index:9;
    height:62px;
}
[data-list]{
    padding-bottom:1em;
}
table.list-item{width:100%;}

table.list-item tr{border-bottom:2px solid #eee;}
table.list-item tr:nth-of-type(1){border-top:2px solid #eee;}

table.list-item tr:nth-child(odd) {background:#FFF;}
table.list-item tr:nth-child(even) {background:#f5f5f5;}

table.list-item tr th,table.list-item tr td{padding:1em;font-size:min(3.6vmin , 14px);font-weight:400;
border-left:1px solid #eee;}
table.list-item tr th{text-align:left;font-weight:600;}
table.list-item tr td{}
table.list-item tr td p{
    font-size: 13px;
    line-height: 1.5;
    margin: 1em 0;
}
[select-days]{padding:0.7em;
display: flex; flex-flow:row wrap; justify-content: flex-start; align-items: center;}
[select-days] label.el-radio{
    display : inline-flex;flex-flow:column nowrap; justify-content: center; align-items: center;
    width:5em;margin:5px;padding:0;
}
[days-btn] .el-radio__inner{display:none;}
[days-btn] .el-radio__label{padding:8px 15px;border:1px solid #ddd;width:5em;
display : inline-flex;flex-flow:column nowrap; justify-content: center; align-items: center;}
[days-btn] .el-radio__input.is-checked+.el-radio__label{
    background:#000;color:#FFF;
}
[dl-btn]{
    padding:1em 1em 5em 1em;
}
.el-button--primary.is-plain span{color: #409EFF;}
.el-button--primary.is-plain:hover span{color:#FFF;}
</style>
