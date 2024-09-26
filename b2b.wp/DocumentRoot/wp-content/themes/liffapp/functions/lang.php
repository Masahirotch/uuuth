<?php
/********************************************
言語別固定データのセット
global $lang_setで呼び出し

使い方
$langで言語コードを自動設定する場合
$lang_set['使いたい文字セット']->$lang

英語の場合
$lang_set['使いたい文字セット']->en

********************************************/
function set_language_items() {

	global $wpdb;

	$lang_set = new stdClass();
	global $lang_set;

		//$lang_set = Obj_array_column( $wpdb->get_results("SELECT * FROM const_langset") , "set" );
		$lang_set = $wpdb->get_results("SELECT * FROM const_langset");
		$lang_set = array_column($lang_set,null,'set');


	return $lang_set;
}
add_action('init', 'set_language_items');


/**
 * URLのセット
 */
function nolang_url() {

	global $lang_set;
	global $nolang_url;


	$url = $_SERVER['REQUEST_URI'];

	$set_lang = substr( $url, 0 ,4 );

	if (
		$set_lang == '/en/' ||
		$set_lang == '/ko/' ||
		$set_lang == '/tc/' ||
		$set_lang == '/cn/' ||
		$set_lang == '/th/' ||
		$set_lang == '/jp/' 
	){

		$nolang_url = "/" . str_replace($set_lang, '', $url);

	}
	else{
		$nolang_url = $url;
	}

	return $nolang_url;

}
add_action('init', 'nolang_url');





/********************************************
言語設定
global $langで呼び出し
********************************************/
function Setlang() {

	global $lang;

	$url= $_SERVER["REQUEST_URI"];
	$url = strtok( $url, '?' );
	$urlset = explode("/", $url);

	$key = array_key_last( $urlset );
	$lang = $urlset[1];

	if( $lang == 'en' || $lang == 'ko' || $lang == 'cn' || $lang == 'tc' || $lang == 'th' || $lang == 'jp' ){
		return $lang;

	}elseif($lang != 'en' && $lang != 'ko' && $lang != 'cn' && $lang != 'tc' && $lang != 'th' && $lang != 'jp')
	{
		$lang = 'jp';
		return $lang;
	}

}
add_action('init', 'Setlang');


/********************************************
<link rel="alternate" hreflang=.....
の設定
global $alternateで呼び出し
********************************************/
/********************************************
<link rel="alternate" hreflang=.....
の設定
global $alternateで呼び出し
********************************************/
function SetAlternate(){

	$no_lang_uri = preg_replace('(/cn/|/en/|/tc/|/ko/)', '', $_SERVER['REQUEST_URI']);

	$alternate = new stdClass;
	




	$hostname = (empty($_SERVER['HTTPS']))? "https://".$_SERVER['SERVER_NAME'] : "http://".$_SERVER['SERVER_NAME'];

	if( $no_lang_uri == '/'){
		$alternate->default = $hostname . $no_lang_uri;
		$alternate->en = $hostname . "/en/";
		$alternate->ko = $hostname . "/ko/";
		$alternate->cn = $hostname . "/cn/";
		$alternate->tc = $hostname . "/tc/";
		$alternate->path = $no_lang_uri;
	}else{
		$alternate->default = $hostname . "/" . $no_lang_uri;
		$alternate->en = $hostname . "/en/" . $no_lang_uri;
		$alternate->ko = $hostname . "/ko/" . $no_lang_uri;
		$alternate->cn = $hostname . "/cn/" . $no_lang_uri;
		$alternate->tc = $hostname . "/tc/" . $no_lang_uri;
		$alternate->path = "/" . $no_lang_uri;
	}

	global $alternate;


		//////////////////
		$url= $_SERVER["REQUEST_URI"];
		$url = strtok( $url, '?' );
		$urlset = explode("/", $url);

		$key = array_key_last ( $urlset );
		$lang = $urlset[1];

		if( $lang == 'en' || $lang == 'ko' || $lang == 'cn' || $lang == 'tc' || $lang == 'th' || $lang == 'jp' ){
			$language = '';
		}elseif($lang != 'en' && $lang != 'ko' && $lang != 'cn' && $lang != 'tc' && $lang != 'th' && $lang != 'jp')
		{
			$language  = 'default';
		}

		if($language == "default"){
			$alternate->default = $hostname . "" . $no_lang_uri;
			$alternate->en = $hostname . "/en" . $no_lang_uri;
			$alternate->ko = $hostname . "/ko" . $no_lang_uri;
			$alternate->cn = $hostname . "/cn" . $no_lang_uri;
			$alternate->tc = $hostname . "/tc" . $no_lang_uri;	
			$alternate->path = $no_lang_uri;	
		}

		///////////////////////////////////////


	return $alternate;

}
add_action('init', 'SetAlternate');









?>