<?php
$path = new stdClass();
$path->server->lib = __DIR__ . '/lib';
$path->url->lib = esc_url( home_url( '/') ) . 'wp-content/plugins/line-functions/lib';

global $wpdb;

$liff = Obj_array_column( $wpdb->get_results(" SELECT * FROM line_functions_config ") , 'config_name');


?>
<!-- / LIFF SDK -->
<link rel="stylesheet" href="<?php echo $path->url->lib;?>/reset.min.css">
<link rel="stylesheet" href="<?php echo $path->url->lib;?>/admin-style.css?v=<?php echo time();?>">

<script charset="utf-8" src="<?php echo $path->url->lib;?>/vue.2.6.12.min.js"></script>
<script charset="utf-8" src="<?php echo $path->url->lib;?>/axios.min.js"></script>
<script charset="utf-8" src="<?php echo $path->url->lib;?>/vue-js-toggle-button.min.js"></script>



<div id="app" v-cloak>
	<!---->
	<h1>LINE FUNCTIONS CORE PLUGIN 基本設定 
		<span v-if="isOpenConfig" @click="isOpenConfig = !isOpenConfig">-</span>
		<span v-if="!isOpenConfig" @click="isOpenConfig = !isOpenConfig">+</span>
	</h1>

	<transition name="fade">
	<dl class="liff_id_input" v-if="isOpenConfig">

		<dt class="padding">配信page URL</dt>
		<dd class="padding"><?php echo esc_url( home_url( '/') );?>information/</dd>

		<dt class="padding">LIFF ID</dt>
		<dd class="padding"><input v-model="liffID" type="text"><button @click="updateLiffID">更新</button></dd>

		<dt>&nbsp;</dt>
		<dd><p class="caption">※ <a href="https://developers.line.biz/ja/" target="_blank">
		LINE Developers</a> から「LINEログイン」チャネルにアプリを登録したIDです。
		</p></dd>

		<dt class="padding">チャネルシークレット</dt>
		<dd class="padding"><input v-model="channelSecret" type="text"><button @click="updateLiffID">更新</button></dd>

		<dt class="padding">アクセストークン</dt>
		<dd class="padding"><input v-model="accessToken" type="text"><button @click="updateLiffID">更新</button></dd>

	</dl>
	</transition>


	<!---->
	<h1>MSG送信設定（API設定） 
		<span v-if="isOpenAPIConfig" @click="isOpenAPIConfig = !isOpenAPIConfig">-</span>
		<span v-if="!isOpenAPIConfig" @click="isOpenAPIConfig = !isOpenAPIConfig">+</span>
	</h1>

	<transition name="fade">
	<dl class="liff_id_input" v-if="isOpenAPIConfig">

		<dt class="padding">Webhook URL</dt>
		<dd class="padding"><input v-model="webhook" type="text"><button @click="updateLiffID">更新</button></dd>

		<dt>&nbsp;</dt>
		<dd><p class="caption">※ <a href="https://developers.line.biz/ja/" target="_blank">
		LINE Developers</a> から「Messaging API」チャネルに登録したIDです。
		</p></dd>

		<dt class="padding">チャネルシークレット</dt>
		<dd class="padding"><input v-model="msg_channelSecret" type="text"><button @click="updateLiffID">更新</button></dd>

		<dt class="padding">チャネルアクセストークン</dt>
		<dd class="padding"><input v-model="msg_accessToken" type="text"><button @click="updateLiffID">更新</button></dd>

	</dl>
	</transition>





	<h1 id="sticky">配信履歴
		<span v-if="isOpenHistory" @click="isOpenHistory = !isOpenHistory">-</span>
		<span v-if="!isOpenHistory" @click="isOpenHistory = !isOpenHistory">+</span>
	</h1>

	<transition name="fade">
	<div v-if="isOpenHistory" id="sendhistory">
		

		<div id="select-flex">
			<div><span>日時選択</span></div>
	        <div class="selectbox">
	            <select v-model="selectYear">
	                <option disabled value="">年を選択</option>
	                <option v-for="year in yearOption" v-bind:value="year.data" v-bind:key="year.data">
	                    {{ year.name }}
	                </option>
	            </select>
	        </div>

	        <div class="selectbox">
	            <select v-model="selectMonth">
	                <option disabled value="">月を選択</option>
	                <option v-for="month in monthOption" v-bind:value="month.data" v-bind:key="month.data">
	                    {{ month.name }}
	                </option>
	            </select>
	        </div>
	        <div>
	        	<p class="send_btn" @click="getHistory">検索</p>
	        </div>
	    </div>

	    <div id="msg-content">
	    	<p v-if="isNoData">その期間のデータはありません。</p>

	    	<div class="msg-loop" v-for="(msg) in messageHistories">
	    		
	    		<div class="msg-view-area">	
			    	<div class="line-text-msg" >
			    		<div class="inner">{{msg.send_msg}}</div>
			    	</div>
			    </div>
		    	<div class="detail-box">
		    		<h3>送信日時　{{msg.send_date}} </h3>
		    		<p>１年生 : {{msg.flg_obo|viewFlg}}</p>
		    		<p>２年生 : {{msg.flg_2nd|viewFlg}}</p>
		    		<p>全員　 : {{msg.flg_all|viewFlg}}</p>
		    		<p v-if="msg.flg_personal == 1">個人配信 : ◯ ( 学籍番号 : {{msg.send_user_array|id2no}} ) </p>
		    	</div>
	    	</div>

	    </div>

	</div><!-- #isOpenshop -->
	</transition>




	<h1 id="sticky">店舗管理
		<span v-if="isOpenshop" @click="isOpenshop = !isOpenshop">-</span>
		<span v-if="!isOpenshop" @click="isOpenshop = !isOpenshop">+</span>
	</h1>

	<transition name="fade">

	<div v-if="isOpenshop" id="shop-data">

		<div v-for="( shops , index ) in shoplist" class="shop-box">

			<dl class="shoptitle">
				<dd>
					<label>顧客コード</label>
					<span class="shop-code">{{shops.shop_code}}</span>
					<span class="del-shop" @click="shops.isDeleteShop = true">削除</span>
				</dd>
				<dd><label>顧客名称</label><input v-model="shops.shop_name" placeholder="" class="shop-edit"></dd>
				<dd class="em8"><label>グループ</label><input v-model="shops.group_code" placeholder="" class="shop-edit"></dd>
				<dd >
					<span class="btn" @click="shopEdit(shops)">顧客情報更新</span>
					<span class="btn" style="position:absolute;right:1.5em;" @click="shops.openUserBox = !shops.openUserBox">&Xi;</span>
				</dd>

	            <!-- ■■ メッセージモーダル ■■ -->
	            <transition name="fade">
	                <div class="modal-mask" v-if="shops.isDeleteShop">
	                  <div class="modal-wrapper" >
	                    <div class="modal-container">
	                    
	                        <div class="modal-header">
	                            <h3>店舗を削除</h3>
	                        </div>

	                        <div class="modal-body">
	                        	<div id="newshop">
	                        		<div><label>顧客名称</label><p></p></div>
	                        		<div><label>顧客コード</label><p></p></div>
	                        		<div><label>グループコード</label><p></p></div>
	                        	</div>
	                        	<p>本当にこの顧客データを削除しますか？<br>削除すると、この顧客データに紐づけられている全ての発注者の連携が解除されます。</p>
	                        </div>
	                        <div class="modal-footer">
	                            <a class="modal-button" @click="deleteShop(shops.shop_code)">削除する</a>
	                            <a class="modal-button" @click="shops.isDeleteShop = false">閉じる</a>
	                        </div>

	                    </div><!--.modal-container-->
	                  </div><!--.modal-wrapper-->
	                </div><!--.modal-mask-->
	            </transition>


			</dl>


				<div id="detail-header">
					<dl class="v-for-header">
						<dt class="wide">ユーザー名</dt>
						<dt class="wide">ID連携状況</dt>
						<dd><a class="add-child" target="_blank" @click="getQR(shops)">子番号ID連携QR</a></dd>
						<dd>MSG配信</dd>
						<dd>利用停止</dd>
						
					</dl>
				</div>

				<dl class="shop" v-for="( shop , index ) in shops.user" v-if="shops.openUserBox">
					<dt class="wide">{{shop.displayName}}</dt>

					<dt class="wide">
						<span v-if="shop.userId != null && shop.userId != '' "  class="id_activate">済</span>
						<span v-else class="id_noactivate">未</span>
						<span v-if="shop.userId != null && shop.userId != '' " 
						class="release_btn"
						@click="shop.showEditModal = true"
						>ID連携解除</span>
					</dt>
					<dd>
						{{shop.shop_id}}
						<span v-if="shop.userId != null && shop.userId != '' " 
						class="send_btn"
						@click="shop.showSendModal = true"
						>MSG送信</span>
					</dd>
					<dd>
		  			<toggle-button v-model="shop.flg_obo" 
		                 color="#82C7EB"
		                 height="25"
		                 width="50"
		                 :sync="true"
		                 :labels="true"
		                 @change="onChangeEventHandler(shop.id , 'flg_obo' , shop.flg_obo)"
		                 >
		            </toggle-button>
					</dd>

					<dd>
					<a class="btn" target="_blank" v-if="shop.userId == null || shop.userId == '' " @click="getQR(shops)">親番号連携QR</a>
		  			<toggle-button v-model="shop.del_flg"
		  				 :value="true"
		                 color="#75c791"
		                 height="25"
		                 width="50"
		                 :sync="false"
		                 :labels="true"
		                 @change="onChangeEventHandler(shop.id , 'del_flg' , shop.del_flg)"
		                 >
		            </toggle-button>

					</dd>

	                <!-- ■■ 削除処理 ■■ -->
	                <transition name="fade">
	                    <div class="modal-mask" v-if="shop.showEditModal">
	                      <div class="modal-wrapper" >
	                        <div class="modal-container">
	                        
	                            <div class="modal-header">
	                                <h3 slot="header">
	                                    <spam small-70>{{shop.shop_id}}</spam>
	                                </h3>
	                            </div>

	                            <div class="modal-body">
	                                <h4 modalh4top>このID連携を解除しますか？</h4>
	                                <p>解除処理は取り消すことができません。</p>
	                            </div>
	                            <div class="modal-footer">
	                                <a class="modal-button" 
	                                @click="releaseID( shop.userId , index , shop.parent , shop.shop_code , shop.uid )">解除する</a>
	                                <a class="modal-button" @click="shop.showEditModal = false">閉じる</a>
	                            </div>

	                        </div><!--.modal-container-->
	                      </div><!--.modal-wrapper-->
	                    </div><!--.modal-mask-->
	                </transition>

	                <!-- ■■ メッセージモーダル ■■ -->
	                <transition name="fade">
	                    <div class="modal-mask" v-if="shop.showSendModal">
	                      <div class="modal-wrapper" >
	                        <div class="modal-container">
	                        
	                            <div class="modal-header">
	                                <h3 slot="header">
	                                    <spam small-70>送信先 : {{shop.shop_id}}</spam>
	                                </h3>
	                            </div>

	                            <div class="modal-body">
	                                <h4 modalh4top>このユーザーにLINEメッセージを送信します。</h4>
	                                <p>個別メッセージ送信機能はメッセージを送信するだけです。個別にやり取りを行う場合はLINE公式アカウントマネージャーアプリのチャット機能をご利用ください。</p>
									<textarea 
										v-model="message" 
										placeholder="ここに送信メッセージを入力します。" 
										cols="19" rows="10"
										class="message-input">
									</textarea>
	                            </div>
	                            <div class="modal-footer">
	                                <a class="modal-button" @click="sendMessage(shop.shop_id)">送信する</a>
	                                <a class="modal-button" @click="shop.showSendModal = false,message = '' ">閉じる</a>
	                            </div>

	                        </div><!--.modal-container-->
	                      </div><!--.modal-wrapper-->
	                    </div><!--.modal-mask-->
	                </transition>




				</dl>

		</div>
		<!--店舗ループ-->








		<div id="add-shop">
			<h3 class="add-btn" @click="newShop = true"> &plus; 店舗を追加する</h3>

            <!-- ■■ メッセージモーダル ■■ -->
            <transition name="fade">
                <div class="modal-mask" v-if="newShop">
                  <div class="modal-wrapper" >
                    <div class="modal-container">
                    
                        <div class="modal-header">
                            <h3>顧客情報を新規追加</h3>
                        </div>

                        <div class="modal-body">
                        	<div id="newshop">
                        		<div><label>顧客名称</label><input v-model="newShopname" placeholder="" class="shop-edit"></div>
                        		<div><label>顧客コード</label><input v-model="newShopcode" placeholder="" class="shop-edit"></div>
                        		<div><label>グループコード</label><input v-model="newShopgroup" placeholder="" class="shop-edit"></div>
                        	</div>
                        </div>
                        <div class="modal-footer">
                            <a class="modal-button" @click="addNewShop()">作成する</a>
                            <a class="modal-button" @click="newShop = false">閉じる</a>
                        </div>

                    </div><!--.modal-container-->
                  </div><!--.modal-wrapper-->
                </div><!--.modal-mask-->
            </transition>






		</div>


	</div><!-- #isOpenshop -->
	</transition>







