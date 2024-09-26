<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">取引先ユーザー一覧</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-select v-model="app" label="販売店（アプリ名）" :items="apps" item-text="app_name" item-value="shopId" return-object hide-details :readonly="fixedApp" :clearable="!fixedApp"></v-select>
        <Icon @btnClick="getUsers" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="true" />
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details clearable dense></v-text-field>
        <span v-show="userRole === USER_ROLE.ADMIN"><Icon @btnClick="newItem" iconName="mdi-database-plus-outline" iconTooltip="新規利用者を追加" :isText="true" /></span>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="filteredUsers" :loading="loading" :search="search" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
            <tr>
              <td><v-select v-model="filters.shopCode" :items="columnValueList('shopCode')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.shopName" :items="columnValueList('shopName')" hide-details dense multiple clearable></v-select></td>
<!--★★　丸長向けカスタマイズ：販売経路非表示
              <td>
                <v-btn-toggle v-model="filters.salesChannel" borderless dense multiple>
                  <v-btn v-if="BtoB" value="1" small icon><v-icon>{{BtoB}}</v-icon></v-btn>
                  <v-btn v-if="BtoBspot" value="2" small icon><v-icon>{{BtoBspot}}</v-icon></v-btn>
                  <v-btn v-if="BtoC" value="4" small icon><v-icon>{{BtoC}}</v-icon></v-btn>
                  <v-btn v-if="BtoBtoC" value="8" small icon><v-icon>{{BtoBtoC}}</v-icon></v-btn>
                </v-btn-toggle>
              </td>
★★-->
              <td><v-select v-model="filters.isParent" :items="columnValueList('isParent', true)" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.ordererName" :items="columnValueList('ordererName')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.regist" :items="columnValueList('regist', true)" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.active" :items="columnValueList('active', true)" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.purchase" :items="columnValueList('purchase', true)" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.tag" :items="tags" item-text="tagValue" item-value="tagId" return-object hide-details multiple clearable dense></v-select></td>
              <td></td>
            </tr>
          </tbody>
        </template>
        <!-- 販売経路 -->
<!--★★　丸長向けカスタマイズ：販売経路非表示
        <template v-slot:[`item.salesChannel`]="{item}">
          <div class="text-truncate">
            <v-icon v-for="(c, index) in item.salesChannel.split(',')" :key="index">{{salesChannelIcon[c]}}</v-icon>
          </div>
        </template>
