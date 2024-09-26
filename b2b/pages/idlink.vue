<template>
  <div full-height>
    <div v-cloak>
      <div v-if="isLoading" tabindex="0" aria-busy="true" aria-label="Loading"
           class="vld-overlay is-active is-full-page">
        <div class="vld-background"></div>
        <div class="vld-icon">
          <svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" width="64" height="64" stroke="#000">
            <g fill="none" fill-rule="evenodd">
              <g transform="translate(1 1)" stroke-width="2">
                <circle stroke-opacity=".25" cx="18" cy="18" r="18"></circle>
                <path d="M36 18c0-9.94-8.06-18-18-18">
                  <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18"
                                    dur="0.8s" repeatCount="indefinite"></animateTransform>
                </path>
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div id="terms">
        <div inner pb-3i class="idlink__form">
          <h1 mb-1 v-if="displayName">ようこそ{{ displayName }}さん。</h1>

          <h2 mb-1 v-if="user?.shopCode && !isExist && !isLinked">今から、あなたのLINE IDと連携を行います。<br>連携する店舗コード：{{ user.shopCode }}</h2>
          <h2 v-if="isExist || isLinked">あなたのLINE IDは、<br>すでに以下の店舗に登録されています</h2>

          <div input-box>
            <label>店舗名</label>
            <input v-model="shopName" :disabled=true>
          </div>

          <div input-box>
            <label>事業者名</label>
            <input v-model="bizName" :disabled=true>
          </div>

          <div input-box>
            <label>店舗電話番号</label>
            <input type="tel" placeholder="店舗のお電話番号を入力してください" v-model="tel" :disabled="!canUpdateShop  || isSent">
          </div>

          <div input-box>
            <label>ご担当者名</label>
            <input :disabled="!canUpdate || isSent" placeholder="ご担当者のお名前を入力してください" v-model="ordererName">
          </div>

          <div input-box>
            <label>ご担当者電話番号</label>
            <input :disabled="!canUpdate || isSent" type="tel" placeholder="ご担当者の携帯電話番号を入力してください" v-model="mobile">
          </div>

          <div input-box>
            <div  v-if="canUpdate && !isSent">
              <h2>ID連携しますか？</h2>
              <div pt-1>
                <el-button @click="cancel" type="plain">いいえ</el-button>
                <el-button type="success" :disabled="!sendOK" @click="registUserData" style="float: right;">はい</el-button>
              </div>
            </div>

            <div  v-if="isShopCodeNotExist">
              <p red small mt-2 center>店舗コード「{{this.$route.query.shop_code}}」は、現在無効になっています。<br>管理者に連絡して有効化し、再度QRコードを撮影してください。</p>
              <div center pt-1>
                <el-button @click="cancel" type="plain" center pl-2 pr-2>OK</el-button>
              </div>
            </div>

            <div  v-if="isError">
              <p red small mt-2 center>店舗コード「{{this.$route.query.shop_code}}」の販売経路「BtoB通常」は、現在無効になっています。</p>
              <p red small mt-2 center>管理者に連絡して有効化した後に、再度QRコードを撮影してください。</p>
              <div center pt-1>
                <el-button @click="cancel" type="plain" center pl-2 pr-2>OK</el-button>
              </div>
            </div>

            <div  v-if="isExist">
              <p red small mt-2 center>別の店舗（{{user.otherShop?.shopName}}）に登録する場合は、管理者に連絡し、上記店舗との ID 連携を解除のうえ<br>改めて登録処理を行ってください。</p>
              <div center pt-1>
                <el-button @click="cancel" type="plain" center pl-2 pr-2>OK</el-button>
              </div>
            </div>

            <div mt-2 v-if="!isShopCodeNotExist && (isSent || (!canUpdate && !isExist)) && !isError">
              <h3 center>ID連携完了しました。友達追加をお願いします。</h3>
              <h3 center>友達追加して発注を始める</h3>
              <div center pt-1>
                <a :href="`https://lin.ee/${lineId}`">
                  <img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" height="36" border="0">
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  head: {
    title: 'LINE LINK ID連携アプリ',
    link: [
      {rel: 'stylesheet', type: 'text/css', href: '/resource/idlink/lib/reset.min.css', media: 'all'},
      {rel: 'stylesheet', type: 'text/css', href: '/resource/idlink/lib/common.css', media: 'all'},
      {rel: 'stylesheet', type: 'text/css', href: `${'/resource/idlink/lib/style.css?v=' + Date.now()}`, media: 'all'}
    ],
  },
  data: () => {
    return {
      isLoading: true,
      isExist: false,
      isAlready: false,
      isSent: false,
      isError: false,
      isLinked: false,
      isShopCodeNotExist: false,
      canUpdateShop: false,
      canUpdate: false,
      // 同意（初回のみにしたい）
      displayName: '',
      userId: '',
      pictureUrl: '',
      user: null,
      userProfile: null,
      // 店舗情報
      bizName: '',
      shopName: '',
      ordererName: '',
      tel: '',
      mobile: '',
      sendOK: false,
      lineId: process.env.LINE_ID_CUSTOMER,
    }
  },
  watch: {
    ordererName: function(value) {
      this.validateFields();
    },

    tel: function(value) {
      this.validateFields();
    },

    mobile: function(value) {
      this.validateFields();
    }
  },
  mounted: async function () {
    liff.init({ liffId: process.env.LIFF_ID })
        .then(() => {
          liff.getProfile()
              .then((profile) => {
                console.log(profile);
                this.userProfile = profile;
                this.displayName = this.userProfile.displayName;
                this.userId = this.userProfile.userId;
                this.pictureUrl = this.userProfile.pictureUrl;
                this.dbCheck();
                this.isLoading = false;
              })
              .catch(() => {
                if (!liff.isLoggedIn()) {
                  liff.login({ redirectUri: window.location.href });
                }
              });
        })
        .catch(() => {
          if (!liff.isLoggedIn()) {
            liff.login({ redirectUri: window.location.href });
          }
        });
  },
  methods: {
    // キャンセル
    cancel: function () {
      liff.closeWindow();
    },
    validateFields: function() {
      if (this.user?.isParent) {
        // Validate all fields
        if (this.ordererName && this.tel && this.mobile) {
          this.sendOK = this.validateTel(this.tel) && this.validateTel(this.mobile);
        } else {
          this.sendOK = false;
        }
      } else {
        // Exclude bizName and tel validation
        if (this.mobile && this.ordererName) {
          this.sendOK = this.validateTel(this.mobile);
        } else {
          this.sendOK = false;
        }
      }
    },
    validateTel: function(value) {
      const chktel = /^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/;
      const chktel2 = /^\d{2,5}-\d{1,4}-\d{4}$/;

      return chktel.test(value) || chktel2.test(value);
    },
    // データベースにホスト登録ありかチェックしに行く
    dbCheck: function() {
      if (!this.$route.query.shop_code) {
        return
      }

      axios.put(process.env.MAIN_API + '/checkShopUser', {
            userId: this.userId,
            channel: 'b',
            shopCode: this.$route.query.shop_code,
          })
          .then(function(result) {
            if(result.status === 200 && result.data.status !== 'shopNotExist'){
              this.user = result.data.data;

              switch (result.data.status) {
                case 'exist':
                  this.isExist = true;
                  this.canUpdateShop = false;
                  this.canUpdate = false;
                  break;
                case 'already':
                  this.isAlready = true;
                  this.canUpdateShop = !this.user?.userId?.trim();
                  this.canUpdate = true;
                  break;
                default:
                  this.isLinked = result.data.status === 'user';
                  this.canUpdateShop = false;
                  this.canUpdate = false;
              }

              this.shopName = this.user?.shopName;
              this.bizName = this.user?.bizName;
              this.tel = this.user?.shop_tel;
              this.ordererName = this.isAlready ? null : this.user?.ordererName;
              this.mobile = this.isAlready ? null : this.user?.user_tel;
            } else{
              this.isShopCodeNotExist = true;
            }
          }.bind(this))
          .catch((err) => {
            this.isError = true;
            console.dir(err);
          })
          .finally(function() {
            this.isLoading = false
          }.bind(this));
    },

    registUserData: function () {
      this.isLoading = true;
      // データベースにホスト登録ありかチェックしに行く
      axios.put(process.env.MAIN_API + '/saveShopUser', {
        token: process.env.API_TOKEN,
        userId: this.userProfile.userId,
        channel: 'b',
        shopCode: this.$route.query.shop_code,
        setUser: {
          bizName: this.bizName,
          shop_tel: this.tel,
          ordererName: this.ordererName,
          user_tel: this.mobile,
          displayName: this.userProfile.displayName,
        }
      }).then(function (result) {
        this.user = result.data.user;
        this.bizName = this.user?.bizName;
        this.ordererName = this.user?.ordererName;
        this.tel = this.user?.shop_tel;
        this.mobile = this.user?.user_tel;
      }.bind(this))
          .catch((err) => {
            console.dir(err);
          })
          .finally(function () {
            this.isLoading = false
            this.isSent = true;
            this.sendMsg();
          }.bind(this));
    },
    sendMsg : function(){

      var message = `登録者 : ${this.userProfile.displayName}
以下の内容を登録しました。

店舗名　　 : ${this.bizName}
店舗電話　 : ${this.tel}
担当者　　 : ${this.ordererName}
担当者電話 : ${this.mobile}`

      //// トークルームににメッセージ送信 ////////////////////////////
      liff.sendMessages([
        {
          type: 'text',
          text: message
        }
      ])
          .then(() => {
            console.log('message sent');
          })
          .catch((err) => {
            console.log('error', err);
          })
          .finally(function(){
            this.isLoading = false
          }.bind(this))

    },
  },
}
</script>

<style scoped>
.center {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;

}

.padding {
  padding: 1em;
}
</style>

<style>
#__layout {
  max-width: none !important;
}
[input-box]{padding:1em 12px;}
[input-box] label{font-size:min(3.6vmin , 14px);line-height:1.5em;}

.idlink__form input {
  transform: scale(0.95);
  width: 105%;
  margin: 4px -2.5% 6px;
  padding: 0.6em 1em;
  border: 1px solid var(--grayColor);
  border-radius: 8px;
  font-size: 16px;
  background-color: field;
}

.idlink__form input::placeholder {
  color: var(--grayColor);
}

input:disabled {
  color:black;
  background-color: var(--backColor);
}
</style>