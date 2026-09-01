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
	// ONE MEASURE FOR THE WHOLE COLUMN (260901-amq, D-5). The h1, the photo section's h2, the
	// prose and the gallery grid all share one left and one right edge, because all three blocks
	// of the page use the same `.inner.narrow` and nothing inside them carries a width cap of
	// its own. The page used to have THREE measures and read as an unintended bleed to the
	// right; see the rule at `.inner.narrow` below for the numbers and for what was rejected.
	//
	// THE POST GALLERY PUBLISHES NO CAPTIONS (260901-amq, D-4), unlike the facility gallery on
	// /o-nas. The reason is a content one: under a post the prose already describes the scene,
	// so the photograph stands on its own, whereas on /o-nas the caption carries the name of a
	// room that no neighbouring text repeats. The stored `podpis` stays in the data and is
	// simply not rendered — see the note on the field in $lib/server/aktualnosci.
	//
	// THAT MAKES THE DIALOG'S NAME THIS PAGE'S CONCERN, not an afterthought. With no caption
	// there is no heading for aria-labelledby to point at, so the island names its dialog from
	// its own constant Polish label instead (ETYKIETA_OKNA in Lightbox.svelte). A modal with
	// role="dialog" and no accessible name is a WCAG 4.1.2 failure, and tests/aktualnosci.spec.ts
	// holds the gate that says so.
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
				<!-- `sizes` idzie za nowa miara (260901-amq, D-5): waska odmiana kontenera ma
				     46.5rem razem z wcieciem, wiec najszerzej ta okladka maluje sie tuz ponizej
				     44rem. Zostawiona na 52rem prosilaby o plik skrojony pod kolumne, ktorej
				     juz nie ma. -->
				<enhanced:img
					src={cover}
					alt={post.obraz_alt ?? ''}
					sizes="(min-width:768px) 44rem, 100vw"
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
									     fills the viewport.

									     NO `podpis` IS PASSED (260901-amq, D-4), so the island renders no heading
									     and names its dialog from its own constant label instead. The stored
									     caption is still in the data; it is simply not published here. -->
									<Lightbox zrodlo={zdjecie.obraz.img.src}>
										{#snippet miniatura()}
											<enhanced:img
												src={zdjecie.obraz}
												alt={zdjecie.alt}
												loading="lazy"
												sizes="(min-width:768px) 21rem, 100vw"
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

	/* JEDNA MIARA TRESCI (260901-amq, D-5). Ta strona miala TRZY rozne miary w jednej kolumnie:
	   przy 1440 px naglowki i siatka zdjec konczyly sie na 1097, a proza na 849, czyli 248 px
	   wczesniej. Wszystko dzielilo lewa krawedz, a prawa skakala miedzy dwiema pozycjami.

	   46.5rem LICZY SIE RAZEM Z WCIECIEM, bo preflight Tailwinda ustawia box-sizing: border-box
	   globalnie. Od 1024 px wychodzi z tego 744 minus dwa razy 32, czyli 680 px miary (okolo 68
	   znakow), a dwukolumnowa siatka z przerwa 24 px daje kafelki po 328 px.

	   WSPOLNE KRAWEDZIE BIORA SIE STAD, ZE TEJ ODMIANY UZYWAJA TRZY BLOKI TEJ STRONY: naglowek,
	   okladka i tresc. Nie ma tu zadnego drugiego ograniczenia szerokosci i nie wolno go dodac,
	   bo to wlasnie ono bylo trzecia miara.

	   ODRZUCONE SWIADOMIE, zeby nikt do tego nie wracal: (a) rozciagniecie prozy do pelnych
	   768 px daje okolo 96 znakow w wierszu; (b) zwezenie samej siatki do 520 px zbija kafelek
	   do okolo 248 px; (c) zostawienie wyjscia poza kolumne musialoby byc symetryczne po obu
	   stronach, zeby czytac sie jako zamierzone, a tamto rozszerzalo sie wylacznie w prawo. */
	.inner.narrow {
		max-width: 46.5rem;
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

	/* CONCENTRICITY AUDIT, 260901-amq row (f). THIS IS THE ONE SURFACE THE D-2 TABLE DOES NOT
	   LIST, and the audit's only real finding: the table enumerates the lightbox panel, the
	   gallery tile, the NewsCard cover, the Hero slot, MapPanel and AboutTeaser, and stops.

	   Verdict: --radius-lg STAYS, and it is a hierarchy decision rather than an accident. This is
	   the lead image of the page, the closest counterpart to the Hero slot D-2 explicitly leaves
	   at 24px, and it is the only media surface here that runs the full width of the column. The
	   post's own gallery tiles sit at 16px below it, so the two read as two ranks of one system.
	   There is no rounded container and no inset, so the law produces no number here either. */
	.cover-band :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-lg);
	}

	/* NO `max-width` HERE ANY MORE (260901-amq, D-5). The 65ch cap was the third measure on the
	   page and the source of the mismatch; the column itself is now the measure, so the prose
	   inherits it. Raising the cap rather than removing it would have rebuilt the same fault
	   with different numbers in six months. */
	.prose {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink);
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
	   cannot reach an element another component renders. What stays here is the grid and the
	   figure. THE CAPTION RULES ARE GONE WITH THE CAPTION (260901-amq, D-4) rather than left
	   behind as dead selectors: `npm run check` reports an unused selector as a warning, and in
	   this project that warning is the correct behaviour and not noise to route around. */

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
