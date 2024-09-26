<template>
  <div full-height>
    <Header :htitle="htitle" />
    <main>
      <div class="info__wrapper inner--narrow">
        <div v-html="config.terms"></div>
      </div>

      <p class="info__back">
        <nuxt-link to="/config" class="button--gray">戻る</nuxt-link>
      </p>
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
      activeNames: [],

      //////////
      drawer: false,
      direction: "btt",

      htitle: "利用規約/利用ガイド",
      ficon: 3,
    };
  },
  mounted() {
    this.loading = false;
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
        } else {
          return value.replace(/\r?\n/g, "<br>");
        }
      }
    },
  },
};
</script>
<style>
</style>
