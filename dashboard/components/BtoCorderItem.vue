<template>
     <div order-item>

        <dl orderlist-detail>
            <dd order-check> <el-checkbox v-model="detail.checked"></el-checkbox> </dd>
            <dd order-id>{{detail.app_code}}-{{detail.order_id}}</dd>
            <dd order-date>{{jpDateMonthDay(detail.order_date)}}</dd>
            <dd order-linename>{{detail.displayName}}</dd>
            <dd order-app>{{detail.app_name}}</dd>
            <dd order-detail v-html="orderProducts(detail.products)" :class="{'order-detail': !isShowRemarkEtc}"></dd>
            <dd order-quantity slip-editor v-if="isShipped" :class="{'order-quantity': !isShowRemarkEtc}">
                <input type="text" v-model="detail.slip_number" slip-input>
                <div linebtn btn-invalid v-if="!hasSlip">
                    <div linebtn-overlay>通知</div>
                </div>
                <div linebtn v-if="hasSlip" @click="sendpopToggle">
                    <div linebtn-overlay>通知</div>
                </div>
            </dd>

            <dd order-quantity v-if="!isShipped" :class="{'order-quantity': !isShowRemarkEtc}">&nbsp;</dd>

            <dd order-remark v-if="isShowRemarkEtc" v-html="nl2br(detail.note)"></dd>

            <dd order-other><el-button size="mini" type="success" @click="detail.popup = true">詳細</el-button></dd>
        </dl>

        <div>
            <!-- 受注編集ダイアログ -->
            <el-dialog
              :title=" '受注番号 ' + detail.app_code +'-'+ detail.order_id + ' の編集' "
              :visible.sync="detail.popup"
              big-dialog>

                <BtoCorderItemEdit :orderdetail="detail" @close="closeDialog" @updateOrder="updateOrder"/>

            </el-dialog>


            <!-- 受注編集ダイアログ -->
            <el-dialog
              :title=" '受注番号 ' + detail.app_code +'-'+ detail.order_id + ' に通知を行う' "
              :visible.sync="sendpop"
              big-dialog>

                    <MsgRegBoxNoMovie
                        @fromRegbox="fromRegbox"
                        :value="messageContent"
                        ref="regBox"/>

                    <div mt-2>
                        <div>[ メッセージ例 ]</div>
                        <div style="padding:3em;background:#efefef;">
                            <div chat-text mb-1>
                                発送完了のお知らせ<br>
                                注文番号「<strong style="padding-left:0.15em;padding-right:0.15em;">{{detail.app_code}}-{{detail.order_id}}</strong>」の商品を本日発送いたしました。<br>
                                <br />
                                注文内容
                                    <div v-for="product in detail.products">
                                        <strong style="padding-left:0.15em;padding-right:0.15em;">{{product.product_name}}　{{product.price|number_format}}円×{{product.quantity}}個　小計：{{product.price * product.quantity|number_format}}円</strong>
                                    </div>
                                    <strong style="padding-left:0.15em;padding-right:0.15em;">【送料 : {{detail.shipping_fee|number_format}}円 /  合計金額 : {{detail.order_price|number_format}}円】</strong><br />
                                <br />
                                発送の伝票番号は<br>
                                「<strong style="padding-left:0.15em;padding-right:0.15em;">{{detail.slip_number}}</strong>」<br>
                                となります。<br>
                                <br>
                                下記のリンクより配送状況を確認できます。<br>
                                https://toi.kuronekoyamato.co.jp/cgi-bin/tneko<br><br>

                            「発送完了のお知らせ」メッセージ配信直後などはご注文いただいた商品の配送状況が「伝票番号未登録」表示となっている場合がございます。<br>
                            ヤマト運輸の配送状況によっては伝票番号の反映までに数時間から1日ほどお時間がかかる場合がございます。予めご了承ください。

                            </div>
                        </div>
                    </div>

                    <div center pt-3>
                        <div linebtn @click="sendSlipNumber" style="max-width:300px;">
                            <div linebtn-overlay>この内容で通知する</div>        
                        </div>
                    </div>
            </el-dialog>


        </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'

