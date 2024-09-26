<template>
  <header>
    <h1 class="header__title">{{ htitle }}</h1>
    <div
      id="cartBox"
      class="header__cart"
      :class="{ hasContent: cartQ > 0 }"
      @click="cartToggle"
    >
      <img src="/img/icon/icon_cart.svg" alt="カート" />
      <div id="badge" class="header__number" v-if="cartQ > 0">{{ cartQ }}</div>
    </div>

    <!-- カートモーダル -->
    <div id="cart-modal" class="cart-modal" v-if="drawer && cartQ > 0">
      <div class="cart-modal__inner">
        <h2 class="cart-modal__title">現在のカートの中</h2>

        <button
          type="button"
          id="cartModalClose"
          class="cart-modal__close"
          @click="cartToggle"
        >
          <img src="/img/icon/icon_cross.svg" alt="閉じる" />
        </button>

        <div class="cart-modal__scroll" v-if="cartQ > 0">
          <div class="cart-modal__product" v-for="product in cart">
            <div class="cart-modal__head">
              <div class="cart-modal__image">
                <img :src="product.thumb_url" alt="" />
              </div>
              <p class="cart-modal__name">{{ product.product_name }}</p>
            </div>

            <p class="cart-modal__number">
              注文番号：{{ product.product_code }}
            </p>

            <dl class="cart-modal__unit">
              <dt>商品単価</dt>
              <dd>{{ product.price | number_format }}円</dd>
            </dl>

            <dl class="cart-modal__unit">
              <dt>数量</dt>
              <dd>{{ product.quantity | number_format }}{{ product.product_unit}}</dd>
            </dl>

            <dl class="cart-modal__unit">
              <dt>商品小計</dt>
              <dd>
                {{
                  (Number(product.price) * Number(product.quantity))
                    | number_format
                }}円
              </dd>
            </dl>

            <div class="button__wrapper">
              <button type="button" class="button__inc-dec">
                <img
                  src="/img/icon//icon_minus.svg"
                  alt="減らす"
                  @click="cartOut(product)"
                />
              </button>
              <button
                type="button"
                class="button__number"
                :class="{ notZero: cartQ > 0 }"
              >
                {{ product.quantity | number_format }}
              </button>
              <button type="button" class="button__inc-dec">
                <img
                  src="/img/icon//icon_plus.svg"
                  alt="増やす"
                  @click="cartIn(product)"
                />
              </button>
            </div>
          </div>
          <!-- cart-modal__product -->
        </div>

        <div class="cart-modal__button">
          <button type="button" class="button--orange" @click="goShipping">
            配送先を選択
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import axios from "axios";
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  props: ["htitle"],
  data: () => {
    return {
      //amination
      isAnim: false,
      drawer: false,
    };
  },
  mounted() {
    // カート処理を監視 // 処理があったらバッジのバウンスアニメーションを実行
    this.$store.subscribe(
      function (mutation, state) {
        if (mutation.type == "cart/setCartData") {
          this.boundBag();
        }
      }.bind(this)
    );
  },
  computed: {
    isInCart() {
      if (this.cart.length == 0) return false;
      if (this.cart.length > 0) return true;
    },
    cartQ() {
      if (this.cartCount < 1) this.drawer = false;
      return this.cartCount;
    },

    ...mapGetters("config", ["config"]),
    ...mapGetters("user", [
      "userProfile",
      "userConfig",
      "userShipping",
      "history",
    ]),
    ...mapGetters("cart", [
      "cart",
      "cartCount",
      "session_id",
      "orderMethod",
      "stripeToken",
      "delivery",
    ]),
    ...mapGetters("products", ["products", "shippingTable", "constPref"]),
  },
  methods: {
    ...mapActions("config", ["setConfig"]),
    ...mapActions("user", [
      "setUserProfile",
      "setUserConfig",
      "setUserShipping",
      "setHistory",
    ]),
    ...mapActions("cart", [
      "plusCart",
      "minusCart",
      "clearCart",
      "setSession",
      "cartInit",
      "setOrderMethod",
      "setStripeToken",
      "setDelivery",
    ]),
    ...mapActions("products", [
      "setProducts",
      "setShippingTable",
      "setConstPref",
    ]),

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
      let count = 0;
      const doAmin = () => {
        this.isAnim = false;
      };

      setTimeout(doAmin, 200);
    },

    cartToggle: function () {
      this.drawer = !this.drawer;
      if (this.cartQ < 1) this.drawer = false;
    },

    nl2br(value) {
      if (value != undefined) {
        if (value.indexOf("http") != -1) {
          var exp =
            /(http(s)?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
          var test = value.replace(
            exp,
            "<a href='$1" +
              "?openExternalBrowser=1" +
              "' target='_blank'>$1</a>"
          );
          return test.replace(/\r?\n/g, "<br>");
          //return linkUrl.link(linkUrl + '?openExternalBrowser=1')
        } else {
          return value.replace(/\r?\n/g, "<br>");
        }
      }
    },

    ///////////////////////////////////////////////////////////////////
    cartIn: function (thisProduct) {
      var plusItem = JSON.parse(JSON.stringify(thisProduct));
      var cartInItem = {
        product_id: plusItem.product_id,
        product_name: plusItem.product_name,
        product_code: plusItem.product_code,
        product_unit: plusItem.product_unit,
        price: plusItem.price,
        quantity: 1,
        size_code: plusItem.size_code,
        thumb_url: plusItem.main?.thumb_url || plusItem.thumb_url || process.env.DUMMY_THUMB_IMAGE
      };

      this.plusCart(cartInItem);

      if (liff.getOS() != "ios") {
        window.navigator.vibrate(100);
      }
    },
    cartOut: function (thisProduct) {
      var outItem = JSON.parse(JSON.stringify(thisProduct));
      var cartOutItem = {
        product_id: outItem.product_id,
      };

      this.minusCart(cartOutItem);

      if (liff.getOS() != "ios") {
        window.navigator.vibrate(100);
      }
    },

    ///////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////
    // getSrc: function (id) {
    //   var temp = JSON.parse(JSON.stringify(this.products));
    //   let target = temp.find((p) => Number(p.product_id) == Number(id));

    //   return target != void 0
    //     ? target.main.thumb_url
    //     : process.env.DUMMY_THUMB_IMAGE;
    // },

    productSum: function (product) {
      return Number(product.price) * Number(product.quantity);
    },

    goShipping: function () {
      if (this.$route.name == "shipping") {
        this.$emit("cartToggle");
      }
      this.$router.push("/shipping/");
    },
  },

  filters: {
    number_format: function (value) {
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(value);
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

/* カートモーダル */
.cart-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  visibility: visible;
  opacity: 1;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  transition: visibility 0.3s, opacity 0.3s;
}
.cart-modal__inner {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 24px 0 104px;
  background-color: var(--whiteColor);
}
.cart-modal__title {
  position: relative;
  margin-left: 24px;
  padding: 0 1.5em 1.25em;
}
.cart-modal__title::before {
  content: "";
  position: absolute;
  top: 0.7em;
  left: 0;
  width: 0.85em;
  height: 2px;
  background-color: var(--subColor);
}
.cart-modal__close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 13px;
  height: 13px;
  padding: 0;
  background-color: transparent;
  border: none;
}
.cart-modal__scroll {
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  display: flex;
  align-items: stretch;
  padding: 0 24px;
}
.cart-modal__product {
  width: 254px;
  min-width: 254px;
  scroll-snap-align: center;
  padding: 12px;
  background-color: var(--mainColor);
  border-radius: 8px;
  color: var(--whiteColor);
}
.cart-modal__product + .cart-modal__product {
  margin-left: 20px;
}
.cart-modal__head {
  display: flex;
  align-items: center;
}
.cart-modal__image {
  overflow: hidden;
  width: 60px;
  height: 60px;
  border: 1px solid var(--grayColor);
  border-radius: 8px;
}
.cart-modal__image img {
  width: 100%;
  max-width: none;
  height: 100%;
  object-fit: cover;
}
.cart-modal__name {
  flex: 1;
  padding-left: 12px;
}
.cart-modal__number {
  padding: 8px 0;
  border-bottom: 1px solid var(--whiteColor);
  font-size: 0.8em;
}
.cart-modal__unit {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  font-size: 0.8em;
}
.cart-modal__unit dd {
  font-weight: bold;
}
.cart-modal__inner .button__wrapper {
  margin: 24px 0 0 auto;
}
.cart-modal__button {
  padding-top: 24px;
  text-align: center;
}
.cart-modal__button .button--orange {
  font-size: 1.34em;
}
</style>
