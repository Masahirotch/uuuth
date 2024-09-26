<template>
  <div full-height>
    <Header :htitle="htitle" />
    <Loading v-if="loading" />
    <main>
      <div class="inner--narrow">
        <!-- お届け先新規登録・更新 -->
        <div
          v-for="(shipping, index) in shippings"
          v-bind:key="shipping.shipping_id"
        >
          <dl class="accordion">
            <dt
              class="accordion__title"
              v-bind:class="accordion['shipping'][index]['title']"
              v-on:click="toggleAccordionOfShipping(index)"
            >
              {{ shipping.name || "お届け先" + (index + 1).toString() }}
            </dt>
            <dd
              class="address__form"
              v-bind:style="accordion['shipping'][index]['height']"
            >
              <transition-group
                name="switchForm"
                mode="out-in"
                tag="div"
                class="switchForm"
              >
                <div v-if="isInput(index)" v-bind:key="'input'">
                  <label>郵便番号</label>
                  <div class="address__post-code">
                    <input
                      placeholder="1234567"
                      v-bind:value="shipping.zip"
                      v-on:change="shipping.zip = $event.target.value"
                    />
                    <button v-on:click="zipToAddress(shipping, index)">
                      郵便検索
                    </button>
                  </div>

                  <label>都道府県（配送不可の地域は表示されません）</label>
                  <select
                    v-bind:style="selectColor[index]"
                    v-on:change="
                      updatePref(shipping, index, $event.target.value)
                    "
                  >
                    <option value="">選択してください</option>
                    <option
                      style="color: #000"
                      v-for="(shippingArea, i) in shippingAreas"
                      v-if="isShippingArea(shippingArea)"
                      v-bind:selected="shipping.pref_code == parseInt(i) + 1"
                      v-bind:value="i"
                    >
                      {{ shippingArea.name }}
                    </option>
                  </select>

                  <label>市区郡町村</label>
                  <input
                    placeholder="千代田区"
                    v-bind:value="shipping.city"
                    v-on:change="shipping.city = $event.target.value"
                  />

                  <label>町名</label>
                  <input
                    placeholder="外神田"
                    v-bind:value="shipping.street"
                    v-on:change="shipping.street = $event.target.value"
                  />

                  <label>番地</label>
                  <input
                    placeholder="1-1-1"
                    v-bind:value="shipping.address"
                    v-on:change="shipping.address = $event.target.value"
                  />

                  <label>建物名・号室</label>
                  <input
                    placeholder="アップルアパート"
                    v-bind:value="shipping.addition"
                    v-on:change="shipping.addition = $event.target.value"
                  />

                  <label
                    >電話番号 <span>半角数字で入力してください</span></label
                  >
                  <div class="tel-form">
                    <input
                      placeholder="03"
                      v-bind:value="shipping.tel_1"
                      v-on:change="shipping.tel_1 = $event.target.value"
                    />
                    <span>ー</span>
                    <input
                      placeholder="1234"
                      v-bind:value="shipping.tel_2"
                      v-on:change="shipping.tel_2 = $event.target.value"
                    />
                    <span>ー</span>
                    <input
                      placeholder="5678"
                      v-bind:value="shipping.tel_3"
                      v-on:change="shipping.tel_3 = $event.target.value"
                    />
                  </div>

                  <label>お届け先名</label>
                  <input
                    placeholder="山田　太郎"
                    v-bind:value="shipping.name"
                    v-on:change="shipping.name = $event.target.value"
                  />

                  <div class="address__button">
                    <button
                      type="button"
                      class="button--gray"
                      v-on:click="readyForDelete(shipping)"
                    >
                      削除する
                    </button>
                    <button
                      type="button"
                      class="button--orange"
                      v-on:click="moveStepOfShipping(index)"
                    >
                      確認
                    </button>
                  </div>
                </div>

                <div v-else v-bind:key="'confirm'">
                  <label>郵便番号</label>
                  <p>{{ shipping.zip }}</p>

                  <label>都道府県</label>
                  <p>{{ shipping.pref }}</p>

                  <label>市区郡町村</label>
                  <p>{{ shipping.city }}</p>

                  <label>市区郡町村</label>
                  <p>{{ shipping.street }}</p>

                  <label>番地</label>
                  <p>{{ shipping.address }}</p>

                  <label>建物名・号室</label>
                  <p>{{ shipping.addition }}</p>

                  <label>電話番号</label>
                  <p>{{ getTel(shipping) }}</p>

                  <label>お届け先名</label>
                  <p>{{ shipping.name }}</p>

                  <div class="address__button">
                    <button
                      type="button"
                      class="button--gray"
                      v-on:click="fallBackStepOfShipping(index)"
                    >
                      戻る
                    </button>
                    <button
                      v-if="shipping.shipping_id == ''"
                      type="button"
                      class="button--orange"
                      v-on:click="saveShipping(shipping, 'register')"
                    >
                      この内容で登録
                    </button>

                    <button
                      v-else
                      type="button"
                      class="button--orange"
                      v-on:click="saveShipping(shipping, 'update')"
                    >
                      この内容で更新
                    </button>
                  </div>
                </div>
              </transition-group>
            </dd>
          </dl>
        </div>

        <button
          type="button"
          class="address__add-button"
          v-on:click="addShipping"
        >
          <span>お届け先を追加</span>
        </button>

        <dl class="accordion">
          <dt
            class="accordion__title"
            v-bind:class="accordion['area']['title']"
            v-on:click="toggleAccordion('area')"
          >
            配送可能エリアを確認
          </dt>
          <dd v-bind:style="accordion['area']['height']">
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
                <tr v-for="shippingArea in shippingAreas">
                  <td>{{ shippingArea.name }}</td>
                  <td>{{ shippingArea.S }}</td>
                  <td>{{ shippingArea.M }}</td>
                  <td>{{ shippingArea.L }}</td>
                </tr>
              </tbody>
            </table>
          </dd>
        </dl>
      </div>
    </main>
    <!-- 新規登録完了モーダル -->
    <div
      id="register-modal"
      class="modal-wrapper"
      v-bind:class="modal['register']"
    >
      <div class="modal__inner">
        <p class="modal__text">お届け先の登録が完了しました</p>
        <button
          type="button"
          class="modal__close"
          v-on:click="closeModal('register')"
        >
          閉じる
        </button>
      </div>
    </div>

    <!-- 更新完了モーダル -->
    <div id="update-modal" class="modal-wrapper" v-bind:class="modal['update']">
      <div class="modal__inner">
        <p class="modal__text">お届け先の登録を更新しました</p>
        <button
          type="button"
          class="modal__close"
          v-on:click="closeModal('update')"
        >
          閉じる
        </button>
      </div>
    </div>

    <!-- 削除確認モーダル -->
    <div id="delete-modal" class="modal-wrapper" v-bind:class="modal['delete']">
      <div class="modal__inner">
        <p class="modal__text">
          削除しますか？<span>※この操作は取り消せません</span>
        </p>
        <div class="modal__button-wrapper">
          <button
            type="button"
            class="modal__cancel"
            v-on:click="cancelDeleting()"
          >
            キャンセル
          </button>
          <button
            type="button"
            class="modal__ok"
            v-on:click="executeDeleting()"
          >
            削除する
          </button>
        </div>
      </div>
    </div>

    <!-- 削除完了モーダル -->
    <div
      id="delete-complete-modal"
      class="modal-wrapper"
      v-bind:class="modal['deleteComplete']"
    >
      <div class="modal__inner">
        <p class="modal__text">お届け先の登録を更新しました</p>
        <button
          type="button"
          class="modal__close"
          v-on:click="closeModal('deleteComplete')"
        >
          閉じる
        </button>
      </div>
    </div>

    <Footer :ficon="ficon" />
  </div>
