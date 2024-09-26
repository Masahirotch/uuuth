
	<!-- // inc app.footer // -->
	<footer>
		<nav>
			<a href="/">
				<i class="fas fa-carrot"></i>
				<span>{{printProductList}}</span>
			</a>
			<a href="/cart/">
				<i class="fas fa-shopping-basket"></i>
				<span>{{printCart}}</span>
				<span v-if="cartNum > 0" id="footer_cartnum">{{cartNum}}</span>
			</a>
			<a href="/history/">
				<i class="far fa-calendar-alt"></i>
				<span>{{printHistory}}</span>
			</a>
			<a href="/config/">
				<i class="fas fa-cog"></i>
				<span>{{printConfig}}</span>
			</a>
		</nav>
	</footer>
	<!-- // inc app.footer // -->
