<!doctype html>
<html lang="ja">
<?php

//echo $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';

require_once( $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php' );
global $wpdb;

$incLoader =  $_SERVER['DOCUMENT_ROOT'] . '/idlink/lib/stg.app.loading.php';


?>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1,user-scalable=no">
	<title>LINE LINK ID連携アプリ</title><meta name="description" content="">	

	<link rel='stylesheet' href='/idlink/lib/reset.min.css' type='text/css' media='all' />
	<link rel='stylesheet' href='/idlink/lib/common.css' type='text/css' media='all' />
	<link rel='stylesheet' href='/idlink/lib/style.css?v=<?php echo time();?>' type='text/css' media='all' />
	

	<!-- / LIFF SDK -->
	<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
	<!--Vue-->
	<script type='text/javascript' src='/idlink/lib/vue.2.6.11.min.js'/></script>
	<script type='text/javascript' src='/idlink/lib/axios.min.js'/></script>
<style>
	input{background:#FFF;padding:0.3em;font-size:16px;border-radius:0.3em;}
	.center{
	display: flex;
	flex-flow:row nowrap;	
	justify-content: center;
	align-items: center;

	}
	.padding{
		padding:1em;
	}
</style>
</head>
<body>
	<div id="app" v-cloak>
		<?php require_once( $incLoader );?>

		<div id="terms" >
			<h1 v-if="displayName != ''">ようこそ{{displayName}}さん。</h1>
			<p>今から、あなたのLINE IDと連携を行います。</p>
			<p>連携する店舗コード : <?php echo $_GET['shop_code'];?></p>
			
			<div id="agreebox" v-if="defaultContent">
				<h2>ID連携しますか？</h2>
				<div class="split">
					<button class="none" @click="cancel">いいえ</button>
					<button @click="entry">はい</button>
				</div>
			</div>

			<div id="agreebox" v-if="completeAddUser">
				<h3 class="vail" v-if="isAlready" style="margin-bottom:1em;text-align:justify;line-height:1.4em;">
					あなたのIDはすでに他の店舗コードに登録されています。<br>
					この店舗コードで登録を行う場合は、管理者に連絡し、ID連携の解除を行ってから、再度登録を行なってください。
				</h3>

				<h2 v-if="!isAlready" >ID連携完了</h2>
				<p class="center padding">友だち追加して発注を始める</p>
				<div class="center padding">
					<a href="https://lin.ee/r5odH0A">
						<img src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png" alt="友だち追加" height="36" border="0">
					</a>
				</div>


				<div class="split">
					<button style="margin:0 auto;" class="none" @click="cancel">閉じる</button>
				</div>
			</div>




		</div>

	</div>

	<script type='text/javascript' src='app.js.php?shop_code=<?php echo $_GET['shop_code'];?>'></script>
</body>
</html>