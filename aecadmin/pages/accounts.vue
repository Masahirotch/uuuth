<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">アカウント一覧</v-toolbar-title>
        <Icon @btnClick="getApps" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="true" />
        <v-spacer></v-spacer>
        <Icon @btnClick="newItem" iconName="mdi-database-plus-outline" iconTooltip="新規公式アカウントを追加" :isText="true" />
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="apps" :loading="loading" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate">
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
                    <v-text-field v-model="editedItem.app_id" label="アプリID" disabled></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="editedItem.app_code" label="アカウントID(半角英数字)" :rules="rule_equired" clearable></v-text-field>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="editedItem.app_name" label="アプリ名" :rules="rule_equired" clearable></v-text-field>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select v-model="editedItem.shop_code" label="店舗名" :items="shops" item-text="shopName" item-value="shopCode" :rules="rule_equired" clearable></v-select>
                  </v-col>
                </v-row>
                <!-- <v-row align-md="center" dense>
                  <v-col cols="12" md="3">
                    <FileUploader :maxByte="5000000" @uploadFile="uploadLogoImage" @deleteImage="deleteLogoImage" image-label="ロゴ画像" :current-url.sync="editedItem.logoUrl" :file.sync="files.logoImage"></FileUploader>
                  </v-col>
                  <v-col cols="12" md="2">
                    <v-select v-model="editedItem.theme_id" label="テーマカラー" :items="themes" item-text="text" item-value="value" hide-details dense></v-select>
                  </v-col>
                </v-row> -->
                <v-row dense>
                  <v-expansion-panels multiple>
                    <v-expansion-panel>
                      <v-expansion-panel-header>LINEアプリ情報</v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-text-field v-model="editedItem.liff_id" label="LIFF ID"></v-text-field>
                        <v-text-field v-model="editedItem.msg_channel_id" label="チャネルID"></v-text-field>
                        <v-text-field v-model="editedItem.msg_channel_secret" label="チャネルシークレット"></v-text-field>
                        <v-text-field v-model="editedItem.msg_access_token" label="アクセストークン"></v-text-field>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                      <v-expansion-panel-header>利用規約</v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-textarea v-model="editedItem.terms" outlined rows="2" auto-grow dense></v-textarea>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                      <v-expansion-panel-header>特定商取引法に基づく表記</v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-textarea v-model="editedItem.law_prices" label="販売価格について" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.law_method" label="代金(対価)の支払時期と方法" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.law_returned" label="返品についての特約事項" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.law_service" label="役務または商品の引き渡し時期" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.law_other" label="その他" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.law_about" label="事業者の名称及び連絡先" outlined rows="2" auto-grow dense></v-textarea>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                      <v-expansion-panel-header>プライバシーポリシー</v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-textarea v-model="editedItem.privacy_header" label="総則" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.privacy_information" label="お客様情報について" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.privacy_purpose" label="お客様情報の利用目的について" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.privacy_consign" label="お客様情報の第三者への委託について" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.privacy_furnishing" label="お客様情報の第三者への提供について" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.privacy_line" label="LINEユーザデータの使用について" outlined rows="2" auto-grow dense></v-textarea>
                        <v-textarea v-model="editedItem.privacy_contact" label="お客様情報のお問い合わせついて" outlined rows="2" auto-grow dense></v-textarea>
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
              <v-card-title class="text-h6">
                「{{editedItem.app_name}}」を削除してよろしいですか？
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
              <v-card-title class="text-h6">{{alertmessage}}</v-card-title>
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
import FileUploader from '../components/FileUploader';

