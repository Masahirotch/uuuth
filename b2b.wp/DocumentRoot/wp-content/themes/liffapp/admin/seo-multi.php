
    <div class="component flex row-wrap flex-start flex-align-center tab-set">

        <h4>META DESCIPTION <span>( PC全角約110文字以内、スマホ全角約60文字以内のため、60文字前後が望ましい )</span></h4>

        <?php $seo->metadesc = $wpdb->get_row("SELECT * FROM seo_metadesc Where ID = {$id} "); ?>
        <!--▼ tabs component ▼-->
        <div class="tabs component tab-split-6">
            <!-- TAB -->
            <input  id="label-metadesc-jp" type="radio" name="tab-item-metadesc" checked>
            <label for="label-metadesc-jp" class="tab-item">DESCRIPTION</label>

<!--
            <input  id="label-metadesc-en" type="radio" name="tab-item-metadesc">
            <label for="label-metadesc-en" class="tab-item">英語</label>

            <input  id="label-metadesc-cn" type="radio" name="tab-item-metadesc">
            <label for="label-metadesc-cn" class="tab-item">簡体字</label>

            <input  id="label-metadesc-tc" type="radio" name="tab-item-metadesc">
            <label class="tab-item" for="label-metadesc-tc">繁体字</label>

            <input  id="label-metadesc-ko" type="radio" name="tab-item-metadesc">
            <label for="label-metadesc-ko" class="tab-item" >韓国語</label>

            <input  id="label-metadesc-th" type="radio" name="tab-item-metadesc">
            <label for="label-metadesc-th" class="tab-item" >タイ語</label>
-->

            <!-- TAB ITEM -->
            <div class="tab-content" id="item-metadesc-jp">
                <div class="tab-content-metadesc">
                    <textarea rows="4" name="metadesc_jp" placeholder="SEO meta metadescription (日本語)" id="newcontent"><?php echo $seo->metadesc->jp; ?></textarea>
                </div>
            </div>

<!--
            <div class="tab-content" id="item-metadesc-en">
                <div class="tab-content-metadesc">
                    <textarea rows="4" name="metadesc_en" placeholder="SEO meta metadescription (英語)"><?php echo $seo->metadesc->en; ?></textarea>
                </div>
            </div>

            <div class="tab-content" id="item-metadesc-cn">
                <div class="tab-content-metadesc">
                    <textarea rows="4" name="metadesc_cn" placeholder="SEO meta metadescription (簡体字)"><?php echo $seo->metadesc->cn; ?></textarea>
                </div>
            </div>

            <div class="tab-content" id="item-metadesc-tc">
                <div class="tab-content-metadesc">
                    <textarea rows="4" name="metadesc_tc" placeholder="SEO meta metadescription (繁体字)"><?php echo $seo->metadesc->tc; ?></textarea>
                </div>
            </div>

            <div class="tab-content" id="item-metadesc-ko">
                <div class="tab-content-metadesc">
                    <textarea rows="4" name="metadesc_ko" placeholder="SEO meta metadescription (韓国語)"><?php echo $seo->metadesc->ko; ?></textarea>
                </div>
            </div>

            <div class="tab-content" id="item-metadesc-th">
                <div class="tab-content-metadescription">
                    <textarea rows="4" name="metadesc_th" placeholder="SEO meta metadescription (タイ語)"><?php echo $seo->metadesc->th; ?></textarea>
                </div>
            </div>

-->
            <style>
.tabs #label-metadesc-jp:checked ~ #item-metadesc-jp,
.tabs #label-metadesc-en:checked ~ #item-metadesc-en,
.tabs #label-metadesc-cn:checked ~ #item-metadesc-cn,
.tabs #label-metadesc-tc:checked ~ #item-metadesc-tc,
.tabs #label-metadesc-ko:checked ~ #item-metadesc-ko,
.tabs #label-metadesc-th:checked ~ #item-metadesc-th{
display: block;
}
            </style>

        </div>
        <!--▲ tabs component ▲-->

    </div>