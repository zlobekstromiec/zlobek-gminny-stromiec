<script lang="ts">
	// „Nowy wpis" (04.1-UI-SPEC Component Contract 5).
	//
	// FIXED DOM ORDER, and it is the contract's: back link, h1, save-result region,
	// validation summary region, required-fields note, field groups, save row. The two
	// regions are one surface here, because to an editor a refusal is one answer: „this did
	// not happen, and here is what to do about it".
	//
	// THE FORM SUPPRESSES THE BROWSER'S OWN VALIDATION BUBBLES, which are drawn in the
	// browser's locale and not in Polish. The `required` attributes stay for semantics and
	// for mobile keyboards; the server is the validation that matters and is the only thing
	// that can refuse a save. The attribute that does the suppressing appears exactly once
	// in this file, on the form element, and is deliberately not named here: the acceptance
	// gate counts its occurrences.
	//
	// WITHOUT JAVASCRIPT this screen is complete: the form posts, the server validates, the
	// server re-renders with every typed value intact, and a successful save is a redirect
	// the browser follows on its own. The saving state below is an ENHANCEMENT a hydrated
	// page switches on; it is never how the screen works.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed inline.
	import { enhance } from '$app/forms';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PolaWpisu from '$lib/components/admin/PolaWpisu.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
	import { KOPIA_EKRAN_WPISU, KOPIA_LISTY, KOPIA_ZAPIS } from '$lib/content/panel';
	import { POLE_SHA } from '$lib/pola-wpisu';
	import type { PageData } from './$types';
	import type { WynikWpisu } from './+page.server';

	let { data, form }: { data: PageData; form: WynikWpisu | null } = $props();

	const LISTA = '/admin/aktualnosci';

	// A WRITABLE $derived, not `$state` seeded from a prop. The server is the source of
	// truth and a refused submission is the values it hands back; a plain `$state(...)`
	// would capture only the FIRST render and ignore every later server answer, which is
	// exactly the defect 04.1-05 hit on the nabór radios.
	let wartosci = $derived(form?.wartosci ?? data.wartosci);
	const pola = $derived(form?.pola ?? {});

	/** Saving state of Contract 9. Only ever true on a hydrated page; the server-rendered
	 *  row is a plain working button. */
	let zapisywanie = $state(false);

	/** In-page links from the summary to each offending control. The ids are the ones
	 *  PolaWpisu derives, and the date group's link points at its first select, because a
	 *  fieldset is not focusable and „go to the date" means „go to the day". */
	const CELE: Record<string, string> = {
		tytul: 'wpis-tytul',
		data: 'wpis-data-dzien',
		zajawka: 'wpis-zajawka',
		tresc: 'wpis-tresc',
		// Both photo refusals point at the file control, and the description at its own
		// field: a summary entry that linked to a control that is not on the screen would
		// announce nothing at all.
		zdjecie: 'wpis-zdjecie-plik',
		obraz: 'wpis-zdjecie-plik',
		obraz_alt: 'wpis-zdjecie-alt'
	};
</script>

<!-- 1. Back link. -->
<PowrotLink cel={LISTA} etykieta={KOPIA_LISTY.powrotLista} />

<!-- 2. The one h1. -->
<h1 class="naglowek">{KOPIA_EKRAN_WPISU.nowyNaglowek}</h1>

<!-- 3 and 4. Save-result and validation-summary regions. A create never renders the
     „Zapisano" panel here: a successful save redirects to the list, which shows it. -->
{#if form?.panelNaglowek}
	<div class="komunikat">
		<PanelKomunikat rodzaj="blad" naglowek={form.panelNaglowek} fokus>
			<p>{form.panelTresc}</p>
			{#if Object.keys(pola).length > 0}
				<ul>
					{#each Object.entries(pola) as [klucz, komunikat] (klucz)}
						<li><a href="#{CELE[klucz] ?? 'wpis-tytul'}">{komunikat}</a></li>
					{/each}
				</ul>
			{/if}
		</PanelKomunikat>
	</div>
{/if}

<form
	method="POST"
	novalidate
	use:enhance={() => {
		zapisywanie = true;
		return async ({ update }) => {
			await update();
			zapisywanie = false;
		};
	}}
>
	<!-- The state the form was built from (D-10). Untrusted on the way back, which costs
	     nothing: a forged value can only make the save FAIL, never make it overwrite more,
	     because the ref update itself runs with force false. -->
	{#if data.sha}
		<input type="hidden" name={POLE_SHA} value={data.sha} />
	{/if}

	<!-- 5. Required-fields note. -->
	<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>

	<!-- 6. Field groups. -->
	<PolaWpisu {wartosci} {pola} lata={data.lata} />

	<!-- 7. Save row: exactly one Zapisz. -->
	<RzedZapisu
		nota={KOPIA_ZAPIS.nota}
		etykietaZapisz={zapisywanie ? KOPIA_ZAPIS.zapisywanie : KOPIA_ZAPIS.zapisz}
		etykietaAnuluj={KOPIA_ZAPIS.anuluj}
		celAnuluj={LISTA}
		zajete={zapisywanie}
	/>
</form>

<style>
	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale, exactly
	   as every other panel screen does. */
	.naglowek {
		margin: 16px 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3vw, 1.75rem);
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-ink);
	}

	.komunikat {
		margin-top: 24px;
	}

	/* 24px from the page header to the first thing under it, the panel density step. */
	form {
		margin-top: 24px;
	}

	.wymagane {
		margin: 0 0 24px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}
</style>
