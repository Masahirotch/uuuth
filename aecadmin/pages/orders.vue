<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">受注一覧</v-toolbar-title>
        <v-divider class="mx-2" inset vertical></v-divider>
        <v-btn-toggle v-model="select.salesChannel" :items="columnValueList('salesChannel')" borderless dense color="#ffffff" mandatory>
          <IconSet iconType="channel" :iconNumber="Number(0)" :isActive="select.salesChannel == 0" />
          <IconSet iconType="channel" :iconNumber="Number(1)" :isActive="select.salesChannel == 1" />
          <IconSet iconType="channel" :iconNumber="Number(2)" :isActive="select.salesChannel == 2" />
          <IconSet iconType="channel" :iconNumber="Number(3)" :isActive="select.salesChannel == 3" />
        </v-btn-toggle>
        <v-divider class="mx-2" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-menu v-model="MonthPicker" :close-on-content-click="false" min-width="auto">
          <template v-slot:activator="{on}">
            <v-text-field v-model="select.orderDate" label="受注月" prepend-icon="mdi-calendar-multiselect" v-on="on" readonly hide-details dense clearable class="mr-5"></v-text-field>
          </template>
          <v-date-picker v-model="select.orderDate" type="month" locale="ja-jp" no-title multiple></v-date-picker>
        </v-menu>
<!--★★　丸長向けカスタマイズ：ステータス非表示
        <v-select v-model="select.status" label="ステータス" :items="selects.status" item-text="text" item-value="value" return-object hide-details dense multiple clearable></v-select>
        <v-divider class="mx-2" inset vertical></v-divider>
★★-->
        <v-menu v-if="Number(select.salesChannel) == 0" :close-on-content-click="false" min-width="auto">
          <template v-slot:activator="{on}">
            <v-text-field v-model="select.preferred" label="配達希望月" prepend-icon="mdi-calendar" v-on="on" readonly hide-details dense clearable></v-text-field>
          </template>
          <v-date-picker v-model="select.preferred" type="month" locale="ja-jp" no-title multiple></v-date-picker>
        </v-menu>
        <Icon v-if="Number(select.salesChannel) == 0" @btnClick="getOrders" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="Boolean(true)" />
        <v-spacer v-if="Number(select.salesChannel) == 0"></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details clearable dense class="mb-2"></v-text-field>
        <v-spacer></v-spacer>
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-data-table v-model="selected" :headers="getDataTableHeader(Number(select.salesChannel))" :items="filteredOrders" item-key="orderId" :loading="loading" class="elevation-1" :search="search" no-data-text="データがありません。" no-results-text="データがありません。" ref="table" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" show-select dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
            <tr v-if="Number(select.salesChannel) == 0"> <!-- Channel B2B -->
              <td class="d-flex justify-center">
                <v-btn-toggle v-model="selectAction" @change="btnSelect" borderless dense multiple>
<!--★★ Custom for No.204
                  <IconSet iconType="task" :iconNumber="Number(1)" />
                  <IconSet iconType="task" :iconNumber="Number(2)" />
                  <IconSet iconType="task" :iconNumber="Number(8)" />
