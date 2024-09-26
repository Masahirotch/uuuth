<?php
/* ouentai_herb_orderlist */

global $wpdb;
global $current_user;
global $path;

VueJS();
VuexJS();
AxiosJS();

    /* db.hiyoshi setting */
    $db_user = $wpdb->dbuser; 
    $db_passwd = $wpdb->dbpassword; //データベース接続用パスワードの取得
    $db_host = $wpdb->dbhost; //データベースホストの取得
    $hiyoshi = new wpdb( $db_user, $db_passwd, 'hiyoshi', $db_host );

?>

<!-- Days.js -->
<script src="https://unpkg.com/dayjs@1.8.21/dayjs.min.js"></script>
<script src="https://unpkg.com/dayjs@1.8.21/locale/ja.js"></script>

<!-- ElementUI -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css" >
<script src="https://unpkg.com/element-ui@2.12.0/lib/index.js"></script>
<style>
[v-cloak] {display: none;}
#wpbody{padding-right:1.3em;}
.date-list{
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row wrap;flex-flow:row wrap;
	-webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start; 
	-webkit-align-items: stretch; -ms-flex-align:stretch; align-items: stretch;
	margin-bottom:1em;
}
.date-list a{min-width:3em;display:inline-block;padding:0.6em 0.6em;background:#FFF;margin:0.3em 0.2em;text-decoration: none;color:#000;text-align:center;font-size:min(4vmin,14px);}
.date-list a:hover{background:#ccc;cursor: pointer;}

.date-list a.active{background:#333;color:#FFF;}

.el-message.el-message--error{margin-top:4em;}

table.list-item{width:100%;}

table.list-item tr{border-bottom:1px solid #ccc;}

table.list-item tr:nth-child(odd) {background:#FFF;}
table.list-item tr:nth-child(even) {background:#f5f5f5;}

table.list-item tr th,table.list-item tr td{padding:1em;}

table.list-item tr th{text-align:left;}

table.list-item tr td{}

.right{text-align:right;}
.top-2{margin-top:2em;}

</style>
<h2>応援隊　注文リスト <?php echo substr($_GET['date'], 0, 7);?></h2>
<div class="app-box" id="ouentai" v-cloak>


  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="利用者リスト" name="users">
    
	    <el-table :data="users" style="width: 100%" empty-text="データがありません">

			<el-table-column
			prop="bizName"
			label="登録事業者名">
			</el-table-column>

			<el-table-column
			prop="manager"
			label="担当者名">
			</el-table-column>

			<el-table-column
			prop="address"
			label="住所">
			</el-table-column>

			<el-table-column
			prop="tel"
			label="電話番号">
			</el-table-column>

    	</el-table>

    </el-tab-pane>


    <?php 
    	$url2 = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    	$url = "https://hiyoshi.liff.cloud/wp-admin/admin.php?page=home%2Fkusanagi%2Fhiyoshi%2FDocumentRoot%2Fwp-content%2Fthemes%2Fliffapp%2Ffunctions%2Fouen.php";
    ?>

	<?php 
	// 現在の月
	$month = date('n');

	for ( $var = $month - 2; $var >= -1; $var-- ) :?>	
	<el-tab-pane 
		label="<?php echo date('Y年m月', strtotime( date("Y-m-01") . " -{$var} month"));?>" 
		name="<?php echo date('Y-m', strtotime( date("Y-m-01") . " -{$var} month"));?>" >

			<div class="date-list">
				
				<?php 
					$month = date( 'Y-m', strtotime( date("Y-m-01") . " -{$var} month") );
					$m     = date( 'n', strtotime( date("Y-m-01") . " -{$var} month") );				
					$lastDate = date('d', strtotime('last day of ' . $month));
				?>

				<?php for( $loop = 1; $loop <= $lastDate; $loop++ ):?>
					<a 
						v-on:click="dataFilter('<?php echo date('Y-m') . '-' .sprintf('%02d', $loop);?>')" 
						v-bind:class="{ active : ( '<?php echo date('Y-m') . '-' .sprintf('%02d', $loop);?>'  == daySelect ) }"
					>
						<?php echo $m .' / ' . $loop;?>		
					</a>
				<?php endfor;?>
			</div>

			<div class="order-list">
				<table class="list-item" >
					<tr v-for="(item , index) in monthOrder" v-if="( daySelect != '' && daySelect == chengeDate(item.orderDate) ) || daySelect == '' ">
						<td>{{item.order_id}}</td>
						<td>
							{{chengeDate(item.orderDate)}}
						</td>
						<th>{{item.orderDate|onlyDate}}</th>
						<th>{{item.bizName}} ({{item.manager}})</th>
						<td>点数 : {{item.orderNum}}点</td>
						<td>
							<p v-for="(oreder) in item.orderArray">{{oreder.productName}} x {{oreder.quantity}}</p>
						</td>

					</tr>
				</table>
				<div class="right top-2">
					<el-button type="primary" plain @click="csvCheck( daySelect )">表示されているデータをダウンロード</el-button>
				</div>
			</div>

			<!-- ここにデータテーブルが入ります -->
<pre>

<?php
$order_month = date('Y-m', strtotime( date("Y-m-01") . " -{$var} month"));
$month_data = $hiyoshi->get_results( " SELECT * FROM ouentai_orderlist WHERE orderDate LIKE '{$order_month}%' " , OBJECT );





?>

</pre>


<script>
const order_<?php echo date('Ym', strtotime( date("Y-m-01") . " -{$var} month"));?> = [
<?php foreach($month_data as $val):?>
	{ 
		order_id : '<?php echo $val->order_id;?>',
		bizName  : '<?php echo $val->bizName;?>', 
		manager  : '<?php echo $val->manager;?>', 
		orderNum : '<?php echo $val->orderNum;?>',
		orderDate: '<?php echo $val->orderDate;?>',
		orderArray : {
<?php $orderData = unserialize($val->orderArray);?>
		<?php foreach( $orderData as $key => $value ):?>
			'<?php echo $key;?>' : {
				'productId' : '<?php echo $value['productId'];?>',
				'productName' : '<?php echo $value['productName'];?>',
				'productPrice' : '<?php echo $value['productPrice'];?>',
				'quantity' : '<?php echo $value['quantity'];?>',
			},
		<?php endforeach;?>
		},
},
<?php endforeach;?>
]
</script>



			<!-- ここにデータテーブルが入ります -->

	</el-tab-pane>
	<?php endfor; ?>

  <div style="margin-top:2em;text-align:right;" v-if="download">
  	<el-button type="primary" @click="csvDL('<?php echo $_GET['date'];?>')">CSVデータをダウンロード</el-button>
  </div>

  </el-tabs>




</div>
<script>
window.onload = async function() {

	//////////////////////////////////////////////////
	const users = [
	<?php  $users = $hiyoshi->get_results( " SELECT * FROM ouentai_orderlist GROUP BY userId " , OBJECT ); ?>
	////////// テーブル作成用ループ
	<?php foreach($users as $val):?>
	      {
	        bizName     : '<?php echo $val->bizName;?>', manager     : '<?php echo $val->manager;?>', tel : '<?php echo $val->tel;?>',
	        address     : `<?php echo $val->pref_jp;?><?php echo $val->city_jp;?><?php echo $val->address;?>`,
	      },
	<?php endforeach;?>
	//////////
	];
	//////////////////////////////////////////////////



	const app = new Vue({

	    /*
	    ****************************************/
		el: '#ouentai',

	    /*
	    ****************************************/
		data: {

			download : <?php echo ($_GET['date'])? 'true':'false';?>,

			activeName: '<?php echo ( $_GET['date'] )? substr($_GET['date'], 0, 7) :''; ?>',

	        users      : users,

	        monthOrder : '',

	        daySelect  : '',

	        monthSelect : ''

		},

	    /*
	    ****************************************/
		methods: { 

		    handleClick(tab, event) {

		        console.log(tab.name);

		        if( tab.name != 'users' ){

		        	this.daySelect = ''
		        	this.monthSelect = tab.name

		        	var target = tab.name.replace(/-/, '')

		        	//動的変数作成　var targetName = 'order_' + target 
		        	eval("var targetName = order_" + target + ";");
		        	this.monthOrder = targetName
		        	console.dir( this.monthOrder )

		        }

		    },

		    dataFilter : function(dateCode){

		    	this.daySelect = dateCode
		    	console.dir(this.daySelect)

		    },

		    csvDL : function(date){

				var data = new FormData();
				data.append('action', 'chkOrderOuentai');
				data.append('date', date );

				axios.post(ajaxurl, data)

			        .then(function(responce){

			        	if( responce.data.length != 0 ){

			        		this.dlCSV(date)
			        	}
			        	else{
					    
					        this.$message({
					          showClose: true,
					          message: 'ダウンロードできるオーダーがありません',
					          type: 'error'
					        });			        		
			        	
			        	}

			        }.bind(this))
			        .catch(function(responce){

			          console.log(responce);

			        });

		    },
		    dlCSV : function(date){

		    	window.open('/csvdl/?date=' + date , '_blank')


		    },
		    chengeDate : function(value){


		    	return dayjs(value).format('YYYY-MM-DD')

		    },
		    csvCheck : function(value){

		    	if(value == '') value = this.monthSelect

		    	if(this.monthOrder.length == 0) return this.noData()

		    	console.dir(value)
		    	console.dir(this.monthOrder.length)

		    	window.open('/csvdl/test.php?date=' + value , '_blank')



		    },
		    noData : function(){

		        this.$alert('ダウンロードするデータがありません。\n日付などを選択してデータを表示してください。', 'データがありません', {
		          confirmButtonText: 'OK',
		        });

		    },





		}, //method


		filters:{

			number_format : function (value) {
  				let formatter = new Intl.NumberFormat('ja-JP');
  				return formatter.format(value);
			},

			onlyDate : function(value){

				return dayjs(value).format('MM/DD') 

			},


		},

	})//Vue App


}// window.onload
</script>