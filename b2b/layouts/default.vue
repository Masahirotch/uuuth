<template>
  <div ontouchstart=””>
    <Nuxt />
  </div>
</template>
<style>
/* *::-webkit-scrollbar,div::-webkit-scrollbar {display: none;-webkit-appearance: none;scrollbar-width: none;}
*{ */
    /*font-family: "Helvetica Neue",Helvetica,Arial,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;*/
    /* font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', '游ゴシック Medium', meiryo, sans-serif;
    font-style: normal;
}
abbr,address,article,aside,audio,b,blockquote,body,canvas,caption,cite,code,dd,del,details,dfn,div,dl,dt,em,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,p,pre,q,samp,section,small,span,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,ul,var,video{margin:0;padding:0;border:0;outline:0;font-size:100%;vertical-align:baseline;background:0 0}body{line-height:inherit !important;}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}nav ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}a{margin:0;padding:0;font-size:100%;vertical-align:baseline;background:0 0}ins{background-color:#ff9;color:#000;text-decoration:none}mark{background-color:#ff9;color:#000;font-style:italic;font-weight:700}del{text-decoration:line-through}abbr[title],dfn[title]{border-bottom:1px dotted;cursor:help}table{border-collapse:collapse;border-spacing:0}hr{display:block;height:1px;border:0;border-top:1px solid #ccc;margin:1em 0;padding:0}button,input,select,textarea{margin:0;padding:0;background:0 0;border:none;border-radius:0;outline:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;vertical-align:middle}select::-ms-expand{display:none}*,::after,::before{box-sizing:border-box;margin:0}div,h1,h2,h3,h4,h5,h6,p,dl,dt,dd{color:#444;}
a,a:hover,a:focus{text-decoration: none;}
*:not(input,textarea){user-select: none;}
div, h1, h2, h3, h4, h5, h6, p, dl, dt, dd, span{color:#5e6d82;} */

/* ページ遷移アニメーション */
/* .page-enter, .page-leave-to{ opacity: 0; }
.page-enter-active, .page-leave-active{ transition: opacity .3s;}
.layout-enter, .layout-leave-active{opacity: 0;}
.layout-enter-active, .layout-leave-active{ transition: opacity .3s;} */

/* init */
/* *{
    --line:#00B900;
	--main-color : rgb(96, 47, 1);
    --text-color   : rgb(96, 47, 1);
    --main-light : rgb(135, 78, 0);
    --bg         : rgb(255, 255, 255);
    --bg-light   : rgb(247, 247, 247);
    
    


}

body{
	background-color:var(--bg); */
	/* iPhoneのセーフエリアを確保  */
	/* padding-bottom: env(safe-area-inset-bottom);
} */

