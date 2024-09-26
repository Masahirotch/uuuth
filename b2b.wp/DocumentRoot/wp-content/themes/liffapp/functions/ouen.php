<?php


//管理画面に優先度メニューを追加
function ouen_test() {
    add_menu_page( 
        'ouen', 
        '応援隊 注文', 
        'edit_themes', __FILE__, 
        'ouentai', 
        '', 
        20
    );
}
add_action('admin_menu', 'ouen_test');

// ページの読み込み
function ouentai(){

    global $path;
    $load_file = $path->admin . 'ouentai_order.php';
    require $load_file;

}

