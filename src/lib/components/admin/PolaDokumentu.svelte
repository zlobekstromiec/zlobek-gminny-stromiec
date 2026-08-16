<script lang="ts">
	// The field groups of a dokument, shared by the create screen and the edit screen
	// (04.1-UI-SPEC Component Contract 5).
	//
	// WHY SHARED, for the same reason PolaWpisu.svelte is: the two screens differ in the
	// heading, which panels they can render, where the form posts and where it redirects. The
	// FIELDS are the same, and they have to stay the same, because a create screen that offers
	// a field the edit screen forgets is how a value gets written once and then silently
	// dropped by the next save.
	//
	// FIELD ORDER IS FIXED and is the UI-SPEC's: nazwa, kategoria, plik, wersja, źródło w BIP,
	// then the placeholder checkbox last.
	//
	// THE CATEGORY OPTIONS ARRIVE AS A PROP rather than being built here, because their VALUES
	// come from the shared category union under src/lib and their LABELS from the copy module,
	// and pairing them is a decision that belongs to one place per screen rather than to a
	// component two screens share. Their explicit empty first option is the same word the date
	// selects use, drawn from the same export: the UI-SPEC names „Wybierz" for both, and one
	// declaration is what keeps them from drifting into two slightly different invitations.
	//
	// EVERY CONTROL CARRIES A `name`, because this form is read by a server-rendered action.
	// The one control that additionally needs scripting is the file field, and it says so
	// itself (P-22).
	//
	// The names come from src/lib/pola-dokumentu.ts, the one place the client and the action
	// agree about them, and the labels and hints come from src/lib/content/panel.ts. Not one
	// string is typed here.
	import FormField from '$lib/components/FormField.svelte';
	import PlikIsland from './PlikIsland.svelte';
	import PoleDaty from './PoleDaty.svelte';
	import PolePlaceholder from './PolePlaceholder.svelte';
	import PoleWyboru from './PoleWyboru.svelte';
	import { POLA_DATA, POLA_DOKUMENT } from '$lib/content/panel';
	import {
		POLE_DZIEN,
		POLE_KATEGORIA,
		POLE_MIESIAC,
		POLE_NAZWA,
		POLE_PLIK,
		POLE_PLIK_NAZWA,
		POLE_PLIK_ROZMIAR,
		POLE_ROK,
		POLE_WERSJA,
		POLE_ZASTEPCZA,
		POLE_ZRODLO,
		type WartosciDokumentu
	} from '$lib/pola-dokumentu';

	let {
		wartosci,
		pola = {},
		lata,
		kategorie,
		obecnyPlikOpis
	}: {
		/** Every submitted or stored value, echoed back verbatim. Contract 10c: a refusal never
		 *  costs the editor their typing, and here it must not cost them the attachment either. */
		wartosci: WartosciDokumentu;
		/** Field errors keyed by the control names above. Empty on a clean screen. */
		pola?: Record<string, string>;
		lata: readonly number[];
		kategorie: readonly { wartosc: string; etykieta: string }[];
		/** What the document already has attached, on the edit screen only. */
		obecnyPlikOpis?: string;
	} = $props();

	/** The id every control derives its own from. */
	const ID = 'dokument';
</script>

<div class="karta">
	<FormField
		id="{ID}-nazwa"
		nazwa={POLE_NAZWA}
		etykieta={POLA_DOKUMENT.nazwaEtykieta}
		podpowiedz={POLA_DOKUMENT.nazwaPodpowiedz}
		wartosc={wartosci.nazwa}
		blad={pola[POLE_NAZWA]}
		wymagane
	/>

	<PoleWyboru
		id="{ID}-kategoria"
		nazwa={POLE_KATEGORIA}
		etykieta={POLA_DOKUMENT.kategoriaEtykieta}
		podpowiedz={POLA_DOKUMENT.kategoriaPodpowiedz}
		opcje={kategorie}
		etykietaPusta={POLA_DATA.pusty}
		wybrana={wartosci.kategoria}
		blad={pola[POLE_KATEGORIA]}
		wymagane
	/>

	<!-- The file group. It is the one thing on this screen that needs JavaScript (P-22), it
	     says so itself in its own no-script panel, and every other field on the screen keeps
	     working with scripting off. -->
	<PlikIsland
		id="{ID}-plik"
		legenda={POLA_DOKUMENT.plikEtykieta}
		podpowiedz={POLA_DOKUMENT.plikPodpowiedz}
		nazwaPliku={POLE_PLIK}
		nazwaNazwyPliku={POLE_PLIK_NAZWA}
		nazwaRozmiaruPliku={POLE_PLIK_ROZMIAR}
		obecny={obecnyPlikOpis}
		plik={wartosci.plik}
		plikNazwa={wartosci.plikNazwa}
		plikRozmiar={wartosci.plikRozmiar}
		blad={pola[POLE_PLIK]}
	/>

	<PoleDaty
		id="{ID}-wersja"
		legenda={POLA_DOKUMENT.wersjaLegenda}
		podpowiedz={POLA_DOKUMENT.wersjaPodpowiedz}
		nazwaDnia={POLE_DZIEN}
		nazwaMiesiaca={POLE_MIESIAC}
		nazwaRoku={POLE_ROK}
		{lata}
		dzien={wartosci.dzien}
		miesiac={wartosci.miesiac}
		rok={wartosci.rok}
		blad={pola[POLE_WERSJA]}
	/>

	<FormField
		id="{ID}-zrodlo"
		nazwa={POLE_ZRODLO}
		etykieta={POLA_DOKUMENT.zrodloEtykieta}
		podpowiedz={POLA_DOKUMENT.zrodloPodpowiedz}
		wartosc={wartosci.zrodlo}
		blad={pola[POLE_ZRODLO]}
	/>

	<PolePlaceholder
		id="{ID}-zastepcza"
		nazwa={POLE_ZASTEPCZA}
		etykieta={POLA_DOKUMENT.zastepczaEtykieta}
		podpowiedz={POLA_DOKUMENT.zastepczaPodpowiedz}
		zaznaczone={wartosci.zastepcza}
	/>
</div>

<style>
	/* One surface card, 24px between field blocks, 16px padding rising to 24px at md: the
	   panel density steps. */
	.karta {
		display: flex;
		flex-direction: column;
		gap: 24px;
		box-sizing: border-box;
		padding: 16px;
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	@media (min-width: 768px) {
		.karta {
			padding: 24px;
		}
	}
</style>
