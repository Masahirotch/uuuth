
<section class="flex row-wrap">

    <!--▼▼▼▼▼▼▼▼▼▼ 写真 ▼▼▼▼▼▼▼▼▼▼-->
<?php 



$main_pict = wp_get_attachment_image_src($facility->data->main_pict,'large');
$pict01    = wp_get_attachment_image_src($facility->data->pict_1,'large');
$pict02    = wp_get_attachment_image_src($facility->data->pict_2,'large');
$pict03    = wp_get_attachment_image_src($facility->data->pict_3,'large');
$pdf       = wp_get_attachment_image_src($facility->data->pdf,'large');


?>


    <div class="left-section width-100">
        <h4>メイン写真（width:1000px height:550px）</h4>
        <div class="component">
            <div class="flex-set-2">
                <div id="main-pict" class="flex row-wrap flex-start">
                        <div class="view"><?php if($facility->data->main_pict !=''){echo "<img src='{$main_pict[0]}'>";}?></div>
                        <p style="width:100%;">画像ID:<?php if($facility->data->main_pict !=''){echo $facility->data->main_pict ;}?></p>
                        <input type="hidden" name="main_pict" value="<?php if($facility->data->main_pict !=''){echo $facility->data->main_pict ;}?>">
                        <input type="button" class="media" id="main-pict" value="選択" />
                        <input type="button" class="media-clear" id="main-pict" value="クリア" />
                </div>
            </div>
        </div>
        <!--▲ component ▲-->
    </div>



    <div class="left-section width-100">

        <h4>オプション写真（width:750px height:500px）</h4>
        <div class="component">
            <div class="flex-set-3">

                <div id="pict-1" class="flex row-wrap flex-start">
                    <div class="view"><?php if($facility->data->pict_1 !=''){echo "<img src='{$pict01[0]}'>";}?></div>
                    <p>画像ID:<?php if($facility->data->pict_1 !=''){echo $facility->data->pict_1 ;}?></p>
                    <input type="hidden" name="pict_1" value="<?php if($facility->data->pict_1 !=''){echo $facility->data->pict_1 ;}?>">
                    <input type="button" class="media" id="pict-1" value="選択" />
                    <input type="button" class="media-clear" id="pict-1" value="クリア" />
                </div>

                <div id="pict-2" class="flex row-wrap flex-start">
                    <div class="view"><?php if($facility->data->pict_2 !=''){echo "<img src='{$pict02[0]}'>";}?></div>
                    <p>画像ID:<?php if($facility->data->pict_2 !=''){echo $facility->data->pict_2 ;}?></p>
                    <input type="hidden" name="pict_2" value="<?php if($facility->data->pict_2 !=''){echo $facility->data->pict_2 ;}?>">
                    <input type="button" class="media" id="pict-2" value="選択" />
                    <input type="button" class="media-clear" id="pict-2" value="クリア" />
                </div>

                <div id="pict-3" class="flex row-wrap flex-start">
                    <div class="view"><?php if($facility->data->pict_3 !=''){echo "<img src='{$pict03[0]}'>";}?></div>
                    <p>画像ID:<?php if($facility->data->pict_3 !=''){echo $facility->data->pict_3 ;}?></p>
                    <input type="hidden" name="pict_3" value="<?php if($facility->pict_3 !=''){echo $facility->data->pict_3 ;}?>">
                    <input type="button" class="media" id="pict-3" value="選択" />
                    <input type="button" class="media-clear" id="pict-3" value="クリア" />
                </div>

            </div>

        </div>
        <!--▲ component ▲-->

    </div>


    <div class="left-section width-100">
        <h4>フロアガイド、もしくは店舗パンフ(フロアガイドのリンク先・画像も可)</h4>
        <div class="component">
            <div class="flex-set-2">
                <div id="pdf" class="flex row-wrap flex-start">

                         <div class="view" style="max-width:300px;">
                            <?php if($facility->data->pdf !=''){ echo "<img src='{$pdf[0]}'>";}?>
                        </div>

                        <p style="width:100%;" id="pdf-up">
                            ファイル<?php if($facility->data->pdf !=''){echo $facility->data->pdf ;}?>

                        </p>
                        <input type="hidden" name="pdf" value="<?php if($facility->data->pdf !=''){echo $facility->data->pdf ;}?>">
                        <input type="button" class="media" id="pdf" value="選択" />
                        <input type="button" class="media-clear" id="pdf" value="クリア" />
                </div>
            </div>
        </div>
        <!--▲ component ▲-->
    </div>














<?php


echo $post->ID;
$coupon = $wpdb->get_row("SELECT * FROM facility_coupon WHERE facility_id = {$post->ID}");


