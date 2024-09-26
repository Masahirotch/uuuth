<template>
    <div center full>
        <Loader :text="text" v-if="loading" />

        <div v-if="isIntegrity" center-col full>
            <h4>管理者追加APP</h4>
            {{userName}}

            <el-button type="primary" mt-2i @click="addNewAdminUser">管理者に追加</el-button>

        </div>


        <el-dialog
          :visible.sync="centerDialogVisible"
          :show-close="false"
          width="80%"
          center-col
          >
          <span>既に管理者として追加済みです</span>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="centerDialogVisible = false">閉じる</el-button>
          </span>
        </el-dialog>


    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    head: {
        title: '管理者追加用APP',
        meta: [
            { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover' },
        ]
    },


    data: () => {
        return {

            adminList : [],
            loading : true,
            text    : '読み込み中...',

            isIntegrity : false,

            centerDialogVisible: false,

        }
    },
    created(){

    },
    mounted : function(){

        liff.init({ liffId: process.env.HIYOSHI_ADMIN }).then( async() => {

            await this.checkLogin();

        }).catch((err) => { console.log(err.code, err.message); });

    },

    computed: {

        userName : function(){

            return ( this.addUser.displayName != void 0 )? this.addUser.displayName : ''

        },

        ...mapGetters( 'admin' , ['adminUser','addUser']),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser','setAddUser']),

        checkLogin : function() {

            if ( !liff.isLoggedIn()) { liff.login( { redirectUri: 'https://' + process.env.APP_URL + '/admin/addAdmin/?requestUser=' + this.$route.query.requestUser } ); }
            else { this.getProfile(); }

        },
        getProfile() {

            this.text = 'ユーザーデータ取得中...'

            liff.getProfile().then( function(profile){

                this.setAddUser( profile )

            }.bind(this))
            .catch((err) => { console.log(err.code, err.message); })
            .finally(function(){

                this.init()

            }.bind(this))

        },


        ///////////////////////////////////////////////////////////////////////////////
        init :async function(){

            // get admin list
            var status = await this.getAdministrators()

            // check request parameter
            var chk = await this.checkAdmin()

            // check request User in admin list
            var checkIn = await this.checkInAdmins( chk )

            // add user action
            await this.actionBranch( checkIn )


        },

        getAdministrators: function(){

            this.text = '管理者リスト取得中...'

            var db = new URLSearchParams()
            return axios.post( process.env.API_API + 'getAdministrators' , db ).then( function(result){

                 this.adminList = JSON.parse( JSON.stringify( result.data ) )
                 return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        checkAdmin : function(){

            this.text = 'リクエスト検証中...' + this.$route.params

            if( this.$route.query['liff.state'] != void 0 && this.$route.query['liff.state'] != '' ){

                this.text = 'リクエスト検証中...' + this.$route.query['liff.state']
                return this.$route.query['liff.state'].replace('?requestUser=', '')

            }
            else if( this.$route.query.requestUser != void 0 && this.$route.query.requestUser != '' ){

                this.text = 'リクエスト検証中...' + this.$route.query.requestUser
                return this.$route.query.requestUser

            }
            else{

                this.text = 'No Param.'
                return false

            }



        },

        // adminUser の中に、招待者が含まれるか
        checkInAdmins : function( chk ){

            this.text = 'リクエスト照合中...'
            return ( this.adminList.find( admin => admin.userId == chk ) )? true:false

        },

        actionBranch : function( checkIn ){

            this.text = '管理者追加準備中...' + checkIn

            if( !checkIn ) {

                window.location.href = 'https://google.co.jp/?openExternalBrowser=1'

            }
            else{

                this.loading = false
                this.isIntegrity = true

            }


        },

        ///////////////////////////////////////////////////////////////////////////////


        // 新規に管理者として追加する
        addNewAdminUser : function(){

            var adminTarget = this.adminList.find( admin => admin.userId == this.addUser.userId )

            if( adminTarget != void 0 ){

                this.centerDialogVisible = true

            }
            else{

                var db = new URLSearchParams()
                db.append( 'addUser' , JSON.stringify( this.addUser ) )
                return axios.post( process.env.API_API + 'addNewAdminUser' , db ).then( function(result){

                    if( result.data.msg != void 0 ){

                        alert(result.data.msg)

                    }
                    else{

                        this.centerDialogVisible = true

                    }


                }.bind(this)).catch((err) => { console.dir(err); })


            }

        },


    },

};
</script>
<style>
</style>
