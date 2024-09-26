<template>
    <div card-content @click="submitOya">
      <div add-product center>
        <i class="el-icon-circle-plus-outline"></i>
      </div>
    </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'

export default {
  props : ['item'],
  data() {
    return {


    }
  },
  watch : {

  },
  mounted(){

  },

  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'info' , ['allParent']),
  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'info' , ['setAllParent']),

      submitOya : function(){

        this.$emit('addNewProduct');

      }


  },

};
</script>
<style>
[add-product]{
  width: 100%;height: 100%;
}
[add-product] i{transform: scale(5);color: #ccc;}


</style>