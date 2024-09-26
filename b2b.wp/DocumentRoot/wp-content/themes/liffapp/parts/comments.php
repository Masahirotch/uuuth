<?php
/*
パーツ：コメント
*/
if ( post_password_required() ) {
	return;
}
?>

<div id="comment">

	<?php if ( have_comments() ) : ?>

		<ol class="comment-list">
			<?php
				wp_list_comments( array(
					'style'       => 'ol',
				) );
			?>
		</ol>

	<div class="comment-page-link">
	<?php paginate_comments_links(); ?>
	</div>
	<?php endif; ?>

	<?php comment_form(); ?>

</div>
