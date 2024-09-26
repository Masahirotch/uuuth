<template>
    <div bg-logo center-col pl-2 pr-2 app-index style="position:fixed;overflow:hidden;">
        <Loading v-if="loading" />


        <img src="/mainlogo-w.svg">

        <h1 mb-3 mt-3 success-msg>
            商品のご注文が完了しました。<br>
            <span style="font-size:0.9em;color:#FFF;font-weight:600;margin-top:0.4em;display:inline-block;">ご注文内容をトークルームに送信しました。</span>
        </h1>

        <el-button mt-1i @click="goProducts">商品購入ページ</el-button>

        <el-button mt-1i @click="closeApp">アプリを閉じる</el-button>

    </div>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/Loading'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    components: { Loading },
    created(){

        console.dir('+++++++++++++++++++++++++++++++ created ▼ ++++++++++++++++++++++++++++++++++++')

        let c = JSON.parse( JSON.stringify( this.cart ) )

        // カート商品小計
        this.calcAllCart = c.reduce( function( sum, element ){
            return sum + ( Number( element.productPrice ) * Number( element.productQuantity ) );
        }, 0);

        // カート商品TAX小計
        this.calcAllCartTax = c.reduce( function( sum, element ){
            return sum + ( Math.floor( ( ( ( Number(element.productPrice) * 100 ) * 0.08 ) / 100 ) ) * Number( element.productQuantity ) );
        }, 0);

        //カート合計
        this.calcAllCartAll = JSON.parse( JSON.stringify( this.calcAllCart + this.calcAllCartTax ))

        // ALL CART ///////////////////////////////////////

    },
    data: () => {
        return {
            loading: true,
            //////////
            drawer: false,
            direction: 'btt',

            // カート商品小計
            calcAllCart : 0,

            // カート商品TAX小計
            calcAllCartTax : 0,

            //カート合計
            calcAllCartAll : 0,

            shippingPrice : 0,


        }
    },
    mounted(){

        this.sendMail()

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
        goProducts : function(){

            this.$router.push('/products/')

        },
        // ネクストエンジンにメール送信
        sendMail : function(){

            console.clear()

            var paymentMethod = this.getPaymentMethod(this.orderMethod.paymentMethod)

            var cartProducts = []
            this.cart.forEach( function(product){

                cartProducts.push({
                    detail : this.getProductData(product.pid),
                    productName : product.productName,
                    productPrice: this.number_format( Number(product.productPrice)),
                    productQuantity : product.productQuantity,
                    productTtl : this.number_format( Number(product.productPrice) * Number(product.productQuantity) )
                })


            }.bind(this))

            var orderCode = this.session_id.substring(this.session_id.indexOf('___')).replace('___', '')

            var body = `注文コード：L${orderCode}
注文日時：2020年05月25日 20時30分28秒
■注文者の情報
氏名：${this.userShipping.master.shippingName}
氏名（フリガナ）：${this.userShipping.master.shippingName}
郵便番号：${this.userShipping.master.zip1}-${this.userShipping.master.zip2}
住所：${this.userShipping.master.pref}${this.userShipping.master.city}${this.userShipping.master.street}${this.userShipping.master.address} ${this.userShipping.master.addition}
電話番号：${this.userShipping.master.tel}
Ｅメールアドレス：${this.userProfile.userId}
■支払方法
支払方法：${paymentMethod}
■注文内容`

cartProducts.forEach( item => {

body += `
------------------------------------------------------------
商品番号：${item.detail.productCode}
注文商品名：${item.productName}
商品オプション：オプション
単価：￥${item.productPrice}
数量：${item.productQuantity}
小計：￥${item.productTtl}`
})



        // 代引きの場合、代引き料金も追加
        if( this.orderMethod.paymentMethod == 'cod' ){

            var codFee = this.codPrice( Number(this.calcAllCart) + Number(this.calcAllCartTax) +  Number( this.delivery[0].cool ) + Number( this.delivery[0].fee ) )

        }
        else{

            var codFee = 0

        }

        var allTtlPrice = Number(this.calcAllCart) + Number(this.calcAllCartTax) +  Number( this.delivery[0].cool ) + Number( this.delivery[0].fee ) + Number( codFee )


body += `
------------------------------------------------------------
商品合計：￥${this.number_format( Number( this.calcAllCart ) )}
税金：￥${this.number_format( Number( this.calcAllCartTax ) )}
送料：￥${this.number_format( Number( this.delivery[0].cool ) + Number( this.delivery[0].fee ) )}
手数料：￥${codFee}
------------------------------------------------------------
合計金額(税込)：￥${this.number_format( allTtlPrice )}
------------------------------------------------------------
■届け先の情報`


if( this.orderMethod.selectedShippingId == this.userShipping.master.sid ){

    body += `[送付先1]
    　送付先1氏名：${this.userShipping.master.shippingName}
    　送付先1氏名（フリガナ）：${this.userShipping.master.shippingName}
    　送付先1郵便番号：${this.userShipping.master.zip1}-${this.userShipping.master.zip2}
    　送付先1住所：${this.userShipping.master.pref}${this.userShipping.master.city}${this.userShipping.master.street}${this.userShipping.master.address} ${this.userShipping.master.addition}
    　送付先1電話番号：${this.userShipping.master.tel}
    　送付先1のし・ギフト包装：${this.noshigami( this.orderMethod.noshiMethod )}
    　送付先1お届け方法：宅配便
    　送付先1お届け希望日：${this.deliv_time( this.orderMethod.delivDate )}
    　送付先1お届け希望時間：${this.orderMethod.delivDate}
    ■通信欄
    ${this.orderMethod.note}

    `
}
else{

    var shippingUser = this.userShipping.sublist.find( v => Number( v.sid ) == this.orderMethod.selectedShippingId )

    body += `[送付先1]
    　送付先1氏名：${shippingUser.shippingName}
    　送付先1氏名（フリガナ）：${shippingUser.shippingName}
    　送付先1郵便番号：${shippingUser.zip1}-${shippingUser.zip2}
    　送付先1住所：${shippingUser.pref}${shippingUser.city}${shippingUser.street}${shippingUser.address} ${shippingUser.addition}
    　送付先1電話番号：${shippingUser.tel}
    　送付先1のし・ギフト包装：${this.noshigami( this.orderMethod.noshiMethod )}
    　送付先1お届け方法：クール冷凍便(ヤマト運輸)
    　送付先1お届け希望日：${this.orderMethod.delivDate}
    　送付先1お届け希望時間：${this.deliv_time(this.orderMethod.delivTime)}
    ■通信欄
    ${this.orderMethod.note}

    `

}


console.dir(body)


            var bcc = ['l@adop.co.jp','adop.tokyo@gmail.com']

            var from = {
                mail   : 'houmai@line.cx',
                header : '目黒ぎょうざ宝舞 LINE',
                name   : '目黒ぎょうざ宝舞'
            }

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

                    this.getCartSession()

                }.bind(this))
                .catch((err) => {

                    console.dir(err)

                })
                .finally(function(){

                }.bind(this))










        },

        codPrice : function(targetPrice){

            ///////////////////////////////////
            if( targetPrice < 10000 ) return 330
            if( targetPrice > 99999 ) return 1100
            if( 9999 < targetPrice && targetPrice < 30000 ) return 440
            if( 29999 < targetPrice && targetPrice < 99999 ) return 660

        },




        getCartSession : function(){

        this.setStripeToken('')
        this.setOrderMethod('')
        this.setSession('')


            const params = new URLSearchParams()
            params.append( 'token'  , process.env.INFO_TOKEN )
            params.append( 'action' , 'getCartSession' )
            params.append( 'userProfile' , JSON.stringify( this.userProfile ) )

            axios.post( process.env.MAIN_API , params )
                .then( function(result){

                    if( result.data == null ){

                        this.clearCart()

                    }
                    else{

                        this.setSession(result.data[0].session_id)

                        let cartData = JSON.parse( JSON.stringify( result.data ) )
                        cartData.forEach( v => {
                            delete v.cart_id
                            delete v.isActive
                            delete v.session_id
                            delete v.updateDate
                            delete v.userId
                            v.productQuantity = Number(v.productQuantity)
                        })

                        this.cartInit(cartData)

                    }


                }.bind(this))
                .catch((err) => {

                    console.dir(err)

                })
                .finally(function(){

                    this.loading = false

                }.bind(this))


        },

        ////// HELPER ///////
        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },
        noshigami : function( value ){

            if( value == 'seibo' ) return 'お歳暮'
            if( value == 'chugen' ) return 'お中元'
            if( value == 'iwai' ) return 'お祝い'
            if( value == 'none' ) return 'なし'
        },
        deliv_time : function( value ){

            if( value == 'none' ) return '指定なし'
            if( value == '0012' ) return '午前中'
            if( value == '1416' ) return '14:00 - 16:00'
            if( value == '1618' ) return '16:00 - 18:00'
            if( value == '1820' ) return '18:00 - 20:00'
            if( value == '1921' ) return '19:00 - 21:00'
        },
        getPaymentMethod : function(value){

            if( value == 'card' ) return 'クレジットカード'
            if( value == 'bank' ) return '銀行振込'
            if( value == 'cod' ) return '代引き'

        },
        getProductData : function(pid){

            return this.products.find( v => Number(v.pid) == Number(pid) )

        },






        closeApp : function(){

            liff.closeWindow()

        }

    },

};
</script>
<style>
[app-index]{position:fixed;min-height: -webkit-fill-available;overflow: hidden;}
[app-index] > img{margin-top:-15vh;}
[success-msg]{color: #FFF;}
</style>
