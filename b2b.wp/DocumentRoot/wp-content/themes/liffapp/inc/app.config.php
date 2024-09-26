<!-- / stg.config -->
<?php

global $wpdb;
$db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
$db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
$db_host = $wpdb->dbhost; //データベースホストの取得
$hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

global $path;
global $lang;
global $lang_set;
global $alternate;
global $wp_query;

global $pid;
$pid = ( is_home() )? get_option( 'page_on_front' ) :get_the_ID();

$seo = GetSeo($pid);

LoadLiff();
VueSet();

$liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$pid} ");

?>
<?php include $path->inc . 'main-css.php';?>


<!-- #app config-->
<div id="app" v-cloak>
<?php include $path->inc . 'app.loading.php';?>
<?php include $path->inc . 'app.header.php';?>

	<h1 header>マイリスト</h1>

<main class="HistoryLists">
		<template v-for="( mylist , index ) in myLists">

			<div @click="mylist.showModal = true" class="history-box">
				<dl>
					<dt>リスト名</dt>
					<dd>{{mylist.list_name}}</dd>
				</dl>			
				<dl>
					<dt>商品点数</dt>
					<dd>{{mylist.product_count}}点</dd>
				</dl>
				<dl class="temp">
					<dt>作成日時</dt>
					<dd>{{mylist.create_date}}</dd>
				</dl>
			</div>

			<transition name="modal">
		    <div class="modal-mask" v-if="mylist.showModal" @close="mylist.showModal = false">
		      <div class="modal-wrapper" >
		        <div class="modal-container">
				
					<div class="modal-header">
						<h3 slot="header">{{mylist.list_name}}</h3>
					</div>


					<div class="modal-body">
						<h4 modalh4top>発注点数 : {{mylist.product_count}}点</h4>
						<p v-for="(product , index ) in mylist.products">
							<span><b>{{ index | code2name }}</b></span>
							<span v-if="mylist.products_price">@{{ index,mylist | code2price }}</span>
							<span> x {{product}}<span v-if="mylist.products_lot">{{index,mylist | code2lot}}</span></span>
						</p>
					</div>
					

					<div v-if="mylist.memo" slot="orderMemo">
						<dl class="modalMemo">
							<dt>メモ</dt>
							<dd v-html="mylist.memo"></dd>
						</dl>
					</div>

					<div caption>商品の数量はカート内で変更できます</div>
		          
					<div class="modal-footer">
						<a @click="mylistToCart(index)" Bold>この内容で再発注</a>
						<a @click="mylist.showModal = false">閉じる</a>
					</div>

			    </div><!--.modal-container-->
			  </div><!--.modal-wrapper-->
			</div><!--.modal-mask-->
			</transition>
		</template>
</main>

	<!-- app.footer -->
	<?php include $path->inc . 'app.footer.php';?>
	<!-- app.footer -->


</div>
<!-- / #app -->

