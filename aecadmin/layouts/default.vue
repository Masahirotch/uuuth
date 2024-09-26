<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <!-- ログイン/ログアウト -->
        <v-list-item to="/" exact>
          <v-list-item-icon><v-icon>mdi-apps</v-icon></v-list-item-icon>
          <v-list-item-title disabled="false">ホーム</v-list-item-title>
        </v-list-item>
        <!-- 受注管理 -->
        <v-list-group v-if="loggedin&&(adminUser||SalesPage)" no-action>
          <template v-slot:activator>
            <v-list-item-icon @click.stop="miniVariant = false"><v-icon>mdi-cart-outline</v-icon></v-list-item-icon>
            <v-list-item-title>受注管理</v-list-item-title>
          </template>
          <v-list-item v-if="adminUser" :disabled="!loggedin" to="/orders" exact dense>
            <v-list-item-title><v-icon small>mdi-cart-outline</v-icon>受注管理</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="adminUser&&purchasesPage" :disabled="!loggedin" to="/purchase" exact dense>
            <v-list-item-title><v-icon small>mdi-cart-arrow-down</v-icon>受注入力</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="SalesPage" :disabled="!loggedin" :to="'/sales'+shopId" exact dense>
            <v-list-item-title><v-icon small>mdi-store-outline</v-icon>受注実績</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <!-- 商品管理 -->
        <v-list-group v-if="loggedin&&(adminUser||limitedsPage)" no-action>
          <template v-slot:activator>
            <v-list-item-icon @click.stop="miniVariant = false"><v-icon>mdi-cube-outline</v-icon></v-list-item-icon>
            <v-list-item-title>商品管理</v-list-item-title>
          </template>
          <v-list-item v-if="adminUser" :disabled="!loggedin" to="/products" exact dense>
            <v-list-item-title><v-icon small>mdi-cube-outline</v-icon>商品管理</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="limitedsPage" :disabled="!loggedin" :to="'/limiteds'+shopId" exact dense>
            <v-list-item-title><v-icon small>mdi-store-outline</v-icon>限定商品管理</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <!-- LINE配信管理 -->
        <v-list-group v-if="loggedin&&adminUser" :disabled="!loggedin" no-action>
          <template v-slot:activator>
            <v-list-item-icon @click.stop="miniVariant = false"><v-icon>mdi-email-edit-outline</v-icon></v-list-item-icon>
            <v-list-item-title>LINE配信管理</v-list-item-title>
          </template>
          <v-list-item :disabled="!loggedin" to="/linemsg" exact dense>
            <v-list-item-title><v-icon small>mdi-email-edit-outline</v-icon>LINE配信</v-list-item-title>
          </v-list-item>
          <v-list-item :disabled="!loggedin" to="/tags" exact dense>
            <v-list-item-title><v-icon small>mdi-tag-multiple-outline</v-icon>タグ情報</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="couponsPage" :disabled="!loggedin" to="/coupons" exact dense>
            <v-list-item-title><v-icon small>mdi-ticket-percent-outline</v-icon>クーポン情報</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <!-- 取引先ユーザー管理 -->
        <v-list-item v-if="loggedin" :disabled="!loggedin" :to="'/users'+shopId" exact>
          <v-list-item-icon><v-icon>mdi-account-outline</v-icon></v-list-item-icon>
          <v-list-item-title>取引先ユーザー管理</v-list-item-title>
        </v-list-item>
        <!-- システム管理 -->
        <v-list-group v-if="loggedin&&adminUser" :disabled="!loggedin" no-action>
          <template v-slot:activator>
            <v-list-item-icon @click.stop="miniVariant = false"><v-icon>mdi-cog-outline</v-icon></v-list-item-icon>
            <v-list-item-title>システム管理</v-list-item-title>
          </template>
          <v-list-item :disabled="!loggedin" to="/postages" exact dense>
            <v-list-item-title><v-icon small>mdi-postage-stamp</v-icon>配送料</v-list-item-title>
          </v-list-item>
          <v-list-item :disabled="!loggedin" to="/dayoffs" exact dense>
            <v-list-item-title><v-icon small>mdi-lock-clock</v-icon>締め時間・休業日設定</v-list-item-title>
          </v-list-item>
          <v-list-item :disabled="!loggedin" to="/admins" exact dense>
            <v-list-item-title><v-icon small>mdi-account-outline</v-icon>管理者</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="configsPage" :disabled="!loggedin" to="/configs" exact dense>
            <v-list-item-title><v-icon small>mdi-cog-outline</v-icon>環境設定</v-list-item-title>
          </v-list-item>
          <v-list-item :disabled="!loggedin" to="/accounts" exact dense>
            <v-list-item-title><v-icon small>mdi-account-cog-outline</v-icon>開発者向け</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-bind="attrs" v-on="on" />
        </template>
        <span>サイドメニューの開閉</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            @click.stop="miniVariant = !miniVariant"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
          </v-btn>
        </template>
        <span>サイドメニューのテキスト{{ miniVariant ? '表示' : '非表示' }}</span>
      </v-tooltip>
      <!--
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      -->
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer />
      {{loginUser}}
      <!--<v-btn
        icon
        @click.stop="rightDrawer = !!rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>-->
    </v-app-bar>
    <v-main>
      <v-container class="ma-0 pa-0" fluid>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import config from "../constants/config.js"

export default {
  name: 'DefaultLayout',
  created() {
    this.setListener()
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'ADOP LINE EC system',
      loggedin: false,
      //表示制御
      loginUser: '',
      adminUser: false,
      shopId: '',
      purchasesPage: config.purchaseAdmin,
      SalesPage: config.sales,
      limitedsPage: config.limited,
      couponsPage: config.coupon,
      configsPage: config.configsPage,
    }
  },
  methods: {
    //ログインモジュールからログイン通知を受け取る
    setListener() {
      this.$nuxt.$on('updateMenu', this.setMenu)
    },
    //ログインユーザーの属性で表示制御用のパラメータを設定する
    setMenu(param) {
      this.loggedin = param.loggedin;
      this.loginUser = param.loginInfo.name + (param.loggedin ? ('(' + (param.loginInfo.adminUser ? '管理者' : '店舗ユーザー') + ')') : '');
      this.adminUser = param.loginInfo.adminUser;
      this.shopId = param.loginInfo.shopId ? '?shop=' + param.loginInfo.shopId : '';
      this.configsPage = (param.loginInfo?.role == 9 && config.configsPage);
    },
  }
}
</script>

<style>
  @import url('~/assets/styles/main.css');
</style>