/* helper */
[mt-05]{margin-top:.5em}[mt-1]{margin-top:1em}[mt-2]{margin-top:2em}[mt-3]{margin-top:3em}[mt-4]{margin-top:4em}[mt-5]{margin-top:5em}[ml-05]{margin-left:.5em}[ml-1]{margin-left:1em}[ml-2]{margin-left:2em}[ml-3]{margin-left:3em}[ml-4]{margin-left:4em}[ml-5]{margin-left:5em}[mb-05]{margin-bottom:.5em}[mb-1]{margin-bottom:1em}[mb-2]{margin-bottom:2em}[mb-3]{margin-bottom:3em}[mb-4]{margin-bottom:4em}[mb-5]{margin-bottom:5em}[mr-05]{margin-right:.5em}[mr-1]{margin-right:1em}[mr-2]{margin-right:2em}[mr-3]{margin-right:3em}[mr-4]{margin-right:4em}[mr-5]{margin-right:5em}[mt-05i]{margin-top:.5em!important}[mt-1i]{margin-top:1em!important}[mt-2i]{margin-top:2em!important}[mt-3i]{margin-top:3em!important}[mt-4i]{margin-top:4em!important}[mt-5i]{margin-top:5em!important}[ml-05i]{margin-left:.5em!important}[ml-1i]{margin-left:1em!important}[ml-2i]{margin-left:2em!important}[ml-3i]{margin-left:3em!important}[ml-4i]{margin-left:4em!important}[ml-5i]{margin-left:5em!important}[mb-05i]{margin-bottom:.5em!important}[mb-1i]{margin-bottom:1em!important}[mb-2i]{margin-bottom:2em!important}[mb-3i]{margin-bottom:3em!important}[mb-4i]{margin-bottom:4em!important}[mb-5i]{margin-bottom:5em!important}[mr-05i]{margin-right:.5em!important}[mr-1i]{margin-right:1em!important}[mr-2i]{margin-right:2em!important}[mr-3i]{margin-right:3em!important}[mr-4i]{margin-right:4em!important}[mr-5i]{margin-right:5em!important}
[pt-05]{padding-top:.5em}[pt-1]{padding-top:1em}[pt-2]{padding-top:2em}[pt-3]{padding-top:3em}[pt-4]{padding-top:4em}[pt-5]{padding-top:5em}[pl-05]{padding-left:.5em}[pl-1]{padding-left:1em}[pl-2]{padding-left:2em}[pl-3]{padding-left:3em}[pl-4]{padding-left:4em}[pl-5]{padding-left:5em}[pb-05]{padding-bottom:.5em}[pb-1]{padding-bottom:1em}[pb-2]{padding-bottom:2em}[pb-3]{padding-bottom:3em}[pb-4]{padding-bottom:4em}[pb-5]{padding-bottom:5em}[pr-05]{padding-right:.5em}[pr-1]{padding-right:1em}[pr-2]{padding-right:2em}[pr-3]{padding-right:3em}[pr-4]{padding-right:4em}[pr-5]{padding-right:5em}[pt-05i]{padding-top:.5em!important}[pt-1i]{padding-top:1em!important}[pt-2i]{padding-top:2em!important}[pt-3i]{padding-top:3em!important}[pt-4i]{padding-top:4em!important}[pt-5i]{padding-top:5em!important}[pl-05i]{padding-left:.5em!important}[pl-1i]{padding-left:1em!important}[pl-2i]{padding-left:2em!important}[pl-3i]{padding-left:3em!important}[pl-4i]{padding-left:4em!important}[pl-5i]{padding-left:5em!important}[pb-05i]{padding-bottom:.5em!important}[pb-1i]{padding-bottom:1em!important}[pb-2i]{padding-bottom:2em!important}[pb-3i]{padding-bottom:3em!important}[pb-4i]{padding-bottom:4em!important}[pb-5i]{padding-bottom:5em!important}[pr-05i]{padding-right:.5em!important}[pr-1i]{padding-right:1em!important}[pr-2i]{padding-right:2em!important}[pr-3i]{padding-right:3em!important}[pr-4i]{padding-right:4em!important}[pr-5i]{padding-right:5em!important}[nobr]{display:inline-block !important;}
[no-margin]{margin:0;}
#__layout{max-width:500px;background:transparent;min-height:100vh;margin:0 auto;overflow-x:hidden;overflow-y:hidden;width:100%;min-height: -webkit-fill-available;overflow: hidden;}
#__layout > *,
#__layout > * > *{min-height:100vh;width:100%;min-height: -webkit-fill-available;}


/*****************************************************
 Helper Layout
*****************************************************/
[main-color]{
    color: var(--main-color);
}
[center]{
    display: flex;flex-flow: row nowrap;justify-content: center;align-items: center;
}
[col-center]{
    display: flex;flex-flow: column nowrap;justify-content: center;align-items: center;
}

