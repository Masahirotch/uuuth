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

$lots = GetLot();

AdminCss();
VueJS();
VuexJS();
AxiosJS();
?>
<script>
window.onload = async function() {

	const app = new Vue({

	    /*
	    ****************************************/
		el: '#lot_app',

	    /*
	    ****************************************/
		data: {
			min_lot: '',
			unit   : '',
			id     : '',
			uid     : '',
			lots:[
			<?php foreach($lots as $key => $val):?>
				{ 
					min_lot: '<?php echo $val->min_lot;?>',
					id: <?php echo $val->id;?> , 
					unit : '<?php echo $val->unit;?>',
					uid : '<?php echo ($val->uid!= null && $val->uid!= '' )? $val->uid : 'u' . time() . rand(0,100);?>' },
			<?php endforeach;?>
			]
		},

	    /*
	    ****************************************/
		methods: { 
			
			/*---------------------------------*/
			addLot: function(index) {

				var NewIndex = this.lots.length + 1;

				var item = {
				  min_lot: this.min_lot,
				  unit   : this.unit,
				  id     : NewIndex,
				};
				
				this.lots.push(item);
				this.min_lot = '';
				this.unit = '';
			
			},
			/*---------------------------------*/
			
			/*---------------------------------*/
		    deleteLot: function(index) {

		        if (confirm('ID : ' + (index+1) +' を本当に削除しますか?')) {
		        
		          this.lots.splice(index, 1);
		        
		        }

		    },
		    /*---------------------------------*/

		    /*---------------------------------*/
		    saveDB: function(){
		  		
				// console.dir(this.lots)

				var data = new FormData();
				data.append('action', 'update_lot');
				data.append('lots', JSON.stringify( this.lots ) );

				axios.post(ajaxurl, data)

			        .then(function(responce){

			        	console.dir(responce.data);

			          	alert('データを登録しました');

						window.location.reload();

			        })
			        .catch(function(responce){

			          console.log(responce);

			        });

			}
			/*---------------------------------*/


		}//method

	})//Vue App

}// window.onload
</script>

<h2>商品発注ロット管理</h2>
<div class="app-box" id="lot_app">

	<div class="split mb20">
		<h3>最低ロットを登録していきます。</h3>
		<div style="text-align:right;"><button class="save" @click="saveDB()">データを保存する</button></div>
	</div>

	<dl>
		<dt>番号</dt>
		<dt>数量</dt>
		<dt>販売単位</dt>
		<dt>&nbsp;</dt>
	</dl>

	<section v-for="(item, index) in lots">

		<dl>
			<dd>{{ item.id }}</dd>
			<dd>{{ item.min_lot }}</dd>
			<dd>{{ item.unit }}</dd>
			<dd><button class="delete" @click="deleteLot(index)">削除</button></dd>
			<input type="hidden" v-model.trim="item.id">
			<input type="hidden" v-model.trim="item.min_lot">
			<input type="hidden" v-model.trim="item.unit">
			<input type="hidden" v-model.trim="item.uid">
		</dl>

	</section>


	<form v-on:submit.prevent="addLot" class="split-3 component width60 pt50">

		<label class="width45">
			<span>数量</span>
			<input type="text" value="" placeholder="10パック" v-model="min_lot" required>
		</label>

		<label class="width45">
			<span>単位</span>
			<input type="text" value="" placeholder="200g / パック" v-model="unit" required>
		</label>

		<label class="width10 center-center pt20">
			<button type="submit" class="add">追加</button>
		</label>

	</form>


</div>