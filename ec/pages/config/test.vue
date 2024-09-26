<template>
    <div bg-logo>
        <Loading v-if="loading" />
        <div config-content>






        </div>

        <div pr-2 pl-2>
            <Footer @cartToggle="cartToggle" />
        </div>

        <el-drawer
          title="現在のカートの中"
          :visible.sync="drawer"
          :direction="direction">    
          <Cart />
        </el-drawer>


    </div>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/Loading'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    components: { Loading },
    data: () => {
        return {
            loading: true,
            //////////
            drawer: false,
            direction: 'btt',

        }
    },
    mounted(){


        this.sendTest()

    },
    computed: {
        ...mapGetters( 'config'  ,['config'] ),
        ...mapGetters( 'user'    ,['userProfile','userConfig','userShipping','history'] ),
        ...mapGetters( 'cart'    ,['cart','cartCount','session_id' , 'orderMethod' , 'stripeToken' , 'delivery' ] ),
        ...mapGetters( 'products',['products','shippingTable','constPref'] ),

    },
    methods:{
        ...mapActions('config'  ,['setConfig']),
        ...mapActions('user'    ,['setUserProfile','setUserConfig','setUserShipping','setHistory']),
        ...mapActions('cart'    ,[ 'plusCart' , 'minusCart' , 'clearCart' , 'setSession' , 'cartInit' , 'setOrderMethod' , 'setStripeToken','setDelivery' ]),
        ...mapActions('products',['setProducts','setShippingTable','setConstPref']),

        cartToggle : function(){

            this.drawer = !this.drawer

        },

        // USER Initialize ///////////////////////////////////////////////
        sendTest : function(){

            var bcc = ['l@adop.co.jp','adop.tokyo@gmail.com']

            var from = {
                mail   : 'houmai@line.cx',
                header : '目黒ぎょうざ宝舞 LINE',
                name   : '目黒ぎょうざ宝舞'
            }


            var body = `注文コード：L000000002
注文日時：2020年05月25日 20時30分28秒
■注文者の情報
氏名：吉沢貴之
氏名（フリガナ）：よしざわたかゆき
郵便番号：900-0004
住所：沖縄県那覇市銘苅2-3-6 那覇市IT創造館 401
電話番号：08022223333
Ｅメールアドレス：houmai@line.cx
■支払方法
支払方法：銀行振込
■注文内容
------------------------------------------------------------
商品番号：A
注文商品名：手ごね和ぎょうざ（20個入1箱）
商品オプション：オプション
単価：￥540
数量：2
小計：￥1,080
------------------------------------------------------------
商品番号：D
注文商品名：俺の赤ピリ辛ぎょうざ（20個入×１箱）
商品オプション：
単価：￥756
数量：3
小計：￥2,268
------------------------------------------------------------
商品合計：￥3,348
税金：￥268
送料：￥5,600
手数料：￥0
その他費用：￥0
ポイント利用額：
------------------------------------------------------------
合計金額(税込)：￥9,216
------------------------------------------------------------
■届け先の情報
[送付先1]
　送付先1氏名：株式会社アドップ
　送付先1氏名（フリガナ）：かぶしきがいしゃあどっぷ
　送付先1郵便番号：101-0021
　送付先1住所：東京都千代田区外神田2-17-3 アヤベビル5F
　送付先1電話番号：03-5209-7151
　送付先1のし・ギフト包装：なし
　送付先1お届け方法：宅配便
　送付先1お届け希望日：2020年05月30日
　送付先1お届け希望時間：19-21時
■通信欄
希望日に間に合うようにお願いします。

`


            const params = new URLSearchParams()
            params.append( 'token'   , process.env.MAIL_TOKEN )
            params.append( 'target'  , 'houmai' )



            params.append( 'from'    , JSON.stringify( from ) )
            params.append( 'bcc'     , JSON.stringify( bcc ) )
            params.append( 'subject' , 'TESTの件名' )
            params.append( 'body'    , body )


            axios.post( process.env.MAIL_API , params )
                .then( function(result){

                    console.dir(result.data)

                }.bind(this))
                .catch((err) => {

                    console.dir(err)

                })
                .finally(function(){

                    this.loading = false

                }.bind(this))

        },
        // USER Initialize ///////////////////////////////////////////////






    },

}
</script>
<style>

</style>
