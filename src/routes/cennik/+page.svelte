<script lang="ts">
	// Cennik page (FEES-01; 05 D-04, D-05, D-06, D-28, D-29, D-30, D-31). Composition
	// per 05-UI-SPEC.md Contract 3 as annotated by quick 260820-m35: NINE sections in a
	// fixed order with alternating white and warm surfaces, each labelled by its own h2,
	// closing on the site-wide primary Cta in a band section. At >=1024px sections 2 to 8
	// use the v1.6 paragraf 2 editorial split, the same idiom /o-nas and /dokumenty
	// already use.
	//
	// Two things quick 260820-m35 changed, both recorded in Contract 3 in the same commit:
	//  1. „Co obejmuje opłata" is inserted at position 3, which flips the surface of every
	//     section after it (ZUS white to warm, wyżywienie warm to white, and so on down to
	//     podstawa prawna). The alternation Contract 3 requires is what forces the flip;
	//     two warm sections in a row would have put a 128px warm seam between the fee block
	//     and the list, which is more empty space, not less. The white #zus-blok panel now
	//     sits on a warm surface and finally reads as a panel;
	//  2. `.szeroko` spans BOTH tracks of the editorial split (`grid-column: 1 / -1`) and
	//     the list inside it runs in two columns from 1024px. This is the gallery's idiom
	//     from Contract 2 applied to a text list. It exists to remove a measured defect:
	//     the left rail is empty below its h2, so a seven-point list in the right track
	//     alone left a 300 x 230px white band at 1280px. Spanning both tracks puts the
	//     list UNDER the rail as well, so the rail has no empty vertical run left.
	//
	// Static content with ZERO hydrated islands. The site-wide static-output flag is set
	// once in src/routes/+layout.ts and is deliberately NOT restated here; its literal
	// name is grep-banned in this file (acceptance gate for this plan), so it is
	// described rather than written. There is no +page.server.ts either: the fee store
	// is a plain $lib import read at build time, and an empty load would be noise.
	//
	// The layout owns <main>, so this route adds no wrapper landmark and no heading
	// above its own h1. Heading order: h1 here, one h2 per section, and two h3 inside
	// the fee section (the stored fee-block heading and the breakdown heading).
	//
	// EVERY ZŁOTY FIGURE ON THIS PAGE IS INTERPOLATED FROM THE CENNIK STORE. No amount
	// is written as a literal anywhere in this file, head metadata included, and the
	// prose module src/lib/content/cennik.ts states no amount either. The payable amount
	// is COMPUTED by the reader from the two stored numbers (05 D-28), so the page
	// cannot contradict its own arithmetic.
	//
	// Two structural details the acceptance tests depend on, and that must not drift:
	//  1. the breakdown wrapper carries the class `rozbicie` and its rows are
	//     `dl > div > dt/dd`, never a table element and never a bare definition list.
	//     (Both are spelled out in words rather than as markup: the plan's acceptance
	//     gate greps this file for the opening tag, so a comment naming it would be a
	//     permanent false positive. Plan 04-02 set that rewording precedent.)
	//     A table splits an
	//     amount from its condition into separate cells, and at mobile width the two can
	//     land on different visual rows, which is exactly the separation
	//     .planning/dane-bip-zlobek-stromiec.md paragraf 10, punkt 1 forbids;
	//  2. the block carrying id="zus-blok" holds, in DOM order, the stored ZUS sentence,
	//     the worked example as ONE paragraph, and the „jak złożyć wniosek" line. It is
	//     the ONLY block on this page that may render a zero amount, and that zero sits
	//     in the same sentence as its condition. tests/cennik.spec.ts asserts both
	//     halves: the zero occurs inside this block, and the page with this block
	//     removed carries no zero amount at all.
	//
	// The fee block reuses the FeeBox.svelte treatment values (tint-yellow surface, 2px
	// accent border, radius-md, 16px to 24px padding, 46rem max width) WITHOUT importing
	// FeeBox itself, which takes no props by design and renders the compact /rekrutacja
	// summary. The payable amount is Baloo 700 at 20px, the same size FeeBox uses, so
	// the two surfaces never disagree about one amount's importance.
	//
	// Copy rules (UI-SPEC v1.2 paragraf 8): no emoji, no em dashes; en dash only inside
	// numeric ranges. That ban applies to the comments in this file too.
	import Cta from '$lib/components/Cta.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { CENNIK } from '$lib/cennik';
	import {
		CTA,
		KWOTA_PODPIS,
		META,
		PODPIS_PLACI,
		STAWKA_OPIS,
		NAGLOWEK,
		PLATNOSCI,
		PODSTAWA,
		ROZBICIE,
		SEKCJE,
		WYZYWIENIE_SZCZEGOL,
		ZAKRES,
		ZUS_LINK,
		ZUS_PUNKTY,
		ZUS_WNIOSEK,
		notaObnizki,
		przykladZus
	} from '$lib/content/cennik';
