<template>
     <div center-col>

        <Loader :text="text" v-if="loading" />
        
        <label>
            <div>
                <span v-if="isUpload">{{origin_name}}</span>
                <div v-if="!isUpload" style="padding:0.5em 1em;">
                    <i class="el-icon-document"></i>
                    <span>CSVファイルをアップロード</span>
                </div>
                <input type="file" @change="onFileChange" accept="text/csv,application/vnd.ms-excel,application/octet-stream" style="display:none;">
            </div>
        </label>

        <el-button size="mini" v-if="isUpload" @click="fileClear">やり直す</el-button>

    </div>
</template>
<script>
import axios from 'axios'

export default {

    props : [],

    data() {
        return {
            
            file        : null,
            upload_file : '',
            

            loading     : false,
            text        : '処理中...',

        }
    },
    watch:{},
    mounted(){},
    computed: {

        isUpload : function(){

            return ( this.upload_file == '' )? false : true

        },
        origin_name : function(){

            return ( this.upload_file.origin_name != void 0 )? this.upload_file.origin_name : ''

        },

    },


    methods:{

        fileClear(){ 

            this.upload_file = '';
            this.$emit( 'fileClear' )

        },

        onFileChange : async function(e) {


            console.clear()
            console.dir( 'CsvUploader ▶︎ onFileChange' )

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
            const mimetypes = [ 'text/csv' , 'application/vnd.ms-excel' , 'application/octet-stream' ]

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
                this.$alert('<strong>有効なCSVファイルではありません</strong>', 'エラー', {
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
            return await axios.post( process.env.UPLOADER + 'fileUpload' , formData, header ).then( function(result){

                /*******************************************
                    return object
                    {
                        file_id     : b2c(DB) > upload_files(table) に保存したfile_id,
                        file_url    : "/upload/ファイル名",
                        origin_name : "元のファイル名",
                        thumbnail   : "/upload/thumb_ファイル名"
                    }
                *******************************************/

                this.upload_file = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* 親コンポーネントにデータを送信
        ***************************************/
        returnParent : function(){

            console.dir( 'CsvUploader ▶︎ returnParent' )
            console.dir( this.upload_file.origin_name )
            
            this.$emit( 'uploadCsv' , this.upload_file )
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