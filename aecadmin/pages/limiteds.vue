<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">店舗限定商品・価格設定</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-select v-model="app" label="販売店（アプリ名）" :items="apps" item-text="app_name" item-value="shopId" return-object hide-details :readonly="fixedApp" :clearable="!fixedApp"></v-select>
        <v-btn text @click="getShopProducts"><v-icon>mdi-download-box-outline</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details clearable dense></v-text-field>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="filteredProducts" :loading="loading" :search="search" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
            <tr>
              <td><v-select v-model="filters.productCode" :items="columnValueList('productCode')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.productName" :items="columnValueList('productName')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.app_name" :items="columnValueList('app_name')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.limitedShop" :items="columnValueList('limitedShop', true)" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.standardPrice" :items="columnValueList('standardPrice')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.limitedPrice" :items="columnValueList('limitedPrice', true)" hide-details dense multiple clearable></v-select></td>
            </tr>
          </tbody>
        </template>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate">
            <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil-outline</v-icon>
            <v-icon small class="mr-2" @click="deleteItem(item)">mdi-delete-outline</v-icon>
          </div>
        </template>
        <!-- ダイアログ -->
        <template v-slot:top>
          <!-- 登録更新ダイアログ -->
          <v-dialog v-model="dialogEdit" persistent max-width="1366px">
            <v-card>
              <v-form ref="form">
                <v-card-title>
                  <v-app-bar>
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                  </v-app-bar>
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <small>商品コード</small><br>{{editedItem.productCode}}
                    </v-col>
                    <v-col cols="12" md="4">
                      <small>商品名</small><br>{{editedItem.productName}}
                    </v-col>
                    <v-col cols="12" md="4">
                      <small>店舗名</small><br>{{editedItem.app_name}}
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-switch v-model="editedItem.limitedShop" label="店舗限定" :disabled="disableLimitedShop"></v-switch>
                    </v-col>
                    <v-col cols="12" md="4">
                      <small>標準価格</small><br>{{editedItem.standardPrice}}
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model.number="editedItem.limitedPrice" label="特別価格" :disabled="disableLimitedPrice" type="number" hide-spin-buttons clearable></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="12">
                      <p class="red--text">{{message}}</p>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="save">保存</v-btn>
                  <v-btn color="primary" @click="close">キャンセル</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
          <!-- 削除ダイアログ -->
          <v-dialog v-model="dialogDelete" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">
                「{{editedItem.productName}}」の限定情報を削除してよろしいですか？
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="deleteItemConfirm">削除</v-btn>
                <v-btn color="primary" @click="closeDelete">キャンセル</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- 処理結果ダイアログ -->
          <v-dialog v-model="alert" persistent max-width="500px">
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
  name: 'LimitedPage',

  data: () => ({
    //ログイン中
    loggedin: false,
    //限定商品一覧
    products: [],
    //ダウンロード中
    loading: false,
    //抽出条件
    apps: [], //[{shopId: 店舗ID, app_name: アプリ名}]
    app: '',
    fixedApp: false,
    //一覧テーブルヘッダ
    headers: [
      {text: '商品コード', value: 'productCode'},
      {text: '商品名', value: 'productName'},
      {text: '店舗名', value: 'app_name'},
      {text: '店舗限定', value: 'limitedShop.text'},
      {text: '標準価格', value: 'standardPrice'},
      {text: '特別価格', value: 'limitedPrice.text'},
      {text: '操作', value: 'action', width: 75, align: 'end', sortable: false, filterable: false},
    ],
    //フィルター
    filters: {
      productCode: [],
      productName: [],
      app_name: [],
      limitedShop: [],
      standardPrice: [],
      limitedPrice: [],
    },
    //検索値
    search: '',
    //限定店舗・価格の設定可否
    disableLimitedShop: false,
    disableLimitedPrice: false,
    //編集データ
    editedItem: {},
    editedIndex: -1,
    //登録更新削除ダイアログ
    dialogEdit: false,
    dialogDelete: false,
    message: '',
    //アラートダイアログ
    alert: false,
    alertMessage: '',
  }),

  computed: {
    //フィルタリングされた商品一覧
    filteredProducts() {
      return this.products.filter(tbl => {
        return Object.keys(this.filters).every(col => {
          //this.filters[col]: フィルターで指定された値(配列), tbl[col]: データ行の値
          if(col == 'limitedPrice') { //特別価格
            if(this.filters[col].length < 1) return true; //指定なし
            if(this.filters[col].includes(tbl[col].text)) return true; //フィルタ値と一致
            if(tbl[col].text === null) return false; //nullはNG
            return this.filters[col].includes('設定済') && !isNaN(tbl[col].text);
          } else if(Object.prototype.toString.call(tbl[col]) === "[object Object]") { //オブジェクト項目
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col].text);
          } else {
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col]);
          }
        });
      });
    },
    //登録ダイアログのタイトル
    dialogTitle() {
      return this.editedIndex === -1 ? '限定情報追加' : '限定情報更新';
    },
  },

  created() {
    //店舗ユーザ
    if(this.$route.query.shop) {
      this.app = {shopId: parseInt(this.$route.query.shop), app_name: ''};
      this.fixedApp = true;
    }
    //プルダウン項目の取得
    this.getApps();
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
  },

  methods: {
    //アプリ一覧の取得
    getApps() {
      axios.get(`${process.env.API}/aec/limiteds/apps`, {
        params: {
          token: process.env.INFO_TOKEN
        }
      })
        .then(response => {
          this.apps = [...response.data.apps];
        })
        .catch(error => {
          console.log(error);
          this.apps = [];
          return;
      });
    },
    //店舗別商品情報の取得
    getShopProducts() {
      //店舗名入力の確認
      if(!this.app) {
        this.alertMessage = '店舗名を指定してください';
        this.alert = true;
        return;
      }
      this.loading = true;
      axios.get(`${process.env.API}/aec/limiteds/products`, {
        params: {
          token: process.env.INFO_TOKEN,
          shop: this.app.shopId,
        }
      }).then(response => {
        this.products = [...response.data.products];
        this.loading = false;
        //取得データを表示用に変換
        this.products.forEach(record =>  {
          //店舗限定: '全店'(isLimitedShop==0), '販売'(limitedShop is not null), '取り扱いなし'(limitedShop is null)
          record.limitedShop = {value: !!record.limitedShop, text: !record.isLimitedShop ? '全店' : (!!record.limitedShop ? '販売' : '取り扱いなし')};
          //特別価格: '設定不可'(isLimitedPrice==0), '未設定'(limitedPrice is null),  'limitedPrice'(limitedPrice is not null)
          record.limitedPrice = {value: record.limitedPrice, text: !record.isLimitedPrice ? '設定不可' : (!record.limitedPrice ? '未設定' : record.limitedPrice)};
        });
      }).catch(error => {
        console.log(error);
        this.products = [];
        this.loading = false;
        return;
      });
    },
    //フィルター用選択項目の値一覧の作成
    columnValueList(col, obj=false) { //項目が {value: 項目値, text: 表示テキスト} 形式の場合、objにtrueを指定する
      if(col == 'limitedPrice') {
        return ['設定済', '未設定', '設定不可'];
      } else if(obj) {
        return this.products.map(tbl => tbl[col].text).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        return this.products.map(tbl => tbl[col]).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    //更新
    editItem(item) {
      this.editedIndex = this.products.indexOf(item);
      axios.get(`${process.env.API}/aec/limiteds/product`, {
        params: {
          token: process.env.INFO_TOKEN,
          shop: item.shopId,
          product: item.productId,
        }
      }).then(response => {
        this.editedItem = {...response.data.product};
        this.$nextTick(() => {this.$refs.form.resetValidation();});
        this.message = '';
        this.disableLimitedShop = !this.editedItem.isLimitedShop;
        this.disableLimitedPrice = !this.editedItem.isLimitedPrice;
        this.dialogEdit = true;
      }).catch(error => {
        console.log(error);
        this.editedItem = [];
        return;
      });
    },
    save() {
      //入力を確認する
      this.message = '';
      if(!this.$refs.form.validate()) {
        this.message = '入力項目に誤りがあります';
        return;
      }
      //更新データ準備
      var record = {
        productId: this.editedItem.productId,
        shopId: this.editedItem.shopId,
        limitedShop: this.editedItem.limitedShop,
        limitedPrice: this.editedItem.limitedPrice === '' ? null : this.editedItem.limitedPrice,
      };
      //データベース更新
      axios.post(`${process.env.API}/aec/limiteds/updatelimited`, {data: record, token: process.env.INFO_TOKEN})
        .then(response => {
          //更新データを表示用に変換して登録
          Object.assign(this.products[this.editedIndex], this.editedItem);
          this.products[this.editedIndex].limitedShop = {value: !!this.editedItem.limitedShop, text: !this.editedItem.isLimitedShop ? '全店' : (!!this.editedItem.limitedShop ? '限定店舗' : '取り扱いなし')};
          this.products[this.editedIndex].limitedPrice = {value: this.editedItem.limitedPrice, text: !this.editedItem.isLimitedPrice ? '設定不可' : (!this.editedItem.limitedPrice ? '未設定' : this.editedItem.limitedPrice)};
          //完了ダイアログ表示
          this.alertMessage = '保存しました';
          this.alert = true;
          this.close();
        })
        .catch(error => {
          console.log(error);
        });
    },
    close() {
      this.dialogEdit = false;
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.editedIndex = -1;
    },
    //削除
    deleteItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      //削除データ準備
      var record = {
        productId: this.editedItem.productId,
        shopId: this.editedItem.shopId,
      };
      //店舗別商品情報の削除
      axios.post(`${process.env.API}/aec/limiteds/deletelimited`, {data: record, token: process.env.INFO_TOKEN})
        .then(response => {
          this.products.splice(this.editedIndex, 1);
          this.alertMessage = '削除しました';
          this.alert = true;
          this.closeDelete();
        })
        .catch(error => {console.log(error);}
      );
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.editedIndex = -1;
    },
    //アラートダイアログを閉じる
    closeAlert() {
      this.alert = false;
    },
  },
}
</script>
