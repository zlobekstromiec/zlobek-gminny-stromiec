<script lang="ts">
	// The repeatable group (04.1-UI-SPEC Component Contract 7; D-17, P-26). The one
	// genuinely hard no-scripting pattern in this phase, and the reason it is hard is that
	// adding and removing a row are SERVER ROUND TRIPS.
	//
	// WHY NOT CLIENT STATE. A row added by client code exists only in a browser that ran it.
	// This panel has to work with scripting switched off (D-17), so the add and the remove
	// are ordinary submit buttons carrying their own form action: the server reads every
	// value that was typed, changes the LENGTH of the list, and renders the whole form
	// again with everything intact. Nothing is committed by either one, which is the single
	// most important thing an editor has to know about this control and is why the note
	// above the add button is persistent rather than a message that appears afterwards.
	//
	// ROW IDENTITY IS POSITION, AND NOTHING ELSE. Every control inside an item carries an
	// indexed name (see src/lib/pola-strony.ts) and the remove button carries that same
	// position as its value. The index never selects a file, a record or an identity, and
	// the server collects the submitted set into a dense array, so a gap in the numbering
	// cannot become a hole in the saved content (threat T-04.1-34).
	//
	// FOCUS IS MOVED TWICE, DELIBERATELY, AND BY TWO DIFFERENT MECHANISMS. After an add,
	// focus belongs in the new item; after a remove, on the add button, because the control
	// the editor was in has stopped existing and focus would otherwise fall to the top of
	// the document. The attribute the server renders does it for a browser that has just
	// parsed a fresh document, which is the no-scripting path. The effect below does it for
	// a hydrated page, where the form was submitted in the background and an attribute on an
	// already-parsed document does nothing.
	//
	// THE EFFECT DELIBERATELY DOES NOT LOOK FOR THAT ATTRIBUTE, and the reason is a property
	// of the compiler rather than a preference. Svelte treats `autofocus` as an INIT-ONLY
	// concern: it emits one call when the element is created and never updates it again. So
	// on a hydrated page the attribute is never added to an element that already existed
	// (the add button never gets it) and it is never REMOVED from one that got it earlier
	// (the row added a moment ago still carries it). A query for it would therefore find
	// nothing after a removal and the wrong row after a second addition. The effect works
	// from the request itself instead: the position for an item, the button for a removal.
	//
	// REORDERING IS OUT OF SCOPE for this phase, in both directions and in every list that
	// uses this component: no dragging, no up and down buttons. Items are authored in order
	// and an editor who wants a different order retypes. This sentence is here because the
	// contract asks for it to be written down where somebody would otherwise add it.
	//
	// NOT ONE VISIBLE STRING IS AUTHORED HERE. The legend word, the note, both button
	// labels and the announcement all arrive as props from src/lib/content/panel.ts, which
	// is what lets the Polish-only sweep cover this component without reading it.
	import type { Snippet } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Przycisk from './Przycisk.svelte';
	import type { ZadanieFokusu } from '$lib/pola-strony';

	let {
		id,
		legenda,
		podpowiedz,
		ile,
		etykietaElementu,
		akcjaDodania,
		akcjaUsuniecia,
		etykietaDodania,
		etykietaUsuniecia,
		nazwaIndeksu,
		nota,
		status = '',
		zadanie,
		wlasnaRamka = false,
		element
	}: {
		/** Prefix every item's wrapper derives its own id from. */
		id: string;
		/** Legend of the WHOLE group, for example „Wartości". */
		legenda: string;
		podpowiedz?: string;
		ile: number;
		/** The numbered legend of ONE item, for example „Wartość 1". A function rather than
		 *  a word plus a number, so the Polish stays in the copy module where it can be
		 *  swept and inflected. */
		etykietaElementu: (numer: number) => string;
		/** Form actions the two buttons post to, for example `?/dodajWiersz`. */
		akcjaDodania: string;
		akcjaUsuniecia: string;
		etykietaDodania: string;
		etykietaUsuniecia: string;
		/** `name` of the remove button, whose value is the item's position. */
		nazwaIndeksu: string;
		/** The persistent „adding a row does not save" note of Contract 7. */
		nota: string;
		/** What the add and remove actions announce. Empty on a clean render, so the region
		 *  exists before it has anything to say. */
		status?: string;
		/** Where focus goes after the answer this render came from. A fresh object per
		 *  server answer, which is what makes the effect below run again when the
		 *  destination is the same button as last time. */
		zadanie?: ZadanieFokusu;
		/** Set when the caller's own snippet already provides the item's labelled grouping.
		 *  The photo list is the one case: the image island IS a fieldset with a legend
		 *  (Contract 8), and wrapping it in a second one would announce two nested groups
		 *  for one picture. The numbered legend is then passed INTO the island, so Contract
		 *  7's „each item is a fieldset with a legend numbering it" still holds exactly. */
		wlasnaRamka?: boolean;
		/** Renders the controls of item `indeks`. */
		element: Snippet<[number]>;
	} = $props();

	/** The positions to render. Materialised rather than iterated as a length, because the
	 *  position IS the item's whole identity here: it names every control inside the item
	 *  and it is the value the remove button carries. */
	const indeksy = $derived(Array.from({ length: ile }, (_, i) => i));

	/** The item cards and the add button, so the effect can reach the destination without
	 *  either half of the page knowing the other's markup. */
	let korzen: HTMLFieldSetElement | undefined = $state();
	let przyciskDodania: HTMLDivElement | undefined = $state();

	/** The controls an editor can land in. The hidden fields the photo island carries are
	 *  excluded by construction, because focusing one of those would move focus to something
	 *  nobody can see or type into. */
	const WYBIERALNE = 'input:not([type="hidden"]), select, textarea';

	$effect(() => {
		// Read as a whole so a new answer re-runs this even when it names the same
		// destination: two removals in a row both want the add button focused, and the
		// action returns a fresh object each time precisely so this fires again.
		const cel = zadanie;
		if (cel === undefined) return;
		if (cel.cel === 'dodaj') {
			przyciskDodania?.querySelector('button')?.focus();
			return;
		}
		// By POSITION, which is the same identity every other part of this pattern uses.
		const karty = korzen?.querySelectorAll('.element');
		const kontrolka = karty?.[cel.indeks]?.querySelector(WYBIERALNE);
		if (kontrolka instanceof HTMLElement) kontrolka.focus();
	});
