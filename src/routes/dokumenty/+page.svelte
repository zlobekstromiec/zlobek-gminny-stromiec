<script lang="ts">
	// Dokumenty page (DOCS-01; 02-UI-SPEC.md /dokumenty composition). Prerendered,
	// zero-JS (inherits prerender = true from +layout.ts): the grouped entries come
	// from +page.server.ts, which computes each file's type/size meta at build via
	// statSync (D-14). Rows reuse the WCAG-correct .doc-row pattern from
	// Recruitment.svelte: the meta (typ, rozmiar, wersja) lives INSIDE the link so a
	// screen reader announces it with the name. Category groups render in the fixed
	// order Rekrutacja, Statut i uchwały, Organizacja żłobka, RODO, and an empty group
	// is not emitted at all (dormant-category rule, D-13). Route adds NO extra
	// <main>/h1 beyond the page heading (the layout owns <main>).
	//
	// ONE BAND HAS AN INTRO AND IT IS RODO (quick 260921-j9c). The inspektor ochrony
	// danych delivered his obowiązek informacyjny as a text to publish HERE plus a set
	// of klauzule to hang under it, so that band opens with the text of document 08 and
	// ends with „Materiały do pobrania:" before its list. The condition is on the
	// CATEGORY, not on the group index, so inserting a category above RODO cannot move
	// the intro onto somebody else's band.
	//
	// The two e-mail addresses in that intro are interpolated from `contact` and the
	// żłobek's own address goes through AdresEmail, the project's single renderer of it
	// (quick 260901-duo). src/lib/content/rodo.ts deliberately holds no address at all.
	import { FileText } from '@lucide/svelte';
	import AdresEmail from '$lib/components/AdresEmail.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { contact } from '$lib/content/site';
	import {
		RODO_ADMINISTRATOR,
		RODO_ADRESACI,
		RODO_IOD,
		RODO_POBRANIE,
		RODO_PO_LISCIE,
		RODO_WSTEP
	} from '$lib/content/rodo';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const grupy = $derived(data.grupy);
</script>

<Seo
	title="Dokumenty: Publiczny Żłobek w Stromcu"
	description="Pobierz dokumenty rekrutacyjne, statut i uchwały, dokumenty organizacyjne oraz klauzule informacyjne RODO Publicznego Żłobka w Stromcu."
	canonical="/dokumenty"
/>

<!-- Page header -->
<header class="page-head">
	<div class="inner">
		<h1>Dokumenty</h1>
		<p class="lead">
			Tutaj znajdziesz dokumenty potrzebne w rekrutacji, statut i uchwały, dokumenty organizacyjne
			żłobka oraz klauzule informacyjne RODO. Kliknij nazwę dokumentu, aby go pobrać.
		</p>
	</div>
</header>

