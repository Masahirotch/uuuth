	<a href="/cart-test/" id="NaviBar" v-cloak ref="global" >
		<p>{{displayName}}</p>
		<div CartLink >
			<i class="fa fa-shopping-basket"></i>
			<span v-if="cartNum > 0">{{cartNum}}</span>
		</div>
	</a>