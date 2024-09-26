<?php


/*#########################################################

汎用関数

#########################################################*/





//////////////////////////////////////////////////////////////////////////


//管理ページの表示メニュー設定
/*
if( current_user_can( 'administrator' ) ){ // 管理者権限
if( current_user_can( 'editor' ) ){ // 編集者権限
if( current_user_can( 'author' ) ){ // 投稿者権限
if( current_user_can( 'contributor' ) ){ // 寄稿者権限
if( current_user_can( 'subscriber' ) ){ // 購読者権限

if( $current_user->user_level < ユーザーレベル ){
ユーザーレベルは以下を参照
https://wpdocs.osdn.jp/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%A8%E6%A8%A9%E9%99%90
admin = 10
編集者 = 7

*/

add_action( 'admin_menu', 'remove_menus' );
function remove_menus(){

    remove_menu_page( 'edit-comments.php' );          //コメントを非表示

    global $current_user;

    if( $current_user->user_level < 6 ){

      remove_menu_page( 'index.php' );                  //ダッシュボードを隠します
      remove_menu_page( 'edit.php' );                   //投稿を非表示
      remove_menu_page( 'edit.php?post_type=page' );    //固定ページを非表示
      remove_menu_page( 'edit-comments.php' );          //コメントを非表示
      remove_menu_page( 'themes.php' );                 //外観メニューを非表示
      remove_menu_page( 'plugins.php' );                //プラグインメニューを非表示
      remove_menu_page( 'tools.php' );                  //ツールメニューを非表示
      remove_menu_page( 'options-general.php' );        //設定メニューを非表示
  }

}


function view_menus () {
    global $menu,$submenu;

    $menu[5] = $menu[19];
    $menu[10] = $menu[21];



/*    
    unset($menu[2]);  // ダッシュボード
    unset($menu[4]);  // メニューの線1
    unset($menu[5]);  // 投稿
    unset($menu[10]); // メディア
    unset($menu[15]); // リンク
    unset($menu[20]); // ページ
    unset($menu[25]); // コメント
    unset($menu[59]); // メニューの線2
    unset($menu[60]); // テーマ
    unset($menu[65]); // プラグイン
    unset($menu[70]); // プロフィール
    unset($menu[75]); // ツール
    unset($menu[80]); // 設定
    unset($menu[90]); // メニューの線3
*/

}
add_action('admin_menu', 'view_menus');









//add_action('admin_menu', 'remove_meta_boxes');
function my_remove_meta_boxes() {

    global $current_user;

        remove_meta_box('pageparentdiv', 'post', 'normal'); // ページ属性

    if( $current_user->user_level < 6 ){

      global $wp_meta_boxes;

        //remove_meta_box('tagsdiv-post_tag', 'post', 'normal'); //タグ
        remove_meta_box('authordiv', 'post', 'normal'); // オーサー
        remove_meta_box('commentstatusdiv', 'post', 'normal'); // ディスカッション
        remove_meta_box('commentsdiv', 'post', 'normal'); // コメント
        remove_meta_box('slugdiv', 'post', 'normal'); // スラッグ
        remove_meta_box('trackbacksdiv', 'post', 'normal'); // トラックバック
        remove_meta_box('postexcerpt', 'post', 'normal'); // 抜粋
        remove_meta_box('postcustom', 'post', 'normal'); // カスタムフィールド

        remove_meta_box('formatdiv', 'post', 'normal'); // フォーマット
    }
}




//ダッシュボードの表示、非表示
remove_all_actions('wp_dashboard_setup');

remove_action( 'welcome_panel', 'wp_welcome_panel' );


add_action('wp_dashboard_setup', 'remove_dashboard_widgets' );
function remove_dashboard_widgets() {

    global $wp_meta_boxes;
    global $current_user;

    if( $current_user->user_level < 6 ){
      unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_right_now']);//現在の状況
      unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_comments']);//最近のコメント
      unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_incoming_links']);//被リンク
      unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_plugins']);//プラグイン
      unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_quick_press']);//クイック投稿
      unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_recent_drafts']);//最近の下書き
      unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_primary']);//WordPressブログ
      unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_secondary']);//フォーラム
      unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_activity']);//アクティビティ
    }

} 






//////////////////////////////////////////////////////////////////////////

/**
 * バージョンアップ通知を管理者のみ表示させるようにします。
 */
function update_nag_admin_only() {
    if ( ! current_user_can( 'administrator' ) ) {
        remove_action( 'admin_notices', 'update_nag', 3 );
    }
}
add_action( 'admin_init', 'update_nag_admin_only' );


//テーマの自動更新無効化
add_filter( 'auto_update_theme', '__return_false' );

//プラグインの自動更新無効化
add_filter( 'auto_update_plugin', '__return_false' );

