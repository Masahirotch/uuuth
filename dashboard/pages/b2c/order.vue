<template>
    <div>

        <Menu />

        <Loader :text="text" v-if="loading" />

        <h2 id="content-header">
            <h3>B2C受注管理 <span filter-caption>{{activeStatus|acviveTitle}}</span></h3>

            <div id="sort-box">

                <div id="sort-button">
                    <el-button size="small" @click="getOrders('new')" >新規受注 ({{viewCount('new')}})</el-button>
                    <el-button size="small" @click="getOrders('wait')" >出荷待ち ({{viewCount('wait')}})</el-button>
                    <el-button size="small" @click="getOrders('sent')" >出荷済み ({{viewCount('sent')}})</el-button>
                    <el-button size="small" @click="getOrders('comp')" >通知済み ({{viewCount('comp')}})</el-button>
                    <el-button size="small" @click="getOrders('cancel')" >キャンセル ({{viewCount('cancel')}})</el-button>
                </div>

                <div ml-2i mr-1i id="order-search">
                    <el-input placeholder="受注番号 / ユーザー名" v-model="filterText" class="shopname-filter"></el-input>
                    <el-button size="mini" icon="el-icon-search" circle type="success" @click="getFilterOrder"></el-button>
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
                <dd order-detail :class="{'order-detail': !isShowRemarkEtc}">受注内容</dd>
                <dd order-quantity :class="{'order-quantity': !isShowRemarkEtc}">伝票番号</dd>
                <dd v-if="isShowRemarkEtc" order-remark>ご要望等</dd>
                <dd order-other>&nbsp;</dd>
            </dl>
            <BtoCorderItem v-for="order in orderList" :detail="order" @updatedOrder="updatedOrder"/>
        </div>


        <div operation-btns>
            <div split-left>
                <span>チェックしたデータを</span>
                <!-- v-model="" @change="" -->
                <select select-mini v-model="selectedChanege" >
                    <option value="" selected disabled>ステータス変更 ▼</option>
                    <option value="new">新規受注</option>
                    <option value="wait">出荷待ち</option>
                    <option value="sent">出荷済み</option>
                    <option value="comp">通知済み</option>
                    <option value="cancel">キャンセル</option>
                </select>
                <span>に</span>
                <el-button size="mini" @click="changeStatusForSelect">変更</el-button>
            </div>
            <div split-right>
                <el-button size="mini" @click="yamatoCsv=true" type="warning" v-if="isSlip">発送リストの取り込み（伝票番号反映）</el-button>
                <el-button size="mini" @click="pickingComfirm" v-if="isPick">チェック項目のピッキング書を出力</el-button>
                <!--<button mini-size linebtn  v-if="isLine"><div linebtn-overlay>出荷済み伝票番号をLINEで通知</div></button>-->
                <el-button size="mini" type="primary" @click="downloadComfirm" v-if="isYamato">チェックした受注をCSVでダウンロード</el-button>
            </div>
        </div>

        <!-- B2Cloud 伝票取り込み用 -->
        <el-dialog
          title="B2Cloud 伝票取り込み"
          :visible.sync="yamatoCsv"
          width="30%">
          <div>

            <CsvUploader @uploadCsv="uploadCsv" @fileClear="fileClear" ref="CsvUploader"/>

          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="yamatoCsv = false">キャンセル</el-button>
            <el-button type="primary" v-if="isCsv" @click="updateSlipNumber">取り込む</el-button>
          </span>
        </el-dialog>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

// print.js
import print from 'print-js'

