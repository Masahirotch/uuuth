<template>
    <footer>
      <ul class="footer__link">
        <li :class="{current: activeMenu('index')}" @click="goHome">
          <img src="/resource/icon_product.svg" alt="">
          商品一覧
        </li>
        <li :class="{current: activeMenu('history')}" @click="pageTransition('history')">
          <img src="/resource/icon_calendar.svg" alt="">
          発注履歴
        </li>
        <li :class="{current: activeMenu('settings')}" @click="pageTransition('settings')">
          <img src="/resource/icon_person.svg" alt="">
          マイリスト
        </li>
      </ul>
    </footer>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    data: () => {
        return {

            //amination
            isAnim: false
            
        }
    },
    mounted(){
        
        // カート処理を監視 // 処理があったらバッジのバウンスアニメーションを実行
        this.$store.subscribe(function(mutation, state){

            if( mutation.type == 'cart/setCartData' ){

                this.boundBag()

            }

        }.bind(this))

    },
    computed: {
        cartNum : function(){

            return this.cartCount

        },
        isCartNum : function(){

            return (this.cartCount > 0)? true : false

        },

        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),

        /* HOMEに戻る
        *********************************************/
        goHome : function(){

            this.$router.push('/')

        },

        pageTransition : function( page ){

            this.$router.push('/' + page + '/')

        },


        /* カートバッヂアニメーション処理
        *********************************************/
        boundBag : function(){

            this.isAnim = true

            // 付加したclassを解除
            let count = 0;
            const doAmin = () => {

                this.isAnim = false
            
            }
            
            setTimeout(doAmin, 200);

        },

        activeMenu: function (routeName) {
            if (routeName == this.$route.name) {
                return true
            }

            return false
        },

    },
    filters:{

        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

    },

}
</script>
<style scoped>
footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  width: 100%;
  height: 80px;
  background-color: var(--mainColor);
}
.footer__link {
  display: flex;
  justify-content: center;
}
.footer__link li {
  width: 96px;
  padding: 8px 0;
  color: var(--whiteColor);
  font-size: 0.67em;
  text-align: center;
}
.footer__link img {
  display: block;
  width: 25px;
  margin: 0 auto 4px;
  filter: grayscale(1) brightness(200%);
}
.footer__link .current {
  color: var(--subColor);
}
.footer__link .current img {
  filter: none;
}
</style>
