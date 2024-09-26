	<component is="style" type="text/css">
	.vld-overlay{bottom:0;left:0;position:absolute;right:0;top:0;align-items:center;display:none;justify-content:center;overflow:hidden;z-index:9999}.vld-overlay.is-active{display:flex}.vld-overlay.is-full-page{z-index:9999;position:fixed}.vld-overlay .vld-background{bottom:0;left:0;position:absolute;right:0;top:0;background:#fff;opacity:.5}.vld-overlay .vld-icon,.vld-parent{position:relative}
	</component>

	<div v-if="isLoading" tabindex="0" aria-busy="true" aria-label="Loading" class="vld-overlay is-active is-full-page">
		<div class="vld-background"></div>
		<div class="vld-icon">
			<svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" width="64" height="64" stroke="#000">
				<g fill="none" fill-rule="evenodd">
				<g transform="translate(1 1)" stroke-width="2">
				<circle stroke-opacity=".25" cx="18" cy="18" r="18"></circle>
				<path d="M36 18c0-9.94-8.06-18-18-18">
					<animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.8s" repeatCount="indefinite"></animateTransform>
				</path>
				</g>
				</g>
			</svg>
		</div>
	</div>
