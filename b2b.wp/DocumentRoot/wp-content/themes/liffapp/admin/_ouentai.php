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

<!-- import CSS -->
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
<!-- import JavaScript -->
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
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
.date-list a:hover{background:#ccc;}

.date-list a.active{background:#333;color:#FFF;}

.el-message.el-message--error{margin-top:4em;}

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
    	$url = "https://hiyoshi.liff.cloud/wp-admin/admin.php?page=home%2Fkusanagi%2Fhiyoshi%2FDocumentRoot%2Fwp-content%2Fthemes%2Fliffapp%2Ffunctions%2Fouentai.php";
    ?>

	<?php for ( $var = 1; $var >= -2; $var-- ) :?>	
	<el-tab-pane 
		label="<?php echo date('Y年m月', strtotime( date("Y-m-01") . " -{$var} month"));?>" 
		name="<?php echo date('Y-m', strtotime( date("Y-m-01") . " -{$var} month"));?>">

			<div class="date-list">
				<?php 
					$month = date( 'Y-m', strtotime( date("Y-m-01") . " -{$var} month") );
					$m     = date( 'n', strtotime( date("Y-m-01") . " -{$var} month") );				
					$lastDate = date('d', strtotime('last day of ' . $month));
				?>
				<?php for( $loop = 1; $loop <= $lastDate; $loop++ ):?>
					<a href="<?php echo $url . '&date=' . $month . '-' .sprintf('%02d', $loop); ?>" 
					   id="<?php echo date('Y-m') . '-' .sprintf('%02d', $loop);?>"
					   <?php echo ( ( $month . '-' .sprintf('%02d', $loop) ) ==  $_GET['date'] )? 'class="active"': '';?>
					>
					<?php echo $m .' / ' . $loop;?>
					</a>
				<?php endfor;?>
			</div>

			<?php $table_date = date('Ym', strtotime( date("Y-m-01") . " -{$var} month"));?>
	
		    <el-table :data="D_<?php echo $table_date;?>" style="width: 100%" empty-text="データがありません">

				<el-table-column
				prop="orderDate"
				label="発注日">
				</el-table-column>

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

				<el-table-column
				prop="p_1_num"
				label="ハーブ">
				</el-table-column>

				<el-table-column
				prop="p_2_num"
				label="リーフ">
				</el-table-column>

		    </el-table>



	</el-tab-pane>
	<?php endfor; ?>

  </el-tabs>


  <div style="margin-top:2em;text-align:right;" v-if="download">
  	<el-button type="primary" @click="csvDL('<?php echo $_GET['date'];?>')">CSVデータをダウンロード</el-button>
  </div>

</div>
<script>
window.onload = async function() {

	const app = new Vue({

	    /*
	    ****************************************/
		el: '#ouentai',

	    /*
	    ****************************************/
		data: {

			　download : <?php echo ($_GET['date'])? 'true':'false';?>,

			 activeName: '<?php echo ( $_GET['date'] )? substr($_GET['date'], 0, 7) :''; ?>',

	          users : [

	          <?php  
	          $users = $hiyoshi->get_results( "
	          	SELECT 
	          		*
	          	FROM 
	          		ouentai_herb_orderlist
	          	GROUP BY 
	          		userId
	          " , OBJECT ); 

	          ?>

	          ////////// テーブル作成用ループ
	          <?php foreach($users as $val):?>
		          {
		            bizName     : '<?php echo $val->bizName;?>',
		            manager     : '<?php echo $val->manager;?>',
		            address     : `<?php echo $val->pref_jp;?><?php echo $val->city_jp;?><?php echo $val->address;?>`,
		            tel         : '<?php echo $val->tel;?>',
		          },
		      <?php endforeach;?>
		      //////////
	          ],



	<?php for ( $var = 1; $var >= -2; $var-- ) :?>	

		<?php $date = date('Ym', strtotime( date("Y-m-01") . " -{$var} month"));?>

		<?php

			$search_d = date( 'Y-m', strtotime( date("Y-m-01") . " -{$var} month") );

			if( $_GET['date'] && substr($_GET['date'], 0, 7) == $search_d ){

				$sqldate = $_GET['date'];

			}
			else{

				$sqldate = date('Y-m', strtotime( date("Y-m-01") . " -{$var} month"));

			}


		?>

			<?php

	          $orders = $hiyoshi->get_results( "
	          	SELECT 
	          		*
	          	FROM 
	          		ouentai_herb_orderlist
	          	WHERE orderDate LIKE '{$sqldate}%'
	          " , OBJECT ); 

	        ?>

	          D_<?php echo $date;?>: [
	          <?php foreach($orders as $val):?>
	          	////////////////////////////////

		          {
		            orderDate : '<?php echo date("m / d" , strtotime( $val->orderDate) );?>',
		            bizName   : '<?php echo $val->bizName;?>',
		            order_id  : '<?php echo $val->bizName;?>',
		            manager   : '<?php echo $val->manager;?>',
		            address   : `<?php echo $val->pref_jp;?><?php echo $val->city_jp;?><?php echo $val->address;?>`,
		            tel       : '<?php echo $val->tel;?>',
		            p_1_num   : '<?php echo $val->p_1_num;?>',
		            p_2_num   : '<?php echo $val->p_2_num;?>',
		          },

		       <?php endforeach;?>
		        ///////////////////////////////
	          ],

	<?php endfor; ?>


		},

	    /*
	    ****************************************/
		methods: { 

		    handleClick(tab, event) {
		        console.log(tab, event);
		    },

		    csvDL : function(date){

		    	console.dir(date);


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


		    	console.dir(date)

		    	window.open('/csvdl/?date=' + date , '_blank')



		    }






		}//method

	})//Vue App

}// window.onload
</script>