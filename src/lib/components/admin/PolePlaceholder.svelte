<script lang="ts">
	// The „Treść zastępcza (do potwierdzenia)" checkbox (04.1-UI-SPEC Component Contract 5,
	// last control of the last group on every screen that has one).
	//
	// IT REUSES THE CONSENT CHECKBOX VISUAL AND NONE OF ITS SEMANTICS. `ConsentBlock`
	// carries three properties this control must NOT inherit: `required`, the „(pole
	// wymagane)" suffix, and the klauzula informacyjna disclosure. A RODO consent needs an
	// affirmative act and is compared by strict identity against boolean true on the
	// server; „this content is a placeholder waiting for somebody to confirm it" is a staff
	// bookkeeping flag on their own content and carries no such requirement. Copying the
	// component instead of its visual would have carried the semantics along with it.
	//
	// The unticked checkbox omits its key entirely from the submission, which is the HTML
	// convention the server reader already follows: absent is false and never an error.
	//
	// This file carries NO visible string. The label and the hint arrive from a page or a
	// component that read them out of src/lib/content/panel.ts.

	let {
		id,
		nazwa,
		etykieta,
		podpowiedz,
		zaznaczone = false
	}: {
		id: string;
		nazwa: string;
		etykieta: string;
		podpowiedz?: string;
		zaznaczone?: boolean;
	} = $props();

	const idPodpowiedzi = $derived(`${id}-hint`);
	const opisy = $derived(podpowiedz ? idPodpowiedzi : undefined);
</script>

<div class="zastepcza">
	<!-- The whole row is inside the label, so the text itself is the hit target: 44px
	     minimum, aligned to the start so long text wraps under itself rather than beside
	     the box. -->
	<label class="wiersz" for={id}>
		<input
			{id}
			name={nazwa}
			class="pudelko"
			type="checkbox"
			checked={zaznaczone}
			aria-describedby={opisy}
		/>
		<span class="tekst">{etykieta}</span>
	</label>

	{#if podpowiedz}
		<p id={idPodpowiedzi} class="podpowiedz">{podpowiedz}</p>
	{/if}
</div>

<style>
	.zastepcza {
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

	.podpowiedz {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* 24 by 24 custom box on the REAL input. `appearance: none` keeps the native element,
	   its focus behaviour and its keyboard semantics and only repaints it; the focus ring
	   is re-declared below because suppressing the native appearance must never cost the
	   indicator. */
	.pudelko {
		appearance: none;
		flex: none;
		box-sizing: border-box;
		width: 24px;
		height: 24px;
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

	/* White checkmark drawn in CSS, so the ticked state carries a SHAPE and not only a fill
	   colour (WCAG 1.4.1). No data URI, no icon font. The white is written as the surface
	   token, whose value in app.css is that same white, so the panel's no-raw-hex gate
	   stays literal-clean. */
	.pudelko:checked::after {
		content: '';
		position: absolute;
		left: 5px;
		top: 2px;
		width: 8px;
		height: 12px;
		border: solid var(--color-surface);
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	/* Explicit restatement of the global app.css ring, mandatory here because the native
	   appearance is suppressed. This ADDS an indicator; it never removes one. */
	.pudelko:focus-visible {
		outline: 3px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.pudelko {
			transition: none;
		}
	}
</style>
