<template>
  <div ontouchstart=””>
    <Nuxt />
  </div>
</template>
<script>
import axios from 'axios'
import Loading from '@/components/Loading'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {
    head(){
        return {
            title: this.page_title,
            // link: [
            //   {
            //     rel: 'stylesheet',
            //     href: '/theme_' + this.theme + '.css'
            //   }
            // ]
        }
    },

    async created(){

        // get app settings
        if( this.$route.query.app != void 0 ){

            await axios.get( process.env.MAIN_API + '/appConfig/' + this.$route.query.app ).then( function(result){

                if( result.data.length > 0 ){

                    this.setConfig(result.data[0])

                }

            }.bind(this)).catch((err) => { console.dir(err); })

        }

        if( this.$route.query['liff.state'] != void 0 ){

            var appname = await this.$route.query['liff.state'].replace( /\?app\=/g , '')

            await axios.get( process.env.MAIN_API + '/appConfig/' + appname ).then( function(result){

                if( result.data.length > 0 ){

                    this.setConfig(result.data[0])

                }

            }.bind(this)).catch((err) => { console.dir(err); })

        }

    },

    mounted(){

    },
    computed: {

        // テーマファイルの設置
        theme : function(){

            return ( this.config.theme_id )? this.config.theme_id : 1

        },

        // ページタイトルの設定
        page_title : function(){

            return ( this.config != void 0 && this.config != '' )? this.config.app_name : ''

        },


        ...mapGetters( 'config'  ,['config'] ),
    },
    methods:{
        ...mapActions('config'  ,['setConfig']),


    },
};
</script>
<!-- <style>
/* *::-webkit-scrollbar,div::-webkit-scrollbar {display: none;-webkit-appearance: none;scrollbar-width: none;}
*{font-family: "Helvetica Neue",Helvetica,Arial,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;}
abbr,address,article,aside,audio,b,blockquote,body,canvas,caption,cite,code,dd,del,details,dfn,div,dl,dt,em,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,p,pre,q,samp,section,small,span,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,ul,var,video{margin:0;padding:0;border:0;outline:0;font-size:100%;vertical-align:baseline;background:0 0}body{line-height:inherit !important;}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}nav ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}a{margin:0;padding:0;font-size:100%;vertical-align:baseline;background:0 0}ins{background-color:#ff9;color:#000;text-decoration:none}mark{background-color:#ff9;color:#000;font-style:italic;font-weight:700}del{text-decoration:line-through}abbr[title],dfn[title]{border-bottom:1px dotted;cursor:help}table{border-collapse:collapse;border-spacing:0}hr{display:block;height:1px;border:0;border-top:1px solid #ccc;margin:1em 0;padding:0}button,input,select,textarea{margin:0;padding:0;background:0 0;border:none;border-radius:0;outline:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;vertical-align:middle}select::-ms-expand{display:none}*,::after,::before{box-sizing:border-box;margin:0}div,h1,h2,h3,h4,h5,h6,p,dl,dt,dd{color:#444;}
a,a:hover,a:focus{text-decoration: none;}
*:not(input,textarea){user-select: none;}
div, h1, h2, h3, h4, h5, h6, p, dl, dt, dd, span{color:#5e6d82;} */

/* init */
*{
	--line:#00B900;
	--main-color : rgb(96, 47, 1);
    --text-color   : rgb(96, 47, 1);
    --main-light : rgb(135, 78, 0);
    --bg         : rgb(255, 255, 255);
    --bg-light   : rgb(247, 247, 247);
}
body{
	/* background-color:var(--bg); */
	/* iPhoneのセーフエリアを確保  */
	padding-bottom: env(safe-area-inset-bottom);
}




