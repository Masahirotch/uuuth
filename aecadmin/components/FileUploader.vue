<template>
  <v-row dense>
    <div class="group-product-image">
      <v-img v-if="thumbnail" :src="thumbnail" contain :width="200" :height="200" class="product-image"></v-img>
      <v-btn v-if="thumbnail" @click="fileDelete" icon color="white" class="btn-delete-product-image"><v-icon>mdi-close-thick</v-icon></v-btn>
    </div>
    <v-file-input
      v-model="currentFile"
      :rules="imageRule"
      accept="image/png, image/jpeg"
      prepend-icon="mdi-camera-outline"
      :label="imageLabel || '画像'"
      :clearable="false"
      @change="onFileChange"
      :disabled="readonly"
      class="product-input"
    ></v-file-input>
  </v-row>
</template>
<script>
export default {
  props : {
    maxByte: {
      type: Number,
      default: 5000000, // 5MB
    },
    imageLabel: {
      type: String,
      default: "画像"
    },
    currentUrl: {
      type: String,
      default: null
    },
    file: {
      default: null
    },
    readonly: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      // ファイルアップロード用
      thumbnail: this.currentUrl,
      currentFile: this.file,
    }
  },
  computed: {
    imageRule () {
      return [
        v => !v || (v && ['image/png', 'image/jpeg'].includes(v.type)) || '画像は.pngか.jpegでアップロードしてください。',
        v => !v || (v && v.size < this.maxByte) || '最大サイズは ' + Math.ceil(this.maxByte/1000000) + ' MB です',
      ]
    }
  },
  watch: {
    currentUrl: {
      handler (value) {
        this.thumbnail = value
      },
      deep: true,
    },
    file: {
      handler (value) {
        this.currentFile = value
        if (!value) this.thumbnail = ''
      },
      deep: true
    },
  },
  methods:{
    // ファイルのアップロード
    onFileChange (image) {
      // ファイルが指定されていない場合
      if (!image) return;
      this.thumbnail = URL.createObjectURL(image)
      this.$emit('uploadFile', image)
    },

    // ファイル取り消し
    fileDelete : function(){
      this.thumbnail = ''
      this.$emit('deleteImage')
    },
  },
};
</script>

<style scoped>
  .group-product-image {
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 5px;
  }
  .product-image {
    border: 1px solid !important;
  }
  .btn-delete-product-image {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: red;
    width: 25px;
    height: 25px;
  }
  .product-input {
    max-width: 100% !important;
  }
  .product-input >>>.v-file-input__text {
    white-space: break-spaces !important;
  }
</style>
