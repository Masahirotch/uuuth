<?php
/*
Plugin Name: LINE FUNCTIONS CORE PLUGIN
Plugin URI: https://adop.co.jp
Description: LINE FUNCTIONS 用　コアプラグインです。
Version: 0.9
Author: T.YOSHIZAWA ( Adop Inc. )
Author URI: https://adop.co.jp/
License: GPL2
*/

/*
LINE FUNCTIONS CORE PLUGIN is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.
 
LINE FUNCTIONS CORE PLUGIN is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
 
You should have received a copy of the GNU General Public License
along with LINE FUNCTIONS CORE PLUGIN. If not, see https://adop.co.jp/.
*/



class LineConfig {

    /*
    * 初期化
    *************************************************************/
    function __construct() {


        // データベースの作成
        register_activation_hook( __FILE__ , array( $this, 'create_config_db') );

    	// 管理画面の表示
    	add_action( 'admin_menu', array( $this, 'add_pages') );
    
    }

    /*
    * プラグインを有効化した時にデータベース作成を実行
    *************************************************************/
	function create_config_db() {

	    global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $table_config  = 'line_functions_config';
        $table_sendlog = 'line_functions_sendlog';


	    // set DB Ver.
	    $new_db_version = '0.7';
	    
	    // wp_optionsから　db_version を取得
	    $cmt_db_version = get_option( 'line_functions_db_ver' );

	    // wp_optionsから
	    if( $cmt_db_version != $new_db_version ) {

            $config_sql = "CREATE TABLE $table_config (
              id int(11) NOT NULL AUTO_INCREMENT,
              config_name varchar(64) NOT NULL,
              config_value varchar(255) DEFAULT NULL,
              PRIMARY KEY  (config_name),
              UNIQUE KEY id (id , config_name)
            ) $charset_collate;";

            $sendlog_sql = "CREATE TABLE $table_sendlog (
              id int(11) NOT NULL AUTO_INCREMENT,
              send_date datetime DEFAULT NULL,
              send_msg text DEFAULT NULL,
              send_user_array text DEFAULT NULL,
              send_status int(11) DEFAULT NULL,
              read_users text DEFAULT NULL,
              UNIQUE KEY id (id)
            ) $charset_collate;";

	        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

            // config tbl
	        dbDelta($config_sql);

            // send log tbl
            dbDelta($sendlog_sql);


	        //オプションにDBバージョン保存
	        update_option('line_functions_db_ver' , $new_db_version);

            $config_name = array('liffID','accessToken','channelSecret','webhook','msg_accessToken','msg_channelSecret');

            foreach($config_name as $val){

                $wpdb->insert( $table_config , array( 'config_name' => $val ) );

            }

	    }

	}

    /*
    * 管理画面設定
    *************************************************************/
    function add_pages() {

    	// 管理画面（初期画面）に表示する内容
    	// add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position );
    	add_menu_page( 
    		'LINE FUNCTIONS CORE PLUGIN' , 
    		'LINE CORE' , 
    		'level_8', 
    		__FILE__ , 
    		array( $this ,'load_admin_page' ), 
    		'dashicons-testimonial', 
    		26
    	);

    }

    /*
    * 管理画面読み込み
    *************************************************************/
    function load_admin_page() {

	    // 管理画面の読み込み
		$load_file = __DIR__ . '/admin.php';
	    require $load_file;
    
    }

}

$lineApp = new LineConfig;


/*****************************************************
****************************************************

プラグイン機能用

****************************************************
******************************************************/

