<script lang="ts">
	// O-nas teaser (HOME-01, UI-SPEC v1.2 §6): carries the FULL verbatim core
	// message as a styled blockquote (the hero leads with its sentence 2). The
	// message constant lives in site.ts and is final client copy: not one
	// character may change (D-02).
	import Cta from './Cta.svelte';
	import { coreMessage } from '$lib/content/site';
</script>

<section class="about" aria-labelledby="o-nas-heading">
	<div class="inner">
		<!-- PLACEHOLDER: decorative image slot (kadra or sala dzienna, Phase 6,
		     consented photography only). -->
		<div class="about-media" aria-hidden="true"></div>

		<div class="about-copy">
			<h2 id="o-nas-heading">Kilka słów od nas</h2>
			<blockquote class="core-message">{coreMessage}</blockquote>
			<Cta href="/o-nas" variant="secondary">Poznaj żłobek</Cta>
		</div>
	</div>
</section>

<style>
	.about {
		background: var(--color-surface-warm);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.about {
			padding-block: 80px;
		}
	}

	.inner {
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
		align-items: center;
	}

	@media (min-width: 768px) {
		.inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.inner {
			grid-template-columns: 0.9fr 1.1fr;
			padding-inline: 32px;
			gap: 56px;
		}
	}

	/* Decorative square slot; copy-first below 1024px (media moves after). */
	.about-media {
		width: 100%;
		aspect-ratio: 1 / 1;
		border-radius: var(--radius-lg);
		background: linear-gradient(160deg, var(--color-tint-pink), var(--color-tint-yellow));
		order: 2;
	}

	.about-copy {
		order: 1;
	}

	@media (min-width: 1024px) {
		.about-media {
			order: 1;
		}

		.about-copy {
			order: 2;
		}
	}

	.about-copy h2 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		line-height: 1.2;
		color: var(--color-ink);
		margin: 0 0 20px;
	}

	/* Expressive yellow border is decorative (carries no information). */
	.core-message {
		font-family: var(--font-body);
		font-weight: 400;
		font-size: 19px;
		line-height: 1.65;
		color: var(--color-muted);
		max-width: 56ch;
		text-wrap: pretty;
		margin: 0 0 28px;
		padding-left: 20px;
		border-left: 4px solid var(--color-expr-yellow);
	}
</style>
