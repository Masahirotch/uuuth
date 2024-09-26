<template>
     <div>
        
        <Loader :text="text" v-if="loading" />
        
        <label>

            <div>
                <div file-confirm center v-if="isUpload">
                    <img :src="src" />
                </div>
            </div>

            <i class="el-icon-picture-outline"></i>
            <span>ファイルをアップロード</span>
            <input type="file" id="file" @change="onFileChange" accept="image/*,video/mp4,video/x-m4v,video/*" style="display: none;">



        </label>
    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'index' ],

    data() {

        return {

            file: null,
            upload_file : '',
            loading     : false,
            text        : '処理中...',
            sendImg :''

        }

    },
    watch:{},
    mounted(){},
    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref']),
    
      src : function(){

        if( this.upload_file != '' && this.upload_file != null ){

            return this.upload_file.file_url

        }
        else{

            return '/dummy.jpg'

        }  

      },

      isUpload : function(){

          return true;//( this.upload_file == '' )? false : true

      }

    },

    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref']),

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

        fileUpload : async function() {

            const formData = new FormData();
            const header = { headers: {'content-type': 'multipart/form-data',} }
            formData.append( 'file' , this.file[0])
            return await axios.post( process.env.UPLOADER + 'upload' , formData, header ).then( function(result){

                console.dir(result.data)

                this.upload_file = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        returnParent : function(){
            
            this.$emit( 'uploadFile' , this.upload_file )
            this.loading = false

        }

    },

};
</script>
<style scoped>
[file-uploader]{
    padding:0.5em 1em;border:1px dashed #ccc;width: auto !important;margin:0.5em;
    display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
[file-uploader]:hover{
    background:#efefef;
    cursor:pointer;
}
[file-uploader] i{font-size:20px;margin-right:0.4em;}
label[file-uploader] > span{font-size: min(3.2vmin , 12px);font-weight: bold;line-height:20px;display:inline-block;margin-right:1em;}

[file-confirm]{
    width:100%;height:auto;
    max-width:150px;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    border:1px dashed #efefef;
    padding:5px;
}
[file-confirm] img{width:100%;max-width:100%;background-color: #d7d7d7;opacity: 1;object-fit:cover;}


</style>