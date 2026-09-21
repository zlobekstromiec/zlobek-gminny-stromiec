<script lang="ts">
	// Accessibility-declaration STUB (resolves RESEARCH A4 / Open Q2: planner decision:
	// STUB it). A Polish page so the footer's legally-sensitive „Deklaracja dostępności"
	// link resolves instead of 404ing before Phase 6, where the full WCAG-conformant
	// declaration is authored. Self-contained: no Seo.svelte import (that belongs to Plan
	// 03, a later wave). Inherits prerender = true from the root +layout.ts. Colours are
	// drawn from the accessible palette tier only.
	//
	// IT STOPPED BEING A „WKRÓTCE" PAGE ON 2026-09-21 (quick 260921-j9c). The director sent
	// the koordynator's name and phone and both lists of accessibility facts about the
	// building, and those are precisely the inputs that were blocking the declaration.
	// Holding them in an inbox until Phase 6 starts would have kept a public body's site
	// silent about a wheelchair ramp it actually has, so they are published now, as three
	// interim sections, from src/lib/content/dostepnosc.ts.
	//
	// THE FULL DECLARATION IS STILL PHASE 6 and this page does NOT pre-empt it. Plans 06-09
	// and 06-10 build the statutory document against Warunki techniczne publikacji v2.0,
	// with its own editor-owned store and its own closed set of statutory headings; the
	// three headings below are interim and will not survive that rebuild in this form.
	import {
		ARCHITEKTONICZNA,
		KOMUNIKACYJNO_INFORMACYJNA,
		KOORDYNATOR,
		KOORDYNATOR_TELEFON_ETYKIETA,
		KOORDYNATOR_WSTEP,
		NAGLOWKI
	} from '$lib/content/dostepnosc';
</script>

<svelte:head>
	<title>Deklaracja dostępności | Publiczny Żłobek w Stromcu</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="declaration">
	<h1>Deklaracja dostępności</h1>
	<!-- PLACEHOLDER: pełna deklaracja dostępności, zgodna z Warunkami technicznymi
	     publikacji v2.0, powstaje w Fazie 6. Poniżej są fakty, które już mamy. -->
	<p class="wstep">
		Pełną deklarację dostępności opublikujemy wkrótce. Poniżej podajemy dane koordynatora
		dostępności oraz informacje o dostępności budynku żłobka.
	</p>

	<h2>{NAGLOWKI.koordynator}</h2>
	<p>{KOORDYNATOR_WSTEP} {KOORDYNATOR.imie}.</p>
	<p>
		{KOORDYNATOR_TELEFON_ETYKIETA}
		<a href={KOORDYNATOR.telefonHref}>{KOORDYNATOR.telefonTekst}</a>
	</p>

	<h2>{NAGLOWKI.architektoniczna}</h2>
	<ul class="lista lista-architektoniczna">
		{#each ARCHITEKTONICZNA as fakt (fakt)}
			<li>{fakt}</li>
		{/each}
	</ul>

	<h2>{NAGLOWKI.komunikacyjna}</h2>
	<ul class="lista lista-komunikacyjna">
		{#each KOMUNIKACYJNO_INFORMACYJNA as fakt (fakt)}
			<li>{fakt}</li>
		{/each}
	</ul>
</section>

<style>
	.declaration {
		max-width: 72rem;
		margin-inline: auto;
		padding-block: 64px;
		padding-inline: 16px;
	}

	@media (min-width: 48rem) {
		.declaration {
			padding-inline: 24px;
		}
	}

	@media (min-width: 64rem) {
		.declaration {
			padding-inline: 32px;
		}
	}

	h1 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 2rem;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 1rem;
	}

	h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.5rem;
		line-height: 1.3;
		color: var(--color-ink);
		margin: 2.5rem 0 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	p {
		font-family: var(--font-body);
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--color-muted);
		max-width: 68ch;
		margin: 0 0 0.75rem;
	}

	p:last-child {
		margin-bottom: 0;
	}

	/* Odnośnik telefoniczny: podkreślenie, żeby afordancja nie zależała wyłącznie od
	   koloru, i 44 px wysokości celu dotykowego, tak samo jak numer żłobka w hero. */
	p a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-brand-blue);
		font-weight: 700;
		text-decoration: underline;
	}

	p a:hover {
		color: var(--color-brand-blue-hover);
	}

	.lista {
		list-style: disc;
		font-family: var(--font-body);
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--color-muted);
		max-width: 68ch;
		margin: 0;
		padding-left: 1.5rem;
	}

	.lista li {
		margin-bottom: 0.5rem;
	}

	.lista li:last-child {
		margin-bottom: 0;
	}
</style>
