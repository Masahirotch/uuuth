<template>
     <div>

        <div form-box split-2>
            <div split-2 split-start>
                <span right-center pr-05 style="width:10em;">LINE表示名</span>
                <input type="text" v-model="orderObj.displayName" disabled="disabled" style="width:20em;">
            </div>
            <div split-2 split-start>
                <span  right-center pr-05 style="width:10em;">決済ID</span>
                <input type="text" v-model="orderObj.stripe_id" disabled="disabled" style="width:25em;">
            </div>

        </div>

        <div form-box split-2>
            <div split-2 split-start>
                <span right-center pr-05 style="width:10em;">伝票番号</span>
                <input type="text" v-model="orderObj.slip_number"  style="width:20em;" :disabled="isComp">
            </div>
            <div style="width:30em;margin-right:10em;display:flex;justify-content: center;align-items: center;">
                <div linebtn @click="sendLineDialog = true" v-if="isDelived && isSlipNumber && !isComp" >
                    <div linebtn-overlay>LINEで伝票番号を送信する</div>
                </div>
            </div>

        </div>

        <div form-box v-if="isShowRemarkEtc">
            <div split-2 split-start>
                <span right-center pr-05 style="width:10em;">ご要望等</span>
                <textarea v-model="orderObj.note" :disabled="isComp" style="width: 20em; height: auto; line-height: normal; padding: 15px;" cols="30" rows="4"></textarea>
            </div>
        </div>

        <div form-box>
            <div split-2 split-start>
                <span  right-center pr-05 style="width:10em;">ステータス</span>
                <select v-model="orderObj.status" style="width:8em;" :disabled="isComp">
                    <option value="new">新規受注</option>
                    <option value="wait">出荷待ち</option>
                    <option value="sent" v-if="isSlipNumber">出荷済み</option>
                    <option value="comp" >通知済み</option>
                    <option value="cancel">キャンセル</option>
                </select>
            </div>
        </div>


        <div form-box>
            <div split-2 split-start>
                <span right-center pr-05 style="width:10em;">お届け先名</span>
                <input type="text" v-model="orderObj.name" :disabled="isDelived" style="width:20em;">
            </div>
        </div>

        <div form-box>
            <div pr-1 split-6 split-start>
                <span right-center pr-05 style="width:10em;">電話番号</span>
                <input style="width:6em;" type="text" v-model="orderObj.tel_1" :disabled="isDelived" @keypress="validate" @input="orderObj.tel_1=format(orderObj.tel_1)">
                <span center-col pr-05 pl-05 style="width:1em;">-</span>
                <input style="width:6em;" type="text" v-model="orderObj.tel_2" :disabled="isDelived" @keypress="validate" @input="orderObj.tel_2=format(orderObj.tel_2)">
                <span center-col pr-05 pl-05 style="width:1em;">-</span>
                <input style="width:6em;" type="text" v-model="orderObj.tel_3" :disabled="isDelived" @keypress="validate" @input="orderObj.tel_3=format(orderObj.tel_3)">
            </div>
        </div>


        <div form-box>
            <div split-2 split-start>
                <span  right-center pr-05 style="width:10em;">お届け時間</span>
                <select v-model="orderObj.deliv_time" style="width:12em;" :disabled="isComp">
                    <option value="none" >指定なし</option>
                    <option value="0012" >午前中</option>
                    <option value="1416" >14:00 - 16:00</option>
                    <option value="1618" >16:00 - 18:00</option>
                    <option value="1820" >18:00 - 20:00</option>
                    <option value="1921" >19:00 - 21:00</option>
                </select>
            </div>
        </div>



        <div form-box>
            <h4>配送先住所の編集 ( 都道府県 / 郡市区町村 / 町名・地区名 / 番地 / 建物・部屋番号等 )</h4>
            <div split-6 split-start>
                <div pr-05 style="width:9em;">
                    <input type="text" v-model="orderObj.zip" :disabled="isDelived" style="width:8em;" @keypress="validate" @input="orderObj.zip=format(orderObj.zip)">
                </div>
                <div pr-05 style="width:8em;">
                    <select v-model="orderObj.pref_code" pref-select :disabled="isDelived" style="width:7em;">
                        <option :value="pref.pref_code" v-for="pref in constPref" v-if="isDelivActive(pref.pref_code)" >{{pref.jp}}</option>
                    </select>
                </div>
                <div pr-05 style="width:13em;">
                    <input type="text" v-model="orderObj.city" :disabled="isDelived" style="width:12em;">
                </div>
                <div pr-05 style="width:13em;">
                    <input type="text" v-model="orderObj.street" :disabled="isDelived" style="width:12em;">
                </div>
                <div pr-05 style="width:13em;">
                    <input type="text" v-model="orderObj.address" :disabled="isDelived" style="width:12em;">
                </div>
                <div>
                    <input type="text" v-model="orderObj.addition" :disabled="isDelived">
                </div>
            </div>
        </div>

        <div form-box>
            <h4>購入商品</h4>

            <div split-4 split-start v-for="product in orderObj.products" pt-05 pb-05>
                <div split-2>
                    <span center-col pr-05 style="width:6em;">商品</span>
                    <input type="text" v-model="product.product_name" disabled="disabled">
                </div>

                <div split-3 pl-2 style="width:15em;">
                    <span center-col pr-05 style="width:6em;">価格</span>
                    <input type="text" v-model="product.price" disabled="disabled">
                    <span center-col pl-05 pr-1 style="width:3em;">円</span>
                </div>

                <div split-2 pl-2 style="width:10em;">
                    <span center-col pr-05 style="width:6em;">数量</span>
                    <input type="text" v-model="product.quantity" disabled="disabled">
                </div>
                <div pl-2 style="width:15em;" right-center >
                    <b>小計 ¥{{product.price * product.quantity|number_format}}</b>
                </div>
            </div>

            <h4 right-center style="line-height:3em;">送料 : {{orderObj.shipping_fee|number_format}}円 /  合計金額 : {{orderObj.order_price|number_format}}</h4>

        </div>


        <!-- btn footer -->
        <div pt-4i right pr-1i>
            <span slot="footer" class="dialog-footer">
                <el-button @click="close">閉じる（編集をキャンセル）</el-button>
                <el-button type="primary" @click="updateOrder">内容を更新</el-button>
            </span>
        </div>



        <!-----------------------/ LINE Message 送信ダイアログ /----------------------->
        <el-dialog
          title="LINEメッセージ送信"
          :visible.sync="sendLineDialog"
          width="98%"
          id="sendline-dialog"
          >
          <div create-sendlinemessage>

                <div create-sendlinemessagebox>

                    <!-- 並び替えにコンテンツ追加 -->
                    <el-button size="mini" @click="addMessage" add-button>
                        <span add-text>追加する</span>
                        <span add-front>&raquo;</span>
                    </el-button>

                    <!-- コンテンツ追加ボックス -->
                    <MsgRegBoxNoMovie
                        @fromRegbox="fromRegbox"
                        :value="messageContent"
                        ref="regBox"/>

                    <div mt-2>
                        <div>[ メッセージ例 ]</div>
                        <div style="padding:3em;background:#efefef;">
                            <div chat-text mb-1>
                                発送完了のお知らせ<br>
                                注文番号「<strong style="padding-left:0.15em;padding-right:0.15em;">{{orderObj.app_code}}-{{orderObj.order_id}}</strong>」の商品を本日発送いたしました。<br>
                                <br />
                                注文内容
                                    <div v-for="product in orderdetail.products">
                                        <strong style="padding-left:0.15em;padding-right:0.15em;">{{product.product_name}}　{{product.price|number_format}}円×{{product.quantity}}個　小計：{{product.price * product.quantity|number_format}}円</strong>
                                    </div>
                                    <strong style="padding-left:0.15em;padding-right:0.15em;">【送料 : {{orderObj.shipping_fee|number_format}}円 /  合計金額 : {{orderObj.order_price|number_format}}円】</strong><br />
                                <br />
                                発送の伝票番号は<br>
                                「<strong style="padding-left:0.15em;padding-right:0.15em;">{{orderObj.slip_number}}</strong>」<br>
                                となります。<br>
                                <br>
                                下記のリンクより配送状況を確認できます。<br>
                                https://toi.kuronekoyamato.co.jp/cgi-bin/tneko
                            </div>
                            <div chat-text>
                            「発送完了のお知らせ」メッセージ配信直後などはご注文いただいた商品の配送状況が「伝票番号未登録」表示となっている場合がございます。<br>
                            ヤマト運輸の配送状況によっては伝票番号の反映までに数時間から1日ほどお時間がかかる場合がございます。予めご了承ください。
                            </div>
                        </div>
                    </div>

                </div>

                <div create-sendlinemessageview>
                    <div style="width:350px;background:#dfdfdf;height:90%;max-height:600px;margin:0 auto;padding:1em;overflow-y: scroll;">
                        <div v-for="(message , index) in sendLineMessages" style="margin-bottom:1em;position:relative;">
                            <div chat-text v-html="nl2br(message.text)" v-if="message.type == 'text'"></div>
                            <div chat-image v-if="message.type == 'image'"><img :src="imageSrc(message.previewImageUrl)"></div>
                            <i class="el-icon-error" message-delete @click="deleteMessage(index)"></i>
                        </div>
                    </div>
                </div>
          </div>

          <span slot="footer" class="dialog-footer">
            <el-button @click="sendLineDialog = false">キャンセル</el-button>
            <el-button type="primary" @click="sendSlipNumber">この内容で送信</el-button>
          </span>
        </el-dialog>
        <!-----------------------/ LINE Message 送信ダイアログ /----------------------->

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'

