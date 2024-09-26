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

$id = $post->ID;


VueJS();
VuexJS();
AxiosJS();





//$product = GetProduct($post->post_name);


?>

<link rel='stylesheet' href='<?php echo $tpl; ?>/css/flex.css' type='text/css' media='all' />
<link rel='stylesheet' href='<?php echo $tpl; ?>/css/admin-style.css' type='text/css' media='all' />


<div id="admin-set" >

<!--<p>登録ID : <?php echo $post->ID;?></p>-->
<input type="hidden" name="facility_id" value="<?php echo $facility->facility_id;?>">

<!-- ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 施設データ ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ -->
<section class="flex row-nowrap flex-between">

    <?php //$facility->data = $wpdb->get_row("SELECT * FROM facility_data Where facility_id = {$id} "); ?>
    <div class="left-section width-100">
        <h4>商品詳細データ</h4>

    <div class="component flex row-nowrap flex-start flex-align-center">
        <h5 class="width-20">商品名</h5>
        <input class="width-80" type="text" name="product_name" placeholder="" value="<?php echo($product->product_name)? $product->product_name : ''; ?>">
    </div>

    <base>

    <div class="component flex row-nowrap flex-start flex-align-center">
        <h5 class="width-20">価格（税込）</h5>
        <input class="width-20" type="number" name="default_price" placeholder="" value="<?php echo($product->default_price)? $product->default_price : ''; ?>">&nbsp;円(税込)
    </div>

    <base>

    <div class="component flex row-nowrap flex-start flex-align-center">
        <h5 class="width-20">軽減税率</h5>
        <div class="width-40 radio-set flex row-nowrap flex-between split-2">

            <input id="selfprint-1" type="radio" name="reduced_tax" value="1" <?php echo($product->reduced_tax == 1)? 'checked="checked"' : ''; ?>>
            <label class="radio_item" for="selfprint-1">適用あり(8%)</label>

            <input id="selfprint-2" type="radio" name="reduced_tax" value="0" <?php echo($product->reduced_tax == 0)? 'checked="checked"' : ''; ?>>
            <label class="radio_item" for="selfprint-2">適用なし(10%)</label>

        </div>
    </div>

    <base>

    <div class="component flex row-nowrap flex-start flex-align-center">
        <h5 class="width-20">商品説明</h5>
        <textarea rows="6" name="product_desc" class="width-80" ><?php echo($product->product_desc)? $product->product_desc : ''; ?></textarea>
    </div>

    <base>

    <div class="component flex row-nowrap flex-start flex-align-center">
        <h5 class="width-20">産地や規格など</h5>
        <input class="width-60" type="text" name="product_spec" placeholder="" value="<?php echo $facility->data->zip_code; ?>">
    </div>

    <base>




</div>
<!-- end left-section -->

</section>



<!--■■ 施設写真入力フォーム読み込み ■■-->
<?php 
    //$load_file = get_parent_theme_file_path( '/admin/facility-pict.php' );
    //require $load_file;
?>
<!--■■ 施設写真入力フォーム読み込み ■■-->







</div>
<!-- admin-set -->



<script type='text/javascript' src='<?php echo $tpl; ?>/admin/admin-image.js'></script>

