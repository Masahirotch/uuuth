<template>
  <div chat-content v-if=" chat.text != '' || chat.originalContentUrl != '' ">

    <div avatar-box>
      <img src="https://obs.line-scdn.net/0hvpTJQoO5KV9pMz9SpEhWCFV2JzIeHS8XEQVvOx81IGpHATxbU1xvah82fztCAmpbBwVhbEgxJGpA/preview">
    </div>

    <div chat-box>
      <div chat-header>
        日吉の野菜情報
      </div>
      <div send-content>

          <div v-if="chat.editor.text && chat.text" chat-text v-html="nl2br(chat.text)" ></div>

          <div chat-image v-if="chat.editor.image && chat.previewImageUrl != '' ">
            <img :src="chat.previewImageUrl" >
          </div>

          <div chat-movie v-if="chat.editor.movie && chat.previewImageUrl != '' ">
            <video :src="chat.originalContentUrl" chat-img preload="metadata" :poster="chat.previewImageUrl"></video>
          </div>


      </div>
    </div>

  </div>
</template>

<script>
// https://evchat.cdn.line.cx/63453545435__4E249DBD-67F3-4CFB-9796-B93EAD4A0C88_1612842666.mov
// https://evchat.cdn.line.cx/main_63453545435__4E249DBD-67F3-4CFB-9796-B93EAD4A0C88_1612842666.jpg

  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'
  import {util} from '../mixin/mixinUtils'

export default {

  mixins:[util],

  props : [
    'chat'
  ],
  data() {
    return {


    }
  },
  watch : {

  },
  mounted(){
    console.dir(this.chat)
  },

  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'info' , ['allParent']),
  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'info' , ['setAllParent']),


  },

};
</script>
<style>



[chat-content]{
    display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: flex-start;
    margin-bottom: 0.5rem;
    font-size: .875rem;
}



[avatar-box]{
    width: 3rem;
    height: 3rem;
    border-radius: 50%;    margin-right: 0.75rem;
    overflow: hidden;
    vertical-align: middle;
    display: inline-block;
    position: relative;
}
[avatar-box] img{
    width: 3rem;
    height: 3rem;
    object-fit: cover;
    object-position: 50% 50%;
    border-radius: 50%;
}




[chat-box]{
  max-width: 270px;
  margin-bottom: 0.5rem;
}

[chat-header]{
  color: #dee2e6 !important;
  line-height: 1;
  margin-bottom: 0.25rem;
  font-size: .875rem;
  word-wrap: break-word;
}
/* TEXT */


[chat-text]{
    padding: 0.5rem 0.75rem;
    line-height: 1.25;
    text-align: left;
    color: #495057;
    position: relative;
    word-break: break-word;
    word-wrap: break-word;
    background: #FFF;
    font-size: .875rem;
    border-radius: 1rem;
    display: inline-block;
}
[chat-text]:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0.75rem;
    width: 0;
    height: 0;
    border: 0.5rem solid transparent;
    border-right-color: #edeff0;
    border-left: 0;
    border-top: 0;
    margin-left: -0.375rem;
}


/* image */
[chat-image],[chat-movie]{
    border-radius: 0.5rem;
    max-width: 200px;
}






[chat-image] img,[chat-movie] video{
    border-radius: 0.5rem;
    width: 100%;
    height: auto;
    object-fit: cover;
    margin-bottom: 0;
}

[chat-movie]{
  position: relative;
}

[chat-movie]::before{
  content: "";
   display : inline-flex;flex-flow:column nowrap;justify-content: center; align-items: center;
  border: 1px solid #FFF;
  border-radius: 1em;
  width: 2em;
  height: 2em;
  position: absolute;
  left: calc(100px - 1em);
  top:calc(35% - 0.25em);
}

[chat-movie]::after{
  content: "\025b6";
  color: #FFF;
  position: absolute;
  top:35%;
  left: calc(100px - 0.5em);
}

/*
[preview-inner] [chat-content]:nth-of-type(2) [avatar-box] img,
[preview-inner] [chat-content]:nth-of-type(3) [avatar-box] img{
    opacity:0;
}
[preview-inner] [chat-content]:nth-of-type(2) [chat-text]:after,
[preview-inner] [chat-content]:nth-of-type(3) [chat-text]:after{
    opacity:0;
}
[preview-inner] [chat-content]:nth-of-type(2) [chat-header],
[preview-inner] [chat-content]:nth-of-type(3) [chat-header]{
    display:none;
}
*/


</style>