/*
* オーダーステータス
* new    = 新規受注
* wait   = 出荷待ち
* sent   = 出荷済み
* comp   = 通知済み
* cancel = キャンセルデータ
******************************************************/

export default {

    mixins:[util],

    props : [ 'orderdetail' ],

    data() {

        return {

            orderObj : this.orderdetail,
            sendLineDialog : false,

            sendLineMessages : [],
            messageObj       : {},
            messageContent   : '',



        }

    },
    watch:{

        orderObj : {

            handler: function (val) {

                // 都道府県
                var targetPref = this.constPref.find( pref => pref.pref_code == val.pref_code )

                //// 都道府県変更
                this.orderObj.pref = targetPref.jp

                // 変更地域の送料
                var targetAppPref = this.appList.find( app => app.app_code == val.app_code ).shipping.find( s => s.pref_code == val.pref_code )

                // Sサイズ商品点数
                var ttlQuantityS = 0
                val.products.filter( p => p.size_code == 'S' ).forEach( p => { ttlQuantityS += p.quantity })

                // Mサイズ商品点数
                var ttlQuantityM = 0
                val.products.filter( p => p.size_code == 'M' ).forEach( p => { ttlQuantityM += p.quantity })

                // Lサイズ商品点数
                var ttlQuantityL = 0
                val.products.filter( p => p.size_code == 'L' ).forEach( p => { ttlQuantityL += p.quantity })

                //// 送料合計を変更
                this.orderObj.shipping_fee = (ttlQuantityS * targetAppPref.shipping_fee_s)
                                            + (ttlQuantityM * targetAppPref.shipping_fee_m)
                                            + (ttlQuantityL * targetAppPref.shipping_fee_l)

                this.orderObj.order_price = this.orderObj.shipping_fee + this.orderObj.cart_price

                this.orderdetail = this.orderObj

            },

            deep: true

        }

    },
    mounted(){

        console.dir( 'BtoC order item edit.' )
        console.dir( this.orderObj )

    },

    computed: {

        // すでに配送済みかどうか（配送済みの場合に編集できる項目を制限するため）
        isDelived : function(){

            return ( this.orderObj.status == 'sent' || this.orderObj.status == 'comp' )? true : false

        },

        // 伝票番号の入力があるか
        isSlipNumber : function(){

            return ( this.orderObj.slip_number != null && this.orderObj.slip_number != '' )? true : false

        },
        isComp : function(){

            return ( this.orderObj.status == 'comp' )? true : false

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


        /********************************************************************************************************
         *
         *  Base Dialog
         *
        *********************************************************************************************************/

        // 編集ダイアログを閉じる
        close : function(){

            this.$emit('close')

        },

        // 内容の更新を行う
        updateOrder : function(){

            this.$emit( 'updateOrder' , this.orderObj )

        },

        //配送可能地域かどうか
        isDelivActive : function(pref_code){

            var targetAppPref = this.appList.find( app => app.app_code == this.orderObj.app_code ).shipping.find( s => s.pref_code == pref_code )
            return targetAppPref.shipping_flg

        },



        /********************************************************************************************************
         *
         *  Send Line Message Dialog
         *
        *********************************************************************************************************/

        /* メッセージ作成ボックスからの戻り値でメッセージオブジェクトを作成する
        **************************************************/
        fromRegbox : function( content ){

            this.messageContent = content

            //画像の場合
            if( content.file_id > 0 && content.file_url != '' ){

                this.messageObj = {
                    "type"               : "image",
                    "originalContentUrl" : content.file_url,
                    "previewImageUrl"    : content.thumb_url
                }

            }

            // テキストの場合
            else{

                this.messageObj = {
                    "type" : "text",
                    "text" : content.origin_name
                }

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

            console.clear()

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

            var send = new URLSearchParams()
            send.append( 'order'      , JSON.stringify( this.orderdetail ) )
            send.append( 'messageObj' , JSON.stringify( this.sendLineMessages ) )
            return await axios.post( process.env.B2C_API + 'sendSlipNumber' , send ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); return err; })

        },

        sendedSlipNumber : function(){

            this.$alert('伝票番号を送信しました', '通知完了', {
              confirmButtonText: 'OK',
              type: 'success',
              callback: action => {

                this.orderObj.status = 'comp'
                this.sendLineDialog = false
                this.$emit( 'updateOrder' , this.orderObj )

              }
            });

        },







        /********************************************************************************************************
         *
         *  message Object preview functions
         *
        *********************************************************************************************************/

        imageSrc : function(value){

            return value

        },

        alertMessage : function( title , message , type ){

            this.$alert( message , title, {
              confirmButtonText: 'OK',
              type : type,
            });

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
[form-box]{width:100%;padding:2em 0;border-bottom:1px dashed #ccc;}
[form-box] h4{margin-bottom:0.5em;}


select,input,textarea{
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
    width:100%;
}

select[disabled="disabled"],input[disabled="disabled"],textarea[disabled="disabled"]{
    background:#f3f3f3;
}
select[disabled="disabled"]:hover,input[disabled="disabled"]:hover,textarea[disabled="disabled"]:hover{
    cursor:not-allowed;
}

#sendline-dialog .el-dialog{
    border: 5px solid #F00;
}


[chat-text]::after{
    border-right-color: #FFF;
}

[message-delete]{
    position: absolute;
    left: -0.1em;
    top: -0.1em;
    color: #F00;
    background: #FFF;
    border-radius: 1em;
    transform: scale(1.3);
}
[message-delete]:hover{
    cursor: pointer;
}





</style>
