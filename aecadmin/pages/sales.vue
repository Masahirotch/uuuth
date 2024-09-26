<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">受注実績</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu v-model="picker">
          <template v-slot:activator="{on}">
            <v-text-field v-model="orderMonth" label="受注年月" prepend-inner-icon="mdi-calendar" readonly hide-details clearable v-on="on">
            </v-text-field>
          </template>
          <v-date-picker v-model="orderMonth" type="month" locale="ja-jp" :max="maxDate" no-title></v-date-picker>
        </v-menu>
        <v-divider class="mx-2" inset vertical></v-divider>
        <v-select v-model="app" label="販売店（アプリ名）" :items="apps" item-text="app_name" item-value="shopId" return-object hide-details :readonly="fixedApp" :clearable="!fixedApp"></v-select>
        <v-btn text @click="getOrders"><v-icon>mdi-download-box-outline</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details clearable></v-text-field>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <!-- 受注実績 -->
      <v-data-table :headers="headers" :items="orders" item-key="orderId" :loading="loading" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" :search="search" show-group-by :group-by="groupBy"
       :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <template v-slot:[`group.header`]="{group, items, headers, toggle, isOpen, remove}">
          <!-- 小計 -->
          <td>
            <v-btn @click="toggle" x-small icon :ref="group">
              <v-icon v-if="isOpen">mdi-minus</v-icon>
              <v-icon v-else>mdi-plus</v-icon>
            </v-btn>
            {{ group }}
          </td>
          <td>
            小計：{{ getTotal(items) }}
          </td>
          <td :colspan="headers.length-3"></td>
          <td align='end'>
            <v-btn @click='remove' x-small icon :ref='group'>
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </td>
        </template>
        <template v-slot:top>
          <!-- アラートダイアログ -->
          <v-dialog v-model="alertDialog" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">{{alertMessage}}</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="closeAlert">はい</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios';
import config from "../constants/config.js";

export default {
  name: 'SalesPage',

  data: () => ({
    //ログイン中
    loggedin: false,
    //受注情報一覧
    orders: [],
    //ダウンロード中
    loading: false,
    //抽出月
    orderMonth: null,
    maxDate: null,
    picker: false,
    //抽出店舗
    apps: [], //[shopId: 店舗ID, app_id: アプリID, app_name: アプリ名}]
    app: '',
    fixedApp: false,
    //一覧テーブルヘッダ
    headers: [
      {text: '受注ID', value: 'orderId', groupable: false},
      {text: '受注日', value: 'orderDate'},
      {text: '店舗', value: 'orderShop'},
      {text: 'ユーザ名', value: 'orderUser'},
      {text: '受注額', value: 'payment', groupable: false},
      {text: '販売店', value: 'appName'},
      {text: '販売店担当者', value: 'shopUser'},
      {text: '発送方式', value: 'deliveryMethod'},
    ],
    //検索値
    search: '',
    //グルーピングする項目
    groupBy: '',
    //アラートダイアログ
    alertDialog: false,
    alertMessage: '',
  }),

  async created() {
    //プルダウン項目の取得
    await this.getApps();
    //店舗ユーザ
    if(this.$route.query.shop) {
      let shopId = parseInt(this.$route.query.shop);
      let app = this.apps.find(v => v.shopId === shopId);
      let app_id = app ? app.app_id : -1;
      let app_name = app ? app.app_name : '';
      this.app = {shopId: shopId, app_id: app_id, app_name: app_name};
      this.fixedApp = true;
    }
    //受注情報一覧の取得
    this.getOrders();
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
    this.orderMonth = this.$dayjs().format('YYYY-MM');
    this.maxDate = this.$dayjs().format('YYYY-MM-DD');
  },

  methods: {
    //アプリ一覧の取得
    async getApps() {
      await axios.get(`${process.env.API}/aec/sales/apps`)
        .then(response => {
          this.apps = [...response.data.apps];
        })
        .catch(error => {
          console.log(error);
          this.apps = [];
          return;
        });
    },
    //受注情報一覧の取得
    getOrders() {
      //画面で指定した抽出条件を準備
      let orderMonth = !!this.orderMonth ? this.orderMonth : this.$dayjs().format('YYYY-MM');
      let orderApp = this.app ? this.app.app_id : '';
      let param = `?date=${orderMonth}&app=${orderApp}`
      //受注情報一覧の取得
      this.loading = true;
      axios.get(`${process.env.API}/aec/sales/orders${param}`)
        .then(response => {
          this.orders = [];
          response.data.orders.forEach((record) =>  {
            if(record.salesChannel&0b0001) {
              record.appName = '通常';
            } else if(record.salesChannel&0b0010) {
              record.appName = 'スポット';
            } else if(record.salesChannel&0b0100) {
              record.appName = '直販';
              record.orderShop = '';
            } else {
              record.orderShop = '';
            }
            this.orders.push(record);
          });
          this.loading = false;
          if(this.app) {
            this.groupBy = 'shopUser';
          } else {
            this.groupBy = 'appName';
          }
        })
        .catch(error => {
          console.log(error);
          this.orders = [];
          this.loading = false;
          return;
        });
    },
    //小計の計算
    getTotal(items) {
      let total = 0;
      total = items.reduce((prev, current) => {return prev + current.payment}, 0);
      return total;
    },
    //アラートダイアログを閉じる
    closeAlert() {
      this.alertDialog = false;
    },
  },
}
</script>