/* helper */
[mt-05]{margin-top:.5em}[mt-1]{margin-top:1em}[mt-2]{margin-top:2em}[mt-3]{margin-top:3em}[mt-4]{margin-top:4em}[mt-5]{margin-top:5em}[ml-05]{margin-left:.5em}[ml-1]{margin-left:1em}[ml-2]{margin-left:2em}[ml-3]{margin-left:3em}[ml-4]{margin-left:4em}[ml-5]{margin-left:5em}[mb-05]{margin-bottom:.5em}[mb-1]{margin-bottom:1em}[mb-2]{margin-bottom:2em}[mb-3]{margin-bottom:3em}[mb-4]{margin-bottom:4em}[mb-5]{margin-bottom:5em}[mr-05]{margin-right:.5em}[mr-1]{margin-right:1em}[mr-2]{margin-right:2em}[mr-3]{margin-right:3em}[mr-4]{margin-right:4em}[mr-5]{margin-right:5em}[mt-05i]{margin-top:.5em!important}[mt-1i]{margin-top:1em!important}[mt-2i]{margin-top:2em!important}[mt-3i]{margin-top:3em!important}[mt-4i]{margin-top:4em!important}[mt-5i]{margin-top:5em!important}[ml-05i]{margin-left:.5em!important}[ml-1i]{margin-left:1em!important}[ml-2i]{margin-left:2em!important}[ml-3i]{margin-left:3em!important}[ml-4i]{margin-left:4em!important}[ml-5i]{margin-left:5em!important}[mb-05i]{margin-bottom:.5em!important}[mb-1i]{margin-bottom:1em!important}[mb-2i]{margin-bottom:2em!important}[mb-3i]{margin-bottom:3em!important}[mb-4i]{margin-bottom:4em!important}[mb-5i]{margin-bottom:5em!important}[mr-05i]{margin-right:.5em!important}[mr-1i]{margin-right:1em!important}[mr-2i]{margin-right:2em!important}[mr-3i]{margin-right:3em!important}[mr-4i]{margin-right:4em!important}[mr-5i]{margin-right:5em!important}
[pt-05]{padding-top:.5em}[pt-1]{padding-top:1em}[pt-2]{padding-top:2em}[pt-3]{padding-top:3em}[pt-4]{padding-top:4em}[pt-5]{padding-top:5em}[pl-05]{padding-left:.5em}[pl-1]{padding-left:1em}[pl-2]{padding-left:2em}[pl-3]{padding-left:3em}[pl-4]{padding-left:4em}[pl-5]{padding-left:5em}[pb-05]{padding-bottom:.5em}[pb-1]{padding-bottom:1em}[pb-2]{padding-bottom:2em}[pb-3]{padding-bottom:3em}[pb-4]{padding-bottom:4em}[pb-5]{padding-bottom:5em}[pr-05]{padding-right:.5em}[pr-1]{padding-right:1em}[pr-2]{padding-right:2em}[pr-3]{padding-right:3em}[pr-4]{padding-right:4em}[pr-5]{padding-right:5em}[pt-05i]{padding-top:.5em!important}[pt-1i]{padding-top:1em!important}[pt-2i]{padding-top:2em!important}[pt-3i]{padding-top:3em!important}[pt-4i]{padding-top:4em!important}[pt-5i]{padding-top:5em!important}[pl-05i]{padding-left:.5em!important}[pl-1i]{padding-left:1em!important}[pl-2i]{padding-left:2em!important}[pl-3i]{padding-left:3em!important}[pl-4i]{padding-left:4em!important}[pl-5i]{padding-left:5em!important}[pb-05i]{padding-bottom:.5em!important}[pb-1i]{padding-bottom:1em!important}[pb-2i]{padding-bottom:2em!important}[pb-3i]{padding-bottom:3em!important}[pb-4i]{padding-bottom:4em!important}[pb-5i]{padding-bottom:5em!important}[pr-05i]{padding-right:.5em!important}[pr-1i]{padding-right:1em!important}[pr-2i]{padding-right:2em!important}[pr-3i]{padding-right:3em!important}[pr-4i]{padding-right:4em!important}[pr-5i]{padding-right:5em!important}[nobr]{display:inline-block !important;}
[no-margin]{margin:0;}
#__layout{max-width:500px;background:transparent;min-height:100vh;margin:0 auto;overflow-x:hidden;overflow-y:hidden;width:100%;min-height: -webkit-fill-available;overflow: hidden;}
#__layout > *,
#__layout > * > *{min-height:100vh;width:100%;min-height: -webkit-fill-available;}

