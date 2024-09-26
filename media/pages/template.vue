<template>
  <transition name="el-fade-in-linear">
    <div>
        <Loading v-if="loading" />






    </div>
  </transition>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    data: () => {
        return {
            loading: true,

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

}
</script>
<style>

</style>
