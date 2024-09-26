<template>
  <div>
    <div id="content-modal" class="modal-wrapper" v-if="!showConfirm">
    <div class="modal__inner--large">
      <button type="button" id="content-close" class="modal__close--small" @click="closeModal">
        <img src="/resource/icon_cross.svg" alt="閉じる">
      </button>

      <section class="modal__scroll">
        <h2 class="modal__title">{{list.list_name}}</h2>
        <p class="modal__item-number">発注点数：{{list.cart.length}}点</p>

        <ul class="modal__list">
          <li v-for="( item ) in list.cart">
            <span class="modal__list--name">{{item.product_name}} <label v-if="!Boolean(item.available)">※取扱停止中</label></span>
            <span class="modal__list--unit">× {{item.quantity}}</span>
          </li>
        </ul>

        <p class="modal__caution">商品の数量はカート内で変更できます。</p>
      </section>
      <button v-if="hasItemWithNotAvailable" type="button" class="modal__order">再発注不可</button>
      <button v-else type="button" id="mylistOrder" class="modal__order" @click="changeModal">この内容で再発注</button>
    </div>
  </div>

  <!-- カート内容更新確認モーダル -->
  <div id="order-modal" class="modal-wrapper" v-if="showConfirm">
    <div class="modal__inner--small">
      <p class="modal__text">この内容でカートを上書きします</p>

      <div class="modal__button-wrapper">
        <button type="button" id="orderCancel" class="modal__cancel" @click="changeModal">キャンセル</button>
        <button type="button" id="orderOk" class="modal__ok" @click="reOrder">OK</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props : ['list'],
  data: () => {
    return {
      showConfirm : false,
    }
  },
  computed:{
    hasItemWithNotAvailable: function () {
      const items = this.list.cart
      if (items) {
        return items.some(item => item.available === 0);
      }
      return false;
    },
  },
  methods: {
    closeModal() {
      this.$emit("popup")
    },
    changeModal() {
      this.showConfirm = !this.showConfirm
    },
    reOrder() {
      this.$emit("re-order")
    },
    
  },
};
</script>

<style>
</style>