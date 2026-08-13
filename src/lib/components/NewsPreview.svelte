<script lang="ts">
	// Latest-Aktualności preview (HOME-02, NEWS-01). Data-driven: the homepage load
	// supplies the three newest posts (readLatest(3)) and renders the shared NewsCard
	// per post (UI-SPEC „Homepage NewsPreview realignment"). The homepage gates this
	// component on posts.length, so the empty {:else} branch is a safety net only and
	// never renders on the homepage (Amendment v1.1 §1). Post typed via the client-safe
	// shared shape from $lib/content/site ($lib/server is server-only, not importable here).
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Cta from './Cta.svelte';
	import NewsCard from './NewsCard.svelte';
	import type { Post } from '$lib/content/site';

	let { posts }: { posts: Post[] } = $props();
</script>

<section class="news" aria-labelledby="news-heading">
	<div class="news-inner">
		<div class="news-header">
			<h2 id="news-heading">Aktualności</h2>
			<Cta href="/aktualnosci" variant="secondary">Zobacz wszystkie</Cta>
		</div>

		{#if posts.length > 0}
			<div class="news-grid">
				{#each posts as post (post.href)}
					<NewsCard
						tytul={post.tytul}
						href={post.href}
						iso={post.iso}
						dataDisplay={post.dataDisplay}
						excerpt={post.excerpt}
						obraz={post.obraz}
						obraz_alt={post.obraz_alt}
					/>
				{/each}
			</div>
		{:else}
			<!-- Safety-net empty state (also used by /aktualnosci). The homepage gates
			     this component on posts.length, so this branch never renders there
			     (UI-SPEC Amendment v1.1 §1). -->
			<div class="empty">
				<Newspaper class="empty-icon" size={40} aria-hidden="true" focusable="false" />
				<h3 class="empty-heading">Wkrótce pojawią się aktualności</h3>
				<p class="empty-body">
					Nie opublikowaliśmy jeszcze żadnych wpisów. Zajrzyj tu wkrótce, będziemy informować o
					wydarzeniach i nowościach z życia żłobka.
				</p>
			</div>
		{/if}
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

	/* Responsive card grid (1/2/3 columns), matching the o-nas/dokumenty grid
	   tokens (24px gap). No new design tokens introduced. */
	.news-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 768px) {
		.news-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.news-grid {
			grid-template-columns: repeat(3, 1fr);
		}
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
