<template>
  <div id="modal">
    <div id="modal-content" class="complete-modal__inner">
      <p id="modal-message" class="complete-modal__text">{{ message }}</p>
      <button class="complete-modal__close" @click="closeModal()">閉じる</button>
    </div>
    <div id="modal-overlay"></div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: ["message"],
  methods: {
    closeModal() {
      this.$emit("execute-method");
    },
  },
};
</script>

<style scoped>
.complete-modal__inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  width: calc(100% - 72px);
  background-color: var(--whiteColor);
  border-radius: 8px;
  text-align: center;
  z-index: 2;
}

.complete-modal__text {
  padding: 40px 0;
  font-weight: bold;
}

.modal__cancel {
  margin-right: 30px;
  font-size: 15px;
}

.modal__cancel:hover {
  cursor: pointer;
  color: rgb(14, 48, 240);
  font-weight: bold;
}

.complete-modal__close {
  display: block;
  width: 100%;
  padding: 0.75em;
  background-color: var(--grayColor);
  border: none;
  color: var(--whiteColor);
  font-size: 1.3em;
  font-weight: bold;
}

#modal-overlay {
  z-index: 1;
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%;
  background-color: rgba(0, 0, 0, 0.75);
}
</style>