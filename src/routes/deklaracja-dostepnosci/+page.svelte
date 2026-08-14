<!--
  Accessibility-declaration STUB (resolves RESEARCH A4 / Open Q2: planner decision: STUB it).
  A minimal Polish "wkrótce" page so the footer's legally-sensitive
  „Deklaracja dostępności" link resolves instead of 404ing before Phase 6, where
  the full WCAG-conformant declaration is authored. Self-contained: no Seo.svelte
  import (that belongs to Plan 03, a later wave). Inherits prerender = true from
  the root +layout.ts. Colors are drawn from the accessible palette tier only.
-->
<svelte:head>
	<title>Deklaracja dostępności | Publiczny Żłobek w Stromcu</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="declaration">
	<h1>Deklaracja dostępności</h1>
	<!-- PLACEHOLDER: pełna, zgodna z ustawą deklaracja dostępności zostanie opublikowana w Fazie 6. -->
	<p>Deklaracja dostępności zostanie opublikowana wkrótce.</p>
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

	p {
		font-family: var(--font-body);
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--color-muted);
		margin: 0;
	}
</style>
