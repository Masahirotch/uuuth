<template>
  <div full-height>
    <Header :htitle="htitle" />
    <main>
      <div class="info__wrapper inner--narrow">
          <p>{{config.privacy_header}}</p>

        <h2>1. お客様情報について</h2>
          <p>{{config.privacy_information}}</p>

        <h2>2. お客様情報の利用目的について</h2>
          <p>{{config.privacy_purpose}}</p>

        <h2>3. お客様情報の第三者への委託について</h2>
          <p>{{config.privacy_consign}}</p>

        <h2>4. お客様情報の第三者への提供について</h2>
          <p>{{config.privacy_furnishing}}</p>

        <h2>5. LINEユーザーデータの使用について</h2>
          <p>{{config.privacy_line}}</p>

        <h2>6. お客様情報のお問い合わせについて</h2>
          <p>{{config.privacy_contact}}</p>
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
      htitle: "プライバシーポリシー",
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