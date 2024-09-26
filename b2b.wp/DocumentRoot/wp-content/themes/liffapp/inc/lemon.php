<?php

global $wpdb;
global $path;
global $lang;
global $lang_set;
global $alternate;
global $wp_query;

global $pid;
$pid = ( is_home() )? get_option( 'page_on_front' ) :get_the_ID();

$seo = GetSeo($pid);

$lists = $wpdb->get_results(" SELECT * from lemon ORDER BY priority DESC ");
$lemon = new stdClass();
foreach($lists as $val){
	$product_id = $val->product_id;
	$lemon->$product_id = $wpdb->get_row("SELECT * FROM current_product Where product_ID = '{$product_id}' ");
}


?>

<?php include $path->inc . 'main-css.php';?>
<?php
LoadLiff();
VueSet();
$liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$pid} ");
?>

<div id="app" v-cloak>

<!-- navbar top -->
<?php include $path->inc . 'app.header.php';?>


<input type="hidden" id="userId" value="">
<input type="hidden" id="displayName" value="">
<input type="hidden" id="pictureUrl" value="">
<!-- end navbar top -->

<main>
<div id="OftenList" >

	<div searchWord>
		<i class="fas fa-search color666 right05em" @click="inputClear"></i>
		<input type="text" v-model="searchWord" placeholder="キーワード検索">

	</div>

	<template id="snap" v-for="(item , index) in OffenList" v-if="item.filter === false">
		<div ListItem>
			<div LeftBox>
				<img :src="item.product_image">
			</div>
			<div RightBox>
				<h4>{{item.product_name}} <span Origin>{{item.product_origin}}</span><span></span></h4>
				<p>
					<span>{{item.product_price | number_format}}</span>
					<span v-if="item.product_price != '時価'">円</span> / <span>{{item.product_lot}}</span>
				</p>
				<div button-box>
					<button @click="click_count_down10(index)" minus10>-10</button>
					<button @click="click_count_down1(index)" minus1>-1</button>
					<button cartBtn @click="cart_in(index)" v-bind:class="{ 'incart' : item.product_cart }">
						<i basket></i>
						<span>{{item.product_num}}</span>
					</button>
					<button @click="click_count_up1(index)" plus1>+1</button>
					<button @click="click_count_up10(index)" plus10>+10</button>
				</div>
			</div>
		</div>
	</template>

</div>
</main>



<?php include $path->inc . 'app.footer.php';?>

</div>

