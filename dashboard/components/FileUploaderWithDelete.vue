<template>
     <div fileupload-box>
          <label center>
            <input 
              type="file" 
              style="display:none;" 
              @change="onFileChange" 
              accept="image/*,video/mp4,video/x-m4v,video/*" />

              <div file-confirm center>
                  <nuxt-img :src="src" sizes="sm:200px"/>
              </div>
          </label>

          <label file-delete center v-if="isFile">
            <el-button size="mini" icon="el-icon-delete" @click="fileDelete">削除</el-button>
          </label>

    </div>
</template>
<script>
import axios from 'axios'


export default {

    props : [ 'maxByte' , 'thumbSize' , 'currentImage' , 'index' ],

    data() {
        return {
            // ファイルアップロード用
            movieUrl : '',
            base64   :'',
            fileName : '',
            fileType : '',
            uploadFile : '',

            thumbnail : '',

        }

    },
    computed: {

      src : function(){

        if( this.currentImage != '' && this.currentImage != null && this.base64 == '' ){

            return this.currentImage

        }
        else{

            return ( this.base64 != '' )? this.base64:'/resource/dummy.jpg'

        }  


      },
      isFile : function(){

        return (this.base64 != '')? true:false

      }


    },
    watch:{

        thumbnail : function(val){

          if( val != '' && this.base64 != '' && this.uploadFile != '' && this.movieUrl == '' ){

              this.sendImageToDB()

          }

        },


    },
    mounted(){

      //console.clear()


    },
    methods:{

        /*****************************************************************
        * ファイルのアップロード
        ******************************************************************/
        onFileChange : async function(e) {

          console.dir('▶︎▶︎▶︎ onFileChange')


            const files = e.target.files || e.dataTransfer.files;

            // ファイルが指定されていない場合
            if ( files.length == 0 ) return

            const type = files[0].type
            const size = files[0].size

            // 有効なファイルではない
            if( ( type != 'image/png' && type != 'image/jpeg' && type != 'image/gif' ) && !type.match('video/*') ){

              this.fileDelete()
              this.errorFile('<p>有効なファイルではありません</p>')

            }

            // 画像の場合の処理 //////////////
            if( type == 'image/png' || type == 'image/jpeg' || type == 'image/gif' ){

                    console.dir( 'maxByte : ' + this.maxByte )
                    console.dir( 'size : ' + size )


                if( size < this.maxByte ){

                  this.fileName   = files[0].name
                  this.fileType   = files[0].type
                  this.uploadFile = files[0]
                  
                  this.createImage( files[0] )

                }
                else{

                  this.fileDelete()
                  this.errorFile('ファイルサイズは' + this.maxByte + 'バイト以下です')

                }

            }
            // 画像の場合の処理 //////////////

            // 動画の場合の処理 //////////////
            if( type.match('video/*') ){

                if( size < 113600000 ){

                    this.fileName   = files[0].name
                    this.fileType   = files[0].type
                    this.uploadFile = files[0]
                    this.createMovie( files[0] ,  )

                }
                else{

                    this.fileDelete()
                    this.errorFile('ファイルサイズは100MB以下です')

                }

            }
            // 動画の場合の処理 //////////////

        },


        // 画像作成（base64エンコード）//////////////////////////////////
        createImage : function(file){

            const reader = new FileReader();

            reader.onload = e => {

              this.base64 = e.target.result;
              this.imageSetUp()

            };

            reader.readAsDataURL(file);

        },
        // 動画作成（base64エンコード）//////////////////////////////////
        createMovie : function(file){

            const reader = new FileReader()

            reader.onload = e => {

            this.movieUrl = JSON.parse( JSON.stringify( e.target.result ))
            this.base64    = this.createThumbnails( this.movieUrl )

            }

            reader.readAsDataURL(file)

        },
        // 動画サムネイル作成（base64エンコード）//////////////////////////////////
        createThumbnails( src ) {

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
                this.base64 =  canvas.toDataURL('image/jpeg')
                //this.movieSetting()

            }

            // 動画を読み込む
            video.src = src
            video.load()

        },

        /* 画像をCDNにアップロード
        ********************************** (this.base64 != '')***********************/
        imageSetUp : function(){

            this.makeThumb( this.base64 , this.thumbSize ) 

        },

        sendImageToDB : function(){

            var db = new URLSearchParams()
            db.append( 'origin'    , this.base64 )
            db.append( 'thumb'     , this.thumbnail )
            db.append( 'file_name' , this.fileName )
            db.append( 'file_type' , this.fileType )

            axios.post( process.env.API_API + 'apiSaveImage' , db ).then( function(result){

                var parentSend = result.data
                parentSend.id = this.index
                this.$emit( 'uploadFile' , parentSend  )

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){  }.bind(this))



        },




        /* 動画をCDNにアップロード
        *********************************************************/
        movieSetting : async function(){



        },
        /* HELPER アラート
        *********************************************************/
        // ファイルエラーアラート
        errorFile : function(msg){
            this.$message({
                dangerouslyUseHTMLString: true,
                message: msg,
                type: 'error'
            })
        },
        // 成功アラート
        successMsg : function(msg){
            this.$message({
                dangerouslyUseHTMLString: true,
                message: msg,
                type: 'success'
            });
        },
        // エラーアラート
        errorMsg : function(msg){
            this.$message({
                dangerouslyUseHTMLString: true,
                message: msg,
                type: 'error'
            });
        },

        // ファイル取り消し
        fileDelete : function(){

            this.base64    = ''
            this.fileName = ''
            this.fileType = ''
            this.uploadFile = ''
            this.movieUrl = ''
            this.thumbnail = ''

            return

        },


        makeThumb : async function( base64 , resizeWidth ){

            const image = new Image()            

            var set = new Promise( function(resolve){

              image.onload = () => {

                resolve(image)

              }

              image.src = this.base64

            }.bind(this)).then( function(result){

              this.resizeMAR( result.width , result.height , resizeWidth )

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){ }.bind(this))


        },
        /************************************************************************
         * アスペクト比計算
         * 第一引数 : オリジナルの横幅
         * 第二引数 : オリジナルの高さ
         * 第三引数 : リサイズする幅
         * 第四引数 : 'width' or 'height' リサイズする基準となる幅(初期値 : width)
         * 第五引数 : 第四引数とは逆の幅をリサイズする幅
        *************************************************************************/
        resizeMAR : function(originWidth, originHeight, resizeNumber, resizeMove, otherSideNumber) {
        
            if (!originWidth || !originHeight || !resizeNumber) return false;
         
            if (!resizeMove) resizeMove = 'width';
         
            var result;
         
            if (String(originWidth).match(/^[0-9]+$/) && String(originHeight).match(/^[0-9]+$/) &&
                String(resizeNumber).match(/^[0-9]+$/) && resizeMove.match(/^(width|height)$/)) {
         
                var newWidth     = 0,
                    newHeight    = 0,
                    reResizeMove = '';
         
                if (resizeMove === 'width') {
                    newHeight    = resizeNumber * originHeight / originWidth;
                    newWidth     = newHeight * originWidth / originHeight;
                    reResizeMove = 'height';
                } else {
                    newWidth     = resizeNumber * originWidth / originHeight;
                    newHeight    = newWidth * originHeight / originWidth;
                    reResizeMove = 'width';
                }
         
                if (otherSideNumber && String(otherSideNumber).match(/^([0-9]+|auto)$/)  && newHeight > otherSideNumber) {
                    reResult = resizeMAR(newWidth, newHeight, otherSideNumber, reResizeMove);
                    if (reResult) result = reResult;
                } else {
                    result = {
                        width  : newWidth,
                        height : newHeight
                    };
                }
            }

            this.ImgB64Resize( this.base64 , result.width , result.height , function(res){ 
              
                this.thumbnail = res

            }.bind(this))

        },

        ///////////////////////////////////////////////////////////////////
        ImgB64Resize : function( imgB64_src, width, height, callback ) {
        
            // Image Type
            var img_type = imgB64_src.substring(5, imgB64_src.indexOf(";"));
        
            // Source Image
            var resize_img = new Image();
        
            resize_img.onload = function() {
                // New Canvas
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                // Draw (Resize)
                var ctx = canvas.getContext('2d');
                ctx.drawImage(resize_img, 0, 0, width, height);
                // Destination Image
                var imgB64_dst = canvas.toDataURL(img_type);
                callback(imgB64_dst);
            };
        
            resize_img.src = imgB64_src;
        
            return resize_img

        },

    },
};
</script>
<style scoped>
[fileupload-box]{
  width:100%;
  border:1px solid #ccc;
  border-radius:0.4em;
  padding:0.5em;
  max-width: 500px;
}

[fileupload-box] label{
    padding:0;
}

[file-confirm]{
    width:100%;height:auto;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    border:1px dashed #efefef;
    padding:5px;
}
[file-confirm] img{
  width:100%;
  max-width:100%;
background-color: #d7d7d7;
opacity: 1;
background-image:  repeating-linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), repeating-linear-gradient(45deg, #ffffff 25%, #d7d7d7 25%, #d7d7d7 75%, #ffffff 75%, #ffffff);
background-position: 0 0, 9px 9px;
background-size: 18px 18px;
}




</style>