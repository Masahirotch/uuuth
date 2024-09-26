<template>
  <v-card v-if="loggedin">
    <v-card-title>
      <!-- ツールバー -->
      <v-toolbar>
        <v-toolbar-title class="text-h6" white-space="nowrap">配信一覧</v-toolbar-title>
        <Icon @btnClick="getMessages" iconName="mdi-download-box-outline" iconTooltip="一覧を再表示" :isText="Boolean(true)" />
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details clearable></v-text-field>
        <Icon @btnClick="newItem" iconName="mdi-database-plus-outline" iconTooltip="新規配信を作成" :isText="Boolean(true)" />
      </v-toolbar>
    </v-card-title>
    <v-card-text>
      <!-- 配信一覧 -->
      <v-data-table :headers="headers" :items="filteredMessages" :loading="loading" class="elevation-1" :search="search" no-data-text="データがありません。" no-results-text="データがありません。" :footer-props="{showFirstLastPage: true, itemsPerPageOptions: [10, 25, 50, -1]}" dense>
        <!-- フィルター -->
        <template v-slot:header>
          <tbody>
            <tr>
              <td></td>
              <td><v-select v-model="filters.status" :items="status" item-text="text" item-value="value" hide-details multiple clearable dense></v-select></td>
              <td></td>
              <td><v-select v-model="filters.tag" :items="tags" item-text="tagValue" item-value="tagId" return-object hide-details multiple clearable dense></v-select></td>
              <td><v-select v-model="filters.laterSend" :items="columnValueList('laterSend', true)" hide-details multiple clearable dense></v-select></td>
              <td><v-select v-model="filters.lastSend" :items="columnValueList('lastSend', true)" hide-details multiple clearable dense></v-select></td>
            </tr>
          </tbody>
        </template>
        <!-- メッセージ -->
        <template #item.overview="{value}">
          <div class="text-truncate" style="max-width: 360px">{{value}}</div>
        </template>
        <!-- 操作 -->
        <template v-slot:[`item.action`]="{ item }">
          <div class="text-truncate">
            <Icon v-if="item.editable" @btnClick="editItem(item)" iconName="mdi-pencil-outline" iconTooltip="編集" />
            <Icon v-if="item.stoppable" @btnClick="stopMsg(item)" iconName="mdi-email-off-outline" iconTooltip="配信中止" />
            <Icon v-if="item.deletable" @btnClick="deleteItem(item)" iconName="mdi-delete-outline" iconTooltip="削除" />
          </div>
        </template>
        <!-- 配信状況 -->
        <template v-slot:[`item.status`]="{ item }">
          <div class="text-truncate">{{ getStatusText(item.status) }}</div>
        </template>
        <!-- 配信先 -->
        <template v-slot:[`item.tag`]="{ item }">
          <div class="text-truncate" style="max-width: 200px;">{{ getTagsText(item.tag) }}</div>
        </template>
        <!-- ダイアログ -->
        <template v-slot:top>
          <!-- 登録更新ダイアログ -->
          <v-dialog v-model="dialogEdit" persistent max-width="1366px">
            <v-card>
              <v-card-title>
                <!-- ツールバー -->
                <v-toolbar>
                  <v-toolbar-title class="text-h6" white-space="nowrap">LINE配信</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <!-- 配信先 -->
                  <v-col cols="3" class="linemsg-tag-list">
                    <v-select v-model="editedItem.tag" label="配信先タグ" :items="tags" item-text="tagValue" item-value="tagId" multiple hide-details clearable @blur="getDeliveries"></v-select>
                  </v-col>
                  <v-divider class="mx-2" inset vertical></v-divider>
                  <!-- 配信日時 -->
                  <v-col cols="1">
                    <v-checkbox v-model="designation" label="予約" hide-details @change="setDesignation"></v-checkbox>
                  </v-col>
                  <v-col cols="3">
                    <v-row no-gutters>
                      <v-col cols="8">
                        <v-menu v-model="datePicker">
                          <template v-slot:activator="{on}">
                            <v-text-field v-model="date" label="配信日" prepend-icon="mdi-calendar" readonly hide-details :disabled="immediate" clearable v-on="on"></v-text-field>
                          </template>
                          <v-date-picker v-model="date" type="date" locale="ja-jp" :day-format="date => new Date(date).getDate()" no-title></v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-col cols="4">
                        <v-menu v-model="timePicker" :close-on-content-click="false">
                          <template v-slot:activator="{on}">
                            <v-text-field v-model="time" label="時刻" readonly hide-details clearable :disabled="immediate" v-on="on"></v-text-field>
                          </template>
                          <v-time-picker v-model="time" format="24hr" min="05:00" max="22:00" :allowed-minutes="[0,15,30,45]" scrollable></v-time-picker>
                        </v-menu>
                      </v-col>
                    </v-row>
                  </v-col>
                  <Icon @btnClick="saveMsg" iconName="mdi-database-outline" iconTooltip="保存" :isText="Boolean(true)" />
                  <Icon @btnClick="testMsg" iconName="mdi-email-check-outline" iconTooltip="テスト配信" :isText="Boolean(true)" />
                  <Icon @btnClick="sendMsg" :iconDisabled="!doTest" iconName="mdi-email-multiple-outline" iconTooltip="本番配信" :isText="Boolean(true)" />
                  <Icon @btnClick="close" iconName="mdi-close" iconTooltip="閉じる" :isText="Boolean(true)" />
                </v-toolbar>
              </v-card-title>
              <v-card-text>
                <v-row>
                  <!-- 編集 -->
                  <v-col cols="12" md="8">
                    <v-card>
                      <!-- ツールバー -->
                      <v-toolbar dense>
                        <v-toolbar-title white-space="nowrap">メッセージ編集</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <Icon @btnClick="preview" iconName="mdi-text-box-search-outline" iconTooltip="プレビュー" :isText="Boolean(true)" />
                        <Icon @btnClick="addItem" iconName="mdi-plus" iconTooltip="メッセージ追加" :isText="Boolean(true)" />
                      </v-toolbar>
                      <v-card v-for="(item, index) in editedItem.message" :key="`m${index}`">
                        <!-- タイトル行 -->
                        <v-card-title>
                          <v-app-bar dense>
                            <Icon @btnClick="editor('text', index)"  :className="editedItem.message[index].editor.text ? 'active-content-type' : ''" iconName="mdi-message-text-outline" iconTooltip="テキストを追加" :isText="Boolean(true)" />
                            <Icon @btnClick="editor('image', index)" :className="editedItem.message[index].editor.image ? 'active-content-type' : ''" iconName="mdi-image-outline" iconTooltip="画像を追加" :isText="Boolean(true)" />
                            <Icon @btnClick="editor('movie', index)" :className="editedItem.message[index].editor.movie ? 'active-content-type' : ''" iconName="mdi-video-outline" iconTooltip="動画を追加" :isText="Boolean(true)" />

                            <v-spacer></v-spacer>
                            <Icon @btnClick="aheadItem(index)" iconName="mdi-chevron-up" iconTooltip="1つ上に移動" :isText="Boolean(true)" />
                            <Icon @btnClick="behindItem(index)" iconName="mdi-chevron-down" iconTooltip="1つ下に移動" :isText="Boolean(true)" />
                            <Icon @btnClick="removeItem(index)" iconName="mdi-close" iconTooltip="削除" :isText="Boolean(true)" />
                          </v-app-bar>
                        </v-card-title>
                        <!-- 編集アイテム -->
                        <v-card-text>
                          <!-- テキスト -->
                          <v-row v-if="editedItem.message[index].editor.text">
                            <v-col cols="12" md="9">
                              <v-textarea v-model="editedItem.message[index].text" outlined auto-grow rows=4 counter clearable :rules="[size(500)]">
                                <template slot="label"><v-icon>mdi-message-text-outline</v-icon>テキスト</template>
                              </v-textarea>
                            </v-col>
                          </v-row>
                          <!-- 画像 -->
                          <v-row v-if="editedItem.message[index].editor.image">
                            <v-col cols="12" md="6">
                              <v-file-input @change="onFileChange($event, index)" v-model="editedItem.message[index].image" :rules="[sizeRule]" accept="image/png, image/jpeg, image/gif" label="画像" prepend-icon="mdi-image-outline">
                              </v-file-input>
                            </v-col>
                            <v-col cols="12" md="6">
                              <v-img :src="thumbnail[index]" :width="160"></v-img>
                            </v-col>
                          </v-row>
                          <!-- 動画 -->
                          <v-row v-if="editedItem.message[index].editor.movie">
                            <v-col cols="12" md="6">
                              <v-file-input v-model="editedItem.message[index].movie" accept="video/mp4" label="動画" prepend-icon="mdi-video-outline" @change="onVideoPicked(index, $event)">
                              </v-file-input>
                            </v-col>
                            <v-col cols="12" md="6" v-if="videosource[index]">
                              <video controls width="320" :src="videosource[index]"></video>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-card>
                  </v-col>
                  <!-- プレビュー -->
                  <v-col cols="12" md="4">
                    <v-card>
                      <!-- ツールバー -->
                      <v-toolbar dense>
                        <v-toolbar-title white-space="nowrap">プレビュー</v-toolbar-title>
                        <small v-if="numDelivery">({{numDelivery}}件)</small>
                      </v-toolbar>
                      <v-card-text v-if="chat">
                        <!-- プレビューエリア -->
                        <PreviewMessage v-for="(message, index) in chat" :key="`msg:${index}`" :chat="message"></PreviewMessage>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-dialog>
          <!-- 削除ダイアログ -->
          <v-dialog v-model="dialogDelete" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">
                メッセージID{{editedItem.messageId}}を削除してよろしいですか？
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
          <v-dialog v-model="dialogChangeDateTime" persistent max-width="500px">
            <v-card>
              <v-card-title class="text-h6">
                <span v-if="designation">本番配信を予約します。よろしいですか</span>
                <span v-else>本番配信します。よろしいですか</span>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="sendChangeDateTimeConfirm">はい</v-btn>
                <v-btn color="primary" @click="closeDialogChangeDateTime">いいえ</v-btn>
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
import PreviewMessage from '../components/PreviewMessage';

