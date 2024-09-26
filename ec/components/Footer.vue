<template>
  <footer>
    <ul class="footer__link">
      <li :class="{ current: selectedMenuItem == menuItem.shop }">
        <img
          src="/img/icon/icon_product.svg"
          alt=""
          @click="go(menuItem.shop)"
        />
        商品一覧
      </li>
      <li :class="{ current: selectedMenuItem == menuItem.mypage }">
        <img
          src="/img/icon/icon_person.svg"
          alt=""
          @click="go(menuItem.mypage)"
        />
        マイページ
      </li>
      <li :class="{ current: selectedMenuItem == menuItem.info }">
        <img
          src="/img/icon/icon_information.svg"
          alt=""
          @click="go(menuItem.info)"
        />
        <span>インフォメーション</span>
      </li>
    </ul>
  </footer>
</template>

<script>
import axios from "axios";
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  props: ["ficon"],
  data() {
    return {
      isOpenLeftMenu: false,

      //amination
      isAnim: false,

      menuItem: {
        shop: 1,
        mypage: 2,
        info: 3,
      },

      selectedMenuItem: 1,
    };
  },
  mounted() {
    // カート処理を監視
    this.$store.subscribe(
      function (mutation, state) {
        if (
          mutation.type == "cart/setPlusCartData" ||
          mutation.type == "cart/setMinusCartData" ||
          mutation.type == "cartInitData"
        ) {
          this.boundBag();
        }
      }.bind(this)
    );

    this.selectedMenuItem = this.ficon;
  },

  watch: {},

  computed: {
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

    leftMenuToggle: function () {
      this.isOpenLeftMenu = !this.isOpenLeftMenu;
    },
    go: function (item) {
      this.selectedMenuItem = item;
      switch (item) {
        case this.menuItem.shop:
          this.$router.push("/?app=" + this.config.app_code);
          break;
        case this.menuItem.mypage:
          this.$router.push("/config/mypage/");
          break;
        case this.menuItem.info:
          this.$router.push("/config/");
          break;
      }
    },

    boundBag: function () {
      this.isAnim = true;

      // 付加したclassを解除
      let count = 0;
      const doAmin = () => {
        this.isAnim = false;
      };
      setTimeout(doAmin, 200);
    },
  },
};
</script>

<style>
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
.footer__link span {
  letter-spacing: -0.04em;
}
.footer__link .current {
  color: var(--subColor);
}
.footer__link .current img {
  filter: none;
}
</style>
