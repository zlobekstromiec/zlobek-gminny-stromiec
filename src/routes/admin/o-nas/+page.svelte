<script lang="ts">
	// „O nas" (04.1-UI-SPEC Component Contracts 5, 6, 7 and 10; D-11, D-13, D-17).
	//
	// A TEXT-ONLY SCREEN SINCE PLAN 05-07. It used to be the largest editor in the panel and
	// the second mounting of the photo island; the żłobek's photographs, their alt text and
	// their ordering moved to /admin/galeria, which is the one screen that owns them now.
	// The facility DESCRIPTION stayed here, because it is prose about the building rather
	// than a picture of it.
	//
	// THE FIXED DOM ORDER OF CONTRACT 5: back link, h1, save-result region, validation
	// summary region, required-fields note, field groups, save row. Nothing is inserted
	// before either of the two regions that receive focus.
	//
	// FIELD GROUP ORDER: Wprowadzenie and Misja, Wartości, Kadra, O budynku, then the
	// placeholder checkbox last. The one repeated list is a fieldset with the legend the copy
	// contract names; the remaining cards have no legend, because the contract's O nas table
	// gives none for them and inventing one would put a heading in the panel that the copy
	// module never authored. That is the arrangement PolaWpisu.svelte already uses on the
	// aktualność screens.
	//
	// THE FORMATTING HELP SITS UNDER THE THREE FIELDS THAT REALLY ACCEPT FORMATTING, and
	// deliberately not under Wprowadzenie. src/routes/o-nas/+page.svelte renders misja,
	// kadra_opis and obiekt_opis through the sanitizing inline renderer and prints `lead` as
	// PLAIN TEXT, so a help panel under Wprowadzenie would promise an editor that two
	// asterisks make bold there and they would publish the asterisks.
	//
	// WITHOUT JAVASCRIPT EVERYTHING ON THIS SCREEN NOW WORKS. The one honest limitation it
	// used to carry, that choosing a picture needs scripting, left with the photo island;
	// /admin/galeria and the dokument screen still carry it and still say so in Polish.
	//
	// THE FORM RESET IS TURNED OFF ON PURPOSE. Both add and remove actions answer with a
	// SUCCESS result, and the enhanced default for a success is to call the form element's
	// own reset, which restores every control to the value the document was parsed with:
	// everything typed since the page loaded would vanish the moment an editor asked for
	// another row.
	//
	// Every visible string comes from src/lib/content/panel.ts. Not one is typed inline.
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import FormField from '$lib/components/FormField.svelte';
	import PanelKomunikat from '$lib/components/admin/PanelKomunikat.svelte';
	import PolePlaceholder from '$lib/components/admin/PolePlaceholder.svelte';
	import PomocFormatowania from '$lib/components/admin/PomocFormatowania.svelte';
	import PowrotLink from '$lib/components/admin/PowrotLink.svelte';
	import PowtarzalnaGrupa from '$lib/components/admin/PowtarzalnaGrupa.svelte';
	import RzedZapisu from '$lib/components/admin/RzedZapisu.svelte';
	import {
		KOPIA_EKRAN_O_NAS,
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		POLA_O_NAS,
		bladWElemencie,
		legendaOsoby,
		legendaWartosci,
		zobaczStrone
	} from '$lib/content/panel';
	// NOT from the validator beside the action: SvelteKit refuses to bundle $lib/server into
	// client code, and that refusal is correct.
	import {
		AKCJA_DODANIA_OSOBY,
		AKCJA_DODANIA_WARTOSCI,
		AKCJA_USUNIECIA_OSOBY,
		AKCJA_USUNIECIA_WARTOSCI,
		AKCJA_ZAPISU,
		POLE_INDEKSU,
		POLE_KADRY_OPIS,
		POLE_LEAD,
		POLE_MISJI,
		POLE_OBIEKTU_OPIS,
		POLE_OPISU,
		POLE_SHA,
		POLE_TYTULU,
		POLE_ZASTEPCZA,
		POLE_IMIENIA,
		POLE_ROLI,
		PREFIKS_KADRY,
		PREFIKS_WARTOSCI,
		idPola,
		nazwaPola
	} from '$lib/pola-strony';
	import type { PageData } from './$types';
	import type { WynikONasEkranu } from './+page.server';

	let { data, form }: { data: PageData; form: WynikONasEkranu | null } = $props();

	const PULPIT = '/admin';

	// A writable $derived, not `$state` seeded from a prop: the server is the source of truth
	// and every answer it gives, a refusal as much as an added row, is the values it hands
	// back.
	let wartosci = $derived(form?.wartosci ?? data.wartosci);
	const pola = $derived(form?.pola ?? {});
	const sha = $derived(form?.sha ?? data.sha);

	let zapisywanie = $state(false);

	interface WpisPodsumowania {
		cel: string;
		tekst: string;
	}

	/** The summary, in the order of the form, with every entry naming the item it will take
	 *  the editor to (WCAG 2.4.4: four identical „Uzupełnij tytuł i opis" links are one link
	 *  four times). Built by walking the fields rather than by parsing the error keys. */
	const podsumowanie: WpisPodsumowania[] = $derived.by(() => {
		const wpisy: WpisPodsumowania[] = [];
		const prosto = (nazwa: string, cel: string) => {
			if (pola[nazwa] !== undefined) wpisy.push({ cel, tekst: pola[nazwa] });
		};

		prosto(POLE_LEAD, 'o-nas-lead');
		prosto(POLE_MISJI, 'o-nas-misja');

		wartosci.wartosci.forEach((_, indeks) => {
			for (const pole of [POLE_TYTULU, POLE_OPISU]) {
				const komunikat = pola[nazwaPola(PREFIKS_WARTOSCI, indeks, pole)];
				if (komunikat === undefined) continue;
				wpisy.push({
					cel: idPola(PREFIKS_WARTOSCI, indeks, pole),
					tekst: bladWElemencie(legendaWartosci(indeks + 1), komunikat)
				});
			}
		});

		prosto(POLE_KADRY_OPIS, 'o-nas-kadra-opis');

		// The staff list, walked exactly like the wartości group above, so a refusal on
		// „Osoba 3" links to the control on Osoba 3 rather than to the top of the form.
		wartosci.kadra.forEach((_, indeks) => {
			for (const pole of [POLE_IMIENIA, POLE_ROLI]) {
				const komunikat = pola[nazwaPola(PREFIKS_KADRY, indeks, pole)];
				if (komunikat === undefined) continue;
				wpisy.push({
					cel: idPola(PREFIKS_KADRY, indeks, pole),
					tekst: bladWElemencie(legendaOsoby(indeks + 1), komunikat)
				});
			}
		});

		prosto(POLE_OBIEKTU_OPIS, 'o-nas-obiekt-opis');

		return wpisy;
	});
