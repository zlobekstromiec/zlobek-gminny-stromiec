<script lang="ts">
	// Aktualności list page (NEWS-01; 03-UI-SPEC.md /aktualnosci composition).
	// Prerendered, zero-JS (inherits prerender = true from +layout.ts): the feed
	// comes from +page.server.ts (readAktualnosci, newest-first). Route adds NO
	// extra <main>/h1 beyond the page heading (the layout owns <main>). Heading
	// order is h1 (Aktualności) then a visually-hidden h2 section wrapper then the
	// card h3, so no level is skipped (Pitfall 5, axe asserts). The card links
	// point at /aktualnosci/{slug}; the [slug] route (Plan 02) prerenders those,
	// tolerated meanwhile as known-future 404s by the /aktualnosci allow-list entry.
	import Seo from '$lib/components/Seo.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import IconFacebook from '$lib/icons/IconFacebook.svelte';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import { contact } from '$lib/content/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const posts = $derived(data.posts);
</script>

<Seo
	title="Aktualności: Publiczny Żłobek w Stromcu"
	description="Wydarzenia, ogłoszenia i nowości z życia Publicznego Żłobka w Stromcu. Najnowsze wpisy znajdziesz na górze."
	canonical="/aktualnosci"
/>

<!-- Page header -->
<header class="page-head">
	<div class="inner">
		<h1>Aktualności</h1>
		<p class="lead">
			Wydarzenia, ogłoszenia i nowości z życia żłobka. Najnowsze wpisy znajdziesz na górze.
		</p>
		<!-- The same link the homepage news header carries (quick 260929-ips, Amendment v1.8),
		     under the lead and OUTSIDE the h1: a link inside the heading would make the page
		     title itself a link target. The heading order above is untouched. -->
		<p class="akcja">
			<a class="link-facebook" href={contact.facebookUrl} target="_blank" rel="noopener noreferrer">
				<IconFacebook size={20} />
				Śledź nas na Facebooku<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
			</a>
		</p>
	</div>
</header>

<section class="band warm" aria-labelledby="lista-heading">
	<div class="inner">
		<h2 id="lista-heading" class="visually-hidden">Wszystkie wpisy</h2>
		{#if posts.length > 0}
			<ul class="grid">
				{#each posts as post (post.slug)}
					<li>
						<NewsCard
							tytul={post.tytul}
							href={post.href}
							iso={post.iso}
							dataDisplay={post.dataDisplay}
							excerpt={post.excerpt}
							obraz={post.obraz}
							obraz_alt={post.obraz_alt}
							uklad="poziomy"
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<!-- Empty state (Amendment v1.1 §1: the inherited empty state lives here).
			     Markup + copy identical to the a11y-tested NewsPreview empty panel. -->
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
	.page-head {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.band {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.band.warm {
		background: var(--color-surface-warm);
	}

	@media (min-width: 1024px) {
		.page-head,
		.band {
			padding-block: 64px;
		}
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
	}

	@media (min-width: 768px) {
		.inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			padding-inline: 32px;
		}
	}

	h1 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 2.75rem);
		line-height: 1.1;
		color: var(--color-ink);
		margin: 0 0 16px;
	}

	.lead {
		font-family: var(--font-body);
		font-size: 19px;
		line-height: 1.55;
		color: var(--color-muted);
		max-width: 56ch;
		margin: 0;
	}

	.akcja {
		margin: 16px 0 0;
	}

	/* brand-blue on the light page head: the Accessible tier token, matching the same link in
	   NewsPreview.svelte. The mark takes the colour through `currentColor` and its letter is a
	   cut-out, so the surface behind shows through it. */
	.link-facebook {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	/* Single column at every width (Amendment v1.6 §10): each card is the poziomy
	   NewsCard variant, so the list fills the container at any post count. */
	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	/* Empty-state panel (mirrors NewsPreview.svelte). */
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

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
