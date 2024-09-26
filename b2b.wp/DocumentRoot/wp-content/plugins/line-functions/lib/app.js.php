<?php
header("Content-type: application/x-javascript; charset=UTF-8");

require_once( $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php' );
global $wpdb;

$facility_code = $_GET['facility_code'];
$area_code = $_GET['area'];
$liff_data = $wpdb->get_row("SELECT * FROM liff_id WHERE facility_code = '{$facility_code}' ");

?>
window.onload = async function() {

	Vue.prototype.$ajaxurl     = '<?php echo admin_url( 'admin-ajax.php'); ?>'
	Vue.prototype.$displayName = ''
	Vue.prototype.$userId      = ''
	Vue.prototype.$pictureUrl  = ''
	Vue.prototype.$areaCode    = '<?php echo $area_code;?>'
	Vue.prototype.$usercode    = {
		ID        : <?php echo $liff_data->ID; ?>,
		page_name : '<?php echo $liff_data->page_name; ?>',
		facility_code : '<?php echo $liff_data->facility_code; ?>',
		liffId : '<?php echo $liff_data->liff_id; ?>'
	}


	Vue.prototype.$enterFlg = false
	Vue.prototype.$enterData = []

	var app = new Vue({

		el: '#app',

		/*
		***********************************************************************************************/	
        components: {



        },

		/*
		***********************************************************************************************/	
		data: {
			// PageLoader
            isLoading : true,
            fullPage  : true,

            // 表示フラグ
            enterFlg : false,

            // 同意（初回のみにしたい）
            agreement : false,

            // 読み込みエリア
            area_code : '<?php echo $area_code;?>',

            // 日時生成
			date: '',
			time: '',
			week: ['( 日 )', '( 月 )', '( 火 )', '( 水 )', '( 木 )',  '( 金 )', '( 土 )'],
			datetimeDate : '',
			datetimeTime : ''

		},

		/*
		***********************************************************************************************/	
	  	mounted: async function() {

	    	//////////////////////// SET LIFF ID ////////////////////////				    		
			await liff.init({ liffId : Vue.prototype.$usercode.liffId })
				.then(function(){

					//////////[ ユーザープロファイル取得処理 ]///////////////////////
					liff.getProfile()
						.then(function(profile){

							Vue.prototype.$displayName = profile.displayName
							Vue.prototype.$userId = profile.userId
							Vue.prototype.$pictureUrl = profile.pictureUrl

							//////////[ ユーザーデータ保存処理 ]///////////////////////
							var data = new FormData();

							data.append('action', 'save_user');
							data.append('userId', Vue.prototype.$userId );
							data.append('displayName', Vue.prototype.$displayName );
							data.append('pictureUrl', Vue.prototype.$pictureUrl );

								axios.post(Vue.prototype.$ajaxurl, data)
						        	.then( function(result){

						        		this.chkEnter()

						        		console.dir('add user : ' + result.data)

						        		if(result.data == true){
						        			this.agreement = true
						        		}
						        		else{
						        			this.agreement = false
						        		}

						        		// 時刻表示
						        		let timerID = setInterval( this.updateTime, 1000 )

									}.bind(this))
									.catch(function(responce){

										console.dir(responce)

										this.isLoading = false 

									})


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

			/////////////////////////////////////////
			// 同意事項に同意する
			doAgree : function(){

				var agree = new FormData();

				agree.append('action', 'userAgree');
				agree.append('userId', Vue.prototype.$userId );
				agree.append('facility_code', Vue.prototype.$usercode.facility_code );

				axios.post(Vue.prototype.$ajaxurl, agree)
		        	.then( function(result){

		        		this.agreement = true

					}.bind(this))
					.catch(function(responce){

					})

			},

			/////////////////////////////////////////
			// 同意しない場合はLIFFを閉じる
			cancel : function(){

				liff.closeWindow();

			},


			/////////////////////////////////////////
			// ユーザーが入場処理を行っているかどうかチェック
			chkEnter : function(){

				var chkEnter = new FormData()

				chkEnter.append('action'       , 'chkEnter')
				chkEnter.append('userId'       , Vue.prototype.$userId )
				chkEnter.append('area_code'    , Vue.prototype.$areaCode )
				chkEnter.append('facility_code', Vue.prototype.$usercode.facility_code )
				chkEnter.append('liff_id'      , Vue.prototype.$usercode.liffId )

				axios.post(Vue.prototype.$ajaxurl, chkEnter)
		        	.then( function(result){

		        		// 取得データがない場合は、新規扱い
						if( result.data.length == 0 ) return		        		

						// 戻り値の配列が１つの場合は、入場後に退場処理をしていない状態とみなす
						if( result.data.length == 1 && result.data[0] !== void 0){

							console.log('戻り値の配列が１つの場合は、入場後に退場処理をしていない状態とみなす')

		        			Vue.prototype.$enterFlg  = true
		        			this.enterFlg = true
		        			Vue.prototype.$enterData = result.data
		        			console.dir(Vue.prototype.$enterData)
						
						}

						// 戻り値が1以上の場合
						if( result.data.length > 1 && result.data[0] !== void 0){

							//奇数の場合 (二度目以降の入場状態)
							if( ( result.data.length % 2 ) != 0 ) {

								console.log('戻り値が1以上の場合、奇数の場合 (二度目以降の入場状態)')

			        			Vue.prototype.$enterFlg  = true
			        			this.enterFlg = true
			        			Vue.prototype.$enterData = result.data
			        			console.dir(Vue.prototype.$enterData)

							}
							//偶数の場合 (二度目以降の退場状態)
							if( ( result.data.length % 2 ) == 0 ) {

								console.log('戻り値が1以上の場合、偶数の場合 (二度目以降の退場状態)')

			        			Vue.prototype.$enterFlg  = false
			        			this.enterFlg = false
			        			Vue.prototype.$enterData = result.data
			        			console.dir(Vue.prototype.$enterData)

							}

						}


					}.bind(this))
					.catch(function(responce){

					})
			},


			/////////////////////////////////////////
			// 入場時処理
			userEnter : function(){


				var inTime = new FormData()

				inTime.append('action', 'userEnter')
				inTime.append('uid', Vue.prototype.$uid )
				inTime.append('userId', Vue.prototype.$userId )
				inTime.append('facility_code', Vue.prototype.$usercode.facility_code)
				inTime.append('area_code', Vue.prototype.$areaCode)
				inTime.append('liff_id', Vue.prototype.$usercode.liffId)
				inTime.append('inTime', this.datetimeDate + ' ' + this.datetimeTime)
				inTime.append('action', 'userEnter')

				// すでに入場中の場合は入場処理を行わない
				if(Vue.prototype.$enterFlg == true) return

				axios.post(Vue.prototype.$ajaxurl, inTime)
		        	.then( function(result){

		        		console.dir(result.data)
		        		Vue.prototype.$uid = result.data
		        		Vue.prototype.$enterFlg = true
		        		this.enterFlg = true

					}.bind(this))
					.catch(function(responce){

					})

			},

			/////////////////////////////////////////
			// 退場時処理
			userExit : function(){



				console.dir('退場処理を実行')

				var outTime = new FormData();

				// すでに入場中の場合は入場処理を行わない
				if(this.enterFlg == false) return

				outTime.append('action', 'userExit')
				outTime.append('uid', Vue.prototype.$uid )
				outTime.append('userId', Vue.prototype.$userId )
				outTime.append('facility_code', Vue.prototype.$usercode.facility_code)
				outTime.append('area_code', Vue.prototype.$areaCode)
				outTime.append('liff_id', Vue.prototype.$usercode.liffId)
				outTime.append('outTime', this.datetimeDate + ' ' + this.datetimeTime)
				outTime.append('action', 'userExit')

				axios.post(Vue.prototype.$ajaxurl, outTime)
		        	.then( function(result){

		        		Vue.prototype.$uid = ''
		        		Vue.prototype.$enterFlg = false
		        		this.enterFlg = false

					}.bind(this))
					.catch(function(responce){

					})


			},

			/////////////////////////////////////////
			updateTime: function() { 

				//現在の日付・時刻を取得 
				let currentdate = new Date()

				// 現在の時刻
				this.time = this.zeroFill(currentdate.getHours(), 2) + ':' + 
							this.zeroFill(currentdate.getMinutes(), 2) 
							//+ ':' + this.zeroFill(currentdate.getSeconds(), 2) // 秒数表示はいらないかも


				// 現在の年月日
				this.date = //this.zeroFill(currentdate.getFullYear(), 4) + '年' + // 年数表示は省略
							currentdate.getMonth() + 1 + '/' + 
							this.zeroFill(currentdate.getDate(), 2) + ' ' +
							this.week[currentdate.getDay()]

				// 保存用の日時
				this.datetimeDate = currentdate.getFullYear() + '-' + 
									this.zeroFill( currentdate.getMonth() + 1 , 2) + '-' + 
									this.zeroFill(currentdate.getDate(), 2)

				this.datetimeTime = this.zeroFill(currentdate.getHours(), 2) + ':' + 
									this.zeroFill(currentdate.getMinutes(), 2) + ':' + 
									this.zeroFill(currentdate.getSeconds(), 2)

				//console.dir(this.datetimeDate + ' ' + this.datetimeTime )

				if( this.date != '' && this.time != '' ){
					this.isLoading = false
				}

			},
			zeroFill: function(num, len) {
			
				let zero = '';

				// 0の文字列を作成
				for(var i = 0; i < len; i++) {
					zero += '0';
				}

				// zeroの文字列と、数字を結合し、後ろ２文字を返す
				return (zero + num).slice(-len);

			},



		},

		/*
		***********************************************************************************************/	
		computed: {


		},

		/*
		***********************************************************************************************/	
	  	created: async function() {


		},

		/*
		***********************************************************************************************/	
		filters:{
			number_format : function (value) {
  				let formatter = new Intl.NumberFormat('ja-JP');
  				return formatter.format(value);
			}

		},


	})//app

}		
