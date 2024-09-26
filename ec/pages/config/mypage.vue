<template>
  <div full-height>
    <Header :htitle="htitle" />
    <main>
      <ul class="link-list inner--narrow">
        <li>
          <nuxt-link to="/config/regist-shipping/"
            >お届け先の登録・編集</nuxt-link
          >
        </li>
        <li><nuxt-link to="/config/history/">ご購入履歴</nuxt-link></li>
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
      loading: true,
      //////////
      drawer: false,
      direction: "btt",
      htitle: "マイページ",
      ficon: 2,
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
