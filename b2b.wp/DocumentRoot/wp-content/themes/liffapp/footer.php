<?php
/*
パーツ：フッター
*/

global $wpdb;
global $path;
global $lang;
global $lang_set;
global $alternate;
global $pid;
$pid = ( is_home() )? get_option( 'page_on_front' ) :get_the_ID();

?>
</body>
</html>