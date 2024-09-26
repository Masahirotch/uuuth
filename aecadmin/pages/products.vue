<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">商品一覧</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-select v-if="useRetail" v-model="app" label="販売店（アプリ名）" :items="apps" item-text="app_name" item-value="app_id" return-object hide-details :readonly="fixedApp" :clearable="!fixedApp"></v-select>
        <v-divider v-if="useRetail" class="mx-2" inset vertical></v-divider>
        <v-combobox v-if="useGroup" v-model="group" label="商品グループ" :items="groups" hide-details clearable></v-combobox>
        <v-divider v-if="useGroup" class="mx-2" inset vertical></v-divider>
        <v-select v-model="productFlags" :items="[{value: 0, text: '通常商品'}, {value: 1, text: '削除済み商品'}]" label="商品区分" item-text="text" item-value="value" hide-details multiple clearable></v-select>
        <Icon @btnClick="getProducts" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="Boolean(true)" />
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details clearable dense></v-text-field>
        <Icon @btnClick="newItem" iconName="mdi-database-plus-outline" iconTooltip="新規商品を追加" :isText="Boolean(true)" />
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="filteredProducts" :loading="loading" class="elevation-1" :search="search" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
            <tr>
              <td><v-select v-model="filters.productId" :items="columnValueList('productId')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.productCode" :items="columnValueList('productCode')" hide-details dense multiple clearable></v-select></td>
              <td><v-combobox v-model="filters.productName" :items="columnValueList('productName')" hide-details dense multiple clearable></v-combobox></td>
              <td></td>
              <td></td>
              <td>
                <v-btn-toggle v-model="filters.salesChannel" borderless dense multiple>
                  <IconSet iconType="channelBit" :iconNumber="Number(1)" />
                  <IconSet iconType="channelBit" :iconNumber="Number(2)" />
                  <IconSet iconType="channelBit" :iconNumber="Number(4)" />
                  <IconSet iconType="channelBit" :iconNumber="Number(8)" />
                </v-btn-toggle>
              </td>
              <td><v-select v-model="filters.isOnsale" :items="columnValueList('isOnsale', true)" hide-details dense multiple clearable></v-select></td>
              <!-- <td><v-select v-model="filters.productPrice" :items="priceRange.text" hide-details dense multiple clearable></v-select></td> -->
              <td><v-select v-model="filters.quantity" :items="columnValueList('quantity', true)" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.period" :items="columnValueList('period', true)" hide-details dense multiple clearable></v-select></td>
              <td></td>
            </tr>
          </tbody>
        </template>
        <!-- 商品名 -->
        <template #item.productName="{value}">
          <div class="text-truncate" style="max-width: 200px">{{value}}</div>
        </template>
        <!-- 商品説明 -->
        <template #item.productDescription="{value}">
          <div class="text-truncate" style="max-width: 200px">{{value}}</div>
        </template>
        <!-- 商品画像 -->
        <template v-slot:[`item.productPhoto1`]="{item}">
          <div class="">
            <v-avatar
              color="warning lighten-2"
              size="40">
              <v-img v-if="item.productPhoto1" :src="item.productPhoto1" alt="productPhoto1"></v-img>
              <v-img v-else :src="dummy_thumb_image" alt="productPhoto1"></v-img>
            </v-avatar>
          </div>
        </template>
        <!-- 販売経路 -->
        <template v-slot:[`item.salesChannel`]="{item}">
          <div class="text-truncate">
            <IconSet v-for="(c, index) in item.salesChannel?.split(',')" :key="index" iconType="channelBit" :iconNumber="Number(c)" />
          </div>
        </template>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate">
            <Icon @btnClick="editItem(item)" iconName="mdi-pencil-outline" iconTooltip="編集" />
            <Icon v-if="!item.deleteFlg" @btnClick="deleteItem(item)" iconName="mdi-delete-outline" iconTooltip="削除" />
            <Icon v-else @btnClick="restoreItem(item)" iconName="mdi-restore" iconTooltip="復元" />
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
                  <v-card-text class="elevation-1">
                    <v-row dense>
                      <!-- 商品ID -->
                      <v-col cols="12" md="1">
                        <v-text-field v-model="editedItem.productId" label="商品ID" disabled ></v-text-field>
                      </v-col>
                      <!-- 商品コード -->
                      <v-col cols="12" md="2">
                        <v-text-field v-model="editedItem.productCode" label="商品コード" :rules="rule_required.concat(rule_productCodeLength)" clearable :disabled="readonlyDetail"></v-text-field>
                      </v-col>
                      <!-- 商品グループ -->
                      <v-col v-if="useGroup" cols="12" md="2">
                        <v-combobox v-model="editedItem.productGroup" label="商品グループ" :items="groups" clearable :disabled="readonlyDetail"></v-combobox>
                      </v-col>
                      <!-- 商品名 -->
                      <v-col cols="12" md="5">
                        <v-text-field v-model="editedItem.productName" label="商品名" :rules="rule_required" clearable :disabled="readonlyDetail"></v-text-field>
                      </v-col>
                      <!-- 販売中 -->
                      <v-col cols="12" md="2">
                        <v-switch v-model="editedItem.isOnsale" label="販売中" hide-details dense :disabled="readonlyDetail"></v-switch>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <!-- 販売経路 -->
                      <v-col cols="12" md="2">
                        <div small>販売経路</div>&emsp;
                        <v-btn-toggle v-model="editedItem.salesChannel" borderless multiple dense>
                          <IconSet iconType="channelBit" :iconNumber="Number(1)" :iconDisabled="readonlyDetail" />
                          <IconSet iconType="channelBit" :iconNumber="Number(2)" :iconDisabled="readonlyDetail" />
                          <IconSet iconType="channelBit" :iconNumber="Number(4)" :iconDisabled="readonlyDetail" />
                          <IconSet iconType="channelBit" :iconNumber="Number(8)" :iconDisabled="readonlyDetail" />
                        </v-btn-toggle>
                        <v-text-field height="0px" :rules="rule_channel" dense></v-text-field>
                      </v-col>
                      <!-- 時価 -->
                      <v-col cols="12" md="2">
                        <v-switch v-if="useProductPriceM" v-model="editedItem.productPriceM" hide-details dense :disabled="readonlyDetail">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(1)" /><IconSet iconType="channelBit" :iconNumber="Number(2)" />時価</template>
                        </v-switch>
                      </v-col>
                      <!-- BtoB価格 -->
                      <v-col v-if="BtoB" cols="12" md="2">
                        <v-text-field v-model="editedItem.productPriceB" :disabled="readonlyDetail || !editedItem.salesChannel.includes('1')" :rules="rule_price" @keydown="onKeydown" @change="onChange('productPriceB', 7, 9999999)" type="number" hide-spin-buttons class="has-label-with-icon">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(1)" />通常価格{{ tax }}</template>
                        </v-text-field>
                      </v-col>
                      <!-- スポット価格 -->
                      <v-col v-if="BtoBspot" cols="12" md="2">
                        <v-text-field v-model="editedItem.productPriceBS" :disabled="readonlyDetail || !editedItem.salesChannel.includes('2')" :rules="rule_price" @keydown="onKeydown" @change="onChange('productPriceBS', 7, 9999999)" type="number" hide-spin-buttons class="has-label-with-icon">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(2)" />スポット価格{{ tax }}</template>
                        </v-text-field>
                      </v-col>
                      <!-- BtoC価格 -->
                      <v-col v-if="BtoC" cols="12" md="2">
                        <v-text-field v-model="editedItem.productPriceC" :disabled="readonlyDetail || !editedItem.salesChannel.includes('4')" :rules="rule_price" @keydown="onKeydown" @change="onChange('productPriceC', 7, 9999999)" type="number" hide-spin-buttons class="has-label-with-icon">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(4)" />直販価格{{ tax }}</template>
                        </v-text-field>
                      </v-col>
                      <!-- BtoBtoC価格 -->
                      <v-col v-if="BtoBtoC" cols="12" md="2">
                        <v-text-field v-model="editedItem.productPriceBC" :disabled="readonlyDetail || !editedItem.salesChannel.includes('8')" :rules="rule_price" @keydown="onKeydown" @change="onChange('productPriceBC', 7, 9999999)" type="number" hide-spin-buttons class="has-label-with-icon">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(8)" />販売店価格{{ tax }}</template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <!-- 商品付加情報1 -->
                      <v-col v-if="optInfo.optInfo1" cols="12" md="2">
                        <v-select v-model="editedItem.optInfo1" :items="optInfo1" :label="optInfo.optInfo1" :disabled="readonlyDetail"></v-select>
                      </v-col>
                      <!-- 商品付加情報2 -->
                      <v-col v-if="optInfo.optInfo2" cols="12" md="2">
                        <v-select v-model="editedItem.optInfo2" :items="optInfo2" :label="optInfo.optInfo2" :disabled="readonlyDetail"></v-select>
                      </v-col>
                      <!-- 商品付加情報3 -->
                      <v-col v-if="optInfo.optInfo3" cols="12" md="2">
                        <v-select v-model="editedItem.optInfo3" :items="optInfo3" :label="optInfo.optInfo3" :disabled="readonlyDetail"></v-select>
                      </v-col>
                      <!-- 販売単位 -->
                      <v-col cols="12" md="2">
                        <v-select v-model="editedItem.unit" :items="units" label="販売単位" clearable :disabled="readonlyDetail"></v-select>
                      </v-col>
                      <!-- 配送サイズ -->
                      <v-col cols="12" md="2">
                        <v-select v-model="editedItem.size" :items="productSizes" label="配送サイズ" clearable :disabled="readonlyDetail"></v-select>
                      </v-col>
                      <!-- 税率 -->
