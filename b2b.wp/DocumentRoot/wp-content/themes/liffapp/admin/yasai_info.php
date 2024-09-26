<style>
	a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}table{border-collapse:collapse;border-spacing:0}
</style>
<style>
[fullscreenloading]{left:0;position:fixed;width:100vw;height:100vh;background:rgba(255,255,255,.2);z-index:9999;display:flex;flex-flow:column nowrap;justify-content:center;align-items:center}[fullscreenloading] span{margin-bottom:1em}[fullscreenloading] i{font-size:2em}.lds-hourglass{display:inline-block;position:relative;width:80px;height:80px}.lds-hourglass:after{content:" ";display:block;border-radius:50%;width:0;height:0;margin:8px;box-sizing:border-box;border:32px solid #598602;border-color:#598602 transparent #598602 transparent;animation:lds-hourglass 1.2s infinite}@keyframes lds-hourglass{0%{transform:rotate(0);animation-timing-function:cubic-bezier(.55,.055,.675,.19)}50%{transform:rotate(900deg);animation-timing-function:cubic-bezier(.215,.61,.355,1)}100%{transform:rotate(1800deg)}}
.mt-05{margin-top:.5em}.mt-1{margin-top:1em}.mt-2{margin-top:2em}.mt-3{margin-top:3em}.mt-4{margin-top:4em}.mt-5{margin-top:5em}.ml-05{margin-left:.5em}.ml-1{margin-left:1em}.ml-2{margin-left:2em}.ml-3{margin-left:3em}.ml-4{margin-left:4em}.ml-5{margin-left:5em}.mb-05{margin-bottom:.5em}.mb-1{margin-bottom:1em}.mb-2{margin-bottom:2em}.mb-3{margin-bottom:3em}.mb-4{margin-bottom:4em}.mb-5{margin-bottom:5em}.mr-05{margin-right:.5em}.mr-1{margin-right:1em}.mr-2{margin-right:2em}.mr-3{margin-right:3em}.mr-4{margin-right:4em}.mr-5{margin-right:5em}.mt-05i{margin-top:.5em!important}.mt-1i{margin-top:1em!important}.mt-2i{margin-top:2em!important}.mt-3i{margin-top:3em!important}.mt-4i{margin-top:4em!important}.mt-5i{margin-top:5em!important}.ml-05i{margin-left:.5em!important}.ml-1i{margin-left:1em!important}.ml-2i{margin-left:2em!important}.ml-3i{margin-left:3em!important}.ml-4i{margin-left:4em!important}.ml-5i{margin-left:5em!important}.mb-05i{margin-bottom:.5em!important}.mb-1i{margin-bottom:1em!important}.mb-2i{margin-bottom:2em!important}.mb-3i{margin-bottom:3em!important}.mb-4i{margin-bottom:4em!important}.mb-5i{margin-bottom:5em!important}.mr-05i{margin-right:.5em!important}.mr-1i{margin-right:1em!important}.mr-2i{margin-right:2em!important}.mr-3i{margin-right:3em!important}.mr-4i{margin-right:4em!important}.mr-5i{margin-right:5em!important}
.pt-05{padding-top:.5em}.pt-1{padding-top:1em}.pt-2{padding-top:2em}.pt-3{padding-top:3em}.pt-4{padding-top:4em}.pt-5{padding-top:5em}.pl-05{padding-left:.5em}.pl-1{padding-left:1em}.pl-2{padding-left:2em}.pl-3{padding-left:3em}.pl-4{padding-left:4em}.pl-5{padding-left:5em}.pb-05{padding-bottom:.5em}.pb-1{padding-bottom:1em}.pb-2{padding-bottom:2em}.pb-3{padding-bottom:3em}.pb-4{padding-bottom:4em}.pb-5{padding-bottom:5em}.pr-05{padding-right:.5em}.pr-1{padding-right:1em}.pr-2{padding-right:2em}.pr-3{padding-right:3em}.pr-4{padding-right:4em}.pr-5{padding-right:5em}.pt-05i{padding-top:.5em!important}.pt-1i{padding-top:1em!important}.pt-2i{padding-top:2em!important}.pt-3i{padding-top:3em!important}.pt-4i{padding-top:4em!important}.pt-5i{padding-top:5em!important}.pl-05i{padding-left:.5em!important}.pl-1i{padding-left:1em!important}.pl-2i{padding-left:2em!important}.pl-3i{padding-left:3em!important}.pl-4i{padding-left:4em!important}.pl-5i{padding-left:5em!important}.pb-05i{padding-bottom:.5em!important}.pb-1i{padding-bottom:1em!important}.pb-2i{padding-bottom:2em!important}.pb-3i{padding-bottom:3em!important}.pb-4i{padding-bottom:4em!important}.pb-5i{padding-bottom:5em!important}.pr-05i{padding-right:.5em!important}.pr-1i{padding-right:1em!important}.pr-2i{padding-right:2em!important}.pr-3i{padding-right:3em!important}.pr-4i{padding-right:4em!important}.pr-5i{padding-right:5em!important}.nobr{display:inline-block !important;}
</style>
<?php
global $wpdb;
VueJS();
VuexJS();
AxiosJS();
?>
<!-- import CSS -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
<!-- import JavaScript -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<style>
[v-closk]{display:none;}
#yasai_info{padding-right:2em;}
#yasai_info h2{
	font-size: 16px;
    line-height: 3em;
    position: sticky;
    top: 20px;
    z-index: 9;
    padding:0.5em;
    background:#f0f0f1;
}

