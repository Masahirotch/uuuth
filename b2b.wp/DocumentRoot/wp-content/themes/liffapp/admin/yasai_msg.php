<style>
	a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}table{border-collapse:collapse;border-spacing:0}
</style>
<style>
[fullscreenloading]{left:0;position:fixed;width:100vw;height:100vh;background:rgba(255,255,255,.2);z-index:9999;display:flex;flex-flow:column nowrap;justify-content:center;align-items:center}[fullscreenloading] span{margin-bottom:1em}[fullscreenloading] i{font-size:2em}.lds-hourglass{display:inline-block;position:relative;width:80px;height:80px}.lds-hourglass:after{content:" ";display:block;border-radius:50%;width:0;height:0;margin:8px;box-sizing:border-box;border:32px solid #598602;border-color:#598602 transparent #598602 transparent;animation:lds-hourglass 1.2s infinite}@keyframes lds-hourglass{0%{transform:rotate(0);animation-timing-function:cubic-bezier(.55,.055,.675,.19)}50%{transform:rotate(900deg);animation-timing-function:cubic-bezier(.215,.61,.355,1)}100%{transform:rotate(1800deg)}}
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
.update-nag.notice-warning{display:none !important;}
[v-closk]{display:none;}

#yasai_msg h2 { font-size: 16px; line-height: 3em;}

#msg-send{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:row nowrap;flex-flow:row nowrap;
	-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start; 
	-webkit-align-items: flex-start; align-items: flex-start;
}

.message-inputarea{ width: 17.6em; }
.config-area{ width:calc(100% - 18em); padding:0 1em;}

.message-inputarea .el-textarea__inner{ padding:5px; }
.button-area{padding:1em;}
.msg-view{line-height:1.4em;}
.message-inputarea.msg-view{margin:1em auto;padding:0.7em;background:#fefefe;border:1px solid #eee;border-radius:0.4em;}
</style>


<div id="yasai_msg" v-cloak>

    <div fullscreenloading v-if="isLoading">
      <div class="lds-hourglass"></div>
    </div>

	<h2>日吉の野菜情報</h2>
	<div id="msg-send">

		<div class="message-inputarea">
			<el-input
			  type="textarea"
			  :autosize="{ minRows: 8, maxRows: 20}"
			  placeholder="ここに送信メッセージを入力します。URLは自動で挿入されます。"
			  v-model="textarea"
			  >
			</el-input>
		</div>
		<div class="config-area">
			<h2>配信設定</h2>

		    <el-checkbox-group v-model="checkboxGroup">
		      <el-checkbox-button v-for="flg in sendFlg" :label="flg.key" :key="flg.key">{{flg.name}}</el-checkbox-button>
		    </el-checkbox-group>

		    <div class="button-area">
		    	<el-button type="primary" plain @click="sendMsgFunction">メッセージを送信する</el-button>
		    </div>

		</div>
	</div>




	<el-dialog
	  title="送信メッセージ確認"
	  :visible.sync="dialogVisible"
	  width="30%"
	  >
	  <div v-html="nl2br(textarea)" class="message-inputarea msg-view"></div>
	  <span slot="footer" class="dialog-footer">
	    <el-button @click="dialogVisible = false">キャンセル</el-button>
	    <el-button type="primary" v-if="userLoad" @click="sendMsgApi">送信する</el-button>
	  </span>
	</el-dialog>



</div>
<script>
window.onload = async function() {

	const sendOptions = [

			{key : 1 , name : '単価月極'},
			{key : 2 , name : 'D単価'},
			{key : 3 , name : '365日対応'},
			{key : 4 , name : '市場カレンダー対応'},
	
		];

	const app = new Vue({

	    /*
	    ****************************************/
		el: '#yasai_msg',

	    /*
	    ****************************************/
		data() {

			return {
				
				API    : 'https://hiyoshi.api.line.cx/',
				TOKEN  : 'hiyoshi.info.token',
				MSGAPI : 'https://push.line.cx/noCript.php',
				liffId : '1655849208-lwgKwY2V',
				referer : 'hiyoshi.liff.cloud',


				isLoading : true,
				textarea :'',
				checkboxGroup: [],
				sendFlg : sendOptions,
				dialogVisible : false,
				userLoad      : false,

				sendUsers     : [],

			};

		},

		mounted (){

			this.isLoading = false

		},

		conputed :{


		},

		watch : {
			checkboxGroup : function(v){
				console.dir(v)
			}
		},

	    /*
	    ****************************************/
		methods: {

			loadUsers : function(){

				// フラグに対応したユーザーデータをロードする。
				var flg = []
				this.checkboxGroup.forEach( (v) => { flg.push( 'flg_' + v ) } )

				var params = new FormData();
		        params.append( 'token'  , this.TOKEN )
		        params.append( 'action' , 'getFlgUsers' )
		        params.append( 'flgs'   , JSON.stringify(flg) )

        		axios.post( this.API , params )
	            .then( function(result){

	            	if( result.data != 'null' ){

		            	this.sendUsers = result.data
		            	this.userLoad = true

	            	}

	            }.bind(this))
	            .catch((err) => {


	            })
	            .finally(function(){


	            }.bind(this))

			},

			sendMsgFunction : function(){

				this.userLoad = false

				if( this.checkboxGroup.length == 0 ){

					this.dialogVisible = false
					this.noSelect()

				}
				if( this.textarea == '' ){

					this.dialogVisible = false
					this.noMsg()

				}				
				if( this.checkboxGroup.length != 0 && this.textarea != '' && this.checkboxGroup.length > 0 ){

					this.dialogVisible = true
					this.loadUsers()

				}	

			},

			sendMsgApi : function(){

				let sendTo = []
				this.sendUsers.forEach( (v) => { sendTo.push( v.userId ) } )

				this.isLoading = true

				var params = new FormData();
		        params.append( 'referer' , this.TOKEN )
		        params.append( 'msg' , this.textarea )
		        params.append( 'to'  , JSON.stringify( sendTo ) )

        		axios.post( this.MSGAPI , params )
	            .then( function(result){

	            	if(result.data == 200){

	            		this.dialogVisible = false
	            		this.textarea = ''
	            		this.checkboxGroup = []

	            	}

	            }.bind(this))
	            .catch((err) => {

	            	console.dir(err)

	            })
	            .finally(function(){

	              	this.isLoading = false

	            }.bind(this))


			},

			/* HELPER
			******************/
			nl2br : function(value){

				if(value != undefined){
					return value.replace(/\r?\n/g, '<br>')
				}
				else{
					return value
				}

			},

			noSelect() {
				this.$alert('配信フラグが設定されていません', '要確認！', {
					confirmButtonText: 'OK',
				});
			},
			noMsg() {
				this.$alert('メッセージが入力されていません', '要確認！', {
					confirmButtonText: 'OK',
				});
			}

		}, //method


	})//Vue App

}// window.onload
</script>