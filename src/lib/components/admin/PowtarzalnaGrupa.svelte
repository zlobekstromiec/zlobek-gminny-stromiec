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
	// REORDERING IS AN OPT-IN, AND IT IS THE SAME SERVER ROUND TRIP (05-UI-SPEC Contract 9,
	// 05 D-22). The six reorder props below are all unset by default, and a mount that
	// passes none of them renders exactly the markup, the button row and the focus behaviour
	// this component had before they existed. That is not a courtesy: this component is
	// mounted by two screens at three sites, and only one of those three asked for
	// reordering, so „absent means unchanged" is what keeps the other two out of the blast
	// radius. The wartości group on the O nas screen is deliberately left opted out and is
	// the live subject of a regression test that counts ZERO move buttons inside it.
	//
	// THE CAP AND THE EMPTY-STATE SENTENCE ARE OPT-IN ON EXACTLY THE SAME TERMS (05-UI-SPEC
	// Contract 9, 05 D-23). Three more props, all unset by default, all rendering nothing when
	// they are absent. Only the gallery of plan 05-06 passes them, and the cap it passes is an
	// EDITORIAL bound on what the żłobek publishes, not the work bound MAKS_ELEMENTOW that
	// bounds every group including this one. What the cap does here is stop rendering the add
	// button; it does not and cannot decide whether a save is accepted, which the server does.
	//
	// DRAGGING IS STILL OUT OF SCOPE, in every list that uses this component. It carries its
	// own accessibility bar (a pointer gesture with no keyboard equivalent is a WCAG 2.1.1
	// failure unless a second mechanism is built anyway) and it has no no-scripting path at
	// all, which is the one thing this whole pattern exists to preserve. Two buttons that
	// submit the form are the mechanism, and they are the mechanism on every branch below.
	//
	// NOT ONE VISIBLE STRING IS AUTHORED HERE. The legend word, the note, all four button
	// labels and the announcement all arrive as props from src/lib/content/panel.ts, which
	// is what lets the Polish-only sweep cover this component without reading it.
	import type { Snippet } from 'svelte';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Plus from '@lucide/svelte/icons/plus';
	import Przycisk from './Przycisk.svelte';
	import type { KierunekPrzeniesienia, ZadanieFokusu } from '$lib/pola-strony';

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
		akcjaWGore,
		akcjaWDol,
		etykietaWGore,
		etykietaWDol,
		nazwaWGore,
		nazwaWDol,
		limit,
		komunikatLimitu,
		notaPusta,
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
		/** Form actions the two REORDER buttons post to (05-UI-SPEC Contract 9). Unset by
		 *  default, which is what makes the whole feature opt-in: see the module header. */
		akcjaWGore?: string;
		akcjaWDol?: string;
		/** Their VISIBLE labels, the bare verbs. */
		etykietaWGore?: string;
		etykietaWDol?: string;
		/** Their full ACCESSIBLE names, composed from the item's numbered legend. Two
		 *  functions rather than two strings, because a list of twelve buttons all called
		 *  „Przenieś wyżej" is one name twelve times and a WCAG 2.4.4 failure by
		 *  construction. Composed in the copy module for the same reason `etykietaElementu`
		 *  is: the Polish stays where the sweep can reach it. */
		nazwaWGore?: (legenda: string) => string;
		nazwaWDol?: (legenda: string) => string;
		/** Editorial upper bound on the number of items (05-UI-SPEC Contract 9, 05 D-23). Unset
		 *  by default, exactly like the six reorder props above and for the same reason: three
		 *  of this component's four mounts must keep rendering what they rendered before.
		 *
		 *  THE BUTTON'S DISAPPEARANCE IS AN AFFORDANCE AND NOT THE GATE. A submission carrying
		 *  more than the limit is refused on the SERVER regardless of what this page rendered,
		 *  which is the only version of the rule that survives scripting being switched off or
		 *  a hand-built request. Hiding the control here is what stops an editor from filling
		 *  in a thirteenth item and only then being told it cannot be saved. */
		limit?: number;
		/** What takes the add button's place at the limit. Passed with `limit` or not at all:
		 *  a limit with no message would remove the control and explain nothing. */
		komunikatLimitu?: string;
		/** What the group says when it holds no items at all. Unset by default, so a mount that
		 *  does not pass it renders exactly today's markup. A repeated group with nothing in it
		 *  and no sentence reads as a screen that failed to load. */
		notaPusta?: string;
		/** Renders the controls of item `indeks`. */
		element: Snippet<[number]>;
	} = $props();

	/** True once the editorial bound is reached. A mount that passes no limit can never enter
	 *  this state, which is what keeps „absent means unchanged" true for the other three. */
	const naLimicie = $derived(limit !== undefined && ile >= limit);

	/** All six reorder props, or nothing at all. Collapsed into one value so the markup has
	 *  a single question to ask and so a HALF-configured mount is inexpressible: passing the
	 *  action without the name would render a button nobody can identify, which is worse
	 *  than rendering no button. */
	const przenoszenie = $derived(
		akcjaWGore !== undefined &&
			akcjaWDol !== undefined &&
			etykietaWGore !== undefined &&
			etykietaWDol !== undefined &&
			nazwaWGore !== undefined &&
			nazwaWDol !== undefined
			? { akcjaWGore, akcjaWDol, etykietaWGore, etykietaWDol, nazwaWGore, nazwaWDol }
			: undefined
	);

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

	/** The submit button of ONE item carrying this form action.
	 *
	 *  This is why the reorder needed a third `ZadanieFokusu` variant rather than reusing the
	 *  existing one: the typeable-control selector declared above excludes buttons
	 *  deliberately, so the destination of a move cannot be reached through it at all. (Its
	 *  name is described rather than written here, following the repository rule that a
	 *  comment explaining a constraint must not make the grep enforcing it report a
	 *  permanent false positive.) Found by the ACTION rather than by a class or by a
	 *  position inside the row, because the action name is the same string the button was
	 *  rendered with and it is what tells the two directions apart. */
	function przyciskAkcji(karta: Element, akcja: string): HTMLButtonElement | null {
		const przycisk = karta.querySelector(`button[formaction="${akcja}"]`);
		return przycisk instanceof HTMLButtonElement ? przycisk : null;
	}

	/** Which move button the SERVER-RENDERED attribute should land on for item `indeks`, or
	 *  undefined. It mirrors the effect below, fallback included, because the two halves of
	 *  every focus move in this component have to agree: the attribute serves a browser that
	 *  has just parsed a fresh document, which is the no-scripting path, and the effect
	 *  serves a hydrated page where an attribute on an already-parsed document does nothing. */
	function fokusPrzeniesienia(indeks: number): KierunekPrzeniesienia | undefined {
		if (zadanie?.cel !== 'przenies' || zadanie.indeks !== indeks) return undefined;
		const naKoncu = zadanie.kierunek === 'gora' ? indeks === 0 : indeks === ile - 1;
		if (!naKoncu) return zadanie.kierunek;
		return zadanie.kierunek === 'gora' ? 'dol' : 'gora';
	}

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
		if (cel.cel === 'przenies') {
			// The button that performed the move, at the item's NEW position, so a second
			// press keeps working on the same item.
			const karta = karty?.[cel.indeks];
			if (karta === undefined || przenoszenie === undefined) return;
			const wGore = cel.kierunek === 'gora';
			const wlasny = przyciskAkcji(karta, wGore ? przenoszenie.akcjaWGore : przenoszenie.akcjaWDol);
			if (wlasny !== null && !wlasny.disabled) {
				wlasny.focus();
				return;
			}
			// The item reached an end and its own button is now disabled, so focus goes to the
			// opposite direction of the SAME item rather than falling to the top of the page.
			przyciskAkcji(karta, wGore ? przenoszenie.akcjaWDol : przenoszenie.akcjaWGore)?.focus();
			return;
		}
		const kontrolka = karty?.[cel.indeks]?.querySelector(WYBIERALNE);
		if (kontrolka instanceof HTMLElement) kontrolka.focus();
	});
