<template>
  <transition name="el-fade-in-linear">
    <div article-box>

        <div id="article-header" :class="article.category_code">
            <img :src="article.main[0].file_url">
        </div>

        <div article-type center-center :class="article.category_code">{{article.category_code}}</div>

        <h1 id="article-title" v-html="nl2br(article.article_title)"></h1>

        <!-- 記事セクションループ -->
        <ArticleSections v-for="section in article.sections" :section="section"/>


        <!-- 記事に紐づいた商品の購入 -->
        <div pt-4 pb-2 pr-1 pl-1 v-if="isProduct">

            <h2 pb-1>この生産者の商品を購入する</h2>
            
            <!-- 商品ループ -->
            <ArticleProduct :product="product" v-for="product in article.products" />

        </div>

    </div>
  </transition>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

export default {

    props : ['data'],

    data() {
        return {


        }
    },

    mounted(){

 

    },


    computed: {

        isProduct : function(){

            return ( this.article.products.length > 0 )? true : false

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




    }

};
</script>

<style>
[article-box]{
    padding-bottom:4em;
}

#article-header{
    margin-bottom:3em;
    position:relative;
    width:100vmin;
    max-width:500px;
    overflow:hidden;
}

#article-header::after{
    content : '';
    position:absolute;
    z-index:9;
    right:-1em;
    bottom:-1em;
    width:2em;
    height:2em;
    transform:rotate(45deg);
}
#article-header.farmers::after{
    background: #21b74f;
}
#article-header.recipe::after{
    background: #ee808b;
}
#article-header.restaurant::after{
    background: #f7b467;
}


[article-type]{
    text-transform:capitalize;
    font-weight:200;
    letter-spacing:0.1em;
    font-size:min( 6vmin , 25px );
}
[article-type].farmers{
    color: #21b74f;
}
[article-type].recipe{
    color: #ee808b;
}
[article-type].restaurant{
    color: #f7b467;

}


#article-header,#article-header img{
    max-width:100%;
    min-width:100%;
    height:35vh;
}
#article-header img{object-fit:cover;}


#article-title{
    color:#454545;
    font-size:min( 5vmin , 22px );
    line-height:1.5em;
    text-align:center;
    padding:2em 1.2em;
}

</style>
