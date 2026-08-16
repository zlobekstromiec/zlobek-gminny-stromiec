<script lang="ts">
	// „Jak formatować tekst": the limited formatting affordance of a narrative field
	// (04.1-UI-SPEC Component Contract 6; 02 D-05 and D-08).
	//
	// NO FORMATTING BUTTON ROW, NO DIRECTLY EDITABLE RICH REGION, NO RICH-TEXT LIBRARY, NO
	// PREVIEW. Three reasons, in order of weight: the panel must degrade with JavaScript
	// switched off (D-17), and a row of formatting buttons without scripting is a row of
	// dead controls; such a row is an interactive component with an accessibility bar of
	// its own and no budget to clear it; and the stored value has to stay inside the
	// constrained markdown subset the Phase 2 and 3 renderers already sanitize, which a
	// rich editor would quietly outgrow. A plain textarea plus this disclosure is the whole
	// affordance, on purpose.
	//
	// The four banned technologies are described rather than named, because the acceptance
	// gate for this directory is a literal grep for their names and a comment listing them
	// would make it permanently red. Same wording problem, same solution, as 04-02,
	// 04.1-02 and 04.1-03.
	//
	// NATIVE DISCLOSURE. The details element is keyboard operable and screen-reader correct
	// for free, and it opens with no script at all. A scripted replacement would be neither
	// on a page where nothing runs.
	//
	// The syntax examples render inside code elements so they can be selected and copied
	// exactly, which is why the copy module stores each line as a list of runs rather than
	// as one sentence.
	//
	// This file carries NO string of its own: every word comes from KOPIA_FORMATOWANIE in
	// src/lib/content/panel.ts, which is where the Polish-only sweep governs it.
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { KOPIA_FORMATOWANIE } from '$lib/content/panel';
</script>

<details class="pomoc">
	<summary>
		<ChevronDown class="chevron" size={18} aria-hidden="true" focusable="false" />
		<span>{KOPIA_FORMATOWANIE.podsumowanie}</span>
	</summary>
	<div class="panel">
		{#each KOPIA_FORMATOWANIE.linie as linia, i (i)}
			<p>
				{#each linia as run, j (j)}
					{#if typeof run === 'string'}{run}{:else}<code>{run.kod}</code>{/if}
				{/each}
			</p>
		{/each}
	</div>
</details>

<style>
	/* 8px below the textarea it explains, per Contract 6. The gap belongs to the field
	   block, so nothing is declared above. */
	.pomoc {
		margin: 0;
	}

	/* The inherited summary contract: Nunito 700 14px brand-blue, underlined, 44px target,
	   native marker removed and replaced by the chevron. */
	.pomoc summary {
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
		list-style: none;
	}

	.pomoc summary::-webkit-details-marker {
		display: none;
	}

	.pomoc summary:hover {
		color: var(--color-brand-blue-hover);
	}

	.pomoc summary :global(.chevron) {
		flex: none;
		transition: transform 150ms ease;
	}

	.pomoc[open] summary :global(.chevron) {
		transform: rotate(180deg);
	}

	.panel {
		margin-top: 8px;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
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

	.panel p:first-child {
		margin-top: 0;
	}

	/* The example at the same size as the prose around it, so nothing shrinks below the
	   inherited floor, on the white surface so it reads as a quoted literal rather than as
	   more prose. */
	.panel code {
		/* Horizontal padding only: a vertical one would push the run off the 4px grid or
		   off the line box, and the surface change is already enough separation. */
		padding: 0 4px;
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		color: var(--color-ink);
	}

	/* Component-scoped reduced-motion guard for the chevron rotation, in addition to the
	   global base-layer neutraliser in app.css (WCAG 2.3.3). */
	@media (prefers-reduced-motion: reduce) {
		.pomoc summary :global(.chevron) {
			transition: none;
		}
	}
</style>