export default {
  name: 'LineMessagePage',
  components: {
    PreviewMessage
  },

  data: () => ({
    //ログイン中
    loggedin: false,
    //メッセージ一覧
    messages: [],
    //ダウンロード中プログレスバー表示
    loading: false,
    //トークン
    apiToken: '',
    //配信一覧ヘッダ
    headers: [
      {text: 'ID', value: 'messageId', width: 75},
      {text: '配信状況', value: 'status'},
      {text: 'メッセージ', value: 'overview'},
      {text: '配信先', value: 'tag'},
      {text: '配信予約', value: 'laterSend.value'},
      {text: '配信日時', value: 'lastSend.value'},
      {text: '操作', value: 'action', width: 60, align: 'end', sortable: false, filterable: false},
    ],
    //フィルター
    filters: {
      status: [],
      tag: [],
      laterSend: [],
      lastSend: [],
    },
    //検索値
    search: '',
    //ファイルアップロード用
    movieUrl   : '',
    fileUrl    : '',
    fileName   : '',
    fileType   : '',
    uploadFile : '',
    //配信状況
    status: [
      {value: '', text: '下書き'},
      {value: 'test', text: '配信テスト'},
      {value: 'now', text: '即時配信'},
      {value: 'reserve', text: '配信予約中'},
      {value: 'later', text: '予約配信完了'},
    ],
    doTest: false, //配信テスト実行済み
    //配信予約
    laterSend: [
    ],
    //配信日時
    lastSend: [
    ],
    //配信予約設定
    immediate: true,    //即時配信
    designation: false, //日時指定配信
    date: null,
    time: '10:00',
    datePicker: false,
    timePicker: false,
    //配信対象
    tags: [], //タグ一覧
    tag: [],  //配信対象タグ
    //配信先
    delivery: [], //配信対象LINE ID
    //編集データ
    editedIndex: -1,
    editedItem: {
      message: [{
        editor: {text: true, image: false, movie: false},
        text: '',
        originalContentUrl: '',
        previewImageUrl: '',
      }],
      tag: [],
      laterSend: '',
    },
    //新規登録時のデフォルト値
    defaultItem: {
      messageId: '',
      status: '',
      message: [{
        editor: {text: true, image: false, movie: false},
        text: '',
        originalContentUrl: '',
        previewImageUrl: '',
      }],
      tag: [],
      laterSend: '',
      lastSend: '',
    },
    //メッセージアイテムの最大件数
    maxItems: 3,
    //入力ルール
    size: len => v => (v || '').length <= len || `${len}文字以内です`,
    //プレビューデータ
    chat: '',
    //登録更新削除ダイアログ
    dialogEdit: false,
    dialogDelete: false,
    dialogMessage: '',
    //アラートダイアログ
    alert: false,
    alertMessage: '',
    dialogChangeDateTime: false,
  }),

  computed: {
    //フィルタリングされた配信情報一覧
    filteredMessages() {
      return this.messages.filter(tbl => {
        return Object.keys(this.filters).every(col => {
          //this.filters[col]: フィルターで指定された値(配列), tbl[col]: データ行の値
          if(col == 'tag') { //配信先
            let arr = [...this.filters[col].map((v)=>v.tagId), ...tbl[col]];
            return this.filters[col].length < 1 || new Set(arr).size !== arr.length;
          } else if(Object.prototype.toString.call(tbl[col]) === "[object Object]") { //オブジェクト項目
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col].text);
          } else {
            return this.filters[col].length < 1 || this.filters[col].includes(tbl[col]);
          }
        });
      });
    },
    //配信予約日時
    reserve() {
      return this.date+' '+this.time;
    },
    //配信対象件数
    numDelivery() {
      return this.delivery.length;
    },
    //画像サムネイル
    thumbnail() {
      let urls = [];
      this.editedItem.message.forEach((message, index)=> {
        if(message.image instanceof File) {
          urls.push(URL.createObjectURL(message.image));
        } else if(message.previewImageUrl) {
          urls.push(message.previewImageUrl);
        } else {
          urls.push('');
        }
      });
      return urls;
    },
    //動画ソース
    videosource() {
      let urls = [];
      this.editedItem.message.forEach((message)=> {
        if (message.editor.movie) {
          urls.push(message.originalContentUrl)
        } else if (message.originalContentUrl) {
          urls.push(message.originalContentUrl)
        } else {
          urls.push('');
        }
      });

      return urls;
    },
  },

  watch: {
    'editedItem.message': {
      handler: function (val, oldVal) {this.doTest = false;},
      deep: true
    }
  },

  created() {
    //プルダウン項目の取得
    this.getTags();
  },

  mounted() {
    //ログイン中でなければログインページを表示
    if('aeclogin' in sessionStorage) {
      this.loggedin = true;
    } else {
      this.$router.replace('/');
    }
    this.date = this.$dayjs().format('YYYY-MM-DD');
    //メッセージ一覧の取得
    this.getMessages();
  },

  methods: {
    //タグ一覧の取得
    getTags() {
      axios.get(`${process.env.API}/aec/tags?token=${process.env.INFO_TOKEN}`)
        .then(response => {
          this.tags = [...response.data.tags];
        })
        .catch(error => {
          console.log(error);
          this.tags = [];
        });
    },
    //メッセージ一覧の取得
    getMessages() {
      this.loading = true;
      axios.get(`${process.env.API}/aec/messages`, {
        params: {
          token: process.env.INFO_TOKEN
        }
      }).then(response => {
        this.messages = [...response.data.messages];
        this.loading = false;
        //取得データを表示用に変換
        this.messages.forEach(record =>  {
          //メッセージ
          record.overview = this.overview(record.message);
          //配信予約: '予約あり'(!!laterSend), '無'(laterSend=='' or is null))
          record.laterSend = {value: record.laterSend, text: !!record.laterSend ? '予約あり' : '－'};
          //配信日時: '配信済'(!!lastSend), '未'(lastSend=='' or is null))
          record.lastSend = {value: record.lastSend, text: !!record.lastSend ? '配信済' : '－'};
          //操作
          record.editable = record.status != 'reserve';
          record.stoppable = record.status == 'reserve';
          record.deletable = (!record.lastSend.value) && (record.status != 'reserve');
        });
      }).catch(error => {
        console.log(error);
        this.messages = [];
        this.loading = false;
      });
    },
    //フィルター用選択項目の値一覧の作成
    columnValueList(col, obj=false) { //項目が {value: 項目値, text: 表示テキスト} 形式の場合、objにtrueを指定する
      if(obj) {
        return this.messages.map(tbl => tbl[col].text).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      } else {
        return this.messages.map(tbl => tbl[col]).sort((a, b) => typeof a === 'string' ? a.localeCompare(b, 'ja') : a - b);
      }
    },
    //ステータスの一覧表示表示をコードからステータス名に変換
    getStatusText(value) {
      if(!value) return '下書き';
      const status = this.status.find(s => s.value === value);
      return status?.text || '下書き';
    },
    //タグの一覧表示をタグ名に変換
    getTagsText(tags) {
      if(!tags) return [];
      return this.tags.filter(tag => tags.includes(tag.tagId)).map(tag => `"${tag.tagValue}"`).join(' , ');
    },
    //配信日時の入力可否
    setDesignation() {
      this.immediate = !this.designation;
    },
    //配信先の取得
    getDeliveries() {
      let param = `?tag=${this.editedItem.tag.join(',')}&token=${process.env.INFO_TOKEN}`;
      axios.get(`${process.env.API}/aec/delivery${param}`)
        .then(response => {
          this.delivery = response.data.delivery;
        })
        .catch(error => {
          console.log(error);
          this.delivery = [];
        });
      },
    //---------- メッセージの編集 ----------
    //メッセージアイテムのデータ種別の切り替え
    editor(contentType, index) {
      for(let key in this.editedItem.message[index].editor) {
        this.editedItem.message[index].editor[key] = false
      }

      this.editedItem.message[index].editor[contentType] = true

      this.editedItem.message[index].text = ''
      this.editedItem.message[index].originalContentUrl = ''
      this.editedItem.message[index].previewImageUrl  = ''
      this.editedItem.message[index].image  = null
      this.editedItem.message[index].movie  = null
      this.thumbnail[index] = null
    },
    //メッセージアイテムを追加する
    addItem() {
      if(this.editedItem.message.length > (this.maxItems - 1) ) return;
      this.editedItem.message.push({
        editor: {text: true, image: false, movie: false},
        text: '',
        originalContentUrl: '',
        previewImageUrl: '',
      });
    },
    //メッセージアイテムを削除する
    removeItem(index) {
      if(this.editedItem.message.length < (this.maxItems - 1) ) return;
      this.editedItem.message.splice(index, 1);
    },
    //メッセージアイテムの順番を上げる
    aheadItem(index) {
      if(index == 0) return;
      this.editedItem.message.splice(index-1, 2, this.editedItem.message[index], this.editedItem.message[index - 1]);
    },
    //メッセージアイテムの順番を下げる
    behindItem(index) {
      if(index >= this.editedItem.message.length - 1) return;
      this.editedItem.message.splice(index, 2, this.editedItem.message[index + 1], this.editedItem.message[index]);
    },
    //動画表示
    onVideoPicked(index, file) {
      // ファイルが指定されていない場合
      if (!file){
        this.fileDelete(index);
        this.videosource[index] = null;
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.videosource[index] = reader.result
      });
      reader.readAsDataURL(file);
     this.onFileChange(file, index)
    },
    //プレビュー画面表示切替
    preview() {
      if(!this.chat)
        this.chat = this.editedItem.message;
      else
        this.chat = '';
    },
    //テキストメッセージを抽出する
    overview(msg) {
      for(let i = 0; i < this.maxItems; i++) {
        if(msg[i]?.editor?.text) return msg[i].text;
      }
      return '';
    },
    //---------- メッセージの保存と配信の実行 ----------
    //メッセージを一時保存する
    saveMsg() {
      this.save('');
      //完了ダイアログ表示
      this.alertMessage = '保存しました';
      this.alert = true;
      this.close();
    },
    //メッセージをテスト配信する
    testMsg() {
      if (!this.checkValidation()) return false;
      this.sendLine('test', this.editedItem.messageId);
      //完了ダイアログ表示
      this.alertMessage = 'テスト配信しました';
      this.doTest = true;
      this.alert = true;
    },
    //メッセージを配信する
    sendMsg() {
      this.dialogChangeDateTime = true
    },
    sendChangeDateTimeConfirm() {
      this.dialogChangeDateTime = false
      if (!this.checkValidation()) return false;
      if (this.designation) { //指定時刻配信
        this.save('reserve').then(msgId => {
          this.sendLine('reserve', msgId);
          this.alertMessage = '配信予約しました';
          this.alert = true;
          this.close();
        });
      } else { // 即時配信
        this.save('now').then(msgId => {
          this.sendLine('now', msgId);
          this.alertMessage = '配信しました';
          this.alert = true;
          this.close();
        });
      }
    },
    closeDialogChangeDateTime() {
      this.dialogChangeDateTime = false;
    },
    //メッセージのを指定時刻配信を停止する
    stopMsg(item) {
      this.editedIndex = this.messages.indexOf(item);
      this.messages[this.editedIndex].status = '';
      this.editedItem = JSON.parse(JSON.stringify(this.messages[this.editedIndex]));
      this.messages[this.editedIndex].editable = this.messages[this.editedIndex].status != 'reserve';
      this.messages[this.editedIndex].stoppable = this.messages[this.editedIndex].status == 'reserve';
      this.messages[this.editedIndex].deletable = (!this.messages[this.editedIndex].lastSend.value) && (this.messages[this.editedIndex].status != 'reserve');
      this.sendLine('stop', item.messageId);
    },
    //---------- メッセージの保存の実行 ----------
    //登録
    newItem() {
      this.editedIndex = -1;
      this.editedItem = JSON.parse(JSON.stringify(this.defaultItem));
      this.dialogMessage = '';
      this.dialogEdit = true;
      this.doTest = false;
      this.designation = false;
      this.setDesignation();
      this.preview();
      if (this.videosource.length > 0) {
        this.videosource.forEach((item, index) => {
          this.videosource[index] = null
        })
      }
    },
    //更新
    editItem(item) {
      if (this.videosource.length > 0) {
        this.videosource.forEach((item, index) => {
          this.videosource[index] = null
        })
      }
      this.editedIndex = this.messages.indexOf(item);
      axios.get(`${process.env.API}/aec/message`, {
        params: {
          token: process.env.INFO_TOKEN,
          id: item.messageId,
        }
      }).then(response => {
        this.editedItem = response.data.message;

        if(this.editedItem.laterSend) {
          this.designation = true;
          this.date = this.editedItem.laterSend.substr(0, 10);
          this.time = this.editedItem.laterSend.substr(11, 5);
        } else {
          this.designation = false;
          this.date = '';
          this.time = '';
        }
        this.getDeliveries();
        this.setDesignation();
        this.dialogMessage = '';
        this.dialogEdit = true;
        this.doTest = false;
        this.preview();
      }).catch(error => {
        console.log(error);
        this.editedItem = [];
      });
    },
    save(param) {
      //更新データ準備
      var record = {
        messageId: this.editedItem.messageId,
        status: param,
        message: this.editedItem.message,
        tag: this.editedItem.tag,
        laterSend: this.designation ? this.date+' '+this.time : ''
      };
      //データベース更新
      return axios.post(`${process.env.API}/aec/updatemsg`, {
        token: process.env.INFO_TOKEN,
        data: record
      }).then(response => {
        this.getMessages();
        //完了ダイアログ表示
        this.alertMessage = '保存しました';
        this.alert = true;
        this.editedItem.messageId = +response.data.messageId;
        return this.editedItem.messageId;
      }).catch(error => {
        console.log(error);
      });
    },
    close() {
      this.dialogEdit = false;
      this.resetInfo()
    },
    //削除
    deleteItem(item) {
      this.editedIndex = this.messages.indexOf(item);
      this.editedItem = JSON.parse(JSON.stringify(item));
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      const record = {
        msgId: this.editedItem.messageId,
        deletable: (!this.editedItem.lastSend.value) && (this.editedItem.status != 'reserve'),
      }
      axios.post(`${process.env.API}/aec/deletemessage`, {token: process.env.INFO_TOKEN, data: record})
        .then(response => {
          this.messages.splice(this.editedIndex, 1);
          this.alertMessage = '削除しました';
          this.alert = true;
          this.closeDelete();
        })
        .catch(error => {
          console.log(error);
          this.alertMessage = error.message;
          this.alert = true;
        });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.resetInfo()
    },
    //アラートダイアログを閉じる
    closeAlert() {
      this.alert = false;
    },
    //---------- メッセージ配信の実行 ----------
    //LINEメッセージ配信の実行
    sendLine(param, msgId = 0) {
      //param: {'test': テスト配信, 'now': 即時配信, 'reserve': 指定時刻配信(this.editedItem.laterSend), 'stop': 指定時刻配信を停止}
      // APIサーバ側でLINE配信が、即実行(test,now) または指定時刻に実行(reserve) または停止(stop)される。
      // 配信が完了したら配信日時が更新される。
      // 指定時刻配信(status=='reserve')なら status='later'になる。
      // 停止の場合は status=''になる。
      this.editedItem.messageId = msgId;
      axios.post(`${process.env.API}/aec/linemsg/sendline`, {token: process.env.INFO_TOKEN, data: { send: param, msg: this.editedItem, to: this.delivery }})
      .then(response => {
        let result = response;
        this.doTest = true;
      })
      .catch(error => {
        console.log(error);
      })
    },
    //トークンの取得
    setToken: async function () {
      return axios.post(`${process.env.API}/getToken`, {
        token: process.env.INFO_TOKEN,
      }).then(result => {
        this.apiToken = JSON.parse(JSON.stringify(result.data.token))
      }).catch(error => {
        console.log(error);
      })
    },
    //ファイルが指定されたときの処理
    onFileChange: async function (e, index) {
      const file = e;
      // ファイルが指定されていない場合
      if (!file){
        this.fileDelete(index);
        return;
      }
      const type = file.type;
      const size = file.size;
      // 有効なファイルではない
      if ((type != 'image/png' && type != 'image/jpeg' && type != 'image/gif') && !type.match('video/*')) {
        this.fileDelete(index);
        this.errorFile('有効なファイルではありません');
        return;
      }
      // 画像の場合の処理 //////////////
      if (type == 'image/png' || type == 'image/jpeg' || type == 'image/gif') {
        // タブが画像タブじゃない
        if (!this.editedItem.message[index].editor.image) {
          this.fileDelete(index);
          this.errorFile('有効な動画ファイルではありません');
          return;
        }
        if (size < 11360000) {
          this.fileName = file.name
          this.fileType = file.type
          this.uploadFile = file
          this.createImage(file, index)
        } else {
          this.fileDelete(index);
          this.thumbnail[index] = null;
          this.errorFile('ファイルサイズは10MB以下です');
          return;
        }
      }
      // 動画の場合の処理 //////////////
      if (type.match('video/*')) {
        // タブが動画タブじゃない
        if (!this.editedItem.message[index].editor.movie) {
          this.fileDelete(index);
          this.videosource[index] = null;
          this.errorFile('有効な画像ファイルではありません');
          return;
        }
        if (size < 113600000) {
          this.fileName = file.name
          this.fileType = file.type
          this.uploadFile = file
          this.createMovie(file, index)
        } else {
          this.fileDelete(index);
          this.errorFile('ファイルサイズは100MB以下です');
        }
      }
    },
    //ファイル情報の消去
    fileDelete : function(index){
      this.editedItem.message[index].originalContentUrl = ''
      this.editedItem.message[index].previewImageUrl  = ''
    },
    //エラーダイアログの表示
    errorFile : function(msg){
      this.alertMessage = msg;
      this.alert = true;
    },
    // 画像作成（base64エンコード）//////////////////////////////////
    createImage : function(file, targetIndex){
      const reader = new FileReader();
      reader.onload = e => {
        this.fileUrl = e.target.result;
        this.imageSetting(targetIndex);
      };
      reader.readAsDataURL(file);
    },
    // 動画作成（base64エンコード）//////////////////////////////////
    createMovie: function (file, targetIndex) {
      const reader = new FileReader()
      reader.onload = e => {
        this.movieUrl = JSON.parse(JSON.stringify(e.target.result))
        this.fileUrl = this.createThumbnails(this.movieUrl, targetIndex)
      }
      reader.readAsDataURL(file)
    },
    // 動画サムネイル作成（base64エンコード）//////////////////////////////////
    createThumbnails(src , targetIndex) {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      //  読み込みが完了したらcanvas サイズを設定
      video.onloadeddata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = 0
      }
      //  video.currentTime が変更されたらキャプチャ
      video.onseeked = () => {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        this.fileUrl =  canvas.toDataURL('image/jpeg')
        this.movieSetting(targetIndex)
      }
      // 動画を読み込む
      video.src = src
      video.load()
    },
    //画像ファイルのアップロード
    imageSetting: async function (targetIndex) {
      this.loading = true
      await this.setToken()
      // 画像のみをCDNにアップロード ////////////////////////////////////
      axios.post(`${process.env.API}/uploadFileCDN`, {
        token: this.apiToken,
        imageBase64: this.fileUrl,
      }).then(result => {
        this.editedItem.message[targetIndex].originalContentUrl = result.data.files.orgn
        this.editedItem.message[targetIndex].previewImageUrl = result.data.files.thmb
        this.loading = false
      }).catch(error => {
        this.loading = false
        console.log(error);
      })
    },
    //動画ファイルのアップロード
    movieSetting: async function (targetIndex) {
      if (this.fileUrl == '') {
        this.errorFile('データの処理に失敗しました。')
        this.fileDelete(targetIndex)
        return
      }
      this.loading = true
      await this.setToken()
      // CDNにアップロード ////////////////////////////////////
      axios.post(`${process.env.API}/uploadFileCDN`, {
        token: this.apiToken,
        imageBase64: this.fileUrl,
        videoBase64: this.movieUrl,
      }).then(result => {
        if (result.data == 'error') {
          this.errorFile('ファイルのアップロードに失敗しました')
        } else {
          this.editedItem.message[targetIndex].originalContentUrl = JSON.parse(JSON.stringify(result.data.files.vdeo))
          this.editedItem.message[targetIndex].previewImageUrl = JSON.parse(JSON.stringify(result.data.files.thmb))
        }
        this.loading = false
      }).catch(error => {
        this.loading = false
        console.log(error);
      })
    },
    //ファイルサイズ確認
    sizeRule: value => {
      if(value instanceof File) {
        // 画像の場合の処理 //////////////
        if (value.type == 'image/png' || value.type == 'image/jpeg' || value.type == 'image/gif') {
          if (value.size < 11360000) {
            return true;
          } else {
            return 'ファイルサイズは10MB以下です'
          }
        }
        // 動画の場合の処理 //////////////
        if (value.type.match('video/*')) {
          if (value.size < 113600000) {
            return true;
          } else {
            return 'ファイルサイズは100MB以下です'
          }
        }
      }
      return true;
    },
    resetInfo () {
      this.date = this.$dayjs().format('YYYY-MM-DD');
      this.time = '10:00';
      this.designation = false;
      this.editedItem = JSON.parse(JSON.stringify(this.defaultItem));
      this.editedIndex = -1;
      this.chat = '';
    },
    checkValidLaterSend () {
      if (!this.designation) return true;
      if (!this.date || !this.time) {
        this.errorFile('配信日または時刻が未入力です');
        return false;
      }
      if (this.$dayjs(`${this.date} ${this.time}`).isBefore(this.$dayjs(), 'minute')) {
        this.errorFile('配信予定日は現在より未来の日時を設定してください');
        return false;
      }
      return true;
    },
    checkValidation () {
      let flg = false;
      for (const message of this.editedItem.message) {
        if (!!message.text?.trim() || !!message.originalContentUrl || !!message.previewImageUrl) {
          flg = true;
          break;
        }
      }
      if (!flg) {
        this.errorFile('メッセージ内容を入力してください');
        return false;
      }
      if ((this.editedItem?.tag || []).length == 0) {
        this.errorFile('配信先を設定してください');
        return false;
      }
      return this.checkValidLaterSend();
    },
  },
}
</script>

<style scoped>
.tag-list .v-select__selections {
  height: 35px !important;
  overflow-y: hidden !important;
}

.active-content-type {
  background: #cccccc94;
}
</style>
