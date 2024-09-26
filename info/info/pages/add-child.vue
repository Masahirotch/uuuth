<template>
  <div>
      <div qr-area>
          <img :src="qrSrc">
          <div text-content pl-1 pr-1>このQRコードをLINEアプリで読み込むと「店舗スタッフ」として子番号の登録を行うことができます。</div>
      </div>
  </div>
</template>

<script>
import { mapState , mapGetters, mapActions } from 'vuex'
import axios from 'axios'
export default {

  data() {
    return {
      setUP : false,
    }
  },
  mounted(){

      console.dir(this.userRegist)

  },
  computed: {
      ...mapGetters( 'user' , [ 'userProfile','userRegist' ]),

      qrSrc : function(){
          return `${process.env.API_URL}/qrcode?size=300&link=https://liff.line.me/` + process.env.LIFF_ID + '/childlink/' + this.userRegist.ID
      }


  },
  /*
  ***************************************/
  methods:{
    ...mapActions('user',[ 'setProfile' , 'setRegist' ]),
      ////////////////////////////////////////////////////////




  },


};
</script>
<style>
[qr-area]{min-height:100vh;display: flex; flex-flow:column nowrap; justify-content: center; align-items: center;}


</style>
