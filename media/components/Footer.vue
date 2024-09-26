<template>
  <transition name="el-fade-in-linear">
    <div footer-content>
        <div content-left ref="leftMenu"></div>

        <div content-right ref="rightMenu" v-if="isInCart" @click="cartToggle">
              <i class="el-icon-shopping-cart-2">
                  <div :class="{ bounce : isAnim }" id="badge" v-if="cartQ > 0">{{cartQ}}</div>
              </i>
              <span ex-small>買い物カゴ</span>
        </div>

        <div content-right ref="rightMenu" v-if="!isInCart" @click="cartToggle">
            <i class="el-icon-shopping-cart-2"></i>
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
            isOpenLeftMenu : false,
            
            //amination
            isAnim: false

        }
    },

    mounted(){


        //// カート処理を監視 /////////////
        this.$store.subscribe(function(mutation, state){

            if( mutation.type == 'cart/setCartData' ){

                // バッジのバウンド処理
                this.boundBag()

            }

        }.bind(this))



    },

    computed: {

        isInCart(){

            if( this.cart.length == 0 ) return false
            if( this.cart.length > 0 ) return true

        },
        cartQ(){

            return this.quantity

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


        boundBag : function(){

            this.isAnim = true

            // 付加したclassを解除
            let count = 0;
            const doAmin = () => {
                this.isAnim = false
            }
            setTimeout(doAmin, 200);

        },

        cartToggle : function(){

            this.$emit( 'cartToggle' ) 

        }


    }
};
</script>

<style>
[ex-small]{
    font-size: 11px;
    transform: scale(0.7);
    text-align: left;
    position: absolute;
    white-space: nowrap;
    left: 5px;
    bottom: 1px;
    font-weight: bold;
}

[left-small]{
    font-size: 11px;
    transform: scale(0.7);
    position: absolute;
    white-space: nowrap;
    right: 12px;
    white-space: nowrap;
    bottom: 3px;
    font-weight: bold;
}

[footer-content]{
    position:fixed;
    bottom:2.5em;
    display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:stretch;
    width:100%;
    max-width: 500px;
}
[footer-content] > *{
    border-radius: 1.2em;
    background: #FFF;
    color: var(--footer-text);
    padding: 0.8em 1em;
    filter: drop-shadow(10px 6px 6px rgba(0,0,0,0.5));
}
[footer-content] *{
    color:var(--footer-text);
}

[footer-content] > [content-left]{
    position:sticky;
    width:0;
    height:0;
    margin-left:-14em;
    transition: margin 0.3s ease;
    padding: 0;
}
[footer-content] > [content-left].open{margin-left:-4em;}
[footer-content] > [content-left] [toggle-btn]{font-size:2em;transform:rotate(0deg);transition: transform 0.3s ease;}
[footer-content] > [content-left].open [toggle-btn]{transform:rotate(180deg);transition: transform 0.3s ease;}


[footer-content] > [content-right] {
    position: sticky;
    width: 6em;
    margin-right: -2em;
    transition: margin 0.3s ease;
}


[footer-content] > [content-right] i,
[footer-content] > [content-left] i{font-size:2em;}

[footer-content] > [content-right] .el-badge__content{color:#FFF;}

i.el-icon-shopping-bag-2{position: relative;}


#badge{
    position:absolute;
    top: 7px;
    right: 3.2em;
    font-size: 12px;
    transform-origin: center;
    transition: all 0.2s ease-in-out;
    display : inline-flex;flex-flow:column nowrap;justify-content: center; align-items:center;
    background: #c72500;
    color: #FFF;
    padding: 0.2em 0.4em;
    min-width: 2em;
    border-radius: 0.8em;
    border: 1px solid #FFF;
}

/* バッジのバウンス処理 */
#badge.bounce{
    transform-origin: center;
    transform:scale(1.4);
    transition: all 0.2s ease-in-out;
}


[content-left] .el-icon-house::after{
    content: "HOME";
    position: absolute;
    font-size: 11px;
    transform: scale(0.7);
    right: 15.8em;
    bottom: 0.3em;
    font-weight: bold;
}
[content-left] .el-icon-s-shop::after{
    content: "SHOP";
    position: absolute;
    font-size: 11px;
    transform: scale(0.7);
    right: 11.1em;
    bottom: 0.3em;
    font-weight: bold;
}

[content-left] .el-icon-s-tools::after{
    content: "ABOUT";
    position: absolute;
    font-size: 11px;
    transform: scale(0.7);
    right: 6.1em;
    bottom: 0.3em;
    font-weight: bold;
}
</style>