?>
  <div class="component flex row-wrap flex-start flex-align-center">
        <h4>店舗個別のクーポンがある場合は登録</h4>
        <h5 class="width-20">提示用クーポン画像<br>
            <span class="example">バーコード画像の登録がある場合、バーコード画像が優先して表示されます。 </span>
            <span class="example">クーポン番号、クーポンコードを提示させる場合には、当該番号やコードを画像にして登録してください。</span>
        </h5>
        <div class="tabs component  width-80">



            <div class="coupon_list flex row-wrap flex-start split-3">


                <div id="coupon_jp" class="flex row-wrap flex-start">
                <?php $pict_jp = wp_get_attachment_url($coupon->jp); ?>
                    <h4>日本版クーポン画像</h4>
                    <div class="view">
                    <?php if( $coupon->jp !='' ){ echo "<img src='{$pict_jp}'>";}?>
                    </div>
                    <input type="hidden" name="coupon_jp" value="<?php if($coupon->jp !=''){echo $coupon->jp ;}?>">
                    <input type="button" class="media" id="coupon_jp" value="選択" />
                    <input type="button" class="media-clear" id="coupon_jp" value="クリア" />
                </div>

                <div id="coupon_en" class="flex row-wrap flex-start">
                <?php $pict_en = wp_get_attachment_url($coupon->en); ?>
                    <h4>英語版クーポン画像</h4>
                    <div class="view">
                    <?php if( $coupon->en !='' ){ echo "<img src='{$pict_en}'>";}?>
                    </div>
                    <input type="hidden" name="coupon_en" value="<?php if($coupon->en !=''){echo $coupon->en ;}?>">
                    <input type="button" class="media" id="coupon_en" value="選択" />
                    <input type="button" class="media-clear" id="coupon_en" value="クリア" />
                </div>


                <div id="coupon_cn" class="flex row-wrap flex-start">
                <?php $pict_cn = wp_get_attachment_url($coupon->cn); ?>
                    <h4>簡体字版クーポン画像</h4>
                    <div class="view">
                    <?php if( $coupon->cn !='' ){ echo "<img src='{$pict_cn}'>";}?>    
                    </div>
                    <input type="hidden" name="coupon_cn" value="<?php if($coupon->cn !=''){echo $coupon->cn ;}?>">
                    <input type="button" class="media" id="coupon_cn" value="選択" />
                    <input type="button" class="media-clear" id="coupon_cn" value="クリア" />
                </div>



                <div id="coupon_tc" class="flex row-wrap flex-start">
                <?php $pict_tc = wp_get_attachment_url($coupon->tc); ?>
                    <h4>繁体字版クーポン画像</h4>
                    <div class="view">
                    <?php if( $coupon->tc !='' ){ echo "<img src='{$pict_tc}'>";}?>       
                    </div>
                    <input type="hidden" name="coupon_tc" value="<?php if($coupon->tc !=''){echo $coupon->tc ;}?>">
                    <input type="button" class="media" id="coupon_tc" value="選択" />
                    <input type="button" class="media-clear" id="coupon_tc" value="クリア" />
                </div>


                <div id="coupon_ko" class="flex row-wrap flex-start">
                <?php $pict_ko = wp_get_attachment_url($coupon->ko); ?>
                    <h4>韓国版クーポン画像</h4>
                    <div class="view">
                        <?php if( $coupon->ko !='' ){ echo "<img src='{$pict_ko}'>";}?>       
                    </div>
                    <input type="hidden" name="coupon_ko" value="<?php if($coupon->ko !=''){echo $coupon->ko ;}?>">
                    <input type="button" class="media" id="coupon_ko" value="選択" />
                    <input type="button" class="media-clear" id="coupon_ko" value="クリア" />
                </div>


                <div id="coupon_th" class="flex row-wrap flex-start">
                <?php $pict_th = wp_get_attachment_url($coupon->th); ?>
                    <h4>タイ版クーポン画像</h4>
                    <div class="view">
                        <?php if( $coupon->th !='' ){ echo "<img src='{$pict_th}'>";}?>   
                    </div>
                    <input type="hidden" name="coupon_th" value="<?php if($coupon->th !=''){echo $coupon->th ;}?>">
                    <input type="button" class="media" id="coupon_th" value="選択" />
                    <input type="button" class="media-clear" id="coupon_th" value="クリア" />
                </div>



            </div>




        </div>
    </div>







    <!-- ▲▲▲▲▲▲▲▲▲▲ 写真 ▲▲▲▲▲▲▲▲▲▲ -->
</section>