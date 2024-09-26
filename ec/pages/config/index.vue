<template>
  <div full-height>
    <Header :htitle="htitle" />
    <main>
      <ul class="link-list inner--narrow">
        <li><nuxt-link to="/config/guide/">利用規約/利用ガイド</nuxt-link></li>
        <li>
          <nuxt-link to="/config/privacy-policy"
            >プライバシーポリシー</nuxt-link
          >
        </li>
        <li>
          <nuxt-link to="/config/specified-commercial/"
            >特定商取引に関する法律に基づく表示</nuxt-link
          >
        </li>
        <li><nuxt-link to="/config/delivery/">配送料金</nuxt-link></li>
      </ul>
    </main>
    <Footer :ficon="ficon" />
  </div>
</template>

<script>
import axios from "axios";

import { mapState, mapGetters, mapActions } from "vuex";

export default {
  data: () => {
    return {
      htitle: "インフォメーション",
      ficon: 3,
      loading: true,
      //////////
      drawer: false,
      direction: "btt",
    };
  },
  mounted() {
    this.loading = false;

    this.apiTest();
  },
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

    cartToggle: function () {
      this.drawer = !this.drawer;
    },

    apiTest: function () {},
  },
};
</script>
<style>
</style>
