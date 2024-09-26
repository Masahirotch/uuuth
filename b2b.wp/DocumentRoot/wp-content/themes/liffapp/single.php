<?php
/*
 * Template Name:投稿ページ
*/

global $wpdb;
global $path;
global $lang;
global $lang_set;
global $alternate;
global $wp_query;
global $pid;
$pid = ( is_home() )? get_option( 'page_on_front' ):get_the_ID();

$seo = GetSeo($pid);

get_header(); ?>
<!--/single-->
<div id="wrapper">

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

<?php 


    if($lang != 'jp'){

        $field = get_post_meta($pid, $lang , true);
        echo do_shortcode($field);

    }
    else{

        the_content();
    }

?>

<?php endwhile; endif; ?>

</div>
<!--single/-->
<?php get_footer(); ?>