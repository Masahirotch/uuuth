(function ($) {

    var custom_uploader;
    var imgTargetID;

    $("input.media").click(function(e) {

        imgTargetID = 'div#' + $(this).attr('id');

        e.preventDefault();

        if (custom_uploader) {

            custom_uploader.open();
            return;

        }

        custom_uploader = wp.media({

            title: "画像選択",

            /* ライブラリの一覧は画像のみにする */
            /*
            library: {
                type: "image"
            },
            */

            button: {
                text: "この画像を使用"
            },

            /* 選択できる画像は 1 つだけにする */
            multiple: false

        });

        custom_uploader.on("select", function() {

            var images = custom_uploader.state().get("selection");

            /* file の中に選択された画像の各種情報が入っている */
            images.each(function(file){

                console.dir(file);

                /* プレビュー用に選択されたサムネイル画像を削除 */
                $(imgTargetID + ' > div.view').empty();

                if(file.attributes.mime == 'application/pdf' && imgTargetID == 'div#pdf'){
                    $( imgTargetID + ' > p' ).html('ファイル名 / ' + file.attributes.filename );


                    /* プレビュー用に選択されたサムネイル画像を表示 */
                    $(imgTargetID + ' > div.view').append('<img src="'+file.attributes.sizes.large.url+'" />');
                    //full , large width:1024 , medium width:300, thumbnail width:150

                }
                else{

                    /* テキストフォームに画像の ID を表示 */
                    $( imgTargetID + ' > p' ).html(file.id);

                    /* プレビュー用に選択されたサムネイル画像を表示 */
                    $(imgTargetID + ' > div.view').append('<img src="'+file.attributes.url+'" />');
                    //full , large width:1024 , medium width:300, thumbnail width:150


                }

                /* inputフォームに画像の ID を表示 */
                $(imgTargetID + ' > input[type="hidden"]' ).val(file.id);


                

            });
        });

        custom_uploader.open();

    });

    /* クリアボタンを押した時の処理 */
    $("input.media-clear").click(function() {

        imgTargetID = 'div#' + $(this).attr('id');
        console.log(imgTargetID);
        $(imgTargetID + ' > p' ).empty();
        $(imgTargetID + ' > .view').empty();
        $(imgTargetID + ' input[type="hidden"]' ).val('');

    });

})(jQuery);