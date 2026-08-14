<script lang="ts">
	// Rekrutacja page (RECRUIT-01, RECRUIT-02, RECRUIT-03, RECRUIT-05; D-01, D-06,
	// D-14, D-15, D-18). Follows the 04-UI-SPEC.md Amendment v1.4 „/rekrutacja -
	// status-first" composition table section for section: page header (white), status
	// banner (band), zgłoszenie form (warm), kryteria i punktacja (white), procedura
	// (band), ramka opłat (white), wnioski do pobrania (warm).
	//
	// Static, zero-JavaScript content with exactly ONE hydrated island: the zgłoszenie
	// form. The site-wide static-output flag is set once in src/routes/+layout.ts and is
	// deliberately NOT restated here; its literal name is grep-banned in this file
	// (acceptance gate for this plan), so it is described rather than written.
	//
	// The layout owns <main>, so this route adds no wrapper landmark and no heading
	// above its own h1. Heading order: h1 here, then one h2 per section, one of which
	// (the form card's) is rendered by the island and referenced by id from the section
	// that contains it.
	//
	// Two content rules that this page exists to honour:
	//  1. The nabór status is NEUTRAL information. A closed nabór is not a failure, so
	//     the banner uses the band surface and ink text, never the semantic error tier
	//     that is reserved for things that actually went wrong (UI-SPEC hard rule 2).
	//     The strings come pre-derived from site.ts, so flipping `recruitmentOpen`
	//     switches the homepage and this page together with no component change.
	//  2. No date on this page is presented as a current stage or an opening date. The
	//     2026/2027 stage-by-stage timetable in the committed source document is
	//     archival and its section 10.3 forbids that, so the banner points at the
	//     authority that will announce the next nabór instead of at a calendar.
	//
	// Every fact is interpolated from the content modules: no address, room, office
	// hours, telephone number, e-mail, amount or point value is written as a literal
	// anywhere in this file, including in the head metadata below.
	import FileText from '@lucide/svelte/icons/file-text';
	import FeeBox from '$lib/components/FeeBox.svelte';
	import KryteriaTable from '$lib/components/KryteriaTable.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ZgloszenieForm from '$lib/components/ZgloszenieForm.svelte';
	import { BIP_ZLOBEK, KRYTERIA, OPLATY, PROCEDURA, WNIOSKI_PUSTE } from '$lib/content/rekrutacja';
	import { recruitment } from '$lib/content/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const wnioski = $derived(data.wnioski);
</script>

<Seo
	title="Rekrutacja: Publiczny Żłobek w Stromcu"
	description="Status naboru, kryteria przyjęcia i punktacja, przebieg procedury, opłaty w skrócie oraz wnioski do pobrania. Zostaw zgłoszenie na listę rezerwową."
	canonical="/rekrutacja"
/>

<!-- Section 1: page header (white surface). Copy verbatim from the UI-SPEC page
     chrome table. -->
<header class="page-head">
	<div class="inner">
		<h1>Rekrutacja do żłobka</h1>
		<p class="lead">
			Nabór podstawowy prowadzi Gmina Stromiec. Poniżej znajdziesz aktualny status naboru, kryteria
			przyjęcia, przebieg procedury i wnioski do pobrania.
		</p>
	</div>
</header>

<!-- Section 2: status banner (band surface). Status first, because the first thing a
     parent needs to know is where they stand. The dot is decorative. -->
<section class="sekcja band" aria-labelledby="status-heading">
	<div class="inner">
		<div class="status-banner">
			<span class="kropka" aria-hidden="true"></span>
			<div>
				<h2 id="status-heading">{recruitment.heading}</h2>
				<p class="status-tresc">{recruitment.body}</p>
				<p class="status-termin">{recruitment.deadline}</p>
				<!-- PLACEHOLDER: the date of the next nabór is unconfirmed, so this line
				     names the announcing authority rather than a date (site.ts). -->
				<p class="status-tresc">{recruitment.nastepnyNabor}</p>
			</div>
		</div>
	</div>
</section>

<!-- Section 3: zgłoszenie form (warm surface). The island renders the static fallback
     panel, the noscript note, the form card with its own h2, the birth-date fieldset,
     the consent block and the klauzula, so this section contributes only the surface
     wrapper. It is labelled by that card heading (the id is declared on the island's
     own h2), which is the correct accessible name for it and avoids a duplicated
     invisible heading. -->
<section class="sekcja warm" aria-labelledby="zgloszenie-naglowek">
	<div class="inner">
		<ZgloszenieForm />
	</div>
</section>

<!-- Section 4: kryteria i punktacja (white surface). -->
<section class="sekcja" aria-labelledby="kryteria-heading">
	<div class="inner">
		<h2 id="kryteria-heading">Kryteria i punktacja</h2>
		<KryteriaTable kryteria={KRYTERIA} caption="Kryteria przyjęcia i liczba punktów" />
	</div>
</section>

<!-- Section 5: procedura (band surface). The numbered step treatment is the v1.2
     Recruitment one: a 34px brand-blue circle with a white display numeral. The
     numeral is decorative, because the ordered list already conveys the order. -->
