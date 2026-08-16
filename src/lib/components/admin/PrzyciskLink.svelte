<script lang="ts">
	// A link wearing the panel's button treatment (04.1-UI-SPEC Component Contracts 4
	// and 11).
	//
	// WHY IT EXISTS, given that both `Przycisk.svelte` and `Cta.svelte` already look like
	// this. „Dodaj wpis" and „Anuluj" NAVIGATE: they go to another URL and commit
	// nothing, so they have to be anchors. `Przycisk.svelte` renders a real <button>,
	// which is correct for „Zapisz" and „Usuń wpis" and wrong here, because a button that
	// navigates loses middle click, open-in-new-tab and the browser's own link
	// affordances. `Cta.svelte` is the PUBLIC component: it is an anchor, but its only
	// icon is the arrow the site uses, and the panel's contract asks for a Lucide glyph
	// chosen per action. Passing the icon in as a child is what this component adds, and
	// it is the whole difference.
	//
	// The geometry and the three variants are the inherited ones, value for value, so a
	// link and a button standing side by side in the panel are indistinguishable to the
	// eye. NO new colour value is introduced: where the UI-SPEC writes a literal white,
	// this file uses `--color-surface`, whose value in app.css is that same white, for
	// the same reason Przycisk.svelte does.
	//
	// This file carries NO visible string. Every label arrives as a child snippet from a
	// page that read it out of src/lib/content/panel.ts.
	import type { Snippet } from 'svelte';

	type Wariant = 'primary' | 'secondary';

	let {
		cel,
		wariant = 'primary',
		pelnaSzerokosc = false,
		children
	}: {
		cel: string;
		wariant?: Wariant;
		pelnaSzerokosc?: boolean;
		children: Snippet;
	} = $props();
</script>

<a href={cel} class="przycisk {wariant}" class:pelna={pelnaSzerokosc}>
	{@render children()}
</a>

<style>
	.przycisk {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-sizing: border-box;
		min-height: 44px;
		padding: 12px 24px;
		border-radius: var(--radius-pill);
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 150ms ease,
			box-shadow 150ms ease,
			transform 150ms ease;
	}

	.pelna {
		width: 100%;
	}

	@media (min-width: 640px) {
		.pelna {
			width: auto;
		}
	}

	/* Primary: amber fill, ink label (6.82:1), the 3D toy shadow. Reserved by the UI-SPEC
	   accent list for exactly this, the one primary action of a screen. */
	.przycisk.primary {
		background: var(--color-accent);
		color: var(--color-ink);
		border: 2px solid transparent;
		box-shadow: 0 3px 0 var(--color-accent-active);
	}

	.przycisk.primary:hover {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 5px 0 var(--color-accent-active);
	}

	/* Pressed and focus-visible share the darkest amber, where the label flips to white
	   to keep AA (5.02:1). White on the default or hover fill is 2.15:1 and is banned
	   everywhere in this codebase. */
	.przycisk.primary:active,
	.przycisk.primary:focus-visible {
		background: var(--color-accent-active);
		color: var(--color-surface);
	}

	.przycisk.primary:active {
		transform: translateY(1px);
		box-shadow: 0 1px 0 var(--color-accent-active);
	}

	.przycisk.secondary {
		background: transparent;
		color: var(--color-brand-blue);
		border: 2px solid var(--color-brand-blue);
	}

	.przycisk.secondary:hover {
		background: var(--color-band);
	}

	@media (prefers-reduced-motion: reduce) {
		.przycisk,
		.przycisk:hover,
		.przycisk:active {
			transform: none;
			transition: none;
		}
	}
</style>
