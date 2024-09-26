<?php
header("Content-type: application/x-javascript");

require_once( '../wp-load.php' );
global $wpdb;

?>

window.onload = async function() {

	Vue.prototype.$ajaxurl     = '<?php echo admin_url( 'admin-ajax.php'); ?>'

	var app = new Vue({

		el: '#app',

		/*
		***********************************************************************************************/	
		data: {
			// PageLoader
            isLoading : true,
            fullPage  : true,

            // 同意（初回のみにしたい）
            displayName : '',
            userId      : '',
            pictureUrl  : '',
            agreement   : false,

            shopCode    : '',

            inputShopCode : '',
            isAlready      : false,
            isNotUse       : false,
            completeAddUser: false,
            defaultContent : true,
		},

		/*
		***********************************************************************************************/	
	  	mounted: async function() {

	    	//////////////////////// SET LIFF ID ////////////////////////				    		
			await liff.init({ liffId : '<?php echo ID_LINK_LIFF_ID; ?>' })
				.then(function(){

					//////////[ ユーザープロファイル取得処理 ]///////////////////////
					liff.getProfile()
						.then(function(profile){

							this.displayName = profile.displayName
							this.userId = profile.userId
							this.pictureUrl = profile.pictureUrl

							this.isLoading = false

					}.bind(this))// getProfile()

			        .catch(function(responce){

			        	if (!liff.isLoggedIn()) { liff.login(); }

			        })

				}.bind(this))//liff.init()
				.catch(function(e){

		        	if (!liff.isLoggedIn()) { liff.login(); }

				})

		},



		/*
		***********************************************************************************************/	
		methods: {

			// キャンセル
			cancel : function(){

				liff.closeWindow();

			},

			/* 登録開始 */
			entry : function(){

				this.shopCode = '<?php echo $_GET['shop_code'];?>'
				if (this.shopCode == ''){ return }
				this.chkCode()

			},

			/* 番号の有無を調べる */
			chkCode : function(){

				var addShopUser = new FormData();

				addShopUser.append('action', 'addShopUser');				
				addShopUser.append('shopCode', this.shopCode );
				addShopUser.append('userId', this.userId );

				axios.post( Vue.prototype.$ajaxurl, addShopUser )
					.then( function(result){

						this.defaultContent = false
						this.completeAddUser = true

						var res = result.data

						if( res == 'parent' ){}

						if( res == 'child' ){}

						if( res == 'already' ){ this.isAlready = true }


					}.bind(this))
					.catch(function(responce){

					})

				// データベースから番号の有無を確認
				// DBにない場合はfalse,ある場合はtrue

				return false

			},



		},


	})//app

}		
