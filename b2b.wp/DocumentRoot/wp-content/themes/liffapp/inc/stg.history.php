<!-- // page init // -->
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
<!-- // page init // -->

<?php include $path->inc . 'main-css.php';?>


<!-- /// #app /// -->
<div id="app" v-cloak>


<?php include $path->inc . 'app.loading.php';?>

<?php include $path->inc . 'app.header.php';?>


	<main class="HistoryLists">
		<template v-for="( history , index ) in histories">

			<div @click="history.showModal = true" class="history-box">
				<dl>
					<dt>納品日時</dt>
					<dd>{{history.delivery_date}}</dd>
				</dl>			
				<dl>
					<dt>発注金額</dt>
					<dd v-if="history.cartTtl != null">{{history.cartTtl | number_format}}円</dd>
					<dd v-else="history.cartTtl == null">- 未計算 -</dd>
				</dl>
				<dl>
					<dt>発注点数</dt>
					<dd>{{history.product_count}}点</dd>
				</dl>
				<dl v-if="history.orderMemo">
					<dt>発注メモ</dt>
					<dd>{{history.orderMemo}}</dd>
				</dl>
				<dl class="temp">
					<dt>発注日時</dt>
					<dd>{{history.order_date}}</dd>
				</dl>
			</div>

			<transition name="modal">
		    <div class="modal-mask" v-if="history.showModal" @close="history.showModal = false">
		      <div class="modal-wrapper" >
		        <div class="modal-container">
				
					<div class="modal-header">
						<h3 slot="header">納品日 : {{history.delivery_date}}</h3>
					</div>


					<div class="modal-body">
						<h4 modalh4top>発注点数 : {{history.product_count}}点</h4>
						<p v-for="(product , index ) in history.products">
							<span><b>{{ index | code2name }}</b></span>
							<span v-if="history.products_price">@{{ index,history | code2price }}</span>
							<span> x {{product}}<span v-if="history.products_lot">{{index,history | code2lot}}</span></span>
						</p>
						<h4 v-if="history.cartTtl != null" modalh4btm>発注金額 : {{history.cartTtl | number_format}}円</h4>
						<h4 v-else="history.cartTtl == null" modalh4btm>発注金額 : - 未計算 -</h4>
					</div>
					

					<div v-if="history.orderMemo" slot="orderMemo">
						<dl class="modalMemo">
							<dt>発注メモ :</dt>
							<dd>{{history.orderMemo}}</dd>
						</dl>
					</div>
		          
					<div class="modal-footer">
						<a @click="HistoryToCart(index)" Bold>この内容で再発注</a>
						<a @click="history.showModal = false">閉じる</a>
					</div>

			    </div><!--.modal-container-->
			  </div><!--.modal-wrapper-->
			</div><!--.modal-mask-->
			</transition>

		</template>
	</main>


	<?php include $path->inc . 'stg.app.footer.php';?>


</div>
<!-- /// #app /// -->

<script>
window.onload = async function() {

	// admin-ajax.phpの設定
    var ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';
    // LINEデータ変数定義
	Vue.prototype.$displayName = ''
	Vue.prototype.$userId = ''
	Vue.prototype.$pictureUrl = ''
	Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';


	const app = new Vue({
		/*
		***********************************************************************************************/
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
			//ページ設定
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

			histories : [],

		},
		/*
		***********************************************************************************************/
		methods: {

			//  過去の発注一覧を取得
			getUserHistory: function(){

				var history = new FormData()
				history.append('action', 'getUserHistory')
				history.append('userId', Vue.prototype.$userId )

				axios.post(ajaxurl, history)
			        .then(function(responce){

						var res = responce.data
						var len = Object.keys(responce.data);

						for (let step = 0; step < len.length; step++) {

							var target = len[step]

							this.histories.push({

					    		id : res[target].id,
					    		user_code : '1041',
					    		order_date : res[target].create_date,
					    		delivery_date : res[target].delivery_date,
					    		showModal : false,
					    		products : res[target].products,
					    		products_price : res[target].products_price,
					    		products_lot : res[target].products_lot,
					    		product_count : res[target].product_count,
					    		orderMemo     : res[target].memo,
					    		cartTtl : res[target].cartTtl,
					    		currentPrice : res[target].currentPrice

							})

					            this.isLoading = false

						}



			        }.bind(this))
		        	.catch(function(responce){

		          		console.log('responce');

		        	}.bind(this))




			},//getHistory

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


			HistoryToCart : function(index){

				var cartInProducts = this.histories[index].products
				var result = window.confirm('この内容でカートを上書きします');

			    if( result ) {
			 
			        var HistoryCart = new FormData();			 
					HistoryCart.append('action', 'historyCart')
					HistoryCart.append('userId', Vue.prototype.$userId )
					HistoryCart.append('products', JSON.stringify(cartInProducts) )

					axios.post( ajaxurl , HistoryCart )
				        .then(async function(responce){

				        	// カート数量をアップデート
				        	await this.GetCartNum() 

				        	this.histories[index].showModal = false


				        }.bind(this))//axios.post(ajaxurl, HistoryCart)
			        	.catch(function(responce){
			        		
			        		console.log('axios : chk_cart error')

			        	}.bind(this))

			    }

			},

		},

		/* LINE LOGIN 処理
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
						app.userName = profile.displayName
				
						//////////[ ユーザー登録・更新処理 ]///////////////////////
						var data = new FormData();

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
					        	await this.getUserHistory()

					        	//////////[ データ取得処理 ]///////////////////////

					        }.bind(this))//axios.post(ajaxurl, data)
				        	.catch(function(responce){
				        		
				        		console.log('axios : chk_cart error')

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



		},//mounted:function()

		/*
		***********************************************************************************************/
        computed: {




        },

		/*
		***********************************************************************************************/
        watch: {

  		
  		},


	})// const app = new Vue

<?php 
$product_list = $hiyoshi_db->get_results("SELECT product_ID,product_name,product_lot,now_price FROM current_product");
?>
const product_set = [{
<?php foreach($product_list as $val):?>
		<?php echo $val->product_ID;?> : '<?php echo $val->product_name;?>',
<?php endforeach;?> 
}]

}
</script>