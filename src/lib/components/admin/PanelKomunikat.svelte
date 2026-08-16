<script lang="ts">
	// The panel's one feedback surface (04.1-UI-SPEC Component Contracts 2 and 10).
	// Every „Zapisano", every refusal, every neutral notice and the persistent
	// publish-delay line render through this component, so the four treatments cannot
	// drift apart across the eleven screens of this phase.
	//
	// Colour carries MEANING here and nothing else (UI-SPEC hard rules 1 and 2):
	//  • `blad` means „this did not happen": danger-surface with a 2px danger border.
	//  • `sukces` means „this happened": tint-green. Used by „Zapisano" and nowhere else.
	//  • `neutralny` is the band colour, for expected events such as an expired session
	//    or a completed logout. Colouring those as errors would teach editors to
	//    distrust a normal event, which is the defect v1.4 already fixed on the public
	//    status banner.
	//  • `info` is tint-blue, for the standing publish-delay promise (D-18).
	//
	// LIVE REGIONS: `blad` is the single role="alert" and `sukces` the single
	// role="status". `neutralny` and `info` carry NO live role at all, because they are
	// present on load rather than announced by an action, and a page that announces its
	// own furniture is a page that talks over itself. The Accessibility Contract allows
	// exactly one of each to be live at a time, which every consuming page keeps by
	// rendering at most one panel.
	//
	// FOCUS: the element is always focusable programmatically (tabindex="-1") and, when
	// `fokus` is set, it is focused on render. Both mechanisms are present on purpose:
	// the `autofocus` attribute is what works with JavaScript DISABLED, which is the
	// mode this whole phase must survive (D-17), and the effect is what works after a
	// client-side navigation, when no fresh document is parsed. Focusing twice is a
	// no-op; focusing never is a screen-reader user who learns nothing.
	//
	// This file carries NO visible string. The heading and the body arrive from a page
	// that read them out of src/lib/content/panel.ts.
	import type { Snippet } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Info from '@lucide/svelte/icons/info';

	type Rodzaj = 'sukces' | 'blad' | 'neutralny' | 'info';

	let {
		rodzaj,
		naglowek,
		fokus = false,
		children
	}: {
		rodzaj: Rodzaj;
		/** Optional: the neutral band panel and the info line are a single sentence and
		 *  deliberately have no heading, so nothing announces a heading that is not
		 *  there. */
		naglowek?: string;
		fokus?: boolean;
		children: Snippet;
	} = $props();

	let element: HTMLDivElement | undefined = $state();

	const rola = $derived(
		rodzaj === 'blad' ? ('alert' as const) : rodzaj === 'sukces' ? ('status' as const) : undefined
	);

	$effect(() => {
		if (fokus) element?.focus();
	});
</script>

<!-- svelte-ignore a11y_autofocus -->
<div
	bind:this={element}
	class="panel {rodzaj}"
	role={rola}
	tabindex="-1"
	autofocus={fokus}
	data-panel={rodzaj}
>
	{#if rodzaj === 'blad'}
		<CircleAlert class="panel-ikona" size={22} aria-hidden="true" focusable="false" />
	{:else if rodzaj === 'sukces'}
		<CircleCheck class="panel-ikona" size={22} aria-hidden="true" focusable="false" />
	{:else if rodzaj === 'info'}
		<Info class="panel-ikona" size={22} aria-hidden="true" focusable="false" />
	{/if}

	<div class="tresc">
		{#if naglowek}
			<p class="naglowek">{naglowek}</p>
		{/if}
		<div class="cialo">{@render children()}</div>
	</div>
</div>

<style>
	/* Panel padding 16px, rising to 24px at md, per the panel density table. Max width
	   46rem matches the form column so a panel never outruns the fields it describes. */
	.panel {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		box-sizing: border-box;
		max-width: 46rem;
		padding: 16px;
		border-radius: var(--radius-md);
		border: 2px solid transparent;
	}

	@media (min-width: 768px) {
		.panel {
			padding: 24px;
		}
	}

	/* The focus ring is the global one. It is NOT removed here even though the element
	   is only ever focused programmatically: a visible ring is how a sighted keyboard
	   user sees where the page just moved them. */

	.panel.blad {
		background: var(--color-danger-surface);
		border-color: var(--color-danger);
		color: var(--color-ink);
	}

	.panel.sukces {
		background: var(--color-tint-green);
		color: var(--color-ink);
	}

	.panel.neutralny {
		background: var(--color-band);
		color: var(--color-ink);
	}

	.panel.info {
		background: var(--color-tint-blue);
		color: var(--color-ink);
	}

	/* Icon colours: danger on the danger panel (6.47:1 against its own surface),
	   brand-blue on the other two (5.13:1 on tint-green, above 5:1 on tint-blue). */
	.panel.blad :global(.panel-ikona) {
		flex: none;
		margin-top: 2px;
		color: var(--color-danger);
	}

	.panel.sukces :global(.panel-ikona),
	.panel.info :global(.panel-ikona) {
		flex: none;
		margin-top: 2px;
		color: var(--color-brand-blue);
	}

	.tresc {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	/* Baloo 700 at the 20px section step. A <p> rather than a heading element on
	   purpose: a panel that appears mid-page must not inject a heading into the
	   document outline, which would break the „never skipped" heading order the
	   Accessibility Contract requires of every screen. */
	.naglowek {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
	}

	.panel.blad .naglowek {
		color: var(--color-danger);
	}

	.cialo {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		max-width: 65ch;
	}

	.cialo :global(p) {
		margin: 0;
	}

	.cialo :global(p + p) {
		margin-top: 8px;
	}

	/* Links inside a panel stay brand-blue AND underlined, never colour alone. */
	.cialo :global(a) {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.cialo :global(a:hover) {
		color: var(--color-brand-blue-hover);
	}
</style>
