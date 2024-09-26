<template>
  <transition name="el-fade-in-linear">

    <div item-box>
        <div split-box>
            <div left-box>
                <img :src="productPict">
            </div>
            <div right-box>
                <h3>{{productName}}</h3>
                <h4>{{productCode}}</h4>
            </div>
        </div>

        <div item-detail>
            <dl>
                <dt>商品単価</dt>
                <dd><span big-text>{{product.price|number_format}}</span><span yen-mark>円</span></dd>
            </dl>
            <dl>
                <dt>数量</dt>
                <dd>
                    <span big-text>{{productQuantity|number_format}}</span><span yen-mark>個</span>
                </dd>
            </dl> 
            <dl>
                <dt>商品小計</dt>
                <dd><span big-text>{{productTotal|number_format}}</span><span yen-mark>円</span></dd>
            </dl>

            <div cartbtn-split>
                <div cart-btn @click="subtractCart">- 商品を減らす</div>
                <div cart-btn @click="addCart">商品を増やす +</div>
            </div>

        </div>
    </div>

  </transition>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

export default {

    props : ['product'],

    data() {
      return {

        target : '',

      }
    },
    created (){

        var products = JSON.parse( JSON.stringify( this.article.products ) )
        this.target  = products.find( p => p.product_id == this.product.product_id )

    },


    mounted(){



    },

    computed: {

        productQuantity(){

            return this.product.quantity

        },
        productTotal(){

            return Number( this.product.price ) * Number(this.product.quantity)

        },
        productName : function(){

            return this.target.product_name

        },

        productPict : function(){

            return this.target.product_image.thumb_url

        },
        productCode : function(){

            return this.target.product_code

        },


        ...mapGetters( 'user'    ,[ 'userProfile' , 'userConfig' , 'history' ]),
        ...mapGetters( 'config'  ,[ 'appConfig' , 'article_id' , 'app_code' ]),
        ...mapGetters( 'article' ,[ 'article' , 'articles' ]),
        ...mapGetters( 'cart'    ,[ 'cart' , 'quantity' ]),
    },
    methods:{
        ...mapActions( 'user'    ,[ 'setUserProfile' , 'setUserConfig' , 'setHistory' ]),
        ...mapActions( 'config'  ,[ 'setAppConfig' , 'set_article_id' , 'set_app_code' ]),
        ...mapActions( 'article' ,[ 'setArticle' , 'setArticles'  ]),
        ...mapActions( 'cart'    ,[ 'setCart' , 'clearCart' ]),

        addCart : function(){

            //// カートに商品が何もない時の処理
            if( this.cart.length == 0 ){

                var inCart = [{
                    product_id : this.product.product_id,
                    userId     : this.userProfile.userId,
                    app_id     : this.appConfig.app_id,
                    quantity   : 1,
                    price      : this.product.product_price
                }]

                this.setCart( inCart )

            }

            else{

                var cloneCart     = JSON.parse( JSON.stringify( this.cart ) )
                var targetProduct = cloneCart.find( c => c.product_id == this.product.product_id )

                //// 今回と同じ商品がカート内にある ///////////////////////
                if( targetProduct != void 0 ){

                    // 商品の数量を一つ増やしてカートにセット
                    targetProduct.quantity += 1
                    this.setCart( cloneCart )

                }

                //// 今回と同じ商品がカート内にない ///////////////////////
                else{

                    var nowCart = JSON.parse( JSON.stringify( this.cart ) )

                    var inCart = {
                        product_id : this.product.product_id,
                        userId     : this.userProfile.userId,
                        app_id     : this.appConfig.app_id,
                        quantity   : 1,
                        price      : this.product.product_price
                    }

                    // 新規に商品を追加してカートにセット
                    nowCart.push( inCart )
                    this.setCart( nowCart )

                }

            }

        },


        subtractCart : function(){

            var cloneCart     = JSON.parse( JSON.stringify( this.cart ) )
            var targetProduct = cloneCart.find( c => c.product_id == this.product.product_id )

            if( targetProduct.quantity == 1 ){

                var newCart = cloneCart.filter( c => c.product_id != this.product.product_id )
                this.setCart( newCart )

            }

            else{

                targetProduct.quantity -= 1
                this.setCart( cloneCart )

            }

        },

        nl2br(value) {

           if(value != undefined){

              if( value.indexOf('http') != -1 ){

                var exp = /(http(s)?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                var test = value.replace( exp , "<a href='$1"+"?openExternalBrowser=1"+"' target='_blank'>$1</a>")
                return test.replace(/\r?\n/g, '<br>')

              }
              else{

                return value.replace(/\r?\n/g, '<br>')

              }


           }

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
[item-box]{
    background: var(--line);
    
    flex: 1 1 200px;
    overflow-x: hidden;
    border-radius: 5px;
    scroll-snap-align: center;
    width: 50%;
    min-width: 98%;
    margin: 0 5px;
    padding: 10px;

    /*display: inline-block;*/
    display: flex;flex-flow:column nowrap;justify-content: flex-start; align-items: flex-start;

}

[item-box] [split-box]{
    display: flex; flex-flow:row nowrap; justify-content: flex-start;align-items:stretch;
}
[item-box] [split-box] [left-box]{
    width: 30%;
}
[item-box] [split-box] [left-box] img{
    width: 100%;
}
[item-box] [split-box] [right-box]{
    width: 70%;
    padding-left: 1em;
}
[item-box] [split-box] [right-box] *{color: #FFF;}

[item-box] [split-box] [right-box] h3{font-size: min(4vmin , 16px);padding-bottom: 0.3em;}
[item-box] [split-box] [right-box] h4{font-size: min(3.5vmin , 14px);}
[item-box] [split-box] [right-box] p{font-size: min(2.5vmin , 10px);padding-top: 0.5em;border-top: 1px dashed #FFF;}

[item-box] [item-detail]{
    display : inline-flex;flex-flow:column nowrap;justify-content: flex-start; align-items: flex-start;
    width:100%;margin-top: 0.5em;
}
[item-box] [item-detail] > dl{
    display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:center;width: 100%;
    border-bottom: 1px dashed #efefef;
}
[item-box] [item-detail] > dl *{
    color: #FFF;
    letter-spacing: 0.05em;
    font-size: min(4.6vmin , 20px);
}
[big-text]{font-size: 1.2em;}

[cartbtn-split]{display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:center;width: 100%;padding: 0.5em;margin-top: 0.5em;}
[cart-btn]{border: 1px solid #FFF;color: #FFF;font-size: 13px;padding: 0.2em;border-radius: 6px;transition: all 0.4s ease;
    width: 100%;margin: 0 0.4em;display: flex; flex-flow:row nowrap;justify-content: center;align-items:center;
}
[cart-btn]:active{color: var(--line);background: #FFF;transition: all 0.1s ease;}



</style>
