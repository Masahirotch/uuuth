<template>
  <div v-if="!!chat.text || !!chat.originalContentUrl">
    <v-row align="start" dense>
      <v-col md="1" cols="2" class="d-flex justify-end">
        <v-avatar size="25px">
          <img
            :alt="avatar.alt"
            :src="avatar.previewImageUrl"
          >
        </v-avatar>
      </v-col>

      <v-col cols="10" md="9">
        <div chat-message-group v-if="chat.editor.text && chat.text">
          <div chat-message-icon></div>
          <div v-html="nl2br(chat.text)" chat-text></div>
        </div>

        <div chat-image v-else-if="chat.editor.image && chat.previewImageUrl">
          <v-img :src="chat.previewImageUrl"></v-img>
        </div>

        <div chat-movie v-else-if="chat.editor.movie && chat.previewImageUrl">
          <video :poster="chat.previewImageUrl" controls preload="metadata">
            <source :src="chat.originalContentUrl" type="video/mp4">
            お使いのブラウザはvideoタグをサポートしていません。
          </video>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    chat: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      avatar: {
        alt: 'LINE配信',
        previewImageUrl: process.env.ADMIN_CHAT_AVATAR || 'https://obs.line-scdn.net/0hvpTJQoO5KV9pMz9SpEhWCFV2JzIeHS8XEQVvOx81IGpHATxbU1xvah82fztCAmpbBwVhbEgxJGpA/preview',
      }
    }
  },
  methods: {
    // 改行コードを<br> に変換
    nl2br(value) {
      if (value){
        if (value.indexOf('http') != -1){
          const regex = /(http(s)?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
          const test = value.replace(regex, `<a href='$1?openExternalBrowser=1' target='_blank'>$1</a>`)
          return test.replace(/\r?\n/g, '<br>')
        }
        return value.replace(/\r?\n/g, '<br>')
      }
    },
  }
}
</script>

<style>
  [chat-message-group] {
    position: relative;
    display: flex;
  }
  [chat-message-icon] {
    position: absolute;
    top: 0.35rem;
    left: -2px;
    width: 0;
    height: 0;
    border: 7px solid #e7e7e7;
    border-left-color: transparent;
    border-bottom-color: transparent;
    transform: scaleX(2) skewY(10deg);
  }
  [chat-text] {
    padding: 0.5rem 0.75rem;
    line-height: 1.25;
    text-align: left;
    color: #495057;
    position: relative;
    word-break: break-word;
    word-wrap: break-word;
    background: #e7e7e7;
    font-size: .875rem;
    border-radius: 1rem;
    display: inline-block;
    /* width: calc(25ch + 1.6rem); */
    max-width: calc(25ch + 1.6rem);
  }

  [chat-image] .v-image,[chat-movie] video{
    border-radius: 0.8rem;
    max-width: 250px;
  }
</style>
