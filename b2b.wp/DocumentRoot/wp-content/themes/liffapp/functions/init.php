<?php
/*#########################################################

基本設定

#########################################################*/





////////////// 初期設定 ////////////////////////////////////////////////////////////

/**
 * パスのセット
 */
function get_path() {

	date_default_timezone_set('Asia/Tokyo');

	$path = new stdClass;

	global $path;
	$path->header      = TEMPLATEPATH.'/inc/header.php';
	$path->global_navi = TEMPLATEPATH.'/inc/global-navi.php';
	$path->tpl         = TEMPLATEPATH;
	$path->inc         = TEMPLATEPATH.'/inc/';
	$path->admin       = TEMPLATEPATH.'/admin/';


	$path->theme       = get_theme_file_uri();
	$path->css         = get_theme_file_uri() . '/css';
	$path->js          = get_theme_file_uri() . '/js';
	$path->images      = get_theme_file_uri() . '/images';

	return $path;
}
add_action('init', 'get_path');



/* Vue.js 出力関係 */
function AdminCss() {

	global $path;

print <<< EOF
	<link rel='stylesheet' href='{$path->css}/admin.css' type="text/css" media='all' />\n
EOF;

return;

}

function LoadLiff(){
print <<< EOF
<!-- / LIFF SDK -->
<script charset="utf-8" src="https://static.line-scdn.net/liff/edge/versions/2.1.13/sdk.js"></script>\n
EOF;

return;

}

function HelperCss(){

	global $path;

print <<< EOF

<!-- Helper.css -->
<link rel='stylesheet' href='{$path->css}/helper.css' type="text/css" media='all' />\n
EOF;

return;

}

function VueJS() {

	global $path;

print <<< EOF
	<script type='text/javascript' src='{$path->js}/vue.min.js'/></script>\n
EOF;

return;

}

function VuexJS() {

	global $path;

print <<< EOF
	<script type='text/javascript' src='{$path->js}/vuex.js'/></script>\n
EOF;

return;

}

function AxiosJS() {

	global $path;

print <<< EOF
	<script type='text/javascript' src='{$path->js}/axios.min.js'/></script>\n
EOF;

return;

}

function VueVuexAxios(){
	global $path;
print <<< EOF

<!-- / VueVuexAxios() -->
<script type='text/javascript' src='{$path->js}/vue.min.js'/></script>
<script type='text/javascript' src='{$path->js}/vuex.js'/></script>
<script type='text/javascript' src='{$path->js}/axios.min.js'/></script>\n
EOF;

return;

}


function VueSet(){
	global $path;
print <<< EOF
<!--/ VueSet-->
<script type='text/javascript' src='{$path->js}/vue.min.js'/></script>
<script type='text/javascript' src='{$path->js}/vuex.js'/></script>
<script type='text/javascript' src='{$path->js}/axios.min.js'/></script>\n
EOF;

return;

}

function VueSelect() {

	global $path;

print <<< EOF
<!--/ VueSelect -->
<script type='text/javascript' src='{$path->js}/vue-select.js'/></script>
<link rel='stylesheet' href='{$path->js}/vue-select.css'>\n
EOF;

return;

}


function VueLoading() {

	global $path;

print <<< EOF
<!--/ VueLoading -->
<script src="{$path->js}/vue-loading-overlay@3.js"></script>
<link href="{$path->js}/vue-loading.css" rel="stylesheet">\n
EOF;

return;

}

function moment() {

	global $path;

print <<< EOF
<!--/ moment.js -->
<script src="{$path->js}/moment-ja.js"></script>\n
EOF;

return;

}









// WordPressのバージョンを非表示
remove_action('wp_head','wp_generator');

// 絵文字削除
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('admin_print_scripts', 'print_emoji_detection_script');
remove_action('wp_print_styles', 'print_emoji_styles' );
remove_action('admin_print_styles', 'print_emoji_styles');

// フィードのlink要素を自動出力する
add_theme_support( 'automatic-feed-links' );

// 投稿ページにてアイキャッチ画像の欄を表示
add_theme_support( 'post-thumbnails' );

// WordPressコアから出力されるHTMLタグをHTML5のフォーマットにする
add_theme_support( 'html5', array(
	'search-form',
	'comment-form',
	'comment-list',
	'gallery',
	'caption',
) );

// 投稿フォーマットのサポート
add_theme_support( 'post-formats', array(
	'aside',	//アサイド
	'gallery',	//ギャラリー
	'image',	//画像
	'link',		//リンク
	'quote',	//引用
	'status',	//ステータス
	'video',	//動画
	'audio',	//音声
	'chat',		//チャット
) );




/**
 * WPの自動更新をしない
 */
//define('AUTOMATIC_UPDATER_DISABLED', true);


/**
 * ヘッダーにWPのバージョンを表示させない
 */
//remove_action('wp_head', 'wp_generator');



/**
 * adminbarを表示させない
 *
 * @memo adminbarを表示させるとスタイルが崩れることがある
 */
//add_filter( 'show_admin_bar' , 'lig_wp_hide_admin_bar');
function lig_wp_hide_admin_bar() {
  return false;
}



/**
 * 後方一致リダイレクトを切る
 *
 * @memo WPは404だった場合、URLが後方一致で一致するページにリダイレクトする
 */
//add_filter('redirect_canonical', 'lig_wp_remove_redirect_guess_404_permalink', 10, 2);
function lig_wp_remove_redirect_guess_404_permalink( $redirect_url, $requested_url ) {
  if ( is_404() ) {
    return false;
  }

  return $redirect_url;
}


//デフォルトの管理画面カラーを変更
add_filter( 'get_user_option_admin_color', 'set_default_admin_color' );
function set_default_admin_color( $result ) {
  return 'coffee';
}



/**
 * 固定ページもカテゴリ連動できるようにする
 */

add_action('init','add_categories_for_pages'); 
function add_categories_for_pages(){ 

   register_taxonomy_for_object_type('category', 'page'); 

} 

add_action( 'pre_get_posts', 'nobita_merge_page_categories_at_category_archive' ); 
function nobita_merge_page_categories_at_category_archive( $query ) { 

	if ( $query->is_category== true && $query->is_main_query() ) { 

		$query->set('post_type', array( 'post', 'page', 'nav_menu_item')); 

	} 
}




/********************************************
 管理画面にCSSやスクリプトを追加読み込み 
********************************************/
function load_custom_wp_admin_style() {
        wp_register_style( 
        	'custom-admin', 
        	get_stylesheet_directory_uri() . '/css/admin-tab.css', 
        	false, 
        	'1.0.1' );
        wp_enqueue_style( 'custom-admin' );
}
add_action( 'admin_enqueue_scripts', 'load_custom_wp_admin_style' );













