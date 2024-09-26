<template>
  <transition name="el-fade-in-linear">
    <div drawer-inner>
        <dl buy-term>
            <dt>商品の配送について</dt>
            <dd>ご購入いただいた商品の配送は、この公式アカウント「{{appConfig.app_name}}」を運用する店舗への配送となります。</dd>
            <dd>商品の配送は、通常3営業日〜の日数がかかります。商品が店舗に届きましたら、店舗よりご購入社様宛にLINE等でご案内がございますので、速やかに商品のお引き取りをお願いいたします。</dd>
        </dl>
        <dl buy-term>
            <dt>お支払いについて</dt>
            <dd>ご購入いただいた商品代金のお支払いは、商品の受け取りの際、店舗にて直接お支払いください。</dd>
        </dl>

        <div send-order>
            <div linebtn full-width @click="sendOrder">
                <div linebtn-overlay>注文を送信</div>        
            </div>
        </div>

    </div>
  </transition>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

export default {

    props : [''],

    data() {
      return {


      }
    },

    mounted(){


    },

    computed: {

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


        sendOrder : function(){

            this.$emit( 'sendOrder' )

        },

    }
};
</script>

<style>
[drawer-inner]{padding-left:0.5em;padding-right:0.5em;padding-bottom: env(safe-area-inset-bottom);}

[send-order]{
    padding-bottom: 2em;
}


[buy-term]{
    padding-bottom:2em;
}
[buy-term] dt{
    font-size:14px;
    font-weight:bold;


}
[buy-term] dd{
    font-size:14px;
    text-align:justify;
}











</style>
