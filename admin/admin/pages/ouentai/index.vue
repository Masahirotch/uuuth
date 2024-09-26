<template>
  <div>
    <Loader text="" v-if="loading" />

    <div page-content>

      <div menu-content>

        <LeftMenu />

      </div>

      <div main-content>



      </div>

    </div>

  </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'

  import LeftMenu from "@/components/LeftMenu"
export default {
    components: { LeftMenu },
  data() {
    return {
      loading : true,

    }
  },
  created(){

    if(!this.login){

      this.$router.push('/')

    }

  },
  mounted(){

    this.loading = false

  },
  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'info' , ['allParent']),
  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'info' , ['setAllParent']),






  },

};
</script>
<style>
[page-content]{
  display: flex; flex-flow:row nowrap; justify-content: space-between; align-items: center;
}
[main-content]{
  width: 100%;
}
[menu-content]{
  height: 100vh;
  position: sticky;
  top: 0;
}

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }



.el-tab-pane{height:100vh;padding-bottom:2em;overflow-y: scroll;position:relative;}









</style>
