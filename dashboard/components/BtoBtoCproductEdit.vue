<template>
     <div product-edit>

        <div list-box>

            <div list-image>
                <img :src="productImage">
            </div>

            <div list-title>
                {{product.product_name}}
            </div>

        </div>

        <div right-box>
            <div status-switch pr-2>
                <span switch-false :class='{ active : !isSale }'>休止中</span>
                <el-switch
                  v-model="product.is_sale"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  @change="changeSaleStatus">
                </el-switch>
                <span switch-true :class='{ active : isSale }'>販売中</span>
            </div>

            <el-button type="primary" size="mini" @click="openDialog">編集</el-button>
            <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="productDelete" ml-2i></el-button>
        </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'product' ],

    data() {

        return {



        }

    },
    watch:{


    },
    mounted(){


    },
    
    computed: {

        productImage : function(){

            return ( this.product.product_image.thumb_url != void 0 )? this.product.product_image.thumb_url : '/dummy.jpg'

        },
        isSale : function(){

            return this.product.is_sale

        },

        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders' , 'articles' ]),
    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' , 'setArticles' ]),

        /* ステータスの変更
        ***************************/
        changeSaleStatus : function(){

            this.$emit( 'changeSaleStatus' , this.product )

        },

        /* ダイアログ
        ***************************/
        openDialog : function(){

            this.$emit( 'openDialog' , this.product )

        },

        /* 削除する
        ***************************/
        productDelete : function(){

            this.$emit( 'productDelete' , this.product )

        }















    },
};
</script>
<style scoped>
[product-edit]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    padding:1em;
    border-radius:0.4em;
    border:1px solid #efefef;
    margin-bottom:1em;
    background:#FFF;
    filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.15) );
    width:100%;
}

[list-box]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

[list-image]{
    width:60px;
    height:60px;
}
[list-image] img{
    width:100%;
    height:100%;
    object-fit : cover;
}

[list-title]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row wrap;flex-flow:row wrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    padding:0 2em;
}


[right-box]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

[status-switch]{
    display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

[status-switch] [switch-false],[status-switch] [switch-true]{
    font-size:13px;
    font-weight:bold;
    display:inline-block;
    padding:0.2em 0.5em 0 0.5em;
    color:#CCC;
}

[status-switch] [switch-false].active{
    color:rgb(255, 73, 73);
}
[status-switch] [switch-true].active{
    color:rgb(19, 206, 102);
}







</style>