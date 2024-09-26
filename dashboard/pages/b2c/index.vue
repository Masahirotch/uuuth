<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />
        <div id="content-header" split>
            <h3>販売 LINE 公式アカウント管理</h3>
            <el-button type="success" size="mini" mr-3 text-white @click="addNewApp">+ 公式アカウントを追加</el-button>
        </div>

        <div id="account-list">

            <div account-box v-for="( item , index , key ) in apps ">
                <div>
                    <dl>
                        <dt>アカウントID</dt>
                        <dd>{{item.app_code}}</dd>
                    </dl>
                    <dl>
                        <dt>アプリ名</dt>
                        <dd>{{item.app_name}}</dd>
                    </dl>
                </div>

                <div center-col account-edit>
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="open( index )">編集する</el-button>
                </div>


                <el-dialog
                  :title="item.app_name"
                  :visible.sync="item.view"
                  big-dialog>

                  <div appsetting-body>

                        <dl dl-half>
                            <dt required-label>アプリ名</dt>
                            <dd><el-input placeholder="アカウント名" v-model="item.app_name"></el-input></dd>
                            <dt required-label>アカウントID <br>(半角英字のみ)</dt>
                            <dd><el-input placeholder="アカウントID" v-model="item.app_code"></el-input></dd>
                        </dl>

                        <dl dl-half v-if="item.app_id > 0">
                            <dt>ロゴ<br><b style="color:#F00;">即時更新です！</b></dt>
                            <dd>

                                <ImageUploaderWithIndex
                                    @uploadImage="uploadFile" 
                                    ref="imgUploader" 
                                    :currentImage = "item.thumb_url"
                                    :index        = "item.app_id"
                                />

                            </dd>

                            <dt>テーマカラー</dt>    
                            <dd>
                                <select select-theme v-model="item.theme_id">
                                    <option disabled>選択</option>
                                    <option value="1">テーマ 1</option>
                                    <option value="2">テーマ 2</option>
                                </select>
                                <span>▼</span>
                            </dd>
                        </dl>

                        <dl toggle-area v-if="item.app_id > 0" >
                            <dd>
                                <el-collapse accordion>

                                    <!--/////////////////////////////-->
                                    <el-collapse-item title="LIFF ID" name="1">
                                        <el-input placeholder="" v-model="item.liff_id"></el-input>
                                    </el-collapse-item>

                                    <!--/////////////////////////////-->
                                    <el-collapse-item title="MESSAGING API チャネルシークレット" name="1">
                                        <el-input placeholder="" v-model="item.msg_channel_secret"></el-input>
                                    </el-collapse-item>

                                    <!--/////////////////////////////-->
                                    <el-collapse-item title="MESSAGING API アクセストークン" name="2">
                                        <el-input
                                        type="textarea"
                                        :autosize="{ minRows: 2, maxRows: 4}"
                                        placeholder=""
                                        v-model="item.msg_access_token">
                                        </el-input>
                                    </el-collapse-item>

                                    <!--/////////////////////////////-->
                                    <el-collapse-item title="配送可能エリアおよび配送料" name="3">
                                        <div pref-loop>
                                            <div atm-prefshipping v-for="pref in item.shipping">
                                                <label>
                                                    <span>{{prefCode2Pref(pref.pref_code)}}</span>
                                                    <el-switch v-model="pref.shipping_flg"></el-switch>
                                                </label>
                                                <label v-if="pref.no_size_flg">
                                                    <span>送料</span>
                                                    <el-input 
                                                        v-model="pref.shipping_fee" 
                                                        placeholder="0" maxlength="5" 
                                                        class="shipping-edit" 
                                                        :disabled="!pref.shipping_flg"
                                                        @keypress="validate" @input="pref.shipping_fee=format(pref.shipping_fee)"
                                                    ></el-input>
                                                </label>
                                                <label v-if="!pref.no_size_flg">
                                                    <span>送料(S)</span>
                                                    <el-input 
                                                        v-model="pref.shipping_fee_s" 
                                                        placeholder="0" maxlength="5" 
                                                        class="shipping-edit" 
                                                        :disabled="!pref.shipping_flg"
                                                        @keypress="validate" @input="pref.shipping_fee_s=format(pref.shipping_fee_s)"
                                                    ></el-input>
                                                </label>
                                                <label v-if="!pref.no_size_flg">
                                                    <span>送料(M)</span>
                                                    <el-input 
                                                        v-model="pref.shipping_fee_m" 
                                                        placeholder="0" maxlength="5" 
                                                        class="shipping-edit" 
                                                        :disabled="!pref.shipping_flg"
                                                        @keypress="validate" @input="pref.shipping_fee_m=format(pref.shipping_fee_m)"
                                                    ></el-input>
                                                </label>
                                                <label v-if="!pref.no_size_flg">
                                                    <span>送料(L)</span>
                                                    <el-input 
                                                        v-model="pref.shipping_fee_l" 
                                                        placeholder="0" maxlength="5" 
                                                        class="shipping-edit" 
                                                        :disabled="!pref.shipping_flg"
                                                        @keypress="validate" @input="pref.shipping_fee_l=format(pref.shipping_fee_l)"
                                                    ></el-input>
                                                </label>
                                            </div>
                                        </div>
                                    </el-collapse-item>

                                    <!--/////////////////////////////-->
                                    <el-collapse-item title="利用規約の編集 (HTMLタグ利用可)" name="4">
                                        <BtoCeditTerms :terms="item" />
                                    </el-collapse-item>

                                    <!--/////////////////////////////-->
                                    <el-collapse-item title="特定商取引法に基づく表記の編集" name="5">
                                        <BtoCeditLaw :laws="item"/>
                                    </el-collapse-item>

                                    <!--/////////////////////////////-->
                                    <el-collapse-item title="プライバシーポリシーの編集" name="6">
                                        <BtoCeditPrivacy :privacy="item"/>
                                    </el-collapse-item>

                                </el-collapse>
                            </dd>
                        </dl>

                        <dl v-if="item.app_id > 0">
                            <dt>アプリテスト</dt>
                            <dd><a :href="liffLink(item)" target="_blank">リンク</a></dd>
                        </dl>                  

                    </div>

                    <span slot="footer" class="dialog-footer">
                        <el-button @click="item.view = false">閉じる</el-button>
                        <el-button type="primary" @click="updateAppSetting(item.app_id)">内容を更新</el-button>
                    </span>
                
                </el-dialog>   

            </div>

        </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../../mixin/mixinUtils'
