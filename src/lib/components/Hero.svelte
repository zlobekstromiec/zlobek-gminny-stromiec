<script lang="ts">
	// Hero (HOME-01) — leads with the żłobek's core message VERBATIM.
	//
	// CONTEXT D-01: a short Polish hook headline (h1, PLACEHOLDER) sits above the
	// żłobek's full 4-sentence core message, which renders VERBATIM directly beneath
	// as a styled lead quote. Per D-02 that message is FINAL client copy from
	// PROJECT.md line 47 — it is NOT a placeholder and not a single character is
	// altered. Only the hook headline is a marked PLACEHOLDER (LAUNCH-01).
	//
	// D-03: the image slot is a non-identifiable warm placeholder (no child faces),
	// shipped as AVIF/WebP with explicit width/height (no CLS) and fetchpriority="high"
	// (PITFALLS #9). aria-hidden while purely decorative; a real Polish alt lands with
	// consented photography in Phase 6.
	import Cta from './Cta.svelte';

	// VERBATIM core message (PROJECT.md line 47) — FINAL client copy (D-02). Kept as a
	// single-line constant so the exact wording is contiguous and un-wrapped; do NOT
	// alter a single character and do NOT mark it PLACEHOLDER.
	const coreMessage =
		'„Drogi Rodzicu, Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać nad każdym krokiem Twojej pociechy. Będziemy cierpliwie ocierać łzy, kołysać do snu i z autentycznym zachwytem świętować każde małe zwycięstwo — od samodzielnie zjedzonej zupki po pierwszy, odważny krok."';
</script>

<section class="hero">
	<!-- Decorative expressive blobs (expr-* tier = non-text surfaces only), behind
	     the content at low z-index, hidden from assistive tech (UI-SPEC §Hero). -->
	<div class="blob blob-blue" aria-hidden="true"></div>
	<div class="blob blob-yellow" aria-hidden="true"></div>
	<div class="blob blob-orange" aria-hidden="true"></div>

	<div class="hero-inner">
		<div class="hero-copy">
			<!-- PLACEHOLDER: hook headline — replace with the final client hook line at
			     launch (LAUNCH-01). Only the hook is a placeholder; the lead below is final. -->
			<h1 class="hook">Miejsce pełne radości i troski</h1>

			<!-- VERBATIM core message (final copy, D-02) — rendered from the un-wrapped
			     constant above so the exact wording is preserved character-for-character. -->
			<blockquote class="lead">{coreMessage}</blockquote>

			<div class="cta-row">
				<Cta href="/rekrutacja" variant="primary" icon>Zapisz dziecko</Cta>
				<Cta href="/o-nas" variant="secondary">Poznaj żłobek</Cta>
			</div>
		</div>

		<div class="hero-media">
			<!-- PLACEHOLDER decorative image (no child faces — consent-safe, D-03).
			     Explicit width/height keep the 4:3 box reserved (no CLS); fetchpriority
			     high because it is the LCP element. Swapped for consented photography in
			     Phase 6, when it also gains a real Polish alt. -->
			<picture>
				<source srcset="/hero-placeholder.avif" type="image/avif" />
				<source srcset="/hero-placeholder.webp" type="image/webp" />
				<img
					class="hero-img"
					src="/hero-placeholder.webp"
					width="1200"
					height="900"
					fetchpriority="high"
					decoding="async"
					alt=""
					aria-hidden="true"
				/>
			</picture>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		background: var(--color-surface);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.hero {
			padding-block: 96px;
		}
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		max-width: 72rem;
		margin-inline: auto;
		padding-inline: 16px;
		display: grid;
		gap: 32px;
		align-items: center;
	}

	@media (min-width: 768px) {
		.hero-inner {
			padding-inline: 24px;
		}
	}

	@media (min-width: 1024px) {
		.hero-inner {
			grid-template-columns: 1.1fr 0.9fr;
			padding-inline: 32px;
			gap: 48px;
		}
	}

	.hook {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 2.75rem);
		line-height: 1.1;
		color: var(--color-ink);
		margin: 0 0 16px;
	}

	.lead {
		font-family: var(--font-body);
		font-weight: 400;
		font-size: 18px;
		line-height: 1.6;
		color: var(--color-muted);
		max-width: 60ch;
		margin: 0 0 24px;
		padding-left: 16px;
		border-left: 4px solid var(--color-band);
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}

	.hero-media {
		justify-self: center;
		width: 100%;
	}

	.hero-img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: var(--radius-lg);
		box-shadow: 0 12px 28px rgb(15 23 42 / 0.12);
	}

	/* Decorative blobs — expressive tier, non-text surfaces only. */
	.blob {
		position: absolute;
		z-index: 0;
		border-radius: 9999px;
		filter: blur(8px);
		opacity: 0.35;
		pointer-events: none;
	}

	.blob-blue {
		width: 320px;
		height: 320px;
		background: var(--color-expr-blue);
		top: -120px;
		right: -80px;
	}

	.blob-yellow {
		width: 220px;
		height: 220px;
		background: var(--color-expr-yellow);
		bottom: -90px;
		left: -60px;
	}

	.blob-orange {
		width: 180px;
		height: 180px;
		background: var(--color-expr-orange);
		top: 40%;
		left: -70px;
	}
</style>
