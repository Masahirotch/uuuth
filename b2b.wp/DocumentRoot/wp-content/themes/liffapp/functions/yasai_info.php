<?php

//管理画面に優先度メニューを追加
function yasai_info() {
    add_menu_page( 
        'info', 
        '日吉の野菜情報', 
        'edit_themes', __FILE__, 
        'yasai', 
        '', 
        30
    );
}
add_action('admin_menu', 'yasai_info');

// ページの読み込み
function yasai(){

    global $path;
    $load_file = $path->admin . 'yasai_info.php';
    require $load_file;

}

