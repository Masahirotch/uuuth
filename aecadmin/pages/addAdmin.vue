<template>
  <div center full>
    <div v-if="this.requestAdmin" center-col full>
      <h4>管理者追加APP</h4>
      {{ displayName }}
      <v-btn class="mt-4" color="blue" :disabled="Boolean(this.admin)" @click="addNewAdminUser">管理者に追加</v-btn>
    </div>
    <v-dialog center-col v-model="dialog">
      <v-card>
        <v-card-text class="text-center pt-4">
          {{ msg }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="green" block @click="close">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import liff from '@line/liff';

export default {
  name: 'AddAdminPage',
  layout: 'empty',
  data: () => ({
    loading: true,
    userId: null,
    pictureUrl: null,
    displayName: null,
    requestAdmin: null,
    admin: null,
    msg: null,
    dialog: false,
    closeWindow: false,
  }),
  mounted: function () {
    liff.init({liffId: process.env.HIYOSHI_ADMIN}).then(async () => {
      await this.checkLogin();
    }).catch((err) => {
      console.log(err.code, err.message);
    });
  },
  methods: {
    close: function () {
      this.dialog = false;
      if (this.closeWindow) {
        liff.closeWindow();
      }
    },
    showDialog(message, liffClose = true) {
      this.msg = message;
      this.dialog = true;
      this.closeWindow = liffClose;
    },
    checkLogin: function () {
      if (!liff.isLoggedIn()) {
        liff.login({redirectUri: process.env.APP_URL + '/addAdmin?requestUser=' + this.$route.query.requestUser});
      } else {
        this.getProfile();
      }
    },
    async getProfile() {
      try {
        const profile = await liff.getProfile();
        this.userId = profile.userId;
        this.displayName = profile.displayName;
        this.pictureUrl = profile.pictureUrl;
        await this.init();
      } catch (err) {
        console.log(err.code, err.message);
      }
    },
    init: async function () {
      const requestUser = this.getRequestUserId();
      if (requestUser) {
        this.requestAdmin = await this.getAdmin(requestUser);
        if (!this.requestAdmin) {
          this.showDialog('リクエストユーザが不正です。');
        } else {
          this.admin = await this.getAdmin(this.userId);
          if (this.admin) {
            this.showDialog('既に管理者として追加済みです');
          }
        }
      } else {
        this.showDialog('リクエストユーザが不正です。');
      }
    },
    getAdmin: function (userId) {
      console.log(userId)
      return axios.get(`${process.env.API}/getAdmin?userId=${userId}`)
        .then(response => {
          return response.data.admin;
        })
        .catch(error => {
          console.log(error);
          return null;
        });
    },
    getRequestUserId: function () {
      if (this.$route.query['liff.state'] != void 0 && this.$route.query['liff.state'] != '') {
        return this.$route.query['liff.state'].replace('?requestUser=', '')
      } else if (this.$route.query.requestUser != void 0 && this.$route.query.requestUser != '' && this.$route.query.requestUser != 'undefined') {
        return this.$route.query.requestUser
      } else {
        return false
      }
    },
    addNewAdminUser: function () {
      const db = new URLSearchParams()
      db.append('addUser', JSON.stringify({
        displayName: this.displayName,
        userId: this.userId
      }))
      return axios.post(`${process.env.API}/addNewAdminUser`, db).then(function (result) {
        if (result.status === 200) {
          this.showDialog(result.data.msg);
          this.admin = this.getAdmin(this.userId);
        }
      }.bind(this)).catch((err) => {
        console.dir(err);
      })
    },
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

.blue {
  background-color: #2195f1 !important;
  color: white;
}
</style>
