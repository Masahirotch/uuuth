<?php

//管理画面に優先度メニューを追加
function lot_management() {
    add_menu_page( 
        'lot', 
        '最低発注ロット', 
        'edit_themes', __FILE__, 
        'lot_management_page', 
        '', 
        4
    );
}
//add_action('admin_menu', 'lot_management');

// ページの読み込み
function lot_management_page(){

    global $path;
    $load_file = $path->admin . 'lot-management-page.php';
    require $load_file;


}







