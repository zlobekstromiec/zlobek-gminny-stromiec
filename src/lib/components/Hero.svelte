<script lang="ts">
	// Hero v2 (HOME-01, UI-SPEC v1.2 §6): status pill, two-tone hook headline and
	// a single-sentence emotional lead. The FULL verbatim core message lives in
	// AboutTeaser further down the same homepage (Amendment v1.1 decision); the
	// lead below quotes sentence 2 of it verbatim.
	//
	// THE IMAGE IS NOW THE REAL BUILDING (2026-08-18), which retires the D-03 placeholder
	// and the „decorative, aria-hidden until Phase 6" treatment that came with it. The
	// photograph shows the żłobek from the street with its own sign on the wall, and no
	// child appears in it, so the wizerunek consent obligation never arises. Being real
	// content and not decoration, it carries a real Polish alt and is NOT aria-hidden: a
	// screen-reader user is told what the building looks like, which is exactly the
	// information a sighted visitor gets from it.
	//
	// It is served through enhanced-img rather than the two hand-built files it replaces
	// in static/. That yields the AVIF/WebP srcset and the intrinsic width/height (no CLS)
	// the old markup wrote out by hand, and keeps `fetchpriority="high"` on the LCP element
	// (PITFALLS #9). It is imported from $lib/assets/foto, NOT from $lib/assets/uploads:
	// uploads is the panel's directory and the gallery globs it, so a hero photograph
	// living there would show up in an editor's photo picker as if it were a gallery tile.
	import Cta from './Cta.svelte';
	import IconSun from '$lib/icons/IconSun.svelte';
	import { recruitment } from '$lib/content/site';
	import budynek from '$lib/assets/foto/budynek-front.jpg?enhanced';
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
				<!-- „Napisz", not „Zadzwoń", since 2026-08-18: there is no phone on the site
				     to honour that invitation with (site.ts). -->
				<Cta href="/kontakt" variant="secondary">Napisz do nas</Cta>
			</div>

			<!-- The phone line that stood here is GONE with the number itself (site.ts).
			     Nothing replaces it: both buttons above already reach the contact page, and
			     a third line repeating that would be noise. -->
		</div>

		<div class="hero-media">
			<!-- The LCP element. fetchpriority high and eager, because enhanced-img would
			     otherwise leave loading to the browser's default on the one image whose
			     arrival the Largest Contentful Paint is measured by. `sizes` describes the
			     real layout: a full-width column below 1024px, and just under half the
			     72rem container above it. -->
			<enhanced:img
				class="hero-img"
				src={budynek}
				alt="Budynek Publicznego Żłobka w Stromcu od strony ulicy, z kolorowym szyldem i placem zabaw obok wejścia"
				sizes="(min-width:1024px) 33rem, 100vw"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
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

	/* No bottom margin any more: the phone line this row used to be separated from is
	   gone with the number (site.ts), so the buttons are the last thing in the column. */
	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}

	.hero-media {
		justify-self: center;
		width: 100%;
	}

	/* 3:2, WIDENED FROM 4:3 the day the real photograph arrived. The placeholder was
	   authored at 4:3; the żłobek's camera shoots 16:9, and `cover` in a 4:3 box throws
	   away a quarter of a 16:9 frame from the two ends, which on this particular picture
	   is the forest on one side and the bench on the other. 3:2 costs about 16% instead,
	   and keeps enough height that the box still reads as a portrait-friendly card rather
	   than a letterbox strip. The box is reserved before the image paints either way, so
	   this is a framing decision and not a CLS one.

	   `height: auto` is deliberately NOT set here: enhanced-img emits its own intrinsic
	   width and height attributes, and a rule saying `height: auto` would beat the
	   aspect-ratio box and let the natural 16:9 through. */
	.hero-img {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 2;
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