<!-- custom for #13980 - No.203 -->
                      <!-- <v-col cols="12" md="1">
                        <v-select v-model="editedItem.taxRate" :items="taxRates" label="税率" :disabled="readonlyDetail"></v-select>
                      </v-col> -->
                    </v-row>
                    <v-row dense>
                      <!-- 商品概要 -->
                      <v-col v-if="BtoC||BtoBtoC" cols="12" md="6">
                        <v-text-field v-model="editedItem.productSubname" :disabled="readonlyDetail || !editedItem.salesChannel.includes('4') && !editedItem.salesChannel.includes('8')" clearable class="has-label-with-icon">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(4)" /><IconSet iconType="channelBit" :iconNumber="Number(8)" />商品概要</template>
                        </v-text-field>
                      </v-col>
                      <!-- 産地 -->
                      <v-col cols="12" md="2">
                        <v-text-field v-model="editedItem.productOrign" :disabled="readonlyDetail || !editedItem.salesChannel.includes('1')" clearable class="has-label-with-icon">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(1)" />商品産地</template>
                        </v-text-field>
                      </v-col>
                      <!-- 商品名タグ -->
                      <v-col cols="12" md="4">
                        <v-text-field v-model="editedItem.productTag" label="商品検索用タグ" clearable :disabled="readonlyDetail"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <!-- 商品詳細 -->
                      <v-col v-if="BtoBspot||BtoC||BtoBtoC" cols="12" md="6">
                        <v-textarea v-model="editedItem.productDetail" :disabled="readonlyDetail || !editedItem.salesChannel.includes('2') && !editedItem.salesChannel.includes('4') && !editedItem.salesChannel.includes('8')" outlined clearable counter no-resize class="has-label-with-icon">
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(2)" /><IconSet iconType="channelBit" :iconNumber="Number(4)" /><IconSet iconType="channelBit" :iconNumber="Number(8)" />商品詳細</template>
                        </v-textarea>
                      </v-col>
                      <!-- 基本画像 -->
                      <v-col cols="12" md="2">
                        <FileUploader :readonly="readonlyDetail" :maxByte="5000000" @uploadFile="uploadProductPhoto1" @deleteImage="deleteProductPhoto1" image-label="商品画像" :current-url.sync="editedItem.productPhoto1Url" :file.sync="files.photo1"></FileUploader>
                      </v-col>
                      <!-- 追加画像 1 -->
                      <v-col v-if="BtoC||BtoBtoC" cols="12" md="2" class="text-truncate">
                        <FileUploader :readonly="readonlyDetail" :maxByte="5000000" @uploadFile="uploadProductPhoto2" @deleteImage="deleteProductPhoto2" image-label="追加画像1(小売)" :current-url.sync="editedItem.productPhoto2Url" :file.sync="files.photo2"></FileUploader>
                      </v-col>
                      <!-- 追加画像 2 -->
                      <v-col v-if="BtoC||BtoBtoC" cols="12" md="2" class="text-truncate">
                        <FileUploader :readonly="readonlyDetail" :maxByte="5000000" @uploadFile="uploadProductPhoto3" @deleteImage="deleteProductPhoto3" image-label="追加画像2(小売)" :current-url.sync="editedItem.productPhoto3Url" :file.sync="files.photo3"></FileUploader>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-text v-if="BtoBspot" class="elevation-1">
                    <v-row dense>
                      <!-- 数量限定商品 -->
                      <v-col cols="12" md="2">
                        <v-switch v-model="editedItem.quantity" label="数量限定商品" :disabled="readonlyDetail ||!editedItem.salesChannel.includes('2')" hide-details dense>
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(2)" />数量限定商品</template>
                        </v-switch>
                      </v-col>
                      <!-- 在庫初期値 -->
                      <v-col cols="12" md="1">
                        <v-text-field v-model="editedItem.maxNum" label="在庫初期値" :rules="rule_number" @keydown="onKeydown" @change="onChange('maxNum', 11, 99999999999)" type="number" hide-spin-buttons :disabled="readonlyDetail || !editedItem.quantity" clearable></v-text-field>
                      </v-col>
                      <!-- 在庫 -->
                      <v-col cols="12" md="1">
                        <v-text-field v-model="editedItem.stock" label="在庫数" :rules="rule_number" @keydown="onKeydown" @change="onChange('stock', 11, 99999999999)" type="number" hide-spin-buttons :disabled="readonlyDetail || !editedItem.quantity" clearable></v-text-field>
                      </v-col>
                      <!-- 期間限定商品 -->
                      <v-col cols="12" md="2">
                        <v-switch v-model="editedItem.period" label="期間限定商品" :disabled="readonlyDetail || !editedItem.salesChannel.includes('2')" hide-details dense>
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(2)" />期間限定商品</template>
                        </v-switch>
                      </v-col>
                      <!-- 販売開始日時 -->
                      <v-col cols="12" md="3">
                        <v-row no-gutters>
                          <v-col cols="12" md="8">
                            <v-menu v-model="startDatePicker">
                              <template v-slot:activator="{on}">
                                <v-text-field v-model="startDate" label="販売開始日" prepend-icon="mdi-calendar" readonly :disabled="!editedItem.period" clearable v-on="on"></v-text-field>
                              </template>
                              <v-date-picker v-model="startDate" type="date" locale="ja-jp" :day-format="date => new Date(date).getDate()" no-title :allowed-dates="startAllowedDates"></v-date-picker>
                            </v-menu>
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-menu v-model="startTimePicker" :close-on-content-click="false">
                              <template v-slot:activator="{on}">
                                <v-text-field v-model="startTime" label="時刻" readonly clearable :disabled="!editedItem.period" v-on="on"></v-text-field>
                              </template>
                              <v-time-picker v-model="startTime" format="24hr" scrollable></v-time-picker>
                            </v-menu>
                          </v-col>
                        </v-row>
                      </v-col>
                      <!-- 販売終了日時 -->
                      <v-col cols="12" md="3">
                        <v-row no-gutters>
                          <v-col cols="12" md="8">
                            <v-menu v-model="endDatePicker">
                              <template v-slot:activator="{on}">
                                <v-text-field v-model="endDate" label="販売終了日" prepend-icon="mdi-calendar" :rules="rule_endDate" readonly :disabled="!editedItem.period" clearable v-on="on"></v-text-field>
                              </template>
                              <v-date-picker v-model="endDate" type="date" locale="ja-jp" :day-format="date => new Date(date).getDate()" no-title :allowed-dates="endAllowedDates" :disabled="readonlyDetail"></v-date-picker>
                            </v-menu>
                          </v-col>
                          <v-col cols="12" md="4">
                            <v-menu v-model="endTimePicker" :close-on-content-click="false">
                              <template v-slot:activator="{on}">
                                <v-text-field v-model="endTime" label="時刻" readonly :rules="rule_requiredPeriod.concat(rule_endTime)" clearable :disabled="!editedItem.period" v-on="on"></v-text-field>
                              </template>
                              <v-time-picker v-model="endTime" format="24hr" scrollable></v-time-picker>
                            </v-menu>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-text v-if="BtoBtoC&&shopLimited" class="elevation-1">
                    <v-row dense>
                      <!-- 販売店限定商品 -->
                      <v-col cols="12" md="2">
                        <v-switch v-model="editedItem.shop" :disabled="readonlyDetail || !editedItem.salesChannel.includes('8')" hide-details dense>
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(8)" />販売店限定</template>
                        </v-switch>
                      </v-col>
                      <!-- 販売店別価格 -->
                      <v-col cols="12" md="2">
                        <v-switch v-model="editedItem.productPriceS" :disabled="readonlyDetail || !editedItem.salesChannel.includes('8')" hide-details dense>
                          <template slot="label"><IconSet iconType="channelBit" :iconNumber="Number(8)" />販売店別価格</template>
                        </v-switch>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-text>
                    <v-row align-md="center" dense>
                      <v-col cols="12" md="12">
                        <p class="red--text">{{message}}</p>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn v-if="!readonlyDetail" color="primary" @click="save">保存</v-btn>
                  <v-btn color="primary" @click="close">キャンセル</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
          <!-- 削除ダイアログ -->
          <v-dialog v-model="dialogDelete" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">「{{editedItem.productName}}」を削除してよろしいですか？</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="deleteItemConfirm">削除</v-btn>
                <v-btn color="primary" @click="closeDelete">キャンセル</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- dialog for restore product -->
          <v-dialog v-model="dialogRestore" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">
                以下の商品を復元します。よろしいですか？ <br>
                ・商品コード：{{editedItem.productCode}} <br>
                ・商品名：{{editedItem.productName}}
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="restoreItemConfirm">復元</v-btn>
                <v-btn color="primary" @click="closeRestore">キャンセル</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- 処理結果ダイアログ -->
          <v-dialog v-model="alert" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">
                <div v-html="alertMessage"></div>
              </v-card-title>
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
import FileUploader from '../components/FileUploader';
import config from "../constants/config.js";

