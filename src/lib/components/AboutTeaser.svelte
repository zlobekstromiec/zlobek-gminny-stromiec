<script lang="ts">
	// O-nas teaser (HOME-01, UI-SPEC v1.2 §6): carries the FULL verbatim core
	// message as a styled blockquote (the hero leads with its sentence 2). The
	// message constant lives in site.ts and is final client copy: not one
	// character may change (D-02).
	//
	// THE MEDIA SLOT IS NOW A REAL PHOTOGRAPH (2026-08-18), which retires the empty
	// gradient square and its „Phase 6, consented photography only" marker. It shows the
	// żłobek from the lawn, with the playground beside it, and no child appears in it, so
	// no wizerunek consent is owed. Being content and not decoration, it carries a Polish
	// alt and drops the aria-hidden the empty slot needed.
	//
	// Imported from $lib/assets/foto for the same reason the hero photograph is: uploads/
	// belongs to the editorial panel and the gallery globs it, so a page-level photograph
	// placed there would surface in an editor's picker as a gallery tile.
	import Cta from './Cta.svelte';
	import { coreMessage } from '$lib/content/site';
	import budynekOgrod from '$lib/assets/foto/budynek-plac-zabaw.jpg?enhanced';
</script>

<section class="about" aria-labelledby="o-nas-heading">
	<div class="inner">
		<!-- THE WRAPPER IS LOAD-BEARING, not tidiness. enhanced:img renders a <picture>, and
		     a class written on it lands on the <img> INSIDE that picture, not on the picture
		     itself. The picture is what this grid places, so `order` written against the
		     image class would silently stop applying and the mobile layout would go
		     image-first, quietly reversing the copy-first rule below. A plain div is the
		     grid item, the picture fills it, and the ordering rules keep meaning what they
		     say. Same shape as `.kafelek` in Lightbox.svelte, for the same reason. -->
		<div class="about-media">
			<enhanced:img
				src={budynekOgrod}
				alt="Budynek żłobka od strony trawnika, obok ogrodzony plac zabaw z niebieską nawierzchnią"
				sizes="(min-width:1024px) 30rem, 100vw"
				loading="lazy"
				decoding="async"
			/>
		</div>

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

	/* Copy-first below 1024px (media moves after).

	   4:3 RATHER THAN THE SQUARE THE EMPTY SLOT USED. A square was free to choose while
	   the box held a gradient; now it holds a 16:9 photograph, and `cover` in a 1:1 box
	   would throw away a third of the frame from each end, which on this picture is the
	   playground on one side and the lawn on the other. 4:3 keeps both, and the block
	   still reads as a portrait-ish panel beside the quotation rather than a wide strip.

	   No `height` rule: enhanced-img emits intrinsic width and height attributes, and a
	   `height: auto` here would beat the aspect-ratio box and let the native 16:9 out. */
	.about-media {
		width: 100%;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-radius: var(--radius-lg);
		order: 2;
	}

	/* :global, because the element being sized is rendered by enhanced-img and a scoped
	   selector cannot reach it. Filling the clipped box is what performs the crop. */
	.about-media :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
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
