<template>
  <transition name="el-fade-in-linear">

		<div input-address>
            <Loading v-if="loading" />

                    <div input-conponent conponent-split>
                        <label>郵便番号</label>
                        <div>
                            <input type="tel" value="" v-model="address.zip1" zip-1 maxlength="3" ref="input_zip1">
                            <span>-</span>
                            <input type="tel" value="" v-model="address.zip2" zip-2 maxlength="4" ref="input_zip2">

                            <el-button size="mini" zip-search @click="drawer = !drawer">〒検索</el-button>
                        </div>
                    </div>

                    <div input-conponent conponent-split>
                        <label>都道府県</label>
                        <input type="text" v-model="address.pref" disabled ref="input_pref">
                    </div>

                    <div input-conponent conponent-split>
                        <label>市区町村</label>
                        <input type="text" v-model="address.city" disabled="disabled" ref="input_city">
                    </div>

                    <div input-conponent conponent-split>
                        <label>住所</label>
                        <input type="text" v-model="address.street" ref="input_street">
                    </div>

                    <div input-conponent conponent-split>
                        <label>番地</label>
                        <input type="text" v-model="address.address" placeholder="1-1-1" ref="input_address">
                    </div>

                    <div input-conponent conponent-split>
                        <label>建物名<br>部屋番号等</label>
                        <input type="text" v-model="address.addition" placeholder="〇〇アパート 504" ref="input_addition">
                    </div>

                    <div input-conponent conponent-split>
                        <label>電話番号</label>
                        <input type="tel" v-model="address.tel" maxlength="11" placeholder="09011223344" ref="input_tel">
                    </div>

                    <div input-conponent conponent-split>
                        <label>お届け先名</label>
                        <input type="text" v-model="address.shippingName" placeholder="宝舞 太郎" ref="input_name" v-on:blur="sendShippingData">
                    </div>

            <el-drawer
              :visible.sync="drawer"
              :direction="direction"
              :with-header="false">
              <Zipfind @findzip="useZip"/>
            </el-drawer>

		</div>
  </transition>
</template>

<script>
import axios from 'axios'
import jsonp from 'axios-jsonp'

