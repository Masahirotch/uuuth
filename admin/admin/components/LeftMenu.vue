<template>
  <div left-menu>

    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose">

      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span>B2B受発注管理</span>
        </template>
        <el-menu-item-group title="false">
          <el-menu-item index="1-1">B2B受発注管理</el-menu-item>
          <el-menu-item index="1-2">ユーザー管理</el-menu-item>
        </el-menu-item-group>
      </el-submenu>

      <el-submenu index="2">
        <template slot="title">
          <i class="el-icon-chat-line-square"></i>
          <span>日吉野菜情報</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="2-1" @click="goPage('/info/')">野菜情報ユーザー管理</el-menu-item>
          <el-menu-item index="2-2" @click="goPage('/info/message/')">メッセージ作成</el-menu-item>
          <el-menu-item index="2-3" @click="goPage('/info/lists/')">メッセージ一覧</el-menu-item>
          <el-menu-item index="2-3" @click="goPage('/info/products/')">日吉の野菜情報商品一覧</el-menu-item>
          <el-menu-item index="2-3" @click="goPage('/info/order/')">日吉の野菜情報発注管理</el-menu-item>
        </el-menu-item-group>
      </el-submenu>


      <el-submenu index="3">
        <template slot="title">
          <i class="el-icon-shopping-cart-2"></i>
          <span>応援隊注文管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="3-1">応援隊注文管理</el-menu-item>
          <el-menu-item index="3-2" @click="goPage('/ouentai/products/')">応援隊商品登録</el-menu-item>
        </el-menu-item-group>
      </el-submenu>


      <el-submenu index="4">
        <template slot="title">
          <i class="el-icon-setting"></i>
          <span>各種設定</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="4-1">管理ユーザー一覧</el-menu-item>
          <el-menu-item index="4-2" @click="goPage('logout')">ログアウト</el-menu-item>
        </el-menu-item-group>
      </el-submenu>

    </el-menu>

  </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'

export default {
    name: 'LeftMenu',
  data() {
    return {
      isCollapse:true
    }
  },
  watch : {

  },
  mounted(){

  },

  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'info' , ['allParent']),
  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'info' , ['setAllParent']),

      goPage : async function(value){

        switch (value) {

          case 'logout':
            await this.setLogin(false)
            await this.$router.push('/')
            break;

          default:
            this.$router.push(value)
            return

        }

      },

      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }

  },

};
</script>
<style>
[left-menu],[left-menu] ul{height: 100%;}
.el-menu-item-group .el-menu-item-group__title{display: none}
</style>
