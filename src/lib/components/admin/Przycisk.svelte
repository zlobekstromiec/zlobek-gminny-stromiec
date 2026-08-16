<script lang="ts">
	// The panel's button primitive (04.1 P-09; 04.1-UI-SPEC Component Contracts 9, 11
	// and 12). It exists because `src/lib/components/Cta.svelte` renders an ANCHOR, so
	// it cannot be „Zapisz", „Wyślij kod", „Zaloguj się" or „Wyloguj": those perform an
	// action and must be a real <button> inside a form. A link that acts is a link a
	// browser may prefetch, and a prefetched „Wyloguj" logs an editor out unexpectedly.
	//
	// This component introduces NO new colour value. `primary` and `secondary`
	// reproduce the Cta treatments exactly, including the 0 3px 0 hard shadow that
	// belongs to the primary variant alone, and `danger` is the flat variant of
	// Component Contract 11: danger fill, white label (6.47:1), no hard shadow and no
	// hover raise, because deleting content should not feel springy.
	//
	// Where the UI-SPEC writes a literal white, this file uses `--color-surface`,
	// whose value in app.css IS that same white. The rendered colour is identical to
	// the one Cta.svelte writes as a raw hex; drawing it from the token instead keeps
	// the panel's „no raw hex under src/lib/components/admin/" gate literal-clean and
	// states the intent. The hex itself is deliberately NOT written in this comment,
	// for the same reason kod.ts describes its banned random helper rather than naming
	// it: the acceptance gate for this file is a literal grep.
	//
	// This file carries NO visible string. Every label arrives as a child snippet from
	// a page that read it out of src/lib/content/panel.ts, so the copy sweep governs
	// every word this button ever renders.
	import type { Snippet } from 'svelte';

	type Wariant = 'primary' | 'secondary' | 'danger';
	type TypPrzycisku = 'submit' | 'button';

	let {
		wariant = 'primary',
		typ = 'submit',
		formaction,
		nazwa,
		wartosc,
		zajete = false,
		pelnaSzerokosc = false,
		onNacisnij,
		children
	}: {
		wariant?: Wariant;
		typ?: TypPrzycisku;
		/** Overrides the form's own action, which is how the repeatable groups of
		 *  UI-SPEC Contract 7 add and remove a row without a second form. */
		formaction?: string;
		/** `name` and `value` of the submit button, so an action can tell WHICH button
		 *  was pressed and which row it belonged to. */
		nazwa?: string;
		wartosc?: string;
		/** The saving state of Contract 9: disabled plus aria-busy, never a spinner. */
		zajete?: boolean;
		pelnaSzerokosc?: boolean;
		/** Added by 04.1-07 for the photo island's two buttons, which are the first controls
		 *  in the panel that act on the page instead of submitting it. Absent everywhere
		 *  else, so every existing call site renders byte-identically to before, and it is
		 *  only ever meaningful together with the non-submitting button type. */
		onNacisnij?: (event: MouseEvent) => void;
		children: Snippet;
	} = $props();
</script>

<button
	class="przycisk {wariant}"
	class:pelna={pelnaSzerokosc}
	type={typ}
	{formaction}
	name={nazwa}
	value={wartosc}
	disabled={zajete}
	aria-busy={zajete ? 'true' : undefined}
	onclick={onNacisnij}
>
	{@render children()}
</button>

<style>
	/* Geometry is the inherited Cta geometry, value for value: pill radius, 44px
	   minimum target, 12x24 padding, Nunito 700 16px at 1.4. */
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

	/* Full width below the small breakpoint, auto above, per Contracts 2 and 9. */
	.pelna {
		width: 100%;
	}

	@media (min-width: 640px) {
		.pelna {
			width: auto;
		}
	}

	/* Primary: amber fill, ink label (6.82:1), the 3D toy shadow. The ONE place the
	   panel keeps the site's springiness, exactly as Contract 9 asks. */
	.przycisk.primary {
		background: var(--color-accent);
		color: var(--color-ink);
		border: 2px solid transparent;
		box-shadow: 0 3px 0 var(--color-accent-active);
	}

	.przycisk.primary:hover:not(:disabled) {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 5px 0 var(--color-accent-active);
	}

	/* Pressed and focus-visible share the darkest amber, where the label flips to
	   WHITE to keep AA (5.02:1). White on the default or hover fill is 2.15:1 and is
	   banned everywhere in this codebase. */
	.przycisk.primary:active,
	.przycisk.primary:focus-visible {
		background: var(--color-accent-active);
		color: var(--color-surface);
	}

	.przycisk.primary:active {
		transform: translateY(1px);
		box-shadow: 0 1px 0 var(--color-accent-active);
	}

	/* Secondary: blue outline, never amber. Used by „Wyloguj" and by every row action
	   that is genuinely an action rather than a link. */
	.przycisk.secondary {
		background: transparent;
		color: var(--color-brand-blue);
		border: 2px solid var(--color-brand-blue);
	}

	.przycisk.secondary:hover:not(:disabled) {
		background: var(--color-band);
	}

	/* Danger: flat on purpose. No hard shadow, no hover raise. Hover adds an inner
	   white ring rather than a darker fill, so no new colour value is introduced. */
	.przycisk.danger {
		background: var(--color-danger);
		color: var(--color-surface);
		border: 2px solid var(--color-danger);
	}

	.przycisk.danger:hover:not(:disabled) {
		box-shadow: inset 0 0 0 2px var(--color-surface);
	}

	/* Saving state (Contract 9). The label swap is the page's job; this is only the
	   affordance that the control is no longer pressable. */
	.przycisk:disabled {
		cursor: not-allowed;
		opacity: 0.7;
		transform: none;
	}

	/* Reduced motion: no transform raise (WCAG 2.3.3). Declared locally in addition
	   to the global base-layer rule in app.css, as every component here does. */
	@media (prefers-reduced-motion: reduce) {
		.przycisk,
		.przycisk:hover,
		.przycisk:active {
			transform: none;
			transition: none;
		}
	}
</style>
