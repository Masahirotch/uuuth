<!--
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

?>
-->
<?php
LoadLiff();
VueSet();
$liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$pid} ");
?>
<?php include $path->inc . 'main-css.php';?>
<div id="app" v-cloak>

	<!-- app.header -->
	<?php include $path->inc . 'app.header.php';?>
	<!-- app.header -->

<main>

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
	var displayName,userId,pictureUrl;
	Vue.prototype.$displayName = ''
	Vue.prototype.$userId = ''
	Vue.prototype.$pictureUrl = ''
	Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';


	const app = new Vue({
		el: '#app',
		data: {
			searchWord: '',
			PageName : '<?php echo $seo->title->jp;?>',
			cartNum : 0,
			login : false,
			userName : '',
			icon:'',
			product_cart : false,
			printProductList : '商品一覧',
			printCart : 'カート',
			printHistory : '履歴',
			printConfig : '設定'
		},
		/*
		***********************************************************************************************/
		methods: { 


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

						// ヘッダーにユーザー名を表示
						app.userName = displayName
				
						//////////[ データ取得処理 ]///////////////////////
						var data = new FormData();

						data.append('action', 'update_user');
						data.append('userId', userId );
						data.append('displayName',displayName );
						data.append('pictureUrl', pictureUrl );

			            // ユーザー情報を取得
						axios.post(ajaxurl, data)
					        .then(function(responce){

					        	// 登録ユーザーの確認ができたら、カートの中を表示
					        	if(responce.data !== null){

				        			var chkCart = new FormData();
				        			chkCart.append('action', 'chk_cart');
				        			chkCart.append('userId', responce.data.userId );					        			

									axios.post(Vue.prototype.$ajaxurl, chkCart)
								        .then(function(result){
								        	// カートに入っている商品数を表示
								        	app.cartNum = result.data

								        })//axios.post(Vue.prototype.$ajaxurl, chkCart)

					        	}//if(responce.data !== null)

					        }.bind(this))//axios.post(ajaxurl, data)

				        	.catch(function(responce){

				        		console.log('axios : chk_cart error')
				          		console.log(responce);

				        	}.bind(this))

					}.bind(this))// getProfile().then

			        .catch(function(responce){

			        	//ログインさせる（テスト中のみ）
			        	if (!liff.isLoggedIn()) { liff.login() }

			        }.bind(this))

			})//liff.init().then
			.catch(function(e){
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