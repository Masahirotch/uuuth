<?php
// 複数のオリジンを正規表現で確認する場合
// XHRなどではOriginヘッダがブラウザからリクエストで付けられる

$request_origin = $_SERVER['HTTP_ORIGIN'];
$allow_regex = '/^https?:\/\/(ouentai.line\.cx|hiyoshi\.liff\.cloud|hiyoshi\.info\.line\.cx)$/i';
if(preg_match($allow_regex, $request_origin, $m)){
    header('Access-Control-Allow-Origin: '. $m[0]);
}

//$allow_origin = true;
//header('Access-Control-Allow-Origin: '. $allow_origin);
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Max-Age: 3600');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

header("Content-type: text/html; charset=utf8mb4");




/** Loads the WordPress Environment and Template */
require __DIR__ . '/../wp-load.php';

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi_db = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );


/*******************************************************************************************

*******************************************************************************************/
if( isset( $_POST['token'] ) && $_POST['token'] == API_TOKEN ){

	// エラー出力されるようにする
	ini_set( 'display_errors', 1 );

    switch ($_POST['api_action']) {

    	/*
	     ユーザー情報の設定
	    ***********************************************************************************/
	    case 'checkUser':

		$userId = $_POST["userId"];

	    $res = $hiyoshi_db->get_row("select * from ouentai_user where userId = '{$userId}' ");

	    // 登録がない場合は新規登録
	    if($res == null){

		    $regist = $hiyoshi_db->insert(
				'ouentai_user', 
				array( 
					'userId' => $userId, 
					'regist' => 0 
				)
			);

		    $res = $hiyoshi_db->get_row("select * from ouentai_user where userId = '{$userId}' ");

	    }

	    	echo json_encode( $res ,false );

	        break;



    	/*
	     初期登録
	    ***********************************************************************************/
	    case 'setAgree':

	    	$userId = $_POST["userId"];

		    $regist = $hiyoshi_db->update(
				'ouentai_user', 
				array( 
					'agree' => 1 
				),
				array( 'userId' => $userId )
			);

		    $res = $hiyoshi_db->get_row("select * from ouentai_user where userId = '{$userId}' ");

	    	echo json_encode( $res ,false );

	        break;



    	/*
	     事業者登録
	    ***********************************************************************************/
	    case 'updateBizUser':

	    	$userId = $_POST["userId"];

		    $hiyoshi_db->update(
				'ouentai_user', 
				array( 
					'regist'  => 1,
					'bizName' => $_POST['bizName'],
					'pref'    => $_POST['pref'],
					'city'    => $_POST['city'],
					'address' => $_POST['address'],
					'tel'     => $_POST['tel'],
					'manager' => $_POST['manager'],
					'invoice' => $_POST['invoice'],
					'pref_jp' => $_POST['pref_jp'],
					'city_jp' => $_POST['city_jp'],
				),
				array( 'userId' => $userId )
			);

		    $res = $hiyoshi_db->get_row("select * from ouentai_user where userId = '{$userId}' ");

	    	echo json_encode( $res ,false );

	        break;




    	/*
	     情報取得
	    ***********************************************************************************/
	    case 'getBuyer':

	    	$userId = $_POST["userId"];

		    $res = $hiyoshi_db->get_row("select * from ouentai_user where userId = '{$userId}' ");

	    	echo json_encode( $res ,false );

	        break;



    	/*
	     商品情報取得
	    ***********************************************************************************/
	    case 'getProduct':

	    	$productId = $_POST["productId"];

		    $res = $hiyoshi_db->get_row("select * from ouentai_products where productId = '{$productId}' ");

	    	echo json_encode( $res ,false );

	        break;



    	/*
	     全ての商品情報取得
	    ***********************************************************************************/
	    case 'getAllProducts':

		    $res = $hiyoshi_db->get_results("select * from ouentai_products WHERE isOnSale = 1 ORDER BY productId DESC,maxNum ASC");

	    	echo json_encode( $res ,false );

	        break;


    	/*
	     オーダー
	    ***********************************************************************************/
	    case 'sendOrder':

	    	$userId = $_POST["userId"];
	    	$order_1 = $_POST['order_1'];
	    	$order_2 = $_POST['order_2'];

	    	$wpdb->flush();


		    $res = $hiyoshi_db->insert( 'ouentai_herb',
				array( 
					'userId' => $userId,
					'orderDate' => current_time('mysql', false),
					'p_1_num' => $_POST['order_1'],
					'p_2_num' => $_POST['order_2'],
				)

			);

	    	echo json_encode( $res ,false );

	        break;


    	/*
	     新ページオーダー
	    ***********************************************************************************/
	    case 'sendCart':

		    $orderNum = $_POST['orderNum'];
		    $userId = $_POST['userId'];

		    // orderArrayを作成
		    $cart = json_decode( stripslashes( $_POST['cart'] ) , true );

		    foreach( $cart as $key => $val ){
		    	
		    	$objKey = 'product_'.$val['productId'];
		    	if( $val['quantity'] != 0 ){

			    	$orderArray[$objKey]['productId'] = $val['productId'];
			    	$orderArray[$objKey]['productName'] = $val['productName'];
			    	$orderArray[$objKey]['productPrice'] = $val['productPrice'];
			    	$orderArray[$objKey]['quantity'] = $val['quantity'];

			    	// 数量限定商品の処理 //////////////////////////////////////////
			    	if( $val['isMax'] == '1' ){

					    $hiyoshi_db->update(
							'ouentai_products', 
							array( 
								'maxNum' => $val['maxNum']
							),
							array( 'productId' => $val['productId'] )
						);

			    	}
			    	// 数量限定商品の処理 //////////////////////////////////////////
		    	}

		    }


		    $res = $hiyoshi_db->insert( 

		    	'ouentai_order',
				array( 
					'userId'     => $userId,
					'orderArray' => serialize($orderArray),
					'orderNum'   => $orderNum,
					'orderDate'  => current_time('mysql', false),
				)

			);

	    	echo json_encode( $res ,false );

	        break;





	}// SWITCH


}
/*******************************************************************************************

*******************************************************************************************/
elseif( isset( $_POST['token'] ) && $_POST['token'] == INFO_TOKEN ){

    global $wpdb;

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $info_db = new wpdb( $db_user, $db_passwd, 'hiyoshi_info', $db_host );


	// エラー出力されるようにする
	ini_set( 'display_errors', 1 );

    switch ($_POST['action']) {

    	/*
	     全ユーザー情報の取得
	    ***********************************************************************************/
	    case 'getParentUsers':

				$temp_data = $info_db->get_results("select * from users");

				foreach( $temp_data as $val ){

					$temp = new stdClass();

					foreach( $val as $key => $value ){

						if( $key == 'flg_active' || $key == 'flg_1' || $key == 'flg_2' || $key == 'flg_3' || $key == 'flg_4' ){

							$temp->$key = ( $value == 1 )? true:false;

						}
						else{

							$temp->$key = $value;

						}

					}

					$res[] = $temp;

				}

			    echo json_encode( $res , false );

	        break;




    	/*
	     ユーザー情報の設定
	    ***********************************************************************************/
	    case 'checkUser':

				$userId = $_POST["userId"];
				$displayName = $_POST["displayName"];

			    $res = $info_db->get_row("select * from users where userId = '{$userId}' ");

			    // 登録がない場合は新規登録
			    if($res == null){

				    $regist = $info_db->insert(
						'users', 
						array( 
							'userId' => $userId,
							'regist' => 0,
							'displayName' => $displayName
						)
					);

				    $res = $info_db->get_row("select * from users where userId = '{$userId}' ");

			    }
			    else{

			    	$res = $info_db->get_row("select * from users where userId = '{$userId}' ");

			    }

			    echo json_encode( $res , false );

	        break;


    	/*
	     ユーザー情報のアップデート
	    ***********************************************************************************/
	    case 'updateUser':

				$userId = $_POST["userId"];
				$displayName = $_POST["displayName"];

				$datas = json_decode(stripslashes($_POST['valid']));


				$bizName = $datas->bizName->data;
				$tel     = $datas->tel->data;
				$manager = $datas->manager->data;
				$mobile  = $datas->mobile->data;



			    $info_db->update(
					'users', 
					array( 
						'regist'   => 1,
						'bizName'  => $bizName,
						'shop_tel' => $tel,
						'manager'  => $manager,
						'user_tel' => $mobile,
						'displayName' => $displayName					
					),
					array( 'userId' => $userId )
				);

				$res = $info_db->get_row("select * from users where userId = '{$userId}' ");

			    echo json_encode( $res , false );

	        break;


    	/*
	     ユーザーパラメータのアップデート
	    ***********************************************************************************/
	    case 'paramUpdate':

	    		$flg = $_POST['flg'];
	    		$value = ( $_POST['value'] == 'true' )? 1:0;
	    		$userId = $_POST['userId'];

			    $res = $info_db->update(
					'users', 
					array( 
						$flg => $value,				
					),
					array( 'userId' => $userId )
				);

			echo json_encode( $res , false );

	        break;






















	}// SWITCH

}
/*******************************************************************************************

*******************************************************************************************/
else{ 
	echo '500 : Token is an invalid value.'; 
}
?>