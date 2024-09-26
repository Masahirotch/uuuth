<?php
/*
 * Template Name:固定ページ(読み込みセクション用)

is_page()で固定ページの時の表示



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
<!--/page-child-->
<div class="child-wrapper">
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

    <?php 

    if($lang != 'jp'){

        $field = get_post_meta($post->ID, $lang , true);
        echo do_shortcode($field);

    }
    else{
        the_content();
    }

?>
<?php endwhile; endif; ?>

</div>
<!--page-child/-->