//翻訳の自動更新無効化
add_filter( 'auto_update_translation', '__return_false' );








//////////////////////////////////////////////////////////////////////////

/**
 * モバイル判定(タブレットはPC扱いとする)
 */
function is_mobile() {
    $useragents = array(
        'iPhone',          // iPhone
        'iPod',            // iPod touch
        '^(?=.*Android)(?=.*Mobile)', // 1.5+ Android
        'dream',           // Pre 1.5 Android
        'CUPCAKE',         // 1.5+ Android
        'blackberry9500',  // Storm
        'blackberry9530',  // Storm
        'blackberry9520',  // Storm v2
        'blackberry9550',  // Storm v2
        'blackberry9800',  // Torch
        'webOS',           // Palm Pre Experimental
        'incognito',       // Other iPhone browser
        'webmate'          // Other iPhone browser
    );
    $pattern = '/'.implode('|', $useragents).'/i';
    return preg_match($pattern, $_SERVER['HTTP_USER_AGENT']);
}





//////////////////////////////////////////////////////////////////////////

/**
 * タグ出力の制御
 */
add_filter('the_content', 'wpautop_filter', 9);
function wpautop_filter($content) {
  global $post;
  
  $remove_filter = false;

  $arr_types = array('page','post'); //適用させる投稿タイプを指定

  $post_type = get_post_type( $post->ID );

  if (in_array($post_type, $arr_types)) $remove_filter = true;

  if ( $remove_filter ) {
    remove_filter('the_content', 'wpautop');
    remove_filter('the_excerpt', 'wpautop');
  }

  return $content;

}

/*
* 固定ページのみ自動的に付与されるpタグやbrタグを無効(上のコードの簡素版)
*/
function disable_page_wpautop() {
  if ( is_page() ) remove_filter( 'the_content', 'wpautop' );
}
add_action( 'wp', 'disable_page_wpautop' );


// 抜粋の自動整形を無効化
remove_filter('the_excerpt', 'wpautop');


//////////////////////////////////////////////////////////////////////////

/**
 * アタッチメントIDから画像を取得
 */
function GetImg($id){

  $thumb_img = wp_get_attachment_image_src($id, 'medium');  // 画像の情報を配列で取得
  
  $thumb_src = $thumb_img[0];  // 配列の中からURLの情報だけ取得

  return $thumb_src;           //URLを返す
}

function GetFullImg($id){

  $thumb_img = wp_get_attachment_image_src($id, 'full');  // 画像の情報を配列で取得
  
  $thumb_src = $thumb_img[0];  // 配列の中からURLの情報だけ取得

  return $thumb_src;           //URLを返す
}

function GetLargeImg($id){

  $thumb_img = wp_get_attachment_image_src($id, 'large');  // 画像の情報を配列で取得
  
  $thumb_src = $thumb_img[0];  // 配列の中からURLの情報だけ取得

  return $thumb_src;           //URLを返す
}

//////////////////////////////////////////////////////////////////////////
/**
 * 投稿IDからアイキャッチ画像を取得
 */
function GetEyeCatch($size = 'full', $post_id = null) {

  $post_id = ($post_id) ? $post_id : get_the_ID();  //第2引数が指定されていればそれを、指定がなければ現在の投稿IDをセット

  if (!has_post_thumbnail($post_id)) return false;  //指定した投稿がアイキャッチ画像を持たない場合、falseを返す

  $thumb_id = get_post_thumbnail_id($post_id);      // 指定した投稿のアイキャッチ画像の画像IDを取得
  
  $thumb_img = wp_get_attachment_image_src($thumb_id, $size);  // 画像の情報を配列で取得
  
  $thumb_src = $thumb_img[0];  // 配列の中からURLの情報だけ取得

  return $thumb_src;           //URLを返す
}



//////////////////////////////////////////////////////////////////////////
/**
 * OGP用の画像を取得。ない場合はダミー画像を返す
 */
function og_image(){

  $hostname = ($_SERVER['HTTPS'])? "https://".$_SERVER['SERVER_NAME'] : "http://".$_SERVER['SERVER_NAME'];

  if( GetEyeCatch('full') == "" || GetEyeCatch('full') == "" ){
    echo $hostname . '/images/no-og-image.png';
  }

  else{
    echo GetEyeCatch('full');
  }

}


//////////////////////////////////////////////////////////////////////////
/**
 * エスケープ文字を削除(カスタムデータベース処理)
 */
function esc_esc($str){
    return preg_replace('/\\\/u', '', $str);
}


/*********************************************************************************
■■■ オブジェクト配列のキーを、値に
*********************************************************************************/
function Obj_array_column($obj,$key){

  $res = new stdClass();
  $set_key = new stdClass();

  foreach($obj as $val){
      $set_key = $val->$key;
      $res->$set_key = $val;
  }

  return $res;

}












