<template>
  <div>
    <Header :htitle="htitle" />
    <main>
      <ul class="caution inner--narrow">
        <li>
          商品の表示価格は購入時の価格です。<br />再度カートに入れる際は、現在の価格が適用されます。
        </li>
        <li>
          現在販売していない商品はカートに追加されません。<br />あらかじめご了承ください。
        </li>
      </ul>

      <section class="history__wrapper" v-for="order in history">
        <div class="history__upper" v-for="cart in order.cart">
          <div class="history__image">
            <img :src="cart.thumb_url" alt="" />
          </div>

          <div class="history__title">
            <h2 class="history__name">
              {{cart.product_name}} <label v-if="!Boolean(cart.in_sales)">※取扱停止中</label>
            </h2>
            <p class="history__unit">{{cart.price|yen_format}}円×{{cart.quantity}}</p>
          </div>
        </div>

        <div class="history__lower">
          <dl class="history__detail">
            <dt>注文番号：</dt>
            <dd>{{config.app_code}}-{{order.order_id}}</dd>
            <dt>注文日時：</dt>
            <dd>{{jpDate(order.order_date)}}</dd>
            <dt>商品小計：</dt>
            <dd>{{order.cart_price|yen_format}}円</dd>
            <dt>送料：</dt>
            <dd>{{order.shipping_fee|yen_format}}円</dd>
            <dt>合計：</dt>
            <dd>{{order.order_price|yen_format}}円</dd>
          </dl>
          <button type="button" class="button__add-cart" @click="cartInOrder(order.cart)" v-if="isSaleOrder(order.cart)">カートに入れる</button>
          <button type="button" class="button__add-cart" v-else>再発注不可</button>
        </div>
      </section>
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
      htitle: "ご購入履歴",
      ficon: 2,
      loading: true,
      //////////
      drawer: false,
      direction: "btt",
      allProducts: [],
    };
  },
  mounted() {
    //console.clear()

    this.loading = false;

    console.dir(this.history);
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
      "getProductsByIds"
    ]),

    cartToggle: function () {
      this.drawer = !this.drawer;
    },

    cartInOrder: async function (orderCart) {
      const ids = orderCart.map(item => item.product_id).toString();
      this.allProducts = await this.getProductsByIds({ids, appId: this.config.app_id});

      for (const cart of orderCart) {
        if (this.isSale(cart)) await this.cartIn(cart)
      }
    },

    cartIn: async function (cart) {

      var targetProduct = this.allProducts.find((p) => p.product_id == cart.product_id);

      if (targetProduct) {
        var cartInItem = {
          product_id: targetProduct.product_id,
          product_name: targetProduct.product_name,
          product_code: targetProduct.product_code,
          price: targetProduct.price,
          quantity: cart.quantity,
          size_code: targetProduct.size_code,
          thumb_url: targetProduct.main?.thumb_url
        };
        this.plusCart(cartInItem);
      }

      if (liff.getOS() != "ios") {
        window.navigator.vibrate(100);
      }
    },

    // 販売中かどうか
    isSaleOrder: function (orderCart) {
      return orderCart.every(cart => this.isSale(cart))
    },

    isSale: function (cart) {
      return Boolean(cart.in_sales)
    },

    jpDate: function (day) {
      return this.$dayjs(day).format("YYYY年MM月DD日 HH:mm");
    },
  },

  filters: {
    yen_format: function (value) {
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(value);
    },
  },
};
</script>
<style>
</style>