import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    props : [ 'isMaster' , 'sid' , 'sub' ],
    data() {
        return {
            address : {
                sid          : '',
                zip1         : '',
                zip2         : '',
                pref         : '',
                prefCode     : '',
                city         : '',
                street       : '',
                address      : '',
                addition     : '',
                tel          : '',
                shippingName : '',
            },

            /////
            drawer    : false,
            direction : 'btt',

            /////
            valid : false,

            loading : false,

            activeNames: [],

            zipToAddressData : '',

        }
    },
    mounted(){

        this.address.sid = this.sid

        if( this.userShipping.master != null && this.isMaster ){

            let d = JSON.parse( JSON.stringify( this.userShipping.master ) )

            this.address = {
                sid          : d.sid,
                zip1         : d.zip1,
                zip2         : d.zip2,
                pref         : d.pref,
                prefCode     : d.prefCode,
                city         : d.city,
                street       : d.street,
                address      : d.address,
                addition     : d.addition,
                tel          : d.tel,
                shippingName : d.shippingName
            }

        }

        if( this.sub != '' && this.sid != '' ){

            let d = JSON.parse( JSON.stringify( this.sub ) )

            this.address = {
                sid          : d.sid,
                zip1         : d.zip1,
                zip2         : d.zip2,
                pref         : d.pref,
                prefCode     : d.prefCode,
                city         : d.city,
                street       : d.street,
                address      : d.address,
                addition     : d.addition,
                tel          : d.tel,
                shippingName : d.shippingName
            }

        }

        if( this.sub != '' && this.sid == '' ){

            this.activeNames.push('1')

        }



    },
    watch : {

        address: {
            handler: function (val) {

                // focusを下4桁へ移動

                if ( !/^\d{3}$/.test(val.zip1) || !/^\d{4}$/.test(val.zip2) ){

                    this.address.pref     = ''
                    this.address.prefCode = ''
                    this.address.city     = ''
                    this.address.street   = ''

                }

                if ( /^\d{7}$/.test(val.zip1 + val.zip2) ){


                    //var obj = this.zipToAddress(val.zip1 + val.zip2)
                    //console.dir(this.zipToAddressData)


                    axios.get( process.env.ZIP_API , {
                        params: { zipcode : val.zip1 + val.zip2 },
                        adapter: jsonp,
                    }).then(function(res){

                        if( res.data != 'null' ){

                            this.address.pref     = res.data.results[0].address1
                            this.address.prefCode = res.data.results[0].prefcode
                            this.address.city     = res.data.results[0].address2
                            this.address.street   = res.data.results[0].address3

                        }

                    }.bind(this))
                    .catch(function(responce){ console.dir(responce); })
                    .finally(function(){

                        //this.loading = true
                        //this.loading = false

                    }.bind(this))



                }

                // 電話番号は数字以外を削除
                const regex = /\D+/g;
                this.address.tel = val.tel.replace( regex , '' )


                this.valid = this.validation()

            },
            deep: true
        }

    },
    created(){

    },

    computed: {

        addTitle(){

            if( this.address.shippingName == '' ){

                return '新規お届け先登録'

            }
            else{

                return 'お届け先 : ' + this.address.shippingName + ' さま'

            }



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

        zipToAddress : function(zip){

            return axios.get(`${process.env.MAIN_API}/aec/const-zips?zip=${zip}`, {
              params: {token: process.env.INFO_TOKEN}
            } ).then( function(result){

                    this.zipToAddressData = result.data

                }.bind(this))
                .catch((err) => {

                    console.dir(err)

                })
                .finally(function(){

                }.bind(this))

        },

        useZip : function(val){

            this.loading = true

            val = String(val)
            this.address.zip1 = val.substring( 0, 3 )
            this.address.zip2 = val.substring( 3, 7 )

            axios.get( process.env.ZIP_API , {
                params: { zipcode : this.address.zip1 + this.address.zip2 },
                adapter: jsonp,
            }).then(function(res){

                if( res.data != 'null' ){

                    this.address.pref     = res.data.results[0].address1
                    this.address.prefCode = res.data.results[0].prefcode
                    this.address.city     = res.data.results[0].address2
                    this.address.street   = res.data.results[0].address3

                }

            }.bind(this))
            .catch(function(responce){ console.dir(responce); })
            .finally(function(){

                this.loading = false
                this.drawer = false

            }.bind(this))


        },

        validation : function(){

            if( this.address.zip1 == '' ) return false
            if( this.address.zip2 == '' ) return false
            if( this.address.pref == '' ) return false
            if( this.address.prefCode == '' ) return false
            if( this.address.city == '' ) return false
            if ( /^\d{3}$/.test(this.address.zip1) && !/^\d{4}$/.test(this.address.zip2) ) return false
            if( this.address.street == '' ) return false
            if( this.address.address == '' ) return false
            if( this.address.tel == '' ) return false
            if( this.address.shippingName == '' ) return false

                return true

        },

        sendShippingData :function(){

            if( this.validation ){


                this.saveShipping()

            }

        },

        saveShipping : function(){

            this.loading = true

            const params = new URLSearchParams()
            params.append( 'token'        , process.env.API_TOKEN )
            params.append( 'action'       , 'saveMasterShipping' )
            params.append( 'address'      , JSON.stringify( this.address )  )
            params.append( 'userProfile'  , JSON.stringify( this.userProfile )  )

            axios.post( process.env.API_URL , params )
                .then( function(result){

                   this.setUserShipping(result.data)

                }.bind(this))
                .catch((err) => {

                    console.dir(err)

                })
                .finally(function(){

                    this.loading = false

                }.bind(this))

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
</style>
