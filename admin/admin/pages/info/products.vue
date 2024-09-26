<template>
  <div>
    <Loader text="処理しています..." v-if="loading" />

    <div page-content>
      <div menu-content>

        <LeftMenu />

      </div>

      <div main-content >

        <h2 content-header>日吉の野菜情報販売商品一覧</h2>

        <div ouentai-products>

          <InfoProductCard v-for="(item , index) in products" :item="item" :index="index" @submitParent="openEditBox(index)"/>
          <ProductCardAdd @addNewProduct="makeProduct"/>
          <div></div>
          <div></div>

        </div>

      </div>

    </div>

  <!-- / 商品編集ダイアログボックス ////////////////////////////////////////////////////////////////////////////////////// -->
  <el-dialog title="商品編集" :visible.sync="editProductBox" add-product-dialog >
    <div add-box>

      <div add-box-left>
          <label>商品名</label>
          <el-input
            type="text"
            placeholder="商品名を入力"
            maxlength="32"
            show-word-limit
            v-model="editProduct.productName">
          </el-input>

          <label>商品コード（半角英数と記号 _ . - / のみ可）</label>
          <el-input
            type="text"
            placeholder="商品コードを入力"
            maxlength="16"
            show-word-limit
            v-model="editProduct.productCode">
          </el-input>

          <label>商品紹介</label>
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 10}"
            placeholder="商品紹介文"
            maxlength="300"
            show-word-limit
            v-model="editProduct.productDetail">
          </el-input>

      </div>

      <div add-box-right>

        <div input-set>
          <label switch-set><span>税抜き販売価格</span></label>
          <el-input placeholder="販売価格" v-model="editProduct.productPrice"></el-input>
        </div>

        <div input-set>
            <label switch-set><span>販売単位</span></label>
            <el-select v-model="editProduct.unit" placeholder="Select">
                <el-option
                  v-for="item in unit"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
            </el-select>
        </div>

        <div input-set>
          <label switch-set><span>数量限定販売</span><el-switch v-model="editProduct.isMax"></el-switch></label>
           <el-input-number v-model="editProduct.maxNum" @change="handleChange" :min="0" :max="10000" :disabled="!editProduct.isMax"></el-input-number>
        </div>

        <div input-set>
          <label switch-set><span>販売期間を設定</span><el-switch v-model="editProduct.isPeriod"></el-switch></label>

            <el-date-picker
                v-model="startend"
                type="daterange"
                range-separator="〜"
                start-placeholder="Start date"
                end-placeholder="End date">
            </el-date-picker>

        </div>

        <div add-box-right-split>

            <div right-right-image>
              <label image-upload-box ontouchstart="">
                <span>画像をアップロード</span>
                <i class="el-icon-picture-outline"></i>
                <input type="file" style="display:none;" @change="onFileChange" accept="image/*"/>
              </label>
              <div image-overlay-box v-if="editProduct.productPhoto != ''">
                <img :src="editProduct.productPhoto">
                <i class="el-icon-error" @click="onFileDelete"></i>
              </div>
            </div>

            <div right-right-right>
              <div center>
                <el-switch
                  v-model="editProduct.isOnSale"
                  active-text="販売中"
                  inactive-text="販売休止">
                </el-switch>
              </div>
              <span>販売期間中であっても、販売中設定をしていない場合、販売は開始されませんのでご注意ください。</span>
            </div>

        </div>

      </div>

    </div>
    <div dialog-btn-area>
      <el-button @click="editProductBox = false">閉じる</el-button>
      <el-button type="primary" @click="submitEditProduct">更新する</el-button>
    </div>
  </el-dialog>
  <!-- / 商品編集ダイアログボックス ////////////////////////////////////////////////////////////////////////////////////// -->





  <!-- / 商品追加ダイアログボックス ////////////////////////////////////////////////////////////////////////////////////// -->
  <el-dialog title="商品追加" :visible.sync="addNewProductBox" add-product-dialog >
    <div add-box>

      <div add-box-left>
          <label>商品名</label>
          <el-input
            type="text"
            placeholder="商品名を入力"
            maxlength="30"
            show-word-limit
            v-model="newProduct.productName">
          </el-input>

          <label>商品コード</label>
          <el-input
            type="text"
            placeholder="商品コードを入力"
            maxlength="12"
            show-word-limit
            v-model="newProduct.productCode">
          </el-input>

          <label>商品紹介</label>
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 10}"
            placeholder="商品紹介文"
            maxlength="300"
            show-word-limit
            v-model="newProduct.productDetail">
          </el-input>

      </div>

      <div add-box-right>

        <div input-set>
          <label switch-set><span>税抜き販売価格</span></label>
          <el-input placeholder="販売価格" v-model="newProduct.productPrice"></el-input>
        </div>

        <div input-set>
            <label switch-set><span>販売単位</span></label>
            <el-select v-model="newProduct.unit" placeholder="Select">
                <el-option
                  v-for="item in unit"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
            </el-select>
        </div>

        <div input-set>
          <label switch-set><span>数量限定販売</span><el-switch v-model="newProduct.isMax"></el-switch></label>
           <el-input-number v-model="newProduct.maxNum" @change="handleChange" :min="0" :max="10000" :disabled="!newProduct.isMax"></el-input-number>
        </div>

        <div input-set>
          <label switch-set><span>販売期間を設定</span><el-switch v-model="newProduct.isPeriod"></el-switch></label>

              <el-date-picker
                v-model="startend"
                type="daterange"
                range-separator="〜"
                start-placeholder="Start date"
                end-placeholder="End date">
              </el-date-picker>
        </div>

        <div add-box-right-split>

            <div right-right-image>
              <label image-upload-box ontouchstart="">
                <span>画像をアップロード</span>
                <i class="el-icon-picture-outline"></i>
                <input type="file" style="display:none;" @change="onFileChange" accept="image/*"/>
              </label>
              <div image-overlay-box v-if="newProduct.productPhoto != ''">
                <img :src="newProduct.productPhoto">
                <i class="el-icon-error" @click="onFileDelete"></i>
              </div>
            </div>

            <div right-right-right>
              <div center>
                <el-switch
                  v-model="newProduct.isOnSale"
                  active-text="販売中"
                  inactive-text="販売休止">
                </el-switch>
              </div>
              <span>販売期間中であっても、販売中設定をしていない場合、販売は開始されませんのでご注意ください。</span>
            </div>

        </div>

      </div>

    </div>
    <div dialog-btn-area>
      <el-button @click="addNewProductBox = false">キャンセル</el-button>
      <el-button type="primary" @click="sendApiToNewProduct">登録する</el-button>
    </div>
  </el-dialog>
  <!-- / 商品追加ダイアログボックス ////////////////////////////////////////////////////////////////////////////////////// -->






  </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'
  import LeftMenu from "@/components/LeftMenu"

