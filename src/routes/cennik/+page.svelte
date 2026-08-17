<script lang="ts">
	// Cennik page (FEES-01; 05 D-04, D-05, D-06, D-28, D-29, D-30, D-31). Composition
	// per 05-UI-SPEC.md Contract 3: eight sections in a fixed order with alternating
	// white and warm surfaces, each labelled by its own h2, closing on the site-wide
	// primary Cta in a band section. At >=1024px sections 2 to 7 use the v1.6 paragraf 2
	// editorial split, the same idiom /o-nas and /dokumenty already use, so this page
	// introduces no new layout pattern.
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
		META,
		NAGLOWEK,
		PLATNOSCI,
		PODSTAWA,
		ROZBICIE,
		SEKCJE,
		WYZYWIENIE_SZCZEGOL,
		ZUS_WNIOSEK,
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
				<p class="kwota">{CENNIK.kwotaProza}</p>
				<p class="linia">{CENNIK.kwotaOpis}</p>

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

<!-- 3. Świadczenie „Aktywnie w żłobku" (white). -->
<section class="band" aria-labelledby="zus-heading">
	<div class="inner uklad">
		<h2 id="zus-heading">{SEKCJE.zus}</h2>
		<div class="tresc">
			<div class="blok-zus" id="zus-blok">
				<p class="linia">{CENNIK.zus}</p>
				<p class="linia">{przykladZus(CENNIK.kwotaProza)}</p>
				<p class="linia">{ZUS_WNIOSEK}</p>
			</div>
		</div>
	</div>
</section>

<!-- 4. Wyżywienie (warm). -->
<section class="band warm" aria-labelledby="wyzywienie-heading">
	<div class="inner uklad">
		<h2 id="wyzywienie-heading">{SEKCJE.wyzywienie}</h2>
		<div class="tresc">
			<p class="proza">{CENNIK.wyzywienie}</p>
			<p class="proza">{WYZYWIENIE_SZCZEGOL}</p>
		</div>
	</div>
</section>

<!-- 5. Nieobecność dziecka (white). -->
<section class="band" aria-labelledby="nieobecnosc-heading">
	<div class="inner uklad">
		<h2 id="nieobecnosc-heading">{SEKCJE.nieobecnosc}</h2>
		<div class="tresc">
			<p class="proza">{CENNIK.nieobecnosc}</p>
		</div>
	</div>
</section>

<!-- 6. Jak i kiedy płacić (warm). No account number, no deadline, no interest rule and
     no consequence of paying late: no committed source carries any of them, and the
     copy module marks all three as unconfirmed for the Phase 6 sweep (05 D-30). Per the
     locked project convention a placeholder renders NO visitor-facing badge. -->
<section class="band warm" aria-labelledby="platnosci-heading">
	<div class="inner uklad">
		<h2 id="platnosci-heading">{SEKCJE.platnosci}</h2>
		<div class="tresc">
			<p class="proza">{PLATNOSCI}</p>
		</div>
	</div>
</section>

<!-- 7. Podstawa prawna (white). -->
<section class="band" aria-labelledby="podstawa-heading">
	<div class="inner uklad">
		<h2 id="podstawa-heading">{SEKCJE.podstawa}</h2>
		<div class="tresc">
			<p class="proza">{PODSTAWA.tresc}</p>
			<p class="proza"><a href={PODSTAWA.href}>{PODSTAWA.etykietaLinku}</a></p>
		</div>
	</div>
</section>

<!-- 8. Closing CTA (inherited primary variant, band surface). -->
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
			align-items: start;
		}

		.uklad h2 {
			margin-bottom: 0;
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

	.linia {
		margin: 8px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
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
