<template>
  <transition name="el-fade-in-linear">
	<div payment-box>

        <Loading v-if="loading" :text="text"/>

        <div>
            <dl card-lists>
                <dt>ご利用可能なカード</dt>
                <dd>
                    <img src="/img/visamasteramex.svg"/>
                </dd>
            </dl>
        </div>

        <form action="#" method="post" id="payment-form" pl-1 pr-1 pt-2>
          <div error-message>{{ cardErrorMessage }}</div>
          <div id="card-element"></div>
          <div spacer2></div>
            <div payment-send>
              <button button
                @click="submit" id="checkout-button"
                v-bind:disabled="isProcessing || !cartCount"
                :class="{sending : isProcessing}"
                v-if="isDoPayment"
                ><i class="el-icon-loading" v-if="isProcessing" main-color></i>{{button}}</button>
                <div btn-green v-if="!isDoPayment" ><i class="el-icon-success" w-padding></i>決済完了</div>
            </div>
        </form>

	</div>
  </transition>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    /*
    head() {
        return {
            script: [
                { src: 'https://js.stripe.com/v3/' },
            ],
        }
    },
    */
    props : ['price', 'order_id'],
    data() {
        return {

            loading : false,
            text    : '処理しています...',

            button : 'お支払い',

            token: '',
            cardData: {
                name             : null,
                number           : null,
                expiration_month : null,
                expiration_year  : null,
                security_code    : null
            },

            card : '',

            cardErrorMessage: '',
            isProcessing : false,
            isDoPayment  : true,

            client_secret : '',

        }
    },
    mounted(){

        /////////////////////////////
        var style = {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        };

        // Create an instance of Elements.
        if (this.$stripe) {
            var elements = this.$stripe.elements()
            if (elements) {
                this.card = elements.create( 'card',  { style: style, hidePostalCode: true , iconStyle : 'solid' } )
                if (this.card) {
                    this.card.mount('#card-element')
                    this.card.on('change', this.showCardError )
                } else { this.stripeError() }
            } else { this.stripeError() }
        } else { this.stripeError() }



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

        // stripe , show card error
        showCardError(event) {

            if (event && event.error) {

                this.cardErrorMessage = event.error.message

            } else {

                this.cardErrorMessage = ''

            }

        },

        // トークン取得
        submit() {

            console.dir('▶︎ submit')

            this.loading = true
            this.button = '処理しています'
            this.isProcessing = true
            this.cardErrorMessage = ""
            this.checkout()

        },

        // サーバー処理
        checkout () {

            console.dir('▶︎ checkout')

            var price = parseInt( ( this.price ) , 10 )
            var payments = new URLSearchParams()

            payments.append( 'amount'   , price )
            payments.append( 'currency' , 'jpy' )
            payments.append( 'userId'   , this.userProfile.userId )

            axios.post( process.env.MAIN_API + '/createPaymentIntents' , payments ).then( function(result){

                this.client_secret = result.data.client_secret
                this.$emit('registOrder')

            }.bind(this))
            .catch((err) => {

                this.cardErrorMessage = err.message
                this.button = 'お支払い'
                this.isProcessing = false
                this.loading = false

            })

        },

        confirm : function(){

            if (! (this.card && this.$stripe) ) this.$emit( "cancelOrder" , "エラーが発生しました　下の [お届け・決済選択に戻る] をタップして前の画面からやり直してください" )

            var card = this.card

            this.$stripe.confirmCardPayment( this.client_secret , {
                payment_method: {
                  card: card,
                  billing_details: {
                    name  : this.userProfile.displayName,
                    phone : this.userProfile.userId
                  },
                },
            })
            .then(function(result) {
                this.setStripe( result )

            }.bind(this))
            .catch( function(err){
                console.log(err)
                this.$emit( 'cancelOrder' , err.text || err.message)
            }.bind(this))
        },

        setStripe : function(result){

            console.log(result)

            this.setStripeToken(result.paymentIntent)

            if( result.paymentIntent && result.paymentIntent.status == 'succeeded' ){
                this.$emit( 'paymentDetail' , result )
                this.$emit( 'completeOrder' )
            } else {
                this.$emit( 'cancelOrder' , result.error.text || result.error.message)
            }

        },

        complete : function(text){
            console.log("complete")
            this.loading = false
            this.isProcessing = false
            this.button = '決済が完了しました'
            this.isDoPayment = false
            if (this.card) {
                this.card.clear()
                this.card.unmount()
            }
            if (text) this.cardErrorMessage = text
        },

        cancel : function(text){
            console.log("cancel")
            console.log(text)
            this.loading = false
            this.isProcessing = false
            this.button = '決済処理に失敗しました'
            if (text) this.cardErrorMessage = text
        },

        stripeError : function() {
            this.$emit( 'endLoading' )
            this.cancel("エラーが発生しました　下の [配送・決済選択に戻る] をタップして前の画面からやり直してください")
        },

        /* helper
        ***********************************************************/
        nl2br(value) {

           if(value != undefined){

              if( value.indexOf('http') != -1 ){

                var exp = /(http(s)?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                var test = value.replace( exp , "<a href='$1"+"?openExternalBrowser=1"+"' target='_blank'>$1</a>")
                return test.replace(/\r?\n/g, '<br>')
                //return linkUrl.link(linkUrl + '?openExternalBrowser=1')

              }
              else{

                return value.replace(/\r?\n/g, '<br>')

              }


           }

        },

        // getSrc : function(id){

        //     var temp = JSON.parse( JSON.stringify( this.products ) )
        //     let target = temp.find( p => Number(p.pid) == Number(id) )

        //     return '/products/' + target.productId + '.jpg'

        // },

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
[card-pay]{background: #FFF;padding-top: 1em;margin-top: 1em;border-radius: 6px;border: 1px solid var(--grayColor);}
[card-pay] [card-header]{font-size:15px;font-weight:bold;color:var(--main-color); padding: 1em;}
[stripe-logo]{width: 100%;display:flex; flex-flow:row nowrap;justify-content: space-between;align-items:center;}
[stripe-logo] img{width: 25%;}
[card-lists] {display: flex; flex-flow:row nowrap; justify-content: center; align-items: center;padding: 0 1em;}
[card-lists] dt{width: 100%;font-size: 14px;color: #222;}
[card-lists] dd{width: 100%;}
#card-element{padding-bottom: 0.4em;border-bottom: 1px dashed var(--main-color);}
[payment-send]{padding: 2em 0 2em 0;}
[error-message]{font-size:13px;font-weight:600;color:#f56c6c;}
#checkout-button{
    border: 1px solid var(--bg);
    color: var(--bg);
    font-size: 15px;padding: 0.4em;border-radius: 6px;transition: all 0.4s ease;
    width: 100%;margin: 0;display: flex; flex-flow:row nowrap;justify-content: center;align-items:center;
}
#checkout-button:active{color:FFF;background: var(--main-color);transition: all 0.1s ease;}
[btn-green]{
    border: 1px solid #67c23a;color: #FFF;background: #67c23a;
    font-size: 15px;padding: 0.4em;border-radius: 6px;transition: all 0.4s ease;
    width: 100%;margin: 0;display: flex; flex-flow:row nowrap;justify-content: center;align-items:center;
}
[btn-green] i{margin: 0 0.5em;}
[main-color],[main-color] *{color: var(--main-color);}
#payment-request-button {margin: 50px auto;width: 200px;}
[pt-05]{padding-top:.5em}[pt-1]{padding-top:1em}[pt-2]{padding-top:2em}[pt-3]{padding-top:3em}[pt-4]{padding-top:4em}[pt-5]{padding-top:5em}[pl-05]{padding-left:.5em}[pl-1]{padding-left:1em}[pl-2]{padding-left:2em}[pl-3]{padding-left:3em}[pl-4]{padding-left:4em}[pl-5]{padding-left:5em}[pb-05]{padding-bottom:.5em}[pb-1]{padding-bottom:1em}[pb-2]{padding-bottom:2em}[pb-3]{padding-bottom:3em}[pb-4]{padding-bottom:4em}[pb-5]{padding-bottom:5em}[pr-05]{padding-right:.5em}[pr-1]{padding-right:1em}[pr-2]{padding-right:2em}[pr-3]{padding-right:3em}[pr-4]{padding-right:4em}[pr-5]{padding-right:5em}[pt-05i]{padding-top:.5em!important}[pt-1i]{padding-top:1em!important}[pt-2i]{padding-top:2em!important}[pt-3i]{padding-top:3em!important}[pt-4i]{padding-top:4em!important}[pt-5i]{padding-top:5em!important}[pl-05i]{padding-left:.5em!important}[pl-1i]{padding-left:1em!important}[pl-2i]{padding-left:2em!important}[pl-3i]{padding-left:3em!important}[pl-4i]{padding-left:4em!important}[pl-5i]{padding-left:5em!important}[pb-05i]{padding-bottom:.5em!important}[pb-1i]{padding-bottom:1em!important}[pb-2i]{padding-bottom:2em!important}[pb-3i]{padding-bottom:3em!important}[pb-4i]{padding-bottom:4em!important}[pb-5i]{padding-bottom:5em!important}[pr-05i]{padding-right:.5em!important}[pr-1i]{padding-right:1em!important}[pr-2i]{padding-right:2em!important}[pr-3i]{padding-right:3em!important}[pr-4i]{padding-right:4em!important}[pr-5i]{padding-right:5em!important}[nobr]{display:inline-block !important;}
*:not(input,textarea){user-select: none;}
[payment-send] button{
	--line        : #00B900;
	--main-color  : #FFF;
    --main-light  : #13448f;
    --bg          : #0f2e5d;
    --bg-light    : #13448f;
    --text-color  : #FFF;
    --footer-text : #13448f;
    --cart-btn    : #FFF;
    --cart-btn-bg : #0f2e5d;
    --cart-btn-light: #13448f;
    background: 0 0;
}
</style>
