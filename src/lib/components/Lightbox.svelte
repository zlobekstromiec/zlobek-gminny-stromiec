<script lang="ts">
	// The site's FOURTH hydrated island and the FIRST on a prerendered content route
	// (GALLERY-01, 05-UI-SPEC Contract 2, 05 D-13).
	//
	// TRANSPOSED FROM MobileNav.svelte, NOT RE-DERIVED. That component is the only working
	// dialog precedent in this repository and four of its properties are load-bearing here:
	//
	//   1. The focus restore lives in the $effect's CLEANUP, never in a click handler. That is
	//      what makes ONE code path serve all three ways out (Escape, the close button, the
	//      scrim). Restoring focus in a handler means each of the three needs its own restore
	//      and one of them gets forgotten.
	//   2. The dialog element carries the dialog role, the modal flag and a programmatic-only
	//      tabindex, and the keydown handler is on the DIALOG, never on the window.
	//   3. The fade duration comes from a FUNCTION, so prefers-reduced-motion is honoured in
	//      JavaScript and not only in CSS; the component-scoped @media block below is the
	//      second layer, exactly as the precedent keeps both.
	//   4. The two compiler-suppression comments above the scrim are required, not decorative:
	//      without them `npm run check` fails at pre-commit on the click-events-need-key-events
	//      and static-element-interaction rules. (Neither the suppression directive nor the
	//      dialog's modal attribute is spelled out anywhere in this file's prose, following the
	//      repository rule recorded at 04-02: a comment explaining a constraint must not make
	//      the grep that enforces it report a permanent false positive.)
	//
	// WHY THE TILE IS A LINK AND STAYS ONE. Each tile is an <a href> to the full-size asset
	// that is already in the prerendered HTML, so with scripting off the tap opens the
	// photograph. The island adds behaviour on top of markup that already worked: there is no
	// conditional markup, no control that does nothing and no layout change on hydration. The
	// interception is NARROW on purpose (a plain primary click only), so a modifier key or a
	// middle click still opens the image in a new tab.
	//
	// WHAT THIS COMPONENT DELIBERATELY DOES NOT DO, written out so it is not re-invented:
	// no navigation between photographs (no arrows, no swipe, no counter), which would be a
	// second focus-order problem and a second keyboard contract for a set a visitor can simply
	// close and reopen; no separate fetch and no loading affordance of any kind, because the
	// dialog renders the same responsive source the tile already carries; and no error state,
	// because there is no runtime fetch and an entry whose file the build does not carry was
	// already dropped by the reader in $lib/galeria, so this dialog can never open onto nothing.
	//
	// THE PRESENTATION IS A PASSE-PARTOUT (260901-amq, D-1 to D-3). The dialog is a MOUNTED
	// PHOTOGRAPH: one even 16px inset all the way round, and the concentricity law
	// (inner radius = container radius minus inset) then FIXES every other number in the
	// composition — panel 24, photograph 8, close control 8. Nothing in the media surround is a
	// circle or a pill any more, and the close control no longer sits in a band of its own above
	// the picture. Each of those numbers is pinned by tests/galeria.spec.ts on the value the
	// BROWSER computes, so a later refactor that keeps the look keeps the suite green and one
	// that quietly changes it does not.
	//
	// THE CAPTION IS OPTIONAL AND THE NAME IS NOT (D-4). `podpis` is published on /o-nas only,
	// where it carries a room name no neighbouring text repeats; a post's gallery passes none,
	// because the post's prose already describes the scene. The dialog's accessible name is
	// therefore never allowed to depend on the caption: see ETYKIETA_OKNA below for the rule
	// and for why a fixed label beats the photograph's alt text here.
	//
	// The image element itself stays in the PAGE and arrives as a snippet, so the island
	// carries no image-processing concern and knows nothing about enhanced-img.
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import X from '@lucide/svelte/icons/x';

	let {
		podpis,
		zrodlo,
		miniatura,
		powiekszenie
	}: {
		/** The stored caption, OPTIONAL since 260901-amq (D-4). Where it is present it is
		 *  rendered as the visible h2 below and names the dialog through aria-labelledby;
		 *  where it is absent no heading renders at all and the name comes from ETYKIETA_OKNA.
		 *  Captions are published on /o-nas only, because there the caption carries the name of
		 *  a room that no neighbouring text repeats, whereas under a post the prose already
		 *  describes the scene and the photograph stands on its own. */
		podpis?: string;
		// THERE IS NO `opis` PROP, and its absence is a content decision rather than an
		// oversight. The stored alt text used to be rendered here a second time, as a visible
		// line under the caption. It is still on the photograph itself, as the `alt` attribute
		// of the image the PAGE renders into the snippets below, so nothing is lost for a
		// screen reader; what is gone is the duplicate printed under the picture, which a
		// sighted visitor did not need and which turned a description written for assistive
		// technology into published prose about identifiable people.
		/** The full-size asset the tile links to, which is the no-scripting affordance. */
		zrodlo: string;
		/** The tile's image, rendered by the page so this island knows nothing about it. */
		miniatura: Snippet;
		/** The same photograph at the dialog's own `sizes`, likewise rendered by the page. */
		powiekszenie: Snippet;
	} = $props();

	// Unique per instance, so twelve mounted islands cannot collide on one id. The rune has to
	// stand alone as a declaration initializer; interpolating it directly is a compile error.
	const idWyspy = $props.id();
	const PODPIS_ID = `podglad-podpis-${idWyspy}`;
	const CZAS_MS = 150;

	/**
	 * The dialog's name WHEN THERE IS NO CAPTION (D-4). A modal with role="dialog" and no
	 * accessible name is a WCAG 4.1.2 failure, so the name is never allowed to be optional even
	 * where the caption is: exactly one of aria-labelledby and aria-label is emitted, never both
	 * and never neither.
	 *
	 * WHY A FIXED LABEL RATHER THAN THE PHOTOGRAPH'S ALT TEXT (D-4 allows either):
	 *   1. The alt text is already on the image INSIDE this dialog, so a name built from it
	 *      would be announced twice in a row.
	 *   2. A constant does not have to be threaded as a prop through two pages, so it cannot go
	 *      missing on one of them the way a threaded value can.
	 *   3. „Podgląd" is the same word the close button's name already uses („Zamknij podgląd"),
	 *      so the two controls of this dialog speak one vocabulary.
	 */
	const ETYKIETA_OKNA = 'Podgląd zdjęcia';

	/** Whitespace is not a caption: a stored value of „ " must not produce an empty heading that
	 *  then names the dialog with nothing. */
	const maPodpis = $derived(typeof podpis === 'string' && podpis.trim().length > 0);

	let otwarte = $state(false);
	let wyzwalacz: HTMLAnchorElement | undefined = $state();
	let przyciskZamkniecia: HTMLButtonElement | undefined = $state();
	let dialogEl: HTMLElement | undefined = $state();

	/** Fade duration: 0 (instant show and hide) when the visitor prefers reduced motion. */
	function czasRuchu(): number {
		if (typeof window === 'undefined') return 0;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : CZAS_MS;
	}

	function zamknij() {
		otwarte = false;
	}

	// While open: lock body scroll and move focus to the close button. On close (the effect's
	// CLEANUP): release the lock and hand focus back to the tile that opened the dialog.
	$effect(() => {
		if (!otwarte) return;
		const poprzedniPrzelew = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		przyciskZamkniecia?.focus();
		return () => {
			document.body.style.overflow = poprzedniPrzelew;
			wyzwalacz?.focus();
		};
	});

	// The narrow interception. Anything that is not a plain primary click falls through to the
	// browser, so „otwórz obraz w nowej karcie" keeps working (05-UI-SPEC Contract 2). A middle
	// click never reaches this handler at all in a current browser, because it fires auxclick
	// rather than click; the button guard is the belt to that pair of braces.
	function klik(zdarzenie: MouseEvent) {
		if (zdarzenie.button !== 0) return;
		if (zdarzenie.metaKey || zdarzenie.ctrlKey || zdarzenie.shiftKey || zdarzenie.altKey) return;
		zdarzenie.preventDefault();
		otwarte = true;
	}

	// Enter on a link already produces a click, so it needs nothing here. Space does not, and
	// Contract 2 asks for it: a tile that opens a dialog should answer the key a control that
	// opens a dialog answers.
	function klawiszKafelka(zdarzenie: KeyboardEvent) {
		if (zdarzenie.key !== ' ') return;
		zdarzenie.preventDefault();
		otwarte = true;
	}

	function klawisz(zdarzenie: KeyboardEvent) {
		if (zdarzenie.key === 'Escape') {
			zdarzenie.preventDefault();
			zamknij();
			return;
		}
		if (zdarzenie.key !== 'Tab' || !dialogEl) return;

		// Bounded focus trap over the dialog's OWN focusable elements. The dialog holds a single
		// control, so the cycle closes onto that one control; the property being enforced is
		// that Tab and Shift+Tab never reach the tile links on either side of it, FROM EVERY
		// focus position inside the dialog and not only from the two wrap points.
		const fokusowalne = Array.from(
			dialogEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
		).filter((element) => element.tabIndex !== -1);
		if (fokusowalne.length === 0) return;

		const pierwszy = fokusowalne[0];
		const ostatni = fokusowalne[fokusowalne.length - 1];
		const aktywny = document.activeElement;
		// Where the focused element sits in the cycle. -1 means „inside the dialog, but not one
		// of its own controls", and that state is REACHABLE rather than theoretical: the dialog
		// element carries tabindex="-1", which makes it CLICK focusable, so a visitor who clicks
		// the enlarged photograph is standing on the container itself. This handler only ever
		// runs for a key pressed inside the dialog, so -1 can mean nothing else.
		const pozycja = aktywny instanceof HTMLElement ? fokusowalne.indexOf(aktywny) : -1;

		// Focus that is not on a member of the cycle enters the cycle at the end the key is
		// heading for. Handling only the two wrap points would leave the container state to the
		// browser default, and Shift+Tab from there walks out of the dialog onto the tile links
		// this trap exists to bound.
		if (pozycja === -1) {
			zdarzenie.preventDefault();
			(zdarzenie.shiftKey ? ostatni : pierwszy).focus();
			return;
		}

		if (zdarzenie.shiftKey && aktywny === pierwszy) {
			zdarzenie.preventDefault();
			ostatni.focus();
		} else if (!zdarzenie.shiftKey && aktywny === ostatni) {
			zdarzenie.preventDefault();
			pierwszy.focus();
		}
	}