<script>
window.onload = async function() {

		var Offens = [
<?php foreach($lemon as $key=>$val):
		$filename = $path->tpl."/images/vegetable/{$val->product_ID}.jpg";

		$in_file = $path->images. "/vegetable/{$val->product_ID}.jpg";
		$no_file = $path->images."/no-photo.jpg";
?>
{product_num: 0, product_ID : '<?php echo $val->product_ID;?>', product_name : '<?php echo $val->product_name;?>', product_lot : '<?php echo $val->product_lot;?>', product_price : '<?php echo ($val->now_price ==0)?'時価':$val->now_price;?>',product_image : '<?php echo (file_exists($filename))? $in_file:$no_file;?>',product_origin : '<?php echo $val->product_origin;?>',product_cart : false,filter:false},
<?php endforeach;?>
		]

	// admin-ajax.phpの設定
    var ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';

    // LINEデータ変数定義
	var displayName,userId,pictureUrl,glCartNum;

	Vue.prototype.$displayName = ''
	Vue.prototype.$userId = ''
	Vue.prototype.$pictureUrl = ''

	Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';

	Vue.filter('number_format', function (value) {
	  if (!value.match(/^\d+$/)) {
	    return value;
	  }
	  let formatter = new Intl.NumberFormat('ja-JP');
	  return formatter.format(value);
	});


	//////////////////////////////////////////////////////////////////
	const app = new Vue({

		/*
		***********************************************************************************************/
		el: '#app',

		/*
		***********************************************************************************************/		
		data: {
			searchWord: '',
			PageName : '商品リスト',
			cartNum : 0,
			login : false,
			userName : '',
			icon:'',
			product_ID : '',
			product_num: 0,
			product_name : '',
			product_lot : '',
			product_price : '',
			product_image : '',
			product_origin : '',
			product_cart : false,
			OffenList : Offens,
			printProductList : '商品一覧',
			printCart : 'カート',
			printHistory : '履歴',
			printConfig : '設定'
		},

		/*
		***********************************************************************************************/
		methods: { 

			////////////// カウントアップ・ダウン
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

			////////////// カート処理
			cart_in: async function (index) {

				if( this.OffenList[index].product_num > 0 && this.OffenList[index].product_cart === false) {

					console.log('カート処理を開始します');

					//////////[ データ取得処理 ]///////////////////////
					var data = new FormData();

					data.append( 'action',     'tempCart')
					data.append( 'userId',     Vue.prototype.$userId )
					data.append( 'product_id', this.OffenList[index].product_ID )
					data.append( 'quantity',   this.OffenList[index].product_num )
					data.append( 'index',      index )

					await axios.post(Vue.prototype.$ajaxurl, data)
			        	.then(function(responce){

			        		if(responce.data !== null){

			        			console.log('tempCartを実行しました');
			        			console.dir(responce.data)
			        			console.dir(responce.data.count)

			        			app.cartNum = responce.data.count
			        			glCartNum   = responce.data.count
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
			//////////////////
			inputClear : function(){
				console.dir(app.searchWord.value)
				//this.searchWord.value = ''
			}


		},

		/*
		***********************************************************************************************/
	  	created: async function() {

	    	//////////////////////// SET LIFF ID ////////////////////////				    		
			await liff.init({ liffId : '<?php echo $liff->liff_id; ?>' })
				.then(()=>{
					liff.getProfile()
					.then(function(profile){

						displayName = profile.displayName
						userId = profile.userId
						pictureUrl = profile.pictureUrl

						Vue.prototype.$displayName = profile.displayName
						Vue.prototype.$userId = profile.userId
						Vue.prototype.$pictureUrl = profile.pictureUrl

						app.userName = displayName
				
						//////////[ データ取得処理 ]///////////////////////
						var data = new FormData();

						data.append('action', 'update_user');
						data.append('userId', userId );
						data.append('displayName',displayName );
						data.append('pictureUrl', pictureUrl );

			            document.getElementById('displayName').value = profile.displayName;
			            document.getElementById('userId').value = profile.userId;
			            document.getElementById('pictureUrl').value = profile.pictureUrl;

			            // ユーザー情報を取得
						axios.post(ajaxurl, data)
					        .then(function(responce){
					        	console.log('axios : update_user success')

					        	// 現在のカートの中身を取得
					        	if(responce.data !== null){

				        			var chkCart = new FormData();
				        			chkCart.append('action', 'chk_cart');
				        			chkCart.append('userId', responce.data.userId );					        			

										axios.post(Vue.prototype.$ajaxurl, chkCart)
								        	.then(function(result){

								        		console.dir('カート内 : ' + result.data)

								        		app.cartNum = result.data
								        		glCartNum   = responce.data.count


								        	})//axios.post(Vue.prototype.$ajaxurl, chkCart)

					        	}//if(responce.data !== null)

					        })//axios.post(ajaxurl, data)

				        	.catch(function(responce){

				        		console.log('axios : chk_cart error')
				          		console.log(responce);

				        	}).


				        	Promise.all().then(function(message) {
								   // 結果を表示する処理
							})
				    		/////////////////////////////////

					})// getProfile().then

			        .catch(function(responce){

			        	//ログインさせる（テスト中のみ）
			        	if (!liff.isLoggedIn()) {
				        	liff.login();
    					}

			        })

			})//liff.init().then
			.catch(function(e){
				//console.dir(e)
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
    		searchWord: function (value) {

				this.OffenList.forEach( function( element , index , key ){

					if( ~element.product_name.indexOf(value) || ~element.product_origin.indexOf(value)){

						app.OffenList[index].filter = false

					}
					else{

						app.OffenList[index].filter = true

					}
					
				});

    		}
  		
  		}



	})//app
	//////////////////////////////////////////////////////////////////

};
</script>