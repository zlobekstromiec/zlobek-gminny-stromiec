<!--
  Privacy-policy STUB (UI-SPEC Amendment v1.1 §6: same precedent as the
  Deklaracja dostępności stub): a minimal Polish "wkrótce" page so the footer's
  legally-expected „Polityka prywatności (RODO)" link resolves instead of 404ing
  before Phase 6, where the full RODO policy is authored with the Gmina's IOD.
  Self-contained: no Seo.svelte import (matches the deklaracja stub). Inherits
  prerender = true from the root +layout.ts. Accessible palette tier only.
-->
<svelte:head>
	<title>Polityka prywatności | Publiczny Żłobek w Stromcu</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="policy">
	<h1>Polityka prywatności (RODO)</h1>
	<!-- PLACEHOLDER: pełna polityka prywatności (RODO) zostanie opublikowana w Fazie 6. -->
	<p>Polityka prywatności zostanie opublikowana wkrótce.</p>
</section>

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

	p {
		font-family: var(--font-body);
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--color-muted);
		margin: 0;
	}
</style>
