<template>
  <div full-height>
    <Header :htitle="htitle" />

    <main>
      <div class="inner--narrow">
        <h2 class="purchase__title">ご注文内容の確認</h2>

        <div class="purchase__product" v-for="item in cart">
          <div class="purchase__product-image">
            <img :src="item.thumb_url" alt="" />
          </div>

          <div class="purchase__product-title">
            <h3 class="purchase__product-name">{{ item.product_name }}</h3>
            <p class="purchase__product-unit">
              {{ item.price | number_format }}円×{{ item.quantity }}
            </p>
          </div>

          <div class="purchase__product-subtotal">
            税込商品代金小計：{{ productTtl(item) | number_format }}円
          </div>

          <button type="button" class="purchase__product-delete">
            <img
              src="/img/icon/icon_trash.svg"
              alt="削除"
              @click="cartOut(item)"
            />
          </button>
        </div>

        <dl class="purchase__total">
          <dt>税込商品合計</dt>
          <dd>{{ cartCount }}点 : {{ calcAllCartAll | number_format }}円</dd>
        </dl>

        <dl class="purchase__address">
          <dt>お届け先</dt>
          <dd>
            〒 {{ orderShipping.zip }}<br />
            {{ orderShipping.pref }}{{ orderShipping.city
            }}{{ orderShipping.street }}{{ orderShipping.address }}
            {{ orderShipping.addition }}<br />
            TEL. {{ orderShipping.tel_1 }}-{{ orderShipping.tel_2 }}-{{
              orderShipping.tel_3
            }}<br />
            {{ orderShipping.name }} さま
          </dd>
        </dl>

        <div class="purchase__shipping">
          <p v-if="totalQuantity('S') > 0">
            {{ orderShipping.pref }}の送料(お試しセット)
            {{ shippingFee("S") | number_format }}円×{{ totalQuantity("S") }}個
            {{ shippingPriceS | number_format }}円
          </p>
          <p v-if="totalQuantity('M') > 0">
            {{ orderShipping.pref }}の送料(レギュラーセット)
            {{ shippingFee("M") | number_format }}円×{{ totalQuantity("M") }}個
            {{ shippingPriceM | number_format }}円
          </p>
          <p v-if="totalQuantity('L') > 0">
            {{ orderShipping.pref }}の送料(プレミアムセット)
            {{ shippingFee("L") | number_format }}円×{{ totalQuantity("L") }}個
            {{ shippingPriceL | number_format }}円
          </p>
        </div>

        <dl class="purchase__total">
          <dt>送料合計</dt>
          <dd>{{ shippingPrice | number_format }}円</dd>
        </dl>

        <dl class="purchase__total">
          <dt>お届け時間帯</dt>
          <dd>
            {{ orderMethod.delivTime | deliv_time }}
          </dd>
        </dl>

        <dl class="purchase__total">
          <dt>お支払い金額合計</dt>
          <dd>{{ calcTotalPrice() | number_format }}円</dd>
        </dl>
      </div>
      <!-- inner--narrow -->

      <div v-if="isCard" card-pay>
        <h4 card-header stripe-logo>
          <div>クレジットカード決済</div>
          <img src="/img/Stripe-blurple.svg" />
        </h4>
        <Payment
          ref="payment"
          :price="calcTotalPrice()"
          :order_id="order_id"
          @registOrder="registOrder"
          @completeOrder="completeOrder"
          @cancelOrder="cancelOrder"
          @endLoading="endLoading"
        />
      </div>

      <div class="purchase__button">
        <button
          type="button"
          class="button--gray"
          @click="backShipping"
          v-if="!isPaymentSuccess"
        >
          お届け・決済選択に戻る
        </button>
        <button
          type="button"
          class="button--orange"
          @click="completeOrder"
          v-if="isPaymentSuccess && !isOrdered"
        >
          発注処理を実行する
        </button>
        <button
          type="button"
          class="button--orange"
          @click="getCofirmOrder"
          v-if="isPaymentSuccess && isOrdered && !isCompleted"
        >
          発注情報を取得する
        </button>
      </div>
    </main>

    <Footer :ficon="ficon" />

    <div
      id="purchase-modal"
      class="modal-wrapper_show"
      v-if="isPaymentSuccess && isOrdered && isCompleted"
    >
      <div class="modal__inner">
        <p class="modal__text">購入が完了しました</p>
        <button
          type="button"
          id="purchaseModalClose"
          class="modal__close"
          @click="closeApp"
        >
          閉じる
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loading from "@/components/Loading";
import { mapState, mapGetters, mapActions } from "vuex";
import { util } from "../mixin/mixinUtils";
export default {
  components: { Loading },

  mixins: [util],

  data: () => {
    return {
      htitle: "商品一覧",
      ficon: 1,
      loading: true,

      drawer: false,
      direction: "btt",

      isPaymentSuccess: false,
      isOrdered: false,
      isCompleted: false,

      // カート内商品の合計
      calcAllCart: 0,

      // カート内商品合計+消費税合計
      calcAllCartAll: 0,

      // サイズ別配送料
      shippingPriceS: 0,
      shippingPriceM: 0,
      shippingPriceL: 0,

      // 配送料の合計
      shippingPrice: 0,

      // お支払い金額合計
      fullCartPrice: 0,

      // 確定済オーダー情報
      confirmOrder: "",

      // オーダー完了済ID
      ordered_id: "",

      // オーダー処理中ID
      order_id: "",

      // promotion
      discount: 0,
      couponId: "",
      allProducts: [],
    };
  },
  created() {
    console.clear();

    this.setDelivery("");

    this.getAllProducts();

    // カート金額計算 ///////////////////////////
    let c = JSON.parse(JSON.stringify(this.cart));

    this.calcAllCart = c.reduce(function (sum, element) {
      return sum + Number(element.price) * Number(element.quantity);
    }, 0);

    this.calcAllCartAll = this.calcAllCart;

    // サイズ別配送料 ///////////////////////
    this.shippingPriceS = this.shippingCalc("S");
    this.shippingPriceM = this.shippingCalc("M");
    this.shippingPriceL = this.shippingCalc("L");

    // 配送料合計 ///////////////////////////
    this.shippingPrice =
      this.shippingPriceS + this.shippingPriceM + this.shippingPriceL;

    // お支払い合計 ///////////////////////////
    this.fullCartPrice = this.calcAllCartAll;

    this.getDiscount(this.orderMethod.coupon);
  },
  mounted() {
    this.loading = false;
  },

  watch: {
    cart: {
      handler: function (val) {
        if (this.cartCount < 1 && !this.isCompleted) this.$router.push("/products/");
        let c = JSON.parse(JSON.stringify(val));
        this.calcAllCart = c.reduce(function (sum, element) {
          return sum + Number(element.price) * Number(element.quantity);
        }, 0);
        this.calcAllCartAll = this.calcAllCart;
        this.fullCartPrice = this.calcAllCartAll;
        this.shippingPriceS = this.shippingCalc("S");
        this.shippingPriceM = this.shippingCalc("M");
        this.shippingPriceL = this.shippingCalc("L");
        this.shippingPrice = this.shippingPriceS + this.shippingPriceM + this.shippingPriceL;
      },
      deep: true,
    },
  },

  computed: {
    /* 配送先の送料を取得
     ****************************/
    orderShipping: function () {
      var shippingId = this.orderMethod.selectedShippingId;
      var res = JSON.parse(JSON.stringify(this.userShipping));
      return res.find((v) => Number(v.shipping_id) == shippingId);
    },

    /* カード払いかどうか
     ****************************/
    isCard: function () {
      if (this.orderMethod.paymentMethod == "card") return true;
      if (this.orderMethod.paymentMethod != "card") return false;
    },

    isShowRemarkEtc: function () {
      return process.env.SHOW_REMARK_ETC?.toLowerCase() == "true";
    },

    isShowCoupon: function () {
      return process.env.SHOW_COUPON?.toLowerCase() == "true";
    },

    isShowPersonInCharge: function () {
      return process.env.SHOW_PERSON_IN_CHARGE?.toLowerCase() == "true";
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
      "setConstPref",
      "getProductsByIds"
    ]),

    /* オーダー情報を登録（未決済）
     ******************************************/
    registOrder: function () {
      this.loading = true;

      var appConfig = {
        app_code: this.config.app_code,
        app_id: this.config.app_id,
        app_name: this.config.app_name,
        msg_access_token: this.config.msg_access_token,
        msg_channel_secret: this.config.msg_channel_secret,
        theme_id: this.config.theme_id,
      };

      // TODO:「代引でなければ送料0円」という意味？不明なので要調査（2022-11-02 小倉）
      let shippingCharge = 0; //this.codPrice()
      if (this.orderMethod.paymentMethod != "cod") {
        shippingCharge = 0;
      }

      var orderDetail = {
        shippingPrice: this.shippingPrice,
        shippingCharge: shippingCharge,
        fullCartPrice: this.calcTotalPrice(),
        session_id: this.session_id,
        cartPrice: this.calcAllCartAll,
        discount: this.discount,
        couponId: this.couponId,
      };

      var complete = new URLSearchParams();
      complete.append("userProfile", JSON.stringify(this.userProfile));
      complete.append("shipping", JSON.stringify(this.orderShipping));
      complete.append("cart", JSON.stringify(this.cart));
      // added personInCharge: {id: userId (belong to shop), fullname: userName} to orderMethod
      complete.append("orderMethod", JSON.stringify(this.orderMethod));
      complete.append("orderDetail", JSON.stringify(orderDetail));
      complete.append("shippingCharge", shippingCharge);
      complete.append("appConfig", JSON.stringify(appConfig));

      axios
        .post(process.env.MAIN_API + "/registOrder", complete)
        .then(
          function (result) {
            console.log(result.data);
            if (result.data.order_id) {
              this.order_id = result.data.order_id;
              this.$refs.payment.confirm();
            } else {
              this.$refs.payment.cancel(
                result.data.error?.text || result.data.error
              );
              this.loading = false;
            }
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        })
        .finally(function () {}.bind(this));
    },

    /* サイズに応じた送料情報を取得
     ******************************************/
    shippingFee: function (size_code) {
      if (this.shippingTable != "" && this.shippingTable.length > 0) {
        return this.shippingTable.find(
          (el) =>
            el.pref_code ==
              this.userShipping.find(
                (el) => el.shipping_id == this.orderMethod.selectedShippingId
              ).pref_code && el.size_code == size_code
        ).shipping_fee;
      } else {
        return 0;
      }
    },

    /* 決済完了　→　オーダー情報確定
     ***********************************************/
    completeOrder: async function () {
      console.log("completeOrder");
      if (this.isPaymentSuccess) this.$refs.payment.showCardError();
      try {
        var complete = new URLSearchParams();
        complete.append("userId", this.userProfile.userId);
        complete.append("order_id", this.order_id);
        complete.append("stripeToken", JSON.stringify(this.stripeToken));
        const result = await axios.post(
          process.env.MAIN_API + "/completeOrder",
          complete
        );

        console.log(result.data);
        if (result.data.order_id) {
          this.isOrdered = true;
          this.ordered_id = JSON.parse(JSON.stringify(result.data.order_id));
          if (await this.getCofirmOrder()) {
            this.$refs.payment.complete("");
            this.isPaymentSuccess = true;
          }
        } else {
          this.$refs.payment.complete(
            `決済完了後に発注処理でエラーが発生しました。画面下の [発注処理を実行する] をタップしてください。[${
              result.data.error
                ? result.data.error.text || result.data.error.message
                : "UNKNOWN"
            }]`
          );
          this.isPaymentSuccess = true;
          this.loading = false;
        }
      } catch (err) {
        console.log(err);
        this.$refs.payment.complete(
          `決済完了後に発注処理でエラーが発生しました。画面下の [発注処理を実行する] をタップしてください。[${
            err.text || err.message
          }]`
        );
        this.isPaymentSuccess = true;
        this.loading = false;
      }
    },

    /* オーダー情報を取得
     ******************************************/
    getCofirmOrder: async function () {
      console.log(`getCofirmOrder : ${this.ordered_id}`);
      if (this.isPaymentSuccess && this.isOrdered)
        this.$refs.payment.showCardError();
      try {
        var order = new URLSearchParams();
        order.append("order_id", this.ordered_id);
        const result = await axios.post(
          process.env.MAIN_API + "/getOrder",
          order
        );
        if (result.status === 200) {
          this.confirmOrder = JSON.parse(JSON.stringify(result.data));
          this.isCompleted = true;
          this.sendOrderToLine();
        } else {
          throw Error(result.statusText);
        }
        return true;
      } catch (err) {
        console.log(err);
        this.$refs.payment.complete(
          `発注情報の取得中にエラーが発生しました。画面下の [発注情報を取得する] をタップしてください。[${
            err.text || err.message
          }]`
        );
        this.isPaymentSuccess = true;
        this.loading = false;
        return false;
      }
    },

    /* レシート（ FlexMessageObj ）を作成する
     ******************************************/
    sendOrderToLine: function () {
      var main = JSON.parse(JSON.stringify(this.confirmOrder[0]));

      var orderData = {
        orderPrice: this.numberFormat(main.order_price),
        shippingPrice: this.numberFormat(main.shipping_fee),
        cartPrice: this.numberFormat(main.cart_price),
        shippingFee: this.numberFormat(main.shipping_charge),
        pay: this.paymentMethods(main.payment_method),
        deliv: this.getDelivTime(main.deliv_time),
      };

      var getReceipt = new URLSearchParams();
      getReceipt.append("confirmOrder", JSON.stringify(this.confirmOrder));
      getReceipt.append("config", JSON.stringify(this.config));
      getReceipt.append("orderData", JSON.stringify(orderData));
      axios
        .post(process.env.API + "getReceipt", getReceipt)
        .then(
          function (result) {
            this.liffSendMessage(result.data);
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        })
        .finally(function () {}.bind(this));
    },

    /* ユーザーに変わってトークルームに投稿
     ******************************************/
    liffSendMessage: function (msg) {
      console.dir(liff.isInClient());

      liff
        .sendMessages([
          {
            type: "flex",
            altText: "注文内容の確認",
            contents: msg,
          },
        ])
        .then(
          function () {
            console.log("liffSendMessage: success");
          }.bind(this)
        )
        .catch((err) => {
          console.log("error", err);
        })
        .finally(
          function () {
            // オーダーの保存に成功したのでカートをクリア
            this.clearCart();
            this.loading = false;
          }.bind(this)
        );
    },

    /* 決済キャンセル
     ***********************************************/
    cancelOrder: function (text) {
      console.log(`cancelOrder: ${this.order_id}`);

      const cancel = new URLSearchParams();
      cancel.append("order_id", this.order_id);
      axios
        .post(process.env.MAIN_API + "/cancelOrder", cancel)
        .then(
          function (result) {
            console.log(result.data);
          }.bind(this)
        )
        .catch((err) => {
          console.log(err);
        })
        .finally(
          function () {
            this.$refs.payment.cancel(text);
            this.loading = false;
          }.bind(this)
        );
    },

    /* ロード終了
     ***********************************************/
    endLoading: function () {
      this.loading = false;
    },

    //// CALC ////////////////////////////////////////////////////////////////////////////////////

    // 商品トータル金額
    productTtl: function (item) {
      return Number(item.price) * Number(item.quantity);
    },

    // 商品個数のトータル
    totalQuantity: function (size_code) {
      var res = 0;
      this.cart
        .filter((c) => c.size_code == size_code)
        .forEach((c) => {
          res += c.quantity;
        });
      return res;
    },

    /*****************************************************************
     * filter を async でつかう
     * // example
     * var test = await this.asyncFilter( array , el => el.jan_code == this.product.jan_code )
     * https://qiita.com/hnw/items/f104a1079906fc5c2a96
     ******************************************************************/
    asyncFilter: async function (array, asyncCallback) {
      const bits = await Promise.all(array.map(asyncCallback));

      return array.filter((_, i) => bits[i]);
    },

    getAllProducts: async function () {
      const ids = this.cart.map(item => item.product_id).toString();
      const prds = await this.getProductsByIds({ids, appId: this.config.app_id});

      let cartData = JSON.parse(JSON.stringify(this.cart));
      let tempCart = [];
      for (let cart of cartData) {
        const product = prds.find(p => p.product_id === cart.product_id)
        if (!!product) {
          cart = {
            price        : cart.price,
            product_code : cart.product_code,
            product_id   : cart.product_id,
            product_name : cart.product_name,
            product_unit : cart.unit,
            quantity     : Number(cart.quantity),
            size_code    : cart.size_code,
            thumb_url    : product.main?.thumb_url
          }
          tempCart.push(cart);
        }
      }

      await this.cartInit( tempCart )
    },

    // 送料合計計算（配送先送料 * 商品個数）
    shippingCalc: function (size_code) {
      return this.totalQuantity(size_code) * this.shippingFee(size_code);
    },

    //// ACTION ////////////////////////////////////////////////////////////////////////////////////
    // カートオープン
    cartToggle: function () {
      this.drawer = !this.drawer;
    },

    // 配送・決済選択に戻る
    backShipping: function () {
      this.$router.push("/shipping/");
    },

    // 完了画面に遷移
    goCompleted: function () {
      this.$router.push(
        "/complete/" + this.ordered_id + "?app=" + this.config.app_code
      );
    },

    //// HELPER ////////////////////////////////////////////////////////////////////////////////////

    numberFormat: function (value) {
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(value);
    },

    paymentMethods: function (value) {
      if (value == "bank") return "銀行振込";
      if (value == "card") return "クレジットカード";
      if (value == "cod") return "代引き";
    },

    // 商品サムネイル
    // productThumb(item) {

    //   let p = this.products.find(
    //     (v) => Number(item.product_id) == Number(v.product_id)
    //   );

    //   return p.main?.thumb_url;
    // },

    getDelivTime: function (value) {
      if (value == "") return "未選択";
      if (value == "none") return "指定なし";
      if (value == "0012") return "午前中";
      if (value == "1416") return "14:00 - 16:00";
      if (value == "1618") return "16:00 - 18:00";
      if (value == "1820") return "18:00 - 20:00";
      if (value == "1921") return "19:00 - 21:00";
    },
    calcTotalPrice() {
      return this.fullCartPrice + this.shippingPrice - this.discount;
    },
    async getDiscount(coupon) {
      if (!coupon.trim()) return;
      // const { data } = await axios.get(`${process.env.MAIN_API}/aec/getDiscount`, {
      //   params: {
      //     token: process.env.INFO_TOKEN,
      //     coupon,
      //     amount // discount alway <= amount
      //   }
      // })
      const data = {
        status: true,
        message: `Get coupon 「${coupon}」 successfully`,
        result: {
          discount: 555,
          couponId: 1,
        },
      };

      const { status, message, result } = await data;

      this.discount = result.discount;
      this.couponId = result.couponId;

      const type = status ? "success" : "error";
      this.$message({ type: type, message: message });
    },
    cartOut: function (thisItem) {
      var outItem = JSON.parse(JSON.stringify(thisItem));
      var cartOutItem = {
        product_id: outItem.product_id,
      };

      for (let step = thisItem.quantity; step > 0; step--) {
        this.minusCart(cartOutItem);
      }

      if (liff.getOS() != "ios") {
        window.navigator.vibrate(100);
      }

      if (this.cartCount < 1) this.$router.push("/products/");
    },

    closeApp: function () {
      liff.closeWindow();
      this.$router.push("/?app=" + this.config.app_code);
    },
  },

  filters: {
    number_format: function (value) {
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(value);
    },
    noshigami: function (value) {
      if (value == "seibo") return "お歳暮";
      if (value == "chugen") return "お中元";
      if (value == "iwai") return "お祝い";
      if (value == "none") return "なし";
    },
    deliv_time: function (value) {
      if (value == "") return "未選択 ( 指定なし )";
      if (value == "none") return "指定なし";
      if (value == "0012") return "午前中";
      if (value == "1416") return "14:00 - 16:00";
      if (value == "1618") return "16:00 - 18:00";
      if (value == "1820") return "18:00 - 20:00";
      if (value == "1921") return "19:00 - 21:00";
    },
    personInCharge: function (value) {
      return value.fullname;
    },
  },
};
</script>
<style>
[confirm-content] {
  padding-bottom: 5em !important;
}
[confirm-product] {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 0.5em 0;
  border-bottom: 1px dashed #ccc;
}
[confirm-product] [left-image] {
  width: 20%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
[confirm-product] [left-image] img {
  width: 100%;
}
[confirm-product] [right-detail] {
  width: 80%;
  padding-left: 0.5em;
}
[confirm-product] [right-detail] * {
  color: #fff;
}
[confirm-product] [right-detail] [product-name],
[confirm-product] [right-detail] [product-subtotal],
[confirm-product] [right-detail] [product-total] {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  font-size: 16px;
}
[total-view] {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0;
  margin-top: 0.4em;
  font-weight: bold;
}
[total-view][small-text] dt,
[total-view][small-text] dd {
  font-size: 14px;
  font-weight: 400;
}
[total-view] dt {
  font-weight: bold;
  color: #fff;
}
[total-view] dd {
  font-weight: bold;
  border-bottom: 1px dotted #8e9bb7;
  padding-bottom: 0.2em;
  color: #fff;
}
[total-view][border-bottom] dd {
  border: none;
}
[total-view][border-bottom],
[conf-address][border-bottom] {
  border-bottom: 1px solid #fff;
}
[total-view] dd span {
  color: #fff;
}
[conf-shipping] {
  margin-top: 1em;
}
[conf-shipping] h4 {
  color: #fff;
  font-size: min(4vmin, 16px);
  line-height: 2em;
  font-weight: 400;
}
[conf-address] {
  font-size: min(4vmin, 16px);
  color: #fff;
  text-align: justify;
  letter-spacing: 0.05em;
  border-bottom: 1px dashed #ccc;
}
[all-complete] {
  border: 1px solid #fff;
  color: #fff;
  background: #67c23a;
  font-size: 15px;
  padding: 0.4em;
  border-radius: 6px;
  transition: all 0.4s ease;
  width: 100%;
  margin: 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
[all-complete]:active {
  border: 1px solid #fff;
  background: #fff;
  color: #67c23a;
}
[conf-shipping][btn-split][no-card] [btn-default] {
  width: 30%;
}
[conf-shipping][btn-split][no-card] [btn-white] {
  width: 68%;
}
</style>
