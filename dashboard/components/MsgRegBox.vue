<template>
    <div msg-reg-box>

        <div msg-reg-header>
            <div msg-reg-select>
                <el-tooltip class="item" effect="dark" content="テキストメッセージを作成します">
                    <span @click="changeEditor('text')"><i class="el-icon-chat-line-round"></i></span>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" content="画像メッセージを作成します" >
                    <span @click="changeEditor('image')"><i class="el-icon-picture-outline"></i></span>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" content="動画メッセージを作成します">
                    <span @click="changeEditor('movie')"><i class="el-icon-video-camera"></i></span>
                </el-tooltip>
            </div>

            <div msg-reg-position v-if="position">
                <i class="el-icon-arrow-up" ></i>
                <i class="el-icon-arrow-down" ></i>
                <i class="el-icon-close" ></i>
            </div>

        </div>

          <!-- msg-edit-box -->
          <div msg-edit-box>

              <div v-if="isText">
                <el-input type="textarea" placeholder="テキストを入力" v-model="inputText.origin_name" maxlength="500" show-word-limit :autosize="{ minRows: 6, maxRows: 12}"></el-input>
              </div>

              <div v-if="isImage">
                <ImageUploader @uploadImage="uploadImage" ref="imgUploader"/>
              </div>

              <div v-if="isMovie">
                <MovieUploader @uploadMovie="uploadMovie" ref="movUploader"/>
              </div>

          </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'value','position' ],

    data() {

        return {

            loading   : true,
            activeTab : 'text',

            // 入力されたコンテンツ
            inputText   : {
                            file_id     : 0,
                            file_url    : '',
                            origin_name : '',
                            thumbnail   : ''
                        },

            // 入力されたコンテンツ
            content   : this.value,

        }

    },
    watch:{

        inputText: {

            handler: function (val) {

                this.content = this.inputText
                
            },
            deep: true
        },

        content: {

            handler: function (val) {

                //親コンポーネントに送信
                this.$emit( 'fromRegbox' , val )
                
            },
            deep: true
        }

    },
    
    computed: {

        isText  : function(){ return ( this.activeTab == 'text' )? true : false },
        isImage : function(){ return ( this.activeTab == 'image' )? true : false },
        isMovie : function(){ return ( this.activeTab == 'movie' )? true : false },

    },

    methods:{

        /*****************************************************************
        * エディタの切り替え
        ******************************************************************/
        changeEditor : function( target ){

            this.activeTab = target

        },

        /*****************************************************************
        * アップロードされた画像
        ******************************************************************/
        uploadImage : function( uploadImage ){

            this.content = uploadImage

        },

        uploadMovie : function( uploadMovie ){

            this.content = uploadMovie

        },

        fileClear(){

            this.inputText  = {
                            file_id     : 0,
                            file_url    : '',
                            origin_name : '',
                            thumbnail   : ''
                        }

        
        }

    },
};
</script>
<style scoped>
[send-message-content]{width:100%}[content-area-header]{position:sticky;top:0;background:#fff;padding:1em 2em;display:flex;flex-flow:row nowrap;justify-content:space-between;align-items:center;width:100%;z-index:8;border-bottom:1px solid #ccc}[content-area]{padding:2em;display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:flex-start}[content-left]{width:calc(100% - (370px + 2em));padding-bottom:10em}[content-right]{width:calc(370px + 2em);display:flex;flex-flow:column nowrap;justify-content:flex-start;align-items:flex-end;position:fixed;bottom:0;right:1em}[setting-area]{margin-bottom:3em}[send-setting]{display:flex;flex-flow:row nowrap;justify-content:space-between;align-items:stretch}[destination-group],[senddate-group]{display:inline-flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center}[destination-group] label,[senddate-group] label{padding:0}[senddate-group] .el-radio-button__inner:hover{color:#60b337}[senddate-group] .el-radio-button__orig-radio:checked+.el-radio-button__inner{background-color:#60b337;border-color:#60b337;box-shadow:none}[senddate-group] .el-radio-button__orig-radio:checked+.el-radio-button__inner:hover{color:#fff}[senddate-group] *,[senddate-group] :focus{outline:0;box-shadow:none}[msg-reg-box]{border:1px solid #ccc}[msg-reg-box]:not(:nth-of-type(1)){margin-top:1em}[msg-reg-header]{width:100%;padding:.8em 1em;background:rgba(0,0,0,.03);border-bottom:1px solid #ccc;display:flex;flex-flow:row nowrap;justify-content:space-between;align-items:center}[msg-reg-select]{display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center}[msg-reg-select]>span{padding:.5em 1em}[msg-reg-select]>span.selected{color:#212529;background-color:#dae0e5;border-color:#d3d9df}[msg-reg-select]>span:hover{background-color:#e7ebef}[msg-reg-select]>span i{transform:scale(1.3)}[msg-reg-select]>span:hover{cursor:pointer}[msg-reg-position]{display:inline-flex}[msg-reg-position] i{transform:scale(1.5);margin-left:1.5em}[msg-reg-position] i:hover{cursor:pointer}[date-input]{display:inline-flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;min-width:300px;padding-left:1em}[date-input] .el-date-editor.el-input{min-width:140px}[file-upload-box]{border:1px solid #ccc}[small-text]{font-size:.75em;margin-top:.5em}[file-upload] i{transform:scale(2);margin:1em}[file-upload]{display:flex;flex-flow:column nowrap;justify-content:center;align-items:center}[file-upload] span{color:#00b900}[file-upload] span:hover{color:#009800;cursor:pointer}[file-confirm] img{width:300px}[msg-edit-box]{padding:1em}[preview-area]{width:370px;background:#666f86;height:calc(100vh - 120px);overflow-y:scroll;transform:scale(.9);transform-origin:bottom center}[preview-area] h1{padding:7px;background:#353a40;color:#fff;font-size:min(4vmin ,16px);font-weight:600}[preview-area] [preview-inner]{padding:20px 20px 50px 20px}


</style>