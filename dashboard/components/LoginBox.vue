<template>
    <el-card shadow="hover">

        <el-button @click="actLogin()" v-if="!loginStatus">ログイン</el-button>

    </el-card>
</template>
<script>
import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { mapState , mapGetters, mapActions } from 'vuex'

export default {
    name: 'LoginBox',
    data: () => {
      return {


      }
    },
    created(){

        if( this.adminList == '' ){

            this.loadAdministrators()

        }

    },
    mounted : async function(){

        if( this.$route.query.code != '' && this.$route.query.state == process.env.CHANNEL_ID ){

            if( this.adminList == '' ){

                await this.loadAdministrators()
                await this.getAccessToken()

            }
            else{

                this.getAccessToken()

            }


        }

    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser','adminList']),

        loginStatus (){

            if( this.$store.state.loggedIn ){

                this.$router.push('/main/')

            }

            return this.$store.state.loggedIn

        }
    },

    methods:{
        ...mapActions( 'admin' , ['setAdminUser','setAdminList']),

        /* 管理者リストの取得
        ************************************************/
        loadAdministrators : function(){

            var db = new URLSearchParams()
            return axios.post( process.env.API_API + 'getAdministrators' , db ).then( function(result){

                this.setAdminList(result.data)

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){  this.loading = false; }.bind(this))

        },

        /*
        WEB APP ログイン Ver.
        *********************************************************************/
        actLogin() {

            let lineAccsess = 'https://access.line.me/oauth2/v2.1/authorize?response_type=code'
            let client_id   = '&client_id=' + process.env.CHANNEL_ID
            let redirectUrl = '&redirect_uri=https%3A%2F%2F' + process.env.APP_URL + '%2F'
            let state       = '&state=' + process.env.CHANNEL_ID
            let scope       = '&scope=profile%20openid'
            let nonce       = '&nonce=' + process.env.CHANNEL_ID
            let option      = '&initial_amr_display=lineqr'
            let url = lineAccsess + client_id + redirectUrl + state + scope + nonce + option
            window.location.href = url

        },

        getAccessToken : function(){

            const params = new URLSearchParams()
            params.append( 'grant_type'   , 'authorization_code' )
            params.append( 'code'         , this.$route.query.code )
            params.append( 'redirect_uri' , 'https://'+process.env.APP_URL+'/' )
            params.append( 'client_id'    , process.env.CHANNEL_ID )
            params.append( 'client_secret', process.env.CHANNEL_SECRET )

            axios.post( 'https://api.line.me/oauth2/v2.1/token' , params )
            .then( function(result){

                console.dir('LINE Login Status Token. ▶︎')
                console.dir(result.data)

                var decoded = jwt_decode(result.data.id_token)

                var userInfo = {
                    userId      : decoded.sub,
                    displayName : decoded.name
                }
                
                this.setAdminUser(userInfo)

                console.dir( 'this.adminList ▶︎' )
                console.dir( this.adminList )

                let adminUsers = JSON.parse( JSON.stringify( this.adminList ) )
                const finded = (element) => element.userId == decoded.sub

                if( adminUsers.some(finded)  ){

                    this.$store.commit('setLogin')
                
                }
                
                if( !adminUsers.some(finded) ){
                
                    this.$store.commit('setLogout')
                
                }

            }.bind(this))
            .catch( function(error) {

                console.dir(error);
                this.$router.push('/')

            }.bind(this))
            .finally(function(){


            }.bind(this))

        },

        /*
        LIFF ログイン Ver.
        *********************************************************************/
        liffLogin() {

            liff.init({ liffId: process.env.HIYOSHI_DASHBOARD })
              .then( async() => { await this.checkLogin(); })
              .catch((err) => { console.log(err.code, err.message); });

        },
        checkLogin() {
            if ( !liff.isLoggedIn()) { liff.login(); }
            else { this.getProfile(); }
        },
        getProfile() {
            liff.getProfile().then( function(profile){

                this.setAdminUser(profile)
                let adminUsers = JSON.parse( JSON.stringify( this.adminList ) )
                const finded = (element) => element.userId == profile.userId

                if( finded  ){
                    this.$store.commit('setLogin')
                }
                if( !finded ){
                    liff.logout()
                    this.$store.commit('setLogout')
                }

            }.bind(this))
            .catch((err) => { console.log(err.code, err.message); })
            .finally(function(){


            }.bind(this))

        },
        /*******************************************************************/

        actLogout() {

            this.$store.commit('setLogout')

        }



    },

};
</script>
<style>

</style>