</script>

<a bind:this={wyzwalacz} class="kafelek" href={zrodlo} onclick={klik} onkeydown={klawiszKafelka}>
	<span class="visually-hidden">Powiększ zdjęcie: </span>
	{@render miniatura()}
</a>

{#if otwarte}
	<!-- Scrim: mouse-dismiss convenience. Keyboard users dismiss via the close button (first
	     focus) or Escape, so the static element carries no keyboard handler by design. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="tlo" transition:fade={{ duration: czasRuchu() }} onclick={zamknij}></div>

	<div
		bind:this={dialogEl}
		class="panel"
		role="dialog"
		aria-modal="true"
		aria-labelledby={maPodpis ? PODPIS_ID : undefined}
		aria-label={maPodpis ? undefined : ETYKIETA_OKNA}
		tabindex="-1"
		transition:fade={{ duration: czasRuchu() }}
		onkeydown={klawisz}
	>
		<!-- DOM order is the contract: close button, image, caption. The close
		     button sits INSIDE the panel rather than floating on the scrim, because a control
		     whose only backing is a translucent overlay has no guaranteed contrast against the
		     photograph behind it. It is a DIRECT CHILD of the panel and pushed right by its own
		     auto margin: the wrapper it used to sit in was a 44px band above the photograph and
		     read as an empty white strip (260901-amq, D-3). -->
		<button
			bind:this={przyciskZamkniecia}
			type="button"
			class="zamknij"
			aria-label="Zamknij podgląd"
			onclick={zamknij}
		>
			<X size={24} aria-hidden="true" />
		</button>

		<div class="obraz">
			{@render powiekszenie()}
		</div>

		{#if maPodpis}
			<h2 id={PODPIS_ID} class="podpis">{podpis}</h2>
		{/if}
	</div>
{/if}

<style>
	/* -------------------------------------------------------------------------------------
	   The tile. These rules moved here from /o-nas with the anchor they style: a page-scoped
	   selector cannot reach an element another component renders, and leaving them behind
	   would have been an unused-selector warning rather than a silent miss.

	   The photo is its own boundary, so no border and no shadow. The 4:3 box is reserved
	   BEFORE the image paints (no CLS) and `cover` is the safety net for the two hand-placed
	   seed photographs, which the panel's own upload path would have cropped.
	   ------------------------------------------------------------------------------------- */
	.kafelek {
		display: block;
		overflow: hidden;
		/* --radius-md, not --radius-lg (260901-amq, D-2). The locked spec reserves 24px for the
		   „hero image slot, large surfaces"; a 328-372px tile in a grid is neither, and it sat
		   at three times the radius of the NewsCard cover it shares a content class with. */
		border-radius: var(--radius-md);
		aspect-ratio: 4 / 3;
	}

	/* `center top` rather than the default centre (260901-amq, D-6). Four of the six facility
	   photographs are PORTRAIT, and the 4:3 box with `cover` was cropping them to the middle
	   band, which in an interior or a playground throws away the thing being photographed.

	   THIS ONE RULE HAS NO SIDE EFFECT ON THE POST PAGE, and the reason is worth writing down
	   rather than re-deriving. Under `cover` a photograph WIDER than 4:3 overflows horizontally,
	   so its vertical component is already fully shown and this value means nothing for it; the
	   change reaches portrait files only. Files uploaded through the panel are cropped to the
	   target ratio server side, so source ratio equals tile ratio for them and they are likewise
	   untouched. Only the hand-placed portrait seeds move, which is exactly the intent. */
	.kafelek :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		transition: transform 150ms ease;
	}

	/* Hover: the image scales INSIDE its clipped box. No translate, no shadow change, no
	   accent colour anywhere on the tile. */
	.kafelek:hover :global(img) {
		transform: scale(1.03);
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

	/* -------------------------------------------------------------------------------------
	   The dialog. Fixed position rather than a portal, so no dependency is added and the
	   markup stays where the tile is (05-UI-SPEC Contract 2).
	   ------------------------------------------------------------------------------------- */
	.tlo {
		position: fixed;
		inset: 0;
		z-index: 80;
		background: rgb(15 23 42 / 0.72);
	}

	/* Centred with auto margins rather than a translate, so the only thing this component ever
	   animates is opacity.

	   THE PANEL IS THE ANCHOR OF THE CONCENTRICITY LAW (260901-amq, D-1, D-2): 24px of radius
	   with a 16px inset, and 24 minus 16 is 8, which is the radius the photograph and the close
	   control below both take. The card therefore reads as a MOUNTED PHOTOGRAPH: one even
	   border all the way round, one shape language, and the control yielding to the picture.
	   Changing the padding here without changing those two is what would break the law. */
	.panel {
		position: fixed;
		inset: 0;
		z-index: 90;
		margin: auto;
		width: fit-content;
		height: fit-content;
		max-width: min(90vw, 60rem);
		max-height: 90vh;
		overflow: auto;
		padding: 16px;
		background: var(--color-surface);
		border-radius: var(--radius-lg);
	}

	/* The close control, ghost rather than a filled blue circle (260901-amq, D-3). No circle and
	   no pill survives anywhere in the media surround, so the composition speaks one shape:
	   panel 24, photograph 8, control 8.

	   `margin-left: auto` on a fixed-width element is what pushes it to the right edge of the
	   panel's content box, which is the right edge of the photograph area beside it. That
	   replaces the old flex wrapper, whose only job was the same alignment and whose side effect
	   was a 44px band of empty white above the picture.

	   40x40 MEETS WCAG 2.1 AA. Success criterion 2.5.8 Target Size (Minimum) sets the AA
	   threshold at 24px; the 44px figure belongs to 2.5.5 at level AAA and is not binding here.

	   THE BORDER IS EDGE DECORATION, NOT THE CONTROL'S ONLY BOUNDARY, so 1.4.11 Non-text
	   Contrast is carried by the X glyph in --color-ink against the panel's white, not by the
	   1px --color-border-subtle line. NO FOCUS RING IS DECLARED HERE ON PURPOSE: the global
	   :focus-visible rule in app.css already draws it, and a second declaration would drift out
	   of step with every other control on the site. */
	.zamknij {
		/* `flex`, NOT `inline-flex`: an inline-level box ignores an auto side margin, so the
		   control would stay pinned to the left edge of the panel. Block level plus a fixed
		   width is what makes `margin-left: auto` the right-alignment it reads as. */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		margin-left: auto;
		padding: 0;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-ink);
		cursor: pointer;
	}

	.zamknij:hover,
	.zamknij:focus-visible {
		background: var(--color-surface-warm);
	}

	.obraz {
		margin-top: 8px;
	}

	/* --radius-sm, and it is DERIVED rather than chosen: the panel's 24px minus its 16px inset
	   is 8px, so this is the one place the concentricity law actually produces a number
	   (260901-amq, D-2). At 24px the photograph shared its container's radius while sitting
	   16px inside it, which is the mismatch a visitor reads as „unfinished". */
	.obraz :global(img) {
		display: block;
		width: auto;
		max-width: 100%;
		max-height: 70vh;
		margin-inline: auto;
		border-radius: var(--radius-sm);
	}

	.podpis {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 16px 0 0;
	}

	/* The component's OWN guard, in addition to the global neutraliser in app.css and to the
	   JavaScript duration above. The JS layer is what actually makes the show and hide
	   instant; this block removes the tile's transform, which the global neutraliser shortens
	   but never removes, and neutralises any transition inherited onto the two dialog
	   elements. */
	@media (prefers-reduced-motion: reduce) {
		.kafelek :global(img),
		.kafelek:hover :global(img) {
			transform: none;
			transition: none;
		}

		.tlo,
		.panel {
			transition: none;
		}
	}
</style>
