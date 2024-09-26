<?php
/*#########################################################

リライトルールの登録など

#########################################################*/
global $wp_rewrite;
$wp_rewrite->flush_rules();



// ルールを追加するときはflush_rules()を忘れないように
function flushRules(){
    global $wp_rewrite;
    $wp_rewrite->flush_rules();
}
add_filter('init','flushRules');


/**
 * クエリーの登録
 */
function my_custom_query_vars( $vars ) {
	$vars[] = 'language';
	return $vars;
	flush_rewrite_rules();
}
add_filter( 'query_vars', 'my_custom_query_vars', 0 );


/**
 * エンドポイント追加
 */
add_filter( 'query_vars', 'my_add_lang_to_qvar' );
function my_add_lang_to_qvar( $vars ) {

	$vars[] = 'jp';
	$vars[] = 'en';
	$vars[] = 'cn';
	$vars[] = 'tc';
	$vars[] = 'ko';
	$vars[] = 'th';
	return $vars;
flush_rewrite_rules();
}


/**
 * リライトルールの変更・追加
 */
add_action( 'init', 'pmg_rewrite_add_rewrites' );
function pmg_rewrite_add_rewrites(){

	//言語セットはここをいじるだけ
	$langset = "en|cn|tc|ko|th|jp";

	//トップページ
    add_rewrite_rule( "^({$langset})/?$", 'index.php?language=$matches[1]', 'top' );

	//pagemane/ (固定ページ)
    add_rewrite_rule( "({$langset})/(.+)/?$", 'index.php?language=$matches[1]&pagename=$matches[2]', 'top' );

	//pagemane/ (固定ページ)
    add_rewrite_rule( "({$langset})/(.+)/?$", 'index.php?language=$matches[1]&name=$matches[2]', 'top' );


    //blog/ OK
	add_rewrite_rule( "({$langset})/blog/?$", 'index.php?language=$matches[1]&post_type=blog', 'top' );
    //blog/name/
	add_rewrite_rule( "({$langset})/blog/([^/]+)/?$", 'index.php?post_type=blog&language=$matches[1]&name=$matches[2]', 'top' );

	flushRules();

}
