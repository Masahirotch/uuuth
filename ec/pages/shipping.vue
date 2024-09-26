<template>
  <div full-height shipping-edit>
    <Header :htitle="htitle" />

    <main>
      <div class="inner--narrow">
        <h2 class="purchase__title">ご注文のお届け先を選択</h2>
        <label class="purchase__label" v-if="!confirming">お届け先</label>
        <div class="purchase__select-wrapper" v-if="!confirming">
          <select
            class="purchase__select"
            :class="{ empty: methodList.selectedShippingId == '' }"
            v-model="methodList.selectedShippingId"
          >
            <option value="" disabled>お届け先を選択してください</option>
            <option
              :value="shipping.shipping_id"
              :key="shipping.shipping_id"
              v-for="shipping in shippingList"
            >
              {{ shipping.name }}
            </option>
          </select>
        </div>
        <dl class="purchase__confirm" v-if="confirming">
          <dt>お届け先</dt>
          <dd>{{ shippingDetail.name }}</dd>
          <dt>住所</dt>
          <dd>
            〒 {{ shippingDetail.zip }}<br />
            {{ shippingDetail.pref }}{{ shippingDetail.city
            }}{{ shippingDetail.street }}{{ shippingDetail.address }}
            {{ shippingDetail.addition }}<br />
          </dd>
          <dt>電話</dt>
          <dd>
            TEL. {{ shippingDetail.tel_1 }}-{{ shippingDetail.tel_2 }}-{{
              shippingDetail.tel_3
            }}
          </dd>
        </dl>
        <p class="purchase__link">
          <span @click="goRegistShipping">お届け先の登録・編集はこちら</span>
        </p>

        <hr class="purchase__hr" />

        <h2 class="purchase__title">お届け時間の選択</h2>
        <label class="purchase__label" v-if="!confirming">時間帯</label>
        <div class="purchase__select-wrapper" v-if="!confirming">
          <select
            class="purchase__select"
            :class="{ empty: methodList.delivTime == '' }"
            v-model="methodList.delivTime"
          >
            <option value="" disabled>選択してください</option>
            <option :value="dt[0]" v-for="dt in delivTimeArray">
              {{ dt[1] }}
            </option>
          </select>
        </div>
        <dl class="purchase__confirm" v-if="confirming">
          <dt>時間帯</dt>
          <dd>{{ delivTimeString }}</dd>
        </dl>

        <hr class="purchase__hr" />

        <h2 class="purchase__title">ご注文の決済方法を選択</h2>
        <label class="purchase__label" v-if="!confirming">決済方法</label>
        <div class="purchase__select-wrapper" v-if="!confirming">
          <select
            class="purchase__select"
            :class="{ empty: methodList.paymentMethod == '' }"
            v-model="methodList.paymentMethod"
          >
            <option value="" disabled>選択してください</option>
            <option :value="pm[0]" v-for="pm in paymentMethodArray">
              {{ pm[1] }}
            </option>
          </select>
        </div>
        <dl class="purchase__confirm" v-if="confirming">
          <dt>決済方法</dt>
          <dd>{{ paymentMethodString }}</dd>
        </dl>

        <div class="purchase__button" v-if="!confirming">
          <button
            type="button"
            class="button--orange"
            :class="{ 'button--gray': !isSendOk }"
            @click="confirmingToggle('next')"
          >
            内容の確認
          </button>
        </div>
        <div class="purchase__button2" v-if="confirming">
          <button
            type="button"
            class="button--gray"
            @click="confirmingToggle('back')"
          >
            戻る
          </button>
          <button type="button" class="button--orange" @click="goConfirm">
            確認
          </button>
        </div>
      </div>
      <!-- alert message -->
      <div id="prefcode-modal" class="modal-wrapper_show" v-if="dialogPrefCode">
        <div class="modal__inner">
          <p class="modal__text">
            配送先として選択されている{{
              this.shippingDetail ? this.shippingDetail.pref : ""
            }}
            は、<br />
            配送不可の地域となっております。 <br />
            別の配送先を選択してください。
          </p>
          <button type="button" class="modal__close" @click="closePrefCode">
            閉じる
          </button>
        </div>
      </div>
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
      pay_drawer: false,
      direction: "btt",
      dialogPrefCode: false,

      methodList: {
        selectedShippingId: "",
        paymentMethod: "",
        delivTime: "",
        note: "",
        shippingMethod: 1,
        coupon: "",
        personInCharge: { id: "", fullname: "担当者なし" },
      },

      isSendOk: false,
      allowChooseShippingMethod:
        process.env.ALLOW_CHOOSE_SHIPPING_METHOD == "true",
      shippingDetail: "",
      personInCharges: [
        //dummy data
        { id: 1, fullname: "person 001" },
        { id: 2, fullname: "person 002" },
        { id: 3, fullname: "person 003" },
        { id: 4, fullname: "person 004" },
        { id: 5, fullname: "person 005" },
      ],
      personInCharge: "",
      shopId: null,
      COUPON_MAXLENGTH: 50, // update spec later
      confirming: false,
      delivTimeArray: [
        ["none", "指定なし"],
        ["0012", "午前中"],
        ["1416", "14:00 - 16:00"],
        ["1618", "16:00 - 18:00"],
        ["1820", "18:00 - 20:00"],
        ["1921", "19:00 - 21:00"],
      ],
      paymentMethodArray: [["card", "クレジットカード"]],
    };
  },
  created() {
    console.clear();
    // for call api
    // this.getPersonInCharges(this.shopId)
  },
  mounted() {
    if (this.orderMethod != void 0 && this.orderMethod != "") {
      if (this.orderMethod.selectedShippingId != "")
        this.methodList.selectedShippingId =
          this.orderMethod.selectedShippingId;
      if (this.orderMethod.delivTime != "")
        this.methodList.delivTime = this.orderMethod.delivTime;
      if (this.orderMethod.paymentMethod != "")
        this.methodList.paymentMethod = this.orderMethod.paymentMethod;
      if (this.orderMethod.note != "")
        this.methodList.note = this.orderMethod.note;
      if (this.orderMethod.shippingMethod)
        this.methodList.shippingMethod = this.orderMethod.shippingMethod;
      if (this.orderMethod.personInCharge.id) {
        this.methodList.personInCharge = this.orderMethod.personInCharge;
        this.personInCharge = this.orderMethod.personInCharge.id;
      }
      if (this.orderMethod.coupon != "")
        this.methodList.coupon = this.orderMethod.coupon;
    }

    this.loading = false;
  },
  watch: {
    methodList: {
      handler: function (val) {
        if (val.shippingMethod === 1 && val.selectedShippingId != "") {
          this.shippingDetail = JSON.parse(
            JSON.stringify(
              this.userShipping.find(
                (v) =>
                  Number(v.shipping_id) ==
                  Number(this.methodList.selectedShippingId)
              )
            )
          );
        } else {
          this.shippingDetail = "";
        }

        if (
          val.paymentMethod != "" &&
          val.selectedShippingId != "" &&
          val.delivTime != ""
        ) {
          this.isSendOk = true;
        } else {
          this.isSendOk = false;
        }

        if (!/^[a-zA-Z0-9]+$/.test(val.coupon)) {
          this.methodList.coupon = val.coupon.slice(0, -1);
        }

        this.setOrderMethod(JSON.parse(JSON.stringify(val)));
      },

      deep: true,
    },
    personInCharge: {
      handler: function (value) {
        if (!value) {
          this.methodList.personInCharge = { id: "", fullname: "担当者なし" };
        }
        this.methodList.personInCharge = this.personInCharges.find(
          (person) => person.id == value
        );
      },
      deep: true,
    },
  },

  computed: {
    shippingList: function () {
      return JSON.parse(JSON.stringify(this.userShipping));
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

    delivTimeString: function () {
      return this.delivTimeArray.filter(
        (dt) => dt[0] == this.methodList.delivTime
      )[0][1];
    },

    paymentMethodString: function () {
      return this.paymentMethodArray.filter(
        (pm) => pm[0] == this.methodList.paymentMethod
      )[0][1];
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
    ]),

    // カートの開閉
    cartToggle: function () {
      this.drawer = !this.drawer;
    },
    // 確認モードON/OFF
    confirmingToggle: async function (isButton) {
      if (isButton == "next") {
        axios
          .get(`${process.env.MAIN_API}/ec/checkOnPrefectureCode`, {
            params: {
              token: process.env.INFO_TOKEN,
              app_id: this.config.app_id,
              pref_code: this.shippingDetail.pref_code,
            },
          })
          .then(
            function (response) {
              const postages = response.data.postages;
              console.log(postages);

              if (postages[0]?.shipping_flg == 1) {
                if (this.isSendOk) this.confirming = !this.confirming;
              } else {
                //show modal message
                this.dialogPrefCode = true;
              }
            }.bind(this)
          )
          .catch((error) => {
            console.log(error);
            return;
          });
      } else {
        if (this.isSendOk) this.confirming = !this.confirming;
      }
    },
    // お届け先登録・編集ページへ
    goRegistShipping: function () {
      this.$router.push("/config/regist-shipping/");
    },
    // 確認画面へ
    goConfirm: function () {
      this.$router.push("/confirm/");
    },
    closePrefCode: function () {
      this.dialogPrefCode = false;
    },

    // call api get users by shopId
    // response contain list user [{id: userId (belong to shop), fullname: userName}, ...]
    async getPersonInCharges(shopId) {
      const { data } = await axios.get(
        `${process.env.MAIN_API}/aec/getUsersByShopId`,
        {
          params: {
            token: process.env.INFO_TOKEN,
            shopId,
          },
        }
      );
      this.personInCharges = await data.users;
    },
  },
};
</script>
<style scoped>
.modal__text {
  text-align: left;
}
</style>