<script>
window.onload = async function() {

	// admin-ajax.phpの設定
    var ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';
    // LINEデータ変数定義
	Vue.prototype.$displayName = ''
	Vue.prototype.$userId = ''
	Vue.prototype.$pictureUrl = ''
	Vue.prototype.$shopcode = ''
	Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';

	const app = new Vue({
		el: '#app',
		/*
		***********************************************************************************************/
		filters: {


			number_format : function (value) {

  				let formatter = new Intl.NumberFormat('ja-JP');
  				return formatter.format(value);
			
			},

			code2name : function (code) {

				return product_set[0][code]

			},

			code2price : function (code,mylist) {

				return ( mylist.products_price[code] != '時価' )? mylist.products_price[code] + '円':mylist.products_price[code]

			},

			code2lot : function (code,mylist) {

				return mylist.products_lot[code]

			}


		},
		/*
		***********************************************************************************************/
		data: {
			////// 全ページ共通設定 /////////////////////
			PageName : '<?php echo $seo->title->jp;?>',

			cartNum : 0,
			login : false,
			userName : 'anonymous',

			displayName : 'anonymous',
			userId : 'anonymous',
			pictureUrl : 'anonymous',

			icon:'',
			printProductList : '商品一覧',
			printCart : 'カート',
			printHistory : '履歴',
			printConfig : '設定',

			// PageLoader
            isLoading: true,
            fullPage: true,
            ////// 全ページ共通設定 /////////////////////

            myLists : [],

			shopcode : '',

		},

		/*
		***********************************************************************************************/
		methods: {

			//// [カートの中身] ////////////////////////////////////////////////
			GetCartNum : function () {
			    
        		var chkCart = new FormData()
    			chkCart.append('action', 'chk_cart')
    			chkCart.append('userId', Vue.prototype.$userId )					        			
				axios.post(Vue.prototype.$ajaxurl, chkCart)
		        	.then(function(result){

		        		app.cartNum = result.data

		        	}.bind(this))
		        	.catch(function(responce){

		        		console.log('axios : chk_cart error')

		        	}.bind(this))

			},


			//// [マイリスト取得] //////////////////////////////////////////////
			getMyList: function(){

				var myList = new FormData()
				myList.append('action', 'getMyList')
				myList.append('userId', Vue.prototype.$userId )

				axios.post(ajaxurl, myList)
			        .then(function(responce){

						var res = responce.data
						var len = Object.keys(responce.data);

						//////// リスト作成処理
						for (let step = 0; step < len.length; step++) {

							var target = len[step]

							this.myLists.push({
								create_date   : res[target].create_date,
					    		id            : res[target].id,
					    		list_name     : res[target].list_name,
					    		processed_flg : res[target].processed_flg,
					    		product_count : res[target].product_count,
					    		products      : res[target].products,
					    		userId        : res[target].userId,
					    		memo          : res[target].memo,
					    		showModal     : false,
							})

						}
						//////// リスト作成処理

					    this.isLoading = false

					    console.dir(this.myLists)

			        }.bind(this))
		        	.catch(function(responce){


		        	}.bind(this))

				


			},//getmylist


			//// [マイリスト取得] //////////////////////////////////////////////
			mylistToCart : function(index){

				var cartInProducts = this.myLists[index].products
				var result = window.confirm('この内容でカートを上書きします');

			    if( result ) {
			 
			        var myListCart = new FormData();			 
					myListCart.append('action', 'historyCart')
					myListCart.append('userId', Vue.prototype.$userId )
					myListCart.append('products', JSON.stringify(cartInProducts) )

					axios.post( ajaxurl , myListCart )
				        .then(async function(responce){

				        	// カート数量をアップデート
				        	await this.GetCartNum() 

				        	this.myLists[index].showModal = false


				        }.bind(this))//axios.post(ajaxurl, myListCart)
			        	.catch(function(responce){
			        		
			        		console.log('axios : chk_cart error')

			        	}.bind(this))

			    }

			},


		},
		/*
		***********************************************************************************************/
		created: async function() {

		},
		/*
		***********************************************************************************************/
	  	mounted: async function() {

	    	//////////////////////// SET LIFF ID ////////////////////////				    		
			await liff.init({ liffId : '<?php echo $liff->liff_id; ?>' })
				.then(()=>{
					liff.getProfile()
					.then(function(profile){

						this.displayName = profile.displayName
						this.userId = profile.userId
						this.pictureUrl = profile.pictureUrl

						Vue.prototype.$displayName = profile.displayName
						Vue.prototype.$userId = profile.userId
						Vue.prototype.$pictureUrl = profile.pictureUrl

						// ヘッダーにユーザー名を表示
						this.userName = profile.displayName
				
						//////////[ ユーザー登録・更新処理 ]///////////////////////
						var data = new FormData();

						// アクセス記録（ユーザーチェック）
						data.append('action', 'update_user');
						data.append('userId', Vue.prototype.$userId );
						data.append('displayName', Vue.prototype.$displayName );
						data.append('pictureUrl', Vue.prototype.$pictureUrl );

			            // ユーザー情報を取得
						axios.post(ajaxurl, data)
					        .then(async function(responce){

					        	//////////[ データ取得処理 ]///////////////////////

					        	// カートの商品数を取得
					        	await this.GetCartNum()

						        	//////////[ ショップコードを取得 ]///////////////////////
						        	var usershop = new FormData();
									usershop.append('action', 'userIdToShopId');
									usershop.append('userId', Vue.prototype.$userId );

									await axios.post(Vue.prototype.$ajaxurl, usershop)
							        	.then( async function(result){

											Vue.prototype.$shopcode = result.data
											this.shopcode           = result.data

											// マイリストを取得
						        			await this.getMyList()


										}.bind(this))// axios.post(Vue.prototype.$ajaxurl, usershop)

								        .catch(function(responce){

								        	console.dir(responce)

								        })
								    //////////[ ショップコードを取得 ]///////////////////////




					        	//////////[ データ取得処理 ]///////////////////////

					        }.bind(this))//axios.post(ajaxurl, data)
				        	.catch(function(responce){
				        		
				        		console.log('axios : chk_cart error')
				        		console.log(responce)

				        	}.bind(this))

					}.bind(this))// getProfile().then

			        .catch(function(responce){

			        	//ログインさせる（テスト中のみ）
			        	if (!liff.isLoggedIn()) { liff.login() }

			        }.bind(this))

			})//liff.init().then
			.catch(function(e){
				if (!liff.isLoggedIn()) { liff.login() }

				// 失敗したら、友達追加画面にリダイレクト
				//window.location = 'https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1654397924';
			})
			///////////////////////// SET LIFF ID /////////////////////////






		},//created:function()

		/*
		***********************************************************************************************/
        computed: {

        },
		/*
		***********************************************************************************************/
        watch: {

  		
  		}

	})// const app = new Vue


<?php 
$product_list = $hiyoshi_db->get_results("SELECT product_ID,product_name,product_lot,now_price FROM current_product");
?>
const product_set = [{
<?php foreach($product_list as $val):?>
		'<?php echo $val->product_ID;?>' : '<?php echo $val->product_name;?>',
<?php endforeach;?> 
}]


}
</script>
<!-- stg.config / -->