/*
* 店舗データ、ユーザーデータの取得
*************************************************************/
function LoadShops() {

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $shop_codes = $hiyoshi_db->get_results(" SELECT DISTINCT shop_code from master_shop ");

    $shops = new stdClass();

    foreach($shop_codes as $val){

        $code = $val->shop_code;

        $shops->$code = $hiyoshi_db->get_results("

            SELECT
            master_shop.auto_id AS auto_id,
            master_shop.shop_code AS shop_code,
            master_shop.shop_name AS shop_name,
            master_shop.group_code AS group_code,
            master_shopuser.uid AS uid,
            master_shopuser.userId AS userId,
            master_shopuser.parent AS parent,
            master_user.displayName AS displayName,
            master_user.pictureUrl AS pictureUrl,
            master_shop.del_flg AS del_flg,
            master_shopuser.flg_obo AS flg_obo,
            master_shopuser.auth_code AS auth_code
            FROM
            master_shopuser
            RIGHT JOIN master_shop
            ON master_shopuser.shop_code = master_shop.shop_code 
            LEFT JOIN master_user
            ON master_user.userId = master_shopuser.userId

            WHERE master_shop.shop_code = '{$code}'

            ORDER BY
            auto_id ASC

        ");

    }



    $data = new stdClass();

    foreach($shops as $key => $val){

        foreach( $val as $keys => $value ){

            if($value->parent == 0){
                $data->$key['shop_name']  = $value->shop_name;
                $data->$key['shop_code']  = $value->shop_code;
                $data->$key['group_code'] = $value->group_code;
                $data->$key['auto_id']    = $value->auto_id;
                $data->$key['openUserBox'] = false;
                $data->$key['isDeleteShop'] = false;
            }

            $value->showDelModal  = false;
            $value->showSendModal = false;
            $value->showEditModal = false;
            $value->del_flg       = false;

            $data->$key['user'][] = ($value)? $value:null;

        }

    }

    echo json_encode( $data ,false);

    die();

}
add_action( 'wp_ajax_LoadShops', 'LoadShops' );
add_action( 'wp_ajax_nopriv_LoadShops', 'LoadShops' );




/*
* LIFF ID 登録 ( LINE FUNCTIONS CORE PLUGIN )
*************************************************************/
function SetLiff() {

    global $wpdb;

    $liffID = $_POST["liffID"];
    $accessToken = $_POST["accessToken"];
    $channelSecret = $_POST["channelSecret"];

    $table_config  = 'line_functions_config';
    $config_name = array('liffID','accessToken','channelSecret','webhook','msg_accessToken','msg_channelSecret');

    foreach($config_name as $val){

        $wpdb->replace( 
            $table_config , 
            array( 
                'config_name' => $val ,
                'config_value' => $_POST[$val],
            ) 
        );

    }


        echo $_POST["liffID"];


    die();

}
add_action( 'wp_ajax_SetLiff', 'SetLiff' );
add_action( 'wp_ajax_nopriv_SetLiff', 'SetLiff' );






/*
* 顧客情報編集
*************************************************************/
function editShop() {

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $hiyoshi_db->replace( 
        'master_shop' , 
        array(
            'auto_id'    => $_POST['auto_id'],
            'shop_code'  => $_POST['shop_code'],
            'shop_name'  => $_POST['shop_name'],
            'group_code' => $_POST['group_code'],
            'del_flg'    => 0,
        )
    );

    $res = $hiyoshi_db->get_row("select * from master_shop WHERE shop_code = {$_POST['shop_code']} ");

    echo json_encode( $res ,false);


    die();

}
add_action( 'wp_ajax_editShop', 'editShop' );
add_action( 'wp_ajax_nopriv_editShop', 'editShop' );




/*
* 新規店舗追加
*************************************************************/
function addShop() {

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $chk = $hiyoshi_db->get_row("select * from master_shop WHERE shop_code = {$_POST['shop_code']} ");

    if( !$chk ){

        $hiyoshi_db->replace( 
            'master_shop' , 
            array(
                'auto_id'    => null,
                'shop_code'  => $_POST['shop_code'],
                'shop_name'  => $_POST['shop_name'],
                'group_code' => $_POST['group_code'],
                'del_flg'    => 0,
            )
        );

        echo 'add';

    }
    else{

        echo 'already';

    }

    die();

}
add_action( 'wp_ajax_addShop', 'addShop' );
add_action( 'wp_ajax_nopriv_addShop', 'addShop' );










/*
* ID 連携を解除する（master_shopuserから該当のユーザーを削除する）
*************************************************************/
function releaseID() {

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $hiyoshi_db->delete( 'master_shopuser', array( 'uid' => $_POST['uid'] , 'userId' => $_POST['userId'] ) );


    echo 'ok';
    //echo json_encode( $res ,false);

    die();

}
add_action( 'wp_ajax_releaseID', 'releaseID' );
add_action( 'wp_ajax_nopriv_releaseID', 'releaseID' );




/*
* ID 連携
*************************************************************/
function addShopUser(){

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser;
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $userId = $_POST['userId'];
    $shop_code = $_POST['shopCode'];

    $user_check = $hiyoshi_db->get_row("select * from master_shopuser WHERE userId = '{$userId}' ");
    $parent_check = $hiyoshi_db->get_results("select * from master_shopuser WHERE shop_code = '{$shop_code}' ");

    // ユーザー登録がない場合
    if(!$user_check){

        // ユーザー登録なしで親番もなしの場合は親番登録
        if(!$parent_check){

            $hiyoshi_db->replace( 
            'master_shopuser',
                array(
                    'uid'        => $uid,
                    'userId'     => $userId,
                    'shop_code'  => $shop_code,
                    'parent'     => 0,
                )

            );

            echo 'parent';

        }
        // 親番がある場合は子番号として登録
        else{

            foreach($parent_check as $val){

                if( $val->parent == 0 ){

                    $parent_id = $val->uid;

                }

            }

            $hiyoshi_db->replace( 
            'master_shopuser',
                array(
                    'uid'        => $uid,
                    'userId'     => $userId,
                    'shop_code'  => $shop_code,
                    'parent'     => $parent_id,
                )

            );

            echo 'child';

        }

    }

    // ユーザー登録がある場合
    else{

        echo 'already';

    }

    die();


}
add_action( 'wp_ajax_addShopUser', 'addShopUser' );
add_action( 'wp_ajax_nopriv_addShopUser', 'addShopUser' );










