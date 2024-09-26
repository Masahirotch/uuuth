<template>
  <div id="login">
    <Loader text="" v-if="loading" />
    <div full center-col>

      <div input-box :class="{ active : loginError }">

        <label>
          <span :class="{ errColor : loginError }">ユーザーID</span>
          <el-input placeholder="ログインID" v-model="userId"></el-input>
        </label>

        <label :class="{ errColor : loginError }">
          <span>パスワード</span>
          <el-input placeholder="パスワード" v-model="password" show-password></el-input>
        </label>

      </div>
      <p error mt-1 v-html="errText"></p>

      <div pt-2 pb-1 center-col>
          <el-button type="primary" @click="tryLogin">LOGIN</el-button>
      </div>

    </div>
  </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'

  const { LineClient } = require('messaging-api-line');

export default {
  data() {
    return {
      loading : true,
      userId : '',
      password : '',
      loginError : false,
      errText : '&nbsp;',
    }
  },
  created(){
    this.loading = false
  },
  mounted(){
    //this.msg()
  },
  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),

    tryLogin : function(){

      if( this.userId === process.env.ADMIN_ID ){

        if( this.password === process.env.ADMIN_PASS ){

          this.setLogin(true)
          this.$router.push('/main/')

        }
        if( this.password !== process.env.ADMIN_PASS ){

          this.loginError = true

          this.errText = '* ユーザーID、またはパスワードが正しくありません'

        }

      }
      if( this.userId !== process.env.ADMIN_ID ){

        this.loginError = true

        this.errText = '* ユーザーID、またはパスワードが正しくありません'

      }

    },

    msg : function(){

      console.dir(process.env.ACCESS_TOKEN)
      console.dir(process.env.CHANNEL_SECRET)


      const client = new LineClient({
        accessToken: process.env.ACCESS_TOKEN,
        channelSecret: process.env.CHANNEL_SECRET,
      });

      console.dir(client)

      client.multicastText(['U46178fcc5f1bf5c8508fe3a3876475b3'], 'Hello!');

    }



  },

};
</script>
<style>
[input-box]{
  width:350px;padding:2em;background:#efefef;border-radius:0.4em;
}
[input-box].active{
  background:#e8d7d7;
}

p[error]{
  font-size:12px;color:#F00;
}

.errColor{
  color:#b10000;
}











</style>
