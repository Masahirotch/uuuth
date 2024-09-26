<?php
/*
404ページ用テンプレート
*/


global $wpdb;
global $path;
global $lang;
global $lang_set;
global $alternate;
global $wp_query;
global $pid;
$pid = ( is_home() )? 5:get_the_ID();

$seo = GetSeo($pid);


get_header(); ?>



404


<?php get_footer(); ?>
