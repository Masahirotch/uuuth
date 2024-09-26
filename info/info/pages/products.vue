<template>
  <div product>
    <Loading v-if="loading" />

    <header>
      <h1 class="header__title">商品一覧</h1>
      <div
        id="cartBox"
        class="header__cart"
        :class="{ hasContent: cartNum > 0 }"
        @click="onCartClick"
      >
        <img src="/resource/icon_cart.svg" alt="カート" />
        <div id="badge" class="header__number" v-if="cartNum > 0">
          {{ cartNum }}
        </div>
      </div>
    </header>

    <main v-for="(item, index) in products" v-if="item.isOnSale">
      <!-- 商品ループ -->
      <section class="product__wrapper">
        <div class="product__image">
          <swiper  :options="swiperOption">
            <swiper-slide v-for="thumb in productThumb(item)" v-if="thumb != null">
              <img :src="thumb" class="swiper-lazy">
            </swiper-slide>
            <div slot="pagination" class="swiper-pagination"/>
          </swiper>
        </div>
        <div class="product__explanation">
          <h2 class="product__title">
            {{ item.productName }}
            <span v-if="item.isMax == 1"> - 残り在庫 / {{ item.stock | number_format }}</span>
          </h2>
          <div class="product__price">
            {{ item.productPriceBS | number_format }}円 /
            {{ item.unit }} ( 税込 )
          </div>
          <div
            class="product__period"
            v-if="item.isPeriod != 0 && isBetween(item.start, item.end)"
          >
            販売期間 : {{ fdate(item.start) }} 〜 {{ fdate(item.end) }}
          </div>
          <div
            class="product__period product__outOfDate"
            v-if="item.isPeriod != 0 && !isBetween(item.start, item.end)"
          >
            販売期間外
          </div>
          <div class="product__period" v-if="item.isPeriod == 0">販売中</div>

          <div
            class="product__button"
            v-if="
              (item.isPeriod &&
                isBetween(item.start, item.end) &&
                item.isOnSale) ||
              (!item.isPeriod && item.isOnSale)
            "
          >
            <button
              type="button"
              class="button__inc-dec"
              @click="cutDown(item.productId)"
              :disabled="item.quantity <= 0"
            >
              <img src="/resource/icon_minus.svg" alt="減らす" />
            </button>
            <button
              type="button"
              class="button__number"
              :class="{ notZero: inCartNum(item.productId) > 0 }"
            >
              <input type="number" class="input__productQuantity" :id="`product-quantity-${item.productId}`" :value="inCartNum(item.productId)" @blur="onCartChange(item.productId)" :disabled="item.isMax == 1 && item.stock <= 0">
            </button>
            <button
              type="button"
              class="button__inc-dec"
              @click="addUp(item.productId)"
              :disabled="item.isMax == 1 && item.stock <= 0"
            >
              <img src="/resource/icon_plus.svg" alt="増やす" />
            </button>
          </div>

          <dl class="product__detail">
            <el-collapse accordion class="product__detail">
              <el-collapse-item
                title="商品詳細"
                :name="index"
                class="product__detail-title"
              >
                <div v-html="nl2br(item.productDetail)"></div>
              </el-collapse-item>
            </el-collapse>
          </dl>
        </div>
      </section>
      <!---->
    </main>
    <div style="margin: -12px 12px 12px 12px" v-if="canShowMore">
      <el-button
        style="
          width: 100%;
          text-align: center;
          border-radius: 8px;
          border: 1px solid var(--grayColor);
        "
        @click="getProducts"
        >もっと見る</el-button
      >
    </div>
    <el-button class="btn-scroll-top" icon="el-icon-top" @click="scrollTop">
    </el-button>

    <!-- カートモーダル -->
    <div id="cart-modal" v-if="cartDrawer && !isOrderEnd && cartNum > 0">
      <div class="cart-modal__inner">
        <div cart-item v-for="item in carts" v-if="item.quantity > 0">
          <p class="cart-modal__product">{{ item.productName }}</p>
          <p class="cart-modal__price">
            <span class="cart-modal__price--unit">{{item.productPriceBS | number_format}}円 / {{item.unit}} </span>
            <span class="cart-modal__price--number">{{ item.quantity }}</span>
            <span class="cart-modal__price--summary">{{
              (item.productPriceBS * item.quantity) | number_format
            }}</span>
          </p>
        </div>
        <p class="cart-modal__summary">
          合計：
          <span>{{ cartTotal | number_format }}</span>
        </p>

        <p class="cart-modal__caution">
          ご注文のお届けは最短での納品となります。納品時間のご指定は承っておりませんので、あらかじめご了承ください。<br />
          商品によって、お届け日時が指定の場合がございます。<br />
          商品詳細よりお確かめの上、ご注文ください。
        </p>

        <div class="cart-modal__button">
          <button
            type="button"
            id="cartModalaBack"
            class="cart-modal__button--back"
            @click="cartDrawer = false"
          >
            戻る
          </button>
          <button
            type="button"
            id="cartModalSend"
            class="cart-modal__button--send"
            @click="sendOrder"
            :disabled="!canSendOrder"
          >
            この内容で発注する
          </button>
        </div>
      </div>
    </div>

    <!-- 発注処理完了モーダル -->
    <h1>{{ msg }}</h1>
    <Modal
      :message="message"
      v-show="showModal"
      @execute-method="executeMethod"
    ></Modal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import axios from "axios";
