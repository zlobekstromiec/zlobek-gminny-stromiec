<script lang="ts">
	// Single post page (NEWS-02; 03-UI-SPEC.md single-post composition 1-5).
	// Prerendered, zero-JS (inherits prerender = true from +layout.ts): NO +server.ts,
	// NO extra <main>/landmark beyond the layout's, and exactly ONE h1 (the post
	// tytul) — the body renders through renderPost, which neutralizes any heading in
	// the Markdown to a paragraph, so nothing rivals that h1 (a11y + D-08).
	//
	// The body is authored Markdown (CMS/editor-controlled). It renders with
	// renderPost ($lib/markdown): a hardened full-block renderer that escapes raw
	// HTML, drops unsafe link protocols, flattens images to alt text and drops GFM
	// tables (T-03-01, high). The public CSP (script-src 'self') is the second, not
	// the only, layer. An optional cover is optimized by enhanced-img (AVIF/WebP,
	// width/height, no CLS) and resolved by BASENAME (path-traversal safe); the D-01
	// seed has no obraz, so the cover is omitted cleanly with no placeholder box.
	import type { Picture } from '@sveltejs/enhanced-img';
	import Calendar from '@lucide/svelte/icons/calendar';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Seo from '$lib/components/Seo.svelte';
	import Cta from '$lib/components/Cta.svelte';
	import { renderPost } from '$lib/markdown';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);

	// Statically-analyzable glob: keys are absolute file paths, values are processed
	// enhanced-img Picture objects. Map by final path segment (basename) for lookup.
	const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
	const byName: Record<string, Picture> = {};
	for (const [path, mod] of Object.entries(uploads)) {
		const base = path.split('/').pop();
		if (base) byName[base] = mod;
	}
	const cover = $derived(
		post.obraz ? byName[post.obraz.split('/').pop() ?? post.obraz] : undefined
	);

	const bodyHtml = $derived(renderPost(post.tresc));
</script>

<Seo title={post.tytul + ': Aktualności'} description={post.excerpt} canonical={post.href} />

<article>
	<!-- 1. Post header: single h1 = tytul, machine-readable date directly under it. -->
	<header class="page-head">
		<div class="inner narrow">
			<h1>{post.tytul}</h1>
			<p class="date">
				<Calendar class="date-icon" size={16} aria-hidden="true" focusable="false" />
				<time datetime={post.iso}>{post.dataDisplay}</time>
			</p>
		</div>
	</header>

	<!-- 2. Optional cover (radius-lg, informative alt, no CLS); omitted cleanly when absent. -->
	{#if cover}
		<div class="cover-band">
			<div class="inner narrow">
				<enhanced:img
					src={cover}
					alt={post.obraz_alt ?? ''}
					sizes="(min-width:768px) 52rem, 100vw"
				/>
			</div>
		</div>
	{/if}

	<!-- 3. Body (hardened full-block render). -->
	<section class="band">
		<div class="inner narrow">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderPost sanitizes (raw HTML escaped, unsafe hrefs dropped, images to alt, headings/tables neutralized); CSP script-src 'self' is the second layer (T-03-01) -->
			<div class="prose">{@html bodyHtml}</div>

			<!-- 4. Back link. -->
			<p class="back">
				<a href="/aktualnosci">
					<ArrowLeft class="back-icon" size={16} aria-hidden="true" focusable="false" />
					Wszystkie aktualności
				</a>
			</p>
		</div>
	</section>

	<!-- 5. Closing CTA (inherited primary variant). -->
	<section class="band warm cta-band">
		<div class="inner">
			<Cta href="/rekrutacja" variant="primary" icon>Zapisz dziecko</Cta>
		</div>
	</section>
</article>

<style>
	.page-head {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.cover-band {
		background: var(--color-surface);
		padding-bottom: 8px;
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

	.inner.narrow {
		max-width: 52rem;
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

	.date {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-muted);
	}

	.date :global(.date-icon) {
		flex: none;
		color: var(--color-muted);
	}

	.cover-band :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-lg);
	}

	.prose {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink);
		max-width: 65ch;
	}

	.prose :global(p) {
		margin: 0 0 16px;
	}

	.prose :global(p:last-child) {
		margin-bottom: 0;
	}

	/* Narrative links follow the inherited body-link rule (brand-blue + underline). */
	.prose :global(a) {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.prose :global(a:hover) {
		color: var(--color-brand-blue-hover);
	}

	.prose :global(strong) {
		font-weight: 700;
	}

	.back {
		margin: 32px 0 0;
	}

	.back a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.back a:hover {
		color: var(--color-brand-blue-hover);
	}

	.back :global(.back-icon) {
		flex: none;
	}

	.cta-band .inner {
		display: flex;
		justify-content: center;
	}
</style>
