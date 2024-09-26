

   <!--*****  *****-->
    <div class="component flex row-wrap flex-start flex-align-center tab-set">

        <h4>SEO タイトル PC全角34文字(1列) スマホ1列全角20文字</h5>
        <?php $seo->title = $wpdb->get_row("SELECT * FROM seo_title Where ID = {$id} "); ?>

        <div class="tabs component tab-split-6">
            <!-- TAB -->
            <input id="tab-title-jp" type="radio" name="tab-item-title" checked>
            <label class="tab-item" for="tab-title-jp">TITLE</label>

<!--
            <input id="tab-title-en" type="radio" name="tab-item-title">
            <label class="tab-item" for="tab-title-en">英語</label>

            <input id="tab-title-cn" type="radio" name="tab-item-title">
            <label class="tab-item" for="tab-title-cn">簡体字</label>

            <input id="tab-title-tc" type="radio" name="tab-item-title">
            <label class="tab-item" for="tab-title-tc">繁体字</label>

            <input id="tab-title-ko" type="radio" name="tab-item-title">
            <label class="tab-item" for="tab-title-ko">韓国語</label>

            <input id="tab-title-th" type="radio" name="tab-item-title">
            <label class="tab-item" for="tab-title-th">タイ語</label>
-->

            <!-- TAB ITEM -->
            <div class="tab-content" id="item-title-jp">
                <input type="text" name="title_jp" placeholder="jp" value="<?php echo $seo->title->jp;?>">
            </div>

<!--
            <div class="tab-content" id="item-title-en">
                <input type="text" name="title_en" placeholder="en" value="<?php echo $seo->title->en;?>">
            </div>

            <div class="tab-content" id="item-title-cn">
                <input type="text" name="title_cn" placeholder="cn" value="<?php echo $seo->title->cn;?>">
            </div>

            <div class="tab-content" id="item-title-tc">
                <input type="text" name="title_tc" placeholder="tc" value="<?php echo $seo->title->tc;?>">
            </div>

            <div class="tab-content" id="item-title-ko">
                <input type="text" name="title_ko" placeholder="ko" value="<?php echo $seo->title->ko;?>">
            </div>

            <div class="tab-content" id="item-title-th">
                <input type="text" name="title_th" placeholder="th" value="<?php echo $seo->title->th;?>">
            </div>
-->

            <style>
.tabs #tab-title-jp:checked ~ #item-title-jp,
.tabs #tab-title-en:checked ~ #item-title-en,
.tabs #tab-title-cn:checked ~ #item-title-cn,
.tabs #tab-title-tc:checked ~ #item-title-tc,
.tabs #tab-title-ko:checked ~ #item-title-ko,
.tabs #tab-title-th:checked ~ #item-title-th{
display: block;
}
            </style>
        </div>
    </div>
    <!--*****  *****-->