
<!-- /////////////////////////// stg.order /////////////////////// -->
<?php

global $wpdb;

// DB設定（hiyoshi）
$db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
$db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
$db_host = $wpdb->dbhost; //データベースホストの取得
$hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

global $path;
global $pid;

	$pid = ( is_home() )? get_option( 'page_on_front' ) :get_the_ID();

?>

<!-- ■ inc main-css ■ -->
<?php include $path->inc . 'main-css.php';?>
<!-- ■ inc main-css ■ -->

<!-- ■ LoadLiff() , VueSet() , Set $liff ■ -->
<?php
LoadLiff();
VueJS();
AxiosJS();
$liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$pid} ");

echo "<!--\n";

var_dump($liff);

echo "-->\n";
?>
<!-- ■ LoadLiff() , VueSet() , Set $liff ■ -->

<!-- CDNJS :: Sortable (https://cdnjs.com/) -->
<script src="<?php echo $path->js;?>/Sortable.min.js"></script>
<script src="<?php echo $path->js;?>/vuedraggable.umd.min.js"></script>




<!-- #app -->
<div id="app" v-cloak>
<?php include $path->inc . 'app.loading.php';?>
<?php include $path->inc . 'app.header.php';?>


<main>

<div id="OftenList" >

	<div searchWord>
		<i class="fas fa-search color666 right05em" @click="inputClear"></i>
		<input type="text" v-model="searchWord" placeholder="キーワード検索">
	</div>


	<button cartbtn editbtn @click="editToggle" v-if="searchWord == '' ">
		<span v-if="!isEdit">並び替え</span><span v-if="isEdit">編集中</span>
	</button>

	<button cartbtn editbtn searchclear @click="inputClear" v-if="searchWord != '' ">
		<span>キーワードクリア</span>
	</button>


    <draggable :options="{handle:'.handle'}" v-model="OffenList" style="max-width:100%;">

		<div v-for="(item , index) in OffenList" v-if="item.filter === false" productBox>
			
			<div ListItem draggable="false" >
				<div LeftBox>
					<img :src="item.product_image" @click="popupToggle(index)">
				</div>

				<div RightBox>
					<h4>
						{{item.product_name}} 
						<span Origin>{{item.product_origin}}</span>
						<span KeyWord>{{item.KeyWord}}</span>



					</h4>
					<p>
						<span>{{item.product_price | number_format}}</span>
						<span v-if="item.product_price != '時価'">円</span> / <span>{{item.product_lot}}</span>
					</p>				
				</div>


			</div>
			<div button-box>
				<button @click="click_count_down10(index)" minus10>-10</button>
				<button @click="click_count_down1(index)" minus1>-1</button>
				<button cartBtn @click="cart_in(index)" v-bind:class="{ 'incart' : item.product_cart }">
					<i basket ref="basket"></i>
					<div cartAction></div>
					<span>{{item.product_num}}</span>
					
				</button>
				<button @click="click_count_up1(index)" plus1>+1</button>
				<button @click="click_count_up10(index)" plus10>+10</button>
				
				<button cartBtn dragbtn v-if="isEdit" class="handle"><i class="fas fa-bars"></i></button>
			</div>	

			<!-- /////// product modal //////// -->
			<transition name="fade">
			<div popupbase v-if="item.popup">
				<div popupbox>
					<img :src="item.product_image" @click="popupToggle(index)">
					<h3>{{item.product_name}}</h3>
					<p>
						<span>{{item.product_price | number_format}}</span>
						<span v-if="item.product_price != '時価'">円</span> / <span>{{item.product_lot}}</span>
					</p>
					<p style="position:absolute;width:15em;top:2.5em;right:0.7em;">
						<!-- 削除ボタン -->
						<span delete @click="modalToggle(index)">発注商品リストから削除</span>
						<v-dialog name="delProduct" :width="300"></v-dialog>
						<!-- 削除ボタン -->
					</p>
				</div>
			</div>
			</transition>
			<!-- /////// product modal //////// -->

			<!-- /////// product delete modal //////// -->
			<transition name="modal">
		    <div class="modal-mask" v-if="item.showModal">
		      <div class="modal-wrapper" >
		        <div class="modal-container">
				
					<div class="modal-header">
						<h3 slot="header">{{item.product_name}}</h3>
						
					</div>
		          	<div class="modal-body">
						<h4 modalh4top>この商品を削除しますか？</h4>
						<p>削除処理は取り消すことができません。</p>
					</div>
					<div class="modal-footer">
						<a @click="ProductDelete(index)" Bold>削除する</a>
						<a @click="item.showModal = false">閉じる</a>
					</div>

			    </div>
			  </div>
			</div>
			</transition>
			<!-- /////// product delete modal //////// -->


		</div>

    </draggable>


</div>
</main>


<!-- ■ stg.app.footer ■ -->
<?php include $path->inc . 'app.footer.php';?>
<!-- ■ stg.app.footer ■ -->


</div>
<!-- #app -->


<script>
window.onload = async function() {

	const draggable = window['vuedraggable'];

	// admin-ajax.phpの設定
    var ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';

    // LINEデータ変数定義
	Vue.prototype.$displayName = ''
	Vue.prototype.$userId = ''
	Vue.prototype.$pictureUrl = ''
	Vue.prototype.$CartNum = 0
	Vue.prototype.$shopcode = {}
	Vue.prototype.$products = {}

	// ajax url
	Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';

	//////////////////////////////////////////////////////////////////
	const app = new Vue({

		/*
		***********************************************************************************************/
		el: '#app',

		/*
		***********************************************************************************************/		
		data: {

			// USER CONFIG
			displayName : '',
			pictureUrl  : '',
			userId      : '',


			searchWord: '',
			PageName : '<?php echo $post->ID;?>',

			shopcode : '',

			login : false,
			product_ID : '',
			product_num: 0,
			product_name : '',
			product_lot : '',
			product_price : '',
			product_image : '',
			product_origin : '',
			product_cart : false,
			OffenList : '',
			positionX : 0,
			positionY : 0,
			cartBtnShow :false,



			// footer
			icon:'',
			printProductList : '商品一覧',
			printCart : 'カート',
			printHistory : '履歴',
			printConfig : '設定',



            isLoading: true,
            fullPage: true,


			cartNum : 0,
			popup: false,

			isEdit : false




		},


		/* ページロード寺の初期設定
		***********************************************************************************************/
	  	mounted: async function() {

	  		console.log('1. Page mounted function liff.init ... ')
	    	//////////////////////// SET LIFF ID ////////////////////////				    		
			await liff.init({ liffId : '<?php echo $liff->liff_id; ?>' })
				.then(function(){

					console.log('2. liff.init complete. liff.getprofile start ... ')					

				//////////[ ユーザープロファイル取得処理 ]///////////////////////
				liff.getProfile()
					.then(function(profile){

						Vue.prototype.$displayName = profile.displayName
						Vue.prototype.$userId = profile.userId
						Vue.prototype.$pictureUrl = profile.pictureUrl

						this.displayName = profile.displayName
						this.userId = profile.userId
						this.pictureUrl = profile.pictureUrl

						console.log('3. liff.getProfile complete. set user config & update DB user data ... ')

						//////////[ データ取得処理 ]///////////////////////
						var data = new FormData();

						data.append('action', 'update_user');
						data.append('userId', Vue.prototype.$userId );
						data.append('displayName', Vue.prototype.$displayName );
						data.append('pictureUrl', Vue.prototype.$pictureUrl );

			            // ユーザーの現ステータス情報を取得
						axios.post(ajaxurl, data)
				        	.then(function(responce){

					        	// 現在のカートの中身を取得
					        	if(responce.data !== null){

					        		console.log('4. update DB user complete. check user now cart ... ')

					        		//////////[ 現在のカートの中身を取得処理 ]///////////////////////
				        			var chkCart = new FormData();
				        			chkCart.append('action', 'chk_cart');
				        			chkCart.append('userId', responce.data.userId );					        			

									axios.post(Vue.prototype.$ajaxurl, chkCart)
							        	.then( function(result){

							        		console.log('5. user cart num is ' + result.data + '. ')



							        		Vue.prototype.$cartNum = result.data
							        		this.cartNum           = result.data
							        		this.displayName       = Vue.prototype.$displayName

							        		/***************************************
							        		userId から所属店舗情報を取得
							        			userId : line ID
												uid    : unique ID
												shop_id: 取引先コード
												parent : 店員の場合、責任者のunique ID。責任者の場合は0

												同時に、店舗の商品一覧を取得
											***************************************/

											console.log('6. get user shop product ... ')
							        		this.IdShopProducts()

							        		//this.dbTest()


							        		return
			
							        	}.bind(this))//axios.post(Vue.prototype.$ajaxurl, chkCart)

				        		}//if(responce.data !== null)

					        }.bind(this))//axios.post(ajaxurl, data)

				        	.catch(function(responce){

				        		console.log('axios : chk_cart error')
				          		console.log(responce);

				        	}).

				        	Promise.all().then(function(message) {
								   // 結果を表示する処理
							})
				    		/////////////////////////////////

					}.bind(this))// getProfile().then

			        .catch(function(responce){

			        	//ログインさせる（テスト中のみ）
			        	if (!liff.isLoggedIn()) {
				        	liff.login();
    					}

			        })

			}.bind(this))//liff.init().then
			.catch(function(e){

	        	//ログインさせる（テスト中のみ）
	        	if (!liff.isLoggedIn()) {
		        	liff.login();
				}

				//console.dir(e)
				//window.location = 'https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1654397924';
			})
			///////////////////////// SET LIFF ID /////////////////////////


		},//created:function()


		/*
		***********************************************************************************************/
		methods: {

			//////////////////////// DB QUERY のテスト用 ////////////////////////
			dbTest : async function(){
				var dbTest = new FormData();
				dbTest.append('action', 'dbTest');

				await axios.post(Vue.prototype.$ajaxurl, dbTest)
		        	.then( async function(result){

		        		
		        		console.dir('↓ dbTest')
		        		console.dir(result.data)


					}.bind(this))// axios.post(Vue.prototype.$ajaxurl, usershop)

			        .catch(function(responce){

			        	console.dir('dbTest error')
			        	console.dir(responce)

			        })

			},


			//////////////////////// userIdから、所属店舗情報を取得して、所属店舗の商品一覧を取得する ////////////////////////
		    IdShopProducts: async function () {

		    	console.log('7. userId is ' + this.userId + '  Get user shop-code ...' )
		      
				//////////////////////[ 所属店舗取得処理 ]///////////////////////
				var usershop = new FormData();

				usershop.append('action', 'userIdToShopId');
				usershop.append('userId', Vue.prototype.$userId );

				await axios.post(Vue.prototype.$ajaxurl, usershop)
		        	.then( async function(result){

						Vue.prototype.$shopcode = result.data
						this.shopcode           = result.data

						console.log('8. User shop-code is [' + result.data + ']. Get user shop products...' )


						//////////////////////[ 商品一覧取得処理取得処理 ]///////////////////////
						var getProducts = new FormData()
						getProducts.append('action', 'shopProducts')
						getProducts.append('shop_code', this.shopcode )

						await axios.post(Vue.prototype.$ajaxurl, getProducts)
				        	.then( function(result){

				        		console.log('9. ▼ user shop products' )
				        		console.dir(result.data)

				        		// 商品リストを書き換え
								this.OffenList = result.data

								// ローディング表示解除
								this.isLoading = false


							}.bind(this))// axios.post(Vue.prototype.$ajaxurl, GetProducts)

					        .catch(function(responce){

					        	console.dir(responce)
					        	this.isLoading = false

					        })



					}.bind(this))// axios.post(Vue.prototype.$ajaxurl, usershop)

			        .catch(function(responce){

			        	console.dir(responce)

			        })

		    },
		    //////////////////////// userIdから、所属店舗情報を取得して、所属店舗の商品一覧を取得する ////////////////////////


			//////////////////////// カウントアップ・ダウン ////////////////////////
		    click_count_up1: function (index) {
		      
		      	this.OffenList[index].product_num++
		    
		    },
		    click_count_up10: function (index) {
		      
		      this.OffenList[index].product_num += 10
		    
		    },
		    click_count_down1: function (index) {
		      
		      this.OffenList[index].product_num--
		      if( this.OffenList[index].product_num < 0 ){
		      	this.OffenList[index].product_num = 0
		      }
		    
		    },
		    click_count_down10: function (index) {
		      
		      this.OffenList[index].product_num -= 10
		      if( this.OffenList[index].product_num < 0 ){
		      	this.OffenList[index].product_num = 0
		      }
		    
		    },
		    //////////////////////// カウントアップ・ダウン ////////////////////////


			////////////////////////////////////// カート処理 ////////////////////////////////////////////////
			cart_in: async function (index) {

				

				if( this.OffenList[index].product_num > 0 && this.OffenList[index].product_cart === false) {

					//////////[ データ取得処理 ]///////////////////////
					var data = new FormData();

					data.append( 'action',     'tempCart')
					data.append( 'userId',     Vue.prototype.$userId )
					data.append( 'product_id', this.OffenList[index].product_ID )
					data.append( 'quantity',   this.OffenList[index].product_num )
					data.append( 'index',      index )


					console.dir(Vue.prototype.$userId)
					console.dir(this.OffenList[index].product_ID )
					console.dir(this.OffenList[index].product_num)
					console.dir(index )


					await axios.post(Vue.prototype.$ajaxurl, data)
			        	.then(function(responce){

			        		console.dir(responce.data)

			        		if(responce.data !== null){

			        			app.cartNum = responce.data.count
			        			app.OffenList[responce.data.index].product_cart = true

			        		}

			        	})
			        	.catch(function(error){
			        		console.log('エラー')
			        		console.dir(error)
			        	})

				}

				return;

			},
			////////////////////////////////////// カート処理 ////////////////////////////////////////////////


			////////////////// サーチワードクリアボタン設置の場合 //////////////////////////////////// 
			inputClear : function(){
				//console.dir(app.searchWord.value)
				this.searchWord = ''
			},
			////////////////// サーチワードクリアボタン設置の場合 //////////////////////////////////// 


			///////////////// アイテム詳細 POP UP //////////////////////////////////// 
			popupToggle : function(index){

				this.OffenList[index].popup = !this.OffenList[index].popup

			},
			///////////////// アイテム詳細 POP UP //////////////////////////////////// 


			///////////////// 並び替え ////////////////////////////////////////////// 
			editToggle : async function(){
				this.isEdit = !this.isEdit
				if(!this.isEdit){

					this.isLoading = true


					//////////[ データ取得処理 ]///////////////////////
					var OrderList = JSON.stringify(this.OffenList)
					var saveSort = new FormData();

					console.dir(this.OffenList)

					saveSort.append( 'action'   ,  'productSorting')
					saveSort.append( 'userId'   ,  Vue.prototype.$userId )
					saveSort.append( 'shop_code',  this.shopcode )
					saveSort.append( 'sortlist' ,  OrderList )

					await axios.post(Vue.prototype.$ajaxurl , saveSort)
			        	.then( function(responce){

			        		this.isLoading = false
			        		console.dir(responce.data)

			        	}.bind(this))
			        	.catch(function(error){
			        		console.log('エラー')
			        		console.dir(error)
			        	})

				}

			},

			///////////////// 商品削除用モーダル開閉 ////////////////////////////////////////////// 
			modalToggle: function(index){
				this.OffenList[index].showModal = !this.OffenList[index].showModal
			},
			///////////////// 商品削除用モーダル開閉 ////////////////////////////////////////////// 


			///////////////// 商品削除 ////////////////////////////////////////////// 
	        ProductDelete: async function(index){

	        	console.dir( 'Vue.prototype.$shopcode : ' + Vue.prototype.$shopcode )
	        	console.dir(this.OffenList[index])

				//////////[ データ削除処理 ]///////////////////////
				var delProduct = new FormData()
				delProduct.append( 'action',     'delListProduct')
				delProduct.append( 'userId',     Vue.prototype.$userId )
				delProduct.append( 'shop_code',  Vue.prototype.$shopcode )
				delProduct.append( 'product_id',  this.OffenList[index].product_ID )

				await axios.post(Vue.prototype.$ajaxurl , delProduct)
					.then( function(responce){

			        	// 削除処理					    		
				    	this.OffenList.splice( index , 1 )
			        	
			        	console.dir(responce.data)

			        }.bind(this))
			        .catch(function(error){  })
	        	
	        },
	        ///////////////// Product 削除 ////////////////////////////////////////////// 

		},


		/*
		***********************************************************************************************/


		/*
		***********************************************************************************************/
        watch: {


        	///////////////// 検索フィルター //////////////////////////////////// 
    		searchWord: function (value) {

				app.OffenList.forEach( function( element , index , key ) {

					if( 
					
						~element.product_name.indexOf(value)   || 
						~element.product_origin.indexOf(value)  || 
						~element.KeyWord.indexOf(value)  

					){

						app.OffenList[index].filter = false

					}
					else{

						app.OffenList[index].filter = true

					}
					
				});

    		},
    		///////////////// 検索フィルター //////////////////////////////////// 
  		










  		},

		/*
		***********************************************************************************************/
		filters: {

			number_format : function (value) {

				if (!value.match(/^\d+$/)) { return value }

				let formatter = new Intl.NumberFormat('ja-JP')
				return formatter.format(value)

			},

		},



	})//app
	//////////////////////////////////////////////////////////////////

};
</script>

<!-- ■■■ stg.order ■■■ -->
