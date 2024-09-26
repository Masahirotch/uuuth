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


$product = new stdClass;


$product = GetProduct($post->post_name);

echo "<!--\n";
var_dump($product);
echo "-->\n";


$lot_list = GetLot();



?>

<link rel='stylesheet' href='<?php echo $tpl; ?>/css/flex.css' type='text/css' media='all' />
<link rel='stylesheet' href='<?php echo $tpl; ?>/css/admin-style.css' type='text/css' media='all' />

<div id="admin-set" >

<!-- ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ 施設データ ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ -->
<section class="flex row-nowrap flex-between">

    <div class="left-section width-100">
        <h4>商品データ</h4>

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
        <input class="width-60" type="text" name="product_spec" placeholder="" value="<?php echo $product->product_spec; ?>">
    </div>

    <base>


    <div class="component flex row-nowrap flex-start flex-align-center">
        <h5 class="width-20">最低注文ロット</h5>
        <input class="width-50" type="text" name="product_spec" placeholder="" value="<?php echo $product->product_spec; ?>">
    </div>




<select id="mm" name="mm" class="width-50">
            <option value="01" data-text="1月" >01 (1月)</option>
            <option value="02" data-text="2月" >02 (2月)</option>
            <option value="03" data-text="3月" >03 (3月)</option>
            <option value="04" data-text="4月" >04 (4月)</option>
            <option value="05" data-text="5月" >05 (5月)</option>
            <option value="06" data-text="6月"  selected='selected'>06 (6月)</option>
            <option value="07" data-text="7月" >07 (7月)</option>
            <option value="08" data-text="8月" >08 (8月)</option>
            <option value="09" data-text="9月" >09 (9月)</option>
            <option value="10" data-text="10月" >10 (10月)</option>
            <option value="11" data-text="11月" >11 (11月)</option>
            <option value="12" data-text="12月" >12 (12月)</option>
</select>





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