export default {

    /*
    * オーダーステータス
    * new    = 新規受注
    * wait   = 出荷待ち
    * sent   = 出荷済み
    * comp   = 通知済み
    * cancel = キャンセルデータ
    ******************************************************/
    data: () => {
        return {

            loading : true,
            text    : '読み込み中...',

            activeStatus : 'new',

            // 検索フィルターテキスト
            filterText : '',

            // 選択されているステータス変更
            selectedChanege : '',

            // 全てを選択しているか
            allChecked : false,

            // セットしたオーダー一覧
            orderList : '',

            // 各ステータスごとのカウント
            statuses : [
                {title : 'new'    , count : 0 },
                {title : 'wait'   , count : 0 },
                {title : 'sent'   , count : 0 },
                {title : 'comp'   , count : 0 },
                {title : 'cancel' , count : 0 }
            ],

            // 出力CSVヘッダー（ヤマトB2B用）
            B2cloudFields : [
                                'order_id'      ,
                                'deliv_date'    ,
                                'deliv_time'    ,
                                'type'          ,
                                'cool_flg'      ,
                                'tel'           ,
                                'name'          ,
                                'zip'           ,
                                'address'       ,
                                'building'      ,
                                'honor'         ,
                                'seller_code'   ,
                                'seller_name'   ,
                                'seller_tel'    ,
                                'seller_zip'    ,
                                'seller_address',
                        ],

            // YAMATO B2Cloud 伝票取り込みダイアログ
            yamatoCsv : false,

            // アップロードしたCSVが返還されたJSON
            yamatoJsonData : '',



        }

    },

    watch: {

        allChecked : function(val){

            if( this.orderList != '' ){

                this.orderList = this.orderList.map( o => {

                    o.checked = val; return o;

                })

            }

        }

    },
    created(){

        this.initApp()

    },
    mounted : function(){

        console.clear()

        this.getOrderCount()
        this.getOrders('new')

    },

    computed: {

        isSlip : function(){

            return ( this.activeStatus == 'wait' )? true : false

        },
        isPick : function(){

            return ( this.activeStatus == 'new' )? true : false

        },
        isLine : function(){

            return ( this.activeStatus == 'sent' )? true : false

        },
        isYamato : function(){

            return ( this.activeStatus == 'new' || this.activeStatus == 'wait' )? true : false

        },

        isCsv : function(){

            return ( this.yamatoJsonData != '' )? true : false


        },

        isShowRemarkEtc: function () {
          return process.env.SHOW_REMARK_ETC?.toLowerCase() == "true"
        },

        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref' , 'appList' , 'products' , 'order' ]),

    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref' , 'setAppList' , 'setProducts' , 'setOrder' ]),

        //// 初期設定 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        initApp : async function(){

            // const pref 取得
            var do_getConstPref = await this.getConstPref()

            await this.setConstPref( do_getConstPref )

            // app list 取得
            var do_getAppList   = await this.getApps()

            // appごとの配送設定を取得
            let do_getAppShipping = await Promise.all( do_getAppList.map( async function( app ){

                let res = await this.getAppShipping(app.app_id)
                return res

            }.bind(this)));

            // app list の配送データをセット
            await do_getAppList.map( app => {

                app.shipping = do_getAppShipping.find( s => s[0].app_id == app.app_id )
                return app

            })

            await this.setAppList( do_getAppList )

            // app list の配送データをセット
            await this.endInit()

        },

        /* ロード完了
        ***************************************************/
        endInit : function(){

            // アプリリストをセット
            this.apps = JSON.parse( JSON.stringify( this.appList ) )
            this.loading = false

        },

        /* const pref 取得
        ***************************************************/
        getConstPref : async function(){

            var res = null

            var db = new URLSearchParams()
            await axios.post( process.env.B2C_API + 'getConstPref' , db ).then( function(result){

                res = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

            return res

        },
        /* app list 取得
        ***************************************************/
        getApps : async function(){

            var res = null

            var db = new URLSearchParams()
            await axios.post( process.env.B2C_API + 'getAppList' , db ).then( function(result){

                res = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

            return res

        },
        /* app ごとの配送設定を取得
        ***************************************************/
        getAppShipping : async function( app_id ){

            var res = null

            var db = new URLSearchParams()
            db.append( 'app_id' , app_id )
            await axios.post( process.env.B2C_API + 'getAppShipping' , db ).then( function(result){

                for ( let step = 0; step < 47; step++ ) {

                    var code = step + 1
                    var fee  = ( result.data[step] != void 0 && result.data[step].shipping_fee != void 0 )? result.data[step].shipping_fee : ''
                    var fee_s  = ( result.data[step] != void 0 && result.data[step].shipping_fee_s != void 0 )? result.data[step].shipping_fee_s : ''
                    var fee_m  = ( result.data[step] != void 0 && result.data[step].shipping_fee_m != void 0 )? result.data[step].shipping_fee_m : ''
                    var fee_l  = ( result.data[step] != void 0 && result.data[step].shipping_fee_l != void 0 )? result.data[step].shipping_fee_l : ''
                    var flg  = ( result.data[step] != void 0 && result.data[step].shipping_flg != void 0 )? result.data[step].shipping_flg : 0
                        flg  = ( flg == 0 )? false:true
                    var ns_flg  = ( result.data[step] != void 0 && result.data[step].no_size_flg != void 0 )? result.data[step].no_size_flg : 0
                        ns_flg  = ( ns_flg == 0 )? false:true

                    result.data[step] = {
                          app_id            : app_id ,
                          pref_code         : code,
                          shipping_fee      : fee,
                          shipping_fee_s    : fee_s,
                          shipping_fee_m    : fee_m,
                          shipping_fee_l    : fee_l,
                          shipping_flg      : flg,
                          no_size_flg       : ns_flg
                    }

                }

                res = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

            return res

        },
        //// 初期設定 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



        /****************************************************************************************************************
        * オーダーアップデート後の処理
        ****************************************************************************************************************/
        updatedOrder : function( status ){

            this.getOrders( status )
            this.getOrderCount()

        },




        /****************************************************************************************************************
        * フィルタのクリア
        ****************************************************************************************************************/
        clearFilters : function(){

            // チェック選択を外す
            this.allChecked = false

            // 検索フィルターテキスト
            this.filterText = ''

            // 選択されているステータス変更
            this.selectedChanege = ''

            return

        },




        /****************************************************************************************************************
        * ステータスごとの件数を取得
        ****************************************************************************************************************/

        getOrderCount : async function(){

            var db = new URLSearchParams()
            db.append( 'statuses' , JSON.stringify( this.statuses ) )
            await axios.post( process.env.B2C_API + 'getOrderCount' , db ,  {timeout: 5000} ).then( function(result){

                this.statuses = result.data

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){ this.loading = false; }.bind(this))

        },


        /****************************************************************************************************************
        * ステータスを指定して受注の取得
        ****************************************************************************************************************/

        getOrders : async function( status ){

            this.loading = true

            // 現在表示しているオーダーリストをクリア
            this.orderList = ''

            await this.clearFilters()

            this.activeStatus = status

            var db = new URLSearchParams()
            db.append( 'status' , status )
            await axios.post( process.env.B2C_API + 'getOrders' , db ,  {timeout: 5000} ).then( function(result){

                this.orderList = JSON.parse( JSON.stringify( result.data ) )
                this.setOrder( result.data )

                this.getOrderCount()

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){ this.loading = false; }.bind(this))

        },


        /****************************************************************************************************************
        * フィルタ文字から受注の取得
        ****************************************************************************************************************/

        getFilterOrder : async function(){

            if( this.filterText =='' ) return

            this.loading = true
            this.allChecked = false

            this.activeStatus = 'filter'

            var db = new URLSearchParams()
            db.append( 'filter' , this.filterText )
            await axios.post( process.env.B2C_API + 'getFilterOrders' , db ).then( function(result){

                console.dir(result.data)

                this.orderList = JSON.parse( JSON.stringify( result.data ) )
                this.setOrder( result.data )

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){ this.loading = false; }.bind(this))

        },



        /****************************************************************************************************************
        * ヤマトB2Cloud 伝票の取り込み
        ****************************************************************************************************************/

        /* アップロードデータのクリア
        ***********************************/
        fileClear : function(){

            this.yamatoJsonData = ''
            return

        },

        /* CSVアップロードコンポーネントからの戻り値
        ***********************************/
        uploadCsv : function( file ){

            // アップロードしたCSVからJSONデータを取得
            var db = new URLSearchParams()
            db.append( 'url' , JSON.stringify( file ) )
            axios.post( process.env.CSV + 'csvToJson' , db ).then( function(result){

                this.yamatoJsonData = result.data

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){  }.bind(this))

        },

        /* 取得したデータから、必要なデータを整形する
        ***********************************/
        updateSlipNumber : async function(){

            this.loading   = true

            // データの整形
            var updateData = JSON.parse( JSON.stringify( this.yamatoJsonData ) )

            var new_data = await this.makeNewData( updateData )

            var adjustData = new_data.filter( d => ( d.order_id != '' || d.slip != '' ) )


            await this.slipNumberProcess( adjustData )

        },

        // データの整形
        makeNewData : function( updateData ){

            return updateData.map( order => {

                return {
                    order_id : order[0].replace(/[^0-9a-z\-]/gi, ''),
                    slip     : order[3].replace(/[^0-9a-z]/gi, ''),
                    days     : order[4].replace(/[^0-9a-z\/]/gi, '')

                }


            })

        },

        /* 整形したデータをオーダーに対して適用（伝票番号の適用）
        ***********************************/
        slipNumberProcess : function(adjustData){

            console.dir( 'order ▶︎ slipNumberProcess' )

            // アップロードしたCSVからJSONデータを取得
            var db = new URLSearchParams()
            db.append( 'slipList' , JSON.stringify( adjustData ) )
            axios.post( process.env.B2C_API + 'updateOrderSlip' , db ).then( function(result){

                console.dir(result.data)

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(async function(){

                // 取り込んだデータをクリア
                await this.fileClear()

                // CsvUploader の fileClear メソッドを実行（親から子のメソッドを実行）
                await this.$refs.CsvUploader.fileClear()

                // 完了処理
                await this.slipNumberProcessEnd()

            }.bind(this))

        },

        /* 完了処理
        ***********************************/
        slipNumberProcessEnd :function(){

            // ダイアログを閉じる
            this.yamatoCsv = false

//            this.loading = false

            this.updatedOrder( 'sent' )

        },

















        /****************************************************************************************************************
        * ピッキング書の出力
        ****************************************************************************************************************/

        pickingComfirm : function(){

            const targetOrder = this.orderList.filter( o => o.checked )

            console.dir(targetOrder)

            if( targetOrder.length == 0 ){

                this.$alert(
                    '対象が選択されていません。' ,
                    {
                        confirmButtonText : 'OK',
                        type              : 'error'

                    }
                );

            }

            else{

                this.$confirm(
                    'チェックした' + targetOrder.length + '件の出荷指示書を印刷しますか？',
                    '出荷指示書の印刷',
                    {
                        confirmButtonText : '印刷する',
                        cancelButtonText  : 'キャンセル',
                        type              : 'info '
                    }
                ).then(() => {

                    this.printPickingDocument( targetOrder )

                }).catch(() => {});

            }



        },

        printPickingDocument : async function( targetOrder ){

            var picking = await this.createPickingJson( targetOrder )
            await this.printDialog( picking , targetOrder )

        },

        createPickingJson : function( targetOrder ){

            return targetOrder.map( function(order){

                var products = ''

                order.products.map( p => {

                    products += `<p style="font-weight:bold;">${p.product_name} × ${p.quantity}</p>`

                });

                return {
                    app_name       : order.app_name,
                    order_id       : order.app_code + '-' + order.order_id,
                    order_date     : this.$dayjs( order.order_date ).format('YYYY/MM/DD'),
                    products       : products
                }

            }.bind(this))

        },

        /* 印刷（印刷ダイアログの表示）
        *******************************************************/
        printDialog : function( picking , targetOrder ){

            var now = this.$dayjs().format('YYYY/MM/DD HH:mm')

            printJS({
                printable : picking,
                properties: [
                    { field: 'app_name'  , displayName: '<span>店舗名</span>' },
                    { field: 'order_id'  , displayName: '<span>受注番号</span>' },
                    { field: 'order_date', displayName: '<span>受注日</span>' },
                    { field: 'products'  , displayName: '<span>受注内容</span>' },
                ],
                type: 'json',
                gridHeaderStyle: 'color: #000000;  border: 1px solid #000000;',
                gridStyle: 'border: 1px solid #000000;padding:0.5em;font-size:12px;',
                header: `<h3 class="custom-h3">ピッキング指示書 [ ${now} ] </h3>`,
                style: '.custom-h3 { color: #000; }',
                font_size : '12px',
                onPrintDialogClose : this.changeStatusConfirm( targetOrder , 'wait' )

            })

        },




        /****************************************************************************************************************
        * チェックした項目のステータス変更
        ****************************************************************************************************************/

        /* 一括変換の確認
        ********************************************************/
        changeStatusForSelect : function(){

            // ターゲット抽出
            const targetOrder = this.orderList.filter( o => o.checked )

            // 変更が選択されていない
            if( this.selectedChanege == void 0 || this.selectedChanege == '' ){

                this.changeStatusError( '変更内容が選択されていません。' )

            }

            // 選択した変更先と現在のアクティブステータスが同じ
            else if( this.activeStatus == this.selectedChanege ){

                this.changeStatusError( '選択中の受注データのステータスと変更先のステータスが同一です。')

            }

            // 変更対象がない
            else if( targetOrder.length == 0 ){

                this.changeStatusError( '一括変換の対象が選択されていません。' )

            }

            else{

                // ▶︎ 発送済みへの変換は、伝票番号の入力が条件
                if( this.selectedChanege == 'sent' ){

                    var targets = targetOrder.filter( order => order.slip_number == null || order.slip_number == '' );
                    if( targets.length > 0 ){ this.changeStatusError( '伝票番号のない受注は出荷済みに変更できません。' ); }
                    if( targets.length == 0 ){ this.changeStatusSelectConfirm( targetOrder ); }

                }

                // ▶︎ 通知済みへの変換は、通知フラグが条件
                else if( this.selectedChanege == 'comp' ){

                    var targets = targetOrder.filter( order => order.line_send_flg == 0 );
                    if( targets.length > 0 ){ this.changeStatusError( 'LINEに伝票番号未通知の受注は通知済みにできません' ); }
                    if( targets.length == 0 ){ this.changeStatusSelectConfirm( targetOrder ); }

                }

                // ステータス変更開始
                else{

                    this.changeStatusSelectConfirm( targetOrder );

                }

            }

        },

        /* ステータス一括変更の変更条件を満たしていない場合のアラート
        ********************************************************/
        changeStatusError : function( errMSG ){

            this.$alert(
                errMSG ,
                {
                    confirmButtonText : 'OK',
                    type              : 'error'
                }
            );

        },

        /* ステータス一括変更の最終確認
        ********************************************************/
        changeStatusSelectConfirm: function( targetOrder ){

            var jpStatus = this.convertStatusCode( this.selectedChanege )

            this.$confirm(
                `チェックした${targetOrder.length}件のデータを${jpStatus}に変更しますか？`,
                `一括変換`,
                {
                    confirmButtonText : '変更する',
                    cancelButtonText  : 'キャンセル',
                    type              : 'info '
                }
            ).then(() => {

                this.changeStatus( targetOrder , this.selectedChanege )

            }).catch(() => {});

        },

        /* ステータス変更の確認
        ********************************************************/
        changeStatusConfirm : function( orders , status ){

            var jpStatus = this.convertStatusCode( status )

            this.$confirm(
                `チェック状態の受注情報を${jpStatus}に変更しますか？`,
                `${jpStatus}への変更`,
                {
                    confirmButtonText : '変更する',
                    cancelButtonText  : 'キャンセル',
                    type: 'info'
                }
            ).then(() => {

                this.changeStatus( orders , status )

            }).catch(() => {

            });

        },



        /* ステータス変更実行
        ********************************************************/
        changeStatus : async function( orders , status ){

            this.loading = true

            var order_ids  = await Promise.all( orders.map( async (v)=>{
                const  res = await this.orderToOrderId(v);
                return res;
            }));

            var db = new URLSearchParams()
            db.append( 'orders' , JSON.stringify( order_ids ) )
            db.append( 'status' , status )
            await axios.post( process.env.B2C_API + 'changeOrderStatus' , db ).then( function(result){

                this.getOrders( status );

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){  }.bind(this))


        },

        /* orders から order_id を返す
        *********************************************/
        orderToOrderId : async function( order ){

            return order.order_id

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

        createB2cloudCSV : function( targetOrder ){

            console.dir('createB2cloudCSV')
            console.dir(targetOrder)

            var createOrderCsv = targetOrder.map( order => {

                if( order.deliv_time == 'none' ){ order.deliv_time = '' }
                if( order.deliv_time == 'am' )  { order.deliv_time = '0812' }

                return {
                    order_id      : order.app_code + '-' + order.order_id,
                    deliv_date    : this.$dayjs().format('YYYY/MM/DD'),
                    deliv_time    : order.deliv_time,
                    type          : 0,
                    cool_flg      : 2,
                    tel           : order.tel_1 + '-' + order.tel_2 + '-' + order.tel_3,
                    name          : order.name,
                    zip           : order.zip,
                    address       : order.pref + order.city + order.street + order.address,
                    building      : order.addition,
                    honor         : '様',
                    seller_code   : order.app_code,
                    seller_name   : order.app_name,
                    seller_tel    : '048-485-1784',
                    seller_zip    : '3350031',
                    seller_address: '埼玉県 戸田市美女木4-27-3'
                }

            })

            var filename = this.$dayjs().format('YYYY-MM-DD') + '.csv'

            var db = new URLSearchParams()
            db.append( 'B2cloudFields' , JSON.stringify( this.B2cloudFields ) )
            db.append( 'B2cloudBody' , JSON.stringify( createOrderCsv ) )
            db.append( 'filename' , filename )
            axios.post( process.env.CSV + 'downloadB2cloudCSV' , db ).then( function(result){

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


        /****************************************************************************************************************
        * HELPER
        ****************************************************************************************************************/

        /* 各ステータスの件数を表示
        ********************************/
        viewCount: function(val){

            var target = this.statuses.find( s => s.title == val )
            return target.count

        },

        /* 各ステータスのcodeを日本語に
        ********************************/
        convertStatusCode: function(val){

            if( val == 'new'    ) return '新規受注'
            if( val == 'wait'   ) return '出荷待ち'
            if( val == 'sent'   ) return '出荷済み'
            if( val == 'comp'   ) return '通知済み'
            if( val == 'cancel' ) return 'キャンセルデータ'

        },






    },
    filters:{

        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

        acviveTitle : function(val){

            if( val == 'new'    ) return '新規受注'
            if( val == 'wait'   ) return '出荷待ち'
            if( val == 'sent'   ) return '出荷済み'
            if( val == 'comp'   ) return '通知済み (完了)'
            if( val == 'cancel' ) return 'キャンセル'
            if( val == 'filter' ) return '検索結果'

        }



    },
};
</script>
<style>
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
dd[order-linename]{ width:13%; }
dd[order-app]{ width:10%; }
dd[order-quantity]{ width:10%; }
dd[order-remark]{ width:15%; }
dd[order-detail]{ width:20%;}
dd[order-other]{width:5%;}

[operation-btns]{
    padding:2em 1em 4em 1em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
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
    width:25%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

#sort-box > div#order-search .shopname-filter{
    margin-right:1em;
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

dd.order-detail {
  width: 25%;
}

dd.order-quantity {
  width: 20%;
}

</style>