</div><!-- #app -->
<script>
window.onload = async function() {

	Vue.prototype.$liff_base_url  = 'https://liff.line.me/'

	Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>'

	Vue.prototype.$pushAPI = 'https://push.line.cx/'
	const options = {
	  headers: { 'Content-Type': 'application/json;charset=utf-8' }
	};



	Vue.use(window['vue-js-toggle-button'].default)

	var liffID = '<?php echo ($liff->liffID->config_value)? "{$liff->liffID->config_value}":'';?>';
	var accessToken = '<?php echo ($liff->accessToken->config_value)? "{$liff->accessToken->config_value}":'';?>';
	var channelSecret = '<?php echo ($liff->channelSecret->config_value)? "{$liff->channelSecret->config_value}":'';?>';
	var webhook = '<?php echo ($liff->webhook->config_value)? "{$liff->webhook->config_value}":'';?>';
	var msg_accessToken = '<?php echo ($liff->msg_accessToken->config_value)? "{$liff->msg_accessToken->config_value}":'';?>';
	var msg_channelSecret = '<?php echo ($liff->msg_channelSecret->config_value)? "{$liff->msg_channelSecret->config_value}":'';?>';


	var app = new Vue({

		el: '#app',

		/*
		***********************************************************************************************/	
		data: {

			// liff ID
            liffID   : liffID,
            channelSecret : channelSecret,
            accessToken   : accessToken,
            webhook       : webhook,
            msg_channelSecret : msg_channelSecret,
            msg_accessToken   : msg_accessToken,

            message   : '',

            // shops
            shops    : '',
            shoplist : '',

            // modal
            isOpenConfig  : false,
            isOpenAPIConfig  : false,
            isOpenshop : false,
            isOpenHistory : false,

            isDeleteShop : false,

            // newshop
            newShop      : false,
            newShopname  : '',
            newShopcode  : '',
            newShopgroup : '',


            // vue-select
            selected: '',

            selectYear : '',
            yearOption: [  
                { data: '2020', name: '2020年' },
                { data: '2021', name: '2021年' },
                { data: '2022', name: '2022年' },
            ], 

            selectMonth : '',
            monthOption: [  
                { data: '01', name: '1月' },
                { data: '02', name: '2月' },
                { data: '03', name: '3月' },
                { data: '04', name: '4月' },
                { data: '05', name: '5月' },
                { data: '06', name: '6月' },
                { data: '07', name: '7月' },
                { data: '08', name: '8月' },
                { data: '09', name: '9月' },
                { data: '10', name: '10月' },
                { data: '11', name: '11月' },
                { data: '12', name: '12月' },
            ],
            messageHistories : [],
            isNoData : false,

		},


		/*
		***********************************************************************************************/	
	  	mounted: async function() {

	  			//var vm = this;
	  			//vm.init();
	  			// 10秒ごとにアップデート。本当はwebhookで反映させたいが…。
	  			//setInterval(vm.init, 10000);

	  			this.init()


		},


		/*
		***********************************************************************************************/	
		methods: {

			init : function(){

				var getShops = new FormData();

				getShops.append('action', 'LoadShops')
				getShops.append('user'  , 'user')

				console.dir('実行')

				
				axios.post(Vue.prototype.$ajaxurl, getShops )
					.then( function(result){

						this.shoplist = result.data
						console.dir(result.data)

					}.bind(this))
					.catch(function(responce){

						console.dir(responce)

					})

			},

			/* LIFF関係データをアップデートします。
			**********************************************/
			updateLiffID : function(){

				var setLiff = new FormData();
				
				setLiff.append('action', 'SetLiff')
				setLiff.append('liffID', this.liffID )
				setLiff.append('accessToken', this.accessToken )
				setLiff.append('channelSecret', this.channelSecret )
				setLiff.append('webhook', this.webhook )
				setLiff.append('msg_accessToken', this.msg_accessToken )
				setLiff.append('msg_channelSecret', this.msg_channelSecret )


				axios.post(Vue.prototype.$ajaxurl, setLiff)
					.then( function(result){

						alert('更新しました')

					}.bind(this))
					.catch(function(responce){

					})

			},

			/* 顧客情報をアップデートします。
			**********************************************/
			shopEdit : function(shops){

				var shopEdit = new FormData();
				
				shopEdit.append('action', 'editShop')
				shopEdit.append('shop_code', shops.shop_code )
				shopEdit.append('shop_name', shops.shop_name)
				shopEdit.append('group_code', shops.group_code )
				shopEdit.append('auto_id', shops.auto_id )

				axios.post(Vue.prototype.$ajaxurl, shopEdit )
					.then( function(result){

						alert(
							'顧客コード : ' + result.data.shop_code + 
							'\nグループコード : ' + result.data.group_code + 
							'\n顧客名称 : ' + result.data.shop_name + 
							'\nのデータをアップデートしました。'
						)

					}.bind(this))
					.catch(function(responce){

					})

			},
			deleteShop : function(shop_code){


				alert(this.shoplist[shop_code].shop_name)


				this.shoplist[shop_code].isDeleteShop = false



			},

			/* ID連携を解除します。
			*****************************************/
		    releaseID: function( userId , index , parent , shop_code , uid ){

		    	if( parent == 0 ){

		    		alert('親番号のIDを解除すると、子番号の登録ができなくなります。\n\r解除後は早急にID連携を行なってください。')

		    	}
	     
		    	var releaseID = new FormData()

		    	releaseID.append( 'action'    , 'releaseID')
		    	releaseID.append( 'userId'    , userId )
		    	releaseID.append( 'uid'       , uid )
		    	releaseID.append( 'shop_code' , shop_code )

				axios.post( Vue.prototype.$ajaxurl, releaseID )
					.then( function(result){

						console.dir(result.data)

						
						this.shoplist[shop_code].user[index].showEditModal = false

						this.init()



					}.bind(this))
					.catch(function(responce){

					})


		    },

			/* ID連携用QRコードを生成します。
			*****************************************/
            getQR : function( shops ){

            	var shop_code = shops.shop_code

                var url_base = Vue.prototype.$liff_base_url + '<?php echo ID_LINK_LIFF_ID; ?>' + '/'

                var liff_url = url_base + '?shop_code=' + shop_code

                window.open('https://chart.apis.google.com/chart?chs=500x500&cht=qr&chl='+liff_url, '_blank')

            },

			/* 新規に顧客を追加する
			*****************************************/
            addNewShop : function(){

            	if(this.newShopcode == '') return
            	if(this.newShopname == '') return
            	if(this.newShopgroup == '') return


            	var addShop = new FormData()
				addShop.append( 'action'          , 'addShop'   )
				addShop.append( 'shop_code'       , this.newShopcode )
				addShop.append( 'shop_name'       , this.newShopname )
				addShop.append( 'group_code'      , this.newShopgroup )

				axios.post( Vue.prototype.$ajaxurl , addShop )
					.then( function( result ){

						console.dir(result.data)

						if( result.data == 'already'){

							alert('店舗コード「'+this.newShopcode+'」はすでに登録済みです。\n\r登録を行いませんでした。')
							this.newShop = false

						}
						else if( result.data == 'add'){

							alert('店舗コード「'+this.newShopcode+'」を新規追加しました')
							this.newShop = false
							this.init()
							
						}
						else{

							this.newShop = false
							this.init()

						}





					}.bind(this))
					.catch(function(responce){

						console.dir(responce)

					})

            },





			saveSendLog : function(sudentId){

				var saveLog = new FormData()

				saveLog.append( 'action'          , 'saveSendLog'   )
				saveLog.append( 'post_id'         , '<?php echo $id;?>' )
				saveLog.append( 'send_msg'        , this.message )
				saveLog.append( 'flg_obo'         , false   )
				saveLog.append( 'flg_2nd'         , false   )
				saveLog.append( 'flg_all'         , false   )
				saveLog.append( 'flg_personal'    , true )
				saveLog.append( 'send_user_array' , this.shops[sudentId].userId )
				saveLog.append( 'send_status'     , 200 )

				axios.post(Vue.prototype.$ajaxurl, saveLog )
					.then( function( result ){

						this.message = ''


					}.bind(this))
					.catch(function(responce){

						console.dir(responce)

					})


			},

			sendMessage : function(sudentId){

				var sendMessageContent = this.message
				var sendAPI = new FormData();

				console.dir('this.shops[sudentId].userId : '+ this.shops[sudentId].userId)

				sendAPI.append( 'message' , sendMessageContent )
				sendAPI.append( 'to' , JSON.stringify( [ this.shops[sudentId].userId ] ) )
				sendAPI.append( 'channelSecret' , this.channelSecret )
				sendAPI.append( 'accessToken' , this.accessToken )

				console.dir('Send Message ....')

				axios.post( Vue.prototype.$pushAPI , sendAPI , options )
					.then( function(result){

						if(result.data == 200){

							
							alert('送信しました')
							
							this.shops[sudentId].showSendModal = false

							this.saveSendLog(sudentId)



						}

					}.bind(this))
					.catch(function(responce){

						console.dir(responce)

					})


			},


			/*
			*****************************************/
		    onChangeEventHandler: function(  id , elm , status ){
		     
		    	var cngData = new FormData()

		    	cngData.append( 'action'  , 'cngData')
		    	cngData.append( 'cngType' , elm )
		    	cngData.append( 'id'      , id )
		    	cngData.append( 'status'  , status )

				axios.post(Vue.prototype.$ajaxurl, cngData)
					.then( function(result){

						console.dir(result.data)

					}.bind(this))
					.catch(function(responce){

					})


		    },





        	getHistory: function(){

        		var SelectDate = this.selectYear + '-' + this.selectMonth

        		var getHistory = new FormData();
                getHistory.append('action'   , 'getHistory')
                getHistory.append('date'     ,  SelectDate )

                axios.post( Vue.prototype.$ajaxurl, getHistory )
                    .then(function(result){

                    	console.dir(result.data)

                    	if( result.data == 'none' ){

							this.isNoData = true

                    	}
                    	else{

                    		this.isNoData = false
                    		this.messageHistories = result.data

                    	}


                    }.bind(this))
                    .catch(function(error){

                    	console.dir(error)

                    })

        	}





		},

		/*
		***********************************************************************************************/	
		computed: {


		},

		/*
		***********************************************************************************************/	
	  	created: async function() {


		},

		/*
		***********************************************************************************************/	
		filters:{
			number_format : function (value) {
  				let formatter = new Intl.NumberFormat('ja-JP');
  				return formatter.format(value);
			},
			newLine(content){ 
				return content.replace(/(\n|\r)/g,'<br />'); 
			},
			viewFlg(val){

				if( val == '1' ){
					return ' ◯ 配信'
				}
				else{
					return ' ー 未配信'
				}

			},
			id2no(userId){

				const shops = Array.from( app.shops )

				for (const [key, value] of Object.entries(app.shops)) {

					if(value.userId == userId){

						return value.shop_id
					
					}

				}


			},




		},


	})//app

}
</script>