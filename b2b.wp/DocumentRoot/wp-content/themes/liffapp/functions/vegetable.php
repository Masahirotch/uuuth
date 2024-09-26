<?php

function create_vegetable() {

    $labels = array(
        'name' => __( '野菜' ),
        'singular_name' => __( 'vegetable' )
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'menu_position'       => 7,
        'menu_icon'           => 'dashicons-carrot',
        'capability_type'     => 'post',
        'hierarchical'        => true,
        'has_archive'         => true,
        'exclude_from_search' => true,
        'supports'            => array(
            'title',//タイトル
            //'thumbnail',//アイキャッチ画像
            //'editor' ビジュアルエディタ
            //'author' 作成者
            //'excerpt',//抜粋
            //'trackbacks' トラックバック送信
            //,'custom-fields'//カスタムフィールド
            //'comments' コメントの他、編集画面にコメント数のバルーンを表示する
            //'revisions' リビジョンを保存する
            //'page-attributes' メニューの順序 (投稿タイプの hierarchical が true であること)
            //'post-formats' 投稿のフォーマットを追加

        ),
        'rewrite' => array(
            'slug' => 'vegetable',
            'with_front' => false
        )
    );
    register_post_type('vegetable', $args);

}
add_action( 'init', 'create_vegetable' );



/********************************************************************************
* storeのフォームページを読み込み
*********************************************************************************/
function add_vegetable_fields() {

    $args = [
        'public' => true,
        '_builtin' => true
    ];

    $screens = array('vegetable');

    foreach ( $screens as $screen ) {

        add_meta_box(
            'vegetable_edit',     //id (ボックスのhtml divタグのidになる)
            '商品編集',             //title (ボックスのタイトル)
            'load_vegetable_edit_box', //callback (フォーム読み込み関数名)
            $screen,
            'advanced',            //$context (左側の幅広に加えるのか(normal / advanced)、サイドに加えるのか(side)を指定。)
            'high'                 //$priority ('low'or'high'を指定して上の方に来るか下の方に来るかを指定)
        );

    }

}
add_action('add_meta_boxes', 'add_vegetable_fields');



/* add_product_fieldsで呼び出すファイル
-------------------------------------------------------------*/
function load_vegetable_edit_box($post){

    // チェックデジットを追加して後でチェックする
    wp_nonce_field( 'myplugin_save_meta_box_data', 'myplugin_meta_box_nonce' );

    //フォームパーツの読み込み
    $load_file = get_parent_theme_file_path( '/admin/admin-product-base.php' );
    require $load_file;

}














