<template>
  <div full-height>
    <Header :htitle="htitle" />
    <main>
      <div class="info__wrapper inner--narrow">
        <p>「特商法」とは「特定商取引に関する法律」を指します。</p>

        <h2>販売価格について</h2>
        <p>{{config.law_prices}}</p>

        <h2>代金(対価)の支払時期と方法</h2>
        <p>{{config.law_method}}</p>

        <h2>返品についての特約事項</h2>
        <p>{{config.law_returned}}</p>

        <h2>約務または商品の引き渡し時期</h2>
        <p>{{config.law_service}}</p>

        <h2>その他</h2>
        <p>{{config.law_other}}</p>

        <h2>事業者の名称および連絡先</h2>
        <p>{{config.law_about}}</p>
      </div>

      <p class="info__back">
        <nuxt-link to="/config" class="button--gray">戻る</nuxt-link></p>
    </main>
    <Footer :ficon="ficon" />
  </div>
</template>

<script>
import axios from "axios";

import { mapState, mapGetters, mapActions } from "vuex";
import { util } from "../../mixin/mixinUtils";

export default {
  mixins: [util],

  data: () => {
    return {
      htitle: "特定商取引に関する法律に基づく表示",
      ficon: 3,
      loading: true,
      //////////
      drawer: false,
      direction: "btt",
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
  },
};
</script>
<style>
</style>