import Loading from "@/components/Loading";
import Accordion from "@/components/Accordion";
import Modal from "@/components/Modal";

export default {
  components: { Loading },

  data() {
    return {
      loading: true,
      cartDrawer: false,
      direction: "btt",
      isOrderEnd: false,
      message: "発注処理を行いました",
      showModal: false,
      currentPage: 0,
      perPage: process.env.SPOT_PER_PAGE,
      canShowMore: true,
      canSendOrder: false,
      swiperOption: {
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          type : 'bullets'
        },
        slidesPerView: 1,
        loop: true,
      },
    };
  },
  created() {
    this.getProducts();
  },
  async mounted() {
    await this.initializeLiff();
    this.loading = false;
  },
  computed: {
    ...mapGetters("user", ["userProfile", "buyer"]),
    ...mapGetters("cart", ["cart", "carts", "cartNum"]),
    ...mapGetters("product", ["products"]),
    cartTotal() {
      var ttl = 0;
      this.carts.forEach(function (e) {
        ttl = ttl + e.productPriceBS * e.quantity;
      });

      return ttl;
    },
  },
  props: {
    msg: String,
  },
  /*
   ********************************************************/
  methods: {
    ...mapActions("user", ["setProfile", "setBuyer"]),
    ...mapActions("cart", [
      "setCart",
      "setCarts",
      "addUpCart",
      "cutDownCart",
      "resetCart",
      "inputToCart",
    ]),
    ...mapActions("product", ["setProducts"]),

    ////////////////////////////////////////////////////////
    async initializeLiff() {
      await liff
        .init({ liffId: process.env.SALE_LIFF_ID })
        .then(async () => {
          await this.checkLogin();
        })
        .catch((err) => {
          console.log(err.code, err.message);
        });
    },
    async checkLogin() {
      if (!(await liff.isLoggedIn())) {
        await liff.login();
      } else {
        await this.getProfile();
      }
    },
    async getProfile() {
      await liff
        .getProfile()
        .then(async (profile) => {
          await this.setProfile(profile);
        })
        .then(
          async function () {
            await this.getBuyer();
          }.bind(this)
        )
        .catch((err) => {
          console.log(err.code, err.message);
        })
        .finally(function () {}.bind(this));
    },

    /* 販売可能な商品の一覧を取得
     *****************************/
    getProducts: function () {
      axios
        .post(process.env.API_URL + "info/products", {
          token: process.env.API_TOKEN,
          order_by: { order: [["productId", "DESC"]] },
          perPage: this.perPage,
          currentPage: this.currentPage + 1,
        })
        .then(
          function (result) {
            const { totalProduct, currentPage, perPage, products } =
              result.data;
            const productsData = [...this.products, ...products];
            const countProduct = currentPage * perPage;

            this.setProducts(productsData);
            this.perPage = perPage;
            this.canShowMore = countProduct >= totalProduct ? false : true;
            this.currentPage = currentPage;
            this.setCarts(productsData);
            console.dir(this.products);
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        })
        .finally(function () {});
    },

    getBuyer: async function () {
      // データベースにホスト登録ありかチェックしに行く
      await axios
        .post(process.env.API_URL + "getUsers", {
          token: process.env.API_TOKEN,
          where: { userId: this.userProfile.userId },
        })
        .then(
          function (result) {
            // ユーザ一覧なければ / に遷移
            if (!result.data.foundUsers) this.$router.push("/");
            // 該当ユーザがなければ / に遷移
            if (!result.data.foundUsers[0]) this.$router.push("/");
            // 該当ユーザの利用承認が「未」ならば / に遷移
            // if (! result.data.foundUsers[0].flg_active) this.$router.push('/')
            // 該当ユーザの商品一覧閲覧権限が「なし」ならば / に遷移
            if (!result.data.foundUsers[0].flg_5) this.$router.push("/");
            this.setBuyer(result.data.foundUsers[0]);
            if (this.buyer.flg_5 == "0") {
              this.$router.push("/");
            }
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        })
        .finally(
          function () {
            this.loading = false;
          }.bind(this)
        );
    },

    sendOrder: function () {
      this.canSendOrder = false;
      // 注文情報の送信
      let orderArray = [];
      this.carts.forEach((cart) => {
        if (cart.quantity > 0) orderArray.push(cart);
      });
      axios
        .post(process.env.API_URL + "addInfoOrder", {
          token: process.env.API_TOKEN,
          new_info_order: {
            userId: this.userProfile.userId,
            orderArray: orderArray,
            orderNum: this.cartNum,
            deliveryDate: null,
          },
          perPage: this.perPage,
          currentPage: 1,
        })
        .then(
          function (result) {
            if (result.data.result == 1) {
              // モーダル表示
              this.showModal = true;
              this.isOrderEnd = true;
              this.sendMsg(this.carts);
              const { currentPage, perPage, products } = result.data;
              this.setProducts(products);
              this.perPage = perPage;
              this.canShowMore = products?.length == this.perPage;
              this.currentPage = currentPage;
              this.setCarts(products);
              this.resetCart();
            } else {
              this.$message({
                showClose: true,
                message: result.data.message,
                type: "error",
                duration: 20000,
              });
              this.setProducts(result.data.products);
            }
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
          this.canSendOrder = true;
        })
        .finally(function () {
          window.scrollTo(0, 0);
        });
    },

    // モーダルを非表示にする
    executeMethod() {
      this.showModal = false;
      this.closeCart();
    },

    sendMsg: function (cart) {
      var message = `注文者 : ${this.buyer.bizName} / ${this.buyer.displayName}
注文内容は以下です。\n
`;
      var cartTtl = 0;
      cart.forEach( (element) => {
        if (element.quantity > 0) {
          var itemTtl = element.quantity * element.productPriceBS;

          message += `${element.productName}\n`;
          message += `${this.numberFormat(element.productPriceBS)}円 x ${element.quantity} = ${this.numberFormat(itemTtl)}円\n\n`;
          cartTtl += itemTtl;
        }
      });
      message += `-----------------------
ご注文合計 : ${this.numberFormat(cartTtl)}円

ご注文のお届けは本日から2営業日後となっております。
商品の内容や通常の発注商品との同時配送などにつきましては、このトークルームにてご質問ください。`;

      console.dir("liff");
      console.dir(liff);

      //// トークルームににメッセージ送信 ////////////////////////////
      liff
        .sendMessages([
          {
            type: "text",
            text: message,
          },
        ])
        .then(() => {
          console.log("message sent");
        })
        .catch((err) => {
          console.log("error", err);
        });
    },

    ////////////////////////////////////////////////////////

    /* 改行コードを<br> に変換
     ******************************/
    nl2br(value) {
      if (value != undefined) {
        if (value.indexOf("http") != -1) {
          var linkUrl = value.replace(/\r?\n/g, "<br>");
          return linkUrl.link(linkUrl + "?openExternalBrowser=1");
        } else {
          return value.replace(/\r?\n/g, "<br>");
        }
      }
    },
    fdate: function (date) {
      return this.$dayjs(date).format("MM/DD HH時mm分");
    },
    isBetween: function (start, end) {
      return this.$dayjs(new Date()).isBetween(start, end);
    },
    /* カート処理
     *****************************************/
    addUp: function (id) {
      if (this.cartNum === 0) this.isOrderEnd = false;
      this.addUpCart(id);
    },
    cutDown: function (id) {
      this.cutDownCart(id);
    },

    inCartNum(value) {
      var target = this.carts.find((element) => element.productId == value);
      return target?.quantity || 0;
    },

    closeCart: function () {
      this.cartDrawer = !this.cartDrawer;
      this.isOrderEnd = false;
      liff.closeWindow();
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onCartChange (productId) {
      const input = document.getElementById(`product-quantity-${productId}`)
      const newQuantity = +input.value || 0
      this.inputToCart({productId, newQuantity, input})
    },
    numberFormat (value) {
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(value);
    },
    onCartClick () {
      this.cartDrawer = this.cartNum > 0 ? !this.cartDrawer : this.cartDrawer;
      this.canSendOrder = true;
    },
    productThumb(item){
      let dataImage = [];

      // Ensure item.productPhoto is a string and does not include 'null/'
      if (typeof item?.productPhoto === 'string' && !item.productPhoto.includes('null/')) {
        dataImage.push(item.productPhoto);
      }

      // Ensure item.productPhoto1 is a string and does not include 'null/'
      if (typeof item?.productPhoto1 === 'string' && !item.productPhoto1.includes('null/')) {
        dataImage.push(item.productPhoto1);
      }

      // Ensure item.productPhoto2 is a string and does not include 'null/'
      if (typeof item?.productPhoto2 === 'string' && !item.productPhoto2.includes('null/')) {
        dataImage.push(item.productPhoto2);
      }

      // If dataImage is empty, add a dummy thumbnail image
      if (dataImage.length === 0) {
        dataImage.push(process.env.DUMMY_THUMB_IMAGE);
      }
      return dataImage;
    },
  },
  /*
   ********************************************************/
  filters: {
    number_format: function (value) {
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(value);
    },
    tax_calc: function (value) {
      //var tax = Math.floor( ( value * (100 / 110) ) )
      var inTax = Math.ceil(value * 1.1);
      let formatter = new Intl.NumberFormat("ja-JP");
      return formatter.format(inTax);
    },
  },
};
</script>
<style>
img {
  max-width: 100%;
}
[inner] {
  padding: 0 16px;
}
[product] h2 {
  line-height: 1.6em;
}
[product] [price-box] {
  line-height: 2.2em;
}
[cart-box] {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: stretch;
}
.el-button.el-button--primary span {
  color: #fff;
}
.el-button.el-button--primary[cart-num] span {
  font-size: 1.5em;
}
.el-button.el-button--primary[cart-button] span {
  font-size: 1.2em;
}
.el-button.is-round[cart-button] {
  padding: 8px 16px;
}
.el-button-group {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: stretch;
}
[send-order] {
  width: 80%;
}
[count-view] {
  min-width: 3em;
}
[text-content] {
  line-height: 1.4em;
}
[cart-button] {
  position: fixed;
  right: 1.5em;
  bottom: 1.5em;
}
[cart-item] {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1em 0;
  border-bottom: 1px dashed #ddd;
}
[item-name] {
  width: 100%;
  font-size: min(4.5vmin, 22px);
  line-height: 1.3em;
  padding-right: 1em;
}
[cart-item] > [detail] {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
[item-price],
[item-total] {
  font-weight: 500;
}
[item-price] {
  font-size: min(4vmin, 16px);
  white-space: nowrap;
}
[item-quantity] {
  padding: 0 1em;
  font-size: min(4vmin, 16px);
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  font-size: 0.85em;
}
[item-total] {
  text-align: right;
  font-size: min(4vmin, 16px);
  white-space: nowrap;
}
[cart-total]::after,
[item-price]::after,
[item-total]::after {
  content: "円";
  font-size: 0.75em;
  display: inline-block;
  margin-left: 0.3em;
}
[cart-total] {
  font-size: min(5vmin, 24px);
  text-align: right;
  margin-top: 1em;
}
[cart-note] {
  font-size: min(3.6vmin, 14px);
  font-weight: 700;
  text-align: justify;
  line-height: 1.3em;
}
[sales-period] {
  font-size: min(3.4vmin, 13px);
}
[cart-group] {
  justify-content: space-between;
  width: 100%;
}
[cart-counter] {
  padding: 1em 1em;
}
[cart-counter-group] {
  align-items: center;
}
.btn-scroll-top {
  position: fixed;
  bottom: 12px;
  right: 12px;
  z-index: 100;
  border-radius: 8px;
  border: 1px solid var(--grayColor);
  box-shadow: 5px 5px 5px 0;
  padding: 12px !important;
}

.product__image {
  position: relative;
}
.product__image img {
  width: 100%;
  max-width: none;
}

.product__explanation {
  border-top: 1px solid var(--grayColor);
  padding: 44px 12px 12px;
}

/* Swiper */
.product__image .swiper-pagination.swiper-pagination-bullets {
  bottom: -24px;
}
.product__image .swiper-pagination-bullet {
  border-radius: 1px;
  width: 20px;
  height: 5px;
}
.product__image .swiper-pagination-bullet-active {
  background-color: var(--subColor);
}

/* Swiper */
.swiper-container {
  overflow-x: hidden !important;
  position: static !important;
}
.swiper-pagination-bullets {
  bottom: -24px;
}
.swiper-pagination-bullet {
  border-radius: 1px;
  width: 20px;
  height: 5px;
}
.swiper-pagination-bullet-active {
  background-color: #F0A10C;
}
</style>
