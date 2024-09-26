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
	//header("Content-Transfer-Encoding: binary");

	$member = array();
	$csv = null;


    $date = $_GET["date"];
    $res = $hiyoshi_db->get_results("select * from ouentai_herb_orderlist WHERE orderDate LIKE '{$date}%'  ");


	// 1行目のラベルを作成
	$csv = '"order_id","事業所名","住所","電話","担当者","請求書送付先","注文日時","ハーブ注文数","リーフ注文数"' . "\n";

	// 出力データ生成
	foreach( $res as $value ) {
		// 文字コード変換。エクセルで開けるようにする
		//mb_convert_variables('SJIS', 'UTF-8', $value );
		//$value = str_replace("\n", chr(10), $value);
		$address = $value->pref_jp . $value->city_jp . $value->address;
		$add = str_replace(array("\r", "\n"), '', $address );

		$csv .= '"' . 
		$value->order_id  . '","' . 
		$value->bizName   . '","' . 
		$add . '","tel : ' . 
		$value->tel       . '","' . 
		$value->manager   . '","' . 
		$value->invoice   . '","' . 
		$value->orderDate . '","' . 
		$value->p_1_num . '","' . 
		$value->p_2_num . '","' . 
		'"' . "\n";


	}


	
	// CSVファイル出力
	echo mb_convert_encoding($csv,"SJIS", "UTF-8");
	return;



}
else{

	echo 'Bad request.';

}
?>