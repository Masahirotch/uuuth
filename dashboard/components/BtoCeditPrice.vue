<template>
    <div>
        <div price-list v-for=" (a) in productData.prices">
            <h6>販売先公式アカウント : {{appName(a.app_id)}}</h6>
            <dl price-setting>
               <dt> 出品時の価格</dt>
               <dd yen-tax><el-input placeholder="価格" v-model="a.price" text-right @keypress="validate" @input="a.price=format(a.price)"></el-input></dd>
               <dt>消費税率 (%)</dt>
               <dd><el-input placeholder="%" v-model="a.tax_rate" text-right @keypress="validate" @input="a.tax_rate=format(a.tax_rate)"></el-input></dd>
               <dt>販売しない / する</dt>
               <dd><el-switch v-model="a.active_flg"></el-switch></dd>
            </dl>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'
export default {

    mixins:[util],

    props : [ 'productData' ],

    data() {
        return {

        }
    },
    watch:{

        productData: {

            handler: function (val) {

            },
            
            deep: true
        
        },

    },

    mounted(){

        var prices      = JSON.parse( JSON.stringify( this.productData.prices ))
        var appArray = JSON.parse( JSON.stringify( this.appList.map( a => { return a.app_id } ) ))
        var newPrices = appArray.map( a => {

            if( prices.find( p => p.app_id == a ) ){

                return prices.find( p => p.app_id == a )

            }
            else{

                return {
                    active_flg : false,
                    app_id     : a,
                    price      : null,
                    price_id   : null,
                    product_id : this.productData.product_id,
                    tax_rate   : null,
                }

            }

        })

        this.productData.prices = newPrices

    },
    
    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['products' , 'appList' ]),

    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setProducts' , 'setAppList' ]),

        appName : function( app_id ){

            return this.appList.find( a => a.app_id == app_id ).app_name 

        },




    },
};
</script>
<style scoped>

[price-list]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: flex-start; align-items: flex-start;
}
[price-list] > h6{
    padding:0.6em 0 0 1em;
}

[big-dialog] .el-dialog .el-dialog__body dl[price-setting]{width:100%;}
[big-dialog] .el-dialog .el-dialog__body dl[price-setting] dt{width:12em;}
[big-dialog] .el-dialog .el-dialog__body dl[price-setting] dd{width:10em;}
[big-dialog] .el-dialog .el-dialog__body dl[price-setting] dd:nth-of-type(2){width:5em;}
[big-dialog] .el-dialog .el-dialog__body dl[price-setting] dd:nth-of-type(3){width:8em;}


[big-dialog] .el-dialog .el-dialog__body dl dd[yen-tax]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    min-width:15em;

}
[big-dialog] .el-dialog .el-dialog__body dl dd[yen-tax]::after{
    content:"円（税込）";
    min-width:7em;
    margin-top:1em;
    margin-left:1em;
}


</style>