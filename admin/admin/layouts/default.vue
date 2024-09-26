<template>
  <div>
    <Nuxt />
  </div>
</template>

<style>
/* Reset */

*,:root{
  --line-color: #00B900;
  --line-hover: #009300;

}


*::-webkit-scrollbar,div::-webkit-scrollbar {display: none;-webkit-appearance: none;scrollbar-width: none;}
*{font-family: "Helvetica Neue",Helvetica,Arial,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;}
abbr,address,article,aside,audio,b,blockquote,body,canvas,caption,cite,code,dd,del,details,dfn,div,dl,dt,em,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,p,pre,q,samp,section,small,span,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,ul,var,video{margin:0;padding:0;border:0;outline:0;font-size:100%;vertical-align:baseline;background:0 0}body{line-height:inherit !important;}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}nav ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}a{margin:0;padding:0;font-size:100%;vertical-align:baseline;background:0 0}ins{background-color:#ff9;color:#000;text-decoration:none}mark{background-color:#ff9;color:#000;font-style:italic;font-weight:700}del{text-decoration:line-through}abbr[title],dfn[title]{border-bottom:1px dotted;cursor:help}table{border-collapse:collapse;border-spacing:0}hr{display:block;height:1px;border:0;border-top:1px solid #ccc;margin:1em 0;padding:0}button,input,select,textarea{margin:0;padding:0;background:0 0;border:none;border-radius:0;outline:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;vertical-align:middle}select::-ms-expand{display:none}*,::after,::before{box-sizing:border-box;margin:0}div,h1,h2,h3,h4,h5,h6,p,dl,dt,dd{color:#444;}
a,a:hover,a:focus{text-decoration: none;}

h5{font-size: 14px;}

/* helper */
[mt-05]{margin-top:.5em}[mt-1]{margin-top:1em}[mt-2]{margin-top:2em}[mt-3]{margin-top:3em}[mt-4]{margin-top:4em}[mt-5]{margin-top:5em}[ml-05]{margin-left:.5em}[ml-1]{margin-left:1em}[ml-2]{margin-left:2em}[ml-3]{margin-left:3em}[ml-4]{margin-left:4em}[ml-5]{margin-left:5em}[mb-05]{margin-bottom:.5em}[mb-1]{margin-bottom:1em}[mb-2]{margin-bottom:2em}[mb-3]{margin-bottom:3em}[mb-4]{margin-bottom:4em}[mb-5]{margin-bottom:5em}[mr-05]{margin-right:.5em}[mr-1]{margin-right:1em}[mr-2]{margin-right:2em}[mr-3]{margin-right:3em}[mr-4]{margin-right:4em}[mr-5]{margin-right:5em}[mt-05i]{margin-top:.5em!important}[mt-1i]{margin-top:1em!important}[mt-2i]{margin-top:2em!important}[mt-3i]{margin-top:3em!important}[mt-4i]{margin-top:4em!important}[mt-5i]{margin-top:5em!important}[ml-05i]{margin-left:.5em!important}[ml-1i]{margin-left:1em!important}[ml-2i]{margin-left:2em!important}[ml-3i]{margin-left:3em!important}[ml-4i]{margin-left:4em!important}[ml-5i]{margin-left:5em!important}[mb-05i]{margin-bottom:.5em!important}[mb-1i]{margin-bottom:1em!important}[mb-2i]{margin-bottom:2em!important}[mb-3i]{margin-bottom:3em!important}[mb-4i]{margin-bottom:4em!important}[mb-5i]{margin-bottom:5em!important}[mr-05i]{margin-right:.5em!important}[mr-1i]{margin-right:1em!important}[mr-2i]{margin-right:2em!important}[mr-3i]{margin-right:3em!important}[mr-4i]{margin-right:4em!important}[mr-5i]{margin-right:5em!important}
[pt-05]{padding-top:.5em}[pt-1]{padding-top:1em}[pt-2]{padding-top:2em}[pt-3]{padding-top:3em}[pt-4]{padding-top:4em}[pt-5]{padding-top:5em}[pl-05]{padding-left:.5em}[pl-1]{padding-left:1em}[pl-2]{padding-left:2em}[pl-3]{padding-left:3em}[pl-4]{padding-left:4em}[pl-5]{padding-left:5em}[pb-05]{padding-bottom:.5em}[pb-1]{padding-bottom:1em}[pb-2]{padding-bottom:2em}[pb-3]{padding-bottom:3em}[pb-4]{padding-bottom:4em}[pb-5]{padding-bottom:5em}[pr-05]{padding-right:.5em}[pr-1]{padding-right:1em}[pr-2]{padding-right:2em}[pr-3]{padding-right:3em}[pr-4]{padding-right:4em}[pr-5]{padding-right:5em}[pt-05i]{padding-top:.5em!important}[pt-1i]{padding-top:1em!important}[pt-2i]{padding-top:2em!important}[pt-3i]{padding-top:3em!important}[pt-4i]{padding-top:4em!important}[pt-5i]{padding-top:5em!important}[pl-05i]{padding-left:.5em!important}[pl-1i]{padding-left:1em!important}[pl-2i]{padding-left:2em!important}[pl-3i]{padding-left:3em!important}[pl-4i]{padding-left:4em!important}[pl-5i]{padding-left:5em!important}[pb-05i]{padding-bottom:.5em!important}[pb-1i]{padding-bottom:1em!important}[pb-2i]{padding-bottom:2em!important}[pb-3i]{padding-bottom:3em!important}[pb-4i]{padding-bottom:4em!important}[pb-5i]{padding-bottom:5em!important}[pr-05i]{padding-right:.5em!important}[pr-1i]{padding-right:1em!important}[pr-2i]{padding-right:2em!important}[pr-3i]{padding-right:3em!important}[pr-4i]{padding-right:4em!important}[pr-5i]{padding-right:5em!important}[nobr]{display:inline-block !important;}

.mt-05{margin-top:.5em}.mt-1{margin-top:1em}.mt-2{margin-top:2em}.mt-3{margin-top:3em}.mt-4{margin-top:4em}.mt-5{margin-top:5em}.ml-05{margin-left:.5em}.ml-1{margin-left:1em}.ml-2{margin-left:2em}.ml-3{margin-left:3em}.ml-4{margin-left:4em}.ml-5{margin-left:5em}.mb-05{margin-bottom:.5em}.mb-1{margin-bottom:1em}.mb-2{margin-bottom:2em}.mb-3{margin-bottom:3em}.mb-4{margin-bottom:4em}.mb-5{margin-bottom:5em}.mr-05{margin-right:.5em}.mr-1{margin-right:1em}.mr-2{margin-right:2em}.mr-3{margin-right:3em}.mr-4{margin-right:4em}.mr-5{margin-right:5em}.mt-05i{margin-top:.5em!important}.mt-1i{margin-top:1em!important}.mt-2i{margin-top:2em!important}.mt-3i{margin-top:3em!important}.mt-4i{margin-top:4em!important}.mt-5i{margin-top:5em!important}.ml-05i{margin-left:.5em!important}.ml-1i{margin-left:1em!important}.ml-2i{margin-left:2em!important}.ml-3i{margin-left:3em!important}.ml-4i{margin-left:4em!important}.ml-5i{margin-left:5em!important}.mb-05i{margin-bottom:.5em!important}.mb-1i{margin-bottom:1em!important}.mb-2i{margin-bottom:2em!important}.mb-3i{margin-bottom:3em!important}.mb-4i{margin-bottom:4em!important}.mb-5i{margin-bottom:5em!important}.mr-05i{margin-right:.5em!important}.mr-1i{margin-right:1em!important}.mr-2i{margin-right:2em!important}.mr-3i{margin-right:3em!important}.mr-4i{margin-right:4em!important}.mr-5i{margin-right:5em!important}
.pt-05{padding-top:.5em}.pt-1{padding-top:1em}.pt-2{padding-top:2em}.pt-3{padding-top:3em}.pt-4{padding-top:4em}.pt-5{padding-top:5em}.pl-05{padding-left:.5em}.pl-1{padding-left:1em}.pl-2{padding-left:2em}.pl-3{padding-left:3em}.pl-4{padding-left:4em}.pl-5{padding-left:5em}.pb-05{padding-bottom:.5em}.pb-1{padding-bottom:1em}.pb-2{padding-bottom:2em}.pb-3{padding-bottom:3em}.pb-4{padding-bottom:4em}.pb-5{padding-bottom:5em}.pr-05{padding-right:.5em}.pr-1{padding-right:1em}.pr-2{padding-right:2em}.pr-3{padding-right:3em}.pr-4{padding-right:4em}.pr-5{padding-right:5em}.pt-05i{padding-top:.5em!important}.pt-1i{padding-top:1em!important}.pt-2i{padding-top:2em!important}.pt-3i{padding-top:3em!important}.pt-4i{padding-top:4em!important}.pt-5i{padding-top:5em!important}.pl-05i{padding-left:.5em!important}.pl-1i{padding-left:1em!important}.pl-2i{padding-left:2em!important}.pl-3i{padding-left:3em!important}.pl-4i{padding-left:4em!important}.pl-5i{padding-left:5em!important}.pb-05i{padding-bottom:.5em!important}.pb-1i{padding-bottom:1em!important}.pb-2i{padding-bottom:2em!important}.pb-3i{padding-bottom:3em!important}.pb-4i{padding-bottom:4em!important}.pb-5i{padding-bottom:5em!important}.pr-05i{padding-right:.5em!important}.pr-1i{padding-right:1em!important}.pr-2i{padding-right:2em!important}.pr-3i{padding-right:3em!important}.pr-4i{padding-right:4em!important}.pr-5i{padding-right:5em!important}.nobr{display:inline-block !important;}

/* layout */
[full]{width:100%;height:100vh;}
[center-col]{display: flex; flex-flow:column nowrap; justify-content: center; align-items: center;}
[center],[center-row]{display: flex; flex-flow:row nowrap; justify-content: center; align-items: center;}

[right]{display: flex; flex-flow:row nowrap;justify-content: flex-end; align-items: center; }

[split]{
  display: flex; flex-flow:row nowrap;justify-content: space-between;
}
[btn-box]{
  min-height: 50px;
}
button{
    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 0.9375rem;
    line-height: 1.5;
    border-radius: 2px;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    position: relative;
    -webkit-box-flex: 0;
    flex: 0 1 auto;
    cursor: pointer;
}
/* line button */
button[line]{
    color: #fff;
    background-color: var(--line-color);
    border-color: var(--line-color);
    min-width: 200px;
}
button[line]:hover{
    color: #fff;
    background-color: var(--line-hover);
    border-color: var(--line-color);
    min-width: 200px;
}

button[line]:disabled{
    color: #212529;
    background-color: #cfd4da;
    border-color: #cfd4da;
    min-width: 200px;
    color: inherit;
    opacity: 0.6;
}



button[sub]{
    color: #212529;
    background-color: #cfd4da;
    border-color: #cfd4da;
    min-width: 120px;
}
button[sub]:hover{
    color: #212529;
    background-color: #b9c1c9;
    border-color: #b2bac4
}

button[sub]:disabled{
    opacity: 0.6;
    cursor: inherit;
}
button[sub]:disabled:hover{
    color: #212529;
    background-color: #cfd4da;
    border-color: #cfd4da; 
    opacity: 0.6;
    cursor: inherit; 
}





/* main */
.el-tabs.el-tabs--left{height:100vh !important;}
.el-tabs__content{}
.el-tabs__nav-scroll{padding-top:2em;}
.el-tabs--left .el-tabs__header.is-left{margin:0;}
[content]{position:relative;}
[text-muted]{
  color: #adb5bd !important;
}
[h-bar]{border-bottom: 1px solid #ccc;border-left: 5px solid #ccc;padding-left: 1em;margin-bottom: 0.5em;}

label{
	padding:12px;display:block;width:100%;
}
label > span{
	font-size:min(3.6vmin , 14px);font-weight:bold;
}



[page-content]{
  display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: flex-start;
}
[main-content]{
  width: 100%;
}
[menu-content]{
  height: 100vh;
  position: sticky;
  top: 0;
}

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }



.el-tab-pane{height:100vh;padding-bottom:2em;overflow-y: scroll;position:relative;}

[content-header]{padding: 1.5em;}

</style>