.update-nag.notice.notice-warning.inline{display:none;}
#shop_loop{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:column wrap;flex-flow:column wrap;
	-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start; 
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
.shop_detail{width:100%;}
.shop_detail h3{
	background:#CCC;color:#000;padding:0.5em;
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
	position:relative;
	min-height:20px;
}
.shop_detail h3 .left,
.shop_detail h3 .right{
	display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;

}

.shop_detail h3 .left span{padding:0.3em 1em;}
.shop_detail h3 .right .el-input{
	width:7em;
	padding-right:0.8em;
}
.shop_detail h3 .right .el-input input.el-input__inner{
	min-height:inherit;
	height:2em;
}


.user-parent,.user-loop,.user-header{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start; 
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
dl.user-parent > dt,
dl.user-parent > dd,
dl.user-loop > dt,
dl.user-loop > dd,
.user-header > *{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start; 
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
	margin:0;padding:0.8em 1em;border-right:1px solid #efefef;
}
dl.user-parent > dt:last-child,
dl.user-parent > dd:last-child,
dl.user-loop > dt:last-child,
dl.user-loop > dd:last-child,
.user-header > *:last-child{
	border:none;
}



.user-header > dd{
	font-size:min(3.2vmin , 13px);font-weight:bold;
	-webkit-justify-content: center;-ms-flex-pack: center;justify-content: center; 
}
.parent-icon{margin-right:0.4em;}

dl.user-parent,dl.user-header{background:#FFF;}
dl.user-header{border-bottom:1px solid #000;}


dl.user-parent > dd{
	font-size:min(3.2vmin , 13px);font-weight:400;
}

dl.user-parent > dd.switch-box{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start; 
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
dl.user-parent > dd.switch-box{
	-webkit-justify-content: center;-ms-flex-pack: center;justify-content: center; 
}



dl.user-header > dd:nth-of-type(1),dl.user-parent > dd:nth-of-type(1),dl.user-child > dd:nth-of-type(1){width:15%;}
dl.user-header > dd:nth-of-type(2),dl.user-parent > dd:nth-of-type(2),dl.user-child > dd:nth-of-type(2){width:15%;}
dl.user-header > dd:nth-of-type(3),dl.user-parent > dd:nth-of-type(3),dl.user-child > dd:nth-of-type(3){width:10%;}
dl.user-header > dd:nth-of-type(4),dl.user-parent > dd:nth-of-type(4),dl.user-child > dd:nth-of-type(4){width:10%;}
dl.user-header > dd:nth-of-type(5),dl.user-parent > dd:nth-of-type(5),dl.user-child > dd:nth-of-type(5){width:10%;}
dl.user-header > dd:nth-of-type(6),dl.user-parent > dd:nth-of-type(6),dl.user-child > dd:nth-of-type(6){width:10%;}
dl.user-header > dd:nth-of-type(7),dl.user-parent > dd:nth-of-type(7),dl.user-child > dd:nth-of-type(7){width:10%;}

#content-header{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

#sort-box{
	display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
#sort-box > div{
	display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
	margin-left:10px;	
}

.el-button+.el-button{margin-left: 1px;}

#sort-box .el-button.el-button--small.active{
	background:#409eff;
}
#sort-box .el-button.el-button--small.active span{
	color:#FFF;
}
.shopname-filter{
	margin-right:1em;
}
.shopname-filter input{
	height:33px;
	
}

</style>


<div id="yasai_info" v-cloak>

    <div fullscreenloading v-if="isLoading">
      <div class="lds-hourglass"></div>
    </div>

    <h3 class="pt-1"><span>日吉の野菜情報</span></h3>
	<h2 id="content-header" class="pt-1i">
		<div id="sort-box">
			<div>
				<el-button size="small" v-bind:class="{ active: isAll      }" @click="filterAll" >全て</el-button>
				<el-button size="small" v-bind:class="{ active: isApproval }" @click="filterApproval" >利用承認済</el-button>
				<el-button size="small" v-bind:class="{ active: isMonthly  }" @click="filterMonthly">単価月極</el-button>
				<el-button size="small" v-bind:class="{ active: isD        }" @click="filterD">D単価</el-button>
				<el-button size="small" v-bind:class="{ active: is365      }" @click="filter365">365日対応</el-button>
				<el-button size="small" v-bind:class="{ active: isCalendar }" @click="filterCalendar">市場カレンダー</el-button>
				
			</div>
			<div>
				<el-button size="small" type="warning" @click="sortFromCode" class="mr-1i">店舗コード　<i class="el-icon-d-caret"></i></el-button>
				<el-input placeholder="店舗名で絞り込み" v-model="shopname" class="shopname-filter"></el-input>
			</div>
		</div>
	</h2>


	<div id="shop_loop">

			<div v-for="(user , index) in users" class="shop_detail" v-if="user.isView">
			
			<h3 class="bizname">
				<div class="left">
					<span>{{user.bizName}}</span>
					<span>{{user.manager}}</span>
					<span>{{user.shop_tel}}</span>
				</div>
				<div class="right">
					<el-input placeholder="店舗コード" v-model="user.shopCode"></el-input>
					<el-button size="mini" @click="updateShopCode(user,user.shopCode)">更新</el-button>
				</div>
			</h3>
			<div>

				<dl class="user-header">
					<dd>担当者名(LINE名)</dd>
					<dd>担当者TEL</dd>
					<dd>利用承認</dd>
					<dd>単価月極</dd>
					<dd>D単価</dd>
					<dd>365日対応</dd>
					<dd>市場カレンダー</dd>
				</dl>

				<dl class="user-parent">
					<dd><i class="el-icon-s-tools parent-icon"></i>{{user.displayName}}</dd>
					<dd>{{user.user_tel}}</dd>
					<dd class="switch-box">
					<el-switch v-model="user.flg_active" active-color="#13ce66" @change="flgSet($event,user.userId,'flg_active')"></el-switch>
					</dd>
					<dd class="switch-box">
					<el-switch v-model="user.flg_1" change="flgSet" @change="flgSet($event,user.userId,'flg_1')"></el-switch>				  		
					</dd>
					<dd class="switch-box">
					<el-switch v-model="user.flg_2" change="flgSet" @change="flgSet($event,user.userId,'flg_2')"></el-switch>				  		
					</dd>
					<dd class="switch-box">
					<el-switch v-model="user.flg_3" change="flgSet" @change="flgSet($event,user.userId,'flg_3')"></el-switch>				  		
					</dd>
					<dd class="switch-box">
					<el-switch v-model="user.flg_4" change="flgSet" @change="flgSet($event,user.userId,'flg_4')"></el-switch>	
					</dd>
				</dl>
				<dl class="user-child">

				</dl>

			</div>
			</div>

	</div>
</div>
<script>
window.onload = async function() {

	const app = new Vue({

	    /*
	    ****************************************/
		el: '#yasai_info',

	    /*
	    ****************************************/
		data() {

			return {
				
				allItem : '',
				API   : 'https://hiyoshi.api.line.cx/',
				TOKEN : 'hiyoshi.info.token',
				activeNames : '1',
				users : '',
				isLoading : true,

				isAll : true,
				isApproval : false,
				isMonthly : false,
				isD : false,
				is365 : false,
				isCalendar : false,

				sortCode : true,
				shopname : '',

			};

		},
	    /*
	    ****************************************/
		mounted (){

			this.getUsers()

		},
	    /*
	    ****************************************/
		conputed :{


		},
	    /*
	    ****************************************/
		watch : {

			shopname : function(value){

				if( value != '' ){

					this.users.forEach( item => { 
						if( item.bizName !== null && item.bizName.includes(value) ) item.isView = true  
						if( item.bizName !== null && !item.bizName.includes(value) ) item.isView = false
						if( item.bizName == null ) item.isView = false	
					})

					/*
					const filters = [...this.users].filter( item => { 
						item.bizName !== null && item.bizName.includes(value) 
					});
					*/

				}
				if( value == '' ){

					this.users.forEach( item => item.isView = true )

				}

			}

		},
	    /*
	    ****************************************/
		methods: {
			// ユーザー一覧を取得
			getUsers: function(){

				var params = new FormData();
		        params.append( 'token'  , this.TOKEN )
		        params.append( 'action' , 'getParentUsers' )
        		axios.post( this.API , params )
	            .then( function(result){

	            	this.allItem = result.data
	            	this.users   = JSON.parse(JSON.stringify(this.allItem))

	            	console.dir(this.users)

	            }.bind(this))
	            .catch((err) => {

	            })
	            .finally(function(){

	              	this.isLoading = false

	            }.bind(this))

			},

			// ユーザーの配信フラグをセット
			flgSet : function(e,userId,flg){

				this.isLoading = true

				var params = new FormData();
		        params.append( 'token'  , this.TOKEN )
		        params.append( 'action' , 'paramUpdate' )

		        params.append( 'userId' , userId )
		        params.append( 'flg'    , flg )
		        params.append( 'value'  , e )
        		axios.post( this.API , params )
	            .then( function(result){

	            	console.dir(result.data)

	            }.bind(this))
	            .catch((err) => {

	            	console.dir(err)

	            })
	            .finally(function(){
	            	this.isLoading = false
	            }.bind(this))

			},

			// 店舗コードを保存
			updateShopCode : function(user,shopcode){

				this.isLoading = true

				var params = new FormData();
		        params.append( 'token'    , this.TOKEN )
		        params.append( 'action'   , 'addShopCode' )
		        params.append( 'ID'       , user.ID )
		        params.append( 'shopCode' , shopcode )
        		axios.post( this.API , params )
	            .then( function(result){

	            	console.dir(result.data)

	            }.bind(this))
	            .catch((err) => {

	            	console.dir(err)

	            })
	            .finally(function(){
	            	this.isLoading = false
	            }.bind(this))

			},


			/*
			店舗表示フィルター
			**************************************/
			// 全て
			filterAll : function(){
	            this.users   = JSON.parse(JSON.stringify(this.allItem))
	            this.setFlg('isAll')
			},

			filterApproval : function(){
				let setData = JSON.parse(JSON.stringify(this.allItem))
				const filterData = setData.filter(value => value.flg_active == true )
				this.users   = filterData
				this.setFlg('isApproval')
			},

			filterMonthly : function(){
				let setData = JSON.parse(JSON.stringify(this.allItem))
				const filterData = setData.filter(value => value.flg_1 == true )
				this.users   = filterData
				this.setFlg('isMonthly')
			},

			filterD : function(){
				let setData = JSON.parse(JSON.stringify(this.allItem))
				const filterData = setData.filter(value => value.flg_2 == true )
				this.users   = filterData
				this.setFlg('isD')
			},

			filter365 : function(){
				let setData = JSON.parse(JSON.stringify(this.allItem))
				const filterData = setData.filter(value => value.flg_3 == true )
				this.users   = filterData
				this.setFlg('is365')
			},

			filterCalendar : function(){
				let setData = JSON.parse(JSON.stringify(this.allItem))
				const filterData = setData.filter(value => value.flg_4 == true )
				this.users   = filterData

				this.setFlg('isCalendar')
			},

			setFlg : function(set){

				this.isAll = false
				this.isApproval = false
				this.isMonthly = false
				this.isD = false
				this.is365 = false
				this.isCalendar = false

				this[set] = true

				this.shopname = ''


			},

			// ショップコードで並び替え
			sortFromCode : function(){

				this.sortCode = !this.sortCode

				// true = DESC
				if(this.sortCode){

					this.users = [...this.users].sort( (a, b) => b.shopCode - a.shopCode);

				}
				
				// false = ASC
				if(!this.sortCode){

					this.users = [...this.users].sort( (a, b) => a.shopCode - b.shopCode );

				}

			},



		}, //method


	})//Vue App

}// window.onload
</script>