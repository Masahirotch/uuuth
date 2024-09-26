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

LoadLiff();
VueSet();
$liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$pid} ");
?>
<div id="liff">{{PageName}}</div>
<script>
window.onload = async function() {

///////////////////////
Vue.prototype.$ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>'
Vue.prototype.$displayName = ''
Vue.prototype.$userId = ''
Vue.prototype.$pictureUrl = ''

var liffApp = new Vue({

    /**[ 初期値設定 ]***************************************/
	el: '#liff',
	
	data: { PageName : '<?php echo $seo->title->jp;?>' },

  	created: function() {

  		console.dir('liff.init')

		liff.init({ liffId : '<?php echo $liff->liff_id; ?>' }).then(()=>{

			liff.getProfile().then(function(profile){

				Vue.prototype.$displayName = profile.displayName
				Vue.prototype.$userId = profile.userId
				Vue.prototype.$pictureUrl = profile.pictureUrl					

				var update_user = new FormData();

				update_user.append('action', 'update_user');
				update_user.append('userId', Vue.prototype.$userId );
				update_user.append('displayName', Vue.prototype.$displayName );
				update_user.append('pictureUrl', Vue.prototype.$pictureUrl );

				console.dir(Vue.prototype)

				axios.post( Vue.prototype.$ajaxurl , data).then(function(responce){

					

		        	// 現在のカートの中身を取得
		        	if(responce.data !== null){

	        			var chkCart = new FormData();
	        			chkCart.append('action', 'chk_cart');
	        			chkCart.append('userId', responce.data.userId );					        			

							axios.post(Vue.prototype.$ajaxurl, chkCart)
					        	.then(function(result){

					        		console.dir('カート内 : ' + result.data)

					        		Vue.prototype.cartNum = result.data
					        		Vue.prototype.CartNum   = responce.data.count


					        	})//axios.post(Vue.prototype.$ajaxurl, chkCart)

		        	}//if(responce.data !== null)


		        })//axios.post(ajaxurl, data)
		        .catch(function(responce){

		        	console.dir('//axios.post(ajaxurl, data)')

		        })

			})// getProfile().then

        	.catch(function(responce){

	        	//ログインさせる（テスト中のみ）
	        	if (!liff.isLoggedIn()) {
		        	liff.login();
				}

        	})




		})//liff.init().then
		.catch(function(e){
	        	//ログインさせる（テスト中のみ）
	        	if (!liff.isLoggedIn()) {
		        	liff.login();
				}
			
				//console.dir(e)
				// ログインしていない時はリダイレクト
				//window.location = 'https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1654397924';
		})

  	}//created: function()
})//app


}
</script>
