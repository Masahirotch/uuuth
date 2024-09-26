<template>
  <div>
    <Header :htitle="htitle" />
    <main>
      <div class="info__wrapper inner--narrow">
        <ul class="caution">
          <li>
            配送不可の地域には、商品の出荷を行なっておりません。あらかじめご了承ください。
          </li>
        </ul>

        <table class="area-table">
          <thead>
            <tr>
              <th>お届け先</th>
              <th>
                <span>お試し<br />セット</span>
              </th>
              <th>
                <span>レギュラー<br />セット</span>
              </th>
              <th>
                <span>プレミアム<br />セット</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in constPref">
              <td>{{item.jp}}</td>
              <td>{{shippingFee(item, 'S')}}</td>
              <td>{{shippingFee(item, 'M')}}</td>
              <td>{{shippingFee(item, 'L')}}</td>
            </tr>
          </tbody>
        </table>
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
import Loading from "@/components/Loading";
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  components: { Loading },
  data: () => {
    return {
      loading: true,
      //////////
      drawer: false,
      direction: "btt",
      htitle: "配送料金",
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

    // 送料
    shippingFee: function (val, size_code) {
      var target = this.shippingTable.filter(
        (p) => val.pref_code == p.pref_code && size_code == p.size_code
      );

      return target.length > 0
        ? this.number_format(target[0].shipping_fee) + "円"
        : "配送不可";
    },
    // 3桁ごと区切り
    number_format: function (value) {
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(value);
    },
  },
};
</script>
<style>
</style>
