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
VueSelect();
$liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$pid} ");
?>
<!-- // page init // -->


<?php include $path->inc . 'main-css.php';?>

<!-- #app -->
<div id="app" v-cloak>
<?php include $path->inc . 'app.loading.php';?>
<?php include $path->inc . 'app.header.php';?>



<main>

<div id="noOrder" v-if="cartNum == 0">
	<h1>{{noOrder}}</h1>
</div>

<div id="OftenList" >

	<template id="snap" v-for="(item , index) in OffenList" v-if="cartNum != 0">
		<div ListItem>
			<div LeftBox>
				<img :src="item.product_image">
			</div>
			<div RightBox>
				<h4> {{item.product_name}} 
					<span delete @click="modalToggle(index)">削除</span>
					<v-dialog name="delProduct" :width="300"></v-dialog>
				</h4>
				<p v-if="item.product_price != '時価'">
					<span> {{item.product_price | number_format}}</span>
					<span>円</span> / <span>{{item.product_lot}}</span>
					<span>x {{item.product_num}} = {{item.product_total | number_format}}</span>
					<span>円</span>
				</p>
				<p v-else>
					<span>時価</span> / <span>{{item.product_lot}}</span>
					<span>x {{item.product_num}} = </span>
					<span>時価</span>
				</p>

				<div button-box>
					<button @click="click_count_down1(index)" minus1>-1</button>
					<button cartBtn @click="cart_in(index)" v-bind:class="{ 'incart' : item.product_cart }">
						<span>数量 : {{item.product_num}}</span>
					</button>
					<button @click="click_count_up1(index)" plus1>+1</button>
				</div>
			</div>
		</div>


		<transition name="modal">
	    <div class="modal-mask" v-if="item.showModal">
	      <div class="modal-wrapper" >
	        <div class="modal-container">
			
				<div class="modal-header">
					<h3 slot="header"><spamc small-70>[{{index + 1}}]</spam>{{item.product_name}}</h3>
					
				</div>
	          	<div class="modal-body">
					<h4 modalh4top>この商品を削除しますか？</h4>
					<p>削除処理は取り消すことができません。</p>
				</div>
				<div class="modal-footer">
					<a @click="DelProduct(index)" Bold>削除する</a>
					<a @click="item.showModal = false">閉じる</a>
				</div>

		    </div><!--.modal-container-->
		  </div><!--.modal-wrapper-->
		</div><!--.modal-mask-->
		</transition>


	</template>

</div>
<div CartTTL v-if="cartNum !== 0">
	<h4 TTLPRICE>カート内トータル : {{cartTtl | number_format}}円<span v-if="currentPrice == true"> + 時価</span></h4>
</div>

<div Memo v-if="cartNum !== 0">
	<p>備考・発注メモ</p>
	<textarea 
		MemoText 
		v-model="memo" 
		placeholder="商品についてのご要望などを記載"
		></textarea>
</div>

<div DeliDate v-if="cartNum !== 0">
	<p>納品希望日を指定</p>
	<v-select :options="delivery" v-model="delivery_day"></v-select>
</div>

<div BtnArea>
	<button OrderBtn @click="completeOrder" v-if="cartNum > 0">この内容で発注する</button>
</div>

<div Memo listnamearea v-if="cartNum !== 0">
	<h2>カート内容を発注リストとして登録</h2>
	<p>カート内容を発注リストとして登録しておくと、同じ内容をすぐにカートに反映させることができます。登録リスト名を入力して「リストに登録」ボタンでリスト登録できます。</p>
	<input v-model="listname" placeholder="登録リスト名を入力" ListName>
	<button inListBtn @click="cartToList" v-if="cartNum > 0 && listname != '' && listChange">リストに登録</button>

</div>



</main>


<?php include $path->inc . 'app.footer.php';?>

</div>




<?php

