<template>
  <v-card v-if="loggedin && loginInfo.adminUser">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">管理者一覧</v-toolbar-title>
        <Icon @btnClick="getAdmins" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="true" />
        <v-spacer></v-spacer>
        <v-btn @click="showQR" outlined depressed>管理者追加用QRコード表示</v-btn>
        <Icon v-if="addAccountAdmin" @btnClick="newItem" iconName="mdi-database-plus-outline" iconTooltip="新規管理者を追加" :isText="true" />
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="admins" :loading="loading" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{item}">
          <div class="text-truncate">
            <Icon @btnClick="editItem(item)" iconName="mdi-pencil-outline" iconTooltip="編集" />
            <!-- <Icon @btnClick="showQR(item)" iconName="mdi-qrcode" iconTooltip="管理者追加用QRコードを表示" /> -->
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
                      <v-text-field v-model="editedItem.adminId" label="管理者ID" disabled></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="editedItem.adminName" label="管理者名" :rules="rule_name"></v-text-field>
                    </v-col>
                    <v-col cols="12" :class="[showColumnAccess ? 'col-md-5' : 'col-md-7']">
                      <v-text-field v-model="editedItem.adminLine" label="LINE ID"></v-text-field>
                    </v-col>
                    <v-col v-if="showColumnAccess" cols="12" md="2">
                      <v-select v-model="editedItem.privilege" label="アクセス権限" :items="privilege" item-text="text" item-value="value" hide-details></v-select>
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
                「{{editedItem.adminName}}」を削除してよろしいですか？
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
          <!-- 管理者追加用QRコード表示 -->
          <v-dialog v-model="dialogQR" persistent max-width="800px">
            <v-card>
              <v-card-title class="justify-center">管理者追加用QRコード</v-card-title>
                <v-card-text class="text-center">
                  <p>
                    <v-img :src="adminQRCode"></v-img>
                  </p>
                  <p>{{adminQRUrl}}</p>
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
import config from "../constants/config.js";
import { jsPDF } from "jspdf";

