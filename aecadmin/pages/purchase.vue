<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">受注入力</v-toolbar-title>
        <v-btn text @click="getOrders"><v-icon>mdi-download-box-outline</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-select v-if="isNew === 0" v-model="shop" label="店舗" :items="shopsValueList" item-text="shopName" item-value="shopId" return-object clearable hide-details @change="selectShop"></v-select>
        <v-text-field v-if="isNew !== 0 && shop" v-model="shop.shopName" label="店舗" disabled hide-details></v-text-field>
        <v-select v-if="isNew === 0" v-model="user" label="発注者" :items="usersValueList" item-text="ordererName" item-value="userId" return-object clearable hide-details @change="selectUser"></v-select>
        <v-text-field v-if="isNew !== 0 && user" v-model="user.ordererName" label="発注者" disabled hide-details></v-text-field>
        <v-btn-toggle v-if="user" v-model="salesChannel" mandatory borderless @change="selectChannel">
          <v-btn v-if="BtoB && user && (user?.salesChannel&0b0001)" value="1" :disabled="isNew !== 0" icon small><v-icon>{{BtoB}}</v-icon></v-btn>
          <v-btn v-if="BtoBspot && user && (user?.salesChannel&0b0010)" value="2" :disabled="isNew !== 0" icon small><v-icon>{{BtoBspot}}</v-icon></v-btn>
        </v-btn-toggle>
        <v-btn text v-if="user" @click="showCart"><v-icon>mdi-cart-outline</v-icon></v-btn>
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="isNew" borderless @change="newItem">
          <v-btn :disabled="!ordersTable" text><v-icon>mdi-database-plus-outline</v-icon></v-btn>
        </v-btn-toggle>
        <v-btn v-if="productsTable" text icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <!-- 受注一覧 -->
      <v-data-table v-if="ordersTable" :headers="orderHeaders" :items="filteredOrders" :loading="loading" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" ref="table" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
          <tr>
            <td><v-select v-model="ordersFilters.orderId" :items="ordersColumnValueList('orderId')" hide-details dense multiple clearable></v-select></td>
            <td><v-select v-model="ordersFilters.status" :items="selects.status" item-text="text" item-value="value" return-object hide-details dense multiple clearable></v-select></td>
            <td><v-select v-model="ordersFilters.orderDate" :items="ordersColumnValueList('orderDate')" hide-details dense multiple clearable></v-select></td>
            <td>
              <v-btn-toggle v-model="ordersFilters.salesChannel" :items="ordersColumnValueList('salesChannel')" borderless dense multiple>
                <v-btn v-if="BtoB" small icon><v-icon>{{BtoB}}</v-icon></v-btn>
                <v-btn v-if="BtoBspot" small icon><v-icon>{{BtoBspot}}</v-icon></v-btn>
              </v-btn-toggle>
            </td>
            <td><v-select v-model="ordersFilters.shopName" :items="ordersColumnValueList('shopName')" hide-details dense multiple clearable></v-select></td>
            <td><v-select v-model="ordersFilters.ordererName" :items="ordersColumnValueList('ordererName')" hide-details dense multiple clearable></v-select></td>
            <td><v-select v-model="ordersFilters.payment" :items="ordersColumnValueList('payment')" hide-details dense multiple clearable></v-select></td>
            <td><v-select v-model="ordersFilters.preferred" :items="ordersColumnValueList('preferred')" hide-details dense multiple clearable></v-select></td>
            <td></td>
          </tr>
          </tbody>
        </template>
        <!-- 受注経路 -->
        <template v-slot:[`item.salesChannel`]="{item}">
          <div class="text-truncate">
            <v-icon v-for="c in item.salesChannel" :key="c">{{channelIcon[c]}}</v-icon>
          </div>
        </template>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate">
            <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil-outline</v-icon>
          </div>
        </template>
      </v-data-table>
      <!-- 商品一覧 -->
      <v-data-table v-if="productsTable" :headers="productHeaders" :items="filteredProducts" :loading="loading" class="elevation-1" :search="search" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
            <tr>
              <td><v-select v-model="productsFilters.productId" :items="productsColumnValueList('productId')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="productsFilters.productCode" :items="productsColumnValueList('productCode')" hide-details dense multiple clearable></v-select></td>
              <td><v-combobox v-model="productsFilters.productName" :items="productsColumnValueList('productName')" hide-details dense multiple clearable></v-combobox></td>
              <td><v-combobox v-model="productsFilters.productDescription" :items="productsColumnValueList('productDescription')" hide-details dense multiple clearable></v-combobox></td>
              <td></td>
              <td><v-select v-model="productsFilters.productPrice" :items="priceRange.text" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="productsFilters.stock" :items="productsColumnValueList('stock')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="productsFilters.start" :items="productsColumnValueList('start')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="productsFilters.end" :items="productsColumnValueList('end')" hide-details dense multiple clearable></v-select></td>
              <td></td>
            </tr>
          </tbody>
        </template>
        <!-- 商品説明 -->
        <template #item.productDescription="{value}">
          <div class="text-truncate" style="max-width: 200px">{{value}}</div>
        </template>
        <!-- 商品画像 -->
        <template v-slot:[`item.productPhoto`]="{item}">
          <div class="">
            <v-avatar
              color="warning lighten-2"
              size="40">
              <v-img :src="item.productPhoto" alt="productPhoto"></v-img>
            </v-avatar>
          </div>
        </template>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate">
            <v-icon small class="mr-2" @click="addCart(item)">mdi-cart-arrow-down</v-icon>
          </div>
        </template>
        <!-- ダイアログ -->
        <template v-slot:top>
          <!-- カート -->
          <v-dialog v-model="dialogCart" persistent max-width="1366px">
            <v-card>
              <v-form ref="form">
                <v-card-title>
                  <v-toolbar>
                    <v-toolbar-title>カート</v-toolbar-title>
                  </v-toolbar>
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" md="1">
                      <small>受注ID</small><br>{{editedItem.orderId}}
                    </v-col>
                    <v-col cols="12" md="1">
                      <small>ステータス</small><br>{{editedItem.status}}
                    </v-col>
                    <v-col cols="12" md="2">
                      <small>受注日時</small><br>{{editedItem.orderDate}}
                    </v-col>
                    <v-col cols="12" md="1">
                      <small>受注経路</small><br><v-icon>{{channelIcon[editedItem.salesChannel]}}</v-icon>
                    </v-col>
                    <v-col cols="12" md="1">
                      <small>店舗コード</small><br>{{editedItem.shopCode}}
                    </v-col>
                    <v-col cols="12" md="3">
                      <small>店舗名</small><br>{{editedItem.shopName}}
                    </v-col>
                    <v-col cols="12" md="3">
                      <small>発注者</small><br>{{editedItem.ordererName}}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="12">
                      <v-data-table :headers="cartHeaders" :items="editedItem.cart" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{itemsPerPageOptions: [-1]}" hide-default-footer>
                        <!-- 数量変更 -->
                        <template v-slot:[`item.quantity`]="{item}">
                          <v-text-field v-model="item.quantity" type="number" reverse hide-details dense @change="paymentCalc(item)"></v-text-field>
                        </template>
                        <!-- 操作 -->
                        <template v-slot:[`item.action`]="{item}">
                          <div class="text-truncate">
                            <v-icon small class="mr-2" @click="deleteCart(item)">mdi-delete-outline</v-icon>
                          </div>
                        </template>
                      </v-data-table>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="2">
                      <small>商品代金{{tax}}</small><br>{{editedItem.cartPrice}}
                    </v-col>
                    <v-col v-if="coupon" cols="12" md="2">
                      <small>割引額</small><br>{{editedItem.discount}}
                    </v-col>
                    <v-col cols="12" md="2">
                      <small>送料{{tax}}</small><br>{{editedItem.shippingFee}}
                    </v-col>
                    <v-col v-if="orderFee" cols="12" md="2">
                      <small>{{orderFee}}</small><br>{{editedItem.orderFee}}
                    </v-col>
                    <v-col cols="12" md="2">
                      <small>支払額{{tax}}</small><br>{{editedItem.payment}}
                    </v-col>
                  </v-row>
                  <v-row v-if="salesChannel == '1'" dense>
                    <v-col cols="12" md="10">
                      <v-textarea v-model="editedItem.orderMemo" outlined auto-grow rows=4 counter clearable :rules="[size(500)]">
                         <template slot="label"><v-icon>{{BtoB}}</v-icon>注文メモ</template>
                      </v-textarea>
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-menu ref="preferred" :close-on-content-click="false">
                        <template v-slot:activator="{on}">
                          <v-text-field v-model="editedItem.preferredDate" v-on="on" prepend-icon="mdi-calendar" clearable dense>
                            <template slot="label"><v-icon>{{BtoB}}</v-icon>配達希望日</template>
                          </v-text-field>
                        </template>
                        <v-date-picker v-model="editedItem.preferredDate" @input="$refs.preferred.save()" locale="ja-jp" :day-format="(date) => new Date(date).getDate()" no-title @click.stop></v-date-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" :disabled="cartQuantity == 0" @click="save">注文</v-btn>
                  <v-btn color="primary" @click="closeCart">閉じる</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-form>
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
import AddressInput from "../components/AddressInput.vue"
import config from "../constants/config.js";