</template>

<script>
import axios from "axios";
import Loading from "@/components/Loading";
import InputAddress from "@/components/InputAddress";
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  components: { Loading, InputAddress },
  data: () => {
    return {
      htitle: "お届け先の登録･編集",
      ficon: 2,
      loading: true,
      //////////
      drawer: false,
      direction: "btt",
      newShipping: null,
      shippings: [],
      accordion: {
        area: { title: "", height: "height: 0;" },
        shipping: [],
      },
      step: [],
      modal: {
        register: "",
        update: "",
        delete: "",
        deleteComplete: "",
      },
      shippingAreas: [],
      deletingData: "",
      selectColor: [],
    };
  },
  created() {
    console.clear();
  },
  mounted() {
    this.shippings = JSON.parse(JSON.stringify(this.userShipping));
    this.loading = false;
    this.shippingAreas = this.setShippingArea();
    this.resetData();
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
      "shipping",
    ]),
    ...mapGetters("products", ["products", "shippingTable", "constPref"]),
    isNameOpen() {
      return;
    },
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
      "setshipping",
    ]),
    ...mapActions("products", [
      "setProducts",
      "setShippingTable",
      "setConstPref",
    ]),

    cartToggle: function () {
      this.drawer = !this.drawer;
    },

    /* 配送先を配列に追加
     *********************************/
    addShipping() {
      //if( this.newShipping != null ) return

      var shippingData = {
        shipping_id: "",
        userId: this.userProfile.userId,
        zip: "",
        pref: "",
        pref_code: "",
        city: "",
        street: "",
        address: "",
        addition: "",
        tel_1: "",
        tel_2: "",
        tel_3: "",
        name: "",
      };

      this.newShipping = shippingData;
      this.shippings.push(this.newShipping);
      this.accordion.shipping.push({ title: "", height: "height: 0;" });
      this.step.push("input");
      this.selectColor.push("color: #b2b2b2;");
    },

    /* 入力情報を保存
     *********************************/
    saveShipping: function (e, key) {
      this.loading = true;

      var db = new URLSearchParams();
      db.append("shipping", JSON.stringify(e));
      axios
        .post(process.env.MAIN_API + "/saveShipping", db)
        .then(
          function (result) {
            this.openModal(key);
            this.getUserShipping();
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        })
        .finally(function () {}.bind(this));
    },

    /* 配送先を削除
     *********************************/
    deleteShipping: function (e) {
      this.loading = true;

      var db = new URLSearchParams();
      db.append("shipping", JSON.stringify(e));
      axios
        .post(process.env.MAIN_API + "/deleteShipping", db)
        .then(
          function (result) {
            this.getUserShipping();
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        })
        .finally(function () {}.bind(this));
    },

    /* ユーザーが登録している配送先住所を呼び出して更新する(全体)
     *****************************************************/
    getUserShipping: function () {
      var db = new URLSearchParams();
      db.append("userProfile", JSON.stringify(this.userProfile));
      axios
        .post(process.env.MAIN_API + "/getUserShipping", db)
        .then(
          function (result) {
            this.setUserShipping(result.data);
            this.shippings = JSON.parse(JSON.stringify(this.userShipping));
            this.resetData();
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

    /* 更新ボタンDisabled 判定
     *****************************************************/
    isUpdate: function (shipping) {
      if (
        shipping.address != "" &&
        shipping.city != "" &&
        shipping.name != "" &&
        shipping.pref != "" &&
        shipping.pref_code != "" &&
        shipping.street != "" &&
        shipping.tel_1 != "" &&
        shipping.tel_2 != "" &&
        shipping.tel_3 != "" &&
        shipping.userId != "" &&
        shipping.zip != ""
      )
        return true;
      else {
        return false;
      }
    },

    /* 郵便番号から住所を取得する
     ******************************************************/
    zipToAddress: function (shipping, index) {
      if (isNaN(shipping.zip)) {
        this.$message.error("郵便番号には数字のみを指定してください");
        return;
      }

      this.loading = true;

      var db = new URLSearchParams();
      db.append("zip", shipping.zip);
      axios
        .get(`${process.env.MAIN_API}/aec/const-zips?zip=${shipping.zip}`, {
          params: {token: process.env.INFO_TOKEN}
        }).then(
          function (result) {
            if (result.data) {
              shipping.pref = result.data.prefName;
              shipping.pref_code = result.data.prefCode;
              shipping.city = result.data.cityName;
              shipping.street = result.data.printName;
              this.selectColor[index] = "color: #000;";
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

    /* アコーディオン
     *********************************/
    toggleAccordion(key) {
      if (this.accordion[key]["title"] === "open") {
        this.accordion[key]["title"] = "";
        this.accordion[key]["height"] = "height: 0;";
      } else {
        this.accordion[key]["title"] = "open";
        this.accordion[key]["height"] = "height: auto;";
      }
    },

    toggleAccordionOfShipping(index) {
      if (this.accordion["shipping"][index]["title"] === "open") {
        this.accordion["shipping"][index]["title"] = "";
        this.accordion["shipping"][index]["height"] = "height: 0;";
      } else {
        this.accordion["shipping"][index]["title"] = "open";
        this.accordion["shipping"][index]["height"] = "height: auto;";
      }
    },

    /* 入力フォームと確認画面の切り替え
     *********************************/
    moveStepOfShipping(index) {
      if (!this.validation(index)) {
        return;
      }
      this.$set(this.step, index, "confirm");
    },
    fallBackStepOfShipping(index) {
      this.$set(this.step, index, "input");
    },

    isInput(index) {
      return this.step[index] === "input";
    },

    /* モーダルの動作
     *********************************/
    openModal(key) {
      this.modal[key] = "show";
      document.getElementsByTagName("body")[0].classList.add("fixed");
    },
    closeModal(key) {
      this.modal[key] = "";
      document.getElementsByTagName("body")[0].classList.remove("fixed");
    },

    /* データの初期化
     *********************************/
    setShippingArea() {
      let array = [];
      if (this.constPref !== "" && this.shippingTable !== "") {
        this.constPref.forEach((e) => {
          array[e.pref_code - 1] = {
            name: e.jp,
            S: "配送不可",
            M: "配送不可",
            L: "配送不可",
          };
        });
        this.shippingTable.forEach((e) => {
          array[e.pref_code - 1][e.size_code] =
            e.shipping_fee.toLocaleString() + "円";
        });
      }
      return array;
    },

    resetData() {
      this.accordion.area = { title: "", height: "height: 0;" };
      this.accordion.shipping = [];
      this.step = [];
      this.selectColor = [];

      if (this.shippings == "") {
        return;
      }

      this.shippings.forEach(() => {
        this.accordion.shipping.push({ title: "", height: "height: 0;" });
        this.step.push("input");
        this.selectColor.push("color: #000;");
      });
    },

    /* 入力フォームの動作
     *********************************/
    isShippingArea(shippingArea) {
      return (
        shippingArea.S != "配送不可" ||
        shippingArea.M != "配送不可" ||
        shippingArea.L != "配送不可"
      );
    },

    getTel(shipping) {
      if (!shipping.tel_1 || !shipping.tel_2 || !shipping.tel_3) {
        return;
      }
      return shipping.tel_1 + "-" + shipping.tel_2 + "-" + shipping.tel_3;
    },

    updatePref(shipping, colorIndex, prefIndex) {
      if (prefIndex == "") {
        this.selectColor[colorIndex] = "color: #b2b2b2;";
        shipping.pref = "";
        shipping.pref_code = "";
        return;
      }
      this.selectColor[colorIndex] = "color: #000;";
      shipping.pref = this.shippingAreas[prefIndex].name;
      shipping.pref_code = parseInt(prefIndex) + 1;
    },

    validation(index) {
      const e = this.shippings[index];
      if (!this.isUpdate(e)) {
        this.$message.error("入力項目が不完全です");
        return false;
      }

      if (isNaN(e.zip)) {
        this.$message.error("郵便番号には数字のみを指定してください");
        return false;
      }

      var prefcode_list = this.shippingTable.map((p) => {
        return p.pref_code;
      });
      if (!prefcode_list.includes(e.pref_code)) {
        this.$message.error("お届けできない地域です");
        return false;
      }

      // if (!e.address.match(/^([0-9]|-)*$/)) {
      //   this.$message.error("番地には数字とハイフンのみ使用できます");
      //   return false;
      // }

      if (isNaN(e.tel_1) || isNaN(e.tel_2) || isNaN(e.tel_3)) {
        this.$message.error("電話番号には数字を指定してください");
        return false;
      }

      if (!e.tel_1.match(/^0[1-9]/)) {
        this.$message.error("電話番号は市外局番から入力してください");
        return false;
      }

      return true;
    },

    readyForDelete(shipping) {
      this.deletingData = shipping;
      this.openModal("delete");
    },
    cancelDeleting() {
      this.deletingData = "";
      this.closeModal("delete");
    },
    executeDeleting() {
      this.deleteShipping(this.deletingData);
      this.closeModal("delete");
      this.openModal("deleteComplete");
    },
  },
};
</script>

<style>
.switchForm {
  position: relative;
}
.switchForm-enter-active,
.switchForm-leave-active {
  transition: all 0.3s ease-in-out;
}
.switchForm-enter-active {
  position: absolute;
}
.switchForm-enter,
.switchForm-leave-to {
  opacity: 0;
}
</style>
