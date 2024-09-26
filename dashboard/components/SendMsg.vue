<template>
  <div content send-message-content>

    <Loader text="サーバー処理中です" v-if="loading" />

      <div content-area-header>
          <h3>メッセージ作成</h3>
          <div>
              <button sub @click="saveDraft">下書き保存</button>
              <button sub @click="testSending">テスト配信</button>
          </div>
          <button line v-if="sendNowFlg" @click="nowSending">配信</button>
          <button line disabled="disabled" v-if="!sendNowFlg">配信</button>
      </div>


    <!-- /////////// メッセージ登録 //////////// -->
    <div content-area>



      <!-- // 登録 ////////////////////////////////////////////////////////////////////////////// -->
      <div content-left>


        <!-- // 配信設定 /////////////////////////////////////////////////////////////// -->
        <div setting-area>


          <h5 mt-2>配信日時</h5>
          <div split btn-box>
            <el-radio-group v-model="sendDate" size="medium" senddate-group>
              <el-radio-button label="sendNow" >今すぐ配信</el-radio-button>
              <el-radio-button label="sendLater">日時指定</el-radio-button>
            </el-radio-group>

            <div v-if="isLater" date-input>

              <el-date-picker
                v-model="inputDate"
                type="date"
                placeholder="日付選択">
              </el-date-picker>

              <el-time-select
                v-model="inputTime"
                :picker-options="{
                  start: '05:00',
                  step: '00:15',
                  end: '22:00'
                }"
                placeholder="時間選択">
              </el-time-select>

            </div>
          </div>




          <h5 mt-4>配信先 <span send-setting-view>配信予定数 <span>{{userNum}}</span> / <span>{{fullUserNum}}</span></span></h5>
          <div send-setting btn-box>
            <el-checkbox-group v-model="destinationTo" destination-group>
              <el-checkbox-button v-for="destination in destinations" :label="destination.label" :key="destination.label">{{destination.name}}</el-checkbox-button>
            </el-checkbox-group>
            
          </div>
        </div>
        <!-- // 配信設定 /////////////////////////////////////////////////////////////// -->


        <h3 h-bar mt-5>メッセージ作成</h3>
        <!-- // msg-reg-box /////////////////////////////////////////////////////////////// -->
        <div msg-reg-box v-for="(item , index) in messages">

          <div msg-reg-header>

              <div msg-reg-select>
                <el-tooltip class="item" effect="dark" content="テキストメッセージを作成します" placement="top-start">
                  <span v-bind:class="{ selected: item.editor.text }" @click="editorActive('text',index)"><i class="el-icon-chat-line-round"></i></span>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" content="画像メッセージを作成します" placement="top-start">
                  <span v-bind:class="{ selected: item.editor.image }" @click="editorActive('image',index)"><i class="el-icon-picture-outline"></i></span>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" content="動画メッセージを作成します" placement="top-start">
                  <span v-bind:class="{ selected: item.editor.movie }" @click="editorActive('movie',index)"><i class="el-icon-video-camera"></i></span>
                </el-tooltip>
              </div>

              <div msg-reg-position>
                <i class="el-icon-arrow-up" @click="aheadItem(index)"></i>
                <i class="el-icon-arrow-down" @click="behindItem(index)"></i>
                <i class="el-icon-close" @click="removeMessage(index)"></i>
              </div>

          </div>

          <!-- msg-edit-box -->
          <div msg-edit-box>
              
              <!-- TEXT -->
              <div v-if="item.editor.text">
                <el-input
                  type="textarea"
                  placeholder="テキストを入力"
                  v-model="item.text"
                  maxlength="500"
                  show-word-limit
                  :autosize="{ minRows: 6, maxRows: 12}"
                >
                </el-input>
              </div>
              <!-- TEXT -->

              <!--  IMAGE-->
              <div v-if="item.editor.image || item.editor.movie">
                   
                   <div file-upload-box>
               
                        <label file-open ontouchstart="">
                          <div v-if=" item.originalContentUrl =='' && item.editor.image" file-upload>
                              <span>画像をアップロード</span>
                              <i class="el-icon-picture-outline"></i>
                          </div>
                          <div v-if=" item.originalContentUrl =='' && item.editor.movie" file-upload>
                              <span>動画をアップロード</span>
                              <i class="el-icon-video-camera"></i>
                          </div>
                          <input type="file" style="display:none;" :name="index" :data-index="index" @change="onFileChange" accept="image/*,video/mp4,video/x-m4v,video/*"/>
                        </label>

                        <div v-if="item.originalContentUrl !='' " file-confirm center><img :src="item.previewImageUrl"></div>
                        <label v-if="item.originalContentUrl !='' " ontouchstart="" file-delete center>
                          <el-button size="mini" icon="el-icon-delete" @click="fileDelete(index)">削除</el-button>
                        </label>

                  </div>
                  
                  <div text-muted small-text v-if="item.editor.image">
                    ファイル形式：JPG、JPEG、PNG<br>
                    ファイルサイズ：10MB以下
                  </div>
                  
                  <div text-muted small-text v-if="item.editor.movie">
                    ファイル形式：MP4<br>
                    ファイルサイズ：100MB以下　(容量の大きな動画はサーバー処理に時間がかかります)
                  </div>

              </div>
              <!--  IMAGE-->
          </div>
          <!-- msg-edit-box -->

        </div>
        <!-- // msg-reg-box /////////////////////////////////////////////////////////////// -->

        <div pt-1 pb-1 v-if="countMessageNum" >
          <el-button type="success" plain size="small" icon="el-icon-plus" @click="addMessage">追加</el-button>
        </div>

      </div>
      <!-- // 登録 ////////////////////////////////////////////////////////////////////////////// -->



      <!-- // プレビュー ////////////////////////////////////////////////////////////////////////////// -->
      <div content-right>

        <div preview-area>
          <h1>プレビュー</h1>
          <div preview-inner>
            <ChatBody 
              :chat="chat"
              v-for="(chat , index) in messages"
            />
          </div>
        </div>
      </div>
      <!-- // プレビュー ////////////////////////////////////////////////////////////////////////////// -->

    </div>
    <!-- /////////// メッセージ登録 //////////// -->

  </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'

  const destinations = [
    {label : 1 , name : '単価月極'},
    {label : 2 , name : 'D単価'},   
    {label : 3 , name : '365日対応'},
    {label : 4 , name : '市場カレンダー'},
  ];

