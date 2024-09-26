<?php
/**
 * Displays top navigation
 *
 * @package WordPress
 * @subpackage smartconcierge
 * @since 1.0
 * @version 1.2
 */

global $wpdb;
global $current_user;

$tpl = get_template_directory_uri();

global $post;
$id = $post->ID;

?>


<div id="admin-set" >

    <input type="hidden" name="ID" value="<?php echo $id;?>">


<?php 
    $load_file = get_parent_theme_file_path( '/admin/liff-id.php' );
    require $load_file;
?>

<?php 
    $load_file = get_parent_theme_file_path( '/admin/seo-title.php' );
    require $load_file;
?>


<?php 
    $load_file = get_parent_theme_file_path( '/admin/seo-multi.php' );
    require $load_file;
?>


</div>