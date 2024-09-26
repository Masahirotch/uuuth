<?php
    header("Content-Type: application/octet-stream");
    header("Content-Disposition: attachment; filename={$_POST['user_code']}-{$_POST['order_date']}.csv");
    header("Content-Transfer-Encoding: binary");

    $user_code = $_POST['user_code'];
    $order_date = $_POST['order_date'];
    $products = json_decode( stripslashes( $_POST['products'] ) , false );


    // 変数の初期化
    $member = new stdClass();
    $csv = null;

    foreach($products as $key => $val ){
        $member->$key->user_code  = $user_code;
        $member->$key->order_date = $order_date;
        $member->$key->product    = $key;
        $member->$key->num        = $val;

    }


    // 出力データ生成
    foreach( $member as $val ) {
        $csv .= "'{$val->user_code}'" . ",'{$val->order_date}'" . ",'{$val->product}'" . ",'{$val->num}'" . "\n";
    }

    // CSVファイル出力
    echo $csv;


    die();

?>