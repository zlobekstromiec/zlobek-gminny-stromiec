<script lang="ts">
	// O nas page (ABOUT-01, GALLERY-01; 02-UI-SPEC Component Contracts /o-nas section order
	// 1-7, as amended by 05-UI-SPEC Contract 1).
	//
	// PRERENDERED (inherits prerender = true from +layout.ts): NO +server.ts, NO extra
	// <main>/landmark, NO extra h1 beyond the page heading (layout owns <main>).
	//
	// THIS PAGE IS NO LONGER ZERO-JS. It carries exactly ONE hydrated island, the gallery
	// lightbox ($lib/components/Lightbox.svelte): the site's fourth island and the first on a
	// content route. Every tile is an <a href> to the full-size asset in the prerendered HTML,
	// so with scripting switched off the link opens the photograph and nothing on the page is
	// a control that does nothing. The island renders that anchor and owns its styling; this
	// page keeps the <figure>, the caption and the image elements themselves.
	//
	// TWO CONTENT SOURCES, and the split is deliberate (05 D-19, D-20, D-26). The gallery
	// photographs, their captions and their alt text live in their own store
	// (src/lib/content/galeria.json) and are edited on their own panel screen (/admin/galeria);
	// the facility DESCRIPTION stays in the o-nas store and is still edited on /admin/o-nas.
	// Narrative fields render with renderInline ($lib/markdown): a hardened renderer that
	// escapes raw inline HTML, drops unsafe link protocols and flattens images, so only
	// paragraphs/bold/links reach the DOM (D-08); the public CSP (script-src 'self') is the
	// second, not the only, layer. Gallery images are optimized by enhanced-img (AVIF/WebP
	// srcset, width/height, no CLS) and resolved by BASENAME, so the route is decoupled from
	// whether the stored value is a bare filename or a full path. The editorial panel stores
	// the bare filename (04.1-07 P-20), and this lookup would keep working unchanged if that
	// ever became a path.
	// Plan dnia reuses DayPlan verbatim (D-03: single shared source). Kadra is a collective
	// narrative + headcount by role, no individual profiles or staff photos (D-02).
	import type { Picture } from '@sveltejs/enhanced-img';
	import Images from '@lucide/svelte/icons/images';
	import Seo from '$lib/components/Seo.svelte';
	import DayPlan from '$lib/components/DayPlan.svelte';
	import Cta from '$lib/components/Cta.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { renderInline } from '$lib/markdown';
	import { odmienRzeczownik } from '$lib/liczebniki';
	import { FORMY_OPIEKUNKI, FORMY_PERSONELU } from '$lib/content/kadra';
	import onas from '$lib/content/o-nas.json';
	import galeriaStore from '$lib/content/galeria.json';
	import { czytajGalerie, galeriaZObrazami } from '$lib/galeria';
	import { wedlugBazowejNazwy } from '$lib/zdjecia-nazwy';

	// Statically-analyzable glob: keys are absolute file paths, values are processed
	// enhanced-img Picture objects. Vite analyses this call site, so the glob stays here and
	// only its RESULT is handed to the shared by-basename mapper ($lib/zdjecia-nazwy).
	const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
	// The reader already drops an entry whose file the build does not carry, so this page
	// adds no filter of its own: one question, one answer, in $lib/galeria.ts.
	const zdjecia = galeriaZObrazami(czytajGalerie(galeriaStore), wedlugBazowejNazwy(uploads));

	// D-08: inline render only (single paragraph, bold + links), sanitized by the
	// hardened renderer in $lib/markdown (raw HTML escaped, unsafe hrefs dropped).
	const misjaHtml = renderInline(onas.misja);
	const kadraHtml = renderInline(onas.kadra_opis);
	const obiektHtml = renderInline(onas.obiekt_opis);

	/** Above that section's fold at ≥768px on a typical laptop, so a lazy load here is a
	 *  measurable LCP regression. Everything after it is lazy. */
	const PILNE_KAFELKI = 2;
</script>

<Seo
	title="O nas: Publiczny Żłobek w Stromcu"
	description="Poznaj Publiczny Żłobek w Stromcu: naszą misję, wartości, plan dnia, kadrę oraz miejsce, w którym Twoje dziecko spędza dzień."
	canonical="/o-nas"
/>

<!-- 1. Page header -->
<header class="page-head">
	<div class="inner">
		<h1>O nas</h1>
		<p class="lead">{onas.lead}</p>
	</div>
</header>

<!-- 2. Misja (warm surface) -->
<section class="band warm" aria-labelledby="misja-heading">
	<div class="inner narrow">
		<h2 id="misja-heading">Nasza misja</h2>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderInline sanitizes (raw HTML escaped, link protocols filtered); CSP script-src 'self' is the second layer (T-0201-01) -->
		<p class="prose">{@html misjaHtml}</p>
	</div>
</section>