</script>

<fieldset class="grupa" bind:this={korzen} aria-describedby={podpowiedz ? `${id}-hint` : undefined}>
	<legend class="legenda">{legenda}</legend>
	{#if podpowiedz}
		<p id="{id}-hint" class="podpowiedz">{podpowiedz}</p>
	{/if}

	<div class="lista">
		{#each indeksy as indeks (indeks)}
			{#if wlasnaRamka}
				<div class="element">
					{@render element(indeks)}
					<div class="usun">
						<Przycisk
							wariant="secondary"
							formaction={akcjaUsuniecia}
							nazwa={nazwaIndeksu}
							wartosc={String(indeks)}
						>
							<span class="etykieta-usun">{etykietaUsuniecia}</span>
						</Przycisk>
					</div>
				</div>
			{:else}
				<fieldset class="element">
					<legend class="legenda-elementu">{etykietaElementu(indeks + 1)}</legend>
					{@render element(indeks)}
					<div class="usun">
						<Przycisk
							wariant="secondary"
							formaction={akcjaUsuniecia}
							nazwa={nazwaIndeksu}
							wartosc={String(indeks)}
						>
							<span class="etykieta-usun">{etykietaUsuniecia}</span>
						</Przycisk>
					</div>
				</fieldset>
			{/if}
		{/each}
	</div>

	<!-- The only progress indicator these two actions have, and there is nothing else to
	     announce: the page did not navigate anywhere a screen reader would notice. Present
	     from the first render so the region exists before its text changes, polite so it
	     never interrupts. -->
	<p class="status" role="status" aria-live="polite">{status}</p>

	<!-- Contract 7 puts this ABOVE the add button and keeps it there permanently. An
	     editor who adds four rows, closes the tab and comes back to find nothing saved is
	     the failure this one sentence prevents. -->
	<p class="nota">{nota}</p>

	<div class="dodaj" bind:this={przyciskDodania}>
		<Przycisk wariant="secondary" formaction={akcjaDodania} autofokus={zadanie?.cel === 'dodaj'}>
			<Plus size={18} aria-hidden="true" focusable="false" />
			<span>{etykietaDodania}</span>
		</Przycisk>
	</div>
</fieldset>

<style>
	/* One surface card for the whole group, 16px padding rising to 24px at md: the panel
	   density steps every other field group on these screens uses. */
	.grupa {
		display: flex;
		flex-direction: column;
		gap: 16px;
		box-sizing: border-box;
		min-width: 0;
		margin: 0;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	@media (min-width: 768px) {
		.grupa {
			padding: 24px;
		}
	}

	/* Visible legend styled as the 20px h2 step. `float: left` plus a full-width clear is
	   the long-standing way to make a legend obey normal flow inside a flex fieldset,
	   which browsers otherwise refuse to lay out as a flex item. */
	.legenda {
		float: left;
		width: 100%;
		margin: 0;
		padding: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
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

	/* 16px between items, per Contract 7. */
	.lista {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* Each item is its own card inside the group card, on the warm surface so the nesting
	   reads as nesting rather than as two unrelated panels. */
	.element {
		display: flex;
		flex-direction: column;
		gap: 16px;
		box-sizing: border-box;
		min-width: 0;
		margin: 0;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
	}

	.legenda-elementu {
		float: left;
		width: 100%;
		margin: 0;
		padding: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* The remove control sits at the END of the item it removes, so the editor reads what
	   is about to disappear before reaching the button that removes it. */
	.usun {
		display: flex;
	}

	/* Danger as the LABEL colour on a secondary button, never a danger fill: this removes a
	   row from a form and commits nothing, so it must not look like the deletion page's
	   button, which removes a published thing from the website. */
	.etykieta-usun {
		color: var(--color-danger);
	}

	.status {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.nota {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.dodaj {
		display: flex;
	}
</style>
