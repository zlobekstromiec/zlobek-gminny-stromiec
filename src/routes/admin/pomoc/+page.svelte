<script lang="ts">
	// Pomoc: the instrukcja, one click from every panel screen (04.1-10 P-27).
	//
	// THIS SCREEN INVENTS NO COPY. Every sentence below the heading is the document in
	// docs/instrukcja-cms.md, rendered. The only words this file adds are the back link
	// and the label of the link that hands a staff member their own copy, and both come
	// from src/lib/content/panel.ts like every other string in the panel.
	//
	// THE h1 IS THE DOCUMENT'S OWN TITLE, and the renderer starts at h2, so the screen has
	// exactly one h1 and the structure under it never skips a level (UI-SPEC Accessibility
	// Contract). The heading order is a property of the document plus the renderer rather
	// than of this file, which is why tests/instrukcja.unit.ts pins it on the document.
	//
	// The rendered markup is inserted as HTML because it IS markup: headings, lists and
	// emphasis are the structure a nervous reader navigates by. It is sanitized by the
	// hardened renderer in $lib/markdown (raw HTML escaped, images collapsed to text,
	// hrefs allow-listed), and its source is a file committed to this repository rather
	// than anything typed into a form.
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import { KOPIA_LISTY, KOPIA_POMOC } from '$lib/content/panel';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PowrotLink cel="/admin" etykieta={KOPIA_LISTY.powrotPulpit} />

<h1 class="naglowek">{data.tytul}</h1>

<p class="pobranie">
	<a href="/admin/pomoc/instrukcja">{KOPIA_POMOC.plikLink}</a>
</p>

<div class="karta">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- P-27: renderInstrukcja sanitizes (raw HTML escaped, link protocols filtered, images to alt, tables dropped) and its source is a document committed to this repository, not editor input; CSP script-src 'self' is the second layer -->
	<div class="proza">{@html data.tresc}</div>
</div>

<style>
	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale, exactly
	   as every other panel screen does. */
	.naglowek {
		margin: 16px 0 0;
		max-width: 65ch;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.pobranie {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
	}

	/* Underlined as well as blue: a link is never signalled by colour alone. */
	.pobranie a,
	.proza :global(a) {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.pobranie a:hover,
	.proza :global(a:hover) {
		color: var(--color-brand-blue-hover);
	}

	/* Two surfaces, everywhere, always (UI-SPEC Color): the document sits on a white card
	   on the warm app background, exactly like every list and every field group. */
	.karta {
		box-sizing: border-box;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	@media (min-width: 768px) {
		.karta {
			padding: 24px;
		}
	}

	/* 65 characters is the reading measure the UI-SPEC caps running help prose at, and it
	   is the single biggest thing that makes a long document readable rather than
	   daunting. It is set on the PROSE rather than on the card, so a future table or
	   figure could still use the full width. */
	.proza {
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* Section headings: 20px Baloo, the inherited card-title sub-step, with generous space
	   above so the twelve sections read as twelve sections rather than as one wall. */
	.proza :global(h2) {
		margin: 32px 0 8px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.proza :global(h3),
	.proza :global(h4) {
		margin: 24px 0 8px;
		font-family: var(--font-body);
		font-size: 17px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
	}

	.proza :global(p) {
		margin: 0 0 16px;
	}

	.proza :global(ul),
	.proza :global(ol) {
		margin: 0 0 16px;
		padding-left: 24px;
	}

	.proza :global(li) {
		margin-bottom: 8px;
	}

	.proza :global(li:last-child) {
		margin-bottom: 0;
	}

	/* The document's horizontal rules separate its sections. Rendered as the same subtle
	   1px line every card border in the panel uses, never as a heavier divider. */
	.proza :global(hr) {
		height: 0;
		margin: 32px 0;
		border: 0;
		border-top: 1px solid var(--color-border-subtle);
	}

	/* Inline examples (a field value, an address, a variable name) stay legible at the
	   surrounding size on the warm surface, so an editor can read and copy them. */
	.proza :global(code) {
		padding: 0 4px;
		border-radius: var(--radius-sm);
		background: var(--color-surface-warm);
		font-size: 15px;
	}

	.proza :global(strong) {
		font-weight: 700;
	}
</style>
