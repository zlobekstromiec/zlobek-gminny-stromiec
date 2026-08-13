<script lang="ts">
	// Latest-Aktualności preview (HOME-02). No posts exist until Phase 3, so the
	// REQUIRED empty state is rendered (UI-SPEC §Latest-Aktualności). The post-grid
	// card contract is documented in the UI-SPEC and lands with the CMS in Phase 3.
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Cta from './Cta.svelte';
</script>

<section class="news" aria-labelledby="news-heading">
	<div class="news-inner">
		<div class="news-header">
			<h2 id="news-heading">Aktualności</h2>
			<Cta href="/aktualnosci" variant="secondary">Zobacz wszystkie</Cta>
		</div>

		<!-- Empty state: shown on /aktualnosci until Phase 3 posts exist. The
		     homepage no longer renders this component while posts.length is 0
		     (UI-SPEC Amendment v1.1 §1). -->
		<div class="empty">
			<Newspaper class="empty-icon" size={40} aria-hidden="true" focusable="false" />
			<h3 class="empty-heading">Wkrótce pojawią się aktualności</h3>
			<p class="empty-body">
				Nie opublikowaliśmy jeszcze żadnych wpisów. Zajrzyj tu wkrótce, będziemy informować o
				wydarzeniach i nowościach z życia żłobka.
			</p>
		</div>
	</div>
</section>

<style>
	.news {
		background: var(--color-surface-warm);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.news {
			padding-block: 96px;
		}
	}

	.news-inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
	}

	@media (min-width: 768px) {
		.news-inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.news-inner {
			padding-inline: 32px;
		}
	}

	.news-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 24px;
	}

	.news-header h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 48px 24px;
	}

	.empty :global(.empty-icon) {
		color: var(--color-brand-blue);
	}

	.empty-heading {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.empty-body {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		max-width: 48ch;
		margin: 0;
	}
</style>