{#if grupy.length > 0}
	{#each grupy as grupa, i (grupa.kategoria)}
		<section class="band" class:warm={i % 2 === 1} aria-labelledby="{grupa.kategoria}-heading">
			<div class="inner uklad">
				<h2 id="{grupa.kategoria}-heading">{grupa.naglowek}</h2>
				<div class="tresc">
					{#if grupa.kategoria === 'rodo'}
						<div class="wstep-rodo">
							{#each RODO_WSTEP as akapit (akapit)}
								<p class="proza">{akapit}</p>
							{/each}
							<ul class="adresaci">
								{#each RODO_ADRESACI as punkt (punkt)}
									<li>{punkt}</li>
								{/each}
							</ul>
							{#each RODO_PO_LISCIE as akapit (akapit)}
								<p class="proza">{akapit}</p>
							{/each}

							<h3>{RODO_IOD.naglowek}</h3>
							<p class="proza">{RODO_IOD.wstep(contact.iodName)}</p>
							<p class="proza">
								{RODO_IOD.email}
								<a href="mailto:{contact.iodEmail}">{contact.iodEmail}</a>
							</p>
							<p class="proza">
								{RODO_IOD.poczta}
								{contact.name}, {contact.addressLines[0]}, {contact.addressLines[1]}
							</p>

							<h3>{RODO_ADMINISTRATOR.naglowek}</h3>
							<p class="proza">{RODO_ADMINISTRATOR.wstep}</p>
							<p class="proza">
								{RODO_ADMINISTRATOR.email}
								<a href="mailto:{contact.email}"><AdresEmail /></a>
							</p>
							<p class="proza">
								{RODO_ADMINISTRATOR.poczta}
								{contact.name}, {contact.addressLines[0]}, {contact.addressLines[1]}
							</p>

							<p class="proza pobranie">{RODO_POBRANIE}</p>
						</div>
					{/if}
					<ul class="docs">
						{#each grupa.dokumenty as dok (dok.plik)}
							<li>
								<a class="doc-row" href={dok.plik}>
									<FileText class="doc-icon" size={20} aria-hidden="true" />
									<span class="doc-name">{dok.nazwa}</span>
									<span class="doc-meta">{dok.meta}</span>
								</a>
								{#if dok.zrodlo_bip}
									<a
										class="doc-source"
										href={dok.zrodlo_bip}
										target="_blank"
										rel="noopener noreferrer"
									>
										Źródło: BIP<span class="visually-hidden"> (otwiera się w nowej karcie)</span>
									</a>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</section>
	{/each}
{:else}
	<!-- Whole-page empty state (safety net; page ships seeded with the BIP set). -->
	<section class="band">
		<div class="inner">
			<div class="empty">
				<FileText class="empty-icon" size={40} aria-hidden="true" />
				<h2>Wkrótce udostępnimy dokumenty</h2>
				<p>Trwa przygotowywanie dokumentów do pobrania. Zajrzyj tutaj wkrótce.</p>
			</div>
		</div>
	</section>
{/if}

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

		/* Editorial split (Amendment v1.6 §2): category heading in the left rail,
		   the document list filling the right track to the container edge. */
		.uklad {
			display: grid;
			grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
			column-gap: 48px;
			align-items: start;
		}

		.uklad h2 {
			margin-bottom: 0;
		}

		.uklad .docs,
		.uklad .tresc {
			max-width: none;
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

	.docs {
		list-style: none;
		margin: 0;
		padding: 0;
		max-width: 52rem;
	}

	/* Prawy tor pasma. Istnieje po to, zeby wstep RODO i lista dokumentow byly JEDNYM
	   dzieckiem siatki edytorskiej: bez niego wstep zajalby tor naglowka i naglowek
	   „RODO" wyladowalby nad tekstem zamiast obok niego. */
	.tresc {
		max-width: 52rem;
	}

	/* Wstep pasma RODO. Odstep na dole oddziela go od listy plikow, ktora zapowiada;
	   reszta wygladu to zwykla proza tej strony. Poziom palety: wylacznie dostepny. */
	.wstep-rodo {
		margin-bottom: 24px;
	}

	.proza {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink);
		max-width: 65ch;
		margin: 0 0 12px;
	}

	.proza a {
		color: var(--color-brand-blue);
		text-decoration: underline;
		overflow-wrap: anywhere;
	}

	.proza a:hover {
		color: var(--color-brand-blue-hover);
	}

	/* `list-style: disc` jest tu JAWNIE, bo reset w app.css zdejmuje znaczniki z kazdej
	   listy, a ta jest wyliczeniem czytanym jako wyliczenie: bez znacznikow cztery grupy
	   adresatow wygladalyby jak cztery wciete akapity. */
	.adresaci {
		list-style: disc;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.6;
		color: var(--color-ink);
		max-width: 65ch;
		margin: 0 0 12px;
		padding-left: 24px;
	}

	.adresaci li {
		margin-bottom: 4px;
	}

	.wstep-rodo h3 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 18px;
		line-height: 1.3;
		color: var(--color-ink);
		margin: 24px 0 8px;
	}

	/* Zdanie zapowiadajace liste. Pogrubione, bo jest zapowiedzia, a nie kolejnym
	   akapitem; bez dolnego odstepu, bo odstep nalezy do calego wstepu. */
	.pobranie {
		font-weight: 700;
		margin-bottom: 0;
	}

	/* Row markup + a11y reused verbatim from Recruitment.svelte (.doc-row): the
	   meta stays inside the link, min 48px touch target, brand-blue underline. */
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

	/* WIERSZ ROZKLADA SIE NA DWIE LINIE NA TELEFONIE, i to jest poprawka z quicka
	   260921-j9c, a nie ozdoba. Meta („DOCX · 33 KB · wersja z 21.09.2026") zajmuje okolo
	   180 px niezaleznie od szerokosci ekranu, wiec przy 390 px na nazwe zostawalo okolo
	   150 px. Dopoki nazwy byly krotkie, miescily sie mimo to; „Klauzula informacyjna dla
	   dzieci, rodziców i opiekunów" zawijala sie na piec wierszy, a `overflow-wrap: anywhere`
	   lamalo ostatnia z nich w srodku wyrazu. Nazwa dostaje wiec caly wiersz, a meta staje
	   pod nia, wciete o ikone i odstep (20 px + 12 px), zeby oba naleply do jednego wiersza
	   wizualnie. Meta nadal jest WEWNATRZ odnosnika, wiec kontrakt D-14 jest nienaruszony. */
	@media (max-width: 639px) {
		/* SIATKA, A NIE ZAWIJANY FLEX. Zawijany flex lamie sie tam, gdzie zabraknie
		   miejsca, wiec przy dluzszej nazwie pierwsza do nowego wiersza szla NAZWA i ikona
		   zostawala sama w swoim wierszu. Siatka o dwoch torach stawia kazdy element tam,
		   gdzie ma stac, niezaleznie od dlugosci tekstu: ikona w lewym torze, nazwa obok
		   niej, meta pod nazwa i w jej torze. */
		.doc-row {
			display: grid;
			grid-template-columns: 20px minmax(0, 1fr);
			align-items: start;
			column-gap: 12px;
			row-gap: 2px;
			padding-block: 12px;
		}

		.doc-name {
			grid-column: 2;
		}

		.doc-meta {
			grid-column: 2;
		}
	}

	/* Optional provenance link (D-16), rendered only when zrodlo_bip is set. */
	.doc-source {
		display: inline-block;
		margin: 6px 0 4px;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.doc-source:hover {
		color: var(--color-brand-blue-hover);
	}

	/* Whole-page empty-state panel (mirrors the inherited Aktualności pattern). */
	.empty {
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 40px 24px;
		text-align: center;
		max-width: 40rem;
		margin-inline: auto;
	}

	.empty :global(.empty-icon) {
		color: var(--color-brand-blue);
		margin-bottom: 12px;
	}

	.empty h2 {
		font-size: 20px;
		margin: 0 0 8px;
	}

	.empty p {
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
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
