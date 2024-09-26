<template>
  <v-card v-if="loggedin">
    <v-form ref="form">
      <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">配送料編集</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-select v-model="app" label="販売店（アプリ名）" :items="apps" item-text="app_name" item-value="shop_code" return-object hide-details clearable dense></v-select>
        <Icon @btnClick="getPostage" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="true" />
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <!-- サイズ指定タブ -->
      <v-tabs v-model="tab" centered>
        <v-tab v-for="item in items" :key="item.index">
          {{item.tab}}
        </v-tab>
      </v-tabs>
      <!-- 配送料 -->
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in items" :key="item.index">
          <!-- 北海道 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              北海道
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[1]" label="北海道" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[0][item.index]" label="送料" suffix="円" :rules="rule_required(0).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 青森県, 秋田県, 岩手県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              北東北
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[2]" label="青森県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[5]" label="秋田県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[3]" label="岩手県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[1][item.index]" label="送料" suffix="円" :rules="rule_required(1).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 宮城県, 山形県, 福島県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              南東北
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[4]" label="宮城県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[6]" label="山形県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[7]" label="福島県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[2][item.index]" label="送料" suffix="円" :rules="rule_required(2).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 茨城県, 栃木県, 群馬県, 埼玉県, 千葉県, 神奈川県, 東京都, 山梨県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              関東
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[8]" label="茨城県" hide-details dense></v-switch>
              <v-switch v-model="flg[12]" label="千葉県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[9]" label="栃木県" hide-details dense></v-switch>
              <v-switch v-model="flg[14]" label="神奈川県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[10]" label="群馬県" hide-details dense></v-switch>
              <v-switch v-model="flg[13]" label="東京都" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[11]" label="埼玉県" hide-details dense></v-switch>
              <v-switch v-model="flg[19]" label="山梨県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[3][item.index]" label="送料" suffix="円" :rules="rule_required(3).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 新潟県, 長野県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              信越
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[15]" label="新潟県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[20]" label="長野県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[4][item.index]" label="送料" suffix="円" :rules="rule_required(4).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 富山県, 石川県, 福井県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              北陸
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[16]" label="富山県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[17]" label="石川県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[18]" label="福井県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[5][item.index]" label="送料" suffix="円" :rules="rule_required(5).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 静岡県, 愛知県, 三重県, 岐阜県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              中部
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[22]" label="静岡県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[23]" label="愛知県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[24]" label="三重県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[21]" label="岐阜県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[6][item.index]" label="送料" suffix="円" :rules="rule_required(6).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 大阪府, 京都府, 滋賀県, 奈良県, 和歌山県, 兵庫県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              関西
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[27]" label="大阪府" hide-details dense></v-switch>
              <v-switch v-model="flg[30]" label="和歌山県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[26]" label="京都府" hide-details dense></v-switch>
              <v-switch v-model="flg[28]" label="兵庫県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[25]" label="滋賀県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[29]" label="奈良県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[7][item.index]" label="送料" suffix="円" :rules="rule_required(7).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 岡山県, 広島県, 山口県, 鳥取県, 島根県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              中国
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[33]" label="岡山県" hide-details dense></v-switch>
              <v-switch v-model="flg[32]" label="島根県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[34]" label="広島県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[35]" label="山口県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[31]" label="鳥取県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[8][item.index]" label="送料" suffix="円" :rules="rule_required(8).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 香川県, 徳島県, 愛媛県, 高知県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              四国
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[37]" label="香川県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[36]" label="徳島県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[38]" label="愛媛県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[39]" label="高知県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[9][item.index]" label="送料" suffix="円" :rules="rule_required(9).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 福岡県, 佐賀県, 長崎県, 熊本県, 大分県, 宮崎県, 鹿児島県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              九州
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[40]" label="福岡県" hide-details dense></v-switch>
              <v-switch v-model="flg[44]" label="大分県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[41]" label="佐賀県" hide-details dense></v-switch>
              <v-switch v-model="flg[45]" label="宮崎県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[42]" label="長崎県" hide-details dense></v-switch>
              <v-switch v-model="flg[46]" label="鹿児島県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[43]" label="熊本県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[10][item.index]" label="送料" suffix="円" :rules="rule_required(10).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <!-- 沖縄県 -->
          <v-row dense>
            <v-col cols="12" md="2" align-self="center">
              沖縄
            </v-col>
            <v-col cols="12" md="2">
              <v-switch v-model="flg[47]" label="沖縄県" hide-details dense></v-switch>
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2">
            </v-col>
            <v-col cols="12" md="2" align-self="end">
              <v-text-field v-model="fee[11][item.index]" label="送料" suffix="円" :rules="rule_required(11).concat(rule_number)"></v-text-field>
            </v-col>
          </v-row>
          <v-divider></v-divider>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
    <v-card-actions>
      <!-- ボタン -->
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="savePostage">保存</v-btn>
      <v-btn color="primary" @click="clearPostage">クリア</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
    </v-form>
    <!-- 処理結果ダイアログ -->
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
  </v-card>
</template>

<script>
import axios from "axios";
import config from "../constants/config.js";

