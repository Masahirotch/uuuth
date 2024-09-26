<?php


/********************************************************************************
* SEOタグの呼び出し
*********************************************************************************/

function add_multilang_fields() {

    $args = [
        'public' => true,
        '_builtin' => true
    ];

    $screens = array('page','blog','post');

    foreach ( $screens as $screen ) {

        add_meta_box(
            'seo_edit',     //id (ボックスのhtml divタグのidになる)
            'SEOタグ設定(TITLEタグ、META DESCRIPTIONタグ)',             //title (ボックスのタイトル)
            'load_seo_edit_box', //callback (フォーム読み込み関数名)
            $screen,
            'advanced',            //$context (左側の幅広に加えるのか(normal / advanced)、サイドに加えるのか(side)を指定。)
            'high'                 //$priority ('low'or'high'を指定して上の方に来るか下の方に来るかを指定)
        );

    }

}
add_action('add_meta_boxes', 'add_multilang_fields');


function load_seo_edit_box($post){

    // チェックデジットを追加して後でチェックする
    wp_nonce_field( 'myplugin_save_meta_box_data', 'myplugin_meta_box_nonce' );

    //フォームパーツの読み込み
    $load_file = get_parent_theme_file_path( '/admin/admin-seo.php' );
    require $load_file;

}


/********************************************************************************
* 固定ページはビジュアルエディタ禁止
*********************************************************************************/
function disable_visual_editor_in_page() {
    global $typenow;
    if( $typenow == 'page' ){
        add_filter('user_can_richedit', 'disable_visual_editor_filter');
    }
}

function disable_visual_editor_filter(){
    return false;
}
add_action('load-post.php', 'disable_visual_editor_in_page');
add_action('load-post-new.php', 'disable_visual_editor_in_page');














?>