export default {
  name: 'AccountsPage',

  data: () => ({
    //ログイン中
    loggedin: false,
    //アプリ一覧
    apps: [],
    //ダウンロード中
    loading: false,
    //テーブルヘッダ
    headers: [
      {text: 'アプリID', value: 'app_id'},
      {text: 'アカウントID', value: 'app_code'},
      {text: 'アプリ名', value: 'app_name'},
      {text: '操作', value: 'action', width: 75, align: 'end', sortable: false, filterable: false},
    ],
    //店舗コード
    shops: [],
    //テーマ
    themes: [
      {value: 1, text: config.theme1},
      {value: 2, text: config.theme2},
    ],
    //編集データ
    editedItem: {},
    editedIndex: -1,
    //登録更新削除ダイアログ
    dialogEdit: false,
    dialogDelete: false,
    message: '',
    //アラートダイアログ
    alert: false,
    alertmessage: '',
    //新規登録時のデフォルト値
    defaultItem: {
      app_id: null,
      app_code: '',
      app_name: '',
      shop_code: '',
      liff_id: '',
      msg_channel_id: '',
      msg_channel_secret: '',
      msg_access_token: '',
      theme_id: 1,
      logo_gid: '',
      terms: '',
      law_prices: '',
      law_method: '',
      law_returned: '',
      law_service: '',
      law_other: '',
      law_about: '',
      privacy_header: '',
      privacy_information: '',
      privacy_purpose: '',
      privacy_consign: '',
      privacy_furnishing: '',
      privacy_line: '',
      privacy_contact: '',
      deleteFlg: 0,
    },
    files: {
      logoImage: null,
    }
  }),

  computed: {
    //登録ダイアログのタイトル
    dialogTitle() {
      return this.editedIndex === -1 ? 'アカウント追加' : 'アカウント更新';
    },
    //入力ルール
    rule_equired() {
      return [v => !!v || '入力が必須の項目です'];
    },
  },

  created() {
    //プルダウン項目の取得
    this.getShops();
    //公式アカウント一覧の取得
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
    //販売店一覧の取得
    getShops() {
      axios.get(`${process.env.API}/aec/shops`, {
        params: {token: process.env.INFO_TOKEN}
      })
        .then(response => {
          this.shops = [...response.data.shops];
        })
        .catch(error => {
          console.log(error);
          this.shops = [];
          return;
        });
    },
    //公式アカウント一覧の取得
    getApps() {
      this.loading = true;
      axios.get(`${process.env.API}/aec/apps`)
        .then(response => {
          this.apps = [...response.data.apps];
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.apps = [];
          this.loading = false;
          return;
        });
    },
    //登録
    newItem() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.resetFiles();
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.message = '';
      this.dialogEdit = true;
    },
    //更新
    editItem(item) {
      this.editedIndex = this.apps.indexOf(item);
      axios.get(`${process.env.API}/aec/app?id=${item.app_id}`)
        .then(res => {
          const app = res.data.app
          app.logoUrl = app.logo_gid ? app.logoUrl : null;
          app.theme_id = parseInt(app.theme_id);
          this.editedItem = app;
          this.resetFiles();
          this.$nextTick(() => {this.$refs.form.resetValidation();});
          this.message = '';
          this.dialogEdit = true;
        })
        .catch(error => {
          console.log(error);
          this.editedItem = [];
          return;
        });
    },
    save() {
      //入力を確認する
      this.message = '';
      if (!this.$refs.form.validate()) {
        this.message = '入力項目に誤りがあります';
        return;
      }
      //更新データ準備
      var record = {
        app_id: this.editedItem.app_id,
        app_code: this.editedItem.app_code,
        app_name: this.editedItem.app_name,
        shop_code: this.editedItem.shop_code,
        liff_id: this.editedItem.liff_id,
        msg_channel_id: this.editedItem.msg_channel_id,
        msg_channel_secret: this.editedItem.msg_channel_secret,
        msg_access_token: this.editedItem.msg_access_token,
        theme_id: this.editedItem.theme_id,
        logo_gid: this.editedItem.logo_gid,
        terms: this.editedItem.terms,
        law_prices: this.editedItem.law_prices,
        law_method: this.editedItem.law_method,
        law_returned: this.editedItem.law_returned,
        law_service: this.editedItem.law_service,
        law_other: this.editedItem.law_other,
        law_about: this.editedItem.law_about,
        privacy_header: this.editedItem.privacy_header,
        privacy_information: this.editedItem.privacy_information,
        privacy_purpose: this.editedItem.privacy_purpose,
        privacy_consign: this.editedItem.privacy_consign,
        privacy_furnishing: this.editedItem.privacy_furnishing,
        privacy_line: this.editedItem.privacy_line,
        privacy_contact: this.editedItem.privacy_contact,
        deleteFlg: 0,
      };
      //postデータ準備
      const db = new FormData()
      db.append('token', process.env.INFO_TOKEN);
      db.append('dataApp', JSON.stringify(record));
      db.append('logoImage', this.files.logoImage);
      //データベース更新
      axios.post(`${process.env.API}/aec/updateapp`, db)
        .then(response => {
          if(response.data.message) {
            this.alertmessage = response.data.message;
            this.alert = true;
            this.close();
          }
          if (!response.data.app.app_id) { //更新レコードなし
            this.alertmessage = '保存に失敗しました';
            this.alert = true;
            this.close();
          } else { //追加更新完了
            if (this.editedIndex > -1) { //更新
              Object.assign(this.apps[this.editedIndex], this.editedItem);
            } else { //追加
              this.editedItem.app_id = response.data.app.app_id;
              this.apps.push(this.editedItem);
            }
            //完了ダイアログ表示
            this.alertmessage = '保存しました';
            this.alert = true;
            this.close();
          }
        }).catch(error => {
          console.log(error);
        }
      );
    },
    close() {
      this.dialogEdit = false;
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.editedIndex = -1;
    },
    //削除
    deleteItem(item) {
      this.editedIndex = this.apps.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      axios.post(`${process.env.API}/aec/deleteApp`, {
        token: process.env.INFO_TOKEN,
        appId: this.editedItem.app_id,
        deleteFlg: 1, //データ削除:deleteFlgを削除(1)にする
      })
        .then(response => {
          console.log(response.data)
          if(!response.data.app_id) { //削除レコードなし
            this.alertmessage = '削除に失敗しました';
          } else { //削除完了
            this.apps.splice(this.editedIndex, 1);
            this.alertmessage = '削除しました';
          }
          this.alert = true;
          this.closeDelete();
        }).catch(error => {
          console.log(error)
          this.alertmessage = error.message
          this.alert = true
        }
      );
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        if(this.$refs.form){
          this.$refs.form.resetValidation();
        }
      });
      this.editedIndex = -1;
    },
    closeAlert() {
      this.alert = false;
    },
    //アップロード
    uploadLogoImage(image) {
      this.files.logoImage = image;
    },
    deleteLogoImage() {
      this.files.logoImage = null;
    },
    resetFiles() {
      this.files.logoImage = null;
    }
  },
}
</script>
