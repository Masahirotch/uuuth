<template>
  <div app-index>
    <div v-if="!setUP" loader-outer>
      <div class="loader">Loading...</div>
    </div>
    <div center full-content v-if="!setUP">初期化中...</div>
    <div center full-content v-if="setUP">
      <!-- <div top-logo><img src="@/static/resource/hiyoshi-logo.png"></div>
        <div top-catch><img src="@/static/resource/top-text.svg"></div> -->

      <!-- <button hiyoshi-info @click="goRegist">
            <img src="@/static/resource/btn-shop.svg">
        </button>

        <button hiyoshi-info @click="addChild" v-if="isParent && userRegist.bizName !='' && userRegist.shop_tel !=''　&& userRegist.manager !=''　&& userRegist.user_tel !='' ">
            <img src="@/static/resource/btn-qr.svg">
        </button> -->

      <button hiyoshi-info @click="goSale" v-if="userRegist.flg_5">
        <img src="@/static/resource/btn-sale.svg" />
      </button>
      <!--
        <button hiyoshi-info @click="goRegist">
            <img src="@/static/resource/btn-history.svg">
        </button>
-->
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import axios from "axios";
export default {
  data() {
    return {
      setUP: false,
    };
  },
  mounted() {
    console.clear();
    console.dir(this.userRegist.bizName);

    this.initializeLiff();
  },
  computed: {
    ...mapGetters("user", ["userProfile", "userRegist"]),

    isParent: function () {
      console.dir(this.userRegist);

      if (this.userRegist != "") {
        if (
          this.userRegist.parentID == null ||
          this.userRegist.parentID == "null"
        )
          return true;
        else return false;
      } else {
        return false;
      }
    },
    isUser: function () {
      if (this.userRegist.bizName == "" || this.userRegist.shop_tel == "")
        return "店舗登録";
      if (this.userRegist.bizName != "" && this.userRegist.shop_tel != "")
        return "店舗編集";
    },
  },
  methods: {
    ...mapActions("user", ["setProfile", "setRegist"]),
    ////////////////////////////////////////////////////////
    async initializeLiff() {
      await liff
        .init({ liffId: process.env.LIFF_ID })
        .then(async () => {
          await this.checkLogin();
        })
        .catch((err) => {
          console.log(err.code, err.message);
        });
    },
    async checkLogin() {
      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        await this.getProfile();
      }
    },
    async getProfile() {
      await liff
        .getProfile()
        .then(async (profile) => {
          await this.setProfile(profile);
        })
        .then(
          async function () {
            await this.getStatus();
          }.bind(this)
        )
        .catch((err) => {
          console.log(err.code, err.message);
        })
        .finally(function () {}.bind(this));
    },

    getStatus: async function () {
      // データベースにホスト登録ありかチェックしに行く
      await axios
        .post(process.env.API_URL + "findUser", {
          token: process.env.API_TOKEN,
          userId: this.userProfile.userId,
          displayName: this.userProfile.displayName,
        })
        .then(
          async function (result) {
            if (!result.data.user?.flg_5) {
              return await this.alertBox(
                "error",
                "ユーザーが登録されていません",
                "error"
              );
            } else {
              await this.setRegist(result.data.user);
            }
          }.bind(this)
        )
        .catch((err) => {
          console.dir(err);
        })
        .finally(
          function () {
            //this.setForm()
          }.bind(this)
        );

      if (this.$route.query["liff.state"] != undefined) {
        this.$router.push(this.$route.query["liff.state"]);
      }
      this.setUP = true;
      //this.goSale()
    },

    goRegist: function () {
      this.$router.push("/idlink/");
    },
    addChild: function () {
      this.$router.push("/add-child/");
    },
    goSale: function () {
      this.$router.push("/products/");
    },
    /***************************************************************
     * type (str) : success / info / warning / error
     * https://element.eleme.io/#/en-US/component/message-box
     ****************************************************************/
    alertBox: async function (title, message, type) {
      this.$alert(message, title, {
        showClose: false,
        showConfirmButton: false,
        type: type,
        dangerouslyUseHTMLString: true,
        callback: (action) => {
          liff.closeWindow();
        },
      });
    },
  },
};
</script>
<style>
/* [app-index]{background:url('/resource/hiyoshi-info-top.jpg') 50% 50% no-repeat;background-size:cover;} */
[add-child-btn] {
  margin: 3em 0 0 0 !important;
}

[top-logo] {
  width: 30%;
  margin-bottom: 1em;
}
[top-logo] img {
  width: 100%;
}
[top-catch] {
  width: 50%;
  margin-bottom: 2em;
}
[top-catch] img {
  width: 100%;
}
button[hiyoshi-info] {
  width: 80%;
  transition: opacity 0.3s ease;
  cursor: pointer;
  margin-bottom: 1em;
}
button[hiyoshi-info]:hover,
button[hiyoshi-info]:focus,
button[hiyoshi-info]:active {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

button[hiyoshi-info] img {
  width: 100%;
}

/* loading spinner */
[loader-outer] {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  position: fixed;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.6);
}
.loader {
  margin: 0 auto;
  font-size: 25px;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  position: fixed;
  text-indent: -9999em;
  -webkit-animation: load5 1.1s infinite ease;
  animation: load5 1.1s infinite ease;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
@-webkit-keyframes load5 {
  0%,
  100% {
    box-shadow: 0 -2.6em 0 0 #fff, 1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.5),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7);
  }
  12.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0 #fff,
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5);
  }
  25% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.5),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7), 2.5em 0 0 0 #fff,
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  37.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5),
      2.5em 0 0 0 rgba(255, 255, 255, 0.7), 1.75em 1.75em 0 0 #fff,
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.5),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.7), 0 2.5em 0 0 #fff,
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  62.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.5),
      0 2.5em 0 0 rgba(255, 255, 255, 0.7), -1.8em 1.8em 0 0 #fff,
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  75% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.5),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.7), -2.6em 0 0 0 #fff,
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  87.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.5),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.7), -1.8em -1.8em 0 0 #fff;
  }
}
@keyframes load5 {
  0%,
  100% {
    box-shadow: 0 -2.6em 0 0 #fff, 1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.5),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7);
  }
  12.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.7), 1.8em -1.8em 0 0 #fff,
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5);
  }
  25% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.5),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.7), 2.5em 0 0 0 #fff,
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  37.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.5),
      2.5em 0 0 0 rgba(255, 255, 255, 0.7), 1.75em 1.75em 0 0 #fff,
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.5),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.7), 0 2.5em 0 0 #fff,
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.2),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  62.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.5),
      0 2.5em 0 0 rgba(255, 255, 255, 0.7), -1.8em 1.8em 0 0 #fff,
      -2.6em 0 0 0 rgba(255, 255, 255, 0.2),
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  75% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.5),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.7), -2.6em 0 0 0 #fff,
      -1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2);
  }
  87.5% {
    box-shadow: 0 -2.6em 0 0 rgba(255, 255, 255, 0.2),
      1.8em -1.8em 0 0 rgba(255, 255, 255, 0.2),
      2.5em 0 0 0 rgba(255, 255, 255, 0.2),
      1.75em 1.75em 0 0 rgba(255, 255, 255, 0.2),
      0 2.5em 0 0 rgba(255, 255, 255, 0.2),
      -1.8em 1.8em 0 0 rgba(255, 255, 255, 0.5),
      -2.6em 0 0 0 rgba(255, 255, 255, 0.7), -1.8em -1.8em 0 0 #fff;
  }
}
.el-message-box {
  width: 95vw !important;
  max-width: 420px !important;
}
</style>
