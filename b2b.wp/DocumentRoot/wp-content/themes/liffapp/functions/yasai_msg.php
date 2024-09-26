<?php

//管理画面に優先度メニューを追加
function yasai_msg() {
    add_menu_page( 
        'infomsg', 
        '野菜情報配信',
        'edit_themes', __FILE__, 
        'yasaimsg',
        '',
        30
    );
}
add_action('admin_menu', 'yasai_msg');

// ページの読み込み
function yasaimsg(){

    global $path;
    $load_file = $path->admin . 'yasai_msg.php';
    require $load_file;

}


?>