★★-->
        <!-- ユーザ区分 -->
        <template v-slot:[`item.isParent.text`]="{item}">
          <div class="text-truncate">
            <Icon v-if="item.isParent.value" iconName="mdi-account" iconTooltip="親(管理者)" />
            <Icon v-else iconName="mdi-account-outline" iconTooltip="子(担当者)" />
          </div>
        </template>
        <template v-slot:[`item.tag`]="{item}">
          <span class="d-inline-block text-truncate" style="max-width: 175px;">
            {{ item.tag }}
          </span>
        </template>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate" v-show="userRole !== USER_ROLE.STAFF || loginInfo.userId === item.userId">
            <Icon v-if="item.isParent.value && addAccountPersonInCharge" @btnClick="addItem(item)" iconName="mdi-database-plus-outline" iconTooltip="子(担当者)を追加" />
            <Icon @btnClick="editItem(item)" iconName="mdi-pencil-outline" iconTooltip="編集" />
            <Icon @btnClick="deleteItem(item)" iconName="mdi-delete-outline" iconTooltip="削除" />
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
                    <v-col cols="12" md="1">
                      <v-text-field v-model="editedItem.userId" label="ユーザID" disabled></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-select v-model="editedItem.isParent" label="親子区分" :items="parents" item-text="text" item-value="value" return-object :disabled="(userRole == USER_ROLE.STAFF || isActionCreated)"></v-select>
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-text-field v-model="editedItem.userCode" label="ユーザコード" clearable :rules="rule_userCode" @blur="checkUserFieldExist('userCode', editedItem.userCode)"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="5">
                      <v-text-field v-model="editedItem.ordererName" label="担当者" clearable></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-text-field v-model="editedItem.userTel" label="担当者携帯番号(－なし)" type="number" hide-spin-buttons clearable></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="auto">
                      <v-row dense>
                        <v-col cols="12" md="8">
                          <v-switch v-model="editedItem.regist" label="ID連携"></v-switch>
                        </v-col>
                        <v-col cols="12" md="2" align-self="center">
                          <IconSet @btnClick="showQR(1)" iconType="channelBit" :iconNumber="Number(1)" :iconDisabled="!(editedItem.regist&&!!editedItem.shop.shopCode&&editedItem.salesChannel.includes('1'))" />
                        </v-col>
                        <v-col cols="12" md="2" align-self="center">
                          <IconSet @btnClick="showQR(2)" iconType="channelBit" :iconNumber="Number(2)" :iconDisabled="!(editedItem.regist&&!!editedItem.shop.shopCode&&editedItem.salesChannel.includes('2'))" />
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="12" md="10">
                      <v-row dense>
                        <v-col cols="12" md="4">
                          <v-text-field v-model="editedItem.userLine" label="LINE ID" :rules="rule_userLine" @blur="checkUserLineExist('userLine', editedItem.userLine)" clearable></v-text-field>
                        </v-col>
                        <v-col cols="12" md="2">
                          <v-text-field v-model="editedItem.userName" label="LINEユーザ名" clearable></v-text-field>
                        </v-col>
                        <v-col cols="12" md="3" class="d-md-flex justify-md-end">
                          <v-switch v-model="editedItem.active" :disabled="!editedItem.salesChannel.includes('1')">
                            <template v-slot:label>
                              <IconSet iconType="channelBit" :iconNumber="Number(1)"/>
                              {{ tooltipB2b }}利用承認
                            </template>
                          </v-switch>
                        </v-col>
                        <v-col cols="12" md="3">
                          <!-- <v-switch v-model="editedItem.purchase" label="商品購入" :disabled="!(editedItem.salesChannel.includes('2') || purchaseChild || editedItem.isParent.value)"></v-switch> -->
                          <v-switch v-model="editedItem.purchase" :disabled="!editedItem.salesChannel.includes('2')">
                            <template v-slot:label>
                              <IconSet iconType="channelBit" :iconNumber="Number(2)"/>
                              {{ tooltipSpot }}利用承認
                            </template>
                          </v-switch>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="1">
                      <v-text-field v-model="editedItem.shop.shopId" label="店舗ID" disabled clearable></v-text-field>
                    </v-col>
                    <v-col cols="12" md="1">
                      <v-text-field v-model="editedItem.shop.shopCode" label="店舗コード" :disabled="!editedItem.isParent.value||fixedApp" clearable :rules="rule_equired.concat(rule_shopCode)" @blur="checkShopFieldExist('shopCode', editedItem.shop.shopCode)"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field v-model="editedItem.shop.shopName" label="店舗名" :disabled="!editedItem.isParent.value" clearable :rules="rule_equired"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-text-field v-model="editedItem.shop.shopTel" label="店舗電話番号" :disabled="!editedItem.isParent.value" clearable></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field v-model="editedItem.shop.bizName" label="事業者名" :disabled="!editedItem.isParent.value" clearable></v-text-field>
                    </v-col>
                    <v-col v-if="useGroup" cols="12" md="2">
                      <v-combobox v-model="editedItem.shop.shop_group" label="店舗グループ" :disabled="!editedItem.isParent.value" :items="shop_groups" item-text="groupName" item-value="shopGroupId" return-object clearable></v-combobox>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="2">
                      <div small>販売経路</div>&emsp;
                      <v-btn-toggle v-model="editedItem.salesChannel" @change="salesChannelChangeHandler" borderless multiple dense>
                        <IconSet iconType="channelBit" :iconNumber="Number(1)" :iconDisabled="userRole === USER_ROLE.STAFF || channel.user" />
                        <IconSet iconType="channelBit" :iconNumber="Number(2)" :iconDisabled="userRole === USER_ROLE.STAFF || channel.spot" />
                        <IconSet iconType="channelBit" :iconNumber="Number(4)" :iconDisabled="userRole === USER_ROLE.STAFF || channel.direct" />
                        <IconSet iconType="channelBit" :iconNumber="Number(8)" :iconDisabled="userRole === USER_ROLE.STAFF || channel.shop" />
                      </v-btn-toggle>
                      <v-text-field height="0px" :rules="rule_channel" dense></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-switch v-if="BtoBtoC&&shopPickup&&editedItem.salesChannel.includes('8')" v-model="editedItem.shop.shopPickup" label="店舗受取" :disabled="!editedItem.isParent.value"></v-switch>
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-menu v-model="TimePicker" :close-on-content-click="false">
                        <template v-slot:activator="{on}">
                          <v-text-field v-model="editedItem.shop.closing" label="締め時間" readonly hide-details clearable :disabled="!editedItem.isParent.value" v-on="on"></v-text-field>
                        </template>
                        <v-time-picker v-model="editedItem.shop.closing" format="24hr" scrollable></v-time-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="editedItem.tag" label="タグ" :items="tags" item-text="tagValue" item-value="tagId" multiple clearable></v-select>
                    </v-col>
                  </v-row>
                  <v-row v-if="false && (editedItem.isParent.value && (userRole === USER_ROLE.ADMIN || (userRole !== USER_ROLE.STAFF && loginInfo.userId == editedItem.userId)))" dense>
                    <v-expansion-panels multiple>
                      <v-expansion-panel>
                        <v-expansion-panel-header class="text-h6">配送先</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <AddressInput :address="editedItem.shop.address" ref="refAddress"></AddressInput>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
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
              <v-card-title class="text-h6" v-if="editedItem.isParent.value">
                全ての利用者と店舗情報を削除してよろしいですか？
              </v-card-title>
              <v-card-title class="text-h6" v-else>
                「{{editedItem.shop.shopName}}」の「{{editedItem.ordererName?.trim() || '(担当者名未登録)'}}」を削除してよろしいですか？
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
          <!-- 利用者追加用QRコード表示 -->
          <v-dialog v-model="dialogQR" persistent max-width="800px">
            <v-card>
              <v-card-title class="justify-center">{{titleQR}}利用者追加用QRコード</v-card-title>
              <v-card-text class="text-center">
                <p><v-img :src="userQRCode"></v-img></p>
                <!-- <p>{{userQRUrl}}</p> -->
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="outputPDF">PDF出力</v-btn>
                <v-btn color="primary" @click="closeQR">閉じる</v-btn>
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
import { jsPDF } from "jspdf";
import AddressInput from "../components/AddressInput.vue";
import config from "../constants/config.js";

