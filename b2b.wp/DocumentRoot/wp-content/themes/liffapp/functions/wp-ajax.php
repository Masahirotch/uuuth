<?php





/**
 * 第2DBの設定
 */
function hiyoshi_DB() {

    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    global $hiyoshi_DB;

}
add_action('init', 'hiyoshi_DB');


/*
　テスト出力用コード
******************************************************************************/
function dbTest(){

    global $wpdb;

    //$hiyoshi_db = new wpdb( DB_USER, DB_PASSWORD, 'hiyoshi', DB_HOST );
    //$hiyoshi_db->show_errors();

$user_shop = $wpdb->get_row(" SELECT * from master_shopuser");

    echo json_encode( $user_shop );

    die();

}
add_action( 'wp_ajax_dbTest', 'dbTest' );
add_action( 'wp_ajax_nopriv_dbTest', 'dbTest' );









/*
userId ( LINE ID ) からショップコードを返す
********************************************************************************/
function idToShopcode($userId){

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $user_shop = $hiyoshi_db->get_row(" SELECT * from master_shopuser WHERE userId = '{$userId}' ");

    return $user_shop;

}









/*
LINE ID から店舗コードを返す
********************************************************************************/
function userIdToShopId(){

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $userId = $_POST['userId'];

    $user_shop = $hiyoshi_db->get_row(" SELECT * from master_shopuser WHERE userId = '{$userId}' ");




    // 子番号の場合
    if($user_shop->parent != 0){

        $parent_shop = $hiyoshi_db->get_row(" SELECT * from master_shopuser WHERE uid = '{$user_shop->parent}' ");

        echo json_encode( $parent_shop->shop_code );

    }
    // 親番号の場合
    else{

        echo json_encode( $user_shop->shop_code );

    }

    die();


}
add_action( 'wp_ajax_userIdToShopId', 'userIdToShopId' );
add_action( 'wp_ajax_nopriv_userIdToShopId', 'userIdToShopId' );



/*
shop_code から商品一覧を取得
********************************************************************************/
function shopProducts(){

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    global $path;
    // shopコードから、優先度設定を読み込み
    $shop_code = 'z_' . $_POST['shop_code'];
    $lists = $hiyoshi_db->get_results(" SELECT * from {$shop_code} ORDER BY priority ASC");

    // 優先度設定リストから商品リストを作成
    $shop_products = new stdClass();

    foreach($lists as $val){
        $product_id = $val->product_id;

        $shop_products->$product_id = $hiyoshi_db->get_row(" SELECT * FROM current_product Where product_ID = '{$product_id}' ");

        for($i =0;$i <= 9;$i++){
            $target = 'tag0' . $i;
            $shop_products->$product_id->keyword .= '-' . $shop_products->$product_id->$target;
        }

    }


    foreach( $shop_products as $key=>$val ){

        $filename = $path->tpl."/images/vegetable/{$val->product_ID}.jpg";
        $in_file  = $path->images. "/vegetable/{$val->product_ID}.jpg";
        $no_file  = $path->images."/no-photo.jpg";
        $price    = ($val->now_price ==0)?'時価':$val->now_price;
        $image    = (file_exists($filename))? $in_file:$no_file;

        $origin = ( $val->product_origin == '' || $val->product_origin == null )? '.':$val->product_origin;

        $productObj = new stdClass();

        $productObj->popup          = false;
        $productObj->product_num    = 0; 
        $productObj->product_ID     = $val->product_ID; 
        $productObj->product_name   = $val->product_name; 
        $productObj->product_lot    = $val->product_lot; 
        $productObj->product_price  = $price;
        $productObj->product_image  = $image;
        $productObj->product_origin = $origin;
        $productObj->product_cart   = false;
        $productObj->filter         = false;
        $productObj->KeyWord        = $val->keyword;
        $productObj->showModal      = false;

        $res[] = $productObj;

    }

    echo json_encode( $res );

    die();

}
add_action( 'wp_ajax_shopProducts', 'shopProducts' );
add_action( 'wp_ajax_nopriv_shopProducts', 'shopProducts' );




