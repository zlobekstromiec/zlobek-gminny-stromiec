<script lang="ts">
	// Shared field block: the accessibility contract for EVERY input on this site
	// (04-UI-SPEC.md Amendment v1.4, Component Contract 2 and Accessibility
	// Contract; RECRUIT-04, CONTACT-03).
	//
	// Colour hard rules (01-UI-SPEC §Color, ratios measured in 04-UI-SPEC):
	//  • the control boundary is `border-strong` #64748B, 4.76:1 on white, which is
	//    the AA floor for a UI component (>=3:1) with margin to spare.
	//  • the invalid state uses `danger` #B91C1C, 6.47:1 on white, for BOTH the
	//    border and the message text. Red is semantic only, never decorative.
	//  • the value text is `ink` (14.65:1) and the hint is `muted` (7.58:1).
	// Focus ring is inherited from the global :focus-visible base (3px focus-ring,
	// 2px offset) in app.css and is never restyled or removed here.
	//
	// Three rules in this component are non-negotiable, each for a specific reason:
	//  1. NO `placeholder` attribute, ever. A placeholder disappears the moment the
	//     parent types, fails contrast, and is not a label (UI-SPEC v1.4 hard rule
	//     3). Guidance lives in the persistent hint paragraph instead.
	//  2. `aria-describedby` lists ONLY ids that actually exist. A dangling id makes
	//     a screen reader announce NOTHING at all, so a half-wired description is
	//     worse than none.
	//  3. The error carries an icon AND an instruction, not just a colour
	//     (WCAG 1.4.1), and says what to DO (WCAG 3.3.3).
	//
	// The control renders at 16px minimum: below that, iOS Safari zooms the viewport
	// on focus, which is a mobile usability defect on a mobile-first site.
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import type { HTMLInputAttributes } from 'svelte/elements';

	/** Only the types the two forms actually use. Narrow on purpose: a `type` this
	 *  component has not styled and reasoned about should not be reachable. */
	type Typ = 'text' | 'email' | 'tel';

	let {
		id,
		etykieta,
		typ = 'text',
		wymagane = false,
		blad,
		wartosc = $bindable(''),
		podpowiedz,
		autocomplete,
		wieloliniowy = false,
		wylaczone = false
	}: {
		id: string;
		etykieta: string;
		typ?: Typ;
		wymagane?: boolean;
		blad?: string;
		wartosc?: string;
		podpowiedz?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		wieloliniowy?: boolean;
		wylaczone?: boolean;
	} = $props();

	// `$derived`, not a plain const: `id` is a prop, and a plain template literal
	// would freeze the value from the first render.
	const idPodpowiedzi = $derived(`${id}-hint`);
	const idBledu = $derived(`${id}-err`);

	/** Only existing ids, joined; `undefined` when there is nothing to describe.
	 *  An empty string here would still emit the attribute, which is the dangling
	 *  reference this derivation exists to prevent. */
	const opisy = $derived(
		[podpowiedz ? idPodpowiedzi : null, blad ? idBledu : null].filter(Boolean).join(' ') ||
			undefined
	);

	/** Set only while the field is actually invalid, cleared on correction
	 *  (Accessibility Contract). Never a permanent "false" on a healthy field. */
	const nieprawidlowe = $derived(blad ? ('true' as const) : undefined);

	// `value` + `oninput` rather than `bind:value`: Svelte forbids two-way binding on
	// an input whose `type` attribute is dynamic, and the shared type prop is the
	// whole point of this primitive. The write-back is identical.
	function przepisz(event: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement }) {
		wartosc = event.currentTarget.value;
	}
</script>

<div class="pole">
	<label class="etykieta" for={id}>
		{etykieta}{#if wymagane}<span aria-hidden="true"> *</span><span class="visually-hidden">
				(pole wymagane)</span
			>{/if}
	</label>

	{#if podpowiedz}
		<p id={idPodpowiedzi} class="podpowiedz">{podpowiedz}</p>
	{/if}

	{#if wieloliniowy}
		<textarea
			{id}
			class="kontrolka"
			value={wartosc}
			oninput={przepisz}
			required={wymagane}
			aria-required={wymagane}
			aria-invalid={nieprawidlowe}
			aria-describedby={opisy}
			{autocomplete}
			disabled={wylaczone}></textarea>
	{:else}
		<input
			{id}
			class="kontrolka"
			type={typ}
			value={wartosc}
			oninput={przepisz}
			required={wymagane}
			aria-required={wymagane}
			aria-invalid={nieprawidlowe}
			aria-describedby={opisy}
			{autocomplete}
			disabled={wylaczone}
		/>
	{/if}

	{#if blad}
		<p id={idBledu} class="blad">
			<CircleAlert class="blad-ikona" size={18} aria-hidden="true" focusable="false" />
			<span>{blad}</span>
		</p>
	{/if}
</div>

<style>
	/* Vertical stack, 8px internal gaps (UI-SPEC Spacing `xs`). The 24px gap
	   BETWEEN field blocks belongs to the form, not to the field. */
	.pole {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.etykieta {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.podpowiedz {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* Control box: >=48px tall (exceeds the 44px WCAG floor deliberately, forms are
	   this phase's primary interaction), 12x16 padding, radius-sm, white fill, 2px
	   strong border, ink 16px/1.5, full width. */
	.kontrolka {
		box-sizing: border-box;
		width: 100%;
		min-height: 48px;
		padding: 12px 16px;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
		transition: border-color 150ms ease;
	}

	.kontrolka:hover {
		border-color: var(--color-ink);
		cursor: text;
	}

	/* Invalid: driven by the ARIA state itself, so the visual and the announced
	   state can never disagree. */
	.kontrolka[aria-invalid='true'] {
		border-color: var(--color-danger);
	}

	/* Disabled while the submit is in flight (UI-SPEC Contract 2 state table). */
	.kontrolka:disabled {
		border-color: var(--color-border-subtle);
		background: var(--color-surface-warm);
		cursor: not-allowed;
	}

	/* Textarea variant. No live character counter on purpose: it adds an aria-live
	   chatter surface for no benefit at this volume, so the 2000-character cap is
	   stated in the hint instead. Horizontal resize is disabled so the parent cannot
	   drag the control out of the card. */
	textarea.kontrolka {
		min-height: 160px;
		resize: vertical;
	}

	/* Icon + text, never colour alone (WCAG 1.4.1). flex-start so a wrapping
	   message aligns under itself rather than under the icon. */
	.blad {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-danger);
	}

	.blad :global(.blad-ikona) {
		flex: none;
		/* Optical alignment with the first line of 15px/1.5 text. */
		margin-top: 2px;
	}

	/* The only transition this component introduces, neutralised explicitly in
	   addition to the global base-layer rule in app.css (WCAG 2.3.3). */
	@media (prefers-reduced-motion: reduce) {
		.kontrolka {
			transition: none;
		}
	}

	/* Local utility, copied per component as every other component in this repo
	   does (there is no global utility layer for it). */
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
