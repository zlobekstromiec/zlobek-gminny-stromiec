<script lang="ts">
	// The back link that opens every editor screen (04.1-UI-SPEC Component Contract 5,
	// DOM position 1). Extracted rather than repeated, because it is the first focusable
	// thing on six screens and „first focusable thing" is a property that has to look and
	// behave the same everywhere or it stops being a landmark an editor can rely on.
	//
	// It is a real link to a real URL, so it works with JavaScript disabled, survives a
	// middle click and can be opened in a new tab. Nothing about „go back" here reads
	// browser history: `history.back()` would send an editor who arrived by typing the
	// URL somewhere unrelated, and it needs JavaScript to do it.
	//
	// UNDERLINED, not merely blue. Colour alone is never the signal in this project
	// (UI-SPEC hard rule 2), and a link that is only distinguishable by hue fails WCAG
	// 1.4.1 for anyone who cannot separate the two.
	//
	// This file carries NO visible string. The label arrives from a page that read it out
	// of src/lib/content/panel.ts, so the Polish-only sweep governs every word it renders.
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';

	let {
		cel,
		etykieta
	}: {
		/** Destination path, for example `/admin`. */
		cel: string;
		etykieta: string;
	} = $props();
</script>

<a class="powrot" href={cel}>
	<!-- Decorative: the label beside it already says where this goes, so an announced
	     icon would make a screen reader say the same thing twice. -->
	<ChevronLeft size={18} aria-hidden="true" focusable="false" />
	<span>{etykieta}</span>
</a>

<style>
	/* Inline-flex with a gap rather than a floated icon, so the chevron stays glued to
	   the first word when the label wraps on a narrow screen. */
	.powrot {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		/* 44px target height without 44px of visual weight: the padding is what a finger
		   hits, the text is what an eye sees. */
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.powrot:hover {
		color: var(--color-brand-blue-hover);
	}
</style>
