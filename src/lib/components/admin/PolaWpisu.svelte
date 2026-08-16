<script lang="ts">
	// The field groups of an aktualność, shared by the create screen and the edit screen
	// (04.1-UI-SPEC Component Contract 5).
	//
	// WHY SHARED. The two screens differ in exactly four things: the heading, which panels
	// they can render, where the form posts and where it redirects. The FIELDS are the
	// same, and they have to stay the same: a create screen that offers a field the edit
	// screen forgets is how a value gets written once and then silently dropped by the next
	// save. Two copies of this markup would be two chances to let that happen. The form
	// element itself, its `novalidate`, its hidden SHA and its save row stay on each page,
	// because those are the parts that genuinely differ or that a per-screen gate checks.
	//
	// FIELD ORDER IS FIXED and is the UI-SPEC's: tytuł, data, zajawka, treść with its
	// formatting help, then the placeholder checkbox last. The photo group of Plan 07 has a
	// commented insertion point below rather than a stub control, because a control that
	// looks real and does nothing is worse than one that is honestly absent.
	//
	// EVERY CONTROL CARRIES A `name`, because this form is read by a server-rendered action
	// and nothing on this page is required to run for that to work (D-17).
	//
	// The names come from src/lib/pola-wpisu.ts, the one place the client and the action
	// agree about them, and the labels and hints come from src/lib/content/panel.ts. Not
	// one string is typed here.
	import FormField from '$lib/components/FormField.svelte';
	import PoleDaty from './PoleDaty.svelte';
	import PolePlaceholder from './PolePlaceholder.svelte';
	import PomocFormatowania from './PomocFormatowania.svelte';
	import { POLA_WPIS } from '$lib/content/panel';
	import {
		POLE_DATA,
		POLE_DZIEN,
		POLE_MIESIAC,
		POLE_ROK,
		POLE_TRESC,
		POLE_TYTUL,
		POLE_ZAJAWKA,
		POLE_ZASTEPCZA,
		type WartosciWpisu
	} from '$lib/pola-wpisu';

	let {
		wartosci,
		pola = {},
		lata
	}: {
		/** Every submitted or stored value, echoed back verbatim. Contract 10c: a refusal
		 *  never costs the editor their typing. */
		wartosci: WartosciWpisu;
		/** Field errors keyed by the control names above. Empty on a clean screen. */
		pola?: Record<string, string>;
		lata: readonly number[];
	} = $props();

	/** The id every control derives its own from, so two of these could coexist on one page
	 *  without colliding if a later screen ever needed that. */
	const ID = 'wpis';
</script>

<div class="karta">
	<FormField
		id="{ID}-tytul"
		nazwa={POLE_TYTUL}
		etykieta={POLA_WPIS.tytulEtykieta}
		podpowiedz={POLA_WPIS.tytulPodpowiedz}
		wartosc={wartosci.tytul}
		blad={pola[POLE_TYTUL]}
		wymagane
	/>

	<PoleDaty
		id="{ID}-data"
		legenda={POLA_WPIS.dataLegenda}
		podpowiedz={POLA_WPIS.dataPodpowiedz}
		nazwaDnia={POLE_DZIEN}
		nazwaMiesiaca={POLE_MIESIAC}
		nazwaRoku={POLE_ROK}
		{lata}
		dzien={wartosci.dzien}
		miesiac={wartosci.miesiac}
		rok={wartosci.rok}
		blad={pola[POLE_DATA]}
	/>

	<FormField
		id="{ID}-zajawka"
		nazwa={POLE_ZAJAWKA}
		etykieta={POLA_WPIS.zajawkaEtykieta}
		podpowiedz={POLA_WPIS.zajawkaPodpowiedz}
		wartosc={wartosci.zajawka}
		blad={pola[POLE_ZAJAWKA]}
		wieloliniowy
	/>

	<div class="tresc">
		<FormField
			id="{ID}-tresc"
			nazwa={POLE_TRESC}
			etykieta={POLA_WPIS.trescEtykieta}
			podpowiedz={POLA_WPIS.trescPodpowiedz}
			wartosc={wartosci.tresc}
			blad={pola[POLE_TRESC]}
			wieloliniowy
			wysokoscMin={240}
			wymagane
		/>
		<PomocFormatowania />
	</div>

	<!-- PLAN 07 INSERTION POINT: the photo group (a fieldset with its own legend, the
	     native file input, the status line, the preview slot and the required alt field)
	     belongs HERE, between the body and the placeholder checkbox, per Contract 5. It is
	     deliberately absent rather than stubbed: a file control that accepted a photo and
	     then dropped it would be worse than no control at all. The server validator already
	     enforces the D-15 alt rule, so the rule exists before the control that triggers it. -->

	<PolePlaceholder
		id="{ID}-zastepcza"
		nazwa={POLE_ZASTEPCZA}
		etykieta={POLA_WPIS.zastepczaEtykieta}
		podpowiedz={POLA_WPIS.zastepczaPodpowiedz}
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

	/* The help sits 8px under the textarea it explains, so the two read as one block rather
	   than as a field and an unrelated disclosure. */
	.tresc {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
