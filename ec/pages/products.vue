<template>
  <div>
    <Header :htitle="htitle" />
    <main>
      <Product v-for="item in products" :item="item" />
      <div style="margin-bottom: 12px" v-if="canShowMore">
        <el-button
          style="
            width: 100%;
            text-align: center;
            border-radius: 8px;
            border: 1px solid var(--grayColor);
          "
          @click="loadProducts"
          >もっと見る</el-button
        >
      </div>
      <el-button
        class="btn-scroll-top"
        icon="el-icon-top"
        @click="scrollTop"
      ></el-button>
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
      htitle: "商品一覧",
      ficon: 1,
      loading: true,

      //////////
      drawer: false,
      direction: "btt",
      currentPage: 0,
      perPage: process.env.EC_PER_PAGE,
      canShowMore: true,
    };
  },
  created() {
    this.loadProducts();
  },
  mounted() {
    if (this.config.app_id == void 0) {
      liff.closeWindow();
    }
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

    loadProducts: async function () {
      this.loading = true;
      const params = `?currentPage=${this.currentPage + 1}&perPage=${
        this.perPage
      }`;

      await this.$axios
        .get(
          `${process.env.MAIN_API}/ec/products/${this.config.app_id}${params}`
        )
        .then(
          function (result) {
            const { totalProduct, currentPage, perPage, products } =
              result.data;
            const productsData =
              currentPage == 1 ? products : [...this.products, ...products];
            const countProduct = currentPage * perPage;

            this.setProducts(productsData);
            this.perPage = perPage;
            this.canShowMore = countProduct >= totalProduct ? false : true;
            this.currentPage = currentPage;
            this.loading = false;
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        });
    },

    cartToggle: function () {
      this.drawer = !this.drawer;
      this.loading = false;
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
};
</script>
<style scoped>
.btn-scroll-top {
  position: fixed;
  bottom: 92px;
  right: 12px;
  z-index: 100;
  border-radius: 8px;
  border: 1px solid var(--grayColor);
  box-shadow: 5px 5px 5px 0;
  padding: 12px !important;
}
</style>
