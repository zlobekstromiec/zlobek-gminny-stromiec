<script lang="ts">
	// Hero v2 (HOME-01, UI-SPEC v1.2 §6): status pill, two-tone hook headline and
	// a single-sentence emotional lead. The FULL verbatim core message lives in
	// AboutTeaser further down the same homepage (Amendment v1.1 decision); the
	// lead below quotes sentence 2 of it verbatim.
	//
	// D-03: the image slot is a non-identifiable warm placeholder (no child faces),
	// shipped as AVIF/WebP with explicit width/height (no CLS) and fetchpriority="high"
	// (PITFALLS #9). aria-hidden while purely decorative; a real Polish alt lands with
	// consented photography in Phase 6.
	import Cta from './Cta.svelte';
	import IconSun from '$lib/icons/IconSun.svelte';
	import { contact, recruitment } from '$lib/content/site';
</script>

<section class="hero">
	<!-- Decorative expressive blobs (expr-* tier = non-text surfaces only), behind
	     the content at low z-index, hidden from assistive tech (UI-SPEC §Hero). -->
	<div class="blob blob-blue" aria-hidden="true"></div>
	<div class="blob blob-yellow" aria-hidden="true"></div>

	<div class="hero-inner">
		<div class="hero-copy">
			<p class="pill">
				<span class="pill-icon" aria-hidden="true"><IconSun size={16} /></span>
				{recruitment.pill}
			</p>

			<!-- PLACEHOLDER: hook headline pending final client confirmation (LAUNCH-01).
			     Two-tone highlight uses accent-active (v1.2 contrast ruling: accent-hover
			     fails 3:1 on the band region of the gradient). -->
			<h1 class="hook">Radosny start <span class="hl">dla najmłodszych</span></h1>

			<!-- Sentence 2 of the VERBATIM core message (final copy, D-02): quoted
			     exactly; the full message renders in AboutTeaser (same page). -->
			<p class="lead">
				Kiedy Ty będziesz realizować swoje obowiązki, my będziemy czuwać nad każdym krokiem Twojej
				pociechy.
			</p>

			<div class="cta-row">
				<Cta href="/rekrutacja" variant="primary" icon>Zapisz dziecko</Cta>
				<Cta href="/kontakt" variant="secondary">Zadzwoń do nas</Cta>
			</div>

			<!-- PLACEHOLDER: phone number pending written client confirmation (site.ts). -->
			<p class="phone-line">
				Masz pytanie? Zadzwoń:
				<a href={contact.phoneHref}>{contact.phoneDisplay}</a>
			</p>
		</div>

		<div class="hero-media">
			<!-- PLACEHOLDER decorative image (no child faces, consent-safe, D-03).
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
		background: linear-gradient(180deg, var(--color-band) 0%, var(--color-surface) 100%);
		padding-block: 48px;
	}

	@media (min-width: 1024px) {
		.hero {
			padding-block: 72px;
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
			grid-template-columns: 1.05fr 0.95fr;
			padding-inline: 32px;
			gap: 56px;
		}
	}

	/* Status pill: white surface, accent border (decorative), accent-active text
	   (5.02:1 on white). The recruitment state string comes from site.ts. */
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 20px;
		padding: 6px 14px;
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		border: 2px solid var(--color-accent);
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		color: var(--color-accent-active);
	}

	.pill-icon {
		display: inline-flex;
		color: var(--color-accent-active);
	}

	.hook {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 2.75rem);
		line-height: 1.1;
		color: var(--color-brand-blue);
		margin: 0 0 16px;
		text-wrap: balance;
	}

	.hook .hl {
		color: var(--color-accent-active);
	}

	.lead {
		font-family: var(--font-body);
		font-weight: 400;
		font-size: 19px;
		line-height: 1.55;
		color: var(--color-muted);
		max-width: 46ch;
		margin: 0 0 28px;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 24px;
	}

	.phone-line {
		font-family: var(--font-body);
		font-size: 15px;
		color: var(--color-muted);
		margin: 0;
	}

	.phone-line a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--color-brand-blue);
		font-weight: 700;
		text-decoration: underline;
	}

	.phone-line a:hover {
		color: var(--color-brand-blue-hover);
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
		border: 6px solid var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: 0 16px 40px rgb(3 105 161 / 0.18);
	}

	/* Decorative blobs: expressive tier, non-text surfaces only (two, per v1.2). */
	.blob {
		position: absolute;
		z-index: 0;
		border-radius: 9999px;
		filter: blur(10px);
		pointer-events: none;
	}

	.blob-blue {
		width: 340px;
		height: 340px;
		background: var(--color-expr-blue);
		opacity: 0.18;
		top: -140px;
		right: -60px;
	}

	.blob-yellow {
		width: 200px;
		height: 200px;
		background: var(--color-expr-yellow);
		opacity: 0.22;
		bottom: -80px;
		left: -50px;
	}
</style>
