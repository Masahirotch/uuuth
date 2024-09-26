<template>
  <v-dialog v-if="showFormUpload" v-model="showFormUpload" persistent max-width="600px">
    <form @submit.prevent="doImport()">
      <v-card>
        <v-card-title class="text-h6">
          <v-app-bar>
            <v-toolbar-title>発送リスト取込</v-toolbar-title>
          </v-app-bar>
        </v-card-title>
        <v-row align-md="center" style="padding-left: 25px;">
          <v-col cols="12" style="max-width: 450px;">
            <v-file-input ref="fileInput" label="ファイル選択" v-model="file" @change="onFileChange" accept=".csv" :rules="[requiredRule]"></v-file-input>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">はい</v-btn>
          <v-btn color="default" @click="closeImportModal()">キャンセル</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </form>
  </v-dialog>
</template>

<script>
import axios from "axios";
import FormData from 'form-data';

export default {
  props: {
    showFormUpload: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      file: null,
      formData: new FormData(),
      message: '',
      messageType: 'success',
      requiredRule: (value) => !!value || 'ファイル入力が必須の項目です',
    }
  },
  methods: {
    onFileChange(event) {
      if (event && event.target && event.target.files) {
        this.file = event.target.files[0];
      }
    },
    async doImport() {
      const isValid = this.$refs.fileInput.validate((valid) => { return valid; })

      if (!isValid) {
        return
      }

      try {
        this.formData.set('file', this.file);
        const {
          status,
          message
        } = await axios.post(`${process.env.API}/aec/updateOrdersShip?token=${process.env.INFO_TOKEN}`, this.formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.message = 'データは正常に更新されました';
        this.messageType = 'success';
      } catch (err) {
        this.message = 'CSV からデータを更新しようとしたときにエラーが発生しました。もう一度お試しください'
        this.messageType = 'error';
      }
      this.$emit('afterImport', {
        close: true,
        message: this.message,
        messageType: this.messageType,
      })
    },
    closeImportModal() {
      this.$emit('afterImport', {
        close: true,
        message: '',
        messageType: '',
      })
    }
  }
}
</script>

