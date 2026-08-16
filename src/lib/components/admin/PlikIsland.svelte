<script lang="ts">
	// The document file field, and the phase's SECOND hydrated component (04.1 P-22, D-17;
	// 04.1-UI-SPEC Component Contracts 5 and 8).
	//
	// P-22, THE RECORDED DEVIATION, STATED IN FULL BECAUSE IT IS A DECISION AND NOT A DEFECT.
	// The UI-SPEC route table marks the dokument screens „none required" for JavaScript, and
	// Component Contract 8 calls the photo island the only hydrated component in the phase.
	// That is not achievable for THIS field. A document may be ten megabytes, and turning ten
	// megabytes into its textual form inside the request would consume many times the roughly
	// ten milliseconds of processor time a Cloudflare Worker gets on the free plan. It is real
	// work on the processor rather than waiting on I/O, so the runtime cannot overlap it with
	// anything. The whole argument D-12 made for moving image encoding into the browser
	// applies here with MORE force, not less, because the payload is twenty five times larger.
	//
	// WHAT THAT COSTS, EXACTLY, so the phase's SC2 and D-17 review can weigh it: ATTACHING A
	// FILE needs JavaScript. Nothing else does. The name, the category, the version date, the
	// BIP address and the placeholder flag are ordinary server-rendered controls, the form is
	// an ordinary POST, and an existing document's metadata can be corrected and saved with
	// scripting switched off, keeping the file it already has. The no-script panel below says
	// exactly that, in those words, rather than only announcing a limitation.
	//
	// WHAT THIS COMPONENT DELIBERATELY DOES NOT DO, and this is what makes it smaller than the
	// photo island rather than a copy of it: it does not decode anything, it does not draw on
	// an off-screen surface, it does not crop, it does not re-encode and it shows no preview.
	// The browser's own reader produces the textual form and the server forwards it untouched.
	// There is nothing to look at, because a document is not something a form can usefully
	// show, so the file's NAME and SIZE are what the editor gets instead. The four APIs that
	// rule bans are described rather than named, because the acceptance gate for this file is
	// a literal grep and a comment naming them would make it permanently red: the same wording
	// problem 04-02, 04.1-02, 04.1-03 and 04.1-06 each had to solve this way.
	//
	// NOTHING HERE MOVES. No spinner, no progress bar, no fade, no skeleton, and therefore
	// nothing to neutralise under a reduced motion preference: the status sentence IS the
	// progress indicator. That is a decision rather than an omission, because a spinner is the
	// easiest reduced-motion violation to ship by accident.
	//
	// THE FILE-TO-DATA-URL READ IS DUPLICATED FROM ZdjecieIsland RATHER THAN SHARED, and that
	// is deliberate: the two islands answer to different contracts, different limits and
	// different copy, and a shared helper would make one of them the other's dependency for
	// four lines. Same reasoning the repeated basename idiom in src/lib/server/admin already
	// carries: two things that merely look alike are not one thing.
	//
	// THE FILE INPUT STAYS NATIVE, with the same accepted consequence the photo island
	// records: the browse button inside the control and the operating system picker render in
	// the browser and system locale, so on an English-locale machine an editor can see „Choose
	// File" there. Every replacement is worse for keyboard and screen-reader users, and
	// everything this component itself renders stays Polish.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed here.
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Info from '@lucide/svelte/icons/info';
	import Przycisk from '$lib/components/admin/Przycisk.svelte';
	import { KOPIA_PLIKU, KOPIA_WALIDACJA, obecnyPlik, wybranyPlik } from '$lib/content/panel';
	import { MAKS_PLIKU_DOKUMENTU, TYPY_DOKUMENTU, rozmiarCzytelny } from '$lib/pliki';

	let {
		id,
		legenda,
		podpowiedz,
		nazwaPliku,
		nazwaNazwyPliku,
		nazwaRozmiaruPliku,
		obecny,
		plik = '',
		plikNazwa = '',
		plikRozmiar = '',
		blad
	}: {
		id: string;
		legenda: string;
		podpowiedz: string;
		/** Control names, from src/lib/pola-dokumentu.ts: the one place the client and the
		 *  action agree about them. */
		nazwaPliku: string;
		nazwaNazwyPliku: string;
		nazwaRozmiaruPliku: string;
		/** What the document already has attached, on the edit screen only. Rendered as text
		 *  directly under the legend, so an editor knows what is there before deciding whether
		 *  to replace it. */
		obecny?: string;
		/** A prepared data URL echoed back after a refused save, so a name collision does not
		 *  also cost the editor the file they had already chosen. */
		plik?: string;
		plikNazwa?: string;
		plikRozmiar?: string;
		/** The server's refusal for this field. */
		blad?: string;
	} = $props();

	// WRITABLE $derived, never `$state` seeded from a prop. The server is the source of truth
	// and a refused submission is the values it hands back; a plain `$state(...)` captures only
	// the FIRST render and ignores every later server answer, which is exactly the defect
	// 04.1-05 hit on the nabór radios.
	let plikBiezacy = $derived(plik);
	let nazwaBiezaca = $derived(plikNazwa);
	let rozmiarBiezacy = $derived(plikRozmiar);
	let bladKlienta: string | undefined = $state(undefined);
	let status = $state('');

	// Element references are reactive state, following the discipline the site's islands
	// established: a plain variable would not re-run the effect that moves focus.
	let polePliku: HTMLInputElement | undefined = $state();
	/** Bumped by the remove button to ask for focus. The move happens in an effect rather than
	 *  inside the handler because the button unmounts itself when pressed, and focus has to
	 *  land after the DOM has settled or it falls to the body. There is nothing to undo when
	 *  the effect re-runs, so it has no cleanup: this component takes over nothing. */
	let zadanieFokusu = $state(0);

	$effect(() => {
		if (zadanieFokusu === 0) return;
		polePliku?.focus();
	});

	const idPola = $derived(`${id}-pole`);
	const idPodpowiedzi = $derived(`${id}-hint`);
	const idBledu = $derived(`${id}-err`);
	const komunikatBledu = $derived(bladKlienta ?? blad);
	const opisy = $derived(
		[idPodpowiedzi, komunikatBledu ? idBledu : null].filter(Boolean).join(' ') || undefined
	);
	const jestWybrany = $derived(plikBiezacy.length > 0);

	/** Read the chosen file into a data URL. Returns null on any failure, so the caller renders
	 *  the same Polish field error the server would rather than anything the browser would put
	 *  in a dialog of its own. */
	async function doDataUrl(wybrany: File): Promise<string | null> {
		return await new Promise<string | null>((rozwiaz) => {
			const czytnik = new FileReader();
			czytnik.onload = () => rozwiaz(typeof czytnik.result === 'string' ? czytnik.result : null);
			czytnik.onerror = () => rozwiaz(null);
			czytnik.readAsDataURL(wybrany);
		});
	}

	async function wybrano(event: Event & { currentTarget: HTMLInputElement }) {
		const wybrany = event.currentTarget.files?.[0];
		if (!wybrany) return;

		// Client-side refusals wear the SAME field-error treatment a server refusal does, never
		// a dialog the browser draws in its own language and its own style.
		bladKlienta = undefined;

		// THE TYPE IS THE BROWSER'S, NEVER GUESSED FROM THE EXTENSION. Inferring it from the
		// filename would let the person choosing the file choose the media type the site later
		// serves it as, which is precisely threat T-04.1-32. A file whose type the operating
		// system does not report is therefore refused with a Polish instruction rather than
		// quietly relabelled, which is the safe direction to be wrong in.
		if (!TYPY_DOKUMENTU.includes(wybrany.type)) {
			status = '';
			bladKlienta = KOPIA_WALIDACJA.plikZlyTyp;
			return;
		}
		if (wybrany.size > MAKS_PLIKU_DOKUMENTU) {
			status = '';
			bladKlienta = KOPIA_WALIDACJA.plikZaDuzy;
			return;
		}

		status = KOPIA_PLIKU.przygotowywanie;
		const wynik = await doDataUrl(wybrany);
		if (wynik === null) {
			status = '';
			bladKlienta = KOPIA_WALIDACJA.plikZlyTyp;
			return;
		}
		plikBiezacy = wynik;
		nazwaBiezaca = wybrany.name;
		rozmiarBiezacy = rozmiarCzytelny(wybrany.size);
		status = KOPIA_PLIKU.gotowe;
	}

	/** Clears the PENDING selection only. Nothing reaches the repository until „Zapisz", and a
	 *  document that already has a file keeps it: this control cannot detach one, because a
	 *  document with no file is an entry the website refuses to publish. */
	function usunWybrany() {
		plikBiezacy = '';
		nazwaBiezaca = '';
		rozmiarBiezacy = '';
		bladKlienta = undefined;
		status = KOPIA_PLIKU.usunieto;
		// The control keeps the name of the file it last read, and without this the editor could
		// not choose the SAME file again after removing it.
		if (polePliku) polePliku.value = '';
		zadanieFokusu += 1;
	}
