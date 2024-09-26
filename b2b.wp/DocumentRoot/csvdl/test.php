<?php

/** Loads the WordPress Environment and Template */
require __DIR__ . '/../wp-load.php';


    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


if($_GET){

	// エラー出力されるようにする
	ini_set( 'display_errors', 1 );

	// 出力情報の設定
	header("Content-Type: application/octet-stream");
	header("Content-Disposition: attachment; filename=ouentai-" . $_GET['date'] . ".csv");
	
	$member = array();
	$csv = null;

    $date = $_GET["date"];
    $res = $hiyoshi_db->get_results("select * from ouentai_orderlist WHERE orderDate LIKE '{$date}%'  ");


	// 1行目のラベルを作成
	$csv = '"order_id","事業所名","住所","電話","担当者","請求書送付先","注文日時","注文商品","注文数"' . "\n";

	

	foreach($res as $val){
		// 住所
		$address = $val->pref_jp . $val->city_jp . $val->address;
		$add = str_replace(array("\r", "\n"), '', $address );

		$order = unserialize($val->orderArray);

		if( count($order) != 0 ){

			foreach( $order as $v ){

				$csv .= '"' . 
				$val->order_id  . '","' . 
				$val->bizName   . '","' . 
				$add . '","tel : ' . 
				$val->tel       . '","' . 
				$val->manager   . '","' . 
				$val->invoice   . '","' . 
				$val->orderDate . '","' . 
				$v['productName'] . '","' . 
				$v["quantity"] . '","' . 
				'"' . "\n";

			}

		}

	}
	
	// CSVファイル出力
	echo mb_convert_encoding($csv,"SJIS", "UTF-8");
	return;



}
else{

	echo 'Bad request.';

}
?>