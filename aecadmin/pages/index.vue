<template>
  <v-row justify="center" align="center">
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title v-if="loggedin" class="justify-center">ログイン中です</v-card-title>
        <v-card-title v-else class="justify-center">ログインしていません</v-card-title>
        <v-card-text></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn v-if="loggedin" color="primary" @click="logout">ログアウト</v-btn>
            <v-btn v-else color="primary" @click="login">ログイン</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import axios from 'axios'
import jwt_decode from 'jwt-decode'

export default {
  name: 'IndexPage',

  data: () => ({
    loginInfo: {},
    loggedin: false,
  }),

  mounted() {
    //ログイン中ならユーザ種別に対応したメニューを表示
    if('aeclogin' in sessionStorage) {
      this.loginInfo = JSON.parse(sessionStorage.aeclogin);
      this.loggedin = true;
      this.$nuxt.$emit('updateMenu', {loggedin: this.loggedin, loginInfo: this.loginInfo});
    }
    //アクセストークンの取得
    if(!!this.$route.query.code && this.$route.query.state == process.env.CHANNEL_ID) {
      this.getAccessToken();
    }
  },

  methods:{
    //LINE WEB APP ログイン (認可の要求)
    login() {
      let lineAccess   = 'https://access.line.me/oauth2/v2.1/authorize?';
      let response_type = 'response_type=code';
      let client_id     = '&client_id=' + process.env.CHANNEL_ID;
      let redirect_url  = '&redirect_uri=' + process.env.APP_URL + '%2F';
      let state         = '&state=' + process.env.CHANNEL_ID;
      let scope         = '&scope=profile%20openid';
      let nonce         = '&nonce=' + process.env.CHANNEL_ID;
      let option        = '&initial_amr_display=lineqr';
      let url = lineAccess + response_type + client_id + redirect_url + state + scope + nonce + option;
      window.location.href = url;
    },
    //アクセストークンとログインユーザ情報の取得
    getAccessToken() {
      const params = new URLSearchParams()
      params.append('grant_type'   , 'authorization_code')
      params.append('code'         , this.$route.query.code)
      params.append('redirect_uri' , process.env.APP_URL+'/')
      params.append('client_id'    , process.env.CHANNEL_ID)
      params.append('client_secret', process.env.CHANNEL_SECRET)
      axios.post('https://api.line.me/oauth2/v2.1/token', params)
        .then(response => {
          var decoded = jwt_decode(response.data.id_token);
          axios.get(`${process.env.API}/aec/line?id=${decoded.sub}&token=${process.env.INFO_TOKEN}&name=${decoded.name}`)
            .then(response => {
              this.loginInfo = response.data.loginInfo;
              //sessionStorageにログイン情報を登録
              sessionStorage.setItem('aeclogin', JSON.stringify(this.loginInfo));
              //メニューを更新
              this.loggedin = response.data.status;
              this.$nuxt.$emit('updateMenu', {loggedin: this.loggedin, loginInfo: this.loginInfo});
            })
            .catch(error => { //ユーザ情報の取得失敗
              console.log(error);
            });
          })
        .catch(error => { //アクセストークンの取得失敗
          console.log(error);
      });
    },
    //ログアウト
    logout() {
      this.loginInfo = {adminUser: false, userId: '', name: '', shopId: '', role: '', line: ''};
      //sessionStorageからログイン情報を削除
      sessionStorage.removeItem('aeclogin');
      //メニューを更新
      this.loggedin = false;
      this.$nuxt.$emit('updateMenu', {loggedin: this.loggedin, loginInfo: this.loginInfo});
    },
  }
}
</script>