</script>

<fieldset class="grupa">
	<legend class="legenda">{legenda}</legend>

	{#if obecny}
		<p class="obecny">{obecnyPlik(obecny)}</p>
	{/if}

	<!-- The prepared file and the two display values, all read on the server. -->
	<input type="hidden" name={nazwaPliku} value={plikBiezacy} />
	<input type="hidden" name={nazwaNazwyPliku} value={nazwaBiezaca} />
	<input type="hidden" name={nazwaRozmiaruPliku} value={rozmiarBiezacy} />

	<div class="pole">
		<label class="etykieta" for={idPola}>{KOPIA_PLIKU.wybierzEtykieta}</label>
		<p id={idPodpowiedzi} class="podpowiedz">{podpowiedz}</p>
		<input
			bind:this={polePliku}
			id={idPola}
			class="plik"
			type="file"
			accept={TYPY_DOKUMENTU.join(',')}
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

	{#if jestWybrany}
		<div class="wybrany">
			<p class="nazwa">{wybranyPlik(nazwaBiezaca, rozmiarBiezacy)}</p>
			<div class="akcje">
				<Przycisk wariant="secondary" typ="button" onNacisnij={usunWybrany}>
					<span class="etykieta-usun">{KOPIA_PLIKU.usun}</span>
				</Przycisk>
			</div>
		</div>
	{/if}

	<noscript>
		<div class="bez-skryptow">
			<Info class="bez-skryptow-ikona" size={22} aria-hidden="true" focusable="false" />
			<p>{KOPIA_PLIKU.bezSkryptow}</p>
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

	/* What is attached today. Ink rather than muted: it is a fact about the document, not a
	   hint about the control. */
	.obecny {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
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

	.wybrany {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.nazwa {
		margin: 0;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 700;
		line-height: 1.5;
		color: var(--color-ink);
		overflow-wrap: anywhere;
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
	   composed from that component, because this block lives inside a no-scripting element and
	   a panel whose whole job is to move focus has nothing to do in one. Svelte renders the
	   contents of that element on the SERVER and emits it EMPTY on the client, so the markup
	   below reaches a browser with scripting off and is never walked during hydration; that was
	   checked against the compiler in Plan 04.1-07 rather than assumed. */
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
