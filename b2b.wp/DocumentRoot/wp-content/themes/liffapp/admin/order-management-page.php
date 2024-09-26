<script type="text/x-template" id="modal-template">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper" >
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              default header
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
            	<slot name="csvDL"></slot>
            	<a @click="$emit('close')">閉じる</a>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</script>
<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  max-width: 400px;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  padding-top:1em;
  max-height: 95vh;
}

.modal-header h3 {
	margin-top: 0;
    color: #077945;
    text-align: left;
    padding-left: 1em;
    font-size:17px;
}

.modal-body {
  margin: 20px 0;
  padding-left:2em;
  max-height: 60vh;
  overflow-y: scroll;
}
.modal-body *{
	text-align:left;
}
.modal-body h4{
	font-size:15px;
	margin-block-start: 0.5em;
    margin-block-end: 0.5em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}
.modal-body p{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack:justify;justify-content: space-between;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
	font-size:14px;
	line-height:1.4em;
	margin:0.4em 0;
}
.modal-body p span{
	width:100%;
}
.modal-body p span b{
	letter-spacing: 0.05em;
}




.modal-footer{
	display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: space-between;-ms-flex-pack:justify;justify-content: space-between;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    border-top:1px solid #ccc;
}

.modal-footer a:first-child{
	border-right:1px solid #ccc;
}

.modal-footer a{
	width:100%;
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
	padding:1em;
	color: #4d4d4d;
	transition: all 0.2s ease;
}
.modal-footer a:hover{
	color:#000;
	transition: all 0.2s ease;
	background:#efefef;
	cursor: pointer;
}

.modal-enter { opacity: 0; }
.modal-leave-active { opacity: 0; }
.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}


</style>





<?php
/**
 * Displays top navigation
 *
 * @package WordPress
 * @subpackage smartconcierge
 * @since 1.0
 * @version 1.2
 */



global $wpdb;
global $current_user;
global $path;
$tpl = get_template_directory_uri();

global $post;
$id = $post->ID;

HelperCss();
VueVuexAxios();

$thisMonth = ($_GET['select_date'] != null && $_GET['select_date'] != '選択')? date('Y年m月',strtotime($_GET['select_date']) ) : date('Y年m月');
$YearMonth = ($_GET['select_date'] != null && $_GET['select_date'] != '選択')? date('Y-m',strtotime($_GET['select_date']) ) : date('Y-m');


?>