★★-->
                  <IconSet iconType="task" :iconNumber="Number(16)" />
                </v-btn-toggle>
              </td>

              <!--<td><v-select v-model="filters.todo" :items="columnValueList('todo', true)" hide-details dense multiple clearable></v-select></td> the request of no.195-->
              <!-- <td><v-select v-model="filters.status" :items="selects.status" item-text="text" item-value="value" return-object hide-details dense multiple clearable></v-select></td> -->
              <td><v-select v-model="filters.isDownloaded" :items="['ダウンロード済み', '未ダウンロード']" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderId" :items="columnValueList('orderId')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderDate" :items="columnValueList('orderDate')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderTime" :items="getArrayOf24hoursTimezone()" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.shopCode" :items="columnValueList('shopCode')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.shopName" :items="columnValueList('shopName')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.userName" :items="columnValueList('userName')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.closing" :items="getArrayOf24hoursTimezone()" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.preferred" :items="columnValueList('preferred')" hide-details dense multiple clearable></v-select></td>
              <td></td>
            </tr>
            <tr v-else-if="Number(select.salesChannel) == 1"> <!-- Channel B2B Spot -->
              <td class="d-flex justify-center">
                <v-btn-toggle v-model="selectAction" @change="btnSelect" borderless dense multiple>
                  <IconSet iconType="task" :iconNumber="Number(16)" />
                </v-btn-toggle>
              </td>
              <td><v-select v-model="filters.isDownloaded" :items="['ダウンロード済み', '未ダウンロード']" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderId" :items="columnValueList('orderId')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderDate" :items="columnValueList('orderDate')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderTime" :items="getArrayOf24hoursTimezone()" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.shopCode" :items="columnValueList('shopCode')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.shopName" :items="columnValueList('shopName')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.userName" :items="columnValueList('userName')" hide-details dense multiple clearable></v-select></td>
            </tr>
            <tr v-else> <!-- Channel B2C -->
              <td class="d-flex justify-center">
                <v-btn-toggle v-model="selectAction" @change="btnSelect" borderless dense multiple>
                  <IconSet iconType="task" :iconNumber="Number(16)" />
                </v-btn-toggle>
              </td>
              <td><v-select v-model="filters.isDownloaded" :items="['ダウンロード済み', '未ダウンロード']" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.status" :items="selects.status" item-text="text" item-value="value" return-object hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderId" :items="columnValueList('orderId')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderDate" :items="columnValueList('orderDate')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.orderTime" :items="getArrayOf24hoursTimezone()" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.userName" :items="columnValueList('userName')" hide-details dense multiple clearable></v-select></td>
            </tr>
          </tbody>
        </template>
        <!-- 選択 -->
        <template v-slot:[`header.data-table-select`]>選択</template>
        <template v-slot:[`item.data-table-select`]="{item, isSelected, select}">
          <v-simple-checkbox :value="isSelected" @input="select($event)"></v-simple-checkbox>
        </template>
        <!-- 処理 -->
        <!-- <template v-slot:[`item.todo`]="{item}">
          <div class="text-truncate">
            <IconSet iconType="task" :iconNumber="Number(item.todo.value)" />
          </div>
        </template> -->
        <!-- 受注経路 -->
        <!-- <template v-slot:[`item.salesChannel`]="{item}">
          <div class="text-truncate">
            <IconSet v-for="c in item.salesChannel" :key="c" iconType="channel" :iconNumber="Number(c)" />
          </div>
        </template> -->
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate">
            <Icon @btnClick="showItem(item.orderId)" iconName="mdi-list-box-outline" iconTooltip="詳細を表示" />
          </div>
        </template>
        <!-- CSV出力 -->
        <template v-slot:[`item.isDownloaded`]="{item}">
          <div class="text-truncate d-flex justify-center">
            <span v-if="!item.isDownloaded" style="border: 2px solid #898989; color: #898989; border-radius: 50%; font-size: smaller; font-weight: 600; padding: 0px 3px; cursor: pointer;">未</span>
          </div>
        </template>
        <!-- ダイアログ -->
        <template v-slot:top>
          <!-- 受注詳細ダイアログ -->
          <v-dialog v-model="dialogDetail" persistent max-width="1366px">
            <v-card>
              <v-form ref="form">
                <v-card-title>
                  <v-toolbar>
                    <v-toolbar-title>受注詳細</v-toolbar-title>
                  </v-toolbar>
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col>
                      <v-data-table :headers="getDataTableHeaderDetail(Number(select.salesChannel))" :items="[orderDetail]" :loading="loading" class="elevation-1" :footer-props="{itemsPerPageOptions: [-1]}" hide-default-footer>
                      </v-data-table>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-data-table :headers="detailHeaders" :items="orderDetail.cart" :loading="loading" class="elevation-1" :footer-props="{itemsPerPageOptions: [-1]}" hide-default-footer>
                      </v-data-table>
                    </v-col>
                  </v-row>
                  <v-row v-if="retail" dense class="d-flex justify-end">
                    <div class="d-flex flex-column">
                      <v-col class="d-flex justify-end">
                        <small>小計{{tax}}</small><small class="ml-3">{{orderDetail.cartPrice}}</small>
                      </v-col>
                      <v-col class="d-flex justify-end">
                        <small>送料{{tax}}</small><small class="ml-3">{{orderDetail.shippingFee}}</small>
                      </v-col>
                      <v-col class="d-flex justify-end">
                        <small>合計{{tax}}</small><small class="ml-3">{{orderDetail.payment}}</small>
                      </v-col>
                      <v-col class="d-flex justify-end">
                        <small>決済ＩＤ</small><small class="ml-3">{{orderDetail.orderStripeId}}</small>
                      </v-col>
                    </div>
                  </v-row>
                  <v-row v-if="retail" dense>
                    <v-expansion-panels multiple>
                      <v-expansion-panel>
                        <v-expansion-panel-header class="text-h6">配送情報</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-row align="center" dense class="mb-5">
                            <v-col cols="2">
                              <v-text-field v-model="orderDetail.address.name" label="お届け先名" hide-details clearable dense></v-text-field>
                            </v-col>
                            <v-col cols="3" class="mt-4">
                              <v-row no-gutters dense>
                                <v-col cols="3">
                                  <v-text-field v-model="orderDetail.address.tel1" label="電話番号" clearable type="number" hide-spin-buttons dense></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                  <v-text-field v-model="orderDetail.address.tel2" prepend-icon="mdi-minus" clearable type="number" hide-spin-buttons dense></v-text-field>
                                </v-col>
                                <v-col cols="5">
                                  <v-text-field v-model="orderDetail.address.tel3" prepend-icon="mdi-minus" clearable type="number" hide-spin-buttons dense></v-text-field>
                                </v-col>
                              </v-row>
                            </v-col>
                            <v-col cols="2">
                              <v-select v-model="orderDetail.preferredTime" label="お届け時間帯" :items="preferredTimes" item-text="text" item-value="value" return-object hide-details clearable dense></v-select>
                            </v-col>
                            <v-col cols="2">
                              <v-text-field v-model="orderDetail.shipNumber" label="伝票番号" hide-details clearable dense></v-text-field>
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="btnUpdate">更新</v-btn>
                          </v-row>
                          <v-row>
                            <v-col cols="9">
                              <AddressInput :address="orderDetail.address" :isInOrderDetail="true" ref="refAddress"></AddressInput>
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel>
                        <v-expansion-panel-header class="text-h6">LINE通知</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-row dense>
                            <v-col cols="10">
                              <v-textarea v-model="lineMessage" label="テキスト" outlined auto-grow rows=6 counter :rules="[size(500)]" clearable dense>
                              </v-textarea>
                            </v-col>
                            <v-spacer><Icon @btnClick="btnTemplate" iconName="mdi-card-text-outline" iconTooltip="発送完了の定型文を入力" /></v-spacer>
                            <v-btn color="primary" @click="btnMail">LINE通知</v-btn>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-row>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="close">閉じる</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
        </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
      <!-- 処理とステータス変更 -->
      <v-row dense>
        <v-col cols="9">
          <v-btn @click="btnPicking"><v-icon left>{{icons["task"][1].icon}}</v-icon>{{icons["task"][1].text}}</v-btn>
          <v-btn @click="btnCsv"><v-icon left>{{icons["task"][2].icon}}</v-icon>{{icons["task"][2].text}}</v-btn>
          <v-btn @click="btnCsvCustomized" v-if="[2, 3].includes(+select.salesChannel) && icons['task'][32].text"><v-icon left>{{icons["task"][32].icon}}</v-icon>{{icons["task"][32].text}}</v-btn>
          <v-btn @click="importShippingList" v-if="[2, 3].includes(+select.salesChannel)"><v-icon left>{{icons["task"][4].icon}}</v-icon>{{icons["task"][4].text}}</v-btn>
          <v-btn @click="Shipped" v-if="[2, 3].includes(+select.salesChannel)"><v-icon left>{{icons["task"][8].icon}}</v-icon>{{icons["task"][8].text}}</v-btn>
        </v-col>
        <v-col cols="1" align="right" v-if="[2, 3].includes(+select.salesChannel)">
          <Icon @btnClick="changeStatusConfirm" iconName="mdi-list-status" iconTooltip="チェックした行のステータスを変更" />
        </v-col>
        <v-col cols="2" v-if="[2, 3].includes(+select.salesChannel)">
          <v-select v-model="status"
            label="ステータス変更"
            :items="selects.status"
            item-text="text"
            item-value="value"
            outlined hide-details dense clearable></v-select>
        </v-col>
        <!-- 処理結果ダイアログ -->
        <template>
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
          <!-- confirm send LINE message -->
          <v-dialog v-model="dialogSendLineMessage" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">{{ sendLineConfirmMessage }}</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="sendLineMessage">はい</v-btn>
                <v-btn color="primary" @click="closeDialogSendLineMessage">いいえ</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <!-- send message -->
        <template>
          <Message :dialogSendMessage.sync="dialogSendMessage" :orders.sync="selected" @on-success="alertSuccessMessage"></Message>
        </template>
        <ImportShippingList v-if="isShowUploadShippingList" v-on:afterImport="closeModalImport" :show-form-upload="isShowUploadShippingList"></ImportShippingList>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';
