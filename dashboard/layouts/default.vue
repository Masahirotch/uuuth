<template>
    <Nuxt />
</template>
<script>

</script>
<style>
root,*{
    --line-color: #00B900;
    --line-hover: #009300;
    --main-color: #e95504;
    --main-grad: linear-gradient(120deg, #faa532 29%,#fc5c61 100%);
    --blue-grad: linear-gradient(120deg, #7CEADD 19%,#0093E9 100%);
    --dark-grad: linear-gradient(120deg, #e88f17 29%,#e23e44 100%);
    --bg-orange: rgba(233,85,4,0.9);
    --bg-inc: linear-gradient(0deg, #80D0C7 29%,#0093E9 100%);
    --bg-incdark: linear-gradient(0deg, #62BAB0 29%,#0076BA 100%);
    --bg-disable: linear-gradient(120deg, #909294 29%,#484d50 100%);
}
*::-webkit-scrollbar,div::-webkit-scrollbar {display: none;-webkit-appearance: none;scrollbar-width: none;}
*{font-family: "Helvetica Neue",Helvetica,Arial,"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif;}
abbr,address,article,aside,audio,b,blockquote,body,canvas,caption,cite,code,dd,del,details,dfn,div,dl,dt,em,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,p,pre,q,samp,section,small,span,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,ul,var,video{margin:0;padding:0;border:0;outline:0;font-size:100%;vertical-align:baseline;background:0 0}body{line-height:inherit !important;}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}nav ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}a{margin:0;padding:0;font-size:100%;vertical-align:baseline;background:0 0}ins{background-color:#ff9;color:#000;text-decoration:none}mark{background-color:#ff9;color:#000;font-style:italic;font-weight:700}del{text-decoration:line-through}abbr[title],dfn[title]{border-bottom:1px dotted;cursor:help}table{border-collapse:collapse;border-spacing:0}hr{display:block;height:1px;border:0;border-top:1px solid #ccc;margin:1em 0;padding:0}button,input,select,textarea{margin:0;padding:0;background:0 0;border:none;border-radius:0;outline:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;vertical-align:middle}select::-ms-expand{display:none}*,::after,::before{box-sizing:border-box;margin:0}div,h1,h2,h3,h4,h5,h6,p,span,dl,dt,dd{color:#444;}
a,a:hover,a:focus{text-decoration: none;}


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
    font-size:15px;
    color:#FFF;padding:0.2em 1em;border-radius:0.3em;letter-spacing:0.05em;
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





/* button */
[bg-grad]{background:var(--main-grad);}
[btn][bg-grad]{color:#FFF;}
[button]{background:var(--main-grad);color:#fff;padding:.9em;display:block;text-align:center;border-radius:8px;position:relative;width:100%;margin:0 auto;box-sizing:border-box;font-size:min(3.8vmin ,15px);font-weight:500;letter-spacing:.05em}[button]:hover{color:#fff;background:var(--dark-grad)}[buttonclose]{background:#ababab;color:#fff;padding:.9em;display:block;text-align:center;border-radius:8px;position:relative;width:100%;margin:0 auto;box-sizing:border-box;font-size:min(3.8vmin ,15px);font-weight:500;letter-spacing:.05em}[buttonblue]{background:var(--blue-grad);color:#fff;padding:.9em;display:block;text-align:center;border-radius:8px;position:relative;width:100%;margin:0 auto;box-sizing:border-box;font-size:min(3.8vmin ,15px);font-weight:500;letter-spacing:.05em}[buttongrad]{background:var(--main-grad);color:#fff;padding:.9em;display:block;text-align:center;border-radius:8px;position:relative;width:100%;margin:0 auto;box-sizing:border-box;font-size:min(3.8vmin ,15px);font-weight:500;letter-spacing:.05em}[btn]{padding:.9em;display:block;text-align:center;border-radius:8px;position:relative;width:100%;margin:0 auto;box-sizing:border-box;font-size:min(3.8vmin ,15px);font-weight:500;letter-spacing:.05em}[btn][blue]{color:#fff;background:#409eff}[btn][green]{color:#fff;background:#67c23a}[btn][orange]{color:#fff;background:#e6a23c}[btn][red]{color:#fff;background:#f56c6c}[btn][w-blue]{color:#409eff;background:#fff;border:1px solid #409eff}[btn][w-green]{color:#67c23a;background:#fff;border:1px solid #67c23a}[btn][w-orange]{color:#e6a23c;background:#fff;border:1px solid #e6a23c}[btn][w-red]{color:#f56c6c;background:#fff;border:1px solid #f56c6c}
[btn][bluegrad]{background:var(--blue-grad);color:#fff}
[btn][bluegrad]:hover,[btn][buttongrad]:hover{color:#fff}
[buttonblue] *{color:#FFF;}
[button][grad] *{color:#FFF;}
[btn][bluegrad] span{color:#FFF;}

[btn][disable]{background:var(--bg-disable);color:#fff}
[btn][disable] span{color:#FFF;}



.el-button--primary span,
.el-button--success span,
.el-button--info span,
.el-button--warning span,
.el-button--danger span{color:#FFF;}



[text-white] span{color:#FFF;}


/* HELPER */
[mt-05]{margin-top:.5em}[mt-1]{margin-top:1em}[mt-2]{margin-top:2em}[mt-3]{margin-top:3em}[mt-4]{margin-top:4em}[mt-5]{margin-top:5em}[ml-05]{margin-left:.5em}[ml-1]{margin-left:1em}[ml-2]{margin-left:2em}[ml-3]{margin-left:3em}[ml-4]{margin-left:4em}[ml-5]{margin-left:5em}[mb-05]{margin-bottom:.5em}[mb-1]{margin-bottom:1em}[mb-2]{margin-bottom:2em}[mb-3]{margin-bottom:3em}[mb-4]{margin-bottom:4em}[mb-5]{margin-bottom:5em}[mr-05]{margin-right:.5em}[mr-1]{margin-right:1em}[mr-2]{margin-right:2em}[mr-3]{margin-right:3em}[mr-4]{margin-right:4em}[mr-5]{margin-right:5em}[mt-05i]{margin-top:.5em!important}[mt-1i]{margin-top:1em!important}[mt-2i]{margin-top:2em!important}[mt-3i]{margin-top:3em!important}[mt-4i]{margin-top:4em!important}[mt-5i]{margin-top:5em!important}[ml-05i]{margin-left:.5em!important}[ml-1i]{margin-left:1em!important}[ml-2i]{margin-left:2em!important}[ml-3i]{margin-left:3em!important}[ml-4i]{margin-left:4em!important}[ml-5i]{margin-left:5em!important}[mb-05i]{margin-bottom:.5em!important}[mb-1i]{margin-bottom:1em!important}[mb-2i]{margin-bottom:2em!important}[mb-3i]{margin-bottom:3em!important}[mb-4i]{margin-bottom:4em!important}[mb-5i]{margin-bottom:5em!important}[mr-05i]{margin-right:.5em!important}[mr-1i]{margin-right:1em!important}[mr-2i]{margin-right:2em!important}[mr-3i]{margin-right:3em!important}[mr-4i]{margin-right:4em!important}[mr-5i]{margin-right:5em!important}
[pt-05]{padding-top:.5em}[pt-1]{padding-top:1em}[pt-2]{padding-top:2em}[pt-3]{padding-top:3em}[pt-4]{padding-top:4em}[pt-5]{padding-top:5em}[pl-05]{padding-left:.5em}[pl-1]{padding-left:1em}[pl-2]{padding-left:2em}[pl-3]{padding-left:3em}[pl-4]{padding-left:4em}[pl-5]{padding-left:5em}[pb-05]{padding-bottom:.5em}[pb-1]{padding-bottom:1em}[pb-2]{padding-bottom:2em}[pb-3]{padding-bottom:3em}[pb-4]{padding-bottom:4em}[pb-5]{padding-bottom:5em}[pr-05]{padding-right:.5em}[pr-1]{padding-right:1em}[pr-2]{padding-right:2em}[pr-3]{padding-right:3em}[pr-4]{padding-right:4em}[pr-5]{padding-right:5em}[pt-05i]{padding-top:.5em!important}[pt-1i]{padding-top:1em!important}[pt-2i]{padding-top:2em!important}[pt-3i]{padding-top:3em!important}[pt-4i]{padding-top:4em!important}[pt-5i]{padding-top:5em!important}[pl-05i]{padding-left:.5em!important}[pl-1i]{padding-left:1em!important}[pl-2i]{padding-left:2em!important}[pl-3i]{padding-left:3em!important}[pl-4i]{padding-left:4em!important}[pl-5i]{padding-left:5em!important}[pb-05i]{padding-bottom:.5em!important}[pb-1i]{padding-bottom:1em!important}[pb-2i]{padding-bottom:2em!important}[pb-3i]{padding-bottom:3em!important}[pb-4i]{padding-bottom:4em!important}[pb-5i]{padding-bottom:5em!important}[pr-05i]{padding-right:.5em!important}[pr-1i]{padding-right:1em!important}[pr-2i]{padding-right:2em!important}[pr-3i]{padding-right:3em!important}[pr-4i]{padding-right:4em!important}[pr-5i]{padding-right:5em!important}[nobr]{display:inline-block !important;}
.mt-05{margin-top:.5em}.mt-1{margin-top:1em}.mt-2{margin-top:2em}.mt-3{margin-top:3em}.mt-4{margin-top:4em}.mt-5{margin-top:5em}.ml-05{margin-left:.5em}.ml-1{margin-left:1em}.ml-2{margin-left:2em}.ml-3{margin-left:3em}.ml-4{margin-left:4em}.ml-5{margin-left:5em}.mb-05{margin-bottom:.5em}.mb-1{margin-bottom:1em}.mb-2{margin-bottom:2em}.mb-3{margin-bottom:3em}.mb-4{margin-bottom:4em}.mb-5{margin-bottom:5em}.mr-05{margin-right:.5em}.mr-1{margin-right:1em}.mr-2{margin-right:2em}.mr-3{margin-right:3em}.mr-4{margin-right:4em}.mr-5{margin-right:5em}.mt-05i{margin-top:.5em!important}.mt-1i{margin-top:1em!important}.mt-2i{margin-top:2em!important}.mt-3i{margin-top:3em!important}.mt-4i{margin-top:4em!important}.mt-5i{margin-top:5em!important}.ml-05i{margin-left:.5em!important}.ml-1i{margin-left:1em!important}.ml-2i{margin-left:2em!important}.ml-3i{margin-left:3em!important}.ml-4i{margin-left:4em!important}.ml-5i{margin-left:5em!important}.mb-05i{margin-bottom:.5em!important}.mb-1i{margin-bottom:1em!important}.mb-2i{margin-bottom:2em!important}.mb-3i{margin-bottom:3em!important}.mb-4i{margin-bottom:4em!important}.mb-5i{margin-bottom:5em!important}.mr-05i{margin-right:.5em!important}.mr-1i{margin-right:1em!important}.mr-2i{margin-right:2em!important}.mr-3i{margin-right:3em!important}.mr-4i{margin-right:4em!important}.mr-5i{margin-right:5em!important}
.pt-05{padding-top:.5em}.pt-1{padding-top:1em}.pt-2{padding-top:2em}.pt-3{padding-top:3em}.pt-4{padding-top:4em}.pt-5{padding-top:5em}.pl-05{padding-left:.5em}.pl-1{padding-left:1em}.pl-2{padding-left:2em}.pl-3{padding-left:3em}.pl-4{padding-left:4em}.pl-5{padding-left:5em}.pb-05{padding-bottom:.5em}.pb-1{padding-bottom:1em}.pb-2{padding-bottom:2em}.pb-3{padding-bottom:3em}.pb-4{padding-bottom:4em}.pb-5{padding-bottom:5em}.pr-05{padding-right:.5em}.pr-1{padding-right:1em}.pr-2{padding-right:2em}.pr-3{padding-right:3em}.pr-4{padding-right:4em}.pr-5{padding-right:5em}.pt-05i{padding-top:.5em!important}.pt-1i{padding-top:1em!important}.pt-2i{padding-top:2em!important}.pt-3i{padding-top:3em!important}.pt-4i{padding-top:4em!important}.pt-5i{padding-top:5em!important}.pl-05i{padding-left:.5em!important}.pl-1i{padding-left:1em!important}.pl-2i{padding-left:2em!important}.pl-3i{padding-left:3em!important}.pl-4i{padding-left:4em!important}.pl-5i{padding-left:5em!important}.pb-05i{padding-bottom:.5em!important}.pb-1i{padding-bottom:1em!important}.pb-2i{padding-bottom:2em!important}.pb-3i{padding-bottom:3em!important}.pb-4i{padding-bottom:4em!important}.pb-5i{padding-bottom:5em!important}.pr-05i{padding-right:.5em!important}.pr-1i{padding-right:1em!important}.pr-2i{padding-right:2em!important}.pr-3i{padding-right:3em!important}.pr-4i{padding-right:4em!important}.pr-5i{padding-right:5em!important}.nobr{display:inline-block !important;}

/* layout */
[content-inner]{padding:0 2em;}
[full]{width:100%;height:100vh;}
[center-col]{display: flex; flex-flow:column nowrap; justify-content: center; align-items: center;}
[center],[center-row]{display: flex; flex-flow:row nowrap; justify-content: center; align-items: center;}
[right]{display: flex; flex-flow:row nowrap;justify-content: flex-end; align-items: center; }
[inner]{padding:12px;}

[split]{
  display: flex; flex-flow:row nowrap;justify-content: space-between;
}


[split-2],[split-3],[split-4],[split-5],[split-6]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}
[split-2] > *,[split-3] > *,[split-4] > *,[split-5] > *,[split-6] > *{width:100%;}

[split-2][split-start],[split-3][split-start],[split-4][split-start],[split-5][split-start],[split-6][split-start]{
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
}

/* flex layout */
[right-center]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: flex-end; -ms-flex-align: end; align-items: flex-end;
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

#content-header{
    font-size: 16px;
    line-height: 3em;
    position: sticky;
    top: -1px;
    z-index: 9;
    padding:0.5em;
    background:#f0f0f1;
    margin-top:-1px;
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
#content-header h3{
  padding-left: 1em;
}

#content-header[split]{
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
}











/***************** Big dialog form Setting ******************/


[big-dialog] .el-dialog__body{
    padding:0 20px 20px 20px;
}


[big-dialog] .el-dialog__footer {
    padding: 10px 20px 20px;
    text-align: right;
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    right: 0;
}





[select-theme]{
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 3em 0 15px;
    width: 100%;
}

[select-theme] + span{
    position:absolute;
    margin-left:-2em;
    margin-top:1em;
}

[select-item]{
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 3em 0 15px;
}

[select-item] + span{
    position:absolute;
    margin-left:-2em;
    margin-top:1em;
}


[big-dialog] .el-dialog{
    width:calc(100% - 2em);
    min-height:calc(100vh - 3em);
    margin: 1em !important;
}
[big-dialog] .el-dialog .el-dialog__headerbtn .el-dialog__close{
    color:#000;
    font-weight:bold;
    border:1px solid #000;
    background:#FFF;
    padding:0.3em;
    border-radius:2em;
}

[big-dialog] .el-dialog .el-dialog__headerbtn .el-dialog__close:hover,
[big-dialog] .el-dialog .el-dialog__headerbtn .el-dialog__close:focus,
[big-dialog] .el-dialog .el-dialog__headerbtn .el-dialog__close:active{
    color:#FFF;
    font-weight:bold;
    border:1px solid #000;
    background:#000;
    padding:0.3em;
    border-radius:2em;
}

[big-dialog] .el-dialog .el-dialog__body dl{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    width:100%;
    padding:1.5em 0;
    border-bottom: 1px dashed #ddd;
}

[big-dialog] .el-dialog .el-dialog__body dl dt{
    width:10.5em;text-align:right;padding-right:1em;
    font-size:13px;
    color:#000;
}
[big-dialog] .el-dialog .el-dialog__body dl dd{width:calc(100% - 10.5em);border:none;}




[big-dialog] .el-dialog .el-dialog__body dl[dl-half] dt{width:11em;}
[big-dialog] .el-dialog .el-dialog__body dl[dl-half] dd{width : calc(50% - 11em);}
[big-dialog] .el-dialog .el-dialog__body dl[dl-half] dd:nth-of-type(1){margin-right:3em;}

[big-dialog] .el-dialog .el-dialog__body dl[dl-triple] dt{width:10.5em;}
[big-dialog] .el-dialog .el-dialog__body dl[dl-triple] dd{width:10.5em;}

[big-dialog] .el-dialog .el-dialog__body dl[dl-one-two] dt{width:11em;}
[big-dialog] .el-dialog .el-dialog__body dl[dl-one-two] dd{width : calc(50% - 11em);}
[big-dialog] .el-dialog .el-dialog__body dl[dl-one-two] dd:nth-of-type(1){width : calc(30% - 11em);}
[big-dialog] .el-dialog .el-dialog__body dl[dl-one-two] dd:nth-of-type(2){width : calc(70% - 11em);}

[big-dialog] .el-dialog .el-dialog__body dl[dl-terms] {
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: flex-start; align-items: flex-start;
    width:100%;
    border:none;
    padding:1.5em 1em;
}
[big-dialog] .el-dialog .el-dialog__body dl[dl-terms] dt{width:100%;text-align:left;}
[big-dialog] .el-dialog .el-dialog__body dl[dl-terms] dd{width:100%;}

.el-collapse-item__content{padding:1em;background:#efefef;}





[big-dialog] .el-dialog__footer {
    padding: 10px 20px 20px;text-align: right;box-sizing: border-box;position: absolute;bottom: 0;right: 0;
}
[required-label]::before{content : '-- 必須 --';color : #F00;font-size:0.75em;display:block;margin-left:0.6em;font-weight:bold;}

[split],[tri-split],[quad-split]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

[tri-split] > *,[quad-split] > *{
    width:100%;
}


[tri-split] > *:nth-of-type(2),[tri-split] > *:nth-of-type(3){
    margin-left:1em;
}

[quad-split] > *:nth-of-type(2),[quad-split] > *:nth-of-type(3),[quad-split] > *:nth-of-type(4){
    margin-left:1em;
}

.el-input__inner[text-right]{text-align:right;}

[add-unit]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

[add-unit] span{
    width:2em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:column nowrap; flex-flow:column nowrap;
    -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}




.num-input .el-input__inner{
    text-align: right !important;
}

.v-modal{
    z-index: 2000 !important;
}





/* b2c order create-sendlinemessage */
[create-sendlinemessage]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}
    [create-sendlinemessagebox]{
        width: 50%;
        position: relative;
    }

    [create-sendlinemessagebox] [add-button]{
        position: absolute;
        top: 1em;
        right: 1em;
    }

    [create-sendlinemessageview]{
        width: 50%;
    }

/* Slip Edit */
[slip-editor]{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
    -webkit-align-items: center; -ms-flex-align:center; align-items:center;
    min-width: 300px;
}
[slip-input]{
    -webkit-appearance: none;
    background-color: #FFF;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    width:12em;
    margin-right: 1em;
}


</style>