export default {
  name: 'postagePage',

  data: () => ({
    //ログイン中
    loggedin: false,
    //送料一覧
    postage: [],
    //抽出条件
    apps: [],
    app: '',
   //タブ切替
    tab: null,
    items: [
      {index: 0, tab: config.postageTab1},
      {index: 1, tab: config.postageTab2},
      {index: 2, tab: config.postageTab3},
    ],
    //配送可能都道府県
    flg: [],
    //地域別送料
    fee: [],
    //アラートダイアログ
    alertDialog: false,
    alertMessage: '',
  }),

  created() {
    //表示用配送料情報の初期化
    for(let i = 1; i <= 47; i++) this.flg[i] = false;
    for(let i = 0; i < 12; i++) this.fee[i] = new Array(3);
    //アプリ一覧の取得
    axios.get(`${process.env.API}/aec/postage/apps`)
      .then(response => {
        this.apps = [...response.data.apps];
      })
      .catch(error => {
        console.log(error);
        this.apps = [{shop_code: '', app_name: ''}];
        retuen;
      });
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
  },

  computed: {
    rule_number() {
      const numberRegex = /^\d+$/; // Regular expression to match numbers
      return [v => (!v || numberRegex.test(v)) || '数値を入力してください'];
    },
  },

  methods: {
    rule_required(feeIndex) {
      return [v => (!!v || !this.isRegionSelected(feeIndex, v)) || '入力が必須の項目です'];
    },
    isRegionSelected(feeIndex, v) {
      const switches = [
        { flg: [1], fee: 0 },
        { flg: [2, 5, 3], fee: 1 },
        { flg: [4, 6, 7], fee: 2 },
        { flg: [8, 9, 10, 11, 12, 13, 14, 19], fee: 3 },
        { flg: [15, 20], fee: 4 },
        { flg: [16, 17, 18], fee: 5 },
        { flg: [21, 22, 23, 24], fee: 6 },
        { flg: [25, 26, 27, 28, 29, 30], fee: 7 },
        { flg: [31, 32, 33, 34, 35], fee: 8 },
        { flg: [36, 37, 38, 39], fee: 9 },
        { flg: [40, 41, 42, 43, 44, 45, 46], fee: 10 },
        { flg: [47], fee: 11 },
      ];

      const items = switches.filter(item => item.fee === feeIndex).shift();
      return items.flg.some(f => this.flg[f] === true);
    },
    //配送料情報の取得
    getPostage() {
      //アプリ名入力の確認
      if (!this.app) {
        this.alertMessage = 'アプリ名を指定してください';
        this.alertDialog = true;
        return;
      }
      //配送料情報の取得
      const shopCode = this.app?.shop_code || null
      axios.get(`${process.env.API}/aec/getpostage?shop_code=${shopCode}`)
        .then(response => {
          this.postage = [...response.data.postage];
          //取得データを表示データに設定
          const tbl_fee = [1, 2, 4, 8, 15, 16, 22, 27, 33, 37, 40, 47];
          for (let i = 1; i <= 47; i++) this.flg.splice(i, 1, false);
          for (let i = 0; i < 12; i++) this.fee.splice(i, 1, new Array(3));
          let area = 0;
          this.postage.forEach(record => {
            let i = parseInt(record.perf);
            this.flg[i] = !!record.flg;
            if (tbl_fee.includes(i)) this.fee[area++] = [...record.fee];
          });
        })
        .catch(error => {
          console.log(error);
          this.postage = [];
          return;
        });
    },
    //配送料情報の保存
    savePostage() {
      //アプリ名入力の確認
      if (!this.app) {
        this.alertMessage = 'アプリ名を指定してください';
        this.alertDialog = true;
        return;
      }
      
      if (!this.$refs.form.validate()) {
        this.alertMessage = '入力項目に誤りがあります';
        this.alertDialog = true;
        return;
      }

      //更新データの準備
      const data = {
        shop: this.app?.shop_code || null, postage: [
          {perf: '01', flg: this.flg[1], fee: [this.fee[0][0], this.fee[0][1], this.fee[0][2]]},
          {perf: '02', flg: this.flg[2], fee: [this.fee[1][0], this.fee[1][1], this.fee[1][2]]},
          {perf: '03', flg: this.flg[3], fee: [this.fee[1][0], this.fee[1][1], this.fee[1][2]]},
          {perf: '04', flg: this.flg[4], fee: [this.fee[2][0], this.fee[2][1], this.fee[2][2]]},
          {perf: '05', flg: this.flg[5], fee: [this.fee[1][0], this.fee[1][1], this.fee[1][2]]},
          {perf: '06', flg: this.flg[6], fee: [this.fee[2][0], this.fee[2][1], this.fee[2][2]]},
          {perf: '07', flg: this.flg[7], fee: [this.fee[2][0], this.fee[2][1], this.fee[2][2]]},
          {perf: '08', flg: this.flg[8], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '09', flg: this.flg[9], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '10', flg: this.flg[10], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '11', flg: this.flg[11], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '12', flg: this.flg[12], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '13', flg: this.flg[13], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '14', flg: this.flg[14], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '15', flg: this.flg[15], fee: [this.fee[4][0], this.fee[4][1], this.fee[4][2]]},
          {perf: '16', flg: this.flg[16], fee: [this.fee[5][0], this.fee[5][1], this.fee[5][2]]},
          {perf: '17', flg: this.flg[17], fee: [this.fee[5][0], this.fee[5][1], this.fee[5][2]]},
          {perf: '18', flg: this.flg[18], fee: [this.fee[5][0], this.fee[5][1], this.fee[5][2]]},
          {perf: '19', flg: this.flg[19], fee: [this.fee[3][0], this.fee[3][1], this.fee[3][2]]},
          {perf: '20', flg: this.flg[20], fee: [this.fee[4][0], this.fee[4][1], this.fee[4][2]]},
          {perf: '21', flg: this.flg[21], fee: [this.fee[6][0], this.fee[6][1], this.fee[6][2]]},
          {perf: '22', flg: this.flg[22], fee: [this.fee[6][0], this.fee[6][1], this.fee[6][2]]},
          {perf: '23', flg: this.flg[23], fee: [this.fee[6][0], this.fee[6][1], this.fee[6][2]]},
          {perf: '24', flg: this.flg[24], fee: [this.fee[6][0], this.fee[6][1], this.fee[6][2]]},
          {perf: '25', flg: this.flg[25], fee: [this.fee[7][0], this.fee[7][1], this.fee[7][2]]},
          {perf: '26', flg: this.flg[26], fee: [this.fee[7][0], this.fee[7][1], this.fee[7][2]]},
          {perf: '27', flg: this.flg[27], fee: [this.fee[7][0], this.fee[7][1], this.fee[7][2]]},
          {perf: '28', flg: this.flg[28], fee: [this.fee[7][0], this.fee[7][1], this.fee[7][2]]},
          {perf: '29', flg: this.flg[29], fee: [this.fee[7][0], this.fee[7][1], this.fee[7][2]]},
          {perf: '30', flg: this.flg[30], fee: [this.fee[7][0], this.fee[7][1], this.fee[7][2]]},
          {perf: '31', flg: this.flg[31], fee: [this.fee[8][0], this.fee[8][1], this.fee[8][2]]},
          {perf: '32', flg: this.flg[32], fee: [this.fee[8][0], this.fee[8][1], this.fee[8][2]]},
          {perf: '33', flg: this.flg[33], fee: [this.fee[8][0], this.fee[8][1], this.fee[8][2]]},
          {perf: '34', flg: this.flg[34], fee: [this.fee[8][0], this.fee[8][1], this.fee[8][2]]},
          {perf: '35', flg: this.flg[35], fee: [this.fee[8][0], this.fee[8][1], this.fee[8][2]]},
          {perf: '36', flg: this.flg[36], fee: [this.fee[9][0], this.fee[9][1], this.fee[9][2]]},
          {perf: '37', flg: this.flg[37], fee: [this.fee[9][0], this.fee[9][1], this.fee[9][2]]},
          {perf: '38', flg: this.flg[38], fee: [this.fee[9][0], this.fee[9][1], this.fee[9][2]]},
          {perf: '39', flg: this.flg[39], fee: [this.fee[9][0], this.fee[9][1], this.fee[9][2]]},
          {perf: '40', flg: this.flg[40], fee: [this.fee[10][0], this.fee[10][1], this.fee[10][2]]},
          {perf: '41', flg: this.flg[41], fee: [this.fee[10][0], this.fee[10][1], this.fee[10][2]]},
          {perf: '42', flg: this.flg[42], fee: [this.fee[10][0], this.fee[10][1], this.fee[10][2]]},
          {perf: '43', flg: this.flg[43], fee: [this.fee[10][0], this.fee[10][1], this.fee[10][2]]},
          {perf: '44', flg: this.flg[44], fee: [this.fee[10][0], this.fee[10][1], this.fee[10][2]]},
          {perf: '45', flg: this.flg[45], fee: [this.fee[10][0], this.fee[10][1], this.fee[10][2]]},
          {perf: '46', flg: this.flg[46], fee: [this.fee[10][0], this.fee[10][1], this.fee[10][2]]},
          {perf: '47', flg: this.flg[47], fee: [this.fee[11][0], this.fee[11][1], this.fee[11][2]]},
        ]
      };
      //配送料情報の更新
      axios.post(`${process.env.API}/aec/updatepostage`, {
        token: process.env.INFO_TOKEN,
        data
      }).then(res => {
        if(res.status) {
          this.alertMessage = '保存しました';
          this.alertDialog = true;
        }
      })
        .catch(error => {
          console.log(error);
        });
    },
    //表示をクリア
    clearPostage() {
      this.app = '';
      for(let i = 1; i <= 47; i++) this.flg.splice(i, 1, false);
      for(let i = 0; i < 12; i++) this.fee.splice(i, 1, new Array(3));
    },
    //アラートダイアログを閉じる
    closeAlert() {
      this.alertDialog = false;
    },
  },
}
</script>
