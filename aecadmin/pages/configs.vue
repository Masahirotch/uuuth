<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">環境設定</v-toolbar-title>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-card-text class="elevation-1">
        <v-row dense class="text-h6">販売経路</v-row>
        <v-row dense>
          <v-col cols="12" md="3">
            <small>BtoB通常アイコン</small><br>{{config.BtoB}}<v-icon>{{config.BtoB}}</v-icon>
          </v-col>
          <v-col cols="12" md="3">
            <small>BtoBスポットアイコン</small><br>{{config.BtoBspot}}<v-icon>{{config.BtoBspot}}</v-icon>
          </v-col>
          <v-col cols="12" md="3">
            <small>BtoCアイコン</small><br>{{config.BtoC}}<v-icon>{{config.BtoC}}</v-icon>
          </v-col>
          <v-col cols="12" md="3">
            <small>BtoBtoCアイコン</small><br>{{config.BtoBtoC}}<v-icon>{{config.BtoBtoC}}</v-icon>
          </v-col>
        </v-row>
        <v-row dense class="text-h6">表示画面</v-row>
        <v-row dense>
          <v-col cols="12" md="3">
            <small>受注入力画面</small><br>{{config.purchaseAdmin}}
          </v-col>
          <v-col cols="12" md="3">
            <small>クーポン画面</small><br>{{config.coupon}}
          </v-col>
          <v-col cols="12" md="3">
            <small>店舗別実績画面</small><br>{{config.sales}}
          </v-col>
          <v-col cols="12" md="3">
            <small>環境設定画面</small><br>{{config.configsPage}}
          </v-col>
        </v-row>
        <v-row dense class="text-h6">商品</v-row>
        <v-row dense>
          <v-col cols="12" md="3">
            <small>商品グループ</small><br>{{config.productGroup}}
          </v-col>
          <v-col cols="12" md="3">
            <small>商品付加情報１</small><br>{{config.optInfo.optInfo1 ? config.optInfo.optInfo1 : false}}
          </v-col>
          <v-col cols="12" md="3">
            <small>商品付加情報２</small><br>{{config.optInfo.optInfo2 ? config.optInfo.optInfo2 : false}}
          </v-col>
          <v-col cols="12" md="3">
            <small>商品付加情報３</small><br>{{config.optInfo.optInfo3 ? config.optInfo.optInfo3 : false}}
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="12" md="3">
            <small>店舗限定商品</small><br>{{config.limited}}
          </v-col>
          <v-col cols="12" md="3">
            <small>税込税別表示</small><br>{{config.tax}}
          </v-col>
          <v-col cols="12" md="3">
            <small>税率(1番目の要素が既定値)</small><br>{{config.taxRates}}
          </v-col>
          <v-col cols="12" md="3">
            <small>商品価格帯フィルター</small><br>{{config.priceRange.value.map(v => v[1]).join(', ')}}
          </v-col>
        </v-row>
        <v-row dense class="text-h6">利用者</v-row>
        <v-row dense>
          <v-col cols="12" md="3">
            <small>店舗グループ</small><br>{{config.shopGroup}}
          </v-col>
          <v-col cols="12" md="3">
            <small>店舗受取</small><br>{{config.shopPickup}}
          </v-col>
          <v-col cols="12" md="3">
            <small>締め時間の既定値</small><br>{{config.closingTime}}
          </v-col>
          <v-col cols="12" md="3">
            <small>店舗担当者の商品購入</small><br>{{config.purchaseChild}}
          </v-col>
        </v-row>
        <v-row dense class="text-h6">受注情報・LINE配信</v-row>
        <v-row dense>
          <v-col cols="12" md="3">
            <small>直近表示日数</small><br>{{config.newest}}
          </v-col>
          <v-col cols="12" md="3">
            <small>その他費用表示</small><br>{{config.orderFee}}
          </v-col>
          <v-col cols="12" md="3">
            <small>卸販売時の出荷通知</small><br>{{config.messageShiped}}
          </v-col>
          <v-col cols="12" md="3">
            <small>一斉配信時刻の既定値</small><br>{{config.messageTime}}
          </v-col>
        </v-row>
        <v-row dense class="text-h6">管理情報</v-row>
        <v-row dense>
          <v-col cols="12" md="6">
            <small>配送料タブの表示値</small><br>{{config.postageTab1}}、{{config.postageTab2}}、{{config.postageTab3}}
          </v-col>
          <v-col cols="12" md="3">
            <small>アプリのテーマ</small><br>{{config.theme1}}、{{config.theme2}}
          </v-col>
          <v-col cols="12" md="3">
            <small>注文受付の当日分締め時間</small><br>{{config.minClosing}}～{{config.maxClosing}}
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text class="elevation-1">
        <v-row dense class="text-h6">API アクセス</v-row>
        <v-row dense>
          <v-col cols="12" md="6">
            <small>API URL</small><br>{{env.API}}
          </v-col>
          <v-col cols="12" md="3">
            <small>TOKEN</small><br>{{env.INFO_TOKEN}}
          </v-col>
        </v-row>
        <v-row dense class="text-h6">LINEログイン</v-row>
        <v-row dense>
          <v-col cols="12" md="6">
            <small>アプリURL</small><br>{{env.APP_URL}}
          </v-col>
          <v-col cols="12" md="2">
            <small>CHANNEL ID</small><br>{{env.CHANNEL_ID}}
          </v-col>
          <v-col cols="12" md="4">
            <small>CHANNEL SECRET</small><br>{{env.CHANNEL_SECRET}}
          </v-col>
        </v-row>
        <v-row dense class="text-h6">アバター</v-row>
        <v-row dense>
          <v-col cols="12" md="6">
            <small>アバター画像</small><br>{{env.ADMIN_CHAT_AVATAR}}
          </v-col>
        </v-row>
        <v-row dense class="text-h6">ID連携</v-row>
        <v-row dense>
          <v-col cols="12" md="3">
            <small>管理者</small><br>{{env.AEC_ADMON}}
          </v-col>
          <v-col cols="12" md="3">
            <small>BtoB通常</small><br>{{env.BTOB}}
          </v-col>
          <v-col cols="12" md="3">
            <small>BtoBスポット</small><br>{{env.SPOT}}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<script>
import config from "../constants/config.js";

export default {
  name: 'ConfigsPage',

  data: () => ({
    //ログイン中
    loggedin: false,
    //システム設定値
    config: config,
    //環境変数
    env: {
      //api url
      API: process.env.API,
      //token
      INFO_TOKEN: process.env.INFO_TOKEN,
      //LINE login
      APP_URL: process.env.APP_URL,
      CHANNEL_ID: process.env.CHANNEL_ID,
      CHANNEL_SECRET: process.env.CHANNEL_SECRET,
      //アバター画像
      ADMIN_CHAT_AVATAR: process.env.ADMIN_CHAT_AVATAR,
      //
      AEC_ADMON: process.env.AEC_ADMON,
      BTOB: process.env.BTOB,
      SPOT: process.env.SPOT,
    },
  }),

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
  },
}
</script>
