<?php


/*
SEOデータ (seo_metadesc,seo_title)
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■*/


/********************************************
SEOデータの読み出し
********************************************/
function GetSeo($pid){

	global $wpdb;

	$seo = new stdClass;
	global $seo;

	$seo->title = $wpdb->get_row("SELECT * FROM seo_title WHERE ID = '{$pid}' ");
	$seo->metadesc = $wpdb->get_row("SELECT * FROM seo_metadesc WHERE ID = '{$pid}' ");

	return $seo;

}






























?>