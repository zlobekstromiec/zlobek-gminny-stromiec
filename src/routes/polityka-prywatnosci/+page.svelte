<script lang="ts">
	// Polityka prywatności, a real legal page since 2026-08-27 (LEGAL-02, D-3, quick task
	// 260827-bfa). It replaced the „wkrótce" stub the moment the placówka supplied the
	// administrator's klauzula and the IOD address.
	//
	// TWO DISJOINT SCOPES, and the boundary between them is the page's whole job. The
	// first section is about a child's and its parents' data held by the żłobek; the
	// second is about the handful of fields a visitor types into a form here. Their
	// retention rules differ, and a reader who cannot tell which section they are in
	// would read that difference as a contradiction.
	//
	// NOTHING IS COPIED. The second section renders the SAME `KLAUZULA` export that
	// ConsentBlock shows under both forms. A pasted second copy would drift the day one
	// of them is edited, and only one of the two would ever be maintained.
	//
	// Seo.svelte is deliberately NOT used here. Rebuilding both legal pages onto that
	// component is Phase 6 work (ROADMAP criterion 5), and doing it here would pre-empt
	// that decision; the head block below matches the deklaracja stub's hand-written one.
	// Inherits prerender = true from the root +layout.ts. Accessible palette tier only:
	// nothing from the expressive tier touches legal text.
	import { KLAUZULA } from '$lib/content/forms';
	import {
		KLAUZULA_ADMINISTRATORA,
		POLITYKA_ADMINISTRATOR_NAGLOWEK,
		POLITYKA_DOKUMENTY,
		POLITYKA_FORMULARZE_NAGLOWEK,
		POLITYKA_FORMULARZE_WSTEP,
		POLITYKA_TYTUL,
		POLITYKA_WSTEP
	} from '$lib/content/polityka';
</script>

<svelte:head>
	<title>Polityka prywatności | Publiczny Żłobek w Stromcu</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="policy">
	<h1>{POLITYKA_TYTUL}</h1>
	<p class="wstep">{POLITYKA_WSTEP}</p>

	<!-- Block headings render as h3 under each section's h2, so the hierarchy is
	     h1 to h2 to h3 with no skipped level. The keys mirror ConsentBlock's. -->
	<section aria-labelledby="zakres-zlobek">
		<h2 id="zakres-zlobek">{POLITYKA_ADMINISTRATOR_NAGLOWEK}</h2>
		{#each KLAUZULA_ADMINISTRATORA as blok (blok.naglowek ?? blok.akapity[0])}
			{#if blok.naglowek}
				<h3>{blok.naglowek}</h3>
			{/if}
			{#each blok.akapity as akapit (akapit)}
				<p>{akapit}</p>
			{/each}
		{/each}
		<!-- Wskazanie na pozostale klauzule, ktore leza na /dokumenty (quick 260921-j9c).
		     Stoi POZA petla po blokach, bo klauzula powyzej jest tekstem inspektora i nic
		     naszego nie nalezy do jej srodka. Zdanie jest rozbite wokol odnosnika, wiec
		     zaden ciag kopii nie niesie znacznika. -->
		<p class="wskazanie">
			{POLITYKA_DOKUMENTY.przed}
			<a href={POLITYKA_DOKUMENTY.adres}>{POLITYKA_DOKUMENTY.etykieta}</a>{POLITYKA_DOKUMENTY.po}
		</p>
	</section>

	<section aria-labelledby="zakres-formularze">
		<h2 id="zakres-formularze">{POLITYKA_FORMULARZE_NAGLOWEK}</h2>
		<p class="wstep-sekcji">{POLITYKA_FORMULARZE_WSTEP}</p>
		{#each KLAUZULA as blok (blok.naglowek ?? blok.akapity[0])}
			{#if blok.naglowek}
				<h3>{blok.naglowek}</h3>
			{/if}
			{#each blok.akapity as akapit (akapit)}
				<p>{akapit}</p>
			{/each}
		{/each}
	</section>
</div>

<style>
	.policy {
		max-width: 72rem;
		margin-inline: auto;
		padding-block: 64px;
		padding-inline: 16px;
	}

	@media (min-width: 48rem) {
		.policy {
			padding-inline: 24px;
		}
	}

	@media (min-width: 64rem) {
		.policy {
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
		margin: 0 0 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	h3 {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1.0625rem;
		line-height: 1.4;
		color: var(--color-ink);
		margin: 1.5rem 0 0;
	}

	section {
		margin-top: 2.5rem;
	}

	p {
		/* Legal prose is measured in `ch`, like the klauzula panel under the forms: the
		   comfortable reading measure depends on the character count, not on the viewport. */
		max-width: 68ch;
		font-family: var(--font-body);
		font-size: 1.0625rem;
		line-height: 1.6;
		color: var(--color-muted);
		margin: 0.75rem 0 0;
	}

	.wstep {
		font-size: 1.125rem;
		margin-top: 0;
	}

	.wstep-sekcji {
		margin-top: 0;
	}

	/* Wskazanie na /dokumenty. Odstep wiekszy niz miedzy akapitami klauzuli, bo to zdanie
	   nie nalezy do niej: ma sie czytac jako dopisek redakcji, a nie jako jej ostatni
	   punkt. Odnosnik dostaje podkreslenie, wiec nie zalezy wylacznie od koloru. */
	.wskazanie {
		margin-top: 1.5rem;
	}

	.wskazanie a {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.wskazanie a:hover {
		color: var(--color-brand-blue-hover);
	}
</style>
