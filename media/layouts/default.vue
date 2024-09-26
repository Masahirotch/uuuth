<template>
    <Nuxt ontouchstart="" />
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {

        }
    },
    created(){

        console.clear()

    },
    mounted(){

    },
    computed: {

        ...mapGetters( 'user'    ,[ 'userProfile' , 'userConfig' , 'history' ]),
        ...mapGetters( 'config'  ,[ 'appConfig' , 'article_id' , 'app_code' ]),
        ...mapGetters( 'article' ,[ 'article' , 'articles' ]),
        ...mapGetters( 'cart'    ,[ 'cart' ]),
    },
    methods:{
        ...mapActions( 'user'    ,[ 'setUserProfile' , 'setUserConfig' , 'setHistory' ]),
        ...mapActions( 'config'  ,[ 'setAppConfig' , 'set_article_id' , 'set_app_code' ]),
        ...mapActions( 'article' ,[ 'setArticle' , 'setArticles'  ]),
        ...mapActions( 'cart'    ,[ 'setCart' ]),


    },
};
</script>
<style>
*::-webkit-scrollbar,div::-webkit-scrollbar {display: none;-webkit-appearance: none;scrollbar-width: none;}
*{font-family: "Helvetica Neue",Helvetica,Arial,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;}
abbr,address,article,aside,audio,b,blockquote,body,canvas,caption,cite,code,dd,del,details,dfn,div,dl,dt,em,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,p,pre,q,samp,section,small,span,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,ul,var,video{margin:0;padding:0;border:0;outline:0;font-size:100%;vertical-align:baseline;background:0 0}body{line-height:inherit !important;}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}nav ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}a{margin:0;padding:0;font-size:100%;vertical-align:baseline;background:0 0}ins{background-color:#ff9;color:#000;text-decoration:none}mark{background-color:#ff9;color:#000;font-style:italic;font-weight:700}del{text-decoration:line-through}abbr[title],dfn[title]{border-bottom:1px dotted;cursor:help}table{border-collapse:collapse;border-spacing:0}hr{display:block;height:1px;border:0;border-top:1px solid #ccc;margin:1em 0;padding:0}button,input,select,textarea{margin:0;padding:0;background:0 0;border:none;border-radius:0;outline:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;vertical-align:middle}select::-ms-expand{display:none}*,::after,::before{box-sizing:border-box;margin:0}div,h1,h2,h3,h4,h5,h6,p,dl,dt,dd{color:#444;}
a,a:hover,a:focus{text-decoration: none;}
*:not(input,textarea){user-select: none;}
div, h1, h2, h3, h4, h5, h6, p, dl, dt, dd, span{color:#5e6d82;}

/* init */
*{
	--line:#00B900;
	--main-color : rgb(96, 47, 1);
    text-color   : rgb(96, 47, 1);
    --main-light : rgb(135, 78, 0);
    --bg         : rgb(255, 255, 255);
    --bg-light   : rgb(247, 247, 247);
}
body{
	background-color:var(--bg);
	/* iPhoneのセーフエリアを確保  */
	padding-bottom: env(safe-area-inset-bottom);
}




/* helper */
[mt-05]{margin-top:.5em}[mt-1]{margin-top:1em}[mt-2]{margin-top:2em}[mt-3]{margin-top:3em}[mt-4]{margin-top:4em}[mt-5]{margin-top:5em}[ml-05]{margin-left:.5em}[ml-1]{margin-left:1em}[ml-2]{margin-left:2em}[ml-3]{margin-left:3em}[ml-4]{margin-left:4em}[ml-5]{margin-left:5em}[mb-05]{margin-bottom:.5em}[mb-1]{margin-bottom:1em}[mb-2]{margin-bottom:2em}[mb-3]{margin-bottom:3em}[mb-4]{margin-bottom:4em}[mb-5]{margin-bottom:5em}[mr-05]{margin-right:.5em}[mr-1]{margin-right:1em}[mr-2]{margin-right:2em}[mr-3]{margin-right:3em}[mr-4]{margin-right:4em}[mr-5]{margin-right:5em}[mt-05i]{margin-top:.5em!important}[mt-1i]{margin-top:1em!important}[mt-2i]{margin-top:2em!important}[mt-3i]{margin-top:3em!important}[mt-4i]{margin-top:4em!important}[mt-5i]{margin-top:5em!important}[ml-05i]{margin-left:.5em!important}[ml-1i]{margin-left:1em!important}[ml-2i]{margin-left:2em!important}[ml-3i]{margin-left:3em!important}[ml-4i]{margin-left:4em!important}[ml-5i]{margin-left:5em!important}[mb-05i]{margin-bottom:.5em!important}[mb-1i]{margin-bottom:1em!important}[mb-2i]{margin-bottom:2em!important}[mb-3i]{margin-bottom:3em!important}[mb-4i]{margin-bottom:4em!important}[mb-5i]{margin-bottom:5em!important}[mr-05i]{margin-right:.5em!important}[mr-1i]{margin-right:1em!important}[mr-2i]{margin-right:2em!important}[mr-3i]{margin-right:3em!important}[mr-4i]{margin-right:4em!important}[mr-5i]{margin-right:5em!important}
[pt-05]{padding-top:.5em}[pt-1]{padding-top:1em}[pt-2]{padding-top:2em}[pt-3]{padding-top:3em}[pt-4]{padding-top:4em}[pt-5]{padding-top:5em}[pl-05]{padding-left:.5em}[pl-1]{padding-left:1em}[pl-2]{padding-left:2em}[pl-3]{padding-left:3em}[pl-4]{padding-left:4em}[pl-5]{padding-left:5em}[pb-05]{padding-bottom:.5em}[pb-1]{padding-bottom:1em}[pb-2]{padding-bottom:2em}[pb-3]{padding-bottom:3em}[pb-4]{padding-bottom:4em}[pb-5]{padding-bottom:5em}[pr-05]{padding-right:.5em}[pr-1]{padding-right:1em}[pr-2]{padding-right:2em}[pr-3]{padding-right:3em}[pr-4]{padding-right:4em}[pr-5]{padding-right:5em}[pt-05i]{padding-top:.5em!important}[pt-1i]{padding-top:1em!important}[pt-2i]{padding-top:2em!important}[pt-3i]{padding-top:3em!important}[pt-4i]{padding-top:4em!important}[pt-5i]{padding-top:5em!important}[pl-05i]{padding-left:.5em!important}[pl-1i]{padding-left:1em!important}[pl-2i]{padding-left:2em!important}[pl-3i]{padding-left:3em!important}[pl-4i]{padding-left:4em!important}[pl-5i]{padding-left:5em!important}[pb-05i]{padding-bottom:.5em!important}[pb-1i]{padding-bottom:1em!important}[pb-2i]{padding-bottom:2em!important}[pb-3i]{padding-bottom:3em!important}[pb-4i]{padding-bottom:4em!important}[pb-5i]{padding-bottom:5em!important}[pr-05i]{padding-right:.5em!important}[pr-1i]{padding-right:1em!important}[pr-2i]{padding-right:2em!important}[pr-3i]{padding-right:3em!important}[pr-4i]{padding-right:4em!important}[pr-5i]{padding-right:5em!important}[nobr]{display:inline-block !important;}

[no-margin]{margin:0;}

/* LINE BUTTON **************************************************************************
<div linebtn>
    <div linebtn-overlay>LINE</div>        
</div>
****************************************************************************************/
root,*{
    --line         : #06C755;
    --linehover    : rgba(0,0,0,0.1);
    --lineclick    : rgba(0,0,0,0.3);
    --line-invalid : rgba(30,30,30,0.2); 
}
[linebtn]{ background:var(--line);border-radius:0.3em;}
[linebtn][btn-invalid]{background:var(--line-invalid);}
[linebtn] [linebtn-overlay]{
    font-size:16px;
    color:#FFF;padding:0.5em 1em;border-radius:0.3em;letter-spacing:0.05em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
[linebtn] [linebtn-overlay]::before{content:"";width:1em;height:1em;display:inline-block;margin-right:0.4em;
background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDEuMTMgOTYuMzYiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48ZyBpZD0i44Os44Kk44Ok44O8XzIiIGRhdGEtbmFtZT0i44Os44Kk44Ok44O8IDIiPjxnIGlkPSLjg6zjgqTjg6Tjg7xfMS0yIiBkYXRhLW5hbWU9IuODrOOCpOODpOODvCAxIj48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik01MC41NiwwQzIyLjY4LDAsMCwxOC40MSwwLDQxLDAsNjEuMzMsMTgsNzguMzEsNDIuMjgsODEuNTJjMS42NS4zNiwzLjg5LDEuMDksNC40NiwyLjVhMTAuMjIsMTAuMjIsMCwwLDEsLjE2LDQuNTdzLS41OSwzLjU2LS43Miw0LjMyYy0uMjEsMS4yOC0xLDUsNC4zOCwyLjczUzc5LjY4LDc4LjQ5LDkwLjI5LDY2LjI4YzcuMzMtOCwxMC44NC0xNi4xOCwxMC44NC0yNS4yNEMxMDEuMTMsMTguNDEsNzguNDUsMCw1MC41NiwwWk0zMi43Myw1My4xMmExLDEsMCwwLDEtMSwxSDE3LjU2YTEsMSwwLDAsMS0uNjctLjI3aDBzMCwwLDAsMGExLDEsMCwwLDEtLjI4LS42OHYtMjJhMSwxLDAsMCwxLDEtMWgzLjU1YTEsMSwwLDAsMSwxLDF2MTcuNWg5LjY0YTEsMSwwLDAsMSwxLDFabTguNTQsMGExLDEsMCwwLDEtMSwxSDM2Ljc0YTEsMSwwLDAsMS0xLTF2LTIyYTEsMSwwLDAsMSwxLTFoMy41NWExLDEsMCwwLDEsMSwxWm0yNC40MiwwYTEsMSwwLDAsMS0xLDFINjEuMTVhMS4wOSwxLjA5LDAsMCwxLS4yNSwwaDBsLS4wNywwaDBsMCwwLS4wNSwwLDAsMC0uMDcsMGgwYTEuMTgsMS4xOCwwLDAsMS0uMjYtLjI0TDUwLjI0LDQwVjUzLjEyYTEsMSwwLDAsMS0xLDFINDUuN2ExLDEsMCwwLDEtMS0xdi0yMmExLDEsMCwwLDEsMS0xaDMuODNsMCwwaDBsLjA2LDBoMGwwLDAsMCwwLDAsMGgwbDAsLjA1czAsMCwwLDBsLjA2LjA2aDBsLjA5LjFMNjAuMTcsNDQuMThWMzEuMDlhMSwxLDAsMCwxLDEtMUg2NC43YTEsMSwwLDAsMSwxLDFaTTg1LjI3LDM0LjY0YTEsMSwwLDAsMS0xLDFINzQuNjV2My43Mmg5LjY0YTEsMSwwLDAsMSwxLDF2My41NGExLDEsMCwwLDEtMSwxSDc0LjY1djMuNzJoOS42NGExLDEsMCwwLDEsMSwxdjMuNTVhMSwxLDAsMCwxLTEsMUg3MC4xMWExLDEsMCwwLDEtLjY3LS4yN2gwdjBhMSwxLDAsMCwxLS4yOC0uNjh2LTIyYS45NC45NCwwLDAsMSwuMjgtLjY4czAsMCwwLDAsMCwwLDAsMGExLDEsMCwwLDEsLjY4LS4yN0g4NC4yOWExLDEsMCwwLDEsMSwxWiIvPjwvZz48L2c+PC9zdmc+");
background-repeat:no-repeat;
background-position:50% 50%;
}
[linebtn]:hover,[linebtn]:active{cursor:pointer;}
[linebtn]:hover  [linebtn-overlay]{ background: var(--linehover); color:#FFF;}
[linebtn]:active [linebtn-overlay]{ background: var(--lineclick); color:#FFF;}
[linebtn][btn-invalid]:hover,
[linebtn][btn-invalid]:active{cursor:not-allowed;}
/* LINE BUTTON **************************************************************************/




/* ページ遷移アニメーション */
.page-enter, .page-leave-to{ opacity: 0; }
.page-enter-active, .page-leave-active{ transition: opacity .3s;}
.layout-enter, .layout-leave-active{opacity: 0;}
.layout-enter-active, .layout-leave-active{ transition: opacity .3s;}



/* basic layout */
#__layout{
    max-width:500px;
    margin:0 auto;
    min-height:100vh;
}


[full-height]{min-height:100vh;}
[center-center]{ display: flex;flex-flow:column nowrap;justify-content: center;align-items: center; }
[full-width]{width:100%;}

#el-drawer__title{
    margin-bottom:0 !important;
}
.el-drawer__header{
    padding:1em 1em 0 0;
}

</style>