[red]{color:#f56c6c;}

.el-message-box{
    width: 95vw !important;
    max-width: 420px !important;
}

.el-button--primary:not(.is-plain) span,
.el-button--success:not(.is-plain) span,
.el-button--info:not(.is-plain) span,
.el-button--warning:not(.is-plain) span,
.el-button--danger:not(.is-plain) span{
    color: #FFF !important;
}




/*****************************************************
app header
*****************************************************/
[app-header]{
    background: url('/header.jpg') 50% 50% no-repeat;
    height: 20vh;
    width: 100%;
    background-size: cover;
    background-attachment: local,scroll;
    display: flex;flex-flow: row nowrap;justify-content: flex-start;align-items: center;
    padding-left: 2em;
    color: #fff;
}
    [app-header] h1{
        font-weight: 100 !important;
        font-size: 30px;
        color: #fff;
        letter-spacing: .1em;
        filter: drop-shadow(0 0 4px rgba(0,0,0,.6));
    }


[search-box]{
    padding: 0.5em;
}
    [search-box] > div{
        display: flex;flex-flow: row nowrap;justify-content: flex-start;align-items: center;
    }
    [search-box] > div i{
        margin-right: 0.4em;
    }

    [search-box] > div input{
        color: #666;
        font-size: 16px;
        padding: 0.3em 0.3em 0.3em 0.6em;
    }







/****************** App Footer ******************/

[app-body]{
    padding-bottom: 5em !important;
}


[app-footer]{
    position: fixed;
    z-index: 9;
    display: flex; flex-flow:row wrap; justify-content: space-between;align-items: stretch;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 0;
    bottom: 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    background: rgba(255,255,255,0.97);
    filter: drop-shadow(2px 4px 6px rgba(128,128,128,0.5));
}
    [app-footer] [footer-inner]{
        display: flex; flex-flow:row nowrap; justify-content: space-between;align-items: stretch;
        width: 100%;
        padding: 0 1em;
        color: #FFF;
        font-size: 24px;
    }

    [app-footer] [footer-inner] > div{
        display: flex; flex-flow:column nowrap; justify-content: flex-start;align-items: center;

    }

    [app-footer] [footer-inner] > div:active{
        background: rgba(96, 47, 1, 0.4);
    }

        [app-footer] [footer-inner] i{
            padding:0.6em 1em 0.1em 1em;
            color: var(--main-color);
            position: relative;
        }
        [app-footer] [footer-inner] i:hover,[app-footer] [footer-inner] i:active{
          background: transparent;
        }

        [app-footer] [footer-inner] i + span{
            font-size: min(2.4em , 9px);
            width: 100%;
            display: inline-flex; flex-flow:row nowrap; justify-content: center;align-items: center;
            color: var(--main-color);
            padding-bottom: 0.6em;
        }

        [cart-badge]{
            position: absolute;
            top: 0.7em;
            right: 0.8em;
            font-size: 12px;
            background: #23a273;
            padding: 0.3em 0.6em;
            border-radius: 1em;
            color: #FFF;
            border: 1px solid #FFF;
            transition: all 0.2s ease-in-out;
        }


/*****************************************************
 Product
*****************************************************/
[product-box]{
    width: 100%;
    padding: 0.7em 0.5em;
    display: flex; flex-flow:column nowrap; justify-content: flex-start;
    border-bottom: 1px solid #ccc;

}

    [product-box] [detail-box]{
        display: flex; flex-flow:row nowrap; justify-content: flex-start;align-items: stretch;
        margin-bottom: 0.3em;
    }

        [product-box] [detail-box] > div:nth-of-type(1){
            width: 60px;
            max-width: 60px;
        }
        [product-box] [detail-box] > div:nth-of-type(1) img{
            width: 100%;
            max-width: 60px;
            border: 1px solid #ccc;
            border-radius: 10px;
        }


        [product-box] [detail-box] > div:nth-of-type(2){
            padding: 0.1em 0.3em;
            width: 100%;
        }

        [product-box] [detail-box] [product-name]{
            position: relative;
            padding-right: 0;
            font-size: min(3.4vmin,14px);
            color: #000;
            line-height: 1.1em;
            font-weight: bold;
        }


        [product-box] [detail-box] [product-name] [favorite-icon]{
            position: absolute;
            right: 0;
            top: 0.2em;
        }

        [product-box] [detail-box] [product-origin]{
            display: block;
            font-size: min(3.1vmin,12px);
            color: #454545;
            margin-top: 0.2em;
            font-weight: normal;
        }

        [product-box] [detail-box] [product-price]{
            font-size: min(3.1vmin,12px);
            color: #000;
            margin-top: 0.2em;
            font-weight: 600;
        }


    [product-box] [button-box]{
        display: flex; flex-flow:row nowrap; justify-content: center;align-items: stretch;
    }

    [product-box] [button-box] > div{
        width: 100%;
        border-radius: 3px;
        padding-top: 0.2em;
        padding-bottom: 0.2em;
        font-size: min(3.4vmin,14px);
        display: flex; flex-flow:row nowrap; justify-content: center;align-items: center;
    }

    [product-box] [button-box] > div[calc-button]{
        border: 1px solid #d7dadd;
        background: #fafafa;
        color: #627488;
    }
    [product-box] [button-box] > div[calc-button]:active{
        background: #e5e5e5;
    }
    [product-box] [button-box] > div[cart-button]{
        margin: 0 0.5em;
        background: #3b4043;
        color: #fff;
        padding-right: 1em;
        padding-left: 1em;
        min-width: 30%;
    }
    [product-box] [button-box] > div[cart-button]:active{
        background: #7f8a91;
    }

    [product-box] [button-box] > div[cart-button][cartin-lock]{
        margin: 0 0.5em;
        background: #ccc;
        color: #fff;
        padding-right: 1em;
        padding-left: 1em;
        min-width: 30%;
    }

    [popup-product] .el-dialog{
        padding: 1em;
        max-width: 300px;
        background: #fff;
        border-radius: 12px;
        position: relative;
    }
    [popup-product] .el-dialog img{
        width: 100%;
    }
    .el-dialog__wrapper{
        display: flex; flex-flow:column nowrap; justify-content: center;align-items: center;
    }
    .el-dialog__wrapper > div{
        margin-top: unset !important;
    }

    [popup-product] .el-dialog__body{
        display: flex; flex-flow:column nowrap; justify-content: center;align-items: center;
        padding: 10px 20px;
    }

    [popup-product] .el-dialog__body span[name-view]{
        text-align: center;
        line-height: 1.6em;
        display: flex;justify-content: center;align-items: center;
        font-size: min( 3.8vmin , 15px );
        font-weight: 600;
        color: #545454;  
    }
    [popup-product] .el-dialog__body span[price-view]{
        text-align: center;
        line-height: 1.6em;
        display: flex;justify-content: center;align-items: center;
        font-size: min( 3.6vmin , 14px );
        font-weight: 600;
        color: #545454;  
    }





/*****************************************************
 cart page
*****************************************************/

[order-memo]{
    border: 1px solid rgba(60,60,60,.26);
    border-radius: 4px;
    width: 100%;
    max-width: 100%;
    padding: 0.3em;
    min-height: 6.2em;
    font-size: 16px;
    line-height: 1.4em;
}

label[caption-text]{
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5em;
}


[cart-total]{
    display: flex; flex-flow:column nowrap; justify-content: center;align-items: center;
    padding: 1em 0.5em;
}

    [cart-total] span{
        font-weight: 600;
        font-size: 15px;
    }


[deliv-select]{
    padding: 1em 3em;
    display: flex; flex-flow:column nowrap; justify-content: flex-start;align-items: center;
}

    [deliv-select] label{
        width: 100%;
    }

    [deliv-select] select{
        color: #333;
        border: 1px solid rgba(60,60,60,.26);
        border-radius: 4px;
        width: 100%;
        max-width: 100%;
        padding: 0.3em 0.6em;
        font-size: 16px;
        line-height: 1.4em;
    }

[order-button]{
    width: 100%;
    padding: 0.6em 1em;
    background: #007ec7;
    color: #fff;
    border-radius: 6px;
    font-size: 16px;    
}

[order-button]:active{
    background: #044b74;   
}


[add-mylist]{
    margin-top: 3em;
    margin-bottom: 5em;
    background: #efefef;
    padding: 1em 1em 2em 1em;
}
    [add-mylist] label{
        display: flex; flex-flow:column nowrap; justify-content: flex-start;align-items: center;
        width: 100%;
        line-height: 1.8em;
        color: #666;
        font-size: 14px;
        font-weight: 600;
    }
    [add-mylist] p{
        color: #666;
        font-size: 12px;
        margin-bottom: 1em;
    }

    [add-mylist] input{
        border: 1px solid rgba(60,60,60,.26);
        border-radius: 4px;
        width: 100%;
        max-width: 100%;
        padding: 0.3em;
        font-size: 16px;
        line-height: 1.4em;
        background: #FFF;
    }

    [add-mylist] [in-listbtn]{
        width: 100%;
        padding: 0.6em 1em;
        background: #495054;
        color: #fff;
        border-radius: 6px;
        font-size: 14px;
        margin-top: 1em;
        display: flex; flex-flow:column nowrap; justify-content: flex-start;align-items: center;
    }

    [add-mylist] [in-listbtn]:active{
        background: #69747a;
    }







/*****************************************************
 Histories
*****************************************************/
.el-card.box-card{
    margin-bottom: 1em;
}


[history-card]{
    display: flex; flex-flow:column nowrap; justify-content: flex-start;align-items: center;
}

    [history-card] dl{
        display: flex; flex-flow:row nowrap; justify-content: flex-start;align-items: center;
        width: 100%;
        border-bottom: 1px solid #efefef;
        padding: 0.3em 0;
    }

        [history-card] dl dt{
            width: 6em;
            min-width: 6em;
            color: #4d4d4d;
            font-size: 13px;
            padding: 0.2em 0;
        }
        [history-card] dl dd{
            color: #4d4d4d;
            line-height: 1.3em;
            font-size: 13px;
            padding: 0.2em 0;
        }

    /* dialog */
    [history-detail] .el-dialog__header{
        padding: 10px 20px;
    }
    [history-detail] .el-dialog__title{
        margin-top: 0;
        color: #077945;
        text-align: left;
        font-size: 14px;
        font-weight: 600;
    }



    [history-detail] .el-dialog__body{
        padding : 0 1em;
    }

    [history-detail] .el-dialog__footer{
        padding: 20px;
    }

        [history-detail] .el-dialog__footer .dialog-footer{
            display: flex; flex-flow:row nowrap; justify-content: space-between;align-items: center;
        }

        [history-detail] [order-items]{
            border-top: 1px solid #efefef;
            margin-top: 0.5em;
        }

            [history-detail] [order-items] ul{
                border-bottom: 1px solid #efefef;
            }
                [history-detail] [order-items] ul li{
                    list-style-type: none;
                    display: flex; flex-flow:row nowrap; justify-content: space-between;align-items: center;
                    font-size: min(3.2vmin,13px);
                    color: #333;
                    font-weight: 600;
                    line-height: 1.8em;
                    margin: 0.4em 0;
                }


            [history-detail] [order-items] [item-total]{
                font-weight: 600;
                padding-top: 0.3em;
                font-size: 14px;
                color: #000;
                display: flex; flex-flow:row nowrap; justify-content: flex-end;align-items: center;
            }



/*****************************************************
 Loading spinner
*****************************************************/
[fullscreenloading]{left:0;top:0;position:fixed;width:100vw;height:100vh;background:rgba(255,255,255,.8);z-index:999;display:flex;flex-flow:column nowrap;justify-content:center;align-items:center}
[fullscreenloading] span{margin-bottom:1em}
[fullscreenloading] i{font-size:2em}
[loading-text]{font-weight: 600;color:#F3971D; }


.breeding-rhombus-spinner {
      height: 65px;
      width: 65px;
      position: relative;
      transform: rotate(45deg);
    }

    .breeding-rhombus-spinner, .breeding-rhombus-spinner * {
      box-sizing: border-box;
    }

    .breeding-rhombus-spinner .rhombus {
      height: calc(65px / 7.5);
      width: calc(65px / 7.5);
      animation-duration: 2000ms;
      top: calc(65px / 2.3077);
      left: calc(65px / 2.3077);
      background-color: #F3971D;
      position: absolute;
      animation-iteration-count: infinite;
    }

    .breeding-rhombus-spinner .rhombus:nth-child(2n+0) {
       margin-right: 0;
     }

    .breeding-rhombus-spinner .rhombus.child-1 {
      animation-name: breeding-rhombus-spinner-animation-child-1;
      animation-delay: calc(100ms * 1);
    }

    .breeding-rhombus-spinner .rhombus.child-2 {
      animation-name: breeding-rhombus-spinner-animation-child-2;
      animation-delay: calc(100ms * 2);
    }

    .breeding-rhombus-spinner .rhombus.child-3 {
      animation-name: breeding-rhombus-spinner-animation-child-3;
      animation-delay: calc(100ms * 3);
    }

    .breeding-rhombus-spinner .rhombus.child-4 {
      animation-name: breeding-rhombus-spinner-animation-child-4;
      animation-delay: calc(100ms * 4);
    }

    .breeding-rhombus-spinner .rhombus.child-5 {
      animation-name: breeding-rhombus-spinner-animation-child-5;
      animation-delay: calc(100ms * 5);
    }

    .breeding-rhombus-spinner .rhombus.child-6 {
      animation-name: breeding-rhombus-spinner-animation-child-6;
      animation-delay: calc(100ms * 6);
    }

    .breeding-rhombus-spinner .rhombus.child-7 {
      animation-name: breeding-rhombus-spinner-animation-child-7;
      animation-delay: calc(100ms * 7);
    }

    .breeding-rhombus-spinner .rhombus.child-8 {
      animation-name: breeding-rhombus-spinner-animation-child-8;
      animation-delay: calc(100ms * 8);
    }

    .breeding-rhombus-spinner .rhombus.big {
      height: calc(65px / 3);
      width: calc(65px / 3);
      animation-duration: 2000ms;
      top: calc(65px / 3);
      left: calc(65px / 3);
      background-color: #F3971D;
      animation: breeding-rhombus-spinner-animation-child-big 2s infinite;
      animation-delay: 0.5s;
    }


    @keyframes breeding-rhombus-spinner-animation-child-1 {
      50% {
        transform: translate(-325%, -325%);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-2 {
      50% {
        transform: translate(0, -325%);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-3 {
      50% {
        transform: translate(325%, -325%);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-4 {
      50% {
        transform: translate(325%, 0);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-5 {
      50% {
        transform: translate(325%, 325%);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-6 {
      50% {
        transform: translate(0, 325%);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-7 {
      50% {
        transform: translate(-325%, 325%);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-8 {
      50% {
        transform: translate(-325%, 0);
      }
    }

    @keyframes breeding-rhombus-spinner-animation-child-big {
      50% {
        transform: scale(0.5);
      }
    }
</style>
