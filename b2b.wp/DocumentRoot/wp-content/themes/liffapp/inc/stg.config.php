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

$liff = $hiyoshi_db->get_row("SELECT * FROM liff_id Where ID = {$pid} ");

?>
<?php include $path->inc . 'main-css.php';?>



<div id="app" v-cloak>

	<!-- app.header -->
	<?php include $path->inc . 'stg.app.header.php';?>
	<!-- app.header -->

<main>
<section MyList>
	<h1>マイリスト</h1>
</section>


</main>

	<!-- app.footer -->
	<?php include $path->inc . 'stg.app.footer.php';?>
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

			code2price : function (code,history) {

				return ( history.products_price[code] != '時価' )? history.products_price[code] + '円':history.products_price[code]

			},

			code2lot : function (code,history) {

				return history.products_lot[code]

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

            MyList : [],

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
			//// [カートの中身] ////////////////////////////////////////////////


			//// [マイリスト取得] //////////////////////////////////////////////
			getMyList: function(){

				var myList = new FormData()
				myList.append('action', 'getMyList')
				myList.append('userId', Vue.prototype.$userId )






				axios.post(ajaxurl, myList)
			        .then(function(responce){



			        }.bind(this))
		        	.catch(function(responce){


		        	}.bind(this))




			},//getHistory
			//// [マイリスト取得] //////////////////////////////////////////////




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

}
</script>
<!-- stg.config / -->