import AddressInput from "../components/AddressInput.vue";
import ImportShippingList from "../components/ImportShippingList.vue";
import Message from '../components/Message.vue';
import config from "../constants/config.js";
import { commonData } from "../mixin/CommonData";

const LINE_TYPE = {
  SHIPPED: 1, // in list order screen
  BTN_MAIL: 2, // in order detail screen
}

export default {
  name: 'OrdersPage',
  components: {
    ImportShippingList,
    Message,
    AddressInput
  },
  mixins: [commonData],
  data: () => ({
    //ログイン中
    loggedin: false,
    //受注情報一覧
    orders: [],
    //選択されたデータ
    selected: [],
    //ダウンロード中プログレスバー表示
    loading: false,
    isShowUploadShippingList: false,
    //一覧テーブルヘッダ
    headers: [
      {text: '', value: 'data-table-select', sortable: false, filterable: false, align: 'center', width: '5%'},
      // {text: '次作業', value: 'todo', sortable: false, align: 'center', width: '5%'},  --> the request of no.195
      {text: 'CSV出力', value: 'isDownloaded', width: '7%'},
      {text: 'ステータス', value: 'status.text', width: '10%'},
      {text: '受注ID', value: 'orderId', width: '6%'},
      {text: '受注日', value: 'orderDate', width: '10%'},
      {text: '受注時間', value: 'orderTime', width: '10%'},
      {text: '店舗コード', value: 'shopCode', width: '8%', filterable: false, sortable: false},
      {text: '受注店舗', value: 'shopName', width: '10%', filterable: false, sortable: false},
      {text: '発注者', value: 'userName', width: '10%', filterable: false, sortable: false},
      {text: '締め時間', value: 'closing', width: '7%',},
      {text: '配達希望日', value: 'preferred', width: '8%'},
      {text: '注文メモ', value: 'orderMemo', filterable: false, sortable: false, width: '15%'},
      {text: '販売先(アプリ)', value: 'appName', filterable: false, sortable: false, width: '22%'},
      {text: '伝票番号', value: 'shipNumber', filterable: false, sortable: false},
      {text: '詳細', value: 'action', sortable: false, filterable: false, align: 'end', width: '5%'},
    ],
    //抽出条件の選択肢
    selects: {
      orderDate: [],
      status: [
        {value: 'new', text: '新規受注'},
        {value: 'wait', text: '出荷待ち'},
        {value: 'sent', text: '出荷済み'},
        {value: 'comp', text: '通知済み'},
        {value: 'cancel', text: 'キャンセル'},
      ],
    },
    //抽出条件
    select: {
      orderDate: [],
      salesChannel: "0",
      status: [],
      preferred: [],
    },
    MonthPicker: false,
    //フィルター
    filters: {
      //todo: [], --> the request of no.195
      isDownloaded: [],
      status: [],
      orderId: [],
      orderDate: [],
      orderTime: [],
      shopCode: [],
      shopName: [],
      userName: [],
      closing: [],
      preferred: [],
    },
    actionSelect: '',
    //検索値
    search: '',
    //選択
    selectAction: [],
    //受注情報詳細
    orderDetail: {},
    //詳細テーブルヘッダ
    detailHeaders: [
      {text: '商品コード', value: 'code', sortable: false},
      {text: '商品名', value: 'name', sortable: false},
      {text: '単価', value: 'price', align: 'end', sortable: false},
      {text: '数量', value: 'quantity', align: 'end', sortable: false},
      // {text: '価格', value: 'payment', align: 'end', sortable: false},
      {text: '金額', value: 'amount', align: 'end', sortable: false},
    ],
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
    //LINE通知メッセージ
    lineMessage: '',
    size: len => v => (v || '').length <= len || `${len}文字以内です`,
    //作業項目
    todoMask1: {new: 0b0011, wait: 0b0110, sent: 0b1000, comp: 0b0000, cancel: 0b0000},
    todoMask2: {3: 0b0001, 6: 0b0010},
    //受注経路
    BtoB: config.BtoB,
    BtoBspot: config.BtoBspot,
    BtoC: config.BtoC,
    BtoBtoC: config.BtoBtoC,
    retail: true,
    //変更するステータス
    status: '',
    //詳細表示ダイアログ
    dialogDetail: false,
    //アラートダイアログ
    alert: false,
    alertMessage: '',
    dialogSendMessage: false,
    //配送先情報の初期値
    defaultAddress: {
      zip: '',
      perf: '',
      street: '',
      city: '',
      address: '',
      addition: null,
      tel1: null,
      tel2: null,
      tel3: null,
      name: '',
      prefCode: null
    },
    //送り状CSVヘッダー（ヤマトB2用）
    B2cloudFields : [
      'order_id'      ,
      'deliv_date'    ,
      'deliv_time'    ,
      'type'          ,
      'cool_flg'      ,
      'tel'           ,
      'name'          ,
      'zip'           ,
      'address'       ,
      'building'      ,
      'honor'         ,
      'seller_code'   ,
      'seller_name'   ,
      'seller_tel'    ,
      'seller_zip'    ,
      'seller_address',
    ],
    dialogSendLineMessage: false,
    sendLineType: 0,
    sendLineConfirmMessage: '',
  }),

  computed: {
    //フィルタリングされた受注情報一覧
    filteredOrders() {
      this.selected = [];
      this.selectAction = [];
      return this.orders.filter(tbl => {
        return Object.keys(this.filters).every(col => {
          //this.filters[col]: フィルターで指定された値(配列), tbl[col]: データ行に含まれる値
          if (col == 'status') { //ステータス
            return this.filters[col].length < 1 || this.filters[col].findIndex(e => e.text === tbl[col].text) !== -1;
          // } else if(col == 'salesChannel') { //販売経路(ボタンでフィルタリング)
          //   return this.filters[col].length < 1 || !!(this.filters[col].filter(e => tbl[col].indexOf(Number(e)) !== -1)).length;
          } else if(Object.prototype.toString.call(tbl[col]) === "[object Object]") { //オンオフ項目
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col].text);
          } else if (col == 'isDownloaded') {
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col] ? 'ダウンロード済み' : '未ダウンロード');
          } else if (col == 'closing' || col == 'orderTime') {
            return this.filters[col].length < 1 || this.filters[col].includes(`${tbl[col].substr(0,2)}:00`);
          } else {
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col]);
          }
        });
      });
    },

    canShowSpotOrderStatus () {
      return process.env.CAN_SHOW_SPOT_ORDER_STATUS === "true";
    },
  },

  created() {
    //税区分の表示設定
    // this.headers[this.headers.findIndex(v => v.text === '受注額')].text += config.tax;
    this.detailHeaders[this.detailHeaders.findIndex(v => v.text === '単価')].text += config.tax;
    this.detailHeaders[this.detailHeaders.findIndex(v => v.text === '金額')].text += config.tax;
    this.orderDetail.address = JSON.parse(JSON.stringify(this.defaultAddress))
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
    //受注情報一覧の取得
    this.getOrders();
  },

  watch: {
    'select.salesChannel': function (val) {
      this.getOrders();
    },
    'select.orderDate': function (val) {
      if (Number(this.select.salesChannel) != 0) {
        this.getOrders();
      }
    },
  },

  methods: {
    //指定された作業のチェック状態を変更する
    btnSelect() {
      let todo = [1, 2, 8];
      if (this.selectAction.includes("16")) {
        this.selected = this.filteredOrders
      } else {
        this.selected = []
        for(let action = 0; action < todo.length; action++) {
          if(this.selectAction.includes(String(todo[action]))) { //チェックを付ける
            let filtered = this.$refs.table.$children[0].filteredItems;
            filtered.forEach((item) => {
              if(item.todo.value == todo[action]) {
                if(this.selected.findIndex(v => v.orderId == item.orderId) === -1) {
                  this.selected.push(item);
                }
              }
            });
          } else { //チェックを外す
            for(let i = this.selected.length - 1; i >= 0; i--) {
              if(this.selected[i].todo.value == todo[action]) this.selected.splice(i, 1);
            }
          }
        }
      }
    },
    //受注情報一覧の取得
    getOrders() {
      //抽出条件の準備
      if(Array.isArray(this.select.orderDate)) {
        if(!this.select.orderDate.length) {
          this.select.orderDate = null;
        }
      }
      if(Array.isArray(this.select.preferred)) {
        if(!this.select.preferred.length) {
          this.select.preferred = null;
        }
      }
      let params = {
        orderDate: this.select.orderDate ? this.select.orderDate : (this.select.preferred ? [] : [String(config.newest)]),
        salesChannel: [this.select.salesChannel],
        status: this.select.status.map((v) => v.value),
        preferred: this.select.preferred ? this.select.preferred : [],
      }
      //受注情報の取得
      this.loading = true;
      axios.get(`${process.env.API}/aec/orders?search=${JSON.stringify(params)}`)
        .then(response => {
          this.orders = [];
          response.data.orders.forEach((record) =>  {
            record.isDownloaded = record.todo >= 3;
            //作業アイコンを設定
            record.todo = {value: ~record.todo&this.todoMask1[record.status], text: !!(~record.todo&this.todoMask1[record.status]) ? '要' : '－'};
            if (record.todo.value in this.todoMask2) {record.todo.value = this.todoMask2[record.todo.value]}
            //ステータスの表示文字を設定
            let statusObject = this.selects.status.find(e => e.value === record.status);
            if (statusObject) {
              if (record.salesChannel.includes(0) || (record.salesChannel.includes(1) && !this.canShowSpotOrderStatus)) {
                record.status = {value: record.status, text: ''}
              } else {
                record.status = {value: record.status, text: statusObject.text}
              }
            }
            //締め時間を分までに
            record.closing = !!record.closing ? record.closing.substr(0, 5) : '';
            record.orderTime = !!record.orderDate ? record.orderDate.substr(11, 5) : '';
            record.orderDate = !!record.orderDate ? record.orderDate.substr(0, 10) : '';
            record.userName = [0,1].includes(Number(this.select.salesChannel)) && !!record.ordererName ? record.ordererName : record.userName;
            //レコード追加
            this.orders.push(record);
          })
          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
          this.orders = [];
          this.loading = false;
          return;
        });
    },
    //項目の値一覧
    columnValueList(col, obj=false) {
      if(obj) {
        let arr = this.orders.map(tbl => tbl[col].text);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        let arr = this.orders.map(tbl => tbl[col]);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    //受注詳細表示
    showItem(orderId) {
      this.loading = true
      let apiUrl = `${process.env.API}/aec/order?order=${orderId}&token=${process.env.INFO_TOKEN}`
      axios.get(apiUrl).then(response => {
        this.orderDetail = response.data.result.order;
        this.orderDetail.status = (this.selects.status.find(status => status.value === this.orderDetail.status)?.text || '新規受注');
        if (!this.orderDetail.address) {
          this.orderDetail.address = Object.assign({}, this.defaultAddress)
        }
        this.orderDetail.preferredTime = this.preferredTimes.find(p => p.value === this.orderDetail.preferredTime)
        if(!this.orderDetail.preferredTime) {
          this.orderDetail.preferredTime = null
        }
        this.orderDetail.orderDatetime = this.orderDetail.orderDate;
        this.orderDetail.orderTime = this.orderDetail.orderDate?.substr(11, 5) ?? '';
        this.orderDetail.orderDate = this.orderDetail.orderDate?.substr(0, 10) ?? '';
        this.orderDetail.preferred = this.orderDetail.preferredDate;
        this.retail = this.orderDetail.salesChannel.includes(2) || this.orderDetail.salesChannel.includes(3);
        this.lineMessage = '';
        this.loading = false;
        this.dialogDetail = true;
      }).catch(() => {
        this.orderDetail = {};
        this.lineMessage = '';
        this.loading = false;
        return;
      });
    },
    //受注情報更新
    btnUpdate() {
      this.orderDetail.preferredTime = this.orderDetail.preferredTime ? this.orderDetail.preferredTime : this.preferredTimes[0]
      let record = {orderId: this.orderDetail.orderId, shipNumber: this.orderDetail.shipNumber, arrivalDay: this.orderDetail.arrivalDay, preferredTime: this.orderDetail.preferredTime.value, consumerId: this.orderDetail.userLine, ...this.$refs.refAddress['address']};
      axios.post(`${process.env.API}/aec/updateOrderAddress`, { token: process.env.INFO_TOKEN, data: record })
      .then(response => {
        this.alertMessage = '配送情報を更新しました。';
        this.alert = true;
      })
      .catch(error => {
        this.showAlertMessage(err.message)
      });
    },
    //配送完了ひな型の準備
    btnTemplate() {
      const orderNo = (this.orderDetail.app?.app_code ? `${this.orderDetail.app?.app_code}-${this.orderDetail.orderId}` : this.orderDetail.orderId);
      const shipNo = !!this.orderDetail.shipNumber ? this.orderDetail.shipNumber : '********';
      let cartPriceDetail = '';
      this.orderDetail.cart.forEach((cart) => {
        const msg = `${cart.name}　${this.numberFormat(cart.price)}円×${cart.quantity}個 小計：${this.numberFormat(cart.amount)}円\n`
        cartPriceDetail += msg;
      });

      const cartPriceTotal = `【送料：${this.numberFormat(this.orderDetail.shippingFee)}円/合計金額：${this.orderDetail.payment}円】`;

      this.lineMessage = `発送完了のお知らせ

注文番号「${orderNo}」の商品を本日発送いたしました。

発送の伝票番号は
「${shipNo}」
となります。

注文内容
${cartPriceDetail}
${cartPriceTotal}

下記のリンクより配送状況を確認できます。
https://toi.kuronekoyamato.co.jp/cgi-bin/tneko

「発送完了のお知らせ」メッセージ配信直後などはご注文いただいた商品の配送状況が「伝票番号未登録」表示となっている場合がございます。
ヤマト運輸の配送状況によっては伝票番号の反映までに数時間から1日ほどお時間がかかる場合がございます。
予めご了承ください。`;
    },
    //LINE通知
    btnMail() {
      this.dialogSendLineMessage = true;
      this.sendLineType = LINE_TYPE.BTN_MAIL;
      this.sendLineConfirmMessage = '発注者宛にLINE通知を送信します。よろしいですか？';
      return true;
    },
    //ダイアログを閉じる
    close() {
      this.dialogDetail = false;
      this.status = false
      this.selected = []
    },
    closeAlert() {
      this.alert = false;
    },
    //----- 受注伝票の操作とステータスの変更 -----
    //ピッキングリスト出力
    btnPicking() {
      //check length selected checkbox
      if( this.selected.length == 0 ){
          this.showAlertMessage('出力対象が選択されていません。');
          return;
      }
      const ids = this.selected.map(order => order.orderId)
      this.getSelectedOrders(ids).then(orders => {
        this.selected = orders
        this.printPickingDocument()
      })
    },
    //ピッキングリスト作成
    printPickingDocument(){
      const picking = this.createPickingJson()
      this.printDialog( picking )
    },
    createPickingJson( dataPicking ){
      // console.log(this.selected);return;
      var dataPicking = this.selected;
      return dataPicking.map(function(order){
        var products = '';
        order.carts.map( p => {
          products += `<p style="font-weight:bold;">${p.productName} × ${p.quantity}</p>`
        });
        let app = order?.app || null
        let orderId = app?.app_code || '';
        return {
          app_name       : order?.app_name || '',
          order_id       : orderId ? (orderId + '-' + order.orderId) : order.orderId,
          order_date     : order.orderDate,
          products       : products
        }
      })
    },
    // ピッキングリスト印刷（印刷ダイアログの表示）
    async printDialog( picking ){
      this.status = 'wait';
      var now = this.$dayjs().format('YYYY/MM/DD HH:mm')
      if (typeof window !== 'undefined') {
        // use print-js here
        const printJS = await import('print-js');
        let focuser = setInterval(() => window.dispatchEvent(new Event('focus')), 500);
        printJS.default({
          printable : picking,
          properties: [
            { field: 'app_name'  , displayName: '<span>店舗名</span>' },
            { field: 'order_id'  , displayName: '<span>受注番号</span>' },
            { field: 'order_date', displayName: '<span>受注日</span>' },
            { field: 'products'  , displayName: '<span>受注内容</span>' },
          ],
          type: 'json',
          gridHeaderStyle: 'color: #000000;  border: 1px solid #000000;',
          gridStyle: 'border: 1px solid #000000;padding:0.5em;font-size:12px;',
          header: `<h3 class="custom-h3">ピッキング指示書 [ ${now} ] </h3>`,
          style: '.custom-h3 { color: #000; }',
          font_size : '12px',
          onPrintDialogClose : this.printDialogClose(focuser)
        })
      }
    },
    printDialogClose(focuser){
      const ids = this.selected.map(order => order.orderId)
      axios.post(`${process.env.API}/aec/updatePickingList`, {
        token: process.env.INFO_TOKEN,
        ids
      })
      .then (response => {
        this.selected.forEach(order => {
          order.todo[0] = 1
        })
        this.changeStatus()
      })
      .catch (err => {
        clearInterval(focuser);
        this.showAlertMessage(err.message)
      })
    },
    //伝票CSV出力
    btnCsv() {
      // Check length selected checkbox
      if( this.selected.length == 0 ){
        this.showAlertMessage('出力対象が選択されていません。');
        return;
      }
      const ids = this.selected.map(order => order.orderId)
      this.getDataCSV(ids)
    },
    //伝票CSVデータ取得
    getDataCSV(ids) {
      const url = `${process.env.API}/aec/download/ordersCsv?token=${process.env.INFO_TOKEN}&id=${ids.join(',')}`;
      window.open(url)
    },
    //発送リスト取込
    importShippingList() {
        this.isShowUploadShippingList = true
    },
    closeModalImport(value) {
        this.isShowUploadShippingList = false
        if(value.message.length > 0){
          this.showAlertMessage(value.message);
        }
    },
    //出荷済LINE通知
    Shipped() {
      if (!this.selected.length) {
        this.showAlertMessage('通知対象が選択されていません。')
        return false;
      }
      this.dialogSendLineMessage = true;
      this.sendLineType = LINE_TYPE.SHIPPED;
      this.sendLineConfirmMessage = 'チェックされた受注の発注者宛に、出荷済のLINE通知を送信します。よろしいですか？';
      return true;
    },
    //カスタマイズされたCSVダウンロード処理
    btnCsvCustomized() {
      // Check length selected checkbox
      if( this.selected.length == 0 ){
        this.showAlertMessage('出力対象が選択されていません。');
        return;
      }
      const ids = this.selected.map(order => order.orderId)
      this.getDataCSVCustomized(ids)
    },
    //カスタマイズされたCSVデータ取得
    getDataCSVCustomized(ids) {
      const url = `${process.env.API}/aec/download/ordersCsv?token=${process.env.INFO_TOKEN}&id=${ids.join(',')}`;
      window.open(url)
    },
    //ステータス変更の確認
    changeStatusConfirm () {
      // 更が選択されていない
      if(!this.status) {
        this.showAlertMessage('変更内容が選択されていません。');
        return;
      }
      //変更対象がない
      if (!this.selected.length) {
        this.showAlertMessage('変更の対象が選択されていません。');
        return;
      }
      //変更対象リストの作成
      const ids = this.selected.map(order => order.orderId)
      this.getSelectedOrders(ids).then(orders => {
        this.selected = orders
        const activeStatus = this.getActiveStatus()
        // 選択した変更先と現在のアクティブステータスが同じ
        if (activeStatus.includes(this.status)) {
          this.showAlertMessage('選択中の受注データのステータスと変更先のステータスが同一です。');
          return;
        }
        // 発送済みへの変換は、伝票番号登録済み条件
        if (['wait', 'sent', 'comp'].includes(this.status)) {
          const notExportListOrder = this.selected.filter(order => order.todo[0] == 0)
          if (notExportListOrder.length > 0) {
            this.showAlertMessage(`ピッキングリストが出力されていない注文は${this.selects.status.find(v => v.value === this.status).text}に変更できません。`);
            return;
          }
        }
        // 伝票CSV出力と伝票番号登録のチェック
        if (['sent', 'comp'].includes(this.status)) {
          // 伝票CSVが出力されていない注文は、出荷済み・通知済みに変更できない
          const notExportCsvOrders = this.selected.filter(order => order.todo[1] == 0)
          if (notExportCsvOrders.length > 0) {
            this.showAlertMessage(`伝票CSVが出力されていない注文は${this.selects.status.find(v => v.value === this.status).text}に変更できません。`);
            return;
          }
          // 発送済みへの変換は、伝票番号の入力が条件
          const notShipNumberOrders = this.selected.filter(order => !order.shipNumber)
          if(notShipNumberOrders.length > 0) {
            this.showAlertMessage('伝票番号のない受注は出荷済みに変更できません。');
            return;
          }
        }
        // キャンセルへの変更
        if (this.status == 'cancel') {
          const notNewOrders = this.selected.filter(order => order.status != 'new')
          if (notNewOrders.length > 0) {
            //show Alert
            this.showAlertMessage('キャンセルへの変更は、新規受注の場合のみ可能です。');
            return;
          }
        }
        // 通知済みへの変換は、通知済フラグが条件
        if (this.status == 'comp') {
            const notSentMailOrders = this.selected.filter(order => order.todo[3] == 0)
            if (notSentMailOrders.length > 0) {
              this.showAlertMessage('LINE未通知の受注は通知済みにできません。');
              return;
            }
        }
        // ステータス変更の実行
        this.changeStatus();
      })
    },
    //ステータス変更
    changeStatus () {
      axios.post(`${process.env.API}/aec/changeStatus`, {
        token: process.env.INFO_TOKEN,
        orders: this.selected,
        status: this.status
      })
      .then (response => {
        const { message } = response.data
        this.getOrders()
        this.showAlertMessage(message);
      })
      .catch (error => {
        //show Alert Message
        this.showAlertMessage(err.message);
      })
    },
    // ステータス一括変更の変更条件を満たしていない場合のアラート
    showAlertMessage(message) {
      this.alertMessage = message
      this.alert = true
    },
    // on item selected event
    getActiveStatus () {
      const statuses = this.selected.map(order => order.status)
      return [...new Set(statuses)]
    },
    //出荷済のLINE通知を完了
    alertSuccessMessage () {
      this.dialogSendMessage = false
      this.alertMessage = '出荷済のLINE通知をしました';
      this.alert = true;
    },
    // 通知対象の受注データを取得
    getSelectedOrders (ids) {
      return axios.get(`${process.env.API}/aec/getSelectedOrders?token=${process.env.INFO_TOKEN}&ids=${ids.join(',')}`)
      .then(response => {
        return response.data.orders
      }).catch(err => {
        console.log(err.message)
      })
    },
    numberFormat: function (value) {
      return new Intl.NumberFormat("ja-JP").format(value);
    },
    // send LINE message
    sendLineMessage () {
      if (this.sendLineType === LINE_TYPE.SHIPPED) {
        const ids = this.selected.map(order => order.orderId)
        this.getSelectedOrders(ids).then(orders => {
          this.selected = orders
          this.dialogSendMessage = true
        })
      } else if (this.sendLineType === LINE_TYPE.BTN_MAIL) {
        const content = {
          type: 'text',
          text: this.lineMessage
        }
        axios.post(`${process.env.API}/aec/sendLineMessage`, {
          token: process.env.INFO_TOKEN,
          content,
          receiver: this.orderDetail.userLine,
          order: this.orderDetail
        })
        .then (response => {
          this.alertMessage = 'LINE通知しました。';
          this.alert = true;
        })
        .catch (error => {
          this.showAlertMessage(error.message)
        })
      }
      this.closeDialogSendLineMessage();
    },
    closeDialogSendLineMessage () {
      this.dialogSendLineMessage = false;
      this.sendLineType = 0;
      this.sendLineConfirmMessage = '';
    },
    getDataTableHeader (type = 0) { // 0: b2b, 1: spot, 2: b2b, 3: b2b2c
      if (type == 0) { // B2B channel
        return this.headers.filter((item) => {
          return !['status.text', 'shipNumber', 'appName'].includes(item.value);
        });
      }
      if (type == 1) { // SPOT channel
        return this.headers.filter((item) => {
          return !['status.text', 'shipNumber', 'appName', 'closing', 'preferred', 'orderMemo'].includes(item.value);
        });
      }
      if (type == 2 || type == 3) { // B2C or B2B2C Channel
        return this.headers.filter((item) => {
          return !['shopCode', 'closing', 'preferred', 'orderMemo', 'shopName'].includes(item.value);
        })
      }
    },
    getDataTableHeaderDetail (type = 0) {
      if (type == 0) { // B2B channel
        return [
          {text: '受注ID', value: 'orderId', filterable: false, sortable: false},
          {text: '受注日', value: 'orderDate', filterable: false, sortable: false},
          {text: '時刻', value: 'orderTime', filterable: false, sortable: false},
          {text: '店舗コード', value: 'shopCode', filterable: false, sortable: false},
          {text: '受注店舗', value: 'shopName', filterable: false, sortable: false},
          {text: '発注者', value: 'ordererName', filterable: false, sortable: false},
          {text: '締め時間', value: 'closing', filterable: false, sortable: false},
          {text: '配達希望日', value: 'preferred', filterable: false, sortable: false},
          {text: '発注メモ', value: 'orderMemo', filterable: false, sortable: false},
          {text: undefined, value: undefined, filterable: false, sortable: false, width: '20%'}
        ]
      }
      if (type == 1) { // B2B SPOT channel
        return [
          {text: '受注ID', value: 'orderId', filterable: false, sortable: false},
          {text: '受注日', value: 'orderDate', filterable: false, sortable: false},
          {text: '時刻', value: 'orderTime', filterable: false, sortable: false},
          {text: '店舗コード', value: 'shopCode', filterable: false, sortable: false},
          {text: '受注店舗', value: 'shopName', filterable: false, sortable: false},
          {text: '発注者', value: 'ordererName', filterable: false, sortable: false},
          {text: undefined, value: undefined, filterable: false, sortable: false, width: '45%'}
        ]
      }
      if (type == 2 || type == 3) { // B2C or B2B2C Channel
        return [
          {text: '受注ID', value: 'orderId', filterable: false, sortable: false},
          {text: '受注日時', value: 'orderDatetime', filterable: false, sortable: false},
          {text: '発注者', value: 'userName', filterable: false, sortable: false},
          {text: 'ステータス管理', value: 'status', filterable: false, sortable: false},
          {text: undefined, value: undefined, filterable: false, sortable: false, width: '50%'}
        ]
      }
    },
    getArrayOf24hoursTimezone () {
      return Array.from({length: 24}, (_, index) => `${index < 10 ? '0' + index : index}:00`);
    }
  }
}
</script>
<style lang="scss" scoped>
.v-item-group {
  flex-wrap: wrap;
}
</style>
