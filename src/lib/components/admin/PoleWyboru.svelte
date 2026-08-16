<script lang="ts">
	// A labelled select, following the inherited FormField contract (04.1-UI-SPEC
	// Component Contract 5; 04-UI-SPEC Amendment v1.4 Component Contract 2).
	//
	// It exists because FormField renders an input or a textarea and cannot render a
	// select, while everything AROUND the control has to stay identical: the same label
	// treatment, the same hint, the same error with its icon and its instruction, the same
	// `aria-describedby` discipline and the same 48px control box. Three rules are
	// reproduced here verbatim rather than reinvented, and none of them is negotiable:
	//
	//  1. NO `placeholder` attribute, ever. A select cannot carry one anyway, and the
	//     equivalent mistake is a first option that pretends to be a label. The empty
	//     first option is an explicit „Wybierz" and the real label sits above the control.
	//  2. `aria-describedby` lists ONLY ids that exist. A dangling id makes a screen
	//     reader announce NOTHING at all, so a half-wired description is worse than none.
	//  3. The error carries an icon AND an instruction, not just a colour (WCAG 1.4.1),
	//     and says what to DO (WCAG 3.3.3).
	//
	// The control renders at 16px minimum: below that, iOS Safari zooms the viewport on
	// focus, which is a mobile usability defect on a mobile-first site.
	//
	// This file carries NO visible string. The label, the hint, the error and every option
	// arrive from a page or a component that read them out of src/lib/content/panel.ts.
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	/** One option. Not exported: a caller builds a plain array and structural typing does
	 *  the rest, which keeps this component free of a named type other files would then
	 *  have to import from a `.svelte` file. */
	interface OpcjaWyboru {
		wartosc: string;
		etykieta: string;
	}

	let {
		id,
		etykieta,
		nazwa,
		opcje,
		etykietaPusta,
		wybrana = '',
		podpowiedz,
		blad,
		wymagane = false,
		wylaczone = false
	}: {
		id: string;
		etykieta: string;
		/** Rendered as the control's `name`, so a server-rendered form action reads the
		 *  value with no JavaScript involved. */
		nazwa: string;
		opcje: readonly OpcjaWyboru[];
		/** Label of the explicit empty first option, „Wybierz". Always present, so „nothing
		 *  chosen" is a state the editor can see and return to. */
		etykietaPusta: string;
		wybrana?: string;
		podpowiedz?: string;
		blad?: string;
		wymagane?: boolean;
		wylaczone?: boolean;
	} = $props();

	// `$derived`, not plain consts: `id` is a prop, and a plain template literal would
	// freeze the value from the first render.
	const idPodpowiedzi = $derived(`${id}-hint`);
	const idBledu = $derived(`${id}-err`);

	const opisy = $derived(
		[podpowiedz ? idPodpowiedzi : null, blad ? idBledu : null].filter(Boolean).join(' ') ||
			undefined
	);

	/** Set only while the field is actually invalid, cleared on correction. Never a
	 *  permanent „false" on a healthy field. */
	const nieprawidlowe = $derived(blad ? ('true' as const) : undefined);
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

	<!-- `selected` is set on the OPTION rather than `value` on the select, because this
	     control has to arrive already correct in server-rendered HTML: on a page with no
	     JavaScript nothing runs afterwards to fix it up. -->
	<select
		{id}
		name={nazwa}
		class="kontrolka"
		required={wymagane}
		aria-required={wymagane}
		aria-invalid={nieprawidlowe}
		aria-describedby={opisy}
		disabled={wylaczone}
	>
		<option value="" selected={wybrana === ''}>{etykietaPusta}</option>
		{#each opcje as opcja (opcja.wartosc)}
			<option value={opcja.wartosc} selected={wybrana === opcja.wartosc}>{opcja.etykieta}</option>
		{/each}
	</select>

	{#if blad}
		<p id={idBledu} class="blad">
			<CircleAlert class="blad-ikona" size={18} aria-hidden="true" focusable="false" />
			<span>{blad}</span>
		</p>
	{/if}
</div>

<style>
	/* Vertical stack, 8px internal gaps, exactly as FormField: the 24px gap BETWEEN field
	   blocks belongs to the form, never to the field. */
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

	/* The inherited control box: at least 48px tall, 12 by 16 padding, radius-sm, white
	   fill, 2px strong border (4.76:1 as a UI boundary), ink 16px at 1.5. The native
	   appearance is deliberately NOT suppressed: the arrow a browser draws is the
	   affordance that says „this opens a list", and replacing it costs more than it buys. */
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
		cursor: pointer;
	}

	/* Invalid: driven by the ARIA state itself, so the visual and the announced state can
	   never disagree. */
	.kontrolka[aria-invalid='true'] {
		border-color: var(--color-danger);
	}

	.kontrolka:disabled {
		border-color: var(--color-border-subtle);
		background: var(--color-surface-warm);
		cursor: not-allowed;
	}

	/* Icon plus text, never colour alone (WCAG 1.4.1). flex-start so a wrapping message
	   aligns under itself rather than under the icon. */
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
		margin-top: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.kontrolka {
			transition: none;
		}
	}

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
