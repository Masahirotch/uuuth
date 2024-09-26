<template>
    <transition name="el-fade-in-linear">

        <div v-if="isText" v-html="nl2br(section.content)" article-text ></div>

        <div v-if="isImage" article-image>
            <img :src="src">
        </div>

        <div v-if="isMovie" article-movie>
            <video controls preload="none" :poster="moviePoster">
                <source :src="src" type="video/mp4">
            <p>動画を再生するには、videoタグをサポートしたブラウザが必要です。</p>
            </video>
        </div>

    </transition>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

export default {

    props : ['section'],

    data() {
        return {

        }
    },

    mounted(){

    },

    computed: {

        isText : function(){

            return ( this.section.type == 'text' )? true : false

        },
        isImage : function(){

            return ( this.section.type == 'image' )? true : false

        },
        isMovie : function(){

            return ( this.section.type == 'movie' )? true : false

        },
        src:function(){

            return this.section.file.file_url

        },
        moviePoster : function(){

            return this.section.file.thumb_url

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
[article-text]{
    color:#666;
    font-size:min(3.8vmin,15px);
    text-align:justify;
    line-height:1.8em;
    padding:2em 1.2em;
}

[article-image],[article-image] img{
    width:100%;
    min-width:100%;
    max-width:100%;
}
[article-image]{
    padding:2em 0;
}


[article-movie]{
    width:100%;
    min-width:100%;
    max-width:100%;
    padding:2em 0;
}
[article-movie] video{
    width: 100%;
    height: 100%;
}



</style>