</script>

<Seo title={META.tytul} description={META.opis} canonical="/cennik" />

<!-- 1. Page header (white surface). -->
<header class="page-head">
	<div class="inner">
		<h1>{NAGLOWEK.tytul}</h1>
		<p class="lead">{NAGLOWEK.lead}</p>
	</div>
</header>

<!-- 2. Opłata za pobyt (warm). The amount, its description and the breakdown are ONE
     block: nothing inside it may be moved into a sibling block by a responsive rule. -->
<section class="band warm" aria-labelledby="oplata-heading">
	<div class="inner uklad">
		<h2 id="oplata-heading">{SEKCJE.oplata}</h2>
		<div class="tresc">
			<div class="ramka-oplaty">
				<h3 class="ramka-naglowek">{CENNIK.naglowek}</h3>
				<!-- The caption is a <p>, never a heading: an h4 here would be a heading-order trap
				     and an h3 would put a two-word label at the same level as the breakdown's own
				     heading. It must stay IMMEDIATELY before .kwota, which tests/cennik.spec.ts
				     pins as an adjacent-sibling selector. -->
				<p class="kwota-podpis">{KWOTA_PODPIS}</p>
				<p class="kwota">{CENNIK.stawkaProza}</p>
				<p class="linia">{STAWKA_OPIS}</p>

				<!-- The reduction note (quick 260823-p4w). The client asked for the uchwała's rate
				     to be the stated price; this block is the condition that makes that honest, so
				     it lives INSIDE .ramka-oplaty and must never be moved into a sibling block by a
				     responsive rule. Same rule as the amount-and-its-condition pairing the whole
				     page is built on.
				     `kwotaOpis` is the STORE's sentence and it describes the PAYABLE amount, so it
				     travels here with the figure it describes rather than being rewritten. That is
				     what keeps this change at zero store edits and leaves FeeBox on /rekrutacja,
				     which renders the same sentence under the same figure, untouched. -->
				<div class="nota-obnizki">
					<p class="linia nota-wstep">{notaObnizki(CENNIK.obnizkaTekst)}</p>
					<p class="kwota-podpis">{PODPIS_PLACI}</p>
					<p class="kwota">{CENNIK.kwotaProza}</p>
					<p class="linia">{CENNIK.kwotaOpis}</p>
				</div>

				{#if CENNIK.pokazRozbicie}
					<!-- Rendered only when the reduction is greater than zero. A row reading
					     „Obniżka 0 zł" would be an amount with no condition attached, so the
					     whole breakdown disappears instead of stating one (05 D-29). -->
					<div class="rozbicie">
						<h3>{ROZBICIE.naglowek}</h3>
						<dl>
							<div>
								<dt>{ROZBICIE.stawka}</dt>
								<dd>{CENNIK.stawkaTekst}</dd>
							</div>
							<div>
								<dt>{ROZBICIE.obnizka}</dt>
								<dd>{CENNIK.obnizkaTekst}</dd>
							</div>
							<div>
								<dt>{ROZBICIE.placi}</dt>
								<dd>{CENNIK.placiTekst}</dd>
							</div>
						</dl>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- 3. Co obejmuje opłata (white). The answer to „za co płacę", asked the moment a parent
     has read the amount, so it sits directly under it. The list spans both tracks of the
     editorial split rather than sitting in the right one: see the file header. -->
<section class="band" aria-labelledby="zakres-heading">
	<div class="inner uklad">
		<h2 id="zakres-heading">{SEKCJE.zakres}</h2>
		<div class="tresc">
			<p class="proza">{ZAKRES.wstep}</p>
		</div>
		<div class="szeroko">
			<!-- role="list" is not decoration. list-style: none strips the list semantics in
			     Safari with VoiceOver, and the marker has to go because a native outside
			     marker paints beyond the li box and lands in the grid's column gap. -->
			<ul class="lista" role="list">
				{#each ZAKRES.punkty as punkt (punkt)}
					<li>{punkt}</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- 4. Świadczenie „Aktywnie w żłobku" (warm since 260820-m35). The points and the ZUS
     link are a SIBLING of #zus-blok, never a child: Contract 4b pins that block's DOM
     order and the zero-amount gate measures that node, so nothing is appended inside it. -->
<section class="band warm" aria-labelledby="zus-heading">
	<div class="inner uklad">
		<h2 id="zus-heading">{SEKCJE.zus}</h2>
		<div class="tresc">
			<div class="blok-zus" id="zus-blok">
				<p class="linia">{CENNIK.zus}</p>
				<p class="linia">{przykladZus(CENNIK.kwotaProza)}</p>
				<p class="linia">{ZUS_WNIOSEK}</p>
			</div>
		</div>
		<div class="szeroko">
			<ul class="lista lista-szeroka" role="list">
				{#each ZUS_PUNKTY as punkt (punkt)}
					<li>{punkt}</li>
				{/each}
			</ul>
			<p class="proza">{ZUS_LINK.wstep}</p>
			<p class="proza">
				<a href={ZUS_LINK.url} target="_blank" rel="noopener noreferrer">
					{ZUS_LINK.etykieta}<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
				</a>
			</p>
		</div>
	</div>
</section>

<!-- 5. Wyżywienie (white since 260820-m35). -->
<section class="band" aria-labelledby="wyzywienie-heading">
	<div class="inner uklad">
		<h2 id="wyzywienie-heading">{SEKCJE.wyzywienie}</h2>
		<div class="tresc">
			<p class="proza">{CENNIK.wyzywienie}</p>
			<p class="proza">{WYZYWIENIE_SZCZEGOL}</p>
		</div>
	</div>
</section>

<!-- 6. Nieobecność dziecka (warm since 260820-m35). -->
<section class="band warm" aria-labelledby="nieobecnosc-heading">
	<div class="inner uklad">
		<h2 id="nieobecnosc-heading">{SEKCJE.nieobecnosc}</h2>
		<div class="tresc">
			<p class="proza">{CENNIK.nieobecnosc}</p>
		</div>
	</div>
</section>

<!-- 7. Jak i kiedy płacić (white since 260820-m35). Names the RECIPIENT, which the uchwała
     paragraf 3 ustep 1 supplies as of 2026-08-20, and nothing else: no account number, no
     deadline, no interest rule and no consequence of paying late, because no committed
     source carries any of them and the copy module still marks those three as unconfirmed
     for the Phase 6 sweep (05 D-30). Per the locked project convention a placeholder
     renders NO visitor-facing badge. -->
<section class="band" aria-labelledby="platnosci-heading">
	<div class="inner uklad">
		<h2 id="platnosci-heading">{SEKCJE.platnosci}</h2>
		<div class="tresc">
			<p class="proza">{PLATNOSCI}</p>
		</div>
	</div>
</section>

<!-- 8. Podstawa prawna (warm since 260820-m35). -->
<section class="band warm" aria-labelledby="podstawa-heading">
	<div class="inner uklad">
		<h2 id="podstawa-heading">{SEKCJE.podstawa}</h2>
		<div class="tresc">
			<p class="proza">{PODSTAWA.tresc}</p>
			<p class="proza">{PODSTAWA.obnizka}</p>
			<p class="proza">{PODSTAWA.aktywnyRodzic}</p>
			<p class="proza"><a href={PODSTAWA.href}>{PODSTAWA.etykietaLinku}</a></p>
		</div>
	</div>
</section>

<!-- 9. Closing CTA (inherited primary variant, band surface). -->
<section class="band niebieski cta-band">
	<div class="inner">
		<Cta href={CTA.href} variant="primary" icon>{CTA.etykieta}</Cta>
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

	.band.niebieski {
		background: var(--color-band);
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

		/* Editorial split (Amendment v1.6 paragraf 2): the section heading sits in the
		   left rail and the content fills the right track. */
		.uklad {
			display: grid;
			grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
			column-gap: 48px;
			row-gap: 24px;
			align-items: start;
		}

		.uklad h2 {
			margin-bottom: 0;
		}

		/* Spans BOTH tracks of the editorial split, the same way the /o-nas gallery does
		   (Contract 2). The left rail holds only an h2, so anything confined to the right
		   track leaves the rail's whole vertical run white below it. */
		.uklad .szeroko {
			grid-column: 1 / -1;
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

	.proza {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-ink);
		max-width: 65ch;
		margin: 0 0 16px;
	}

	.proza:last-child {
		margin-bottom: 0;
	}

	.proza a {
		color: var(--color-brand-blue);
		font-weight: 700;
		text-decoration: underline;
	}

	.proza a:hover {
		color: var(--color-brand-blue-hover);
	}

	/* Bulleted list, typography identical to .proza so the two never disagree about body
	   text. Single column below 1024px with the same 65ch cap; the two-column tier lives
	   in the lg block above. The marker is drawn here rather than by list-style, because a
	   native outside marker paints beyond the li box and would fall into the grid's
	   column gap in the second column. */
	.lista {
		list-style: none;
		padding: 0;
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.lista li {
		position: relative;
		padding-left: 20px;
		margin-bottom: 8px;
	}

	.lista li:last-child {
		margin-bottom: 0;
	}

	.lista li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 10px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-brand-blue);
	}

	/* The two-column tier. This block sits AFTER the base `.lista` rules on purpose: the
	   two selectors have equal specificity, a media query adds none, and source order is
	   what decides. Written above the base rules it lost `max-width` to them, the list
	   rendered 520px wide instead of 1088px and every point wrapped to two or three
	   lines, which is the exact defect this layout exists to prevent. */
	@media (min-width: 1024px) {
		/* Grid, not column-count: `repeat(2, minmax(0, 1fr))` puts item 2 beside item 1
		   deterministically, while column-count leaves the balancing to the browser and
		   makes „how many columns" a guess for the test to make. */
		.lista {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			column-gap: 48px;
			row-gap: 8px;
			max-width: none;
		}

		.lista li {
			margin-bottom: 0;
		}

		/* The ZUS points stay in ONE column, and keep the 65ch cap.
		   One column, because these points are two to four times longer than the scope
		   points: measured in two columns they were four ragged blocks 120px to 176px tall
		   whose rows never lined up, and a reader had to jump columns mid-argument.
		   65ch, because dropping the cap the way the two-column tier does would have set
		   this prose across the full 1088px span, which at 16px is about 136 characters
		   per line, roughly twice every other body text on the site.
		   The container still spans both tracks, so the list starts at the rail's own left
		   edge and the rail has no empty vertical run either way. */
		.lista-szeroka {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 12px;
			max-width: 65ch;
		}
	}

	.szeroko .proza:first-of-type {
		margin-top: 16px;
	}

	/* Visually hidden but exposed to assistive tech, copied from Footer.svelte: the rule
	   is component-scoped there, not global, so every component that needs it carries its
	   own copy. Used for the new-tab suffix on the ZUS link. */
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

	/* Fee block: the FeeBox.svelte treatment reused verbatim rather than re-derived.
	   One block, one border, one border-radius. */
	.ramka-oplaty {
		max-width: 46rem;
		padding: 16px;
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-md);
		background: var(--color-tint-yellow);
	}

	/* ZUS block: white panel with a subtle boundary, same geometry as the fee block so
	   the two read as one family without competing for the accent. */
	.blok-zus {
		max-width: 46rem;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	@media (min-width: 768px) {
		.ramka-oplaty,
		.blok-zus {
			padding: 24px;
		}
	}

	.ramka-naglowek {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* The amount never wraps mid-number. The grouping separator is an ASCII space by
	   deliberate choice (05-UI-SPEC Contract 5), so the wrap a non-breaking space would
	   prevent is prevented here instead, in CSS, where it is visible. */
	.kwota {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
		white-space: nowrap;
	}

	/* Label role from the locked Typography table (01-UI-SPEC paragraf 3, which names
	   captions): Nunito 700 at 14px in the muted ink, 7.58:1 on both surfaces this box can
	   sit on. Deliberately smaller than .kwota, so it names the number without competing
	   with it: making the two compete would re-open the „which figure matters" question
	   this caption exists to close. */
	.kwota-podpis {
		margin: 0 0 4px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-muted);
	}

	.linia {
		margin: 8px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* The reduction note: a white panel inside the yellow fee box, so it reads as a distinct
	   statement about the rate above it rather than as small print hanging off it. The payable
	   amount inside keeps the .kwota treatment, at the SAME size as the statutory rate: the
	   client asked for 2 337 zł to be the stated price, not for the amount a parent actually
	   pays to be demoted. */
	.nota-obnizki {
		margin-top: 16px;
		padding: 12px 16px;
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.nota-obnizki .nota-wstep {
		margin-top: 0;
	}

	.rozbicie {
		margin-top: 24px;
	}

	.rozbicie h3 {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.rozbicie dl {
		margin: 0;
	}

	.rozbicie dl > div {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 0;
		border-bottom: 1px solid var(--color-border-strong);
	}

	.rozbicie dl > div:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.rozbicie dt {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.rozbicie dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: 17px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
		white-space: nowrap;
	}

	.cta-band .inner {
		display: flex;
		justify-content: center;
	}
</style>