<section class="sekcja band" aria-labelledby="procedura-heading">
	<div class="inner">
		<h2 id="procedura-heading">Jak złożyć wniosek</h2>
		<ol class="procedura">
			{#each PROCEDURA as krok, i (krok.tytul)}
				<li class="krok">
					<span class="krok-numer" aria-hidden="true">{i + 1}</span>
					<span class="krok-tekst">
						<span class="krok-tytul">{krok.tytul}</span>
						<span class="krok-tresc">{krok.tresc}</span>
					</span>
				</li>
			{/each}
		</ol>
	</div>
</section>

<!-- Section 6: opłaty w skrócie (white surface). The panel keeps the amount and the
     condition under which the ZUS benefit covers it in one block (D-15). The full
     breakdown table belongs to /cennik in Phase 5. -->
<section class="sekcja" aria-labelledby="oplaty-heading">
	<div class="inner">
		<h2 id="oplaty-heading">{OPLATY.naglowek}</h2>
		<FeeBox />
	</div>
</section>

<!-- Section 7: wnioski do pobrania (warm surface). Rows reuse the /dokumenty row
     contract verbatim, with the file meta INSIDE the link so a screen reader
     announces it together with the name (D-14). The rows come from the same shared
     resolver as /dokumenty and the homepage panel, so a document staff replace
     through the CMS appears here with correct metadata and no code change.
     The BIP link is rendered ALWAYS, however many rows there are: the complete set
     of the wniosek and its six załączniki lives there, and we link to it rather than
     rebuilding it. -->
<section class="sekcja warm" aria-labelledby="wnioski-heading">
	<div class="inner">
		<h2 id="wnioski-heading">Wnioski do pobrania</h2>

		{#if wnioski.length > 0}
			<ul class="docs">
				{#each wnioski as dok (dok.plik)}
					<li>
						<a class="doc-row" href={dok.plik}>
							<FileText class="doc-icon" size={20} aria-hidden="true" />
							<span class="doc-name">{dok.nazwa}</span>
							<span class="doc-meta">{dok.meta}</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="pusto">
				<h3>{WNIOSKI_PUSTE.naglowek}</h3>
				<p>{WNIOSKI_PUSTE.tresc}</p>
			</div>
		{/if}

		<p class="bip-opis">{BIP_ZLOBEK.opis}</p>
		<a class="bip-link" href={BIP_ZLOBEK.url} target="_blank" rel="noopener noreferrer">
			{BIP_ZLOBEK.etykieta}<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
		</a>
	</div>
</section>

<style>
	/* Surface rhythm and the responsive container are the established /dokumenty
	   route contract, reused verbatim so spacing and gutters cannot drift. */
	.page-head,
	.sekcja {
		background: var(--color-surface);
		padding-block: 48px;
	}

	.sekcja.band {
		background: var(--color-band);
	}

	.sekcja.warm {
		background: var(--color-surface-warm);
	}

	@media (min-width: 1024px) {
		.page-head,
		.sekcja {
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

	.sekcja h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 28px;
	}

	/* Status banner (UI-SPEC Contract 9): band surface, radius-md, 16 -> 24px padding,
	   max 46rem. Its heading is a section-level h2 rendered at panel size, and the
	   deadline line takes the same focus-ring colour the homepage Recruitment header
	   strip uses. */
	.status-banner {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		max-width: 46rem;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-band);
	}

	@media (min-width: 768px) {
		.status-banner {
			padding: 24px;
		}
	}

	/* Decorative dot: it repeats the state the title already states in words, so
	   nothing is lost when it is not perceived. */
	.kropka {
		flex: none;
		width: 8px;
		height: 8px;
		margin-top: 10px;
		border-radius: var(--radius-pill);
		background: var(--color-brand-blue);
	}

	.status-banner h2 {
		font-size: 20px;
		margin: 0;
	}

	.status-tresc {
		margin: 8px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.status-termin {
		margin: 8px 0 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-focus-ring);
	}

	/* Numbered steps, markup and typography identical to Recruitment.svelte. */
	.procedura {
		list-style: none;
		margin: 0;
		padding: 0;
		max-width: 46rem;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.krok {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	.krok-numer {
		flex: none;
		width: 34px;
		height: 34px;
		border-radius: var(--radius-pill);
		background: var(--color-brand-blue);
		color: #ffffff;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 17px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.krok-tekst {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.krok-tytul {
		font-family: var(--font-body);
		font-size: 17px;
		font-weight: 700;
		color: var(--color-ink);
	}

	.krok-tresc {
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* Document rows reused verbatim from the /dokumenty route contract: the meta stays
	   inside the link, 48px touch target, brand-blue underline. */
	.docs {
		list-style: none;
		margin: 0;
		padding: 0;
		max-width: 46rem;
	}

	.doc-row {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 48px;
		padding: 8px 0;
		border-bottom: 1px solid var(--color-border-subtle);
		text-decoration: none;
	}

	.doc-row :global(.doc-icon) {
		flex: none;
		color: var(--color-brand-blue);
	}

	.doc-name {
		flex: 1 1 auto;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
		overflow-wrap: anywhere;
	}

	.doc-row:hover .doc-name {
		color: var(--color-brand-blue-hover);
	}

	.doc-meta {
		flex: none;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		color: var(--color-muted);
	}

	/* Empty state for the category (UI-SPEC „Empty states"). The BIP link below stays
	   in place, so a parent is never left with nowhere to go. */
	.pusto {
		max-width: 46rem;
		padding: 24px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.pusto h3 {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.pusto p {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.bip-opis {
		margin: 24px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.bip-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.bip-link:hover {
		color: var(--color-brand-blue-hover);
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
