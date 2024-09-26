<template>
<div input-address>

    <Loading v-if="loading" :text="text"/>

    <el-collapse >

        <el-collapse-item :title="addTitle" name="1">

            <div input-conponent conponent-split>
                <label>郵便番号</label>
                <input type="tel" v-model="shipping.zip" input-zip maxlength="7" >
                <button zip-address @click="zipToAddress">〒検索</button>
            </div>

            <div input-conponent conponent-split>
                <label>都道府県</label>
                <input v-model="shipping.pref" type="text">
            </div>

            <div input-conponent conponent-split>
                <label>市区郡町村</label>
                <input type="text" v-model="shipping.city">
            </div>

            <div input-conponent conponent-split>
                <label>住所</label>
                <input type="text" v-model="shipping.street">
            </div>

            <div input-conponent conponent-split>
                <label>番地</label>
                <input type="text" v-model="shipping.address" placeholder="1-1-1" >
            </div>

            <div input-conponent conponent-split>
                <label>建物名<br>部屋番号等</label>
                <input type="text" v-model="shipping.addition" placeholder="〇〇アパート 504" >
            </div>

            <div input-conponent conponent-split>
                <label>電話番号</label>
                <input v-model="shipping.tel_1" type="tel" maxlength="5">
                <span tel-hyphen>-</span>
                <input v-model="shipping.tel_2" type="tel" maxlength="4">
                <span tel-hyphen>-</span>
                <input v-model="shipping.tel_3" type="tel" maxlength="4">
            </div>

            <div input-conponent conponent-split>
                <label>お届け先名</label>
                <input type="text" v-model="shipping.name" placeholder="お届け先名" >
            </div>


            <div send-btnarea pt-3i pb-3i conponent-split>
                <p btn-default @click="deleteShipping" mr-1>削除する</p>
                <p btn-white @click="updateAddress" ml-1 :disabled="isUpdate">この内容で更新</p>
            </div>

        </el-collapse-item>

    </el-collapse>

</div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

export default {
    props : ['shipping'],
    data() {
        return {
            loading : false,
            text    : '処理しています...'
        }
    },
    created(){



    },
    mounted(){


    },
    watch : {

        shipping: {

            handler: function (val) {

                // 数字のみ
                const regex = /\D+/g;
                this.shipping.zip = ( val.zip ? val.zip.replace( regex , '' ) : '' )
                this.shipping.tel_1 = ( val.tel_1 ? val.zip.replace( regex , '' ) : '' )
                this.shipping.tel_2 = ( val.tel_2 ? val.zip.replace( regex , '' ) : '' )
                this.shipping.tel_3 = ( val.tel_3 ? val.zip.replace( regex , '' ) : '' )

                // 市外局番
                const areaCode = /^0[1-9]\d/g;
                const start    = /^0[1-9]/g;

                if( val.tel_1.length > 2 ){

                    if( !areaCode.test( val.tel_1 ) ){

                        this.shipping.tel_1 = '0';//val.tel_1.substring( 0 , 1 )

                    }

                }

            },

            deep: true

        }

    },


    computed: {

        addTitle : function(){

            return ( this.shipping.name == '' )? '新規お届け先登録' : this.shipping.name

        },

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

        /* 郵便番号から住所を取得する
        ******************************************************/
        zipToAddress : function(){

            this.loading = true

          axios.get(`${process.env.MAIN_API}/aec/const-zips?zip=${this.shipping.zip}`, {
            params: {token: process.env.INFO_TOKEN}
          }).then( function(result){

                if( result.data ){

                    this.shipping.pref       = result.data.prefName
                    this.shipping.pref_code  = result.data.prefCode
                    this.shipping.city       = result.data.cityName
                    this.shipping.street     = result.data.printName

                }

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){ this.loading = false; }.bind(this))

        },

        /* このお届け先を削除する
        ******************************************************/
        deleteShipping : function(){

            this.$confirm(
            'この操作は取り消せません',
            '削除しますか？', {
                confirmButtonText: '削除する',
                cancelButtonText: 'キャンセル',
                type: 'warning'
            }).then(() => {

                this.$emit( 'deleteShipping' , this.shipping )

            }).catch(() => { });

        },

        /* お届け先を更新
        ******************************************************/
        updateAddress : function(){

            if( !this.isUpdate() ) {

                this.$message.error('入力項目が不完全です');
                return

            }

            var prefcode_list = this.shippingTable.map( p => { return p.pref_code })

            if( !prefcode_list.includes(this.shipping.pref_code) ){

                this.$message.error('お届けできない地域です');
                return

            }

            this.loading = true

            var db = new URLSearchParams()
            db.append( 'shipping'    , JSON.stringify( this.shipping ) )
            axios.post( process.env.MAIN_API + '/saveShipping' , db ).then( function(result){

                if( result.data.insertId != void 0 && result.data.insertId > 0 ){

                    this.shipping.shipping_id = result.data.insertId

                }

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){ this.getUserShipping(); }.bind(this))

        },

        /* ユーザーが登録している配送先住所を呼び出して更新する(全体)
        *****************************************************/
        getUserShipping : function(){

            var db = new URLSearchParams()
            db.append( 'userProfile' , JSON.stringify( this.userProfile ) )
            axios.post( process.env.MAIN_API + '/getUserShipping' , db ).then( function(result){

                this.setUserShipping(result.data)

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){

                this.loading = false;

                this.$message({
                  message: '更新しました',
                  type: 'success'
                });

            }.bind(this))

        },

        /* 更新ボタンDisabled 判定
        *****************************************************/
        isUpdate : function(){

            if(
                this.shipping.address   != '' &&
                this.shipping.city      != '' &&
                this.shipping.name      != '' &&
                this.shipping.pref      != '' &&
                this.shipping.pref_code != '' &&
                this.shipping.street    != '' &&
                this.shipping.tel_1     != '' &&
                this.shipping.tel_2     != '' &&
                this.shipping.tel_3     != '' &&
                this.shipping.userId    != '' &&
                this.shipping.zip       != ''

            ) return true

            else{

                return false

            }

        },






    }

};
</script>

<style scoped>
[input-conponent] input[input-zip]{
    width: 6em;
    max-width: 6em;
}
[input-conponent] input[input-zip] + button[zip-address]{
    border:1px solid var(--text-color);
    background:var(--bg);
    color: var(--text-color);
    width:6em;
    border-radius :0.4em;
    margin-left:2em;
    height:2em;
}

[input-conponent] input[input-zip] + button[zip-address]:hover,
[input-conponent] input[input-zip] + button[zip-address]:active{
    background:var(--text-color);
    color: var(--bg);
}
[tel-hyphen]{
    width:5em;
    display: flex;
    flex-flow:row nowrap;
    justify-content: center;
    align-items: center;
}

</style>
