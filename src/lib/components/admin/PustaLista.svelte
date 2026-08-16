<script lang="ts">
	// The empty state of a collection list (04.1-UI-SPEC Component Contract 4, „Empty
	// state (required, both lists)").
	//
	// REQUIRED, not decorative. An editor who opens a list and sees a bare card cannot
	// tell „there is nothing here yet" apart from „the panel is broken", and for the
	// person this panel is written for the second reading is the likely one. So the panel
	// says which it is, and repeats the primary action inside itself so the next step is
	// where the eye already is.
	//
	// The icon is decorative and hidden from assistive technology: the heading beside it
	// already says everything it means, and an announced icon would say it twice.
	//
	// This file carries NO visible string. The heading, the body and the action label all
	// arrive from a page that read them out of src/lib/content/panel.ts.
	import type { Snippet } from 'svelte';
	import FileText from '@lucide/svelte/icons/file-text';

	let {
		naglowek,
		tresc,
		children
	}: {
		naglowek: string;
		tresc: string;
		/** The primary action, repeated inside the panel. A snippet rather than a label
		 *  plus a destination, so the page decides what the control IS and this component
		 *  only decides where it sits. */
		children: Snippet;
	} = $props();
</script>

<div class="pusta">
	<FileText size={32} aria-hidden="true" focusable="false" />
	<!-- An h2: the screen's h1 is its title, and the heading order is never skipped. -->
	<h2 class="naglowek">{naglowek}</h2>
	<p class="tresc">{tresc}</p>
	<div class="akcja">{@render children()}</div>
</div>

<style>
	/* Centred on the warm background, radius-md, 24px padding: the panel density step for
	   a standing panel. The warm surface is what separates it from the white cards a
	   populated list would show, so „empty" reads differently at a glance. */
	.pusta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		box-sizing: border-box;
		padding: 24px;
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
		text-align: center;
		color: var(--color-muted);
	}

	/* Baloo 700 20px ink, the section heading step. */
	.naglowek {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	/* Nunito 400 16px muted, 7.3:1 on the warm background. */
	.tresc {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.akcja {
		display: flex;
		justify-content: center;
	}
</style>
