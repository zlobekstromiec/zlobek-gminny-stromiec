<script lang="ts">
	// The „Treść zastępcza" badge (04.1-UI-SPEC Component Contract 4, Listy copy table).
	//
	// TEXT PLUS BORDER, NEVER A BARE COLOUR SWATCH. Colour is never the only signal in
	// this project (UI-SPEC hard rule 4), and „this content is a placeholder waiting for
	// somebody to confirm it" is precisely the state a colour-blind editor must not have
	// to guess at. The 2px border is drawn in `accent-active`, which clears 3:1 against
	// white as a UI boundary in its own right, and the label sits on `tint-yellow` at
	// 11.6:1.
	//
	// This is the ONE place in the panel where the accent family touches something that is
	// not a primary action, and the UI-SPEC reserved list allows it by name (item 4).
	//
	// This file carries NO visible string. The word arrives from a page that read it out
	// of src/lib/content/panel.ts, so the Polish-only sweep governs it.

	let { etykieta }: { etykieta: string } = $props();
</script>

<span class="odznaka">{etykieta}</span>

<style>
	/* 4px by 12px padding, radius-sm, Nunito 700 13px ink: the label step of the panel
	   type scale, one size below a nav chip, because a badge annotates a row and never
	   competes with the row's own title. */
	.odznaka {
		display: inline-flex;
		align-items: center;
		box-sizing: border-box;
		padding: 4px 12px;
		border: 2px solid var(--color-accent-active);
		border-radius: var(--radius-sm);
		background: var(--color-tint-yellow);
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
		/* Never wraps mid-phrase: a two-line badge reads as two badges. */
		white-space: nowrap;
	}
</style>