/*
shop_code から商品一覧を取得 (stg用)
********************************************************************************/
function shopProductsSTG(){

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    global $path;
    // shopコードから、優先度設定を読み込み
    $shop_code = $_POST['shop_code'];
    $shop_code_table = 'z_' . $shop_code;
    $lists = $hiyoshi_db->get_results(" SELECT * from {$shop_code_table} ORDER BY priority DESC ");

    // 優先度設定リストから商品リストを作成
    $shop_products = new stdClass();

    foreach($lists as $val){
        $product_id = $val->product_id;
        
        $shop_products->$product_id = $hiyoshi_db->get_row("SELECT * FROM current_product Where product_ID = '{$product_id}' ");

        for($i =0;$i <= 9;$i++){
            $target = 'tag0' . $i;
            $shop_products->$product_id->keyword .= '-' . $shop_products->$product_id->$target;
        }

    }

//$query = <<< EOF

$shop_price_list = $hiyoshi_db->query("

    SELECT
        {$shop_code_table}.shop_code AS shop_code,
        {$shop_code_table}.product_id AS product_id,
        master_price.now_price AS master_price,
        master_shop_relationships.group_code AS group_code,
        master_group.product_ID AS product_group,
        master_group.new_price AS group_price,
        master_group_alias1.product_ID AS product_shop,
        master_group_alias1.new_price AS shop_price 
    FROM
    (
        (
            (
                ( 
                    {$shop_code_table} 
                    LEFT JOIN hiyoshi.master_price ON ( 
                        ( 
                            {$shop_code_table}.product_id = hiyoshi.master_price.product_ID 
                        ) 
                    ) 
                )

                LEFT JOIN hiyoshi.master_shop_relationships ON ( 
                    ( 
                        {$shop_code_table}.shop_code = hiyoshi.master_shop_relationships.shop_code 
                    ) 
                ) 
            
            )
            
            LEFT JOIN hiyoshi.master_group ON ( 
            
                ( 
                    ( hiyoshi.master_shop_relationships.group_code = hiyoshi.master_group.group ) AND 
                    ( hiyoshi.master_price.product_ID = hiyoshi.master_group.product_ID ) 
                ) 
        ) 
    )
    
    LEFT JOIN hiyoshi.master_group hiyoshi.master_group_alias1 ON (
        ( 
            ( hiyoshi.master_shop_relationships.shop_code = hiyoshi.master_group_alias1.group ) AND 
            ( hiyoshi.master_price.product_ID = hiyoshi.master_group_alias1.product_ID ) 
            
        ) 
    ) 
)
");

//EOF;

    //$shop_price_list = $wpdb->query( $query );




/*
    foreach($shop_products as $key=>$val){

        $filename = $path->tpl."/images/vegetable/{$val->product_ID}.jpg";
        $in_file  = $path->images. "/vegetable/{$val->product_ID}.jpg";
        $no_file  = $path->images."/no-photo.jpg";
        $price    = ($val->now_price ==0)?'時価':$val->now_price;
        $image    = (file_exists($filename))? $in_file:$no_file;

        $origin = ( $val->product_origin == '' || $val->product_origin == null )? '.':$val->product_origin;

        $productObj = new stdClass();

        $productObj->popup          = false;
        $productObj->product_num    = 0; 
        $productObj->product_ID     = $val->product_ID; 
        $productObj->product_name   = $val->product_name; 
        $productObj->product_lot    = $val->product_lot; 
        $productObj->product_price  = $price;
        $productObj->product_image  = $image;
        $productObj->product_origin = $origin;
        $productObj->product_cart   = false;
        $productObj->filter         = false;
        $productObj->KeyWord        = $val->keyword;
        $productObj->showModal      = false;

        $res[] = $productObj;

    }
*/
    echo json_encode( $res );

    die();

}
add_action( 'wp_ajax_shopProductsSTG', 'shopProductsSTG' );
add_action( 'wp_ajax_nopriv_shopProductsSTG', 'shopProductsSTG' );










/*
商品の並び替え
********************************************************************************/
function productSorting(){

    global $wpdb;

    $sortlist = json_decode( stripslashes( $_POST["sortlist"] ) , false );

    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $table_name = 'z_' . $_POST['shop_code'];

    foreach($sortlist as $key => $val){

        $hiyoshi_db->replace(
            $table_name,
            array( 
                'product_id' => $val->product_ID,
                'priority'   => $key,
                'shop_code'  => $_POST['shop_code']
            ),
            array( 
                '%s', 
                '%d',
                '%s' 
            ) 

        );

    }

    echo 'success';

    die();


}
add_action( 'wp_ajax_productSorting', 'productSorting' );
add_action( 'wp_ajax_nopriv_productSorting', 'productSorting' );




/*
発注商品リストから指定の商品を削除 ■ HIYOSHI DB 移管完了
******************************************************************************/
function delListProduct(){
    
    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $product_id = $_POST['product_id'];
    $shop_table = 'z_' . $_POST['shop_code'];


    $res = $hiyoshi_db->delete( $shop_table , array( 'product_id' => $product_id ) );

    echo json_encode( $hiyoshi_db->last_error , true );
    die();


}
add_action( 'wp_ajax_delListProduct', 'delListProduct' );
add_action( 'wp_ajax_nopriv_delListProduct', 'delListProduct' );


/* ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ */

/*
userId(LINE ID) から、マイリストを取得
********************************************/
function getMyList(){
    
    global $wpdb;
    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $userId = $_POST["userId"];

    $orderlists = new stdClass();
    $myList = new stdClass();

    $orderlists = $hiyoshi_db->get_results("
        SELECT * FROM user_product_list
        WHERE userId = '{$userId}' 
        order by create_date DESC
    ");

    foreach($orderlists as $key => $val){

        $products        = unserialize( $val->products );
        $id = $key;

        $myList->$id->id              = $val->id;
        $myList->$id->userId          = $val->userId;
        $myList->$id->create_date     = date( 'Y-m-d' , strtotime( $val->create_date)  );
        $myList->$id->processed_flg   = $val->processed_flg;
        $myList->$id->product_count   = $val->product_count;      
        $myList->$id->products        = $products;
        $myList->$id->list_name       = $val->list_name;
        $myList->$id->memo            = nl2br($val->memo);

    }

    echo json_encode( $myList );

    die();

}
add_action( 'wp_ajax_getMyList', 'getMyList' );
add_action( 'wp_ajax_nopriv_getMyList', 'getMyList' );





/* ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ */


/*
　購入履歴取得
******************************************************************************/
function getUserHistory(){

    global $wpdb;
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $userId = $_POST["userId"];

    $orderlists = new stdClass();
    $order = new stdClass();

    $orderlists = $hiyoshi_db->get_results("
        SELECT
        *
        FROM
        cart
        WHERE
        userId = '{$userId}' 
        order by delivery_date DESC , create_date DESC
    ");

    foreach($orderlists as $key => $val){

        $products        = unserialize( $val->products );
        $products_price  = unserialize( $val->products_price );
        $products_lot    = unserialize( $val->products_lot );
        $user_name       = $hiyoshi_db->get_row("SELECT * FROM master_user WHERE userId = '{$val->userId}' ");

        $id = $key;

        $order->$id->id              = $val->id;
        $order->$id->userId          = $val->userId;
        $order->$id->displayName     = $user_name->displayName;
        $order->$id->create_date     = date( 'Y-m-d' , strtotime( $val->create_date)  );
        $order->$id->product_count   = $val->product_count;      
        $order->$id->products        = $products;
        $order->$id->products_price  = $products_price;
        $order->$id->products_lot    = $products_lot;
        $order->$id->delivery_date   = date( 'Y-m-d' , strtotime( $val->delivery_date)  );
        $order->$id->memo            = $val->memo;
        $order->$id->cartTtl         = $val->cartTtl;
        $order->$id->currentPrice    = $val->currentPrice;

    }

    echo json_encode( $order );
    die();


}
add_action( 'wp_ajax_getUserHistory', 'getUserHistory' );
add_action( 'wp_ajax_nopriv_getUserHistory', 'getUserHistory' );


/* ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ */




/*
カート内商品を発注へ
******************************************************************************/
function completeOrder(){

    global $wpdb;
    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $order_products     = new stdClass();
    $tmp_products       = array();
    $tmp_products_price = array();
    $tmp_products_lot   = array();
    $OrderList          = json_decode( stripslashes($_POST["OrderList"]) , false );



    $userId = $_POST['userId'];

    foreach($OrderList as $val){

        $tmp_products       = $tmp_products + array( "{$val->product_ID}" => "{$val->product_num}" );
        $tmp_products_price = $tmp_products_price + array( "{$val->product_ID}" => "{$val->product_price}" );
        $tmp_products_lot   = $tmp_products_lot + array( "{$val->product_ID}" => "{$val->product_lot}" );

        $hiyoshi_db->delete( 
        'temp_cart',
            array(
                'userId'       => $userId,
                'product_id'   => "{$val->product_ID}",
            ),
            array(
                '%s','%s'
            )
        );

    }

    
    $products_lot    = serialize( $tmp_products_lot );   
    $products_price  = serialize( $tmp_products_price );
    $products        = serialize( $tmp_products );
    $product_count   =  count( $tmp_products );
    $create_date     = date( "Y-m-d H:i:s" );
    $close_date      = null;
    $processed_flg   = 1;
    $delivery        = $_POST["Delivery"];
    $memo            = $_POST["Memo"];
    $cartTtl         = $_POST["cartTtl"];
    $currentPrice    = ( $_POST["currentPrice"] == 'true' )? 1: 0;
    $shop  = idToShopcode($userId);
    $shop_code = $shop->shop_code;

    $hiyoshi_db->replace( 
        'cart', 
        array( 
                'userId'         => $userId,
                'create_date'    => $create_date,
                'processed_flg'  => $processed_flg,
                'products'       => $products,
                'products_price' => $products_price,
                'products_lot'   => $products_lot,
                'product_count'  => $product_count,
                'delivery_date'  => $delivery,
                'memo'           => $memo,
                'cartTtl'        => $cartTtl,
                'currentPrice'   => $currentPrice,
                'shop_code'      => $shop_code,
        )
    );

    die();

}
add_action( 'wp_ajax_completeOrder', 'completeOrder' );
add_action( 'wp_ajax_nopriv_completeOrder', 'completeOrder' );










/*
カート画面からマイリスト追加
******************************************************************************/
function save_user_product_list(){

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );



    $order_products     = new stdClass();
    $tmp_products       = array();
    $tmp_products_price = array();
    $tmp_products_lot   = array();
    $OrderList          = json_decode( stripslashes($_POST["OrderList"]) , false );

    $userId = $_POST['userId'];

    foreach($OrderList as $val){

        $tmp_products   = $tmp_products + array( "{$val->product_ID}" => "{$val->product_num}" );

    }

    $products        = serialize( $tmp_products );
    $product_count   = count( $tmp_products );
    $create_date     = date( "Y-m-d H:i:s" );
    $processed_flg   = 1;
    $list_name       = $_POST["listname"];
    $memo            = $_POST["memo"];

    $user_list_id    = ($_POST["listID"] != '' && $_POST["listID"] != null )?  $_POST["listID"]:'';

    $hiyoshi_db->replace( 
        'user_product_list', 
        array( 
                'id'             => $user_list_id,
                'userId'         => $userId,
                'create_date'    => $create_date,
                'processed_flg'  => $processed_flg,
                'products'       => $products,
                'product_count'  => $product_count,
                'list_name'      => $list_name,
                'memo'           => $memo,
        )
    );


    //echo $hiyoshi_db->insert_id;
    echo json_encode( $hiyoshi_db->last_query , true );

    die();

}
add_action( 'wp_ajax_save_user_product_list', 'save_user_product_list' );
add_action( 'wp_ajax_nopriv_save_user_product_list', 'save_user_product_list' );



/*
ユーザー情報のアップデート または新規
******************************************************************************/
function update_user(){

	global $wpdb;

    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

	// ユーザー情報の登録 or アップデート
    $hiyoshi_db->replace( 
    'master_user',
        array(
            'userId'          => $_POST["userId"],
            'displayName'     => $_POST["displayName"],
            'pictureUrl'      => $_POST["pictureUrl"]
        )
    );

    $res = array('userId'=>$_POST["userId"]);
    echo json_encode( $res , true );

    die();

}
add_action( 'wp_ajax_update_user', 'update_user' );
add_action( 'wp_ajax_nopriv_update_user', 'update_user' );



/*
カート内の数量カウント
******************************************************************************/
function chk_cart(){
    
    global $wpdb;

    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $userId = $_POST['userId'];

    $c =  $hiyoshi_db->get_results("SELECT product_id FROM temp_cart WHERE userId = '{$userId}' ");
    $count = count($c);

    echo $count;

    die();


}
add_action( 'wp_ajax_chk_cart', 'chk_cart' );
add_action( 'wp_ajax_nopriv_chk_cart', 'chk_cart' );



/*
カート内から指定の商品を削除
******************************************************************************/
function delProductToCart(){
    
    global $wpdb;

    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    $userId     = $_POST['userId'];
    $product_id = $_POST['product'];
    $index = $_POST['index'];

    $res = $hiyoshi_db->delete( 
    'temp_cart',
        array( 
            'userId'       => $userId,
            'product_id'   => $product_id,
        ),
        array(
            '%s','%s'
        )
    );

    $c =  $hiyoshi_db->get_results("SELECT product_id FROM temp_cart WHERE userId = '{$userId}' ");
    $count = count($c);

    $res = array( 'index' => $index , 'count' => $count );

    echo json_encode( $res , true );

    die();


}
add_action( 'wp_ajax_delProductToCart', 'delProductToCart' );
add_action( 'wp_ajax_nopriv_delProductToCart', 'delProductToCart' );



/*
商品をカートに追加する
******************************************************************************/
function tempCart(){

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    // データセット
    $datetime   = date("Y/m/d H:i:s");
    $userId     = $_POST["userId"];
    $index      = $_POST["index"];
    $product_id = $_POST["product_id"];
    $quantity   = $_POST["quantity"];
    $shop  = idToShopcode($userId);
    $shop_code = $shop->shop_code;


    // product_id確認
    $chk = $hiyoshi_db->get_row("SELECT id,product_id,quantity FROM temp_cart WHERE product_id = {$product_id} ");

    //レコードが存在する場合
    if($chk){

        $quantity += $chk->quantity;
        $id = $chk->id;

        $hiyoshi_db->replace( 
        'temp_cart',
            array( 
                'id'           => $id,
                'userId'       => $userId,
                'datetime'     => $datetime,
                'product_id'   => $product_id,
                'quantity'     => $quantity,
                'shop_code'    => $shop_code
            )
        );

    }
    else{

        $hiyoshi_db->replace( 
        'temp_cart',
            array( 
                'userId'       => $userId,
                'datetime'     => $datetime,
                'product_id'   => $product_id,
                'quantity'     => $quantity,
                'shop_code'    => $shop_code
            )
        );

    }

   

    $c =  $hiyoshi_db->get_results("SELECT product_id FROM temp_cart WHERE userId = '{$userId}' ");
    $count = count($c);

    $res = array( 'index' => $index , 'count' => $count );

    echo json_encode( $res , false );

    die();

}
add_action( 'wp_ajax_tempCart', 'tempCart' );
add_action( 'wp_ajax_nopriv_tempCart', 'tempCart' );



/*
カートページの初回アクセス(カート内の商品リストを取得)
******************************************************************************/
function initCart(){

    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


    global $path;
    $userId = $_POST['userId'];

    $lists = $hiyoshi_db->get_results(" SELECT * from temp_cart WHERE userId = '{$userId}' ORDER BY datetime ASC ");
    $lemon = new stdClass();
    foreach($lists as $val){
        $product_id = $val->product_id;
        $lemon->$product_id = $hiyoshi_db->get_row("SELECT * FROM current_product Where product_ID = '{$product_id}' ");
        $lemon->$product_id->num = $hiyoshi_db->get_row("SELECT quantity FROM temp_cart Where product_id = '{$product_id}' ");
    }

    $resData = new stdClass();


        $cart_total = 0; $current_price_flg = 0;


        $count = 0;
        foreach($lemon as $key=>$val){


            $filename = $path->tpl."/images/vegetable/{$val->product_ID}.jpg";
            $in_file = $path->images. "/vegetable/{$val->product_ID}.jpg";
            $no_file = $path->images."/no-photo.jpg";
            $cart_total += ($val->now_price ==0)? 0: ($val->now_price)*($val->num->quantity);
            $current_price_flg += ($val->now_price ==0)? 1:0;
            $now_price =($val->now_price ==0)? '時価':$val->now_price;
            $file = (file_exists($filename))? $in_file:$no_file;
            $product_total = ($val->now_price ==0)?'時価': ($val->now_price)*($val->num->quantity);


                    $resData->$count->product_num    = $val->num->quantity;
                    $resData->$count->product_ID     = $val->product_ID;
                    $resData->$count->product_name   = $val->product_name; 
                    $resData->$count->product_lot    = $val->product_lot;
                    $resData->$count->product_price  = $now_price;
                    $resData->$count->product_image  = $file;
                    $resData->$count->product_origin = $val->product_origin;
                    $resData->$count->product_total  = $product_total;
                    $resData->$count->product_cart   = false;
                    $resData->$count->userId         = $userId;
                    $resData->$count->showModal      = false;
        $count++;
        }

        echo json_encode($resData);

    die();


}
add_action( 'wp_ajax_initCart', 'initCart' );
add_action( 'wp_ajax_nopriv_initCart', 'initCart' );




/*
カートを過去のデータで置き換え（過去の発注データを再送）
******************************************************************************/
function historyCart(){

    global $wpdb;

    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $userId   = $_POST['userId'];
    $products = json_decode( stripslashes( $_POST['products'] ) );

    $res = $hiyoshi_db->delete( 'temp_cart', array( 'userId' => $userId ) );

    $datetime   = date("Y/m/d H:i:s");
    
    foreach($products as $key => $val){

        $hiyoshi_db->replace( 
            'temp_cart',
            array( 
                'userId'       => $userId,
                'datetime'     => $datetime,
                'product_id'   => $key,
                'quantity'     => $val
            )
        );     

    }

    echo json_encode($products);

    die();

}
add_action( 'wp_ajax_historyCart', 'historyCart' );
add_action( 'wp_ajax_nopriv_historyCart', 'historyCart' );











/*****************************************************************************
 管理画面 


******************************************************************************/



/*
　
******************************************************************************/
function DownloadCSV(){
    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    header("Content-Type: application/octet-stream");
    header("Content-Disposition: attachment; filename=GRAYCODE.csv");
    header("Content-Transfer-Encoding: binary");

    $user_code = $_POST['user_code'];
    $delivery_date = $_POST['delivery_date'];
    $products = json_decode( stripslashes( $_POST['products'] ) , false );


    // 変数の初期化
    $member = new stdClass();
    $csv = null;

    foreach($products as $key => $val ){
        $member->$key->user_code  = $user_code;
        $member->$key->delivery_date = $delivery_date;
        $member->$key->product    = $key;
        $member->$key->num        = $val;
    }

    // 出力データ生成
    foreach( $member as $val ) {
        $csv .= "{$val->user_code}" . ",{$val->delivery_date}" . ",{$val->product}" . ",{$val->num}" . "\n";
    }

    // CSVファイル出力
    echo $csv;


    die();

}
add_action( 'wp_ajax_DownloadCSV', 'DownloadCSV' );
add_action( 'wp_ajax_nopriv_DownloadCSV', 'DownloadCSV' );




/*
オーダー情報の取得
***************************************/
function GetOrders(){

    // エラー出力されるようにする
    ini_set( 'display_errors', 1 );

    $orderlists = new stdClass();
    //$order = new stdClass();



    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

    $orderlists = $hiyoshi_db->get_results("
        SELECT * FROM hiyoshi.cart
        WHERE cart.delivery_date like '{$_POST['date']}-%'
        order by cart.delivery_date DESC
        LIMIT 0,180
    ");


    $order = [];

    foreach($orderlists as $val){

        $products  = unserialize( $val->products );
        $user_name = $hiyoshi_db->get_row("SELECT * FROM master_user WHERE userId = '{$val->userId}' ");
        $id = $val->id;

        $order[$id]['id']              = $val->id;
        $order[$id]['userId']          = $val->userId;
        $order[$id]['displayName']     = $user_name->displayName;
        $order[$id]['date']            = date( 'Y-m-d' , strtotime( $val->create_date)  );
        $order[$id]['product_count']   = $val->product_count;      
        $order[$id]['products']        = $products;
        $order[$id]['delivery_date']   = date( 'Y-m-d' , strtotime( $val->delivery_date)  );
        $order[$id]['memo']            = $val->memo;
        $order[$id]['shop_code']       = $val->shop_code;


/*
        $order->$id->id              = $val->id;
        $order->$id->userId          = $val->userId;
        $order->$id->displayName     = $user_name->displayName;
        $order->$id->date            = date( 'Y-m-d' , strtotime( $val->create_date)  );
        $order->$id->product_count   = $val->product_count;      
        $order->$id->products        = $products;
        $order->$id->delivery_date   = date( 'Y-m-d' , strtotime( $val->delivery_date)  );
        $order->$id->memo            = $val->memo;
        $order->$id->shop_code       = $val->shop_code;
*/


    }


    echo json_encode( $order , false );
    die();
    
}
add_action( 'wp_ajax_GetOrders', 'GetOrders' );
add_action( 'wp_ajax_nopriv_GetOrders', 'GetOrders' );



/*
　
******************************************************************************/
function id2Order(){

    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

        $LoadCart = new stdClass;
        $LoadCart = $hiyoshi_db->get_row("SELECT * FROM hiyoshi.cart Where id = '{$_POST["id"]}' ");

        $product_array = unserialize($LoadCart->products);

        foreach($product_array as $key=>$val){
            $products[$key] = $val;
        }

        echo json_encode( $products , true );

        die();

}
add_action( 'wp_ajax_id2Order', 'id2Order' );
add_action( 'wp_ajax_nopriv_id2Order', 'id2Order' );







/*********************************************************************************/
/*********************************************************************************/
/*********************************************************************************/
function chkOrderOuentai(){

    global $wpdb;
    $db_user = $wpdb->dbuser; //データベース接続ユーザーの取得
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

        $date = $_POST["date"];

        $res = $hiyoshi_db->get_results("select * from ouentai_herb_orderlist WHERE orderDate LIKE '{$date}%'  ");

        echo json_encode( $res , true );

        die();

}
add_action( 'wp_ajax_chkOrderOuentai', 'chkOrderOuentai' );
add_action( 'wp_ajax_nopriv_chkOrderOuentai', 'chkOrderOuentai' );









