<template>
  <transition name="el-fade-in-linear">
    <div fullscreenloading>
      <div class="lds-hourglass"></div>
    </div>
  </transition>
</template>
<script>
import vue from 'vue'
export default {
    data() {
      return {
        
      }
    }
};
</script>

<style>
[fullscreenloading]{left:0;position:fixed;width:100vw;height:100vh;background:rgba(255,255,255,.8);z-index:999;display:flex;flex-flow:column nowrap;justify-content:center;align-items:center}[fullscreenloading] span{margin-bottom:1em}[fullscreenloading] i{font-size:2em}.lds-hourglass{display:inline-block;position:relative;width:80px;height:80px}.lds-hourglass:after{content:" ";display:block;border-radius:50%;width:0;height:0;margin:8px;box-sizing:border-box;border:32px solid #598602;border-color:#598602 transparent #598602 transparent;animation:lds-hourglass 1.2s infinite}@keyframes lds-hourglass{0%{transform:rotate(0);animation-timing-function:cubic-bezier(.55,.055,.675,.19)}50%{transform:rotate(900deg);animation-timing-function:cubic-bezier(.215,.61,.355,1)}100%{transform:rotate(1800deg)}}
</style>