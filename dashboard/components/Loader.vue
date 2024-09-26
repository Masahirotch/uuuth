<template>
<transition name="el-fade-in-linear">
<div over>
  <div class="blocks">
    <div class="block orange"></div>
    <div class="block blue"></div>
  </div>
  <div data-loading>{{text}}</div>
</div>
</transition>
</template>
<script>
import vue from 'vue'
export default {
    props: [
        'text',
    ],
    data() {
      return {

      }
    }
};
</script>
<style>
[over]{
  display:flex;flex-flow:column nowrap;justify-content:center;align-items:center;
  width:100% !important;min-height:100vh;
  background:rgba(255,255,255,.8);position:fixed;left:0;top:0;z-index:9999}
[data-loading]{font-size:min(3.6vmin,14px);position:absolute;margin-top:12em}.blocks{height:100vh;display:flex;align-items:center;position:relative;justify-content:center;z-index:9999}.block{--sz:8vmin;--tX:0;--animation:700ms cubic-bezier(0.3, 0.5, 0.4, 0.9) infinite alternate-reverse;--hm:4.5vmin;height:var(--sz);width:var(--sz);background-image:var(--bg);border-radius:50%;transform:translateX(var(--tX));mix-blend-mode:lighten}.orange{--bg:linear-gradient(-50deg, #fbab7e 0%, #f7ce68 100%);margin-right:var(--hm);animation:attract-orange var(--animation)}.blue{--bg:linear-gradient(50deg, #00bfd5 0%, #c5f5ff 100%);margin-left:var(--hm);animation:attract-blue var(--animation)}@keyframes attract-orange{to{transform:translateX(calc(var(--sz) + calc(var(--hm)/ 4)))}}@keyframes attract-blue{to{transform:translateX(calc(var(--sz) * -1 - calc(var(--hm)/ 4)))}}
</style>