export default {
  name: 'PurchasesPage',

  data: () => ({
    //ログイン中
    loggedin: false,
    loginInfo: {},
    //受注情報一覧
    orders: [],
    ordersTable: true,
    //商品一覧
    products: [],
    productsB: [],
    productsS: [],
    productsTable: false,
    //店舗一覧
    shops: [],
    shop: null,
    user: null,
    //ダウンロード中
    loading: false,
    //受注一覧テーブルヘッダ
    orderHeaders: [
      {text: '受注ID', value: 'orderId'},
      {text: 'ステータス', value: 'status.text', width: 120},
      {text: '受注日時', value: 'orderDate', width: 150},
      {text: '受注経路', value: 'salesChannel', sortable: false, filterable: false, align: 'center'},
      {text: '受注店舗', value: 'shopName'},
      {text: '発注者', value: 'ordererName'},
      {text: '受注額', value: 'payment', align: 'end', width: 100},
      {text: '配達希望日', value: 'preferred'},
      {text: '編集', value: 'action', sortable: false, filterable: false, align: 'end', width: 75},
    ],
    //商品一覧テーブルヘッダ
    productHeaders: [
      {text: '商品ID', value: 'productId', width: 100},
      {text: '商品コード', value: 'productCode'},
      {text: '商品名', value: 'productName'},
      {text: '産地/説明', value: 'productDescription', sortable: false},
      {text: '商品画像', value: 'productPhoto', sortable: false, filterable: false, align: 'center', width: 100},
      {text: '価格', value: 'productPrice', align: 'end', width: 100},
      {text: '残り在庫', value: 'stock'},
      {text: '販売開始', value: 'start'},
      {text: '販売終了', value: 'end'},
      {text: '操作', value: 'action', sortable: false, filterable: false, align: 'end', width: 75},
    ],
    //カート商品テーブルヘッダ
    cartHeaders: [
      {text: '商品コード', value: 'code', sortable: false},
      {text: '商品名', value: 'name', sortable: false},
      {text: '単価', value: 'price', align: 'end', sortable: false},
      {text: '数量', value: 'quantity', align: 'end', sortable: false, width: 75},
      {text: '価格', value: 'payment', align: 'end', sortable: false},
      {text: '削除', value: 'action', sortable: false, filterable: false, align: 'end', width: 75},
    ],
    //フィルター
    ordersFilters: {
      status: [],
      orderId: [],
      orderDate: [],
      salesChannel: [],
      shopName: [],
      ordererName: [],
      closing: [],
      payment: [],
      preferred: [],
    },
    productsFilters: {
      productId: [],
      productCode: [],
      productName: [],
      productDescription: [],
      productPrice: [],
      stock: [],
      start: [],
      end: [],
    },
    //受注抽出条件の選択肢
    selects: {
      status: [
        {value: 'new', text: '新規受注'},
        {value: 'wait', text: '出荷待ち'},
      ],
    },
    //価格帯
    priceRange: config.priceRange,
    //販売経路
    BtoB: config.BtoB,
    BtoBspot: config.BtoBspot,
    salesChannel: [],
    salesChannelIcon: {
      1: config.BtoB,
      2: config.BtoBspot,
    },
    channelIcon: [config.BtoB, config.BtoBspot],
    retail: false,
    //税区分表示
    tax: config.tax,
    //クーポンの利用
    coupon: config.coupon,
    //その他費用の利用
    orderFee: config.orderFee,
    //配達希望時間
    preferredTimes: [
      {value: 'none', text: '指定なし'},
      {value: '0012', text: '午前中'},
      {value: '1416', text: '14時～16時'},
      {value: '1618', text: '16時～18時'},
      {value: '1820', text: '18時～20時'},
      {value: '1921', text: '19時～21時'},
    ],
    //検索値
    search: '',
    //入力モード
    isNew: false,
    //入力ルール
    size: len => v => (v || '').length <= len || `${len}文字以内です`,
    //登録更新レコードのデータ
    editedItem: {},
    //登録更新レコードの表示用配列の中での位置(-1は新規)
    editedIndex: -1,
    //カートに登録されている商品数
    cartQuantity: 0,
    //新規登録時のeditedItemのデフォルト値
    defaultItem: {
      orderId : '',
      status: '新規受注',
      orderDate: '',
      salesChannel: '',
      shopId: '',
      shopCode: '',
      shopName: '',
      ordererName: '',
      cart: [],
      cartPrice: 0,
      discount: 0,
      shippingFee: 0,
      orderFee: 0,
      payment: 0,
      orderMemo: '',
      preferredDate: '',
    },
    //カートダイアログ
    dialogCart: false,
    dialogMessage: '',
    //アラートダイアログ
    alert: false,
    alertMessage: '',
  }),

  computed: {
    //店舗一覧
    shopsValueList() {
      let arr = [...this.shops];
      arr = Array.from(new Map(arr.map((v) => [v.shopId, v])).values()); //shopの重複を削除
      arr = arr.sort((a, b) => typeof a.shopName === 'string' ? a.shopName.localeCompare(b.shopName, 'ja') : a.shopName - b.shopName); //shopでソート
      return arr;
    },
    //注文者一覧
    usersValueList() {
      let arr = [];
      if(this.shop === null) {
          arr = [...this.shops]; //全ユーザ
      } else {
        this.shops.forEach((shop) => {
          if(shop.shopId == this.shop?.shopId) arr.push(shop); //所属ユーザ
        });
      }
      arr = Array.from(new Map(arr.map((v) => [v.userId, v])).values()); //userIdの重複を削除
      arr = arr.sort((a, b) => typeof a.ordererName === 'string' ? a.ordererName.localeCompare(b.ordererName, 'ja') : a.ordererName - b.ordererName); //注文者でソート
      return arr;
    },
    //フィルタリングされた受注情報一覧
    filteredOrders() {
      this.selected = [];
      return this.orders.filter(tbl => {
        return Object.keys(this.ordersFilters).every(col => {
          //this.ordersFilters[col]: フィルターで指定された値(配列), tbl[col]: データ行に含まれる値
          if (col == 'status') { //ステータス
            return this.ordersFilters[col].length < 1 || this.ordersFilters[col].findIndex(e => e.text === tbl[col].text) !== -1;
          } else if(col == 'salesChannel') { //販売経路(ボタンでフィルタリング)
            return this.ordersFilters[col].length < 1 || !!(this.ordersFilters[col].filter(e => tbl[col].indexOf(e) !== -1)).length;
          } else if(Object.prototype.toString.call(tbl[col]) === "[object Object]") { //オンオフ項目
            return this.ordersFilters[col].length < 1 || this.ordersFilters[col].includes(tbl[col].text);
          } else {
            return this.ordersFilters[col].length < 1 || this.ordersFilters[col].includes(tbl[col]);
          }
        });
      });
    },
    //フィルタリングされた商品一覧
    filteredProducts() {
      return this.products.filter(tbl => {
        return Object.keys(this.productsFilters).every(col => {
          //this.productsFilters[col]: フィルターで指定された値, tbl[col]: データ行に含まれる値
          if(col == 'productPrice') { //価格(価格帯でフィルタリング)
            if(this.productsFilters[col].length < 1) return true;
            var included = false;
            this.productsFilters[col].forEach(range => {
              if(tbl[col] >= this.priceRange.value[this.priceRange.text.indexOf(range)][0] &&
                 tbl[col] <= this.priceRange.value[this.priceRange.text.indexOf(range)][1]) {
                included = true;
              }
            });
            return included;
          } else if(Object.prototype.toString.call(tbl[col]) === "[object Object]") { //オンオフ項目
            return this.productsFilters[col].length < 1 || this.productsFilters[col].includes(tbl[col].text);
          } else {
            return this.productsFilters[col].length < 1 || this.productsFilters[col].includes(tbl[col]);
          }
        });
      });
    },
  },

  created() {
    //プルダウン項目の取得
    this.getShops();
    //商品一覧の取得
    this.getProductsB();
    this.getProductsS();
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
    //受注一覧の取得
    this.getOrders();
  },

  methods: {
    //店舗一覧の取得
    getShops() {
      axios.get(`${process.env.API}/aec/shopusers`)
        .then(response => {
          this.shops = response.data.shops;
          // 取引先ユーザー一覧データを変換
          this.shops.forEach(record => {
            //DB格納形式(bit型)の販売経路をv-btn-toggleでの形式(0,1)に変換
            record.salesChannel = Number(record.salesChannel&0b0011) - 1;
          });
        })
        .catch(error => {
          console.log(error);
          this.shops = [];
        });
    },
    //BtoB商品一覧の取得
    getProductsB() {
      axios.get(`${process.env.API}/b2b/products/*?getAll=true`)
        .then(response => {
          this.productsB = response.data.products.map(product => {
            return {
              productId: product.product_id,
              productCode: product.product_code,
              productName: product.product_name,
              productDescription: product.origin,
              productPhoto: product.product_image_thumb,
              productPrice: product.now_price,
              stock: '',
              start: '',
              end: '',
            }
          });
        })
        .catch(error => {
          console.log(error);
          this.productsB = [];
        });
    },
    //BtoBスポット商品一覧の取得
    getProductsS() {
      axios.post(`${process.env.API}/info/products`, {
        token: process.env.INFO_TOKEN,
        order_by: {order: [["productId", "DESC"]]},
        paging: false,
      })
        .then(response => {
          this.productsS = response.data.products.map(product => {
            return {
              productId: product.productId,
              productCode: product.productCode,
              productName: product.productName,
              productDescription: product.productDetail,
              productPhoto: product.productPhoto,
              productPrice: product.productPriceBS,
              stock: product.maxNum,
              start: product.start,
              end: product.end,
            }
          });
        })
        .catch(error => {
          console.log(error);
          this.productsS = [];
        });
    },
    //受注一覧の取得
    getOrders() {
      this.loading = true;
      //受注一覧の表示
      this.close();
      //抽出条件の準備
      let params = {
        orderDate: [],
        salesChannel: [0,1],
        status: ['new', 'wait'],
        preferred: [],
      }
      //受注一覧情報の取得
      axios.get(`${process.env.API}/aec/orders?search=${JSON.stringify(params)}`)
        .then(response => {
          this.orders = response.data.orders;
          //取得データを一覧表示用に変換
          this.orders.forEach((record) =>  {
            //ステータスの表示文字を設定
            let statusObject = this.selects.status.find(e => e.value === record.status);
            if(statusObject) {
              record.status = {value: record.status, text: statusObject.text};
            } else {
              record.status = {value: this.selects.status[0].value, text: this.selects.status[0].text};
            }
          })
          //カートのヘッダ行の初期化
          this.shop = null;
          this.salesChannel = null;
          this.editedItem = Object.assign({}, this.defaultItem);
          this.isNew = false;
          this.loading = false;
        })
        .catch(() => {
          console.log(error);
          this.orders = [];
          this.loading = false;
          return;
        });
    },
    //受注情報の取得
    getOrder(orderId) {
      this.loading = true
      axios.get(`${process.env.API}/aec/order?order=${orderId}&token=${process.env.INFO_TOKEN}`)
        .then(response => {
          this.editedItem = response.data.result.order;
          this.editedItem.status = (this.selects.status.find(status => status.value === this.editedItem.status)?.text || '新規受注');
          this.editedItem.preferredTime = this.preferredTimes.find(p => p.value === this.editedItem.preferredTime)
          if(!this.editedItem.preferredTime) {
            this.editedItem.preferredTime = null
          }
          this.paymentCalc(this.editedItem.cart[0]);
          this.loading = false;
        }).catch(() => {
          this.editedItem = {};
          this.loading = false;
          return;
        });
    },
    //項目の値一覧
    ordersColumnValueList(col, obj=false) {
      if(obj) {
        let arr = this.orders.map(tbl => tbl[col].text);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        let arr = this.orders.map(tbl => tbl[col]);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    productsColumnValueList(col, obj=false) {
      if(obj) {
        let arr = this.products.map(tbl => tbl[col].text);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        let arr = this.products.map(tbl => tbl[col]);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    //カート表示
    showCart() {
      this.dialogMessage = '';
      this.dialogCart = true;
    },
    //登録
    newItem() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.cartQuantity = 0;
      this.shop = null;
      this.salesChannel = '';
      this.products = [];
      this.lineMessage = '';
      this.dialogMessage = '';
      this.ordersTable = false;
      this.productsTable = true;
      this.dialogCart = false;
    },
    //更新
    editItem(item) {
      this.editedIndex = this.orders.indexOf(item);
      this.getOrder(item.orderId);
      this.shop = {shopName: item.shopName, shopId: item.shopId, shopCode: item.shopCode};
      this.user = {ordererName: item.ordererName, userLine: item.userLine, salesChannel: 2**item.salesChannel[0]};
      this.salesChannel = 2**item.salesChannel[0];
      if(this.salesChannel == 1) {
        this.products = [...this.productsB];
      } else {
        this.products = [...this.productsS];
      }
      this.lineMessage = '';
      this.dialogMessage = '';
      this.ordersTable = false;
      this.productsTable = true;
      this.dialogCart = true;
    },
    //登録
    save() {
      //入力を確認する
      this.paymentCalc(null);
      this.dialogMessage = '';
      if(!this.$refs.form.validate()) {
        this.dialogMessage = '入力項目に誤りがあります';
        return;
      }
      //DBに登録するデータの準備
      let db = this.makeDb();
      //注文受付通知の準備
      let msg = this.makeMsg();
      //一覧に登録するデータの準備
      let list = this.makeList();
      //注文の登録
      if(this.salesChannel == '1') { //BtoB通常
        if(this.editedIndex === -1 && !this.editedItem.orderId) {
          this.createOrderB(db, msg, list);
        } else {
          this.updateOrderB(db, msg, list);
        }
      } else { //BtoBスポット
        if(this.editedIndex === -1 && !this.editedItem.orderId) {
          this.createOrderS(db, msg, list);
        } else {
          this.updateOrderS(db, msg, list);
        }
      }
    },
    //BtoB通常の新規注文
    createOrderB(db, msg, list) {
      var put = new URLSearchParams()
      put.append( 'cart'       , JSON.stringify( db.cart ) )
      put.append( 'deliv_date' , JSON.stringify( db.deliv_date ) )
      put.append( 'order_memo' , JSON.stringify( db.order_memo ) )
      put.append( 'user'       , JSON.stringify( db.user ) )
      axios.put(`${process.env.API}/ordering`, put,{
        headers: {
          Authorization: `Bearer ${db.user.user_id}`,
        },
      })
        .then(response => {
          if(response.data.status == 'success') {
            //一覧のデータを更新
            list = response.data.order
            list.status = {value: 'new', text: '新規受注'}
            this.orders.unshift(list);
            //注文受付通知
            msg.text = msg.text.replace('#orderId#', response.data.order.orderId);
            this.lineMsg(msg);
            //完了ダイアログ表示
            this.alertMessage = `注文ID「${list.orderId}」で登録されました`;
            this.close();
          } else {
            this.alertMessage = response.data.message;
            this.alert = true;
          }
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          return;
        });
    },
    //BtoB通常の注文更新
    updateOrderB(db, msg, list) {
      axios.put(`${process.env.API}/ordering/${this.editedItem.orderId}`, {
        params: {put: db},
      })
        .then(response => {
          if(response.data.status == 'success') {
            //一覧のデータを更新
            list.orderDate = response.data.order.orderDate;
            Object.assign(this.orders[this.editedIndex], list);
            //注文更新通知
            this.lineMsg(msg);
            //完了ダイアログ表示
            this.alertMessage = `注文ID「${list.orderId}」を更新しました`;
            this.close();
          } else {
            this.alertMessage = response.data.message;
            this.alert = true;
          }
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          return;
        });
    },
    //BtoBスポットの新規注文
    createOrderS(db, msg, list) {
      axios.post(`${process.env.API}/addInfoOrder`, {
        token: process.env.INFO_TOKEN,
        new_info_order: db
      })
        .then(response => {
          if(response.data.status == 'success') {
            //一覧のデータを更新
            list.orderId = response.data.order.orderId;
            list.orderDate = response.data.order.orderDate;
            this.orders.unshift(list);
            //注文受付通知
            msg.text = msg.text.replace('#orderId#', response.data.order.orderId);
            this.lineMsg(msg);
            //完了ダイアログ表示
            this.alertMessage = `注文ID「${list.orderId}」で登録されました`;
            this.close();
          } else {
            this.alertMessage = response.data.message;
            this.alert = true;
          }
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          return;
        });
    },
    //BtoBスポットの注文更新
    updateOrderS(db, msg, list) {
      db.orderId = this.editedItem.orderId
      axios.post(`${process.env.API}/editInfoOrder`, {
        token: process.env.INFO_TOKEN,
        edit_info_order: db
      })
        .then(response => {
          if(response.data.status == 'success') {
            //一覧のデータを更新
            list.orderDate = response.data.order.orderDate;
            Object.assign(this.orders[this.editedIndex], list);
            //注文更新通知
            this.lineMsg(msg);
            //完了ダイアログ表示
            this.alertMessage = `注文ID「${list.orderId}」を更新しました`;
            this.close();
          } else {
            this.alertMessage = response.data.message;
            this.alert = true;
          }
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          return;
        });
    },
    //ダイアログを閉じる
    closeCart() { //カートを閉じる
      //数量0の商品は削除
      for(let i = this.editedItem.cart.length - 1; i >= 0; i--) {
        if(this.editedItem.cart[i].quantity == 0) this.editedItem.cart.splice(i, 1);
      }
      this.dialogCart = false;
      this.$nextTick(() => {this.$refs.form.resetValidation();});
    },
    close() { //商品一覧を閉じて受注一覧画面に戻る
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
      this.shop = null;
      this.user = null;
      this.salesChannel = null;
      this.isNew = false;
      this.dialogCart = false;
      this.productsTable = false;
      this.ordersTable = true;
    },
    closeAlert() { //ダイアログを閉じる
      this.alert = false;
    },
    //店舗選択
    selectShop() {
      if(this.shop === null) this.user = null;
    },
    //注文者選択
    selectUser() {
      if(this.user === null) return;
      this.shop = Object.assign({}, this.user);
      if(this.BtoB && (this.user?.salesChannel&0b0001)) { //BtoB通常を優先
        this.products = [...this.productsB];
        this.salesChannel = '1';
      } else if(this.BtoBspot && (this.user?.salesChannel&0b0010)) { //BtoBスポット
        this.products = [...this.productsS];
        this.salesChannel = '2';
      } else {
        this.products = [];
        this.salesChannel = '';
      }
      this.editedItem.salesChannel = Number(this.salesChannel) - 1;
      this.editedItem.shopId = this.shop?.shopId;
      this.editedItem.shopCode = this.shop?.shopCode;
      this.editedItem.shopName = this.shop?.shopName;
      this.editedItem.ordererName = this.user?.ordererName;
    },
    //受注経路切替
    selectChannel() {
      if(this.salesChannel == '1') { //BtoB通常
        this.products = [...this.productsB];
      } else { //BtoBスポット
        this.products = [...this.productsS];
      }
      this.editedItem.salesChannel = Number(this.salesChannel) - 1;
      this.editedItem.cart = [];
    },
    //カートに追加
    addCart(item) {
      let index = this.editedItem.cart.findIndex(v => v.code === item.productCode);
      if(index !== -1) { //登録済みなので数量をカウントアップ
        this.editedItem.cart[index].quantity += 1;
      } else { //未登録なので追加
        let addItem = {
          id: item.productId,
          code: item.productCode,
          name: item.productName,
          price: item.productPrice,
          quantity: 1,
          payment: item.productPrice,
        };
        this.editedItem.cart.push(addItem);
      }
      this.paymentCalc(null);
    },
    //カートから削除
    deleteCart(item) {
      this.editedItem.cart.splice(this.editedItem.cart.indexOf(item), 1);
      this.paymentCalc(null);
    },
    //カート商品の総額と総数を計算
    paymentCalc(item) {
      if(item !== null) {
        if(item.quantity < 0) item.quantity = 0;
      }
      this.editedItem.cartPrice = 0;
      this.cartQuantity = 0;
      this.editedItem.cart.forEach((cartItem) => {
        cartItem.payment = cartItem.price * cartItem.quantity;
        this.editedItem.cartPrice += cartItem.payment;
        this.cartQuantity += cartItem.quantity;
      });
      this.editedItem.payment = this.editedItem.cartPrice - this.editedItem.discount + this.editedItem.shippingFee + this.editedItem.orderFee;
    },
    //DBに登録するデータの準備
    makeDb() {
      let db = {};
      let cart = [];
      let cartCount = 0;
      if(this.salesChannel == '1') { //BtoB通常
        this.editedItem.cart.forEach((cartItem) => {
          if(cartItem.quantity > 0) {
            cart.push({
              product_id: cartItem.id,
              product_code: cartItem.code,
              product_name: cartItem.name,
              price: cartItem.price,
              quantity: cartItem.quantity,
            })
            cartCount += +cartItem.quantity;
          }
        });
        db = {
          order_id: '',
          cart: cart,
          cartCount: cartCount,
          session_id: `${JSON.parse(sessionStorage.getItem('aeclogin')).line}___${process.env.CHANNEL_ID}`,
          deliv_date: this.editedItem.preferredDate,
          order_memo: this.editedItem.orderMemo,
          user: {
            user_id: this.editedIndex == -1 ? this.shop.userLine : this.editedItem.userLine,
            shop_code: this.editedIndex == -1 ? this.shop.shopCode : this.editedItem.shopCode,
          }
        };
      } else { //BtoBスポット
        this.editedItem.cart.forEach((cartItem) => {
          if(cartItem.quantity > 0) {
            cart.push({
              productId: cartItem.id,
              productName: cartItem.name,
              productPrice: cartItem.price,
              quantity: cartItem.quantity,
            })
            cartCount += +cartItem.quantity;
          }
        });
        db = {
          orderId: '',
          userId: this.editedIndex == -1 ? this.shop.userLine : this.editedItem.userLine,
          orderArray: cart,
          orderNum: cartCount,
          orderDate: this.getNow(),
          deliveryDate: null,
        };
      }
      return db;
    },
    //注文受付通知の準備
    makeMsg() {
      let msgText = '';
      msgText += `注文番号 : ${this.editedIndex == -1 ? '#orderId#' : this.editedItem.orderId}\n`
      msgText += `注文者 : ${this.editedIndex == -1 ? this.shop.userName : this.editedItem.ordererName}\n`
      msgText += `注文内容は以下です。\n`
      this.editedItem.cart.forEach((cartItem) => {
        msgText += `${cartItem.name}\n`
        msgText += `${cartItem.price}円 x ${cartItem.quantity} = ${cartItem.payment}円\n\n`
      })
      msgText += `-----------------------\n`
      msgText += `注文合計 : ${this.editedItem.payment}円\n`
      if(this.salesChannel == '1') { //BtoB通常
        if(this.editedItem.preferredDate) {
          msgText += `お届け希望日は${this.editedItem.preferredDate}です。\n`
        }
      } else { //BtoBスポット
        msgText += `ご注文のお届けは本日から2営業日後となっております。\n`
        msgText += `商品の内容や通常の発注商品との同時配送などにつきましては、このトークルームにてご質問ください。`
      }
      let sendShop = this.editedIndex == -1 ? this.shop.shopId : this.editedItem.shopId;
      let sendUser = this.editedIndex == -1 ? this.user.userLine : this.editedItem.userLine;
      return {text: msgText, shop: sendShop, user: sendUser};
    },
    //一覧に登録するデータの準備
    makeList() {
      let list = {};
      list.orderId = this.editedItem.orderId;
      list.status = this.editedItem.status ? this.editedItem.status : {value: 'new', text: '新規受注'}
      list.orderDate = this.editedItem.orderDate;
      list.salesChannel = [Number(this.salesChannel) - 1];
      list.shopCode = this.editedIndex == -1 ? this.shop.shopCode : this.editedItem.shopCode;
      list.shopName = this.editedIndex == -1 ? this.shop.shopName : this.editedItem.shopName;
      list.ordererName = this.editedIndex == -1 ? this.shop.userName : this.editedItem.ordererName;
      list.payment = this.editedItem.payment;
      list.preferred = this.editedItem.preferredDate;
      list.stock = this.editedItem.stock;
      list.start = this.editedItem.start;
      list.end = this.editedItem.end;
      return list;
    },
    //注文完了通知の送信
    lineMsg(msg) {
      axios.post(`${process.env.API}/aec/linemsg/notification`, {
        token: process.env.INFO_TOKEN, msg: msg
      })
        .then(response => {
          let result = response;
        })
        .catch(error => {
        console.log(error);
        });
    },
    //現在時刻の取得
    getNow() {
      let now = new Date();
      return now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' +('0' + now.getDate()).slice(-2) + ' ' +  ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2);
    },
  },
}
</script>
