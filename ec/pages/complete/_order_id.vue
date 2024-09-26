<template>
    <div center-col full-height pl-2 pr-2>
        <Loading v-if="loading" />

        <!--<img src="/mainlogo-w.svg">-->

        <h1 mb-3 mt-3 success-msg>
            商品のご注文が完了しました。<br>
            <span style="font-size:0.9em;color:#FFF;font-weight:600;margin-top:0.4em;display:inline-block;">
            ご注文内容をトークルームに送信しました。<br>
            注文番号：{{config.app_code}}-{{oid}}
            </span>
        </h1>

        <el-button mt-1i @click="goTop">アプリトップへ</el-button>

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

        this.oid = this.$route.params.order_id

    },
    data: () => {
        return {
            loading: true,
            oid : '',
        }
    },
    mounted(){

        this.getAppConfig()
        this.loading = false



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

        /* アプリ設定の読み込み
        *****************************************************/
        getAppConfig: async function( app_code ){

            await axios.get( process.env.MAIN_API + '/appConfig/' + this.$route.query.app ).then( function(result){

                if( result.data.length > 0 ){

                    this.setConfig(result.data[0])
                    this.getOrder()

                }

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        getOrder : function(){

            var order = new URLSearchParams()
            order.append( 'order_id' , this.oid )
            axios.post( process.env.MAIN_API + '/getOrder' , order ).then( function(result){

                console.dir(result.data)

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){  }.bind(this))

        },

        goTop : function(){

            this.$router.push('/?app=' + this.config.app_code)

        },

        closeApp : function(){

            liff.closeWindow()

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


    },

};
</script>
<style>
[app-index]{position:fixed;min-height: -webkit-fill-available;overflow: hidden;}
[app-index] > img{margin-top:-15vh;}
[success-msg]{color: #FFF;}
</style>
