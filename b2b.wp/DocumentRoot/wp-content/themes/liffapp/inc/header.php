<!--/ inc header -->
<?php

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
<style>
header{height:20vh;background:url('<?php echo $path->images;?>/header.jpg') 50% 50% no-repeat;background-size:cover;background-attachment:local,scroll;display:-webkit-flex;display:-ms-flexbox;display:flex;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding-left:2em;color:#fff}header h1{font-weight:100;font-size:30px;color:#fff;letter-spacing:.1em;filter:drop-shadow(0 0 4px rgba(0,0,0,.6))}
</style>
<header>
	<h1><?php echo $seo->title->jp;?></h1>
</header>
<!-- inc header / -->