<template>
  <ul class="product__category">
    <li class="active">全て</li>
    <li>カテゴリ</li>
    <li>カテゴリ</li>
    <li>カテゴリ</li>
  </ul>
</template>

<script>
export default {
}
</script>
<style scoped>
.product__category {
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  max-width: 500px;
  height: 48px;
  background-color: var(--whiteColor);
}
.product__category::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  height: 48px;
  background-color: var(--whiteColor);
}
.product__category li {
  position: relative;
  width: 23.5%;
  padding: 6px 0;
  border-bottom: 4px solid var(--whiteColor);
  color: var(--grayColor);
  font-size: 0.8em;
  font-weight: bold;
  text-align: center;
}
.product__category li.active {
  border-color: var(--subColor);
  color: var(--subColor);
}
</style>
