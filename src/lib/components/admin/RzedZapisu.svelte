<script lang="ts">
	// The save row (04.1-UI-SPEC Component Contract 9; D-11). The muted publish-delay
	// note, the ONE primary „Zapisz", and „Anuluj" as a secondary link. Nothing else.
	//
	// D-11 IS ENFORCED BY THIS FILE'S SHAPE, not by a convention a page is asked to
	// respect. There is no children snippet and no second action prop, so a page that
	// wanted a second save control could not express one through this component: it would
	// have to hand-author a button next to the row, which the per-screen acceptance grep
	// („exactly one RzedZapisu, exactly one submit control") is written to catch. One
	// page, one save, one commit, one Cloudflare build: a second button is not a cosmetic
	// mistake here, it is a second build and a second deploy of the żłobek's website.
	//
	// IT MUST REMAIN CORRECT WHEN NOTHING ENHANCES IT. `zajete` defaults to false, so the
	// server-rendered row is a working submit button and a working link with no
	// JavaScript at all (D-17). The saving state is an enhancement a hydrated page may
	// switch on; it is never the mechanism by which the row functions.
	//
	// This file carries NO visible string. All three arrive from a page that read them
	// out of src/lib/content/panel.ts.
	import Przycisk from './Przycisk.svelte';

	let {
		nota,
		etykietaZapisz,
		etykietaAnuluj,
		celAnuluj,
		zajete = false
	}: {
		/** The standing „changes save as one whole, visible in about 2 minutes" line. */
		nota: string;
		/** Already swapped to „Zapisywanie..." by the page when `zajete` is set: the label
		 *  is copy and this component is not allowed to choose between two strings. */
		etykietaZapisz: string;
		etykietaAnuluj: string;
		celAnuluj: string;
		zajete?: boolean;
	} = $props();
</script>

<div class="rzad">
	<p class="nota">{nota}</p>
	<div class="akcje">
		<Przycisk {zajete} pelnaSzerokosc>{etykietaZapisz}</Przycisk>
		<a class="anuluj" href={celAnuluj}>{etykietaAnuluj}</a>
	</div>
</div>

<style>
	/* 48px from the last field group, per Contract 9. The separation belongs to the row
	   rather than to whatever sits above it, so every screen gets it without asking. */
	.rzad {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 48px;
	}

	/* Nunito 400 15px muted, always present. It is the honest publish-delay promise of
	   D-18 stated BEFORE the click rather than only after it. */
	.nota {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* Stacked and full width below the small breakpoint, side by side above it, left
	   aligned in both. `align-items: stretch` while stacked is what makes the button
	   genuinely full width rather than merely centred. */
	.akcje {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 16px;
	}

	@media (min-width: 640px) {
		.akcje {
			flex-direction: row;
			align-items: center;
			gap: 24px;
		}
	}

	/* Secondary link, not a third button: „Anuluj" navigates, it does not act. Blue AND
	   underlined, never colour alone. Its own 44px target so it is not a hairline tap
	   zone under the button on a phone. */
	.anuluj {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	.anuluj:hover {
		color: var(--color-brand-blue-hover);
	}

	@media (min-width: 640px) {
		.anuluj {
			justify-content: flex-start;
		}
	}
</style>
