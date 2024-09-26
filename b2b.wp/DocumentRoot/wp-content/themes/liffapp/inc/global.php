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
<link rel="stylesheet" href="<?php echo $path->theme;?>/matjar/font-awesome/css/font-awesome.min.css">
<style>
#NaviBar{background:#fff;width:100%;height:60px;padding:0 18px;top:0;right:0;left:0;display:-webkit-flex;display:-ms-flexbox;display:flex;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;-webkit-align-items:center;-ms-flex-align:center;align-items:center;position:fixed;z-index:99;box-shadow:0 2px 2px 0 transparent,0 1px 5px 0 rgba(0,0,0,.07),0 3px 1px -2px transparent}#NaviBar a{color:#4f4f4f;display:-webkit-flex;display:-ms-flexbox;display:flex;padding:5px}#NaviBar .site-brand{display:-webkit-inline-box;display:-ms-inline-flexbox;display:-webkit-inline-flex;display:inline-flex;-ms-flex-flow:column nowrap;flex-flow:column nowrap;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}#NaviBar a h1{display:-webkit-flex;display:-ms-flexbox;display:flex;-ms-flex-flow:column nowrap;flex-flow:column nowrap;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;font-size:22px;font-weight:600;color:#3c3c3c;position:relative;letter-spacing:1px}#NaviBar a h1+span{color:#bababa;font-size:12px}[CartLink]{position:relative}[CartLink] i+span{display:-webkit-flex;display:-ms-flexbox;display:flex;-ms-flex-flow:column nowrap;flex-flow:column nowrap;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;position:absolute;right:-.3em;top:-.3em;padding:.3em;background:#23a273;color:#fff;font-size:.8em;width:1.3em;height:1.3em;border-radius:1em}
</style>
<!-- navbar top -->
<div id="NaviBar" ref="global">

	<a href="#" data-activates="slide-out-left" class="side-nav-left">
		<!--<i class="fa fa-bars"></i>-->
		&nbsp;
	</a>

	<a href="/" class="site-brand">
		<h1>HIYOSHI</h1>
		<span>USER : {{userName}}</span>
	</a>


	<a href="#" CartLink >
		<i class="fa fa-shopping-basket"></i>
		<span v-if="Vue.prototype.$cartNumber > 0">{{Vue.prototype.$cartNumber}}</span>
	</a>

</div>
<input type="hidden" id="userId" value="">
<input type="hidden" id="displayName" value="">
<input type="hidden" id="pictureUrl" value="">
<!-- end navbar top -->
<?php
LoadLiff();
VueSet();
$liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$pid} ");
?>
<script>
window.onload = async function() {

	// admin-ajax.phpの設定
    var ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';

    // LINEデータ変数定義
	var displayName,userId,pictureUrl;

	Vue.prototype.$cartNumber = 0
	Vue.prototype.$displayName = ''
	Vue.prototype.$userId = ''
	Vue.prototype.$pictureUrl = ''

	//////////////////////////////////////////////////////////////////
	const app = new Vue({


	//const app = new Vue({
		name : 'global',
	
	    /**[ 初期値設定 ]***************************************/
		el: '#NaviBar',
		data: {
			cartNum : Vue.prototype.$cartNumber,
			login : false,
			space:'',
			userName : 'anonymous'
		},


		methods: { 

		},

	  	created:function() {

			//init : function(){

	    		//////////////////////// SET LIFF ID ////////////////////////				    		
				liff.init({ liffId : '<?php echo $liff->liff_id; ?>' })

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

								axios.post(ajaxurl, data)
						        	.then(function(responce){

						        		if(responce.data !== null){
						        			Vue.prototype.$cartNumber = 1;
						        		}

						        	})
						        	.catch(function(responce){

						          		console.log(responce);

						        	})
					    		/////////////////////////////////

							})// getProfile().then



					})//liff.init().then
					.catch(function(e){
						console.dir(e)
						//window.location = 'https://lin.ee/';
					})
				
				
				///////////////////////// SET LIFF ID /////////////////////////

				return this.space;

			}



	})//app
	//////////////////////////////////////////////////////////////////

};
</script>