<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">タグ設定</v-toolbar-title>
        <Icon @btnClick="getTags" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="Boolean(true)" />
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details clearable></v-text-field>
        <Icon @btnClick="newItem" iconName="mdi-database-plus-outline" iconTooltip="新規タグを追加" :isText="Boolean(true)" />
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <v-data-table :headers="headers" :items="filteredTags" :loading="loading" :search="search" class="elevation-1" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
            <tr>
              <td><v-select v-model="filters.tagId" :items="columnValueList('tagId')" hide-details dense multiple clearable></v-select></td>
              <td><v-select v-model="filters.tagValue" :items="columnValueList('tagValue')" hide-details dense multiple clearable></v-select></td>
            </tr>
          </tbody>
        </template>
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
              <v-form ref="form" @submit.prevent="return false;">
                <v-card-title>
                  <v-app-bar>
                    <v-toolbar-title>{{dialogTitle}}</v-toolbar-title>
                  </v-app-bar>
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" md="2">
                      <small>タグID</small><br>{{editedItem.tagId}}
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field v-model="editedItem.tagValue" label="タグ" :rules="rule_tag" clearable></v-text-field>
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
                「{{editedItem.tagValue}}」を削除してよろしいですか？
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
  name: 'TagsPage',

  data: () => ({
    //ログイン中
    loggedin: false,
    //タグ一覧
    tags: [],
    //ダウンロード中プログレスバー表示
    loading: false,
    //一覧テーブルヘッダ
    headers: [
      {text: 'タグID', value: 'tagId', width: 150},
      {text: 'タグ', value: 'tagValue'},
      {text: '操作', value: 'action', width: 75, align: 'end', sortable: false, filterable: false},
    ],
    //フィルター
    filters: {
      tagId: [],
      tagValue: [],
    },
    //検索値
    search: '',
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
    //新規登録時のデフォルト値
    defaultItem: {
      tagId: null,
      tagValue: '',
    },
  }),

  computed: {
    //フィルタリングされたタグ情報一覧
    filteredTags() {
      return this.tags.filter(tbl => {
        return Object.keys(this.filters).every(col => {
          //this.filters[col]: フィルターで指定された値(配列), tbl[col]: データ行の値
          if(Object.prototype.toString.call(tbl[col]) === "[object Object]") { //オブジェクト項目
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col].value);
          } else {
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col]);
          }
        });
      });
    },
    //登録ダイアログのタイトル
    dialogTitle() {
      return this.editedIndex === -1 ? 'タグ情報追加' : 'タグ情報更新';
    },
    //入力ルール
    rule_tag() {
      return [
        !!this.editedItem.tagValue || '入力が必須の項目です',
        (this.tags.findIndex(v => v.tagValue === this.editedItem.tagValue) === -1 || (this.editedIndex !== -1 && this.tags.findIndex(v => v.tagValue === this.editedItem.tagValue) === this.editedIndex)) || 'このタグは登録済みです'
      ];
    },
  },

  created() {
    //タグ情報の取得
    this.getTags();
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
    //タグ情報の取得
    getTags() {
      this.loading = true;
      axios.get(`${process.env.API}/aec/tags?token=${process.env.INFO_TOKEN}`)
        .then(response => {
          this.tags = [...response.data.tags];
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.tags = [];
          this.loading = false;
          return;
        });
    },
    //フィルター用選択項目の値一覧の作成
    columnValueList(col, obj=false) { //項目が {value: 項目値, text: 表示テキスト} 形式の場合、objにtrueを指定する
      if(obj) {
        return this.tags.map(tbl => tbl[col].value).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        return this.tags.map(tbl => tbl[col]).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    //登録
    newItem() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.$nextTick(() => {this.$refs.form.resetValidation();});
      this.message = '';
      this.dialogEdit = true;
    },
    //更新
    editItem(item) {
      this.editedIndex = this.tags.indexOf(item);
      axios.get(`${process.env.API}/aec/tags?id=${item.tagId}&token=${process.env.INFO_TOKEN}`)
        .then(response => {
          this.editedItem = [...response.data.tags][0];
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
      if(!this.$refs.form.validate()) {
        this.message = '入力項目に誤りがあります';
        return;
      }
      //更新データ準備
      var record = {
        tagId: this.editedItem.tagId,
        tagValue: this.editedItem.tagValue,
      };
      //データベース更新
      axios.post(`${process.env.API}/aec/updatetag`, {data: record, token: process.env.INFO_TOKEN})
        .then(response => {
          if(this.editedIndex > -1) { //更新
            Object.assign(this.tags[this.editedIndex], this.editedItem);
          } else { //追加
            this.editedItem.tagId = response.data.tag.tagId;
            this.tags.push(this.editedItem);
          }
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
      this.editedIndex = this.tags.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      //削除データ準備
      var record = {
        tagId: this.editedItem.tagId,
      };
      axios.post(`${process.env.API}/aec/deletetag`, {data: record, token: process.env.INFO_TOKEN})
        .then(response => {
            this.tags.splice(this.editedIndex, 1);
            this.alertMessage = '削除しました';
          this.alert = true
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
    //アラートダイアログを閉じる
    closeAlert() {
      this.alert = false;
    },
  },
}
</script>