export default {

  data() {
    return {
        loading  : true,
        apiToken : '',

        //配信日時
        sendDate : '',
        isLater   : false,
        inputDate : '',
        inputTime : '',

        //配信先
        destinationTo : [],
        destinations  : destinations,
        to : ['U46178fcc5f1bf5c8508fe3a3876475b3','U775973dbc947217bf95755ed3adf15ea'],
        sendTo : [],
        fullUserNum : 0,

        MaxMessageNum : 3,

        messages  : [{
          text : '',
          editor  : {
            text  : true,
            image : false,
            movie : false,
          },
          originalContentUrl : '',
          previewImageUrl   : '',
        }],
        // 送信メッセージ
        send_msg : '',

        // upload file
        movieUrl : '',
        fileUrl:'',
        fileName : '',
        fileType : '',
        uploadFile : '',

    }
  },

  watch : {
    // 日付選択
    sendDate : function(value){

      if(value != 'sendLater') this.isLater = false
      if(value == 'sendLater') this.isLater = true


    },
    sendDateTime : function(value){

      console.dir(value)

    },
    destinationTo : function(value){

      console.dir(this.userNum)

      if( value.length < 1 ) {

        this.sendTo = []
        return

      }

      const params = new URLSearchParams()
      params.append( 'token'  , process.env.INFO_TOKEN )
      params.append( 'action' , 'getUsersToFlg')
      params.append( 'flgs'   , JSON.stringify(value) )

      axios.post( process.env.API_URL , params )
        .then( function(result){

          this.sendTo = JSON.parse( JSON.stringify( result.data ) )

      }.bind(this))
      .catch( function(error) { console.dir(error); }.bind(this))
      .finally(function(){ 
      }.bind(this))


    }

  },

  mounted(){

    console.clear()
    this.getAllUserNum()

  },

  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'info' , ['allParent']),

      // メッセージの数をカウント
      countMessageNum : function(){

        if( this.messages.length < this.MaxMessageNum ) return true
        if( this.messages.length <= this.MaxMessageNum ) return false

      },
      sendNowFlg : function(){

        if(this.sendDate == 'sendNow') return true
        if(this.sendDate != 'sendNow') return false 

      },
      userNum : function(){

        return this.sendTo.length

      },

  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'info' , ['setAllParent']),

      /***************************************************************** 
      * MSGサーバにトークン発行を要求
      ******************************************************************/
      setToken : async function(){

        var data = new FormData()
        data.append('action', 'getToken')        
        return axios.post( process.env.PUSH_API , data )
          .then( function (result){

            this.apiToken = JSON.parse( JSON.stringify( result.data ) )         

          }.bind(this))
          .catch( function(err){ console.dir(err); })
          .finally(async function(){ }.bind(this))

      },
      /***************************************************************** 
      * 全てのユーザー数を取得
      ******************************************************************/
      getAllUserNum : function(){

        const params = new URLSearchParams()
        params.append( 'token'  , process.env.INFO_TOKEN )
        params.append( 'action' , 'getAllUserNum')

        axios.post( process.env.API_URL , params )
          .then( function(result){

            this.fullUserNum = result.data.length

          }.bind(this))
          .catch( function(error) { console.dir(error); }.bind(this))
          .finally(function(){ 

            this.loading = false

          }.bind(this))

      },

      /***************************************************************** 
      * エディタの切り替え
      ******************************************************************/
      editorActive : function(target,index){

        for( let key in this.messages[index].editor ) {
            this.messages[index].editor[key] = false
        }
        this.messages[index].text  = ''
        this.messages[index].originalContentUrl = ''
        this.messages[index].previewImageUrl  = ''
        this.messages[index].editor[target] = true

      },



      /***************************************************************** 
      * メッセージの追加、削除、順番変更
      ******************************************************************/
      //  メッセージを追加（最大3つまで）
      addMessage : function(){

        if(this.messages.length > (this.MaxMessageNum - 1) ) return

        var addMsg = {
          text : '',
          editor : { text : true, image : false, movie : false,},
          main                : '',
          originalContentUrl  : '',
          previewImageUrl     : '',
        }

        this.messages.push(addMsg)

      },

      //  メッセージを削除
      removeMessage : function(index){

        if(this.messages.length < (this.MaxMessageNum - 1) ) return

        this.messages.splice(index , 1)

      },
      //  メッセージの順番をあげる
      aheadItem : function(index){

        if( index == 0 ) return

        this.messages.splice( index-1 , 2, this.messages[index], this.messages[index-1] );

      },
      // メッセージの順番を下げる
      behindItem : function(index){

        if( index >= this.messages.length - 1 ) return

        this.messages.splice( index , 2, this.messages[ index+1] , this.messages[index] );

      },




      /*****************************************************************
      * ファイルのアップロード
      ******************************************************************/
      onFileChange : async function(e) {
        console.clear()

        var targetIndex = e.target.name
        const files = e.target.files || e.dataTransfer.files;

        // ファイルが指定されていない場合
        if ( files.length == 0 ) return

        const type = files[0].type
        const size = files[0].size

        // 有効なファイルではない
        if( ( type != 'image/png' && type != 'image/jpeg' && type != 'image/gif' ) && !type.match('video/*') ){
          this.fileDelete(targetIndex)
          this.errorFile('<p>有効なファイルではありません</p>')
        }

        // 画像の場合の処理 //////////////
        if( type == 'image/png' || type == 'image/jpeg' || type == 'image/gif' ){

            // タブが画像タブじゃない
            if( !this.messages[targetIndex].editor.image  ){

                this.fileDelete(targetIndex)
                this.errorFile('有効な動画ファイルではありません')
                return

            }

            if( size < 11360000 ){

              this.uploadFile = files[0]
              this.createImage( files[0] )
              this.fileName   = files[0].name
              this.fileType   = files[0].type
              this.imageSetting(targetIndex)
            
            }
            else{

              this.fileDelete(targetIndex)
              this.errorFile('ファイルサイズは10MB以下です')

            }

        }
        // 画像の場合の処理 //////////////

        // 動画の場合の処理 //////////////
        if( type.match('video/*') ){

            // タブが動画タブじゃない
            if( !this.messages[targetIndex].editor.movie  ){

                this.fileDelete(targetIndex)
                this.errorFile('有効な画像ファイルではありません')
                return

            }

            if( this.messages[targetIndex].editor.movie  ){

                  console.dir('動画を処理')

                  if( size < 113600000 ){

                      this.fileName   = files[0].name 
                      this.fileType   = files[0].type 
                      this.uploadFile = files[0]
                      this.createMovie( files[0] , targetIndex )

                  }
                  else{

                      this.fileDelete(targetIndex)
                      this.errorFile('ファイルサイズは100MB以下です')

                  }

            }

        }
        // 動画の場合の処理 //////////////

      },

      // 画像作成（base64エンコード）//////////////////////////////////
      createImage : function(file){

          const reader = new FileReader();
          reader.onload = e => {
          
              this.fileUrl = e.target.result;
          };
        
          reader.readAsDataURL(file);

      },
      // 動画作成（base64エンコード）//////////////////////////////////
      createMovie : function(file , targetIndex){

          const reader = new FileReader()

          reader.onload = e => {

            this.movieUrl = JSON.parse( JSON.stringify( e.target.result ))
            this.fileUrl = this.createThumbnails( this.movieUrl , targetIndex ) 

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


      // 画像の場合の下処理（CDN送信） //////////////////////////
      imageSetting : async function(targetIndex){

          this.loading = true

          await this.setToken()
          console.dir(this.apiToken)

          // 画像のみをCDNにアップロード ////////////////////////////////////
          const params = new URLSearchParams()
          params.append( 'token', process.env.INFO_TOKEN )
          params.append( 'action' , 'uploadImageCDN' )
          params.append( 'file_base64'    , this.fileUrl )
          params.append( 'file_name'      , this.fileName )
          params.append( 'file_type'      , this.fileType )


          await axios.post( process.env.API_URL , params )
            .then( function(result){

              this.messages[targetIndex].originalContentUrl = result.data.origin
              this.messages[targetIndex].previewImageUrl    = result.data.thumb

            }.bind(this))
            .catch(function(error) {
                console.error("Error writing document: ", error);
            }.bind(this))
            .finally(function(){ 

              this.loading = false

            }.bind(this))

      },


      // 動画の場合の下処理 ///////////////////////////////////////
      movieSetting : async function(targetIndex){

          this.loading = true
          console.dir('Movie Upload for CDN')

          if( this.fileUrl == '' ){

            this.errorFile('データの処理に失敗しました。')
            this.fileDelete(targetIndex)
            this.loading = false
            return

          }

          // CDNにアップロード ////////////////////////////////////
          const params = new URLSearchParams()
          params.append( 'token', process.env.INFO_TOKEN )
          params.append( 'action'  , 'uploadMovieCDN')
          params.append( 'file_base64' , this.fileUrl )
          params.append( 'file_name'   , this.fileName )
          params.append( 'file_type'   , this.fileType )
          params.append( 'file_movie'  , this.movieUrl )

          await axios.post( process.env.API_URL , params )
            .then( function(result){

              console.dir(result.data)


              if( result.data == 'error'){

                this.errorFile('ファイルのアップロードに失敗しました')

              }
              else{

                this.messages[targetIndex].originalContentUrl = JSON.parse( JSON.stringify( result.data.movie ))
                this.messages[targetIndex].previewImageUrl    = JSON.parse( JSON.stringify( result.data.thumb ))

              }

          }.bind(this))
          .catch( function(error) { console.dir(error); }.bind(this))
          .finally(function(){ this.loading = false; }.bind(this))



      },
      // エラーメッセージ
      errorFile : function(msg){
        this.$message({
          dangerouslyUseHTMLString: true,
          message: msg,
          type: 'error'
        })
      },
      // 成功メッセージ
      successMsg : function(msg){
          this.$message({
            dangerouslyUseHTMLString: true,
            message: msg,
            type: 'success'
          });
      },
      // エラーメッセージ
      errorMsg : function(msg){
          this.$message({
            dangerouslyUseHTMLString: true,
            message: msg,
            type: 'error'
          });
      },

      // ファイル取り消し
      fileDelete : function(index){

        this.fileUrl = ''
        this.fileName = ''
        this.fileType = ''
        this.uploadFile = ''
        this.movieUrl = ''

        this.messages[index].originalContentUrl = ''
        this.messages[index].previewImageUrl  = ''
        
        return

      },




      /*****************************************************************
      * アラート
      ******************************************************************/
      popAlert : function(text,title) {
        this.$alert( text , title, {
          confirmButtonText: 'OK',
          callback: action => {
            return
          }
        });
      },




      /*****************************************************************
      * メッセージの送信
      ******************************************************************/

      /*
      テスト送信
      ******************************************/
      testSending : async function(){

        if( this.messages.length < 2 && this.messages[0].editor.text && this.messages[0].text == ''){

          this.popAlert('テスト送信するメッセージが作成されていません。','No Message.')
          return

        }

            this.loading = true

            await this.setToken()
            const params = new URLSearchParams();

            params.append('token'      , this.apiToken );
            params.append('action'     , 'testSend');
            params.append('to'         , JSON.stringify( this.to ) );
            params.append('msgArray'   , JSON.stringify( this.messages ) );

            await axios.post( process.env.PUSH_API , params )
            .then( function (result){

              console.dir(result.data)

            }.bind(this))
            .catch( function(err){

                console.dir(err)

            })
            .finally(async function(){ 
              
              this.loading = false

            }.bind(this))






      },

      nowSending : function(){

        if( this.messages.length < 2 && this.messages[0].editor.text && this.messages[0].text == ''){

          this.popAlert('配信するメッセージが作成されていません。','No Message.')
          return

        }

      },


      /* メッセージの下書き保存
      ******************************************************************/
      saveDraft : function(){

        if( this.messages.length < 2 && this.messages[0].editor.text && this.messages[0].text == ''){

          this.popAlert('保存するメッセージが作成されていません。','No Message.')
          return

        }

        this.loading = true

/*

        const params = new URLSearchParams();
        params.append('token'      , this.apiToken );
        params.append('action'     , 'testSend');
        params.append('msgArray'   , JSON.stringify( this.messages ) );

        await axios.post( process.env.PUSH_API , params )
        .then( function (result){

          console.dir(result.data)

        }.bind(this))
        .catch( function(err){

            console.dir(err)

        })
        .finally(async function(){ 
          
          this.loading = false

        }.bind(this))


*/












      },



























  },

};
</script>
<style>
[send-message-content]{
  width: 100%;
}
[content-area-header]{
  position: sticky;
  top: 0;
  background: #FFF;
  padding:1em 2em;
  display: flex; flex-flow:row nowrap;justify-content: space-between;align-items: center;
  width: 100%;
  z-index: 8;
  border-bottom: 1px solid #ccc;
}

