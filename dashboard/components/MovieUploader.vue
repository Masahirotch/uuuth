<template>
     <div center-col>

        <Loader :text="text" v-if="loading" />
        
        <label image-uploader >

            <div file-confirm center v-if="isUpload">
                <img :src="src" />
            </div>

            <div>
                <div v-if="!isUpload" style="padding:0.5em 1em;">
                    <i class="el-icon-video-camera"></i>
                    <span>動画ファイルをアップロード</span>
                </div>
                <p v-if="!isUpload" minicaption center>ファイル形式：MP4 / ファイルサイズ：200MB以下</p>
                <input type="file" @change="onFileChange" accept="video/mp4" style="display:none;">
                
            </div>

        </label>

        <el-button size="mini" v-if="isUpload" @click="fileClear">削除</el-button>

    </div>
</template>
<script>
import axios from 'axios'

export default {

    data() {
        return {
            file: null,
            
            upload_file    : '',
            file_db        : '',

            movieThumbnail : '',
            
            movieUrl       : '',
            loading        : false,
            text           : '処理中...',

        }
    },
    watch:{},
    mounted(){},
    computed: {
    
      src : function(){

        if( this.upload_file != '' && this.upload_file != null ){

            return this.upload_file.thumb_url

        }
        else{

            return '/dummy.jpg'

        }  

      },

      isUpload : function(){

          return ( this.upload_file == '' )? false : true

      }

    },

    methods:{

        fileClear(){ 
            this.upload_file    = ''
            this.file_db        = ''
            this.movieUrl       = ''
            this.movieThumbnail = ''
        },

        onFileChange : async function(e) {

            console.clear()

            //// Loading 表示
            this.loading = true

            //// input file を定義
            this.file = e.target.files || e.dataTransfer.files

            //// ファイルがinputされていない場合は処理終了
            if( this.file[0] == void 0 ) {

                this.loading = false
                return
            
            }

            //// mimetype list
            const mimetypes = [ 'image/jpeg' , 'application/pdf' , 'image/png' , 'image/svg+xml' , 'image/gif' , 'video/mp4' ]

            ////  mimetype が対応している
            if( mimetypes.includes( this.file[0].type ) ){

                // ファイルサイズチェック
                if( this.file[0].size > 50485760 ){

                    this.loading = false
                    this.$alert('<strong>ファイルサイズが大きすぎます<br>(50MB以内)</strong>', 'エラー', {
                      dangerouslyUseHTMLString: true,
                      type : 'error'
                    });

                }

                // ある場合は処理を進める
                else{

                    this.createMovie( this.file[0] )

                }

            }

            // mimetype が非対応
            else{

                this.loading = false
                this.$alert('<strong>有効なファイルタイプではありません</strong>', 'エラー', {
                  dangerouslyUseHTMLString: true,
                  type : 'error'
                });

            }


        },

        /* 動画サムネイルの生成準備
        ***************************************/
        createMovie : function( file ){

            const reader = new FileReader()

            reader.onload = e => {

                this.movieUrl       = JSON.parse( JSON.stringify( e.target.result ))
                this.movieThumbnail = this.createThumbnail( this.movieUrl )

            }

            reader.readAsDataURL( file )

        },

        /* 動画サムネイルの生成
        ***************************************/
        createThumbnail : function( src ){

            const video   = document.createElement('video')
            const canvas  = document.createElement('canvas')
            const context = canvas.getContext('2d')

            //  読み込みが完了したらcanvas サイズを設定
            video.onloadeddata = () => {

                canvas.width      = video.videoWidth
                canvas.height     = video.videoHeight
                video.currentTime = 0

            }

            //  video.currentTime が変更されたらキャプチャ
            video.onseeked = () => {

                context.drawImage( video, 0, 0, video.videoWidth, video.videoHeight )
                this.movieThumbnail = canvas.toDataURL('image/jpeg')    

                if( this.movieThumbnail ){

                    this.makeSuccess()

                }

            }

            video.src = src
            video.load()

        },


        makeSuccess : async function(){

            await this.fileUpload()
            await this.addThumbnail()
            await this.returnParent()

        },

        /* 動画ファイルをサーバーに送信
        ***************************************/
        fileUpload : async function() {

            const movieUpload = new FormData();
            var   header = { headers: {'content-type': 'multipart/form-data',} }
            movieUpload.append( 'file'  , this.file[0] )
            return await axios.post( process.env.UPLOADER + 'movieUpload' , movieUpload, header ).then( function(result){

                /*******************************************
                    return object
                    {
                        file_id     : b2c(DB) > upload_files(table) に保存したfile_id,
                        file_url    : "/upload/ファイル名",
                        origin_name : "元のファイル名",
                    }
                *******************************************/

                this.file_db = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* サムネイルを送信
        ***************************************/
        addThumbnail : async function(){

            console.clear()

            const addThumbnail = new URLSearchParams();
            addThumbnail.append( 'thumbnail' , this.movieThumbnail )
            addThumbnail.append( 'db_file' , JSON.stringify( this.file_db ) )

            return await axios.post( process.env.UPLOADER + 'addThumbnail' , addThumbnail ).then( function(result){

                this.upload_file = result.data

            }.bind(this)).catch((err) => { console.dir(err); })


        },

        /* 親コンポーネントにデータを送信
        ***************************************/
        returnParent : function(){
            
            this.$emit( 'uploadMovie' , this.upload_file )
            this.loading = false

        }

    },

};
</script>
<style scoped>
[image-uploader]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    padding:0;border:1px dashed #ccc;width: auto !important;margin:0.5em;
}
[image-uploader]:hover{background:#efefef;cursor:pointer;}
[image-uploader] i{font-size:20px;margin-right:0.4em;}
label[image-uploader] > span{font-size: min(3.2vmin , 12px);font-weight: bold;line-height:20px;display:inline-block;margin-right:1em;}
[file-confirm]{width:100%;height:auto;max-width:150px;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    border:1px dashed #efefef;
    padding:5px;
}
[file-confirm] img{width:100%;max-width:100%;background-color: #d7d7d7;opacity: 1;object-fit:cover;}
[minicaption]{font-size:11px;color:#666;padding:0 0.4em 0.6em 0.4em;}

</style>