export default {

    mixins:[util],

    props : [ 'detail' ],

    data() {

        return {

            sendpop : false,

            sendLineMessages : [],
            messageObj       : {},
            messageContent   : '',

        }

    },
    watch:{


    },
    mounted(){



    },

    computed: {

        hasSlip : function(){

            return ( this.detail.slip_number != '' && this.detail.slip_number != null )? true:false

        },

        isShipped : function(){

            return ( this.detail.status == 'comp' || this.detail.status == 'sent' || this.detail.status == 'wait' )? true : false
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

        // 編集ダイアログを閉じる
        closeDialog : function(){

            this.detail.popup = false

        },

        updateOrder : function( orderObj ){

            var db = new URLSearchParams()
            db.append( 'order' , JSON.stringify( this.detail ) )
            axios.post( process.env.B2C_API + 'updateOrder' , db ).then( function(result){

                this.$emit( 'updatedOrder' , orderObj.status );

            }.bind(this)).catch((err) => { console.dir(err); })
            .finally(function(){ this.loading = false; }.bind(this))

        },

        sendpopToggle : function(){

            this.sendpop = !this.sendpop

        },


        /* メッセージ作成ボックスからの戻り値でメッセージオブジェクトを作成する
        **************************************************/
        fromRegbox : async function( content ){

            this.messageContent = content

            //画像の場合
            if( content.file_id > 0 && content.file_url != '' ){

                this.messageObj = await {
                    "type"               : "image",
                    "originalContentUrl" : content.file_url,
                    "previewImageUrl"    : content.thumb_url
                }

                this.sendLineMessages = await [this.messageObj]

            }

            // テキストの場合
            else{

                this.messageObj = await {
                    "type" : "text",
                    "text" : content.origin_name
                }

                this.sendLineMessages = await [this.messageObj]

            }

        },

        // メッセージオブジェクトにメッセージを追加 /////////////////
        addMessage : function(){

            if( this.sendLineMessages.length > 2 ){

                this.alertMessage( '追加できません' , '一度に追加できるメッセージは３件までです。' , 'error' )

            }
            else{

                // メッセージオブジェクトを配信用配列に追加
                this.sendLineMessages.push( this.messageObj )

                // メッセージ作成ボックスの内容をリセット
                this.$refs.regBox.fileClear()

            }

        },

        // メッセージオブジェクトからメッセージを削除 ///////////////
        deleteMessage : function(index){

            this.sendLineMessages.splice(index,1)

        },


        /*******************************************************
         * send line message
         * ユーザー（注文者）のLINEに、作成したメッセージを送信する
         *
        ********************************************************/
        sendSlipNumber : async function(){

            await console.dir( this.sendLineMessages )
            await console.dir( this.messageObj )



            if( this.sendLineMessages.length == 0 ){

                await this.alertMessage( '通知できません' , '通知メッセージがありません。' , 'error' )

            }
            else{

                var send = await this.sendSlipNumberApi()

                if( send['x-line-request-id'] != void 0 ){

                    this.sendedSlipNumber()

                }

            }

        },

        sendSlipNumberApi : async function(){

            await console.clear()
            await console.dir(this.detail)

            var send = new URLSearchParams()
            send.append( 'order'      , JSON.stringify( this.detail ) )
            send.append( 'messageObj' , JSON.stringify( this.sendLineMessages ) )
            return await axios.post( process.env.B2C_API + 'sendSlipNumber' , send ).then( function(result){

                console.dir(result)

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); return err; })

        },

        sendedSlipNumber : function(){

            this.$alert('伝票番号を送信しました', '通知完了', {
              confirmButtonText: 'OK',
              type: 'success',
              callback: action => {

                this.detail.status = 'comp'
                this.sendpop = false
                this.$emit( 'updatedOrder' , 'comp' )

              }
            });

        },

        alertMessage : function( title , message , type ){

            this.$alert( message , title, {
              confirmButtonText: 'OK',
              type : type,
            });

        },


        ////////////////////////////////////////////////////////////////////////////////////////////////////
        ////// HELPER //////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        orderQuantity : function( productArray ){

            if( productArray ){

                var quantity = 0

                productArray.map( p =>{

                    quantity += Number(p.quantity)

                })

                return quantity

            }
            else{

                return 0

            }

        },

        orderProducts : function( productArray ){

            if( productArray ){

                var products = ``

                productArray.map( p =>{

                    products += `${p.product_name} x ${p.quantity}\n`

                })

                return (products != undefined)? this.nl2br(products):products;

            }
            else{

                return ''

            }

        },

        /* 日付フォーマット関係
        ***************************************/
        jpDate : function(value){

            return this.$dayjs(value).format('YYYY-M-D')

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
<style scoped>
[order-item]{border-bottom:1px dashed #ccc;}
[orderlist-detail]{
    width:100%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    padding:1em 0.1em;
}

[orderlist-detail] dd{
    padding:3px 1em;
    font-size:14px;
}

[orderlist-detail] dd[order-check]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

[orderlist-detail] dd[order-check] label.el-checkbox{
    padding : 1px;
    width: auto;
}

dd[order-check]{width:5%;}
dd[order-id]{ width:10%; }
dd[order-date]{ width:10%; }
dd[order-linename]{ width:13%; }
dd[order-app]{ width:10%; }
dd[order-quantity]{ width:10%; }
dd[order-remark]{ width:15%; }
dd[order-detail]{ width:20%;}
dd[order-other]{width:5%;}

dd.order-detail {
  width: 25%;
}

dd.order-quantity {
  width: 20%;
}

</style>