export default {

    mixins:[util],

    data: () => {
        return {
            loading     : true,
            text        : '処理中...',
            apps        : '',

            activeNames: []

        }
    },
    created(){

        console.clear()

        this.initApp()

    },
    mounted : function(){

    },
    watch: {
        apps: {
            handler: function (val) {

                //console.log(val)
                
            },
            deep: true
        }
    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref' , 'appList' , 'products' , 'order' ]),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref' , 'setAppList' , 'setProducts' , 'setOrder' ]),

        // 初期設定 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        initApp : async function(){

            // const pref 取得 
            var do_getConstPref = await this.getConstPref()

            await this.setConstPref( do_getConstPref )

            // app list 取得 
            var do_getAppList   = await this.getApps()

            // appごとの配送設定を取得 
            let do_getAppShipping = await Promise.all( do_getAppList.map( async function( app ){

                let res = await this.getAppShipping(app.app_id)
                return res

            }.bind(this)));


            // app list の配送データをセット 
            await do_getAppList.map( app => {

                app.shipping = do_getAppShipping.find( s => s[0].app_id == app.app_id )
                return app

            })

            await this.setAppList( do_getAppList )

            // app list の配送データをセット
            await this.endInit()



        },

        /* ロード完了
        ***************************************************/
        endInit : function(){

            // アプリリストをセット
            this.apps = JSON.parse( JSON.stringify( this.appList ) )
            this.loading = false

        },

        /* const pref 取得
        ***************************************************/
        getConstPref : async function(){

            var db = new URLSearchParams()
            return await axios.post( process.env.B2C_API + 'getConstPref' , db ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },
        /* app list 取得
        ***************************************************/
        getApps : async function(){

            var res = null

            var db = new URLSearchParams()
            await axios.post( process.env.B2C_API + 'getAppList' , db ).then( function(result){

                console.dir( result.data )

                res = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

            return res

        },
        /* app ごとの配送設定を取得
        ***************************************************/
        getAppShipping : async function( app_id ){

            var res = null

            var db = new URLSearchParams()
            db.append( 'app_id' , app_id )
            await axios.post( process.env.B2C_API + 'getAppShipping' , db ).then( function(result){

                for ( let step = 0; step < 47; step++ ) {

                    var code = step + 1
                    var fee  = ( result.data[step] != void 0 && result.data[step].shipping_fee != void 0 )? result.data[step].shipping_fee : ''
                    var fee_s  = ( result.data[step] != void 0 && result.data[step].shipping_fee_s != void 0 )? result.data[step].shipping_fee_s : ''
                    var fee_m  = ( result.data[step] != void 0 && result.data[step].shipping_fee_m != void 0 )? result.data[step].shipping_fee_m : ''
                    var fee_l  = ( result.data[step] != void 0 && result.data[step].shipping_fee_l != void 0 )? result.data[step].shipping_fee_l : ''
                    var flg  = ( result.data[step] != void 0 && result.data[step].shipping_flg != void 0 )? result.data[step].shipping_flg : 0
                        flg  = ( flg == 0 )? false:true
                    var ns_flg  = ( result.data[step] != void 0 && result.data[step].no_size_flg != void 0 )? result.data[step].no_size_flg : 0
                        ns_flg  = ( ns_flg == 0 )? false:true

                    result.data[step] = {
                          app_id            : app_id , 
                          pref_code         : code,
                          shipping_fee      : fee,
                          shipping_fee_s    : fee_s,
                          shipping_fee_m    : fee_m,
                          shipping_fee_l    : fee_l,
                          shipping_flg      : flg,
                          no_size_flg       : ns_flg
                    }

                }

                res = result.data

            }.bind(this)).catch((err) => { console.dir(err); })

            return res

        },
        // 初期設定 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



        // 更新処理 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /* App 設定の更新
        ***************************************************/
        updateAppSetting : function(app_id){

            this.loading = true

            var target = this.apps.find( app => app.app_id == app_id )

            if( target.app_code == '' || target.app_name == '' ){

                this.loading = false
                this.errorMsg('<p>入力項目が不正です</p>')

            }
            else{

                var db = new URLSearchParams()
                db.append( 'appData' , JSON.stringify( target ) )
                db.append( 'app_id'  , app_id )
                axios.post( process.env.B2C_API + 'updateAppSetting' , db ).then( function(result){

                    if( app_id == 0 ){ target.app_id = Number(result.data.app_id); }

                    this.loading = false
                    this.successMsg('<p>データを更新しました</p>')

                }.bind(this))
                .catch((err) => { console.dir(err); })
                .finally(function(){

                    this.initApp()

                }.bind(this))

            }

        },

        /* アプリの追加
        ***************************************************/
        addNewApp : function(){

            this.$confirm('新しくアプリを追加しますか？', '新規アプリの追加', {

                confirmButtonText: '追加する',
                cancelButtonText: 'キャンセル',
                type: 'warning'

            }).then(() => {

                this.newAppAdd()

            }).catch(() => {});

        },
        newAppAdd : function(){

                var new_id = 0
                var shippingdata = []

                for ( let step = 1; step < 48; step++ ) {

                    var p = JSON.parse( JSON.stringify( this.constPref.find( c => c.pref_code == step )  ))

                    p = {
                          app_id       : new_id , 
                          pref_code    : step,
                          shipping_fee : '',
                          shipping_flg : false
                    }

                    shippingdata.push(p)

                }

                var newApp = {
                    app_code : '',
                    app_name : '',
                    app_id   : new_id,
                    logo_gid : null,
                    msg_access_token   : '',
                    msg_channel_secret : '',
                    shipping : shippingdata,
                    theme_id : 1,
                    thumb    : '',
                    view     : false,
                }

                this.apps.push( newApp )

        },


        /* ロゴデータの更新
        ***************************************************/
        uploadFile : function( res ){

            var db = new URLSearchParams()
            db.append( 'file_id' , res.file_id )
            db.append( 'app_id'  , res.index )
            axios.post( process.env.B2C_API + 'saveSiteLogo' , db ).then( function( result ){

                var target = this.apps.find( app => app.app_id == res.index )
                target.logo_file_id = res.file_id

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){  }.bind(this))


        },


        /* テーマカラーのセット
        ***************************************************/
        themes : function(index){

            return this.apps[index].theme

        },

        /* 編集画面を開く
        ***************************************************/
        open : function( index ){

            this.apps[index].view = true

        },

        /* 処理の成功メッセージ
        ***************************************************/
        successMsg( msg ) {
            
            this.$message({
                dangerouslyUseHTMLString: true,
                message: msg,
                type: 'success'
            });

        },

        /* 処理のwarningメッセージ
        ***************************************************/
        warningMsg( msg ) {
            
            this.$message({
                dangerouslyUseHTMLString: true,
                message: msg,
                type: 'warning'
            });

        },
        /* 処理のエラーメッセージ
        ***************************************************/
        errorMsg( msg ) {
            
            this.$message({
                dangerouslyUseHTMLString: true,
                message: msg,
                type: 'error'
            });

        },


        // HELPER ///////////////////////////////////////////////////////////////////////////////////////////
        /* LIFF アプリのリンク生成
        ***************************************************/
        liffLink : function(item){

            return 'https://liff.line.me/' + item.liff_id + '?app=' + item.app_code

        },

        /* prefCodeから県名を返す
        ***************************************************/
        prefCode2Pref : function(pref_codde){

            return this.constPref.find( pref => pref.pref_code == pref_codde ).jp

        },
    },

};
</script>
<style>
#account-list{padding:1em;}

[appsetting-body]{
    padding-bottom:4em;
}

[account-box]{
    width:100%;
    border:2px solid #ccc;
    border-radius:0.4em;
    padding:1em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
    margin-bottom:1em;
}

[account-box] > div{
    padding:5px;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-align-items: flex-start; align-items: flex-start;
    -webkit-align-content: center; align-content: center;
    width:100%;
}

[account-box] > div dl{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-align-items: flex-start; align-items: flex-start;
    -webkit-align-content: center; align-content: center;
    margin-right:0.6em;
}

[account-box] > div dl:nth-of-type(1){width:25%;}
[account-box] > div dl:nth-of-type(2){width:25%;}

[account-box] > div dl dt{
    font-size:13px;
    font-weight:500;
}
[account-box] > div dl dd{
    padding:0.4em;
    border-bottom:1px solid #666;
    width:100%;
    line-height:14px;
    font-weight:600;
}
[account-edit]{width:6em !important;}


[required-label]::before{
    content : '-- 必須 --';
    color   : #F00;
    font-size:0.75em;
    display:block;
    margin-left:0.6em;
    font-weight:bold;
}









/**************** big dialog form ******************/



/****************** big dialog pref setting form ***************/

[pref-loop]{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row wrap;flex-flow:row wrap;
  -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
  -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}


[atm-prefshipping]{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap; flex-flow:row nowrap;
  -webkit-justify-content: left;-ms-flex-pack: left;justify-content: left;
  -webkit-align-items: left;  -ms-flex-align: left; align-items: left;
  width: 100%;
  padding:0 0.2em;
  max-width: 650px;
}

[atm-prefshipping] label{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap; flex-flow:row nowrap;
  -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
  padding: 1em 0.3em;
}
[atm-prefshipping] label:nth-of-type(1){width:25%;}
[atm-prefshipping] label:nth-of-type(2){width:25%;}
[atm-prefshipping] label:nth-of-type(3){width:25%;}
[atm-prefshipping] label:nth-of-type(4){width:25%;}



[atm-prefshipping] label > span{width:5.2em;}
[atm-prefshipping] label .el-input{
  position:relative;
}

[atm-prefshipping] .shipping-edit.el-input .el-input__inner{
    color: #2e2e2e;
    font-size: 16px;
    padding: 0 22px 0 5px;
    text-align: right;
    width: 5em;
}

[atm-prefshipping] label .el-input::after{
  content:"円";
  position:absolute;
  left:5.5em;
  top:1.5em;
  font-size:0.8em;
  color:#888;
}


[big-dialog] .el-dialog .el-dialog__body dl[toggle-area]{
    border:none;
}
[big-dialog] .el-dialog .el-dialog__body dl[toggle-area] dd{
    width:100%;
}

.el-collapse-item__header{
    font-size: 15px;
    color:#333;
    font-weight:600;

}

</style>
