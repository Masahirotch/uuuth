<template>
  <header>
    <h1 class="header__title">{{htitle}}</h1>

      <!-- BtoBspotと同じようにhasContentのクラスをつけると背景がオレンジになるようになっています。 -->
      <div id="cartBox" class="header__cart" :class="{hasContent:cartCount > 0}" @click="pageTransition('cart')">
        <img src="/resource/icon_cart.svg" alt="カート">
        <div id="badge" class="header__number" v-if="cartCount > 0">{{cartCount}}</div>
      </div>

      <!-- こちらクリックで02_product_search.htmlに遷移するようにしていただければと思います。 -->
      <div class="header__search"  @click="pageTransition('search')">
        <img src="/resource/icon_search.svg" alt="検索">
      </div>
  </header>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  props: ["htitle"],
  data: () => {
    return {
      //amination
      isAnim: false,
    };
  },
  mounted() {
    // this cause lag when u click go to /cart page //
    // // カート処理を監視 // 処理があったらバッジのバウンスアニメーションを実行
    // const unsubscribe = this.$store.subscribe((mutation, state) => {
    //     if( mutation.type == 'cart/setCartData' ){
    //         this.boundBag()
    //     }
    // })
    // unsubscribe()
  },
  computed: {
    cartNum: function () {
      return this.cartCount;
    },
    isCartNum: function () {
      return this.cartCount > 0 ? true : false;
    },

    ...mapGetters("config", [
      "config",
      "products",
      "userProfile",
      "units",
      "favorites",
      "delivConfig",
    ]),
    ...mapGetters("cart", ["cart", "cartCount", "session_id"]),
  },
  methods: {
    ...mapActions("config", [
      "setConfig",
      "setProducts",
      "setUserProfile",
      "setUnits",
      "setFavorites",
      "setDelivConfig",
    ]),
    ...mapActions("cart", ["setCart", "clearCart", "setSession"]),

    /* ページ遷移
     *********************************************/
    pageTransition: function (page) {
      this.$router.push("/" + page + "/");
    },

    /* カートバッヂアニメーション処理
     *********************************************/
    boundBag: function () {
      this.isAnim = true;
      // 付加したclassを解除
      setTimeout(() => {
        this.isAnim = false;
      }, 200);
    },
  },
};
</script>
<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  display: grid;
  place-items: center;
  place-content: center;
  width: 100%;
  height: 48px;
  background-color: var(--mainColor);
}
.header__title {
  font-size: 0.95em;
  color: var(--whiteColor);
  text-align: center;
}
.header__cart {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  place-content: center;
  width: 70px;
  height: 48px;
}
.header__cart.hasContent {
  background-color: var(--subColor);
  cursor: pointer;
}
.header__cart img {
  width: 26.75px;
  height: 27.86px;
  padding-top: 5px;
}
.header__number {
  position: absolute;
  top: 8px;
  right: 12px;
  min-width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  padding: 0 2px;
  background-color: var(--whiteColor);
  border: 1px solid var(--subColor);
  border-radius: 18px;
  color: var(--subColor);
  font-family: "Roboto", sans-serif;
  font-size: 0.8em;
}
.header__search {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  place-content: center;
  width: 70px;
  height: 48px;
  cursor: pointer;
}
.header__search img {
  width: 23px;
}
</style>