$lists = $hiyoshi_db->get_results(" SELECT * from temp_cart ORDER BY datetime ASC ");
$lemon = new stdClass();
foreach($lists as $val){
	$product_id = $val->product_id;
	$userId     = $val->userId;
	$lemon->$product_id = $hiyoshi_db->get_row("SELECT * FROM current_product Where product_ID = '{$product_id}' ");
	$lemon->$product_id->num = $hiyoshi_db->get_row("SELECT quantity FROM temp_cart Where product_id = '{$product_id}' ");
	$lemon->$product_id->userId = $userId;

}

?>
<script>

const Loading = window.VueLoading

window.onload = async function() {

	// 初期状態用データ
	var Offens = [
			{
				product_num    : 0, 
				product_ID     : '', 
				product_name   : '', 
				product_lot    : '', 
				product_price  : 0,
				product_image  : '',
				product_origin : '',
				product_total  : '',
				product_cart   : false,
				userId         : '',
				showModal      : false
			},
	]

// <?php echo date("G");?>

	var delivery_days = [
<?php

// 23時以降は次の日の配達NG
$start = ( date("G") >= 23 )? 2: 1;
$end = $start + 8;

for ($i = $start; $i <= $end; $i++) {
$print_date = date('Y-m-d', mktime(0, 0, 0, date('m'), date('d') + $i, date('Y')));

print <<< EOF
    '{$print_date}',
EOF;
};
?>
	]

	// admin-ajax.phpの設定
    var ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';

    // LINEデータ変数定義
	var displayName,userId,pictureUrl;

	Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';
	
	Vue.prototype.$displayName = ''
	Vue.prototype.$userId = ''
	Vue.prototype.$pictureUrl = ''
	
	Vue.prototype.$cartComp = false
	Vue.prototype.$Offens = ''


	// vue-select
	Vue.component('v-select', VueSelect.VueSelect);
	
	var TargetIndex;

	//////////////////////////////////////////////////////////////////
	var app = new Vue({

	    /**[ 初期値設定 ]***************************************/
		el: '#app',


		/*
		***********************************************************************************************/	
        components: {
            Loading
        },

		/*
		***********************************************************************************************/	
		data: {
			// ページ設定
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

			// products
			product_ID : '',
			product_num: 0,
			product_name : '',
			product_lot : '',
			product_price : '',
			product_image : '',
			product_origin : '',
			product_cart : false,
			OffenList : '',


			// カート内出力用
			cartTtl : '',
			currentPrice : <?php echo ($current_price_flg <> 0)? 'true' : 'false';?>,
			noOrder    : '', // カート内に商品がなかった時に表示するテキスト

			// カート送信用
            memo : '',
			delivery : delivery_days,
			delivery_day : '<?php echo date('Y-m-d', mktime(0, 0, 0, date('m'), date('d') + 1, date('Y')));?>',


            composing: false,

            // リスト登録名
            listname : '',
            listChange : true,
            listID     : ''
		},

		/*
		***********************************************************************************************/	
		methods: {

			//////////////////// 発注処理 ////////////////////////////////////////
			completeOrder: function(){

				var OrderList = JSON.stringify(this.OffenList)
				var data = new FormData();

				data.append('action', 'completeOrder')
				data.append('userId', Vue.prototype.$userId )
				data.append('OrderList', OrderList )
				data.append('Delivery', this.delivery_day )
				data.append('Memo', this.memo )
				data.append('cartTtl', this.cartTtl )
				data.append('currentPrice', this.currentPrice )

				axios.post(Vue.prototype.$ajaxurl, data)
	        	.then(function(responce){

	        		Vue.prototype.$cartComp = true
	        		alert('発注処理を行いました')
	        		//console.dir(responce.data)
	        		window.location = '/history/'
	   
	        	})
	        	.catch(function(error){
	        		console.log('エラー')
	        		console.dir(error)

	        	})

			},
			//////////////////// 発注処理 ////////////////////////////////////////

			////////////// カウントアップ・ダウン ////////////////////////////////////////
		    click_count_up1: function (index) {
		      
		      this.OffenList[index].product_num++

		      if( this.OffenList[index].product_price != '時価'){
		      		this.OffenList[index].product_total = this.OffenList[index].product_num * this.OffenList[index].product_price
		      }
		      else{

					this.OffenList[index].product_total = '時価'

		      }

		      this.cartTotal()

	    		app.listChange = true

		    },

		    click_count_down1: function (index) {
		      
		      this.OffenList[index].product_num--
		      
		      if( this.OffenList[index].product_num < 0 ){

		      	this.OffenList[index].product_num = 0
		      	this.DelProduct(index)
		      
		      }
		      if( this.OffenList[index].product_num == 0 ){
		      	this.DelProduct(index)
		      }

		      if( this.OffenList[index].product_price != '時価'){
		      		this.OffenList[index].product_total = this.OffenList[index].product_num * this.OffenList[index].product_price
		      }
		      else{
		      	
					this.OffenList[index].product_total = '時価'

		      }
		    
		      this.cartTotal()

	    		app.listChange = true

		    },
		    ////////////// カウントアップ・ダウン ////////////////////////////////////////

		    ////////////// カート内の商品再計算 ////////////////////////////////////////
			cartTotal: function(){

				var temp_ttl = Number(0)

				for ( let step = 0; step < app.OffenList.length; step++ ) {

					var target = app.OffenList[step]

					if(target.product_total == '時価'){
						temp_ttl = parseInt(temp_ttl,10) + 0
						this.currentPrice = true
					}
					else{
						temp_ttl = parseInt(temp_ttl,10) + parseInt(target.product_total , 10)
					}
				}

				app.cartTtl = temp_ttl

			},
			////////////// カート内の商品再計算 ////////////////////////////////////////


			////////////// 商品削除 ///////////////////////////////////////////////////
			DelProduct : function(index){

				//////////[ データ取得処理 ]///////////////////////
				var data = new FormData();

				data.append('action', 'delProductToCart')
				data.append('userId', Vue.prototype.$userId )
				data.append('product', this.OffenList[index].product_ID )
				data.append('index', index )

				axios.post(Vue.prototype.$ajaxurl, data)
		        	.then( function(responce){

		        		// 削除処理					    		
			    		this.OffenList.splice( index , 1 )

			    		//カート内再計算
	  					this.cartTotal()

		        		this.cartNum = responce.data.count

		        		if(this.cartNum == 0){

							this.noOrderFlg = true
							this.noOrder = 'カート内に商品はありません'

		        		}

		        		this.listChange = true
	            		this.listID     = ''
	            		this.listname = ''

	            		//this.OffenList[index].showModal = false
	            		console.dir(responce.data)


		        	}.bind(this))
		        	.catch( function(error){
		        		console.log('エラー')
		        		console.dir(error)

		        	})

			},
			////////////// 商品削除 ///////////////////////////////////////////////////


			////////////// カート処理(データベースから、カート内の状態を取得) //////////////////////////////
			cart_in: async function (index) {

				if( this.OffenList[index].product_num > 0 && this.OffenList[index].product_cart === false) {

					console.log('カート処理を開始します');

					//////////[ データ取得処理 ]///////////////////////
					var data = new FormData();

					data.append('action', 'cartFunc')
					data.append('userId', Vue.prototype.$userId )
					data.append('product_num', this.OffenList[index].product_num )
					data.append('product', this.OffenList[index].product_ID );
					data.append('index', index );

					await axios.post(Vue.prototype.$ajaxurl, data)
			        	.then(function(responce){

			        		if(responce.data !== null){

			        			app.cartNum = responce.data.count
			        			//glCartNum   = responce.data.count
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
			////////////// カート処理(データベースから、カート内の状態を取得) //////////////////////////////

			////////////// カート内商品をリスト登録する //////////////////////////////
			cartToList: async function () {

				this.isLoading = true


				var OrderList = JSON.stringify(this.OffenList)
				var listdata = new FormData();

				listdata.append('action', 'save_user_product_list');
				listdata.append('userId', Vue.prototype.$userId )
				listdata.append('OrderList', OrderList )
				listdata.append('listname', this.listname )
				listdata.append('listID' , this.listID )
				listdata.append('memo' , this.memo )


				axios.post(Vue.prototype.$ajaxurl, listdata)
	        	.then(function(responce){

	        		this.listChange = false
	        		this.listname   = ''
            		this.listID     = responce.data
	        		this.isLoading  = false
	   
	        	}.bind(this))
	        	.catch(function(error){

	        		console.log('エラー')
	        		console.dir(error)

	        	}.bind(this))

			},
			////////////// カート内商品をリスト登録する //////////////////////////////



			modalToggle: function(index){
				this.OffenList[index].showModal = !this.OffenList[index].showModal
			}


		},

		/*
		***********************************************************************************************/	
		computed: {


		},


		/*
		***********************************************************************************************/	
	  	mounted: async function() {

	    	//////////////////////// SET LIFF ID ////////////////////////				    		
			await liff.init({ liffId : '<?php echo $liff->liff_id; ?>' })

				.then(()=>{

					liff.getProfile()
						.then(function(profile){

							Vue.prototype.$displayName = profile.displayName
							Vue.prototype.$userId = profile.userId
							Vue.prototype.$pictureUrl = profile.pictureUrl

							app.displayName = profile.displayName
							app.userId = profile.userId
							app.pictureUrl = profile.pictureUrl

							app.userName = Vue.prototype.$displayName
				
							//////////[ データ取得処理 ]///////////////////////
							var data = new FormData();

							data.append('action', 'update_user');
							data.append('userId', Vue.prototype.$userId );
							data.append('displayName',Vue.prototype.$displayName );
							data.append('pictureUrl', Vue.prototype.$pictureUrl );


							axios.post(ajaxurl, data)
					        	.then(function(responce){

					        		if(responce.data !== null){

					        			var chkCart = new FormData()

					        			chkCart.append('action', 'chk_cart')
					        			chkCart.append('userId', Vue.prototype.$userId )
										axios.post(Vue.prototype.$ajaxurl, chkCart)
								        	.then(function(result){

								        		app.cartNum = result.data

												app.OffenList = Offens

												if(app.cartNum != 0){

									        		var initCart = new FormData();

													initCart.append('action', 'initCart');
													initCart.append('userId', Vue.prototype.$userId );

													axios.post(Vue.prototype.$ajaxurl, initCart)
												        .then(function(responce){

															var ItemList = Object.keys(responce.data)
																				 .map(function (key) {return responce.data[key]})

															app.OffenList = ItemList

															//カート内再計算処理
															app.cartTotal()		        


												    })
												    .then(
												    	function(responce){

												    		app.isLoading = false

												    }) 

												}
												else{
													app.noOrder = 'カート内に商品はありません'
													app.isLoading = false
												}


								        	})
								        ////////////////////////////////////////


					        		}//if(responce.data !== null)

					        	})//axios.post(ajaxurl, data)

					        	.catch(function(responce){

					        		console.log('axios : chk_cart error')

					        	}).
					        	Promise.all().then(function(message) {
 								   // 結果を表示する処理
								})
				    		/////////////////////////////////

						})// getProfile().then

			        	.catch(function(responce){

				        	//ログインさせる（テスト中のみ）
				        	if (!liff.isLoggedIn()) { liff.login(); }


			        	})

				})//liff.init().then
				.catch(function(e){

		        	//ログインさせる（テスト中のみ）
		        	if (!liff.isLoggedIn()) { liff.login(); }

					//console.dir(e)
					// ログインしていない時はリダイレクト
					//window.location = 'https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1654397924';
				})
			///////////////////////// SET LIFF ID /////////////////////////

		},//created:function()


		/*
		***********************************************************************************************/	
		filters:{
			number_format : function (value) {
  				let formatter = new Intl.NumberFormat('ja-JP');
  				return formatter.format(value);
			}

		},



	})//app
	//////////////////////////////////////////////////////////////////

};
</script>