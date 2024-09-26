<template>
    <div zip-find pb-4 pl-1 pr-1>
        <h4>郵便番号検索</h4>

            <div input-conponent conponent-split>
                <label>都道府県</label>
                <select v-model="selectPref">
                    <option value="" disabled>選択</option>
                    <option :value="item.pref_code" v-for="item in pref">{{item.jp}}</option>
                </select>
            </div>

            <div input-conponent conponent-split>
                <label>市区町村</label>
                <select v-model="selectCity">
                    <option value="" disabled>選択</option>
                    <option :value="item.cityCode" v-for="item in city">{{item.cityName}}</option>
                </select>
            </div>

            <div input-conponent conponent-split>
                <label>地域</label>
                <select v-model="selectStreet">
                    <option value="" disabled>選択</option>
                    <option :value="item.zip" v-for="item in street">{{item.sectionName}}</option>
                </select>
            </div>

               <div input-conponent conponent-split>
                <label>郵便番号</label>
                <div conponent-split v-if="selectStreet != '' ">
                    <div>{{selectStreet}}</div>
                    <p btn-mini @click="useZip">この番号を使う</p>
                </div>
            </div>
    </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    data: () => {
        return {
            pref   : '',
            city   : '',
            street : '',

            selectPref   : '',
            selectCity   : '',
            selectStreet : ''
        }
    },
    mounted(){

        this.getPref()

    },
    watch : {
        selectPref : function(val){

            if(val != ''){

                this.getCities(val)

            }

        },
        selectCity : function(val){

            if(val != ''){

                this.getStreet(val)

            }

        },



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


        getPref : function(){

            var db = new URLSearchParams()
            axios.post( process.env.MAIN_API + '/getConstPref' , db ).then( function(result){

                this.pref = result.data

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){

            }.bind(this))

        },

        getCities : function(pref_code){

            var db = new URLSearchParams()
            db.append( 'prefCode' , pref_code )
            axios.post( process.env.API + 'getCitiesByPrefcode' , db ).then( function(result){

                this.city = result.data

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){

                this.street = ''
                this.selectStreet = ''

            }.bind(this))

        },

        getStreet : function(city_code){

            var db = new URLSearchParams()
            db.append( 'cityCode' , city_code )
            axios.post( process.env.API + 'getStreetsByCitycode' , db ).then( function(result){

                this.street = result.data

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){

                this.selectStreet = ''

            }.bind(this))

        },

        useZip : function(){

            this.$emit( 'findzip' , this.selectStreet )

        }





    },

};
</script>
<style>
[zip-find]{width:100%;min-height: 50vh;}
[zip-find] *,[zip-find] label{color: var(--bg) !important;}

[zip-find] h4{padding: 0.5em 1em;font-size: min(3.2vmin , 13px);}

[page-content] [zip-find] [conponent-split] select{
    border: 1px solid var(--bg);
    background: #FFF;
    color:var(--bg);
    -webkit-text-fill-color: var(--bg);
    opacity: 1;
}


[zip-find] [conponent-split] select option{color:var(--main-color); }
[zip-find] [conponent-split] select:disabled::placeholder{color:var(--main-color); }

[zip-find] [btn-mini]{
    border: 1px solid var(--bg);
    background:var(--text-color);
    color:var(--bg);
}

[zip-find] [btn-mini]:focus,[zip-find] [btn-mini]:active{
    border: 1px solid var(--bg);
    background: var(--bg);
    color:var(--text-color);
}



</style>
