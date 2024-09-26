<template>
  <div>
    <Loader text="" v-if="loading" />

    <div page-content>

      <div menu-content>

        <LeftMenu />

      </div>

      <div main-content>

       <InfoUser />

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







</style>
