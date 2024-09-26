<?php
/*
テーマのための関数
*/




global $wp_rewrite;
$wp_rewrite->flush_rules();



/**
 * 読み込む順番を保証する必要があるファイルは直接インクルードする
 */
//require_once( get_template_directory() . '/inc/define.php' );

//Load functions
foreach ( glob( get_template_directory() . "/functions/*.php" ) as $file ) {
  require_once $file;
}

//Load Classes
/*
foreach ( glob( "classes/*.php" ) as $file ) {
  require_once $file;
}
*/