export default {
    components: { LeftMenu },
  data() {
    return {
      loading : true,
      apiToken     : '',
        addNewProductBox: false,
        editProductBox  : false,
        newProduct: {
          productCode   : '',// 商品名 varchar
          productName   : '',// 商品名 varchar
          productDetail : '',// 商品説明詳細 text
          productPhoto  : '',// 画像url
          productPrice  : '',// 商品の価格
          isOnSale      : false,// 販売中かどうか
          quantity      : 0 ,// 処理用フラグ。0からスタート
          maxNum        : 0,// 数量限定の場合の商品点数
          isMax         : false,// 数量限定かどうか
          isPeriod      : false,// 販売期間を設けるか
          start         : '',// 販売開始日時
          end           : '',// 販売終了日時
          unit          : ''
        },
        startend        : '',
        formLabelWidth: '120px',

        editProduct : {
          productCode   : '',// 商品名 varchar
          productName   : '',// 商品名 varchar
          productDetail : '',// 商品説明詳細 text
          productPhoto  : '',// 画像url
          productPrice  : '',// 商品の価格
          isOnSale      : false,// 販売中かどうか
          quantity      : 0 ,// 処理用フラグ。0からスタート
          maxNum        : 0,// 数量限定の場合の商品点数
          isMax         : false,// 数量限定かどうか
          isPeriod      : false,// 販売期間を設けるか
          start         : '',// 販売開始日時
          end           : '',// 販売終了日時
          unit          : ''
        },
        editOuentaiProductBox : false,

        // file
        fileUrl:'',
        fileName : '',
        fileType : '',
        uploadFile : '',

        unit: [
            {
              value: 'piece',
              label: '個'
            },
            {
              value: 'set',
              label: 'セット'
            },
            {
              value: 'kg',
              label: 'Kg'
            },
            {
              value: 'pac',
              label: 'パック'
            },
            {
              value: 'cs',
              label: '箱'
            },


        ],

    }
  },
  created(){

    if(!this.login){

      this.$router.push('/')

    }

  },
  watch:{

    startend : function(value){

      console.dir(value)

    },

    'editProduct.productCode' : function() {
      const pattern = /[^0-9a-zA-Z_.\-/]/g;    // 半角英字と記号（_.-/）のみ可
      this.editProduct.productCode = this.editProduct.productCode.replace(pattern, "");
    }


  },
  mounted(){

      console.clear()

    this.loadProducts()

  },
  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'infoProducts' , ['products']),
  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'infoProducts' , ['setProducts']),

      handleChange(value) {
        console.log(value)
      },

      // 商品一覧を取得
      loadProducts : async function(){

        await axios.post( process.env.API_URL + 'info/products' , {
          token: process.env.INFO_TOKEN,
        })
          .then( function(result){

            this.setProducts(result.data.products)
            console.dir(result.data.products)

          }.bind(this))
          .catch( function(error) {

              console.dir(error)

          }.bind(this))
          .finally(function(){

            this.loading = false

          }.bind(this))

      },

      // ボックスの立ち上げ
      makeProduct : function(){

        this.addNewProductBox = !this.addNewProductBox

      },


      /*****************************************************************
      * ファイルのアップロード
      ******************************************************************/
      onFileChange : async function(e) {

        console.clear()

        const files = e.target.files || e.dataTransfer.files;

        // ファイルが指定されていない場合
        if ( files.length == 0 ) return

        const type = files[0].type
        const size = files[0].size

        // 有効なファイルではない
        if( ( type != 'image/png' && type != 'image/jpeg' && type != 'image/gif' ) ){
          this.onFileDelete()
          this.errorFile('<p>有効なファイルではありません</p>')
        }

        // 画像の場合の処理 //////////////
        if( type == 'image/png' || type == 'image/jpeg' || type == 'image/gif' ){

            if( size < 11360000 ){

              this.uploadFile = files[0]
              this.createImage( files[0] )
              this.fileName   = files[0].name
              this.fileType   = files[0].type

            }
            else{

              this.onFileDelete()
              this.errorFile('ファイルサイズは10MB以下です')

            }

        }
        // 画像の場合の処理 //////////////

      },
      // 画像作成（base64エンコード）//////////////////////////////////
      createImage : function(file){

          const reader = new FileReader();
          reader.onload = e => {

              this.fileUrl = e.target.result;
              this.imageSetting()

          };

          reader.readAsDataURL(file);

      },

      // 画像の場合の下処理（CDN送信） //////////////////////////
      imageSetting : async function(){

          this.loading = true

          await this.setToken()

          // 画像のみをCDNにアップロード ////////////////////////////////////
          axios.post( process.env.API_URL + 'uploadFileCDN' , {
            token: this.apiToken,
            imageBase64: this.fileUrl,
          })
            .then( function(result){

              this.newProduct.productPhoto = result.data.files.main
              this.editProduct.productPhoto = result.data.files.main

          }.bind(this))
          .catch(function(error) {
              console.error("Error writing document: ", error);
          }.bind(this))
          .finally(function(){

            this.loading = false

          }.bind(this))

      },
      // ファイルのリセット
      onFileDelete : function(){

        this.newProduct.productPhoto = ''
        console.dir( this.editProduct.productPhoto )

        if( this.editProduct.productPhoto != 'undefined' ){
          this.editProduct.productPhoto = ''
        }

        this.fileUrl      = ''
        this.fileName     = ''
        this.fileType     = ''
        this.uploadFile   = ''

      },
      // エラーメッセージ
      errorFile : function(msg){
        this.$message({
          dangerouslyUseHTMLString: true,
          showClose: true,
          message: msg,
          type: 'error'
        })
      },
      // 成功メッセージ
      successMsg : function(msg){
          this.$message({
            dangerouslyUseHTMLString: true,
            showClose: true,
            message: msg,
            type: 'success'
          });
      },
      // エラーメッセージ
      errorMsg : function(msg){
          this.$message({
            dangerouslyUseHTMLString: true,
            showClose: true,
            message: msg,
            type: 'error'
          });
      },

      // 商品をデータベースに登録
      sendApiToNewProduct : function(){

        console.clear()

        var flg = true
        var msg = ''

        if( this.newProduct.productName == '' ) {

         msg += '<p>商品名が未入力です</p>'
         flg = false

        }
        if( this.newProduct.productCode == '' ) {

         msg += '<p>商品コードが未入力です</p>'
         flg = false

        }
        if( this.newProduct.productDetail == '' ) {

          msg += '<p>商品説明が未入力です</p>'
          flg = false

        }
        if( this.newProduct.productPrice == '' ) {

          msg += '<p>商品価格が未入力です</p>'
          flg = false

        }
        if( this.newProduct.isMax && this.newProduct.maxNum == 0 ) {

          msg += '<p>限定数量が未入力です</p>'
          flg = false

        }
        if( this.newProduct.isPeriod && this.startend == '' ) {

          msg += '<p>期間が設定されていません</p>'
          flg = false

        }
        if( this.newProduct.productPhoto == '' ) {

          msg += '<p>画像が設定されていません</p>'
          flg = false

        }

        if(!flg){

          this.errorMsg(msg)
          return

        }
        if(flg){

          if( this.startend != '' ){
            this.newProduct.start = this.$dayjs(this.startend[0]).format('YYYY-MM-DD 10:00:00')
            this.newProduct.end   = this.$dayjs(this.startend[1]).format('YYYY-MM-DD 23:59:59')
          }

          this.loading = true

          axios.post( process.env.API_URL + 'addProduct' , {
            token: process.env.INFO_TOKEN,
            new_product: this.newProduct,
          } )
            .then( function(result){

              console.dir(result.data.products)

              this.setProducts(result.data.products)
              this.allReset()

            }.bind(this))
            .catch( function(error) {

                console.dir(error)

            }.bind(this))
            .finally(function(){

              this.loading = false

            }.bind(this))

        }


      },
      // sendApiToNewProduct
      allReset : function(){

        this.newProduct = {
          productCode   : '',// 商品Code
          productName   : '',// 商品名 varchar
          productDetail : '',// 商品説明詳細 text
          productPhoto  : '',// 画像url
          productPrice  : '',// 商品の価格
          isOnSale      : false,// 販売中かどうか
          quantity      : 0 ,// 処理用フラグ。0からスタート
          maxNum        : 0,// 数量限定の場合の商品点数
          isMax         : false,// 数量限定かどうか
          isPeriod      : false,// 販売期間を設けるか
          start         : '',// 販売開始日時
          end           : '',// 販売終了日時
          unit          : ''
        }
        this.newProduct.productPhoto = ''
        this.fileUrl      = ''
        this.fileName     = ''
        this.fileType     = ''
        this.uploadFile   = ''
        this.startend     = ''

        this.addNewProductBox = false

        this,editProduct = ''

      },

      openEditBox : function(index){

        console.dir(index)
        this.editProductBox = true
        this.editProduct = JSON.parse( JSON.stringify( this.products[index] ) )


            var start_date = ''
            var end_date = ''

            if( !this.editProduct.start && this.editProduct.start != '0000-00-00 00:00:00' ){

              var y = this.$dayjs(this.editProduct.start).year()
              var m = this.$dayjs(this.editProduct.start).month()
              var d = this.$dayjs(this.editProduct.start).date()
              start_date = new Date(y, m, d, 10, 10)

            }
            if( !this.editProduct.end && this.editProduct.end != '0000-00-00 00:00:00' ){

              var end_y = this.$dayjs(this.editProduct.end).year()
              var end_m = this.$dayjs(this.editProduct.end).month()
              var end_d = this.$dayjs(this.editProduct.end).date()
              end_date = new Date(end_y, end_m, end_d, 10, 10)

            }

          this.startend = [ start_date , end_date ]

      },

      submitEditProduct : function(){

        console.clear()

        var flg = true
        var msg = ''

        if( this.editProduct.productName == '' ) {

         msg += '<p>商品名が未入力です</p>'
         flg = false

        }
        if( this.editProduct.productCode == '' ) {

         msg += '<p>商品コードが未入力です</p>'
         flg = false

        }
        if( this.editProduct.productDetail == '' ) {

          msg += '<p>商品説明が未入力です</p>'
          flg = false

        }
        if( this.editProduct.productPrice == '' ) {

          msg += '<p>商品価格が未入力です</p>'
          flg = false

        }
        if( this.editProduct.isMax && this.editProduct.maxNum == 0 ) {

          msg += '<p>限定数量が未入力です</p>'
          flg = false

        }
        if( this.editProduct.isPeriod && this.startend == '' ) {

          msg += '<p>期間が設定されていません</p>'
          flg = false

        }
        if( this.editProduct.productPhoto == '' ) {

          msg += '<p>画像が設定されていません</p>'
          flg = false

        }

        if(!flg){

          this.errorMsg(msg)
          return

        }
        if(flg){

          console.dir(this.startend)

          const startDate = new Date(this.startend[0])
          const endDate = new Date(this.startend[1])
          if (isNaN(startDate.getDate()) || isNaN(endDate.getDate())) {
            this.editProduct.start = null
            this.editProduct.end   = null
          } else {
            this.editProduct.start = this.$dayjs(this.startend[0]).format('YYYY-MM-DD 10:00:00')
            this.editProduct.end   = this.$dayjs(this.startend[1]).format('YYYY-MM-DD 23:59:59')
          }

          this.loading = true

          console.dir('this.editProduct')
          console.dir(this.editProduct)

          let editProductId = this.editProduct.productId
          delete this.editProduct.productId
          axios.post( process.env.API_URL + 'updateProduct' , {
            token: process.env.INFO_TOKEN,
            product_id: editProductId,
            set_product: this.editProduct,
          } )
            .then( function(result){

              console.dir(result.data.products)

              this.setProducts(result.data.products)


            }.bind(this))
            .catch( function(error) {

                console.dir(error)

            }.bind(this))
            .finally(function(){

              this.loading = false

            }.bind(this))

        }


      },//////////////////////

        /*****************************************************************
        * MSGサーバにトークン発行を要求
        ******************************************************************/
        setToken : async function(){

          var data = new FormData()
          return axios.post( process.env.API_URL + 'getToken' , {
            token: process.env.INFO_TOKEN
          } )
            .then( function (result){

              this.apiToken = JSON.parse( JSON.stringify( result.data.token ) )

            }.bind(this))
            .catch( function(err){ console.dir(err); })
            .finally(async function(){ }.bind(this))

        },



  },// method

};
</script>
<style>
[ouentai-products]{
  display: flex;flex-flow:row wrap;justify-content: space-between; align-items:stretch;
  padding: 2em 2em 6em 2em;
}
[ouentai-products] > *{
width: 22%;max-width: 22%;margin: 1%;
transition: all 0.3s ease;min-height: 200px;
}
@media(max-width: 1180px){
  [ouentai-products] > *{width: 30%;max-width: 30%;min-height: 200px;}
}
[ouentai-products] > *:hover{
  filter: drop-shadow(0px 0px 8px rgba(32,32,32,0.9));
  transition: all 0.3s ease;
}