export default {
  name: 'UsersPage',
  components: {
    AddressInput
  },

  data: () => ({
    //ログイン中
    loggedin: false,
    //取引先ユーザー一覧
    users: [],
    //ダウンロード中
    loading: false,
    //アプリ名
    apps: [], // [{shopId: 店舗ID, app_name: アプリ名}]
    app: null,
    fixedApp: false,
    //テーブルヘッダ
    headers: [
      {text: '店舗コード', value: 'shopCode'},
      {text: '店舗', value: 'shopName'},
/*★★　丸長向けカスタマイズ：販売経路非表示
      {text: '販売経路', value: 'salesChannel', align: 'center', sortable: false, filterable: false},
★★*/
      {text: '親子', value: 'isParent.text', width: 75, align: 'center'},
      {text: '担当者', value: 'ordererName'},
      {text: 'ID連携', value: 'regist.text', width: 100, align: 'center'},
/*★★  Customization for Marucho NO141 ticket #13425
      {text: '利用承認', value: 'active.text', width: 100, align: 'center'},
★★*/
//★★  Customization for Marucho NO141 ticket #13425
      {text: 'BtoB通常', value: 'active.text', width: 120, align: 'center'},
      {text: 'BtoBスポット', value: 'purchase.text', width: 130, align: 'center'},
//★★

      {text: '配信用タグ', value: 'tag'},
      {text: '操作', value: 'action', width: 75, align: 'end', sortable: false, filterable: false},
    ],
    //フィルター
    filters: {
      shopCode: [],
      shopName: [],
/*★★　丸長向けカスタマイズ：販売経路非表示
      salesChannel: [],
★★*/
      isParent: [],
      user: [],
      regist: [],
      active: [],
      purchase: [],
      tag: [],
    },
    //検索値
    search: '',
    //親子区分
    parents: [{value: true, text: '親(管理者)'}, {value: false, text: '子(担当者)'}],
    //ID連携
    regists: [{value: false, text: '未'}, {value: true, text: '連携済'}],
    //BtoB通常
    actives: [{value: false, text: '未'}, {value: true, text: '承認済'}],
    //BtoBスポット
    purchases: [{value: false, text: '未'}, {value: true, text: '承認済'}],
    //販売店担当者の商品購入
    purchaseChild: config.purchaseChild,
    //販売経路
    BtoB: config.BtoB,
    BtoBspot: config.BtoBspot,
    BtoC: config.BtoC,
    BtoBtoC: config.BtoBtoC,
    salesChannel: [],
    salesChannelIcon: {
      1: config.BtoB,
      2: config.BtoBspot,
      4: config.BtoC,
      8: config.BtoBtoC,
    },
    channel: {user: true, spot: true, direct: true, shop: true}, //true：押下不可
    //店舗グループ
    useGroup: config.shopGroup,
    shop_groups: [],
    //タグ
    tags: [],
    //店舗受取
    shopPickup: config.shopPickup,
    //締め時間
    TimePicker: false,
    //入力ルール
    userCodeExist: false,
    userLineExist: false,
    shopCodeExist: false,
    //登録更新レコードのデータ
    editedItem: {},
    isDisableSubmit: false,
    defaultItem: {
      userId: null,
      isParent: {value: true, text: '親(管理者)'},
      userCode: '',
      userLine: '',
      userName: '',
      ordererName: '',
      shopId: null,
      salesChannel: [],
      userTel: '',
      regist: false,
      active: false,
      purchase: false,
      tag: [],
      deleteFlg: 0,
      shop: {
        shopId: null,
        shopCode: '',
        shopName: '',
        shopTel: '',
        bizName: '',
        shopGroupId: null,
        addressId: null,
        shopPickup: false,
        closing: config.closingTime,
        deleteFlg: 0,
        address: {
          addressId: null,
          zip: '',
          prefCode: null,
          perf: '',
          city: '',
          street: '',
          address: '',
          addition: '',
          tel1: '',
          tel2: '',
          tel3: '',
          name: ''
        },
        shop_group: null,
      },
    },
    //登録更新レコードの表示用配列の中での位置(-1は新規)
    editedIndex: -1,
    //登録更新削除ダイアログ
    dialogEdit: false,
    dialogDelete: false,
    message: '',
    //アラートダイアログ
    alert: false,
    alertMessage: '',
    //QR表示ダイアログ
    dialogQR: false,
    titleQR: '',
    userQRUrl: '',
    userQRCode: '',
    USER_ROLE: {
      ADMIN: 1,
      MANAGER: 2,
      STAFF: 3,
    },
    loginInfo: {},
    userRole: null,
    addAccountPersonInCharge: config.addAccountPersonInChargeSetting,
    isActionCreated: false,
  }),

  computed: {
    //フィルタリングされた取引先ユーザー一覧
    filteredUsers() {
      return this.users.filter(tbl => {
        return Object.keys(this.filters).every(col => {
          //this.filters[col]: フィルターで指定された値, tbl[col]: データ行に含まれる値
          if (col === 'tag') {
            return this.filters.tag.length < 1 || this.filters.tag.some((tag) => tbl.tags.includes(tag.tagId));
          } else if (col === 'salesChannel') { //販売経路(ボタンでフィルタリング)
            return this.filters[col].length < 1 || !!(this.filters[col].filter(x => tbl[col].indexOf(x) !== -1)).length;
          } else if(Object.prototype.toString.call(tbl[col]) === "[object Object]") { //オンオフ項目
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col].text);
          } else {
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col]);
          }
        });
      });
    },
    //登録ダイアログのタイトル
    dialogTitle() {
      return this.editedIndex === -1 ? '利用者追加' : '利用者更新';
    },
    //入力ルール
    rule_equired() {
      return [v => !!v || '入力が必須の項目です'];
    },
    rule_channel() {
      return [(!!this.editedItem.salesChannel && !!this.editedItem.salesChannel.length) || '設定が必須の項目です'];
    },
    rule_userCode() {
      return [!this.userCodeExist || 'ユーザコードは既に存在します']
    },
    rule_userLine() {
      return [!this.userLineExist || 'LineIDは既に存在します']
    },
    rule_shopCode() {
      return [!this.shopCodeExist || '店舗コードは既に存在します']
    },
    tooltipB2b() {
      return process.env.TOOLTIP_B2B || 'BtoB通常';
    },
    tooltipSpot() {
      return process.env.TOOLTIP_SPOT || 'BtoB通常';
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
    if(this.useGroup) this.getShopGroups();
    this.getTags();
    //登録更新情報の初期化
    this.editedItem = JSON.parse(JSON.stringify(this.defaultItem));
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
      this.loginInfo = JSON.parse(sessionStorage.getItem('aeclogin'));
      this.userRole = this.loginInfo?.adminUser ? this.USER_ROLE.ADMIN : (this.loginInfo?.shopManager ? this.USER_ROLE.MANAGER : this.USER_ROLE.STAFF)

      if (this.userRole !== this.USER_ROLE.ADMIN && this.loginInfo.shopId != this.$route.query.shop) {
        this.$router.push({ path: '/users', query: { shop: this.loginInfo.shopId }});
        this.app = {shopId: parseInt(this.loginInfo.shopId), app_name: ''};
        this.fixedApp = true;
      }
    } else {
      this.$router.replace('/');
    }
    //取引先ユーザー一覧の取得
    this.getUsers();
  },

  methods: {
    //販売店一覧の取得
    getApps() {
      axios.get(`${process.env.API}/aec/limiteds/apps`, {
        params: {
          token: process.env.INFO_TOKEN
        }
      })
        .then(response => {
          this.apps = [...response.data.apps];
          if(this.fixedApp) this.app.app_name = this.apps.find(v => v.shopId === this.app.shopId)?.app_name;
        })
        .catch(error => {
          console.log(error);
          this.apps = [];
          return;
      });
    },
    //店舗グループ一覧の取得
    getShopGroups() {
      axios.get(`${process.env.API}/aec/shop-groups`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.shop_groups = [...response.data.groups];
        })
        .catch(error => {
          console.log(error);
          this.apps = [{shopGroupId: '', groupName: ''}];
          return;
        });
    },
    //タグ一覧の取得
    getTags() {
      axios.get(`${process.env.API}/aec/tags`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.tags = [...response.data.tags];
        })
        .catch(error => {
          console.log(error);
          this.apps = [{tagId: '', tagValue: ''}];
          return;
        });
    },
    //取引先ユーザー一覧の取得
    getUsers() {
      this.loading = true;
      axios.get(`${process.env.API}/aec/users?shop=${this.app?.shopId || ''}`)
        .then(response => {
          this.users = response.data.users;
          // 取引先ユーザー一覧データを変換
          this.users.forEach(record => {
            //オンオフ項目の値を、真偽値(value)と表示値(text)へ変換
            record.isParent = {value: !!record.isParent, text: !!record.isParent ? '親(管理者)' : '子(担当者)'};
            record.regist = {value: !!record.regist, text: !!record.regist ? '連携済' : '未'};
            record.active = {value: !!record.active, text: !!record.active ? '承認済' : '未'};
            record.purchase = {value: !!record.purchase, text: !!record.purchase ? '承認済' : '未'};
            //DB格納形式(bit型)の販売経路を一覧画面での形式(カンマ区切りの文字列('1,2,8'))に変換
            let salesChannel = [];
            for(let b = 0; b < 4; b++) {if(record.salesChannel&(2**b)) salesChannel.push(String(2**b));}
            record.salesChannel = salesChannel.join();
            const userTagIDs = record.tag ? record.tag.substring(1, record.tag.length - 1).split(',').map(tag => +tag) : []; // Remove brackets and split
            const tagValues = this.tags.filter((tag) => userTagIDs.includes(tag.tagId)).map(tag => tag.tagValue);
            record.tags = userTagIDs;
            record.tag = tagValues.join('、');
          });
          this.loading = false;
        })
        .catch(error => {
          console.log(error)
          this.users = []
          this.loading = false
        });
    },
    //利用者データの取得
    getUser(userId) {
      return axios.get(`${process.env.API}/aec/users/${userId}`, {
          params: {token: process.env.INFO_TOKEN}
        })
        .then(response => {
          if (response.data.status) {
            this.editedItem = Object.assign({}, response.data.result.user);
            //DB格納形式(バイナリ)の販売経路を詳細画面での配列形式(["1","2","8"])に変換
            let salesChannel = this.editedItem.salesChannel;
            this.editedItem.salesChannel = [];
            for(let b=0; b<4; b++) {
              if(salesChannel&(2**b) && !!this.salesChannelIcon[2**b]) {
                this.editedItem.salesChannel.push(String(2**b));
              }
            }
            this.editedItem.salesChannel = this.editedItem.salesChannel.join().split(',');
            //複数選択項目を配列へ変換
            this.editedItem.tag = JSON.parse(this.editedItem.tag);
            //オンオフ項目の値を、真偽値(value)と表示値(text)へ変換
            this.editedItem.isParent = {value: !!this.editedItem.isParent, text: !!this.editedItem.isParent ? '親(管理者)' : '子(担当者)'};
            //オンオフ項目の値を、真偽型へ変換
            this.editedItem.regist = !!this.editedItem.regist;
            this.editedItem.active = !!this.editedItem.active;
            this.editedItem.purchase = !!this.editedItem.purchase;
            this.editedItem.shop.shopPickup = !!this.editedItem.shop.shopPickup;
            this.salesChannel = [...this.editedItem.salesChannel];
            //子レコードの場合はユーザ情報をクリア
            if(this.editedIndex == -1) {
              this.editedItem.userId = null;
              this.editedItem.isParent.value = false;
              this.editedItem.isParent.text = '担当者';
              this.editedItem.userCode = '';
              this.editedItem.userLine = '';
              this.editedItem.userName = '';
              this.editedItem.ordererName = '';
              this.editedItem.userTel = '';
              this.editedItem.regist = false;
              this.editedItem.active = false;
              this.editedItem.purchase = false;
            }
            this.$refs.form.resetValidation();
          } else {
            //取得失敗ダイアログ表示
            this.alertMessage = response.data.message;
            this.alert = true;
          }
          return true;
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          return false;
        });
    },
    //フィルター用選択項目の値一覧の作成
    columnValueList(col, obj=false) {
      if(obj) {
        let arr = this.users.map(tbl => tbl[col].text);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        let arr = this.users.map(tbl => tbl[col]);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    //販売チャネルの設定
    getSaleChanelValue(salesChannel) {
      if(!!salesChannel) {
        return salesChannel.reduce((a,v) => a + (+v > 0 ? +v : 0), 0);
      } else {
        return 0;
      }
    },
    //新規ユーザの登録
    newItem() {
      this.editedIndex = -1;
      this.editedItem = JSON.parse(JSON.stringify(this.defaultItem));
      this.channel.user = !this.editedItem.isParent.value;
      this.channel.spot = !this.editedItem.isParent.value;
      this.channel.direct = !this.editedItem.isParent.value;
      this.channel.shop = !this.editedItem.isParent.value;
      this.message = '';
      this.dialogEdit = true;
      this.isActionCreated = true;
    },
    //子ユーザの登録
    addItem(item) {
      this.editedIndex = -1;
      this.getUser(item.userId).then(res => {
        this.channel.user = true;
        this.channel.spot = true;
        this.channel.direct = true;
        this.channel.shop = true;
      })
      this.message = '';
      this.dialogEdit = true;
    },
    //更新
    editItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.getUser(item.userId).then(res => {
        this.channel.user = !this.editedItem.isParent.value;
        this.channel.spot = !this.editedItem.isParent.value;
        this.channel.direct = !this.editedItem.isParent.value;
        this.channel.shop = !this.editedItem.isParent.value;
      })
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.message = '';
      this.dialogEdit = true;
      this.isActionCreated = false;
    },
    //保存
    save() {
      //入力を確認する
      this.message = '';
      if (!this.$refs.form.validate()) {
        this.message = '入力項目に誤りがあります';
        return;
      }
      //DBに登録するデータの準備
      let db = Object.assign({}, this.editedItem);
      db.isParent = db.isParent.value ? 1 : 0;
      //販売経路をDB格納形式(バイナリ)にする
      db.salesChannel = this.getSaleChanelValue(this.editedItem.salesChannel);
      //true/falseをDB格納形式(1/0)にする
      db.regist = db.regist ? 1 : 0;
      db.active = db.active ? 1 : 0;
      db.purchase = db.purchase ? 1 : 0;
      db.shop.shopPickup = db.shop.shopPickup ? 1 : 0;
      //タグをjson形式に変換
      db.tag = JSON.stringify(db.tag);
      //ユーザグループの編集とプルダウン更新
      if(db.shop.shop_group === null) {
        db.shop.shopGroupId = null;
      } else {
        if(Object.prototype.toString.call(db.shop.shop_group) !== "[object Object]") {
          db.shop.shop_group = {shopGroupId: null, groupName: db.shop.shop_group};
          if(this.shop_groups.findIndex(v => v.groupName === db.shop.shop_group.groupName) === -1) {
            this.shop_groups.unshift(db.shop.shop_group);
          }
        }
        db.shop.shopGroupId = db.shop.shop_group.shopGroupId;
      }
      //一覧に登録するデータの準備
      let list = {};
      list.userId = this.editedItem.userId;
      list.userCode = this.editedItem.userCode;
      list.ordererName = this.editedItem.ordererName;
      list.shopCode = this.editedItem.shop.shopCode;
      list.shopName = this.editedItem.shop.shopName;
      //販売経路を詳細の形式(["1","2","8"])から一覧の形式("1,2,8")に変換する
      list.salesChannel = this.editedItem.salesChannel.join();
      list.isParent = this.editedItem.isParent;
      list.regist = {value: this.editedItem.regist, text: this.editedItem.regist ? '連携済' : '未'};
      list.active = {value: this.editedItem.active, text: this.editedItem.active ? '承認済' : '未'};
      list.purchase = {value: this.editedItem.purchase, text: this.editedItem.purchase ? '承認済' : '未'};
      //DB登録
      if (this.editedIndex === -1 && !this.editedItem.userId) {
        this.createUser(db, list);
        return;
      } else {
        this.updateUser(db, list);
        return;
      }
    },
    createUser(db, list) {
      db.userCode = this.trimValue(db.userCode)
      db.userLine = this.trimValue(db.userLine)
      this.isDisableSubmit = true
      axios.post(`${process.env.API}/aec/users/create`, {
        token: process.env.INFO_TOKEN,
          user: db,
      })
        .then(response => {
          if(response.data.status) {
            //一覧のデータを更新
            list.userId = response.data.result.user.userId;
            list.shopId = response.data.result.user.shopId;
            this.users.unshift(list);
            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.ordererName?.trim() ? this.editedItem.ordererName?.trim() : '(担当者名未登録)'}」を登録しました`;
            this.close();
          } else {
            //登録失敗ダイアログ表示
            this.alertMessage = response.data.message;
          }
          this.alert = true;
          this.isDisableSubmit = false;
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          return;
        });
    },
    updateUser(db, list) {
      db.userCode = this.trimValue(db.userCode)
      db.userLine = this.trimValue(db.userLine)
      this.isDisableSubmit = true
      axios.post(`${process.env.API}/aec/users/${this.editedItem.userId}`, {
          token: process.env.INFO_TOKEN,
          user: db,
        })
        .then(response => {
          if(response.data.status) {
            //一覧のデータを更新
            Object.assign(this.users[this.editedIndex], list);
            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.ordererName?.trim() ? this.editedItem.ordererName?.trim() : '(担当者名未登録)'}」を更新しました`;
            this.close();
          } else {
            //登録失敗ダイアログ表示
            this.alertMessage = response.data.message;
          }
          this.alert = true;
          this.isDisableSubmit = false
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          this.isDisableSubmit = false
          return;
        });
    },
    close() {
      this.dialogEdit = false;
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.editedItem = JSON.parse(JSON.stringify(this.defaultItem));
      this.editedIndex = -1;
      this.salesChannel = [];
    },
    //削除
    deleteItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem.userId = item.userId;
      this.editedItem.shopId = item.shopId;
      this.editedItem.isParent.value = item.isParent.value;
      this.editedItem.ordererName = item.ordererName;
      this.editedItem.shop.shopName = item.shopName;
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      axios.delete(`${process.env.API}/aec/users/${this.editedItem.userId}`, {
        data: {token: process.env.INFO_TOKEN, shopId: this.editedItem.shopId, isParent: !!this.editedItem.isParent.value}
      })
        .then(response => {
          if (!this.editedItem.isParent.value) {
            //一覧のデータを削除
            this.users.splice(this.editedIndex, 1);
            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.ordererName?.trim() ? this.editedItem.ordererName?.trim() : '(担当者名未登録)'}」を削除しました`;
          } else {
            this.getUsers();
            this.alertMessage = '全ての利用者と店舗情報を削除しました';
          }
          this.alert = true;
          this.closeDelete();
        })
        .catch(error => {
          console.log(error)
          this.alertMessage = error.message
          this.alert = true
        });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        if(this.$refs.form){
          this.$refs.form.resetValidation();
        }
      });
      this.editedItem = JSON.parse(JSON.stringify(this.defaultItem));
      this.editedIndex = -1;
      this.salesChannel = [];
    },
    closeAlert() {
      this.alert = false;
    },
    //ユーザコードの重複チェック
    async checkUserFieldExist(name, value) {
      try {
        value = this.trimValue(value)
        const {data} = await axios.get(`${process.env.API}/aec/user/isExist`, {
          params: {
            token: process.env.INFO_TOKEN,
            userId: this.editedItem.userId,
            name,
            value,
          }
        })
        if (name === 'userCode') {
          this.userCodeExist = data.result
        }
      } catch (err) {
        // エラーダイアログを表示
        this.alertMessage = err.message
        this.alert = true;
      }
    },
    async checkUserLineExist(name, value) {
      try {
        value = this.trimValue(value)
        const {data} = await axios.get(`${process.env.API}/aec/userLine/isExist`, {
          params: {
            token: process.env.INFO_TOKEN,
            userId: this.editedItem.userId,
            name,
            value,
          }
        })
        if (name === 'userLine') {
          this.userLineExist = data.result
        }
      } catch (err) {
        // エラーダイアログを表示
        this.alertMessage = err.message
        this.alert = true;
      }
    },
    //店舗コードの重複チェック
    async checkShopFieldExist(name, value) {
      try {
        const {data} = await axios.get(`${process.env.API}/aec/shop/isExist`, {
          params: {
            token: process.env.INFO_TOKEN,
            shopId: this.editedItem.shop.shopId,
            name,
            value,
          }
        })
        if (name === 'shopCode') {
          this.shopCodeExist = data.result
        }
      } catch (err) {
        // エラーダイアログを表示
        this.alertMessage = err.message
        this.alert = true;
      }
    },
    //ユーザ追加用QRコード出力
    showQR(channel) {
      if(channel == 1) { //BtoB通常のユーザ追加用QRコード
        this.titleQR = '通常';
        this.userQRUrl = 'https://liff.line.me/' + process.env.BTOB + '/idlink?shop_code=' + this.editedItem.shop.shopCode;
      } else { //BtoBスポットのユーザ追加用QRコード
        this.titleQR = 'スポット';
        this.userQRUrl = 'https://liff.line.me/' + process.env.SPOT + '/idlink?shop_code=' + this.editedItem.shop.shopCode;
      }
      try {
        axios.get(`${process.env.API}/aec/checkShopCodeAndSalesChannel`, {
          params: {
            token: process.env.INFO_TOKEN,
            shopCode: this.editedItem.shop.shopCode,
            userId: this.editedItem.userId,
            salesChannel: channel,
          }
        }).then(response => {
          if (!response.data.result) {
            this.alertMessage = `ID連携を実行する前に [保存] を実行してください。`;
            this.alert = true;
            return;
          }
          this.userQRCode = `${process.env.API}/qrcode?size=300&link=${this.userQRUrl}`
          this.dialogQR = true;
        })
      }
      catch(error){
        console.log(error);
        this.alertMessage = error.message;
        this.alert = true;
        return;
      };
    },
    //QRコードのpdf出力
    outputPDF() {
      var doc = new jsPDF();
      doc.addImage(this.userQRCode, "JPEG", 15, 40, 180, 180);
      doc.save();
    },
    closeQR() {
      this.dialogQR = false;
    },
    salesChannelChangeHandler () {
      const oldVal = [...this.salesChannel]
      const newVal = [...this.editedItem.salesChannel];

      if (!newVal.includes('1')) {
        this.editedItem.active = 0;
      }

      if (!newVal.includes('2')) {
        this.editedItem.purchase = 0;
      }

      if (newVal.includes('1') && !oldVal.includes('1')) {
        this.editedItem.active = 1;
      }

      if (newVal.includes('2') && !oldVal.includes('2')) {
        this.editedItem.purchase = 1;
      }

      this.salesChannel = [...newVal];
    },
    trimValue(value) {
      if (value != null && value != undefined) {
        if (!value.trim()) {
          return null
        }

        return value.trim()
      }


      if (value == undefined) {
        return null
      }

      return value;
    }
  },
}
</script>