export default {
  name: 'AdminsPage',

  data: () => ({
    //ログイン中
    loggedin: false,
    //管理者一覧
    admins: [],
    //ダウンロード中
    loading: false,
    //テーブルヘッダ
    headers: [
      {text: '管理者ID', value: 'adminId'},
      {text: '管理者名', value: 'adminName'},
      {text: 'LINE ID', value: 'adminLine'},
      {text: 'アクセス権限', value: 'privilege.text'},
      {text: '操作', value: 'action', width: 75, align: 'end', sortable: false, filterable: false},
    ],
    //アクセス権限
    privilege: [
      {value: 0, text: '受注処理担当'},
      {value: 1, text: '商品管理担当'},
      {value: 2, text: '管理者'},
      {value: 9, text: '開発者'},
    ],
    //編集データ
    editedItem: {},
    editedIndex: -1,
    //登録更新削除ダイアログ
    dialogEdit: false,
    dialogDelete: false,
    message: '',
    //アラートダイアログ
    alertDialog: false,
    alertMessage: '',
    //QR表示ダイアログ
    dialogQR: false,
    adminQRUrl: '',
    adminQRCode: '',
    //新規登録時のデフォルト値
    defaultItem: {
      adminId: null,
      adminName: '',
      adminLine: '',
      privilege: 0,
      deleteFlg: 0,
    },
    showColumnAccess: config.showColumnAccessSetting,
    addAccountAdmin: config.addAccountAdminSetting,
    loginInfo: {},
  }),

  computed: {
    //登録ダイアログのタイトル
    dialogTitle() {
      return this.editedIndex === -1 ? '管理者追加' : '管理者更新';
    },
    //入力ルール
    rule_name() {
      return [!!this.editedItem.adminName || '入力が必須の項目です'];
    },
  },

  created() {
    //管理者一覧の取得
    this.getAdmins();
    if (!this.showColumnAccess) {
      this.headers = this.headers.filter((item) => { return item.text != 'アクセス権限' })
    }
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
      this.loginInfo = JSON.parse(sessionStorage.getItem('aeclogin'));
    } else {
      this.$router.replace('/');
    }
  },

  methods: {
    //管理者一覧の取得
    getAdmins() {
      this.loading = true;
      axios.get(`${process.env.API}/aec/admins`)
        .then(response => {
          this.admins = [...response.data.admins];
          //受注一覧データを変換
          this.admins.forEach(record =>  {
            //アクセス権限の表示文字を設定
            this.setPrivilegeText(record);
          });
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.admins = [];
          this.loading = false;
          return;
        });
    },
    //登録更新
    newItem() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.message = '';
      this.dialogEdit = true;
    },
    //更新
    editItem(item) {
      this.editedIndex = this.admins.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.message = '';
      this.dialogEdit = true;
    },
    save() {
      //入力を確認する
      this.message = '';
      if(!this.$refs.form.validate()) {
        this.message = '入力項目に誤りがあります';
        return;
      }
      //更新データ準備
      var admin = {
        adminId: this.editedItem.adminId,
        adminName: this.editedItem.adminName,
        adminLine: this.editedItem.adminLine,
        privilege: typeof this.editedItem.privilege === 'object' ? this.editedItem.privilege.id : this.editedItem.privilege,
        deleteFlg: 0,
      };
      //データベース更新
      let uri = this.editedItem.adminId?admin.adminId:'create';
      axios.post(`${process.env.API}/aec/admins/${uri}`,
        {
          token: process.env.INFO_TOKEN,
          admin
        })
        .then(response => {
          if(!response.data.record.adminId) { //更新レコードなし
            this.alertMessage = '保存に失敗しました';
            this.alertDialog = true;
            this.close();
          } else { //追加更新完了
            this.setPrivilegeText(this.editedItem)
            if(this.editedIndex > -1) { //更新
              Object.assign(this.admins[this.editedIndex], this.editedItem);
            } else { //追加
              this.editedItem.adminId = response.data.record.adminId;
              this.admins.push(this.editedItem);
            }
            //完了ダイアログ表示
            this.alertMessage = '保存しました';
            this.alertDialog = true;
            this.close();
          }
        })
        .catch(error => {console.log(error);}
      );
    },
    close() {
      this.dialogEdit = false;
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.editedIndex = -1;
    },
    //削除
    deleteItem(item) {
      this.editedIndex = this.admins.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      axios.delete(`${process.env.API}/aec/admins/${this.editedItem.adminId}`,
        {
          data: {
            token: process.env.INFO_TOKEN
          }
        })
        .then(response => {
          if(!response.data.status) { //削除レコードなし
            this.alertMessage = '削除に失敗しました';
          } else { //削除完了
            this.admins.splice(this.editedIndex, 1);
            this.alertMessage = '削除しました';
          }
          this.alertDialog = true;
          this.closeDelete();
        })
        .catch(error => {console.log(error);}
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
      this.alertDialog = false;
    },
    //管理者追加用QRコード出力
    showQR() {
      this.adminQRUrl = `https://liff.line.me/${process.env.HIYOSHI_ADMIN}?requestUser=${this.loginInfo.line}`;
      console.log(this.adminQRUrl)
      this.adminQRCode = `${process.env.API}/qrcode?size=300&link=${this.adminQRUrl}`
      this.dialogQR = true;
    },
    //pdf出力
    outputPDF() {
      var doc = new jsPDF();
      doc.addImage(this.adminQRCode, "JPEG", 15, 40, 180, 180);
      doc.save();
    },
    closeQR() {
      this.dialogQR = false;
    },
    //権限idから権限名へ変換
    setPrivilegeText(record){
      record.privilege = {value: record.privilege, text: this.privilege.find(e => e.value === record.privilege)?.text || '受注処理担当'};
    }
  },
}
</script>