<style>
.ResList{padding-right:2em;}
h2 span.header{margin-right:2em}.Calender tr td:nth-of-type(1),.Calender tr th:nth-of-type(1){color:red}.Calender tr td:nth-of-type(7),.Calender tr th:nth-of-type(7){color:#00f}
.DayList{
	margin-bottom:3em;
	display:-webkit-flex;display:-ms-flexbox;display:flex;
	-ms-flex-flow:row wrap;flex-flow:row wrap;
	-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;
	-webkit-align-items:center;-ms-flex-align:center;align-items:center}
.DayList>*{
	width:calc(100% / 28);
	padding:.8em;border-right:1px solid #ccc;display:-webkit-flex;display:-ms-flexbox;display:flex;-ms-flex-flow:column nowrap;flex-flow:column nowrap;-webkit-justify-content:flex-start;-ms-flex-pack:start;justify-content:flex-start;-webkit-align-items:center;-ms-flex-align:center;align-items:center}

	.DayList>* span{font-size:.8em}.DayList>:hover{cursor:pointer;background:#fff}.satday{color:#00f}.sunday{color:red}button{font-size:14px;line-height:2;color:#32373c;border:1px solid #7e8993;background:#fff;box-shadow:none;border-radius:3px;padding:0 8px;min-height:30px;-webkit-appearance:none;cursor:pointer;vertical-align:middle}button:hover{background:#ccc}button:active{border:1px solid #333}table{width:100%;border-collapse:collapse;border-spacing: 0px;}
table tr:nth-child(odd):not(:nth-child(1)){background:#FFF;}
table tr:nth-child(even):not(:nth-child(1)){background:#eaeaea;}
table tr td{padding:.5em;border-right:1px solid #ccc}table tr td.icon{text-align:center;width:4em}[v-cloak]{display:none}
.bold{font-weight:bold;letter-spacing: 0.05em;color:#222;}
.td-memo{
	width:100%;
	display: -webkit-flex; display: -ms-flexbox; display: flex;
	-ms-flex-flow:column nowrap;flex-flow:column nowrap;
	-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start; 
	-webkit-align-items: center;  -ms-flex-align: center; align-items: center;
	padding:0.5em;
	margin:0;
	box-sizing: border-box;
}

.td-memo span{display:block;width:100%;font-size:1.1em;text-align:left;}
.csvDLbtn{line-height:1.4em;padding-top:0.4em;padding-bottom:0.4em;}




</style>

<div id="app">
	<h2>
		<span class="header">管理 - <?php echo $thisMonth; ?></span>
		<select v-model="selected">
			<option disabled>選択</option>
		  	<option v-for="(option , index) in options" v-bind:value="option.value">{{option.text}}</option>
		</select>
		<button @click="go">選択</button>

	</h2>
	<h3>納品予定日を選択</h3>
	<div class="scroll-x-95">
		<div class="DayList">
			<div class="all" @click="filterClear()">ALL</div>		
<?php

// 現在の年月


// 来月
$next_month = date('m', mktime(0, 0, 0, date('n') + 1, 1, date('Y')));

$y = date("Y");  //現在の「年」
$m = date("m");  //現在の「月」




//今月最初の曜日を取得
$first_day_week = date("w", mktime(0, 0, 0, $m, 1, $y));
//今月最後の日を取得（翌月の 0 日）
$last_day = date("d", mktime(0, 0, 0, $m + 1, 0, $y));
//今月最後の日の曜日を取得
$last_day_week = date("w", mktime(0, 0, 0, $m, $last_day, $y));
//または、$last_day_week = date("w", mktime(0, 0, 0, $m + 1, 0, $y));

for($d = 1; $d <= $last_day; $d ++) {

	$weekView = date("D", mktime(0, 0, 0, $m, $d, $y));
	//$weekClass = ( date("w", mktime(0, 0, 0, $m, $d, $y)) == 1)? "class='sunday'":"";
	//$weekClass = ( date("w", mktime(0, 0, 0, $m, $d, $y)) == 7)? "class='satday'":"";
	$dd = date("w", mktime(0, 0, 0, $m, $d, $y));

	$weekClass = '';
	if( date("w", mktime(0, 0, 0, $m, $d, $y)) == 0 ){ $weekClass = "class='sunday'" ;}
	if( date("w", mktime(0, 0, 0, $m, $d, $y)) == 6 ){ $weekClass = "class='satday'" ;}

	$dd = sprintf('%02d', $d);

print <<< EOF
	<div {$weekClass} @click="FilterDate('{$YearMonth}-{$dd}')">{$d}<br><span>{$weekView}</span></div>\n
EOF;
}

?>	
		</div>
	</div>

	<div class="ResList">
		<table v-cloak>
		<tr>
			<th>一括DL</th>
			<th>発注ID</th>
			<th>発注日時</th>
			<th>納品日</th>
			<th>顧客コード</th>
			<!--<th>店舗名</th>-->
			<th>発注者</th>
			<th>発注メモ</th>
			<th>受注CSVダウンロード</th>
		</tr>

		<tr v-for="(order , index) in orders" v-if="order.show === true && index !== 0">
			<td></td>
			<td>{{order.id}}</td>
			<td>{{order.order_date}}</td>
			<td class="bold">{{order.delivery_date}}</td>
			<td>{{order.user_code}}</td>
			<!--<td>na</td>-->
			<td>{{order.user_name}}</td>
			<td class="center" style="max-width:15em;">
				<div v-if="order.memo != null" class="td-memo">
			        	<span>{{order.memo}}</span>
			    </div>
			</td>

			<td class="center">
				<button @click="order.showCSV = true" class="csvDLbtn">受注ID:{{order.id}} <br>CSVをDL</button>

			      <modal v-if="order.showCSV" @close="order.showCSV = false">
			        <h3 slot="header">受注ID : {{order.id}}  /  店舗コード : {{order.user_code}}</h3>
			        <div slot="body">
			        	<h4>納品日 : {{order.delivery_date}}</h4>
			        	<p v-for="(product , index ) in order.products">
			        		<span>商品コード : <b>{{index}}</b></span>
			        		<span>数量 : {{product}}</span>
			        	</p>
			        </div>
				    <a slot="csvDL" @click="csv(index)">CSV ダウンロード</a>
			      </modal>

  			</td>

		</tr>
	</div>




</div><!--#app-->
<script>
<?php
date_default_timezone_set('Asia/Tokyo');

?>
//var ajaxurl = '/wp-admin/admin-ajax.php';
var TargetIndex;


Vue.component("modal", {
	template: "#modal-template"
});



var app = new Vue({
  el: '#app',
  data: {
  	selected:'<?php echo ($_GET['select_date'] != null && $_GET['select_date'] != '選択')? 
		date('Y-m',strtotime($_GET['select_date']) ) : date('Y-m');?>',

	///////////////////
    options: [
<?php for ( $var = -2; $var <= 4; $var++ ) :?>

		//////////// <?php echo date('Y-m', strtotime( date("Y-m-01") . " -{$var} month"));?>

      { text: '<?php echo date('Y年m月', strtotime( date("Y-m-01") . " -{$var} month"));?>', value: '<?php echo date('Y-m', strtotime( date("Y-m-01") . " -{$var} month"));?>' },
<?php endfor; ?>
    ],
    orders : [
    	{
    		id : '',
    		order_date : '',
    		delivery_date : '',
    		user_code : '',
    		line_code : '',
    		user_name : '',
    		show : true,
    		products : [],
    		showCSV : false,
    		showMemo : false,
    		memo : null
    	}
    ],



  },
  methods: {

    csv: function(index){

    	  var orderObj = this.orders[index]
          var csvDownload = new FormData()

          csvDownload.append('action', 'DownloadCSV')
          //csvDownload.append('action', 'post_test')
          
          csvDownload.append('user_code', orderObj.user_code)
          csvDownload.append('delivery_date', orderObj.delivery_date)
          csvDownload.append('products', JSON.stringify(orderObj.products) )
          axios.post(ajaxurl, csvDownload,{responseType:'blob'})
            .then(function(blob){

            	//console.dir(blob)
            	var fi = this.orders[index]

            	// 戻ってきたデータに対して、擬似的にダウンロードリンクを作成し、擬似的にクリックでダウンロードとする
				const url = window.URL.createObjectURL(new Blob([blob.data]));
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', fi.user_code + '_' + fi.id + '_' + fi.delivery_date + '.csv');
				document.body.appendChild(link);
				link.click();



            }.bind(this))
	        .catch(function(error) {
	        	console.dir('csvDownload error')
	            console.dir(error)

	        }.bind(this))




    },
  	// 月切り替え
  	go : function(index){

  		var arg = new Object;
		var pair=location.search.substring(1).split('&');
  		
  		var url = 'https://hiyoshi.liff.cloud/wp-admin/admin.php?' + pair[0] + '&select_date=' + this.selected;

  		window.location = url;

  	},
  	updateRes: function(){

  		console.dir( 'order-management-page > updateRes ▶︎' )

  		console.dir( 'this.selected' )
  		console.dir( this.selected )


		var data = new FormData()       
		data.append('action', 'GetOrders')
		data.append('date', this.selected )
		axios.post( ajaxurl , data ).then(function(responce){

				console.dir(responce.data)



				var res = responce.data
				var len = Object.keys(responce.data);

				for (let step = 0; step < len.length; step++) {

					var target = len[step]

					this.orders.push({
						id : res[target].id,
						user_code : res[target].shop_code,
			    		line_code : res[target].userId,
			    		user_name : res[target].displayName,
			    		order_date : res[target].date,
			    		show : true,
			    		products : res[target].products,
			    		delivery_date : res[target].delivery_date,
			    		showCSV : false,
			    		memo : res[target].memo,
					})

				}

				console.log('methods : updateRes -> ' + this.selected + ' | axios : GetOrders success.')


			}.bind(this))
			.catch(function(error) {
			    console.dir(error)
			})


  	},
  	ResDelete: function(){



  	},

  	FilterDate: function(date){

    	console.log('選択した日付 : ' + date)

        for( var i in this.orders ) {

            var order = this.orders[i];

            if(order.delivery_date.indexOf(date) !== -1) {

            	this.orders[i].show = true

            }
            else{

            	this.orders[i].show = false

            }

        }

        return

  	},

  	filterClear: function(){

        for(var i in this.orders) {

        	this.orders[i].show = true

        }


  	},





  },
  created: function() {
  		//
        this.updateRes()

  },
  computed: {


  }

})
</script>