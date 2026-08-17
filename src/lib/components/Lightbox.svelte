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
	// The image element itself stays in the PAGE and arrives as a snippet, so the island
	// carries no image-processing concern and knows nothing about enhanced-img.
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import X from '@lucide/svelte/icons/x';

	let {
		podpis,
		opis,
		zrodlo,
		miniatura,
		powiekszenie
	}: {
		/** The stored caption. Names the dialog through aria-labelledby. */
		podpis: string;
		/** The stored alt text, announced as the image description AND shown as visible text. */
		opis: string;
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
		aria-labelledby={PODPIS_ID}
		tabindex="-1"
		transition:fade={{ duration: czasRuchu() }}
		onkeydown={klawisz}
	>
		<!-- DOM order is the contract: close button, image, caption, description line. The close
		     button sits INSIDE the panel rather than floating on the scrim, because a control
		     whose only backing is a translucent overlay has no guaranteed contrast against the
		     photograph behind it. -->
		<div class="pasek">
			<button
				bind:this={przyciskZamkniecia}
				type="button"
				class="zamknij"
				aria-label="Zamknij podgląd"
				onclick={zamknij}
			>
				<X size={24} aria-hidden="true" />
			</button>
		</div>

		<div class="obraz">
			{@render powiekszenie()}
		</div>

		<h2 id={PODPIS_ID} class="podpis">{podpis}</h2>
		<!-- The alt as VISIBLE text, so the description is readable and not only announced. -->
		<p class="opis">{opis}</p>
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
		border-radius: var(--radius-lg);
		aspect-ratio: 4 / 3;
	}

	.kafelek :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
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
	   animates is opacity. */
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

	.pasek {
		display: flex;
		justify-content: flex-end;
	}

	.zamknij {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--color-brand-blue);
		color: #ffffff;
		cursor: pointer;
	}

	.zamknij:hover {
		background: var(--color-brand-blue-hover);
	}

	.obraz {
		margin-top: 8px;
	}

	.obraz :global(img) {
		display: block;
		width: auto;
		max-width: 100%;
		max-height: 70vh;
		margin-inline: auto;
		border-radius: var(--radius-lg);
	}

	.podpis {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.2;
		color: var(--color-ink);
		margin: 16px 0 0;
	}

	.opis {
		font-family: var(--font-body);
		font-weight: 400;
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-muted);
		margin: 4px 0 0;
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
