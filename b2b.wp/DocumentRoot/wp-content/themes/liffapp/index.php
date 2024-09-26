<?php
/*
 * Template Name:index
*/

global $wpdb;
global $path;
global $lang;
global $lang_set;


global $alternate;
global $wp_query;

global $pid;
$pid = ( is_home() )? get_option( 'page_on_front' ) :get_the_ID();

get_header(); ?>
<!--/index-->




<?php 

echo $pid;

    if($lang != 'jp'){

        $field = get_post_meta($pid, $lang , true);
        echo do_shortcode($field);

    }
    else{

        the_content();
    }

?>



<!--index/-->
<?php get_footer(); ?>