[no-border]{border: none !important;}


[bg-logo]{
    background-image: url(/logo-bg.svg);
    background-position: 60% 0;
    background-size: 180%;
    max-width: 500px;
    background-repeat: repeat-y;
    background-attachment: fixed !important;
}

[bg-logo2]{
    background-image: url(/logo-bg2.svg);
    background-position: 60% 0;
    background-size: 180%;
    max-width: 500px;
    background-repeat: repeat-y;
    background-attachment: fixed !important;
}


/* layout */
[center-row]{ display: flex;flex-flow:row nowrap;justify-content: center;align-items: stretch;}
[center-col]{ display: flex;flex-flow:column nowrap;justify-content: center; align-items:center;}
.el-button+.el-button{margin:0;}
[full-height]{min-height: 100vh !important;}

[page-header]{
	font-size: min(4.5vmin,18px);
	color: var(--text-color);
	line-height: 2.3em;
	border-bottom: 2px solid #efefef;
	margin: 2em 1em 2em 1em;
	display: flex;flex-flow:row nowrap;justify-content: center;align-items: stretch;
}

[right]{display: flex;flex-flow:row nowrap;justify-content: flex-end;align-items:stretch;width: 100%;}
[text-link]{ color: #FFF;font-size: 13px;line-height:1.4em;border-bottom:1px dashed #ccc;display:inline-block; }


.el-message{
    max-width:90vw !important;
    min-width: 90vw !important;
}
.el-message *{
    max-width:90vw !important;
}




/* config-content  */
[config-content]{
	padding-top: 3em;
	padding-bottom: 5em;
}

[section-header]{
    color: #FFF;
    font-size: min(4vmin , 16px);
    line-height: 2em;
    border-bottom: 1px solid var(--main-color);
    padding-left: 0.3em;
    margin-bottom: 1em;
    color: var(--main-color);
    font-weight: 600;
}
[content-inner]{padding: 0 1em;}
[content-inner] *{color: var(--text-color);}
[content-inner] p{font-size: min(3.6vmin , 15px);line-height: 1.65em;}



[table-header]{
    display: flex;flex-flow:column nowrap;justify-content: center; align-items:center;
    background:var(--text-color);
    color: var(--bg);
    font-size: min(3.8vmin , 15px);
    line-height: 2em;
    margin: 1em 0;
}



[separate]{
    display: flex;flex-flow:row nowrap;justify-content: space-between;align-items: stretch;
}

/* limited view */
[limited-view]{
    border-bottom: 1px solid #FFF;
    margin-bottom: 0.5em;
}

[limited-view] span{
    font-size: 14px;
    display: flex;flex-flow:row nowrap;justify-content: center; align-items:center;
}
[limited-view] span[limited-header]{
    border: 1px solid var(--text-color);
    padding: 0.3em 0.5em;
    border-radius: 0.4em;
}















[caption-text]{
    font-size: min(2.8vmin , 12px);
    color: var(--text-color);
    margin-top: 0.4em;
    text-indent: -0.5em;
    padding-left: 1.5em !important;
    text-align: justify;
    padding-right: 0.5em;
}
[caption-text]::before{
    content : "\0274b";
    color: var(--text-color);
    display: inline-block;
    margin-right: 0.2em;
}

[text-indent]{
    margin-top: 0.4em;
    text-indent: -0.6em;
    padding-left: 1.5em;
}
[text-indent]::before{
    content : "\0274b";
    color: var(--text-color);
    display: inline-block;
    margin-right: 0.4em;
}

[back-config]{margin:0 auto 3em auto;width: 60%;display: flex;flex-flow:row nowrap;justify-content: center;align-items: stretch;border: 1px solid var(--text-color);padding: 0.4em;color:var(--text-color);}
[back-config]:active,[back-config]:focus{
    background: #FFF;
    color: var(--bg);
    z-index: 99;}



.el-dialog__close.el-icon.el-icon-close{
    color: #5e6d82 !important;
}
.el-drawer.btt{height: auto !important;min-height: 20vh;z-index: 9999;position: absolute;}
.v-modal{z-index: -1 !important;}
.el-drawer.btt,#el-drawer__title{border-radius:0.7em 0.7em 0 0;}
#el-drawer__title{margin-bottom: 0;padding-bottom:10px;}
.el-drawer__body{min-height: 20vh;}




[cartbtn-split]{display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:center;width: 100%;padding: 0.5em;margin-top: 0.5em;}


[cart-btn]{
    border: 1px solid #FFF;
    color: #FFF;
    font-size: 13px;padding: 0.2em;border-radius: 6px;transition: all 0.4s ease;
    width: 100%;margin: 0 0.4em;display: flex; flex-flow:row nowrap;justify-content: center;align-items:center;
}
[cart-btn]:active{
    color: var(--bg);
    background: #FFF;
    transition: all 0.1s ease;
}

[btn-mini]{border: 1px solid var(--main-color);color: var(--main-color);font-size: 13px;padding: 0.2em;border-radius: 6px;transition: all 0.4s ease;
    margin: 0 0.4em;display: inline-flex; flex-flow:row nowrap;justify-content: center;align-items:center;
}
[btn-mini]:active{color: #FFF;background: var(--main-color);transition: all 0.1s ease;}







[btn-default]{
    border: 1px solid var(--text-color);
    color: var(--text-color);
    font-size: 14px;
    background: var(--bg);
    transition: all 0.1s ease;
    padding: 0.4em;border-radius: 6px;transition: all 0.4s ease;
    width: 100%;margin: 0;display: flex; flex-flow:row nowrap;justify-content: center;align-items:center;
}
[btn-default]:active{
    color : var(--bg);
    background: var(--text-color);
    transition: all 0.1s ease;}

[btn-white]{
    border: 1px solid var(--text-color);
    color: var(--bg) !important;
    background:var(--text-color) !important;
    font-size: 14px;padding: 0.4em;border-radius: 6px;transition: all 0.4s ease;
    width: 100%;display: flex; flex-flow:row nowrap;justify-content: center;align-items:center;background: #FFF;
}
[btn-white]:active{
    color: var(--text-color) !important;
    background: var(--bg) !important;
    transition: all 0.1s ease;}

[btn-split]{display: flex; flex-flow:row nowrap;justify-content: space-between;align-items:center;}
[btn-split] > *{width: 49%;}





/* input form */
[input-address]{padding-top: 1em;padding-bottom: 1em;}
[input-address] .el-collapse{border-top: none;}
[input-address] .el-collapse-item__header{padding-left: 0.3em;height: 30px;font-size: 16px;}

[input-address] .el-collapse-item__content{padding-top: 1em;}

[input-conponent]{padding:0.5em 0;}
[conponent-split]{
    display: flex; flex-flow:row nowrap;justify-content: flex-start;align-items:center;}
[conponent-split] > *{width: 100%;}
[page-content] [conponent-split][input-conponent] label{
    color: var(--text-color);width: 100%;display: flex; flex-flow:row nowrap;justify-content: flex-start; align-items: center;}
[conponent-split] label{
    max-width: 9em;
    width: 9em;font-size:min(3.4vmin , 13px);
    color:var(--text-color);
    min-width:9em;
}
[input-conponent] input,
[input-conponent] select,
[input-conponent] textarea,
[input-conponent] input:disabled{
    font-size: 16px;
    width: 100%;
    border: 1px solid var(--text-color);
    background: var(--bg);
    -webkit-text-fill-color: var(--text-color);
    color: var(--text-color);
    padding: 0.5em;
    border-radius: 3px;

}
[input-conponent] input::placeholder,
[input-conponent] input::-webkit-input-placeholder{
    color: var(--text-color);
    -webkit-text-fill-color: var(--text-color);
    opacity:0.2;
}



.el-message-box__btns .el-button--primary span{color:#FFF !important;}

/* ページ遷移アニメーション */
.page-enter, .page-leave-to{ opacity: 0; }
.page-enter-active, .page-leave-active{ transition: opacity .3s;}
.layout-enter, .layout-leave-active{opacity: 0;}
.layout-enter-active, .layout-leave-active{ transition: opacity .3s;}
</style> -->
