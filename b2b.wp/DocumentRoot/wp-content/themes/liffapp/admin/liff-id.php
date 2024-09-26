

   <!--*****  *****-->
    <div class="component flex row-wrap flex-start flex-align-center tab-set">

        <h4>LIFF ID</h5>
        <?php $liff = $wpdb->get_row("SELECT * FROM liff_id Where ID = {$id} "); ?>

        <div class="tabs component tab-split-6">
            <!-- TAB -->
            <input  id="label-liff" type="radio" name="tab-item-liff" checked>
            <label for="label-liff" class="tab-item">liff ID</label>


            <!-- TAB ITEM -->
            <div class="tab-content" id="item-liff">
                <input type="text" name="liff_id" placeholder="liff_id" value="<?php echo $liff->liff_id;?>">
            </div>

            <style>
.tabs #label-liff:checked ~ #item-liff{
display: block;
}
            </style>
        </div>
    </div>
    <!--*****  *****-->