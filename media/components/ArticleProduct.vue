<template>
  <transition name="el-fade-in-linear">
      <div article-product>

          <div product-img>
              <img :src="src">
          </div>
        
          <h5 product-name>{{product.product_name}}</h5>
        
          <div product-detail pb-1 v-html="nl2br(product.product_detail)"></div>
        
          <div product-price pb-1 v-if="isSale">購入価格 : 
              <span>{{product.product_price|number_format}}</span>
              <span>円</span>
          </div>

          <div product-price pb-1 v-if="!isSale">購入価格 : 
              <span style="color:var(--line-invalid);font-size:min(6vmin,20px);">販売休止中</span>
          </div>


          <div linebtn v-if="isSale" @click="addCart">
              <div linebtn-overlay>LINEで購入</div>        
          </div>

          <div linebtn btn-invalid v-if="!isSale">
              <div linebtn-overlay>販売休止中</div>        
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

      }
    },

    mounted(){

              

    },

    computed: {

        src : function(){

            return this.product.product_image.thumb_url

        },
        isSale : function(){

            return this.product.is_sale

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

        // product plus in cart //////////////////////////////////////////////////////// 
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

                var cloneCart = JSON.parse( JSON.stringify( this.cart ) )
                var target   = cloneCart.find( c => c.product_id == this.product.product_id )

                //// 今回と同じ商品がカート内にある ///////////////////////
                if( target != void 0 ){

                    // 商品の数量を一つ増やしてカートにセット
                    target.quantity += 1
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




        ////////////////////////////////////////////////////////////////////////////////


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
[article-product]{
    width:100%;
    max-width:500px;
    padding-bottom:2em;
}

    [product-img]{
        width:100%;
    }
        [product-img] img{
            width:100%;
            border-radius:0.3em;
            height:100%;
            max-height:450px;
            object-fit:cover;
        }

    [product-name]{
        font-size:14px;
    }

    [product-detail]{
        font-size:14px;

    }

    [product-price]{
        text-align:center;
    }

        [product-price] span:nth-of-type(1){
            font-size:1.8em;padding-right:0.05em;font-weight:bold;color:var(--line);
        }

        [product-price] span:nth-of-type(2){
            color:var(--line);font-weight:bold;
        }



</style>
