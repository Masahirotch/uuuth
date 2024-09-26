<template>
  <div>
     <Loading v-if="isLoading" />

       <h1 mb-1>店舗共有番号登録</h1>
       <div inner pb-3i>

         <h2 mb-2>ユーザー登録を行います。</h2>

          <div input-box>
            <label>事業者名（管理者のみ変更可）</label>
            <el-input placeholder="店舗名を入れてください" v-model="bizName" :disabled="true"></el-input>
          </div>

          <div input-box>
            <label>店舗電話番号（管理者のみ変更可）</label>
            <el-input type="tel" placeholder="店舗のお電話番号を入力してください" v-model="tel" :disabled="true"></el-input>
          </div>

          <div input-box>
            <label>ご担当者名</label>
            <el-input placeholder="ご担当者のお名前を入力してください" v-model="manager"></el-input>
          </div>

          <div input-box>
            <label>ご担当者電話番号</label>
            <el-input type="tel" placeholder="ご担当者の携帯電話番号を入力してください" v-model="mobile" ></el-input>
          </div>

          <div center pt-2>
            <el-button type="info" v-if="!sendOK">正しいデータを入力してください</el-button>
            <el-button type="success" v-if="sendOK" @click="registUserData">登録する</el-button>
          </div>

          <p center red small mt-2>正しいデータを入力すると、<br>送信できるようになります。</p>

      </div>

  </div>
</template>

