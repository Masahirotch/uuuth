<template>
     <div order-item>
        <dl orderlist-detail>
            <dd order-check><el-checkbox v-model="detail.checked"></el-checkbox></dd>
            <dd order-id># {{detail.order_id}}</dd>
            <dd order-date>{{jpDateMonthDay(detail.order_date)}}</dd>
            <dd order-linename>{{detail.displayName}}</dd>
            <dd order-app>{{app_name(detail.order_app_id)}}</dd>
            <dd order-detail>
                <span v-for="cart in detail.order_cart" cart-item>
                    <span>{{productName(cart.product_id)}}</span>
                    <span style="padding-left:0.5em;padding-right:0.5em;">×</span>
                    <span>{{cart.quantity}}</span>
                </span>
            </dd>
        </dl>
    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'detail' ],

    data() {

        return {


        }

    },
    watch:{


    },
    mounted(){
        
        //console.dir( this.detail )

    },
    
    computed: {




        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' , 'setArticles' ]),

        app_name : function( app_id ){

            var targetApp = this.apps.find( app => app.app_id == app_id )
            return targetApp.app_name

        },

        productName : function( product_id ){

            var targetProduct = this.products.find( product => product.product_id == product_id )
            return targetProduct.product_name

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
    padding:12px 0.1em;
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
    padding : 12px;
    width: auto;
}

dd[order-check]{width:5%;}
dd[order-id]{ width:10%; }
dd[order-date]{ width:10%; }
dd[order-linename]{ width:15%; }
dd[order-app]{ width:20%; }
dd[order-detail]{ width:40%;font-size: 14px;font-weight: 600;}


[cart-item]{
    width: 100%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
}







</style>