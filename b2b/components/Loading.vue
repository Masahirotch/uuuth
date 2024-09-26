<template>
  <transition name="el-fade-in-linear">
    <div fullscreenloading>

      <div class="breeding-rhombus-spinner">
        <div class="rhombus child-1"></div>
        <div class="rhombus child-2"></div>
        <div class="rhombus child-3"></div>
        <div class="rhombus child-4"></div>
        <div class="rhombus child-5"></div>
        <div class="rhombus child-6"></div>
        <div class="rhombus child-7"></div>
        <div class="rhombus child-8"></div>
        <div class="rhombus big"></div>
      </div>

      <div mt-2 loading-text>{{text}}</div>
    </div>
  </transition>
</template>
<script>
import vue from 'vue'
export default {
    props : ['text'],
    data() {
      return {

      }
    }
};
</script>

<style>



</style>