</script>

<!-- The two reorder buttons of one item, authored ONCE and rendered inside BOTH branches of
     the `wlasnaRamka` split below. Written as a snippet rather than copied into each branch
     on purpose: the two branches differing is the exact failure this feature is most likely
     to ship (the gallery of plan 05-06 is the `<div class="element">` branch, which is not
     the visually obvious one), and a single definition makes that failure inexpressible
     rather than merely unlikely. Renders nothing at all when the mount opted out. -->
{#snippet przyciskiKolejnosci(indeks: number)}
	{#if przenoszenie}
		{@const legenda = etykietaElementu(indeks + 1)}
		<!-- An ordinary submit button carrying its own form action, inside the page's one
		     form, exactly like the add and the remove: that is what makes reordering work
		     with scripting switched off and commit nothing until „Zapisz". -->
		<Przycisk
			wariant="secondary"
			formaction={przenoszenie.akcjaWGore}
			nazwa={nazwaIndeksu}
			wartosc={String(indeks)}
			wylaczone={indeks === 0}
			autofokus={fokusPrzeniesienia(indeks) === 'gora'}
		>
			<ArrowUp size={18} aria-hidden="true" focusable="false" />
			<!-- The visible verb is hidden from the accessibility tree and the FULL name is
			     supplied once as one string, so what a screen reader announces is exactly what
			     the copy module composed rather than something re-assembled out of two text
			     nodes. The visible label stays a prefix of that name, which is what WCAG 2.5.3
			     asks of a control whose accessible name is longer than its label. -->
			<span aria-hidden="true">{przenoszenie.etykietaWGore}</span>
			<span class="visually-hidden">{przenoszenie.nazwaWGore(legenda)}</span>
		</Przycisk>
		<Przycisk
			wariant="secondary"
			formaction={przenoszenie.akcjaWDol}
			nazwa={nazwaIndeksu}
			wartosc={String(indeks)}
			wylaczone={indeks === ile - 1}
			autofokus={fokusPrzeniesienia(indeks) === 'dol'}
		>
			<ArrowDown size={18} aria-hidden="true" focusable="false" />
			<span aria-hidden="true">{przenoszenie.etykietaWDol}</span>
			<span class="visually-hidden">{przenoszenie.nazwaWDol(legenda)}</span>
		</Przycisk>
	{/if}
{/snippet}

<fieldset class="grupa" bind:this={korzen} aria-describedby={podpowiedz ? `${id}-hint` : undefined}>
	<legend class="legenda">{legenda}</legend>
	{#if podpowiedz}
		<p id="{id}-hint" class="podpowiedz">{podpowiedz}</p>
	{/if}

	{#if ile === 0 && notaPusta}
		<p class="nota-pusta">{notaPusta}</p>
	{/if}

	<div class="lista">
		{#each indeksy as indeks (indeks)}
			{#if wlasnaRamka}
				<div class="element">
					{@render element(indeks)}
					<div class="usun">
						{@render przyciskiKolejnosci(indeks)}
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
						{@render przyciskiKolejnosci(indeks)}
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

	<!-- At the editorial limit the add button is not rendered at all and the message takes its
	     place. Not a disabled button: a control an editor may never use again in this session
	     is not the same thing as one that is momentarily unavailable, and „Dodaj zdjęcie"
	     greyed out with no explanation is the panel looking broken. The removal is an
	     affordance and never the gate; see the `limit` prop. -->
	<div class="dodaj" bind:this={przyciskDodania}>
		{#if naLimicie && komunikatLimitu}
			<p class="limit">{komunikatLimitu}</p>
		{:else}
			<Przycisk wariant="secondary" formaction={akcjaDodania} autofokus={zadanie?.cel === 'dodaj'}>
				<Plus size={18} aria-hidden="true" focusable="false" />
				<span>{etykietaDodania}</span>
			</Przycisk>
		{/if}
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

	/* The item's action row. The remove control sits at the END of the item it removes, so
	   the editor reads what is about to disappear before reaching the button that removes
	   it, and the two reorder buttons sit before it for the same reason: they are the
	   reversible pair and the destructive one is last.

	   The gap and the wrap are no-ops for a mount that opted out of reordering, because a
	   flex row with one child has nothing to space and nothing to wrap. */
	.usun {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	/* The numbered suffix that makes each reorder button's name its own (WCAG 2.4.4). */
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

	/* The empty-state sentence and the cap message are the same kind of thing as the standing
	   note above the add button: quiet, explanatory, never coloured as an error, because
	   neither one is a failure. */
	.nota-pusta,
	.limit {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}
</style>