<script>
import { mapState , mapGetters, mapActions } from 'vuex'
import axios from 'axios'
import Loading from '@/components/Loading'
export default {
  /*
  ***************************************/
  components: { Loading },
  /*
  ***************************************/

  /*
  ***************************************/
  data() {
    return {
      isLoading : true,
      // 店舗情報
      bizName : '',
      manager : '',
      tel     : '',
      mobile  : '',

      validation : {

        bizName : { chk : false , data : '' },
        manager : { chk : false , data : '' },
        tel     : { chk : false , data : '' },
        mobile  : { chk : false , data : '' },

      },
      parent_id : '',

      sendOK : false,

      parent_data :'',

    }
  },
  /*
  ***************************************/
  watch: {

    bizName : function(value){

      if (value === null || value === undefined || value == '') {

        this.validation.bizName.chk = false

      }
      else{

        this.validation.bizName.chk = true
        this.validation.bizName.data = value

      }

      this.allValid()

    },

    tel : function (value) {

      this.validation.tel.data = value

      if (value === null || value === undefined) {

        this.validation.tel.chk = false

      }

      var telVal = value.replace(/[━.*‐.*―.*－.*\-.*ー.*\-]/gi,'')

      // ハイフンを無視
      var chktel = /^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/
      // ハイフンあり
      var chktel2 = /^\d{2,5}-\d{1,4}-\d{4}$/


      if( chktel.test( value ) || chktel2.test( value ) ) {
        this.validation.tel.chk = true
        this.validation.tel.data = value
      }
      else{
        this.validation.tel.chk = false
      }

      this.allValid()

    },

    mobile : function (value) {

      this.validation.mobile.data = value

      if (value === null || value === undefined) {

        this.validation.mobile.chk = false

      }

      var telVal = value.replace(/[━.*‐.*―.*－.*\-.*ー.*\-]/gi,'')

      // ハイフンを無視
      var chktel = /^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/
      // ハイフンあり
      var chktel2 = /^\d{2,5}-\d{1,4}-\d{4}$/


      if( chktel.test( value ) || chktel2.test( value ) ) {
        this.validation.mobile.chk = true
        this.validation.mobile.data = value
      }
      else{
        this.validation.mobile.chk = false
      }

      this.allValid()

    },

    manager : function (value) {

      if (value === null || value === undefined) {

        this.validation.manager.chk = false

      }
      else{
        this.validation.manager.chk = true
        this.validation.manager.data = value
      }

      this.allValid()

    },



  },

  /*
  ***************************************/
  mounted(){

    console.clear()
    this.parent_id = this.$route.params.parentID

    if( this.userProfile == '' ){
        console.dir(this.$route)
      console.dir('init LIFF')
      this.initializeLiff()
    }
    if( this.userProfile != '' ){
      console.dir('db Check')
      this.dbCheck()
    }

  },
  computed: {
      ...mapGetters( 'user' , [ 'userProfile','userRegist' ]),

  },
  /*
  ***************************************/
  methods:{
    ...mapActions('user',[ 'setProfile' , 'setRegist' ]),
      ////////////////////////////////////////////////////////
      initializeLiff() {
        liff.init({ liffId : process.env.LIFF_ID })
          .then( async() => { await this.checkLogin(); })
          .catch((err) => { console.log(err.code, err.message); });
      },
      checkLogin() {
        if ( !liff.isLoggedIn() ){ liff.login({ redirectUri: 'https://liff.line.me/' + process.env.LIFF_ID + '/childlink/' + this.parent_id }); }
        //if ( !liff.isLoggedIn() ){ liff.login(); }
        else { this.getProfile(); }
      },
      getProfile() {
        liff.getProfile().then( async (profile) => {
            this.setProfile(profile)
        })
        .then( function() {
            this.dbCheck()
        }.bind(this))
        .catch((err) => { console.log(err.code, err.message); });
      },

      dbCheck : function(){

        // データベースにホスト登録ありかチェックしに行く
        const params = new URLSearchParams()
        axios.post( process.env.API_URL + 'findUser' , {
              token: process.env.API_TOKEN,
              userId: this.userProfile.userId,
              displayName: this.userProfile.displayName,
              parentID: this.parent_id,
        } )
            .then( function(result){

                this.setRegist(result.data.user)

            }.bind(this))
            .catch((err) => {

              console.dir(err)

            })
            .finally(function(){

              this.setForm()

            }.bind(this))

      },

      setForm : async function(){

        console.dir(this.userRegist)

        axios.post( process.env.API_URL + 'getUsers' , {
              token: process.env.API_TOKEN,
              where: {ID: this.parent_id},
        } )
            .then( function(result){
                if (! result.data.foundUsers) this.$router.push('/')
                if (! result.data.foundUsers[0]) this.$router.push('/')
                console.dir(result.data.foundUsers[0])
                this.parent_data = result.data.foundUsers[0]

            }.bind(this))
            .catch((err) => {

              console.dir(err)

            })
            .finally(function(){

                this.bizName = this.parent_data.bizName
                this.tel     = this.parent_data.shop_tel
                this.manager = ( this.userRegist.manager == null )? '':this.userRegist.manager
                this.mobile  = ( this.userRegist.user_tel == null )? '':this.userRegist.user_tel

                this.isLoading = false

            }.bind(this))


      },

      allValid : function(){

        if(
          this.validation.bizName.chk == false ||
          this.validation.manager.chk == false ||
          this.validation.tel.chk     == false ||
          this.validation.mobile.chk  == false ){
           this.sendOK = false
        }
        else{
          this.sendOK = true
        }

      },

      registUserData : function(){

        this.isLoading = true

        // ユーザー登録
        axios.post( process.env.API_URL + 'updateUser' , {
              token: process.env.API_TOKEN,
              userId: this.userProfile.userId,
              set_user: {
                bizName: this.validation.bizName.data,
                shop_tel: this.validation.tel.data,
                manager: this.validation.manager.data,
                user_tel: this.validation.mobile.data,
                displayName: this.userProfile.displayName,
              }
        } )
            .then( function(result){

              this.setRegist(result.data)

            }.bind(this))
            .catch((err) => {

            })
            .finally(function(){
              this.sendMsg()
            }.bind(this))

      },


    sendMsg : function(){

      var message = `登録者 : ${this.userProfile.displayName}
以下の内容を登録しました。

店舗名　　 : ${this.bizName}
店舗電話　 : ${this.tel}
担当者　　 : ${this.manager}
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
              liff.closeWindow()
              this.isLoading = false
            }.bind(this))

    },

  },


};
</script>

<style>
[input-box]{padding:1em 12px;}
[input-box] label{font-size:min(3.6vmin , 14px);line-height:1.5em;}

















</style>
