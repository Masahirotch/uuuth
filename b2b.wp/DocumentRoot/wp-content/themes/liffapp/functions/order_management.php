<?php


//管理画面に優先度メニューを追加
function order_management() {
    add_menu_page( 
    	'発注管理', 
    	'発注管理', 
    	'edit_themes', __FILE__, 
    	'order_management_page', 
    	'', 
    	3
    );
}
add_action('admin_menu', 'order_management');


function order_management_page(){

	global $path;
	$load_file = $path->admin . 'order-management-page.php';
	require $load_file;


}


