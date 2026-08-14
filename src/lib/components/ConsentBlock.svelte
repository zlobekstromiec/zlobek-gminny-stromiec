<script lang="ts">
	// RODO consent row plus the klauzula informacyjna disclosure, shared by both
	// forms (04-UI-SPEC.md Amendment v1.4, Component Contracts 3 and 4;
	// RECRUIT-04, CONTACT-03, D-03).
	//
	// Colour hard rules (01-UI-SPEC §Color):
	//  • the box boundary is `border-strong` #64748B (4.76:1 on white); the ticked
	//    state fills with `brand-blue` #0369A1 and its glyph is white (5.93:1).
	//  • invalid switches the border to `danger` #B91C1C (6.47:1) and adds the same
	//    icon-plus-instruction message FormField uses.
	//  • `accent` (amber) is deliberately NOT used: a consent checkbox is not a call
	//    to action, and the accent tier is reserved (UI-SPEC §Color).
	// Focus ring: the global 3px :focus-visible ring in app.css is never removed. The
	// rule below RE-STATES it on the real input, because the custom box needs
	// `appearance: none` and a duplicated ring guarantees the indicator survives any
	// user-agent quirk. No rule in this file suppresses the outline: the suppressing
	// value is grep-banned here, so it is described rather than written, which keeps
	// the acceptance gate usable for future reviewers.
	//
	// Two hard rules:
	//  1. The checkbox ships UNTICKED and nothing anywhere pre-ticks it: `zaznaczone`
	//     defaults to false, no `checked` attribute is emitted, and no value is read
	//     from or written to storage, a cookie or the URL. There is no remembered
	//     consent in this project (RODO requires an affirmative act each time), and
	//     the server re-checks `zgoda === true` regardless.
	//  2. The klauzula uses the NATIVE details element. It is keyboard operable and
	//     screen-reader correct for free; a script-driven replacement would not be,
	//     and would break with JavaScript disabled.
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { KLAUZULA } from '$lib/content/forms';

	let {
		id,
		tekst,
		etykietaKlauzuli,
		blad,
		zaznaczone = $bindable(false),
		wylaczone = false
	}: {
		id: string;
		tekst: string;
		etykietaKlauzuli: string;
		blad?: string;
		zaznaczone?: boolean;
		wylaczone?: boolean;
	} = $props();

	// `$derived`, not a plain const: `id` is a prop, and a plain template literal
	// would freeze the value from the first render.
	const idBledu = $derived(`${id}-err`);

	const opisy = $derived(blad ? idBledu : undefined);
	const nieprawidlowe = $derived(blad ? ('true' as const) : undefined);
</script>

<div class="zgoda">
	<!-- The whole row is inside the <label>, so the consent text itself is the hit
	     target: 44px minimum, aligned to the start so long text wraps under itself
	     rather than beside the box. -->
	<label class="wiersz" for={id}>
		<input
			{id}
			class="pudelko"
			type="checkbox"
			bind:checked={zaznaczone}
			required
			aria-required="true"
			aria-invalid={nieprawidlowe}
			aria-describedby={opisy}
			disabled={wylaczone}
		/>
		<span class="tekst">
			{tekst}<span aria-hidden="true"> *</span><span class="visually-hidden"> (pole wymagane)</span>
		</span>
	</label>

	{#if blad}
		<p id={idBledu} class="blad">
			<CircleAlert class="blad-ikona" size={18} aria-hidden="true" focusable="false" />
			<span>{blad}</span>
		</p>
	{/if}

	<details class="klauzula">
		<summary>
			<ChevronDown class="chevron" size={18} aria-hidden="true" focusable="false" />
			<span>{etykietaKlauzuli}</span>
		</summary>
		<div class="panel">
			{#each KLAUZULA as blok (blok.naglowek ?? blok.akapity[0])}
				{#if blok.naglowek}
					<h3>{blok.naglowek}</h3>
				{/if}
				{#each blok.akapity as akapit (akapit)}
					<p>{akapit}</p>
				{/each}
			{/each}
		</div>
	</details>
</div>

<style>
	.zgoda {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.wiersz {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		min-height: 44px;
		padding: 8px 0;
		cursor: pointer;
	}

	.tekst {
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* 24x24 custom box on the REAL input. `appearance: none` is what allows the
	   radius and the 2px token border; the focus ring is re-declared below so
	   suppressing the native appearance can never cost the indicator. */
	.pudelko {
		appearance: none;
		flex: none;
		box-sizing: border-box;
		width: 24px;
		height: 24px;
		/* No user-agent margin: the row's 12px gap owns the spacing, and flex-start
		   aligns the 24px box with the first line of 15px/1.5 text. */
		margin: 0;
		position: relative;
		border: 2px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		cursor: pointer;
		transition:
			background-color 150ms ease,
			border-color 150ms ease;
	}

	.wiersz:hover .pudelko {
		border-color: var(--color-ink);
	}

	.pudelko:checked {
		background: var(--color-brand-blue);
		border-color: var(--color-brand-blue);
	}

	/* White checkmark glyph, drawn in CSS so the ticked state carries a SHAPE and
	   not only a fill colour (WCAG 1.4.1). No data URI, no icon font. */
	.pudelko:checked::after {
		content: '';
		position: absolute;
		left: 5px;
		top: 2px;
		width: 8px;
		height: 12px;
		border: solid #ffffff;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	.pudelko[aria-invalid='true'] {
		border-color: var(--color-danger);
	}

	.pudelko:disabled {
		border-color: var(--color-border-subtle);
		background: var(--color-surface-warm);
		cursor: not-allowed;
	}

	/* Explicit restatement of the global app.css ring, mandatory here because the
	   native appearance is suppressed. This ADDS an indicator; it never removes one. */
	.pudelko:focus-visible {
		outline: 3px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

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

	/* Klauzula disclosure sits 16px below the consent row (UI-SPEC Contract 4): the
	   row's own 8px bottom padding plus this container's 8px gap, so no extra margin
	   is declared and the spacing stays on the 4px grid. */
	.klauzula {
		margin-top: 0;
	}

	.klauzula summary {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-brand-blue);
		text-decoration: underline;
		cursor: pointer;
		/* Native marker removed and replaced by the chevron below. */
		list-style: none;
	}

	.klauzula summary::-webkit-details-marker {
		display: none;
	}

	.klauzula summary:hover {
		color: var(--color-brand-blue-hover);
	}

	.klauzula summary :global(.chevron) {
		flex: none;
		transition: transform 150ms ease;
	}

	.klauzula[open] summary :global(.chevron) {
		transform: rotate(180deg);
	}

	.panel {
		margin-top: 8px;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
	}

	@media (min-width: 768px) {
		.panel {
			padding: 24px;
		}
	}

	.panel h3 {
		margin: 16px 0 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.panel h3:first-child {
		margin-top: 0;
	}

	.panel p {
		margin: 12px 0 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* Component-scoped reduced-motion guard for the chevron rotation and the box
	   fill transition, in addition to the global base-layer neutraliser (WCAG 2.3.3,
	   UI-SPEC §Motion). */
	@media (prefers-reduced-motion: reduce) {
		.pudelko,
		.klauzula summary :global(.chevron) {
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
