<?php
//クエリ系処理


/*********************************************************************************
* 投稿が保存されたとき、カスタムデータも保存
*********************************************************************************/
function save_custom_data($post_id){


    // チェックデジットがセットされているかどうか確認
    if ( ! isset( $_POST['myplugin_meta_box_nonce'] ) ) { return; }

    // チェックデジットが正しいかどうか検証
    if ( ! wp_verify_nonce( $_POST['myplugin_meta_box_nonce'], 'myplugin_save_meta_box_data' ) ) { return; }

    // ユーザー権限の確認
    if ( isset( $_POST['post_type'] ) && 'page' == $_POST['post_type'] ) {

        if ( ! current_user_can( 'edit_page', $post_id ) ) {
            return;
        }

    } else {

        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }
    }

    // 自動保存の場合はなにもしない
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) { return; }

    // データがセットされているか確認する
    if ( ! isset( $_POST ) ) {
        return;
    }










    /* データのDB保存
    ***********************/
    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );




    /*+++++++++++++++++++++++++++++++++++++++++++++++++*/
    //SEOデータ保存 (全項目共通)
    /*+++++++++++++++++++++++++++++++++++++++++++++++++*/

    $multilang_keys = array('title','metadesc');

    foreach ($multilang_keys as $val){
        $key_jp = $val . '_jp';
        $key_en = $val . '_en';
        $key_cn = $val . '_cn';
        $key_tc = $val . '_tc';
        $key_ko = $val . '_ko';
        $key_th = $val . '_th';

        $db_table = 'seo_' . $val;

        $wpdb->replace( 
            $db_table, 
                array( 
                    'ID'          => $_POST["post_ID"],
                    'jp'          => $_POST[$key_jp],
                    'en'          => $_POST[$key_en],
                    'cn'          => $_POST[$key_cn],
                    'tc'          => $_POST[$key_tc],
                    'ko'          => $_POST[$key_ko],
                    'th'          => $_POST[$key_th],
                )
        );

    };


    $wpdb->replace( 
    'liff_id',
        array( 
            'ID'          => $_POST["post_ID"],
            'liff_id'     => $_POST["liff_id"],
            'page_name'   => $_POST["post_name"]
        )
    );



    if ( $_POST["post_type"] == "vegetable" ){

        $hiyoshi_db->replace( 
            'product_base', 
                array( 
                    'ID'          => $_POST["post_ID"],
                    'product_name'      => $_POST["product_name"],
                    'default_price'      => $_POST["default_price"],
                    'reduced_tax'      => $_POST["reduced_tax"],
                    'product_desc'      => $_POST["product_desc"],
                    'product_spec'      => $_POST["product_spec"]

                )
        );


    }






}//save_custom_data
add_action('save_post', 'save_custom_data');




/********************************************
絶対パスをルートパスに変更する関数
データ保存時に使用
********************************************/
function AbsolutePath2RootPath($path){

	$remove = "https://" . $_SERVER['SERVER_NAME'];
	$result = str_replace($remove, '', $path);
	return $result;

}


function escape($str){
    return str_replace(chr(39), "&prime;", $str);
    //return str_replace(chr(39), "&prime;", $str);
    //preg_replace('/\\\/u', '＼', $name);
}



// 商品情報全部取得
function GetProduct($post_name){

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $table = 'master_price';

    if(preg_match('/-2/',$post_name)){
        $pid = str_replace('-2', '', $post_name);
        $product = $hiyoshi_db->get_row("select * from {$table} WHERE product_ID = {$pid}");
    }

    elseif(preg_match('/-3/',$post_name)){
        $pid = str_replace('-2', '', $post_name);
        $product = $hiyoshi_db->get_row("select * from {$table} WHERE product_ID = {$pid}");
    }
    else{
        $pid = $post_name;
        $product = $hiyoshi_db->get_row("select * from {$table} WHERE product_ID = {$pid}");
    }

    return $product;

}




// 商品情報全部取得
function GetLotList(){

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $Lot_list = new stdClass;

    $lot_list = $hiyoshi_db->get_results("select * from lots");

    return $lot_list;


}

function GetLot(){
    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    return Obj_array_column($hiyoshi_db->get_results("SELECT * FROM lots"),'id' );


}








