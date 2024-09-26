<?php
/*
パーツ：ヘッダ
*/

global $wpdb;
global $path;
global $lang;
global $lang_set;
global $alternate;
global $wp_query;

global $pid;
$pid = ( is_home() )? get_option( 'page_on_front' ) :get_the_ID();

$seo = GetSeo($pid);

?>
<!DOCTYPE html>
<html lang="<?php echo $lang_set["lang_code"]->$lang; ?>">

<!--/header-->
<head>
	<meta charset="UTF-8">
	<meta http-equiv="content-language" content="<?php echo $lang_set["lang_code"]->$lang; ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1  maximum-scale=1 user-scalable=no">

	<title><?php echo $seo->title->$lang;?></title>
	<meta name="description" content="<?php echo $seo->metadesc->$lang;?> <?php echo $lang_set['sitename']->$lang;?>" />
	<link rel="shortcut icon" href="/favicon.ico">
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta http-equiv='cache-control' content='no-cache'>
	<meta name="format-detection" content="telephone=no">

	<!-- CSS -->
	<link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/css/reset.min.css?v=<?php echo time();?>">
	<link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/css/common.css?v=<?php echo time();?>">
	<link rel="stylesheet" href="<?php echo get_stylesheet_uri(); ?>?v=<?php echo time();?>">

	<!-- Font Awesome Kit -->
	<script src="https://kit.fontawesome.com/9d0387e63b.js" crossorigin="anonymous"></script>

</head>
<body id="top">
<?php
include($path->header);
?>
<!--header/-->

