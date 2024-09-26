<template>
    <div sticky-menu>
        <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          active-text-color="#2267FF">

          <el-menu-item index="1">管理画面トップ</el-menu-item>
<!--
          <el-submenu index="2">
            <template slot="title">日吉の野菜情報</template>
            <el-menu-item index="2-1">ユーザー管理</el-menu-item>
            <el-menu-item index="2-2">メッセージ作成</el-menu-item>
            <el-menu-item index="2-3">メッセージ一覧</el-menu-item>
            <el-menu-item index="2-4">商品管理</el-menu-item>
            <el-menu-item index="2-5">受注管理</el-menu-item>
          </el-submenu>
-->

          <el-submenu index="7">
            <template slot="title">野菜情報 for カスタマー</template>
            <el-menu-item index="7-1">接続アカウント管理</el-menu-item>
            <el-menu-item index="7-2">商品管理</el-menu-item>
            <el-menu-item index="7-3">受注管理</el-menu-item>
          </el-submenu>

          <el-submenu index="6">
            <template slot="title">生産者DB</template>
            <el-menu-item index="6-1">データベース（記事）</el-menu-item>
          </el-submenu>


          <el-submenu index="4">
            <template slot="title">B2C受発注</template>
            <el-menu-item index="4-1">アカウント管理</el-menu-item>
            <el-menu-item index="4-2">商品管理</el-menu-item>
            <el-menu-item index="4-3">受注管理</el-menu-item>
          </el-submenu>

          <el-submenu index="8">
            <template slot="title">設定・管理</template>
            <el-menu-item index="8-1">管理ユーザー一覧</el-menu-item>
          </el-submenu>

          <el-menu-item index="9" menu-content-right v-if="isLogin"><el-button size="mini">{{adminUser.displayName}}をログアウト</el-button></el-menu-item>

        </el-menu>
    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'


export default {

    data: () => {
        return {

        }
    },
    created(){

    },
    mounted : function(){

    },
    computed: {
        ...mapGetters( 'admin' , ['adminUser']),

        activeIndex(){

            switch (this.$route.name) {

                //// トップ ///////////////////////////////////////
                case 'main':
                    return '1'
                break;

                //// 野菜情報 ///////////////////////////////////////
                case 'info':
                    return '2-1'
                break;
                case 'info-message':
                    return '2-2'
                break;
                case 'info-lists':
                    return '2-3'
                break;
                case 'info-products':
                    return '2-4'
                break;
                case 'info-order':
                    return '2-5'
                break;

                //// B2B ///////////////////////////////////////
                case 'b2b':
                    return '3-1'
                break;
                case 'b2b-order':
                    return '3-2'
                break;
                case 'b2b-lists':
                    return '3-3'
                break;
                case 'b2b-products':
                    return '3-4'
                break;

                //// B2C ///////////////////////////////////////
                case 'b2c':
                    return '4-1'
                break;
                case 'b2c-products':
                    return '4-2'
                break;
                case 'b2c-order':
                    return '4-3'
                break;
                case 'b2c-users':
                    return '4-4'
                break;
                case 'b2c-message':
                    return '4-5'
                break;
                case 'b2c-lists':
                    return '4-6'
                break;

                //// MEDIA ///////////////////////////////////////
                case 'media':
                    return '5-1'
                break;

                //// VEGEMEDIA ///////////////////////////////////////
                case 'vegemedia':
                    return '6-1'
                break;

                //// B2B2C ///////////////////////////////////////
                case 'b2b2c':
                    return '7-1'
                break;
                case 'b2b2c-products':
                    return '7-2'
                break;
                case 'b2b2c-orders':
                    return '7-3'
                break;


                //// 設定・管理 ///////////////////////////////////
                case 'admin':
                    return '8-1'
                break;
                case 'admin-config':
                    return '8-2'
                break;

                default:
                    return '1'

            }


        },
        isLogin(){

            // 非ログインはログインページに
            if( !this.$store.state.loggedIn ){

                this.$router.push('/')

            }

            return this.$store.state.loggedIn

        }

    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),

        actLogout() {

        },

        handleSelect(key, keyPath) {

            switch (key) {

                //// ログアウト処理 ///////////////////////////////////////
                case '9':
                    liff.init({ liffId: process.env.HIYOSHI_DASHBOARD })
                        .then( () => {
                            if(liff.isLoggedIn()) {
                                liff.logout()
                            }
                        })
                        .catch((err) => { console.log(err.code, err.message); })
                        .finally(function(){
                            this.$store.commit('setLogout')
                        }.bind(this))

                    this.$store.commit('setLogout')
                break;

                //// トップ ///////////////////////////////////////
                case '1':
                    this.$router.push('/main/')
                break;

                //// 日吉の野菜情報 ////////////////////////////////
                case '2-1':
                    this.$router.push('/info/')
                break;

                case '2-2':
                    this.$router.push('/info/message/')
                break;

                case '2-3':
                    this.$router.push('/info/lists/')
                break;

                case '2-4':
                    this.$router.push('/info/products/')
                break;

                case '2-5':
                    this.$router.push('/info/order/')
                break;

                //// B2B ///////////////////////////////////////
                case '3-1':
                    this.$router.push('/b2b/')
                break;

                case '3-2':
                    this.$router.push('/b2b/order/')
                break;

                case '3-3':
                    this.$router.push('/b2b/lists/')
                break;

                case '3-4':
                    this.$router.push('/b2b/products/')
                break;

                //// B2C ///////////////////////////////////////
                case '4-1':
                    this.$router.push('/b2c/')
                break;

                case '4-2':
                    this.$router.push('/b2c/products/')
                break;

                case '4-3':
                    this.$router.push('/b2c/order/')
                break;

                case '4-4':
                    this.$router.push('/b2c/users/')
                break;

                case '4-5':
                    this.$router.push('/b2c/message/')
                break;

                case '4-6':
                    this.$router.push('/b2c/lists/')
                break;

                //// MEDIA ///////////////////////////////////////
                case '5-1':
                    this.$router.push('/media/')
                break;

                //// VEGEMEDIA ///////////////////////////////////////
                case '6-1':
                    this.$router.push('/vegemedia/')
                break;

                //// B2B2C ///////////////////////////////////////
                case '7-1':
                    this.$router.push('/b2b2c/')
                break;
                case '7-2':
                    this.$router.push('/b2b2c/products/')
                break;
                case '7-3':
                    this.$router.push('/b2b2c/orders/')
                break;



                //// 設定・管理 ///////////////////////////////////
                case '8-1':
                    this.$router.push('/admin/')
                break;

                case '8-2':
                    this.$router.push('/admin/config/')
                break;

                default:
                    return

            }

        },

    },

};
</script>
<style>
[sticky-menu]{position:sticky;top:0;z-index:1;}
[menu-content-right]{position:absolute;right:0;}
.el-menu.el-menu--popup.el-menu--popup-bottom-start{margin-top:0px !important;}
</style>
