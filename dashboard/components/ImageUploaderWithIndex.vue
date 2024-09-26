<template>
     <div center-col>

        <Loader :text="text" v-if="loading" />
        
        <label image-uploader >

            <div file-confirm center v-if="isUpload">
                <img :src="src" />
            </div>

            <div>
                <div v-if="!isUpload" style="padding:0.5em 1em;">
                    <i class="el-icon-picture-outline"></i>
                    <span>画像ファイルをアップロード</span>
                </div>
                <p  v-if="!isUpload" minicaption center>ファイル形式：JPG,GIF,PNG / ファイルサイズ：10MB以下</p>
                <input type="file" @change="onFileChange" accept="image/*" style="display:none;">
            </div>

        </label>

        <el-button size="mini" v-if="isUpload" @click="fileClear">削除</el-button>

    </div>
</template>
<script>
import axios from 'axios'

export default {

    props : ['index','currentImage'],

    data() {
        return {
            file: null,
            upload_file : '',
            loading     : false,
            text        : '処理中...',
            sendImg     : '',

            currentImageData : '',

            blankObj   : {
                file_id     : 0,
                file_url    : "",
                origin_name : "",
                thumb_url   : ""
            }
        }
    },
    watch:{},
    mounted(){

        if( this.currentImage != void 0 ){

            this.currentImageData = this.currentImage

        }

    },
    computed: {
    
      src : function(){

        if( this.upload_file != '' && this.upload_file != null ){

            return this.upload_file.thumb_url

        }
        else{

            if( this.currentImageData != '' ){

                return this.currentImageData

            }
            else{

                return '/dummy.jpg'

            }

        }  

      },

      isUpload : function(){

          return ( (this.upload_file != '' && this.upload_file.thumb_url != '') || this.currentImageData != '' )? true : false

      }

    },


    methods:{

        fileClear : async function() { 

            this.upload_file  = this.blankObj;
            this.currentImageData = '';
            await this.returnParent()

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
                if( this.file[0].size > 10485760 ){

                    this.loading = false
                    this.$alert('<strong>ファイルサイズが大きすぎます<br>(10MB以内)</strong>', 'エラー', {
                      dangerouslyUseHTMLString: true,
                      type : 'error'
                    });

                }

                // ある場合は処理を進める
                else{

                    await this.fileUpload()
                    await this.returnParent()

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

        /* ファイルをサーバーに送信
        ***************************************/
        fileUpload : async function() {

            const formData = new FormData();
            const header = { headers: {'content-type': 'multipart/form-data',} }
            formData.append( 'file' , this.file[0])
            return await axios.post( process.env.UPLOADER + 'upload500' , formData, header ).then( function(result){

                /*******************************************
                    return object
                    {
                        file_id     : b2c(DB) > upload_files(table) に保存したfile_id,
                        file_url    : "/upload/ファイル名",
                        origin_name : "元のファイル名",
                        thumb_url   : "/upload/thumb_ファイル名"
                    }
                *******************************************/

                this.upload_file = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* 親コンポーネントにデータを送信
        ***************************************/
        returnParent : function(){
            
            this.upload_file.index = this.index

            this.$emit( 'uploadImage' , this.upload_file )
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