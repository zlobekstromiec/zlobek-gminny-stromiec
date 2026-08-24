<script lang="ts">
	// Single post page (NEWS-02; 03-UI-SPEC.md single-post composition 1-5).
	// Prerendered: NO +server.ts, NO extra <main>/landmark beyond the layout's, and
	// exactly ONE h1 (the post tytul) — the body renders through renderPost, which
	// neutralizes any heading in the Markdown to a paragraph, so nothing rivals that h1
	// (a11y + D-08). The post gallery's h2 sits below it, in order.
	//
	// NO LONGER ZERO-JS, and deliberately: a post that carries `zdjecia` mounts the same
	// `Lightbox` island /o-nas already uses (05-UI-SPEC Contract 2). That island is
	// progressive by construction — each tile is a real <a href> to the full-size asset
	// that is already in the prerendered HTML, so with scripting off the tap still opens
	// the photograph, and hydration adds behaviour without changing markup or layout. A
	// post with no gallery mounts nothing and is byte-for-byte as static as before.
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
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { renderPost } from '$lib/markdown';
	import { galeriaZObrazami } from '$lib/galeria';
	import { bazowaNazwa, wedlugBazowejNazwy } from '$lib/zdjecia-nazwy';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);

	// Statically-analyzable glob: keys are absolute file paths, values are processed
	// enhanced-img Picture objects. Re-keyed by basename through the shared mapper rather
	// than an inline loop, so this page and /o-nas cannot acquire two answers to one
	// question (the glob itself cannot move: see the header of $lib/zdjecia-nazwy).
	const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
	const byName = wedlugBazowejNazwy(uploads);
	// `Object.hasOwn`, NEVER a bare `!== undefined` (T-05-07-02). `byName` is a plain
	// object, so it answers `constructor`, `__proto__`, `toString`, `valueOf` and
	// `hasOwnProperty` off its prototype. `obraz` is only guarded as far as „it is a
	// string", and this content is hand editable, so a stored name of `constructor` would
	// otherwise bind `cover` to a FUNCTION and the `<enhanced:img>` below would throw in
	// the middle of the whole-site prerender.
	const cover = $derived.by(() => {
		if (!post.obraz) return undefined;
		const nazwa = bazowaNazwa(post.obraz);
		return Object.hasOwn(byName, nazwa) ? byName[nazwa] : undefined;
	});

	// The post's own gallery, filtered to the photos the build really carries. Reuses the
	// facility gallery's mapper rather than re-deriving it: `ZdjecieWpisu` is structurally
	// the same record, so the „lightbox can never open onto nothing" guarantee and the
	// prototype-name defence above both come along unchanged.
	const zdjecia = $derived(galeriaZObrazami(post.zdjecia, byName));

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

			<!-- 4. The post's own gallery. The whole block is conditional, unlike the facility
			     gallery on /o-nas: there the section is a permanent landing target for a footer
			     shortcut and must render its empty state, whereas here nothing links to it and a
			     post without photographs should simply not have the heading. -->
			{#if zdjecia.length > 0}
				<section class="galeria-wpisu" aria-labelledby="galeria-wpisu-heading">
					<h2 id="galeria-wpisu-heading">Zdjęcia z wydarzenia</h2>
					<ul class="galeria">
						<!-- Keyed by POSITION: this list is authored by hand and two photographs may
						     legitimately carry the same caption, so the caption is not an identity. -->
						{#each zdjecia as zdjecie, i (i)}
							<li>
								<figure>
									<!-- Both image elements stay HERE, one per snippet, so the island carries
									     no image-processing concern and knows nothing about enhanced-img. The
									     two differ only in `sizes`: the tile fills a grid cell, the dialog
									     fills the viewport. -->
									<Lightbox
										podpis={zdjecie.podpis}
										opis={zdjecie.alt}
										zrodlo={zdjecie.obraz.img.src}
									>
										{#snippet miniatura()}
											<enhanced:img
												src={zdjecie.obraz}
												alt={zdjecie.alt}
												loading="lazy"
												sizes="(min-width:768px) 25rem, 100vw"
											/>
										{/snippet}
										{#snippet powiekszenie()}
											<enhanced:img
												src={zdjecie.obraz}
												alt={zdjecie.alt}
												sizes="(min-width:1024px) 90vw, 100vw"
											/>
										{/snippet}
									</Lightbox>
									<figcaption>{zdjecie.podpis}</figcaption>
								</figure>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<!-- 5. Back link. -->
			<p class="back">
				<a href="/aktualnosci">
					<ArrowLeft class="back-icon" size={16} aria-hidden="true" focusable="false" />
					Wszystkie aktualności
				</a>
			</p>
		</div>
	</section>

	<!-- 6. Closing CTA (inherited primary variant). -->
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

	/* -------------------------------------------------------------------------------
	   Post gallery. TWO columns at the top tier, not the three /o-nas uses, because this
	   grid sits inside the article's `.inner.narrow` (52rem) rather than the full 72rem
	   band: a third track here would put the tiles below the width at which a face in a
	   ceremony photograph is still legible.

	   EXPLICIT TRACK COUNTS, never auto-fit, for the reason the facility gallery records:
	   an auto-fitting track list stretches a LONE tile to the full container width, where
	   it reads as a second cover competing with the one at the top of the page.
	   ------------------------------------------------------------------------------- */
	.galeria-wpisu {
		margin-top: 40px;
	}

	.galeria-wpisu h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.375rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.galeria {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		justify-content: start;
	}

	@media (min-width: 768px) {
		.galeria {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.galeria figure {
		margin: 0;
	}

	/* The TILE itself is styled by the island that renders it ($lib/components/Lightbox.svelte),
	   together with its hover scale and its own reduced-motion guard: a page-scoped selector
	   cannot reach an element another component renders. What stays here is the grid, the
	   figure and the caption, exactly as on /o-nas. */
	.galeria figcaption {
		margin-top: 8px;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 15px;
		line-height: 1.4;
		color: var(--color-ink);
	}

	.galeria li:hover figcaption {
		text-decoration: underline;
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
