<script lang="ts">
	// The phase's ONLY hydrated component (04.1 D-17, D-12, D-13, D-15; 04.1-UI-SPEC
	// Component Contract 8), and it is boring on purpose.
	//
	// WHAT IT DOES. A photo chosen from a phone or a computer is decoded, cropped to the
	// target ratio from its centre, scaled so its longest edge is at most 1600 pixels and
	// re-encoded as JPEG, all in the browser, and the result is written into a hidden field
	// as a data URL. The original file is never uploaded. A five megabyte phone photo
	// becomes roughly two to four hundred kilobytes, which matters for three separate
	// reasons: a Worker on the free plan has about ten milliseconds of processor time per
	// request and turning bytes into their textual form is real work rather than waiting,
	// git keeps every version of every file forever, and the żłobek uploads over whatever
	// connection it happens to have.
	//
	// WHAT IT DELIBERATELY DOES NOT DO. Nothing here moves. No spinner, no progress bar, no
	// fade on the preview, no skeleton, and therefore nothing to neutralise under a reduced
	// motion preference: the status sentence IS the progress indicator. That is a decision
	// rather than an omission, because a spinner is the easiest reduced-motion violation to
	// ship by accident, and this component is the one place in the phase where somebody
	// would reach for one.
	//
	// THE FILE INPUT STAYS NATIVE. It is not hidden behind a styled button, it is not
	// replaced by a drop zone, and its focus ring is never removed. Native is keyboard
	// operable, screen-reader labelled and touch friendly for nothing, and a drop zone is a
	// mouse-only affordance. The ACCEPTED CONSEQUENCE, recorded because the phase's
	// Polish-only sweep has to treat it as a documented exception rather than a defect: the
	// browse button inside the control, and the operating system picker it opens, render in
	// the browser and system locale, so on an English-locale machine an editor can see
	// „Choose File" there. Every replacement is worse for keyboard and screen-reader users,
	// and everything this component itself renders around the control stays Polish.
	//
	// ALT TEXT IS NOT ENFORCED HERE. The refusal lives in
	// src/lib/server/admin/walidacja/aktualnosci.ts, so it survives scripting being switched
	// off. What this component does is show the field and the server's message about it.
	//
	// GENERAL, so Plan 09 mounts it again for the o nas photos at a different ratio instead
	// of writing a second one: the ratio, the ready sentence and all four field names arrive
	// as props.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed here.
	import type { Picture } from '@sveltejs/enhanced-img';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Info from '@lucide/svelte/icons/info';
	import FormField from '$lib/components/FormField.svelte';
	import Przycisk from '$lib/components/admin/Przycisk.svelte';
	import { KOPIA_WALIDACJA, KOPIA_ZDJECIA } from '$lib/content/panel';
	import {
		JAKOSC_ZDJECIA,
		MAKS_DLUZSZY_BOK,
		MAKS_PLIKU,
		TYPY_ZDJECIA,
		TYP_OKLADKI
	} from '$lib/zdjecia';

	let {
		id,
		legenda,
		podpowiedz,
		altEtykieta,
		altPodpowiedz,
		proporcja,
		komunikatGotowe,
		nazwaZdjecia,
		nazwaUsuniecia,
		nazwaObrazu,
		nazwaAltu,
		obraz = '',
		usunieto = false,
		zdjecie = '',
		alt = '',
		blad,
		bladAltu
	}: {
		id: string;
		legenda: string;
		podpowiedz: string;
		altEtykieta: string;
		altPodpowiedz: string;
		/** Width divided by height. 16 / 9 for an aktualność cover, 4 / 3 for an o nas
		 *  facility photo, both from src/lib/zdjecia.ts. */
		proporcja: number;
		/** „Zdjęcie gotowe..." for THIS ratio: the sentence names the ratio out loud, so it
		 *  cannot be shared between the two callers. */
		komunikatGotowe: string;
		nazwaZdjecia: string;
		nazwaUsuniecia: string;
		nazwaObrazu: string;
		nazwaAltu: string;
		/** The cover the entry already has, as a bare basename (P-20). */
		obraz?: string;
		/** Echoed back after a refused save on which the editor had removed the photo. */
		usunieto?: boolean;
		/** A prepared data URL echoed back after a refused save, so a title that was too
		 *  long does not also cost the editor the photo they had chosen. */
		zdjecie?: string;
		alt?: string;
		/** Server-side refusals for the photo and for its description. */
		blad?: string;
		bladAltu?: string;
	} = $props();

	// WRITABLE $derived, never `$state` seeded from a prop. The server is the source of
	// truth and a refused submission is the values it hands back; a plain `$state(...)`
	// captures only the FIRST render and ignores every later server answer, which is exactly
	// the defect 04.1-05 hit on the nabór radios.
	let zdjecieBiezace = $derived(zdjecie);
	let usunieteBiezace = $derived(usunieto);
	let bladKlienta: string | undefined = $state(undefined);
	let status = $state('');

	// Element references are reactive state, following the discipline the site's other
	// island established: a plain variable would not re-run the effect that moves focus.
	let polePliku: HTMLInputElement | undefined = $state();
	/** Bumped by the two buttons to ask for focus. The move happens in an effect rather
	 *  than inside the handler because „Usuń zdjęcie" unmounts the very button being
	 *  pressed, and focus has to land after the DOM has settled or it falls to the body.
	 *  There is nothing to undo when the effect re-runs, so it has no cleanup: the other
	 *  island needs one because it takes over the page scroll, and this one takes over
	 *  nothing. */
	let zadanieFokusu = $state(0);

	$effect(() => {
		if (zadanieFokusu === 0) return;
		polePliku?.focus();
	});

	// The same by-name map the three public consumers build, so an entry that already has a
	// cover shows the real picture rather than a guess at its address. Only the fallback
	// source is taken: this is a preview inside a form, not a responsive page image, so the
	// full source set would be bytes nobody looks at.
	const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
	const wedlugNazwy: Record<string, Picture> = {};
	for (const [sciezka, modul] of Object.entries(uploads)) {
		const nazwa = sciezka.split('/').pop();
		if (nazwa) wedlugNazwy[nazwa] = modul;
	}

	const zrodloIstniejace = $derived(
		obraz && !usunieteBiezace ? wedlugNazwy[obraz.split('/').pop() ?? obraz]?.img.src : undefined
	);
	/** What the preview shows: the photo prepared on this visit if there is one, otherwise
	 *  the cover already published. */
	const zrodloPodgladu = $derived(zdjecieBiezace || zrodloIstniejace);
	const jestZdjecie = $derived(Boolean(zrodloPodgladu));

	const idPola = $derived(`${id}-plik`);
	const idPodpowiedzi = $derived(`${id}-hint`);
	const idBledu = $derived(`${id}-err`);
	const komunikatBledu = $derived(bladKlienta ?? blad);
	const opisy = $derived(
		[idPodpowiedzi, komunikatBledu ? idBledu : null].filter(Boolean).join(' ') || undefined
	);

	/**
	 * Decode, crop from the centre, scale down, re-encode (D-12, D-13).
	 *
	 * The orientation option is passed EXPLICITLY rather than left to its default, because
	 * that default changed during the specification's life and older engines chose the other
	 * way: with it, the decoder applies the rotation a phone records in the file, and it is
	 * applied exactly once. Without it, a portrait photo from a phone publishes on its side,
	 * or gets turned twice.
	 *
	 * Returns null on any failure, so the caller renders the same Polish field error the
	 * server would rather than anything the browser would put in a dialog of its own.
	 */
	async function przygotuj(plik: File): Promise<string | null> {
		try {
			const bitmapa = await createImageBitmap(plik, { imageOrientation: 'from-image' });

			// Centred crop to the target ratio: the wider dimension is trimmed on both sides.
			let sw = bitmapa.width;
			let sh = bitmapa.height;
			let sx = 0;
			let sy = 0;
			if (bitmapa.width / bitmapa.height > proporcja) {
				sw = Math.round(bitmapa.height * proporcja);
				sx = Math.round((bitmapa.width - sw) / 2);
			} else {
				sh = Math.round(bitmapa.width / proporcja);
				sy = Math.round((bitmapa.height - sh) / 2);
			}

			let dw = sw;
			let dh = sh;
			if (Math.max(dw, dh) > MAKS_DLUZSZY_BOK) {
				const skala = MAKS_DLUZSZY_BOK / Math.max(dw, dh);
				dw = Math.max(1, Math.round(dw * skala));
				dh = Math.max(1, Math.round(dh * skala));
			}

			const rysuj = (kontekst: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
				kontekst.drawImage(bitmapa, sx, sy, sw, sh, 0, 0, dw, dh);
			};

			const blob = await doBloba(dw, dh, rysuj);
			bitmapa.close();
			if (blob === null) return null;

			return await new Promise<string | null>((rozwiaz) => {
				const czytnik = new FileReader();
				czytnik.onload = () => rozwiaz(typeof czytnik.result === 'string' ? czytnik.result : null);
				czytnik.onerror = () => rozwiaz(null);
				czytnik.readAsDataURL(blob);
			});
		} catch {
			return null;
		}
	}

	/** Draw on the off-screen surface where the engine has one, and on a canvas element
	 *  otherwise: turning a canvas element into a blob is supported more widely than the
	 *  off-screen equivalent, so the fallback is the one that must always work. */
	async function doBloba(
		dw: number,
		dh: number,
		rysuj: (kontekst: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void
	): Promise<Blob | null> {
		if (typeof OffscreenCanvas !== 'undefined') {
			const plotno = new OffscreenCanvas(dw, dh);
			const kontekst = plotno.getContext('2d');
			if (kontekst === null) return null;
			rysuj(kontekst);
			return await plotno.convertToBlob({ type: TYP_OKLADKI, quality: JAKOSC_ZDJECIA });
		}
		const plotno = document.createElement('canvas');
		plotno.width = dw;
		plotno.height = dh;
		const kontekst = plotno.getContext('2d');
		if (kontekst === null) return null;
		rysuj(kontekst);
		return await new Promise<Blob | null>((rozwiaz) => {
			plotno.toBlob((wynik) => rozwiaz(wynik), TYP_OKLADKI, JAKOSC_ZDJECIA);
		});
	}

	async function wybrano(event: Event & { currentTarget: HTMLInputElement }) {
		const plik = event.currentTarget.files?.[0];
		if (!plik) return;

		// Client-side refusals wear the SAME field-error treatment a server refusal does,
		// never a dialog the browser draws in its own language and its own style.
		bladKlienta = undefined;
		if (!TYPY_ZDJECIA.includes(plik.type)) {
			status = '';
			bladKlienta = KOPIA_WALIDACJA.zdjecieZlyTyp;
			return;
		}
		if (plik.size > MAKS_PLIKU) {
			status = '';
			bladKlienta = KOPIA_WALIDACJA.zdjecieZaDuze;
			return;
		}

		status = KOPIA_ZDJECIA.przygotowywanie;
		const wynik = await przygotuj(plik);
		if (wynik === null) {
			status = '';
			bladKlienta = KOPIA_WALIDACJA.zdjecieZlyTyp;
			return;
		}
		zdjecieBiezace = wynik;
		// Choosing a file after pressing „Usuń zdjęcie" is an editor changing their mind, so
		// the removal is taken back here as well as on the server.
		usunieteBiezace = false;
		status = komunikatGotowe;
	}

	/** Neither button commits anything: nothing reaches the repository until „Zapisz". */
	function wybierzInne() {
		zadanieFokusu += 1;
	}

	function usunZdjecie() {
		zdjecieBiezace = '';
		usunieteBiezace = true;
		bladKlienta = undefined;
		status = KOPIA_ZDJECIA.usunieto;
		// The control keeps the name of the file it last read, and without this the editor
		// could not choose the SAME photo again after removing it.
		if (polePliku) polePliku.value = '';
		zadanieFokusu += 1;
	}
</script>

<fieldset class="grupa">
	<legend class="legenda">{legenda}</legend>

	<!-- The cover the entry already has, its removal, and the photo prepared on this visit.
	     All three are read on the server, which is what makes the alt rule survive scripting
	     being switched off. -->
	<input type="hidden" name={nazwaObrazu} value={obraz} />
	<input type="hidden" name={nazwaUsuniecia} value={usunieteBiezace ? '1' : ''} />
	<input type="hidden" name={nazwaZdjecia} value={zdjecieBiezace} />

	<div class="pole">
		<label class="etykieta" for={idPola}>{KOPIA_ZDJECIA.wybierzEtykieta}</label>
		<p id={idPodpowiedzi} class="podpowiedz">{podpowiedz}</p>
		<input
			bind:this={polePliku}
			id={idPola}
			class="plik"
			type="file"
			accept={TYPY_ZDJECIA.join(',')}
			aria-invalid={komunikatBledu ? 'true' : undefined}
			aria-describedby={opisy}
			onchange={wybrano}
		/>
		{#if komunikatBledu}
			<p id={idBledu} class="blad">
				<CircleAlert class="blad-ikona" size={18} aria-hidden="true" focusable="false" />
				<span>{komunikatBledu}</span>
			</p>
		{/if}
	</div>

	<!-- The only progress indicator there is. Present from the first render so the region
	     exists before its text changes, polite so it never interrupts. -->
	<p class="status" role="status" aria-live="polite">{status}</p>

	{#if jestZdjecie}
		<div class="podglad-blok">
			<!-- The box reserves the target ratio before anything paints, so nothing below it
			     shifts when the picture arrives. -->
			<div class="podglad" style="--proporcja: {proporcja}">
				<!-- No accessible name on purpose: the caption underneath says what this is, and
				     the field directly below it is where the editor is writing the description.
				     Echoing a half-typed sentence into this element would announce nonsense. -->
				<img src={zrodloPodgladu} alt="" />
			</div>
			<p class="podpis">{KOPIA_ZDJECIA.podpisPodgladu}</p>

			<div class="akcje">
				<Przycisk wariant="secondary" typ="button" onNacisnij={wybierzInne}>
					{KOPIA_ZDJECIA.wybierzInne}
				</Przycisk>
				<Przycisk wariant="secondary" typ="button" onNacisnij={usunZdjecie}>
					<span class="etykieta-usun">{KOPIA_ZDJECIA.usun}</span>
				</Przycisk>
			</div>
		</div>

		<FormField
			id="{id}-alt"
			nazwa={nazwaAltu}
			etykieta={altEtykieta}
			podpowiedz={altPodpowiedz}
			wartosc={alt}
			blad={bladAltu}
			wymagane
		/>
	{/if}

	<noscript>
		<div class="bez-skryptow">
			<Info class="bez-skryptow-ikona" size={22} aria-hidden="true" focusable="false" />
			<p>{KOPIA_ZDJECIA.bezSkryptow}</p>
		</div>
	</noscript>
</fieldset>

<style>
	/* A surface card inside the form card, 16px padding rising to 24px at md, matching the
	   panel density steps every other group on this screen uses. */
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

	.legenda {
		padding: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.pole {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.etykieta {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
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

	/* The control itself is left to the platform. Only the text around it is sized, and the
	   focus ring is the global one: it is never replaced here, which is the whole reason the
	   native control was kept. */
	.plik {
		max-width: 100%;
		padding: 8px 0;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-ink);
	}

	/* Icon plus instruction, never colour alone (WCAG 1.4.1). */
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

	/* Reserved height even while empty, so the block below does not jump the first time a
	   sentence appears in it. */
	.status {
		min-height: 1.5em;
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-ink);
	}

	.podglad-blok {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	/* The box holds the target ratio before the picture paints, so nothing shifts. */
	.podglad {
		width: 100%;
		max-width: 32rem;
		aspect-ratio: var(--proporcja);
		overflow: hidden;
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		background: var(--color-surface-warm);
	}

	.podglad img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.podpis {
		margin: 0;
		max-width: 32rem;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	.akcje {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 8px;
	}

	/* The removal action carries the danger colour on its LABEL only: the button keeps the
	   secondary treatment, because nothing here deletes anything from the site. */
	.etykieta-usun {
		color: var(--color-danger);
	}

	/* Same treatment as the info panel of Component Contract 10, drawn here rather than
	   composed from that component, because this block lives inside a no-scripting element
	   and a panel whose whole job is to move focus has nothing to do in one. Checked against
	   the compiler rather than assumed, because it is the obvious place to be wrong: Svelte
	   renders the contents of that element on the SERVER and emits it EMPTY on the client, so
	   the markup below reaches a browser with scripting off and is never walked during
	   hydration. Interpolating the Polish sentence into it is therefore safe. */
	.bez-skryptow {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		box-sizing: border-box;
		max-width: 46rem;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--color-tint-blue);
		color: var(--color-ink);
	}

	.bez-skryptow p {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
	}

	.bez-skryptow :global(.bez-skryptow-ikona) {
		flex: none;
		margin-top: 2px;
		color: var(--color-brand-blue);
	}
</style>
