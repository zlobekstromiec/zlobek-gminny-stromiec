<script lang="ts">
	// The one-time-code control (04.1-UI-SPEC Component Contract 2).
	//
	// ONE input, never six per-digit boxes. Six boxes need JavaScript to move focus,
	// break paste on every platform, and are a documented screen-reader hazard: the
	// contract rules them out and this component is the reason there is nowhere to
	// reintroduce them.
	//
	// It reproduces the three non-negotiable rules of FormField.svelte verbatim,
	// because they are the site-wide input contract and not that component's private
	// business:
	//  1. NO `placeholder` attribute, ever. Guidance lives in the persistent hint.
	//  2. `aria-describedby` lists ONLY ids that actually exist: a dangling id makes a
	//     screen reader announce NOTHING at all.
	//  3. The error carries an icon AND an instruction, not just a colour.
	//
	// It is a separate component rather than a FormField variant because its control
	// box genuinely differs: 19px at 0.3em letter spacing in a 12rem box, which is a
	// typographic decision the shared primitive should not have to carry.
	//
	// This file carries NO visible string. The label, the hint and the error all
	// arrive as props from a page that read them out of src/lib/content/panel.ts.
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	let {
		id = 'kod',
		nazwa = 'kod',
		etykieta,
		podpowiedz,
		blad,
		wartosc = '',
		autofokus = false
	}: {
		id?: string;
		nazwa?: string;
		etykieta: string;
		podpowiedz: string;
		blad?: string;
		wartosc?: string;
		/** Server-rendered focus, because the screen has to work with JavaScript off
		 *  and „focus the code input" is a contract line, not a nicety. */
		autofokus?: boolean;
	} = $props();

	const idPodpowiedzi = $derived(`${id}-hint`);
	const idBledu = $derived(`${id}-err`);

	/** Only existing ids, joined; `undefined` when there is nothing to describe. The
	 *  hint is always present here, so this can only ever gain the error id. */
	const opisy = $derived([idPodpowiedzi, blad ? idBledu : null].filter(Boolean).join(' '));

	/** Set only while the field is actually invalid, cleared on correction. */
	const nieprawidlowe = $derived(blad ? ('true' as const) : undefined);
</script>

<div class="pole">
	<label class="etykieta" for={id}>{etykieta}</label>

	<p id={idPodpowiedzi} class="podpowiedz">{podpowiedz}</p>

	<!-- svelte-ignore a11y_autofocus -->
	<input
		{id}
		name={nazwa}
		class="kontrolka"
		type="text"
		inputmode="numeric"
		autocomplete="one-time-code"
		pattern="[0-9]*"
		maxlength="6"
		required
		aria-required="true"
		aria-invalid={nieprawidlowe}
		aria-describedby={opisy}
		autofocus={autofokus}
		value={wartosc}
	/>

	{#if blad}
		<p id={idBledu} class="blad">
			<CircleAlert class="blad-ikona" size={18} aria-hidden="true" focusable="false" />
			<span>{blad}</span>
		</p>
	{/if}
</div>

<style>
	/* 8px internal gaps, exactly as FormField stacks its parts. */
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

	/* The inherited control box (48px, 12x16 padding, 2px border-strong, radius-sm)
	   with the Contract 2 code treatment on top: 19px at 700, 0.3em tracking, 12rem
	   wide. 19px is far above the 16px iOS zoom floor, which the code field needs
	   more than any other control on the site: it is typed on a phone, from an
	   e-mail, by somebody switching apps. */
	.kontrolka {
		box-sizing: border-box;
		width: 12rem;
		max-width: 100%;
		min-height: 48px;
		padding: 12px 16px;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-family: var(--font-body);
		font-size: 19px;
		font-weight: 700;
		line-height: 1.4;
		letter-spacing: 0.3em;
		color: var(--color-ink);
		transition: border-color 150ms ease;
	}

	.kontrolka:hover {
		border-color: var(--color-ink);
		cursor: text;
	}

	/* Driven by the ARIA state itself, so the visual and the announced state can
	   never disagree. */
	.kontrolka[aria-invalid='true'] {
		border-color: var(--color-danger);
	}

	/* Icon plus text, never colour alone (WCAG 1.4.1). */
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
</style>