<!-- 3. Wartości -->
<section class="band" aria-labelledby="wartosci-heading">
	<div class="inner">
		<h2 id="wartosci-heading">Nasze wartości</h2>
		<ul class="values">
			<!-- Keyed by POSITION, never by the title. Phase 04.1 made this file editable from
			     the panel, and Svelte THROWS on a keyed each block with two equal keys, in
			     production as well as in development: two cards sharing a title would break
			     this page the moment it hydrated. Same reasoning as DayPlan.svelte. -->
			{#each onas.wartosci as wartosc, i (i)}
				<li class="value-card">
					<h3>{wartosc.tytul}</h3>
					<p>{wartosc.opis}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- 4. Plan dnia (reused DayPlan, single shared source, D-03) -->
<DayPlan />

<!-- 5. Kadra (warm surface; collective narrative + headcount, D-02) -->
<section class="band warm" aria-labelledby="kadra-heading">
	<div class="inner narrow">
		<h2 id="kadra-heading">Nasza kadra</h2>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderInline sanitizes (raw HTML escaped, link protocols filtered); CSP script-src 'self' is the second layer (T-0201-01) -->
		<p class="prose">{@html kadraHtml}</p>
		<!-- The labels DECLINE with the counts (02-UI-SPEC amendment 2026-08-16). Both
		     numbers are CMS values, so a fixed word is wrong Polish for most of them:
		     6 takes „opiekunek", not „opiekunki". The number stays in the <dd> and only
		     the declined noun goes in the <dt>, because axe's definition-list rules
		     run on this page. -->
		<dl class="headcount">
			<div class="stat">
				<dd class="stat-value">{onas.kadra_opiekunki}</dd>
				<dt class="stat-label">{odmienRzeczownik(onas.kadra_opiekunki, FORMY_OPIEKUNKI)}</dt>
			</div>
			<div class="stat">
				<dd class="stat-value">{onas.kadra_personel}</dd>
				<dt class="stat-label">{odmienRzeczownik(onas.kadra_personel, FORMY_PERSONELU)}</dt>
			</div>
		</dl>
	</div>
</section>

<!-- 6. Galeria (GALLERY-01; 05-UI-SPEC Contract 1, which replaces „Nasze miejsce" in place
     and leaves the seven-section order otherwise untouched, 05 D-19 / D-20).

     TWO ATTRIBUTES, TWO JOBS, written out because they are easy to conflate. The section's
     own id is the fragment the footer's „Galeria" shortcut jumps to; aria-labelledby names
     the section and points at the h2's OWN id. The heading id this section carried before
     the rename was retired together with the heading it named: renaming the section without
     renaming its heading id would have left a label that no longer describes the content.
     (Neither retired name is written out here, following the repository rule recorded at
     04-02: a comment explaining a constraint must not make the grep enforcing it report a
     permanent false positive.)

     tabindex="-1" so a keyboard user following that link lands INSIDE the gallery rather
     than at the top of the document, and scroll-margin-top below keeps the sticky header
     off the heading. Same treatment as the #dojazd section of /kontakt.

     THE SECTION, ITS HEADING AND ITS ID ALWAYS RENDER (required zero-photo state). Only the
     grid is conditional, so the footer link can never land on nothing. -->
<section id="galeria" class="band" tabindex="-1" aria-labelledby="galeria-heading">
	<div class="inner uklad-miejsce">
		<h2 id="galeria-heading">Galeria: nasze miejsce</h2>
		<!-- The stored facility description stays as introductory prose ABOVE the grid. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- D-08: renderInline sanitizes (raw HTML escaped, link protocols filtered); CSP script-src 'self' is the second layer (T-0201-01) -->
		<p class="prose">{@html obiektHtml}</p>
		{#if zdjecia.length > 0}
			<ul class="galeria">
				<!-- Keyed by POSITION, for the reason written above the wartości list, and it
				     binds harder here: this list is editor writable from /admin/galeria and two
				     photographs can carry the same caption. -->
				{#each zdjecia as zdjecie, i (i)}
					<li>
						<figure>
							<!-- The tile is a LINK to the full-size asset, which is what makes the
							     no-scripting path a real affordance instead of a dead button
							     (05-UI-SPEC Contract 2). The island renders that link, its
							     visually-hidden prefix and, once a visitor asks for it, the dialog;
							     the prefix plus the photo's own alt is what gives twelve otherwise
							     identical links twelve different accessible names (WCAG 2.4.4).

							     BOTH IMAGE ELEMENTS STAY HERE, one per snippet, so the island carries
							     no image-processing concern and knows nothing about enhanced-img. The
							     two differ only in `sizes`: the tile fills a grid cell, the dialog
							     fills the viewport (05-UI-SPEC Contract 2). -->
							<Lightbox podpis={zdjecie.podpis} opis={zdjecie.alt} zrodlo={zdjecie.obraz.img.src}>
								{#snippet miniatura()}
									<enhanced:img
										src={zdjecie.obraz}
										alt={zdjecie.alt}
										loading={i < PILNE_KAFELKI ? 'eager' : 'lazy'}
										sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
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
		{:else}
			<!-- The inherited empty-state panel (the one /aktualnosci and NewsPreview already
			     ship), so this state is axe proven by construction rather than by a new shape
			     nobody has scanned. Copy from 05-UI-SPEC's Copywriting Contract. -->
			<div class="pusto">
				<Images class="pusto-ikona" size={32} aria-hidden="true" focusable="false" />
				<h3 class="pusto-naglowek">Wkrótce pokażemy zdjęcia żłobka</h3>
				<p class="pusto-tresc">
					Przygotowujemy zdjęcia sal, placu zabaw i budynku. Zajrzyj tutaj wkrótce.
				</p>
			</div>
		{/if}
	</div>
</section>

<!-- 7. Closing CTA (inherited primary variant) -->
<section class="band warm cta-band">
	<div class="inner">
		<Cta href="/rekrutacja" variant="primary" icon>Zapisz dziecko</Cta>
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

		/* Editorial split (Amendment v1.6 §2): the narrow prose sections widen to
		   the full container with the h2 in a left rail and content filling the
		   right track, instead of a lone 52rem column in a 72rem band. */
		.inner.narrow,
		.uklad-miejsce {
			max-width: 72rem;
			display: grid;
			grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
			column-gap: 48px;
			row-gap: 24px;
			align-items: start;
		}

		.inner.narrow h2,
		.uklad-miejsce h2 {
			margin-bottom: 0;
		}

		.headcount {
			grid-column: 2;
			margin-top: 0;
		}

		.uklad-miejsce {
			row-gap: 32px;
		}

		/* The gallery spans BOTH tracks of the editorial split, so the three-column tier
		   below and the split do not fight. The intro prose stays in the right track. */
		.uklad-miejsce .galeria,
		.uklad-miejsce .pusto {
			grid-column: 1 / -1;
			margin-top: 0;
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

	h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 16px;
	}

	.prose {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink);
		max-width: 65ch;
		margin: 0;
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

	/* Wartości: responsive 1 -> 2 -> 3 card grid (static informational cards). */
	.values {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	@media (min-width: 768px) {
		.values {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Four cards, four columns (Amendment v1.6 §6): the 3-up grid always left a
	   3+1 orphan row; 4-up matches the KeyFacts/Perks rhythm. */
	@media (min-width: 1024px) {
		.values {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.value-card {
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 16px;
	}

	@media (min-width: 1024px) {
		.value-card {
			padding: 24px;
		}
	}

	.value-card h3 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 8px;
	}

	.value-card p {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 0;
	}

	/* Kadra headcount: plain dl per the v1.2 KeyFacts a11y ruling (no axe-flagged
	   list wrapping). Value 26px Baloo 700 ink + label 14px Nunito 700 muted,
	   both AA on tint-blue (v1.6 §6: about 11:1 and 5.9:1). */
	.headcount {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		margin: 24px 0 0;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--color-tint-blue);
		border-radius: var(--radius-md);
		padding: 16px 24px;
		min-width: 180px;
	}

	.stat-value {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 26px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.stat-label {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 14px;
		color: var(--color-muted);
	}

	/* -------------------------------------------------------------------------------
	   Galeria (05-UI-SPEC Contract 1). 1 / 2 / 3 columns at base / 768px / 1024px, gap
	   24px at every width.

	   EXPLICIT TRACK COUNTS, never auto-fit or auto-fill. An auto-fitting track list
	   would stretch a LONE tile to the full container width and make it read as a second
	   hero competing with the page header, and one photograph is a state an editor can
	   reach in two clicks.
	   ------------------------------------------------------------------------------- */
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

	/* NEW tier (05 D-12 as amended): 02-UI-SPEC stopped at two columns. */
	@media (min-width: 1024px) {
		.galeria {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.galeria figure {
		margin: 0;
	}

	/* The TILE itself is styled by the island that renders it ($lib/components/Lightbox.svelte),
	   together with its hover scale and its own reduced-motion guard: a page-scoped selector
	   cannot reach an element another component renders. What stays here is everything the page
	   still renders, which is the grid, the figure and the caption. */
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

	/* Empty-state panel, the inherited one (mirrors /aktualnosci and NewsPreview.svelte),
	   on the warm surface 05-UI-SPEC Contract 1 names. */
	.pusto {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
		margin-top: 24px;
		background: var(--color-surface-warm);
		border-radius: var(--radius-md);
		padding: 24px;
	}

	.pusto :global(.pusto-ikona) {
		color: var(--color-muted);
	}

	.pusto-naglowek {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0;
	}

	.pusto-tresc {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		max-width: 48ch;
		margin: 0;
	}

	/* The sticky header must never cover the heading a footer link jumps to. */
	#galeria {
		scroll-margin-top: 96px;
	}

	.cta-band .inner {
		display: flex;
		justify-content: center;
	}
</style>