export default {
  name: 'ProductsPage',
  components: {
    FileUploader
  },

  data: () => ({
    dummy_thumb_image: process.env.DUMMY_THUMB_IMAGE,
    //ログイン中
    loggedin: false,
    //商品一覧
    products: [],
    //ダウンロード中
    loading: false,
    //アプリ名
    apps: [], // [{app_id: アプリID, app_name: アプリ名}]
    app: '',
    fixedApp: false,
    //商品グループ
    useGroup: config.productGroup,
    groups: [], // [グループ1, ...]
    group: '',
    //テーブルヘッダ
    headers: [
      {text: '商品ID', value: 'productId', width: 100},
      {text: '商品コード', value: 'productCode', width: 120},
      {text: '商品名', value: 'productName'},
      {text: '概要/産地/詳細', value: 'productDescription', sortable: false},
      {text: '商品画像', value: 'productPhoto1', sortable: false, width: 100, align: 'center'},
      {text: '販売経路', value: 'salesChannel', sortable: false, width: 100, align: 'center'},
      {text: '販売中', value: 'isOnsale.text', sortable: false, width: 100, align: 'center'},
      // {text: `価格${config.tax}`, value: 'productPrice', width: 110, align: 'end'},
      {text: '数量限定', value: 'quantity.text', sortable: false, width: 100, align: 'center'},
      {text: '期間限定', value: 'period.text', sortable: false, width: 100, align: 'center'},
      {text: '操作', value: 'action', sortable: false, filterable: false, width: 75, align: 'end'},
    ],
    //検索値
    search: '',
    //フィルター
    filters: {
      productId: [],
      productCode: [],
      productName: [],
      productTag: [],
      salesChannel: [],
      productPrice: [],
      isOnsale: [],
      quantity: [],
      period: [],
    },
    //価格帯
    priceRange: config.priceRange,
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
      8: config.BtoBtoC
    },
    //販売中
    onsales: [],
    onsale: [],
    //税率
    taxRates: config.taxRates,
    //商品画像
    files: {
      photo1: null,
      photo2: null,
      photo3: null,
    },
    //商品付加情報
    optInfo: config.optInfo,
    optInfo1: [],
    optInfo2: [],
    optInfo3: [],
    //販売単位
    units: [],
    //配送サイズ
    productSizes: [],
    //数量限定
    quantity: [],
    //店舗限定
    shopLimited: config.limited,
    //期間限定
    period: [],
    //日付の選択
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    startDatePicker: false,
    startTimePicker: false,
    endDatePicker: false,
    endTimePicker: false,
    //登録更新レコードのデータ
    editedItem: {},
    defaultItem: {
      productGroup: null,
      productCode: null,
      productName: null,
      productTag: null,
      productSubname: null,
      productOrign: null,
      productDetail: null,
      productPhoto1: null,
      productPhoto2: null,
      productPhoto3: null,
      salesChannel: ["1"],
      productPriceB: null,
      productPriceBS: null,
      productPriceC: null,
      productPriceBC: null,
      productPriceM: 0,
      productPriceS: 0,
      taxRate: config.taxRates[0],
      unit: '',
      optInfo1: null,
      optInfo2: null,
      optInfo3: null,
      size: null,
      shop: 0,
      quantity: 0,
      maxNum: null,
      stock: null,
      period: 0,
      start: null,
      end: null,
      isOnsale: 1,
      deleteFlg: 0
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
    productFlags: [0],
    readonlyDetail: false,
    dialogRestore: false,
    useProductPriceM: config.productPriceM,
    useRetail: !!config.BtoBtoC,
    //税区分表示
    tax: config.tax,
  }),

  computed: {
    //フィルタリングされた商品一覧
    filteredProducts() {
      return this.products.filter(tbl => {
        return Object.keys(this.filters).every(col => {
          //this.filters[col]: フィルターで指定された値, tbl[col]: データ行に含まれる値
          if(col == 'salesChannel') { //販売経路(ボタンでフィルタリング)
            return this.filters[col].length < 1 || !!(this.filters[col].filter(x => tbl[col].indexOf(x) !== -1)).length;
          } else if(col == 'productName') { //商品名(商品名と商品名タグでフィルタリング)
            if(this.filters[col].length < 1) return true;
            if(this.filters[col].includes(tbl[col])) return true;
            var included = false;
            this.filters[col].forEach(name => {
              if(tbl[col].indexOf(name) != -1) included = true;
              if(!!tbl['productTag']) {
                if(tbl['productTag'].indexOf(name) != -1) included = true;
              }
            });
            return included;
          } else if(col == 'productPrice') { //価格(価格帯でフィルタリング)
            if(this.filters[col].length < 1) return true;
            var included = false;
            this.filters[col].forEach(range => {
              if(tbl[col] >= this.priceRange.value[this.priceRange.text.indexOf(range)][0] &&
                 tbl[col] <= this.priceRange.value[this.priceRange.text.indexOf(range)][1]) {
                included = true;
              }
            });
            return included;
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
      return this.editedIndex === -1 ? '商品追加' : '商品情報更新';
    },
    //入力ルール
    rule_required() {
      return [v => !!v || '入力が必須の項目です'];
    },
    rule_channel() {
      return [(!!this.editedItem.salesChannel && !!this.editedItem.salesChannel.length) || '設定が必須の項目です'];
    },
    rule_price() {
      return [v => !v || (!!v && v > 0 && v <= 9999999) || '空欄または無効な範囲です']
    },
    rule_number() {
      return [v => !v || (!!v && v > 0 && v <= 99999999999) || '空欄または無効な範囲です']
    },
    rule_requiredPeriod() {
      return [
        v => {
          if (this.editedItem?.period && !v) {
            return '入力が必須の項目です';
          }
          return true;
        }
      ];
    },
    rule_startDate() {
      return [v => !(this.editedItem?.period || false) || (!!v && v >= this.$dayjs().format('YYYY-MM-DD')) || '現在よりも未来の日付を指定してください']
    },
    rule_endDate() {
      return [v => !(this.editedItem?.period || false) || (!!v && v >= (this.startDate ? this.$dayjs(this.startDate) : this.$dayjs()).format('YYYY-MM-DD')) || '現在と開始日よりも未来の日付を指定してください']
    },
    rule_startTime() {
      return [
        v => {
          if (this.editedItem?.period && !!v) {
            if (this.$dayjs(`${this.startDate} ${v}`).isBefore(this.$dayjs(), 'minute'))
              return '現在よりも未来の時刻を指定してください';
          }
        return true;
        }
      ]
    },
    rule_endTime() {
      return [
        v => {
          if (this.editedItem?.period && this.startTime && v) {
            const startDate = new Date(`${this.startDate} ${this.startTime}`);
            const endDate = new Date(`${this.endDate} ${v}`);
            return startDate < endDate || '開始日時が終了日時よりも未来になっています';
          }
          return true;
        }
      ];
    },
    rule_productCodeLength () {
      return [v => (!!this.editedItem?.productCode && this.editedItem.productCode.length <= 16) || '商品コードは16文字を超えることはできません']
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
    if(this.useGroup) this.getProductGroups();
    this.getUnits();
    this.getSizes();
    if(this.optInfo.optInfo1) this.getOoptinfo1();
    if(this.optInfo.optInfo2) this.getOoptinfo2();
    if(this.optInfo.optInfo3) this.getOoptinfo3();
    //詳細ダイアログ項目の初期化
    this.editedItem = Object.assign({}, this.defaultItem);
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
    //商品一覧の取得
    this.getProducts();
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
          if(this.fixedApp) this.app.app_name = this.apps.find(v => v.shopId === this.app.shopId).app_name;
        })
        .catch(error => {
          console.log(error);
          this.apps = [];
          return;
      });
    },
    //商品グループの取得
    getProductGroups() {
      axios.get(`${process.env.API}/aec/product-groups`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.groups = response.data.productGroups.map(group => group.groupName);
        })
        .catch(error => {
          console.log(error);
          this.groups = [];
          return;
        });
    },
    //販売単位の取得
    getUnits() {
      axios.get(`${process.env.API}/aec/units`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.units = response.data.units.map(unit => unit.unitName);
        })
        .catch(error => {
          console.log(error);
          this.units = [];
          return;
        });
    },
    //配送サイズの取得
    getSizes() {
      axios.get(`${process.env.API}/aec/sizes`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.productSizes = response.data.sizes.map(size => size.size);
        })
        .catch(error => {
          console.log(error);
          this.productSizes = ['L', 'M', 'S'];
          return;
        });
    },
    //商品付加情報1の取得
    getOoptinfo1() {
      axios.get(`${process.env.API}/aec/optinfo1`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.optInfo1 = response.data.optInfo1.map(info => info.optInfo1);
        })
        .catch(error => {
          console.log(error);
          this.optInfo1 = [];
          return;
        });
    },
    //商品付加情報2の取得
    getOoptinfo2() {
      axios.get(`${process.env.API}/aec/optinfo2`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.optInfo2 = response.data.optInfo2.map(info => info.optInfo2);
        })
        .catch(error => {
          console.log(error);
          this.optInfo2 = [];
          return;
        });
    },
    //商品付加情報3の取得
    getOoptinfo3() {
      axios.get(`${process.env.API}/aec/optinfo3`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.optInfo3 = response.data.optInfo3.map(info => info.optInfo3);
        })
        .catch(error => {
          console.log(error);
          this.optInfo3 = [];
          return;
        });
    },
    //商品一覧の取得
    getProducts() {
      this.loading = true;
      //画面で指定した抽出条件を準備
      let app = !!this.app ? this.app.shopId : '';
      let group = !!this.group ? this.group : '';
      let param = `?app=${app}&group=${group}&flags=${this.productFlags.join(',')}`
      axios.get(`${process.env.API}/aec/products${param}`)
        .then(response => {
          this.products = response.data.products;
          //取得データを一覧表示用に変換
          this.products.forEach(record => {
            //商品説明: 商品概要、商品産地、商品詳細を結合
            record.productDescription = (record.productSubname ? record.productSubname : '') + (record.productOrign ? record.productOrign : '') + (record.productDetail ? record.productDetail : '');
            //販売経路: 一覧画面での形式(カンマ区切りの文字列('1,2,4,8'))にAPI側で変換済み
            //販売中: '販売中'(isOnsale==1), '－'(isOnsale==0)
            record.isOnsale = {value: !!record.isOnsale, text: !!record.isOnsale ? '販売中' : '－'};
            //価格: 販売経路別価格の中で最も高いもの
            record.productPrice = Math.max(Number(record.productPriceB), Number(record.productPriceBS), Number(record.productPriceC), Number(record.productPriceBC));
            //数量限定: '限定'(quantity==1), '－'(quantity==0)
            record.quantity = {value: !!record.quantity, text: !!record.quantity ? '限定' : '－'};
            //期間限定: '限定'(period==1), '－'(period==0)
            record.period = {value: !!record.period, text: !!record.period ? '限定' : '－'};
          });
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.products = [];
          this.loading = false;
          return;
        });
    },
    //商品データの取得
    getProduct(id) {
      axios.get(`${process.env.API}/aec/products/${id}`)
        .then(response => {
           const product = response.data.product;
           product.salesChannel = product.salesChannel.split(',').filter(v=>v>0);
           product.productPhoto1Url = product.productPhoto1 ? product.productPhoto1Url : null;
           product.productPhoto2Url = product.productPhoto2 ? product.productPhoto2Url : null;
           product.productPhoto3Url = product.productPhoto3 ? product.productPhoto3Url : null;
           this.editedItem = product;
           this.startDate = new Date(product.start).toISOString().substring(0, 10);
           this.startTime = new Date(product.start).toISOString().substring(11, 16);
           this.endDate = new Date(product.end).toISOString().substring(0, 10);
           this.endTime = new Date(product.end).toISOString().substring(11, 16);
        })
        .catch(error => {
          console.log(error);
          return;
        });
    },
    //フィルター用選択項目の値一覧の作成
    columnValueList(col, obj = false) {
      if (obj) {
        let arr = this.products.map(tbl => tbl[col].text);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        let arr = this.products.map(tbl => tbl[col]);
        return arr.filter((e, i) => arr.indexOf(e) === i).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    //販売チャネルの設定
    getSaleChanelValue(salesChannel) {
      if(!!salesChannel) {
        return salesChannel.reduce((a,v) => a + parseInt(v), 0);
      } else {
        return 0;
      }
    },
    //登録
    newItem() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.startDate = new Date().toLocaleDateString('en-CA');
      this.startTime = null;
      this.endDate = new Date().toLocaleDateString('en-CA');
      this.endTime = null;
      this.message = '';
      this.dialogEdit = true;
    },
    //更新
    editItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.getProduct(item.productId);
      this.message = '';
      this.dialogEdit = true;
      this.readonlyDetail = !!item.deleteFlg;
    },
    //保存
    save() {
      //入力を確認する
      this.message = '';
      if(!this.$refs.form.validate()) {
        this.message = '入力項目に誤りがあります';
        return;
      }
      //DBに登録するデータの準備
      let editedItem = Object.assign({}, this.editedItem);
      editedItem.salesChannel = this.getSaleChanelValue(this.editedItem.salesChannel);
      editedItem.start = !!this.startDate ? (!!this.startTime ? `${this.startDate} ${this.startTime}:00` : `${this.startDate} 00:00:00`) : null;
      editedItem.end = !!this.endDate ? (!!this.endTime ? `${this.endDate} ${this.endTime}:00` : `${this.endDate} 23:59:59`) : null;
      const db = new FormData();
      db.append('token', process.env.INFO_TOKEN);
      db.append('product', JSON.stringify(editedItem));
      db.append('photo1', this.files.photo1);
      db.append('photo2', this.files.photo2);
      db.append('photo3', this.files.photo3);
      //一覧に登録するデータの準備
      let list = {};
      list.productId = this.editedItem.productId;
      list.productCode = this.editedItem.productCode;
      list.productName = this.editedItem.productName;
      list.productTag = this.editedItem.productTag;
      list.productSubname = this.editedItem.productSubname;
      list.productOrign = this.editedItem.productOrign;
      list.productDetail = this.editedItem.productDetail;
      list.productDescription =  (list.productSubname ? list.productSubname : '') + (list.productOrign ? list.productOrign : '') + (list.productDetail ? list.productDetail : '');
      list.productPhoto1 = this.editedItem.productPhoto1 ? `${process.env.API}/aec/product-images/${this.editedItem.productPhoto1}/file?type=thumb` : null;
      list.salesChannel = this.editedItem.salesChannel.join(',');
      list.isOnsale = {value: !!this.editedItem.isOnsale, text: !!this.editedItem.isOnsale ? '販売中' : '－'};
      list.productPriceB = this.editedItem.productPriceB;
      list.productPriceBS = this.editedItem.productPriceBS;
      list.productPriceC = this.editedItem.productPriceC;
      list.productPriceBC = this.editedItem.productPriceBC;
      list.productPrice = Math.max(Number(list.productPriceB), Number(list.productPriceBS), Number(list.productPriceC), Number(list.productPriceBC));
      list.quantity = {value: !!this.editedItem.quantity, text: !!this.editedItem.quantity ? '限定' : '－'};
      list.period = {value: !!this.editedItem.period, text: !!this.editedItem.period ? '限定' : '－'};
      //DB登録
      if (this.editedIndex == -1) {
        this.createProduct(db, list);
        return;
      } else {
        this.updateProduct(db, list);
        return;
      }
    },
    createProduct(db, list) {
      axios.post(`${process.env.API}/aec/products/create`, db)
        .then(response => {
          if(response.data.status) {
            //一覧のデータを更新
            list.productId = response.data.product.productId;
            list.productPhoto1 = response.data.product.productPhoto1 ? `${process.env.API}/aec/product-images/${response.data.product.productPhoto1}/file?type=thumb` : null
            this.products.unshift(list);
            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.productName}」を登録しました`;
            this.close();
          } else {
            //登録失敗ダイアログ表示
            this.alertMessage = response.data.message;
          }
          this.alert = true;
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
          return;
        });
    },
    updateProduct(db, list) {
      axios.post(`${process.env.API}/aec/products/${this.editedItem.productId}`, db)
        .then(response => {
          if(response.data.status) {
            //一覧のデータを更新
            list.productPhoto1 = response.data.product.productPhoto1 ? `${process.env.API}/aec/product-images/${response.data.product.productPhoto1}/file?type=thumb` : null
            Object.assign(this.products[this.editedIndex], list);
            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.productName}」を更新しました`;
            this.alert = true;
            this.close();
          } else {
            //登録失敗ダイアログ表示
            this.alertMessage = response.data.message;
            this.alert = true;
          }
        })
        .catch(error => {
          console.log(error)
          this.alertMessage = error.message
          this.alert = true
          return;
        });
    },
    close() {
      this.dialogEdit = false;
      this.$nextTick(() => {this.$refs.form.resetValidation()});
      this.duplicate = null;
      this.editedItem = Object.assign({}, this.defaultItem)
      this.editedIndex = -1;
      this.resetFiles();
    },
    //削除
    deleteItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem.productId = item.productId;
      this.editedItem.productName = item.productName;
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      axios.delete(`${process.env.API}/aec/products/${this.editedItem.productId}`, {
        data: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          if(response.data.status) { //削除完了
            //一覧のデータを削除
            if (this.productFlags.length == 1) {
              this.products.splice(this.editedIndex, 1);
            } else {
              this.products[this.editedIndex].deleteFlg = !this.products[this.editedIndex].deleteFlg
            }

            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.productName}」を削除しました`;
          } else {
            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.productName}」の削除に失敗しました`;
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
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    },
    closeAlert() {
      this.alert = false;
    },
    //商品画像のアップロード
    uploadProductPhoto1(image) {
      this.files.photo1 = image
    },
    uploadProductPhoto2(image) {
      this.files.photo2 = image
    },
    uploadProductPhoto3(image) {
      this.files.photo3 = image
    },
    //商品画像の削除
    deleteProductPhoto1() {
      this.files.photo1 = null
      this.editedItem.productPhoto1Delete = this.editedItem.productPhoto1
      this.editedItem.productPhoto1 = null
    },
    deleteProductPhoto2() {
      this.files.photo2 = null
      this.editedItem.productPhoto2Delete = this.editedItem.productPhoto2
      this.editedItem.productPhoto2 = null
    },
    deleteProductPhoto3() {
      this.files.photo3 = null
      this.editedItem.productPhoto3Delete = this.editedItem.productPhoto3
      this.editedItem.productPhoto3 = null
    },
    resetFiles() {
      this.files = {
        photo1: null,
        photo2: null,
        photo3: null
      }
    },
    // restore
    restoreItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem.productId = item.productId;
      this.editedItem.productCode = item.productCode;
      this.editedItem.productName = item.productName;
      this.dialogRestore = true;
    },
    restoreItemConfirm() {
      axios.post(`${process.env.API}/aec/restore-product?token=${process.env.INFO_TOKEN}&id=${this.editedItem.productId}`)
        .then(response => {
          if(response.data.status) { //削除完了
            //一覧のデータを削除
            if (this.productFlags.length == 1) {
              this.products.splice(this.editedIndex, 1);
            } else {
              this.products[this.editedIndex].deleteFlg = !this.products[this.editedIndex].deleteFlg
            }
            //完了ダイアログ表示
            this.alertMessage = `以下の商品を復元しました。<br>`;
            this.alertMessage += `・商品コード： ${this.editedItem.productCode}<br>`;
            this.alertMessage += `・商品名： ${this.editedItem.productName}`;
          } else {
            //完了ダイアログ表示
            this.alertMessage = `「${this.editedItem.productName}」は復元できませんでした。`;
          }
          this.alert = true;
          this.closeRestore();
        })
        .catch(error => {
          console.log(error)
          this.alertMessage = error.message
          this.alert = true
        });
    },
    closeRestore() {
      this.dialogRestore = false;
      this.$nextTick(() => {if (this.$refs.form) this.$refs.form.resetValidation();});
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
    },
    onKeydown(){
      // Get the key code of the pressed key
      const keyCode = event.keyCode || event.which;
      const keyChar = String.fromCharCode(keyCode)
      //Dot (.) (e) (-) keys
      if (['¾', 'e','E', '½'].includes(keyChar)) {
        event.preventDefault();
      }
    },
    onChange(field, maxLength, maxValue) {
      const value = parseInt(this.editedItem[field], 10);
      if (isNaN(value)) {
        this.editedItem[field] = null;
      } else {
        // Truncate the value if it exceeds the max length
        this.truncateIfOverMax(field, maxLength);
        // Restrict the value to the maximum allowed value
        this.editedItem[field] = Math.min(value, maxValue);
      }
    },
    truncateIfOverMax(key, maxLength) {
      if (this.editedItem[key] && this.editedItem[key].toString().length > maxLength) {
        this.editedItem[key] = parseInt(this.editedItem[key].toString().slice(0, maxLength), 10);
      }
    },
    startAllowedDates: function(val) { return val >= this.$dayjs().format('YYYY-MM-DD')},
    endAllowedDates: function (val) {
      const startDate = this.startDate ? this.$dayjs(this.startDate) : this.$dayjs();
      return val >= startDate.format('YYYY-MM-DD');
    },
  },
}
</script>