</script>

<!-- 1. Back link. „Wróć do pulpitu", because O nas is a singleton with no list. -->
<PowrotLink cel={PULPIT} etykieta={KOPIA_LISTY.powrotPulpit} />

<!-- 2. The one h1. -->
<h1 class="naglowek">{KOPIA_EKRAN_O_NAS.naglowek}</h1>

<!-- 3. Save-result region, driven by a marker on a fresh GET so a refresh cannot re-save. -->
{#if data.zapisano}
	<div class="komunikat">
		<PanelKomunikat rodzaj="sukces" naglowek={KOPIA_ZAPIS.zapisanoNaglowek} fokus>
			<p>{KOPIA_ZAPIS.zapisanoTresc}</p>
			<p>
				<a href="/o-nas" target="_blank" rel="noopener noreferrer">
					{zobaczStrone(KOPIA_EKRAN_O_NAS.stronaNazwa)}<span class="visually-hidden"
						>{KOPIA_POWLOKA.nowaKarta}</span
					>
				</a>
			</p>
		</PanelKomunikat>
	</div>
{/if}

<!-- 4. Validation summary and the two refusal panels. -->
{#if form?.panelNaglowek}
	<div class="komunikat">
		<PanelKomunikat rodzaj="blad" naglowek={form.panelNaglowek} fokus>
			<p>{form.panelTresc}</p>
			{#if podsumowanie.length > 0}
				<ul>
					{#each podsumowanie as wpis (wpis.cel)}
						<li><a href="#{wpis.cel}">{wpis.tekst}</a></li>
					{/each}
				</ul>
			{:else if form.konflikt}
				<p><a href={page.url.pathname}>{KOPIA_ZAPIS.konfliktAkcja}</a></p>
			{/if}
		</PanelKomunikat>
	</div>
{/if}

<form
	method="POST"
	action={AKCJA_ZAPISU}
	novalidate
	use:enhance={() => {
		zapisywanie = true;
		return async ({ update }) => {
			// See the module header: without this the four list actions would wipe the form.
			await update({ reset: false });
			zapisywanie = false;
		};
	}}
>
	<!-- The state the form was built from (D-10). Untrusted on the way back, which costs
	     nothing: a forged value can only make the save fail, never make it overwrite more. -->
	{#if sha}
		<input type="hidden" name={POLE_SHA} value={sha} />
	{/if}

	<!-- 5. Required-fields note. -->
	<p class="wymagane">{KOPIA_ZAPIS.wymaganeNota}</p>

	<!-- 6a. Wprowadzenie and Misja. -->
	<div class="karta">
		<FormField
			id="o-nas-lead"
			nazwa={POLE_LEAD}
			etykieta={POLA_O_NAS.leadEtykieta}
			podpowiedz={POLA_O_NAS.leadPodpowiedz}
			wartosc={wartosci.lead}
			blad={pola[POLE_LEAD]}
			wieloliniowy
			wymagane
		/>

		<div class="narracja">
			<FormField
				id="o-nas-misja"
				nazwa={POLE_MISJI}
				etykieta={POLA_O_NAS.misjaEtykieta}
				podpowiedz={POLA_O_NAS.misjaPodpowiedz}
				wartosc={wartosci.misja}
				blad={pola[POLE_MISJI]}
				wieloliniowy
				wymagane
			/>
			<PomocFormatowania />
		</div>
	</div>

	<!-- 6b. Wartości: the first repeated list. -->
	<div class="grupa">
		<PowtarzalnaGrupa
			id={PREFIKS_WARTOSCI}
			legenda={POLA_O_NAS.wartosciLegenda}
			podpowiedz={POLA_O_NAS.wartosciPodpowiedz}
			ile={wartosci.wartosci.length}
			etykietaElementu={legendaWartosci}
			akcjaDodania={AKCJA_DODANIA_WARTOSCI}
			akcjaUsuniecia={AKCJA_USUNIECIA_WARTOSCI}
			etykietaDodania={KOPIA_ZAPIS.dodajWartosc}
			etykietaUsuniecia={KOPIA_ZAPIS.usunWartosc}
			nazwaIndeksu={POLE_INDEKSU}
			nota={KOPIA_ZAPIS.notaGrupy}
			status={form?.statusWartosci ?? ''}
			zadanie={form?.zadanieWartosci}
		>
			{#snippet element(indeks)}
				<FormField
					id={idPola(PREFIKS_WARTOSCI, indeks, POLE_TYTULU)}
					nazwa={nazwaPola(PREFIKS_WARTOSCI, indeks, POLE_TYTULU)}
					etykieta={POLA_O_NAS.wartoscTytulEtykieta}
					wartosc={wartosci.wartosci[indeks].tytul}
					blad={pola[nazwaPola(PREFIKS_WARTOSCI, indeks, POLE_TYTULU)]}
					autofokus={form?.zadanieWartosci?.cel === 'element' &&
						form.zadanieWartosci.indeks === indeks}
					wymagane
				/>
				<FormField
					id={idPola(PREFIKS_WARTOSCI, indeks, POLE_OPISU)}
					nazwa={nazwaPola(PREFIKS_WARTOSCI, indeks, POLE_OPISU)}
					etykieta={POLA_O_NAS.wartoscOpisEtykieta}
					wartosc={wartosci.wartosci[indeks].opis}
					blad={pola[nazwaPola(PREFIKS_WARTOSCI, indeks, POLE_OPISU)]}
					wieloliniowy
					wymagane
				/>
			{/snippet}
		</PowtarzalnaGrupa>
	</div>

	<!-- 6c. Kadra: the narrative and the two counts. -->
	<div class="karta">
		<div class="narracja">
			<FormField
				id="o-nas-kadra-opis"
				nazwa={POLE_KADRY_OPIS}
				etykieta={POLA_O_NAS.kadraOpisEtykieta}
				podpowiedz={POLA_O_NAS.kadraOpisPodpowiedz}
				wartosc={wartosci.kadraOpis}
				blad={pola[POLE_KADRY_OPIS]}
				wieloliniowy
				wymagane
			/>
			<PomocFormatowania />
		</div>
	</div>

	<!-- 6c-bis. Kadra: the staff list, the screen's SECOND repeated group (2026-08-18). It
	     replaces two number fields that counted the team; the public page rendered those as
	     tiles beside a list of the same people, so the count and the list said the same thing
	     twice and disagreed by one. Its own group, its own actions and its own status line:
	     sharing any of those with the wartości group would announce into the wrong list. -->
	<div class="grupa">
		<PowtarzalnaGrupa
			id={PREFIKS_KADRY}
			legenda={POLA_O_NAS.kadraLegenda}
			podpowiedz={POLA_O_NAS.kadraPodpowiedz}
			ile={wartosci.kadra.length}
			etykietaElementu={legendaOsoby}
			akcjaDodania={AKCJA_DODANIA_OSOBY}
			akcjaUsuniecia={AKCJA_USUNIECIA_OSOBY}
			etykietaDodania={KOPIA_ZAPIS.dodajOsobe}
			etykietaUsuniecia={KOPIA_ZAPIS.usunOsobe}
			nazwaIndeksu={POLE_INDEKSU}
			nota={KOPIA_ZAPIS.notaGrupy}
			status={form?.statusKadry ?? ''}
			zadanie={form?.zadanieKadry}
		>
			{#snippet element(indeks)}
				<FormField
					id={idPola(PREFIKS_KADRY, indeks, POLE_IMIENIA)}
					nazwa={nazwaPola(PREFIKS_KADRY, indeks, POLE_IMIENIA)}
					etykieta={POLA_O_NAS.osobaImieEtykieta}
					wartosc={wartosci.kadra[indeks].imie}
					blad={pola[nazwaPola(PREFIKS_KADRY, indeks, POLE_IMIENIA)]}
					autofokus={form?.zadanieKadry?.cel === 'element' && form.zadanieKadry.indeks === indeks}
					wymagane
				/>
				<!-- NOT `wymagane`: most of the team share the role the section heading already
				     states, and forcing „opiekunka" onto three consecutive rows is noise. -->
				<FormField
					id={idPola(PREFIKS_KADRY, indeks, POLE_ROLI)}
					nazwa={nazwaPola(PREFIKS_KADRY, indeks, POLE_ROLI)}
					etykieta={POLA_O_NAS.osobaRolaEtykieta}
					podpowiedz={POLA_O_NAS.osobaRolaPodpowiedz}
					wartosc={wartosci.kadra[indeks].rola}
					blad={pola[nazwaPola(PREFIKS_KADRY, indeks, POLE_ROLI)]}
				/>
			{/snippet}
		</PowtarzalnaGrupa>
	</div>

	<!-- 6d. O budynku: the facility narrative. The photographs of that building are edited on
	     the Galeria screen, which is the only screen that owns them (Plan 05-07). -->
	<div class="karta">
		<div class="narracja">
			<FormField
				id="o-nas-obiekt-opis"
				nazwa={POLE_OBIEKTU_OPIS}
				etykieta={POLA_O_NAS.obiektOpisEtykieta}
				podpowiedz={POLA_O_NAS.obiektOpisPodpowiedz}
				wartosc={wartosci.obiektOpis}
				blad={pola[POLE_OBIEKTU_OPIS]}
				wieloliniowy
				wymagane
			/>
			<PomocFormatowania />
		</div>
	</div>

	<!-- 6e. The placeholder checkbox, last control of the last group (Contract 5). -->
	<div class="karta">
		<PolePlaceholder
			id="o-nas-zastepcza"
			nazwa={POLE_ZASTEPCZA}
			etykieta={POLA_O_NAS.zastepczaEtykieta}
			podpowiedz={POLA_O_NAS.zastepczaPodpowiedz}
			zaznaczone={wartosci.zastepcza}
		/>
	</div>

	<!-- 7. Save row: exactly one Zapisz for the whole page (D-11). -->
	<RzedZapisu
		nota={KOPIA_ZAPIS.nota}
		etykietaZapisz={zapisywanie ? KOPIA_ZAPIS.zapisywanie : KOPIA_ZAPIS.zapisz}
		etykietaAnuluj={KOPIA_ZAPIS.anuluj}
		celAnuluj={PULPIT}
		zajete={zapisywanie}
	/>
</form>

<style>
	/* The panel h1 reuses the LOCKED h2 clamp, one step down the inherited scale. */
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

	form {
		margin-top: 24px;
	}

	.wymagane {
		margin: 0 0 24px;
		max-width: 65ch;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		color: var(--color-muted);
	}

	/* One surface card per field group, 24px between field blocks, 16px padding rising to
	   24px at md: the panel density steps. 32px between groups, per Contract 5. */
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

	.karta + .karta,
	.grupa,
	.grupa + .karta {
		margin-top: 32px;
	}

	/* The help sits 8px under the textarea it explains, so the two read as one block rather
	   than as a field and an unrelated disclosure. */
	.narracja {
		display: flex;
		flex-direction: column;
		gap: 8px;
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
</style>