[content-area]{
  padding: 2em;
  display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: flex-start;
}
[content-left]{width: calc(100% - (370px + 2em));padding-bottom: 10em;}
[content-right]{
    width:calc(370px + 2em);
    display: flex; flex-flow:column nowrap;
    justify-content: flex-start;align-items: flex-end;
    position: fixed;
    bottom: 0px;
    right: 1em;
}


/*配信設定*/
[setting-area]{margin-bottom: 3em;}
[send-setting]{
  display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:stretch;
}

[senddate-group],[destination-group]{
  display : inline-flex; flex-flow:row nowrap; justify-content: flex-start;align-items: center;
}
[senddate-group] label,[destination-group] label{
  padding: 0;
}


[senddate-group] .el-radio-button__inner:hover{
  color: #60b337;
}
[senddate-group] .el-radio-button__orig-radio:checked+.el-radio-button__inner{
    background-color: #60b337;
    border-color: #60b337;
    box-shadow: none;
}
[senddate-group] .el-radio-button__orig-radio:checked+.el-radio-button__inner:hover{
     color: #FFF;
}
[senddate-group] *,[senddate-group] *:focus{
   outline: none;
   box-shadow: none;
}












/* メッセージ作成  */
[msg-reg-box]{
  border: 1px solid #ccc;
}
[msg-reg-box]:not(:nth-of-type(1)){
  margin-top: 1em;
}