[add-product-dialog]{
  width: 100%;height: 100%;
}

[add-product-dialog] .el-dialog{
  width: 80%;height: 75%;
}


[add-product-dialog] .el-dialog__body{
  height: 100%;position: relative;
  padding: 0px 20px;
}

[dialog-btn-area]{
position: absolute;width: calc(100% - 3em);
    bottom: 5em;
    display: flex; flex-flow:row nowrap;justify-content: flex-end; align-items: center;
}

[add-box]{
   display: flex; flex-flow:row nowrap; justify-content: space-between; align-items:stretch;
}

[add-box] [add-box-left]{
  width: 45%;
}

[add-box] [add-box-right]{
  width: 52%;
}

[add-box] label{
  padding: 0.5em;
  font-size: min(3.6vmin , 14px);
  font-weight: bold;
}
[input-set]{
  display: flex; flex-flow:row nowrap;
  justify-content: flex-start; align-items: center;
  margin-bottom: 25px;
}

[input-set] label + div{
  width: 100%;
}


[switch-set]{
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    width: 12em;
}
.el-input + label{
  margin-top: 20px;
}

[switch-set] > span{
  display: inline-block;padding-right: 0.5em;
}
[switch-set] .el-range-editor.el-input__inner{
  width: 100%;
}
[image-upload-box]{width: 150px;height: 150px;border: 1px dotted #ccc;
  display: flex; flex-flow:column nowrap;justify-content: center; align-items: center;
}
[image-overlay-box]{
  width: 150px;height: 150px;margin-top: -150px;
  display: flex; flex-flow:column nowrap;justify-content: center; align-items: center;
  position: relative;
}
[image-overlay-box] img{
  width: 150px;height: 150px;object-fit: cover;
}
[image-overlay-box] i{
  position: absolute;right: 1em;bottom: 1em;transform: scale(2);color: #F00;background: #FFF;border-radius: 50% 50% 50% 50%;
}


[add-box-right-split]{
display: flex; flex-flow:row nowrap; justify-content: space-between; align-items:stretch;
}

[right-right-right]{width: 100%}

[right-right-right] > span{
  padding: 0.5em 1em 0.2em 2em;
  display: block;width: 100%;
  text-align: left;font-size: min(3.4vmin , 13px);
}

.el-message p{
  line-height: 2em;
}





</style>
