<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />

        <h4 pl-2 pt-2>[ 管理ユーザー ]</h4>

        <div pl-2 pr-2 pt-1>

            <dl v-for="(user , index) in adminList" admin-user>
                <dd>{{user.displayName}}</dd>
                <dd>LINE USER ID : {{user.userId}}</dd>
                <dd btn-sec>
                    <div>
                        <el-button type="danger" size="mini"
                        v-if="adminUser.userId != user.userId && user.privilege == 1"
                        @click="deleteAdminUser(user)"> 停止する </el-button>

                        <el-button type="info" size="mini"
                        v-if="adminUser.userId != user.userId && user.privilege == 0"
                        @click="reStartAdminUser(user)"> 停止中 </el-button>

                    </div>
                    <el-button type="success" size="mini" v-if="adminUser.userId == user.userId" disabled>ログイン中</el-button>
                </dd>
            </dl>

        </div>


        <div center-col mt-4 pb-4>
            <span class="demonstration">管理者追加用QRコード</span>
            <el-image :src="qrCode">
              <div slot="placeholder" class="image-slot">
                Loading<span class="dot">...</span>
              </div>
            </el-image>
            <span class="demonstration" mt-1>管理者追加用QRコード</span>
            <span class="demonstration" mt-1>{{viewUrl}}</span>
        </div>




    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {

            adminList : [],

            loading : true,
            text    : '読み込み中...'

        }
    },
    created(){

    },
    mounted : function(){

        this.loading = false

        this.getAdministrators()



    },

    computed: {

        qrCode : function(){

            var url = 'https://liff.line.me/' + process.env.HIYOSHI_ADMIN + '/?requestUser=' + this.adminUser.userId
            return 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + url + '&choe=UTF-8'

        },
        viewUrl : function(){

            return 'https://liff.line.me/' + process.env.HIYOSHI_ADMIN + '/?requestUser=' + this.adminUser.userId

        },



        ...mapGetters( 'admin' , ['adminUser']),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),

        getAdministrators: function(){

            var db = new URLSearchParams()
            axios.post( process.env.API_API + 'getAllAdministrators' , db ).then( function(result){

                 this.adminList = JSON.parse( JSON.stringify( result.data ) )

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        ///////////////////////////////////////////////////////////////
        deleteAdminUser : function(user){

            this.$confirm('削除対象 : ' + user.displayName , '本当に停止しますか?', {
              confirmButtonText: '停止する',
              cancelButtonText: 'キャンセル',
              type: 'error'
          }).then(function(){

                this.deleteAdminUserAct(user)

            }.bind(this))
            .catch(() => {

            });

        },

        deleteAdminUserAct : function(user){

            var db = new URLSearchParams()
            db.append( 'user' , JSON.stringify( user ) )
            return axios.post( process.env.API_API + 'deleteAdminUser' , db ).then( function(result){

                console.dir( result.data )
                this.getAdministrators()

            }.bind(this)).catch((err) => { console.dir(err); })


        },

        ///////////////////////////////////////////////////////////////
        reStartAdminUser : function(user){

            this.$confirm('再利用対象 : ' + user.displayName , '利用を再開しますか？', {
                confirmButtonText: '再利用する',
                cancelButtonText: 'キャンセル',
                type: 'info'
            }).then(function(){

                this.reStartAdminUserAct(user)

            }.bind(this))
            .catch(() => {

            });

        },
        reStartAdminUserAct : function( user ){

            console.dir( user )

            var db = new URLSearchParams()
            db.append( 'user' , JSON.stringify( user ) )
            return axios.post( process.env.API_API + 'restartAdminUser' , db ).then( function(result){

                console.dir( result.data )
                this.getAdministrators()

            }.bind(this)).catch((err) => { console.dir(err); })



        },




    },

};
</script>
<style>
[admin-user]{
    display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: center;padding:1em;width:100%;
    border-bottom:1px solid #ccc;
}
[admin-user] dt{width:5em;}
[admin-user] dd{width:100%;}
[admin-user] dd[btn-sec]{width:auto;}
[add-admin-title]{position:relative;}
</style>