[msg-reg-header]{
  width: 100%;padding:0.8em 1em;background: rgba(0,0,0,0.03);border-bottom: 1px solid #ccc;
  display: flex; flex-flow:row nowrap; justify-content: space-between; align-items: center;
}

    [msg-reg-select]{
      display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: center;
    }
        [msg-reg-select] > span{padding: 0.5em 1em;}
        [msg-reg-select] > span.selected{
            color: #212529;
            background-color: #dae0e5;
            border-color: #d3d9df;
        }
        [msg-reg-select] > span:hover{
            background-color: #e7ebef;  
        }
        [msg-reg-select] > span i{transform: scale(1.3)}

        [msg-reg-select] > span:hover{cursor: pointer;}

    [msg-reg-position]{
        display : inline-flex;
    }

        [msg-reg-position] i{
          transform: scale(1.5);margin-left: 1.5em;
        }
        [msg-reg-position] i:hover{
          cursor: pointer;
        }

[date-input]{
  display : inline-flex;flex-flow:row nowrap;justify-content: flex-start; align-items: center;
}
[date-input] .el-date-editor.el-input{
  width: 120px;
}





/* FILE UPLOAD */
[file-upload-box]{
  border : 1px solid #ccc;
}
[small-text]{
  font-size: .75em;
  margin-top: 0.5em;
}

[file-upload] i{transform: scale(2);margin: 1em;}
[file-upload]{
  display: flex; flex-flow:column nowrap; justify-content: center; align-items: center;
}
[file-upload] span{
  color: #00B900;
}
[file-upload] span:hover{
  color: #009800;
  cursor: pointer;
}


[file-confirm] img{
  width: 300px;
}


[msg-edit-box]{
  padding: 1em;
}

/* プレビュー */
[preview-area]{
    width: 370px;
    background: #666f86;
    height: calc(100vh - 120px);
    overflow-y: scroll;
    transform: scale(0.9);
    transform-origin: bottom center;

}
[preview-area] h1{
  padding: 7px;
  background: #353a40;
  color: #FFF;
  font-size: min(4vmin , 16px);
  font-weight: 600;
}



[preview-area] [preview-inner]{
    padding: 20px 20px 50px 20px;
}






</style>