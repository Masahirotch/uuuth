<?php
/********************************************
ショートコードで固定ページの呼び出し
呼び出し方:[page pageslug]
********************************************/
function include_page($atts) {

    global $lang;

	$page_slug = $atts[0];
	$page_data = get_page_by_path('top/' . $page_slug, OBJECT);

    if($lang != 'jp'){

        $field = get_post_meta($page_data->ID, $lang , true);
        return do_shortcode($field);

    }
    else{

        return do_shortcode($page_data->post_content);
    }



}
add_shortcode("page", "include_page");


/********************************************
ショートコードでインクルードファイルの呼び出し
呼び出し方:[inc filename(.phpは省く)]
********************************************/

function SectionInclude( $atts ) {

	extract( shortcode_atts( array( 'file' => $atts[0] ), $atts ) );

	ob_start();

		include(TEMPLATEPATH . "/inc/$file.php");

	return ob_get_clean();

}
add_shortcode('inc', 'SectionInclude');


/********************************************
ショートコードで言語別インクルードファイルの呼び出し
呼び出し方:[include file='top-blog-section' lang='en']
********************************************/
function SectionInclude_lang( $params ) {
    extract( shortcode_atts( array( 'file' => 'default' ), $params ) );
    extract( shortcode_atts( array( 'lang' => 'jp' ), $params ) );
    ob_start();

    $ThemeRootPath = get_theme_root();

    include($ThemeRootPath . "/shuttle/inc/$file.php");
    return ob_get_clean();
}
add_shortcode('include', 'SectionInclude_lang');



/********************************************
ショートコードでカスタムフィールドを呼び出す
呼び出し方:[Cf フィールド名]
********************************************/
function ViewCustomFields($target) {

	$view_target = $target[0];

    $field = get_post_meta(get_the_ID(), $view_target , true);
    return $field;
}
add_shortcode('Cf', 'ViewCustomFields');


/********************************************
ショートコードでカスタムフィールドの言語別データを呼び出す

呼び出し方:[Cf main_copy]

カスタムフィールド名
main_copy_jp
main_copy_en
main_copy_th

など
********************************************/
function ViewCustomFields_lang($target) {

	global $lang;
	$view_target = $target[0] . '_' . $lang;

    $field = apply_filters('the_content', get_post_meta(get_the_ID(), $view_target, true));
    return $field;
}
add_shortcode('Cf', 'ViewCustomFields_lang');



/********************************************
リダイレクト先を表示するショートコード
使い方:[Re '/awamori/']
<script>window.location = '/awamori/';</script>が出力される
********************************************/
function redirect($target) {

    $re = "<script>window.location = '{$target[0]}';</script>";
    return $re;
}
add_shortcode('Re', 'redirect');



/********************************************
現在の言語設定を表示するショートコード
呼び出し方:[lang]
********************************************/
function print_lang() {
	global $lang;
	return $lang;
}
add_shortcode( 'lang', 'print_lang' );



/********************************************
 テーマURLを表示するショートコード
 使用法 : [theme]
********************************************/
function search_tpl_url_func() {
    return get_stylesheet_directory_uri().'/';
}
add_shortcode( 'assets', 'search_tpl_url_func' );





?>