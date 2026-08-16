<script lang="ts">
	// „O nas" (04.1-UI-SPEC Component Contracts 5, 6, 7, 8, 9 and 10; D-11, D-13, D-15,
	// D-17). The largest editor in the phase and the second mounting of the photo island,
	// which is what proves it generalises: a different aspect, a different ready sentence
	// and a different set of field names, with no second component.
	//
	// THE FIXED DOM ORDER OF CONTRACT 5: back link, h1, save-result region, validation
	// summary region, required-fields note, field groups, save row. Nothing is inserted
	// before either of the two regions that receive focus.
	//
	// FIELD GROUP ORDER: Wprowadzenie and Misja, Wartości, Kadra, Obiekt with its pictures,
	// then the placeholder checkbox last. The two repeated lists are fieldsets with the
	// legends the copy contract names; the three remaining cards have no legend, because the
	// contract's O nas table gives none for them and inventing one would put a heading in
	// the panel that the copy module never authored. That is the arrangement PolaWpisu.svelte
	// already uses on the aktualność screens.
	//
	// THE FORMATTING HELP SITS UNDER THE THREE FIELDS THAT REALLY ACCEPT FORMATTING, and
	// deliberately not under Wprowadzenie. src/routes/o-nas/+page.svelte renders misja,
	// kadra_opis and obiekt_opis through the sanitizing inline renderer and prints `lead` as
	// PLAIN TEXT, so a help panel under Wprowadzenie would promise an editor that two
	// asterisks make bold there and they would publish the asterisks.
	//
	// WITHOUT JAVASCRIPT everything on this screen works except CHOOSING a picture, which is
	// the same honest limitation Contract 8 records and the same one the dokument screen
	// carries: the island says so itself, in Polish, inside every photo item. An item whose
	// picture is missing is refused by the server with an instruction naming both ways out.
	//
	// THE FORM RESET IS TURNED OFF ON PURPOSE. All four add and remove actions answer with a
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
	import ZdjecieIsland from '$lib/components/admin/ZdjecieIsland.svelte';
	import {
		KOPIA_EKRAN_O_NAS,
		KOPIA_LISTY,
		KOPIA_POWLOKA,
		KOPIA_ZAPIS,
		KOPIA_ZDJECIA,
		POLA_O_NAS,
		bladWElemencie,
		legendaWartosci,
		legendaZdjecia,
		zobaczStrone
	} from '$lib/content/panel';
	// NOT from the validator beside the action: SvelteKit refuses to bundle $lib/server into
	// client code, and that refusal is correct.
	import {
		AKCJA_DODANIA_WARTOSCI,
		AKCJA_DODANIA_ZDJECIA,
		AKCJA_USUNIECIA_WARTOSCI,
		AKCJA_USUNIECIA_ZDJECIA,
		AKCJA_ZAPISU,
		POLE_ALTU,
		POLE_DANYCH,
		POLE_INDEKSU,
		POLE_KADRY_OPIEKUNKI,
		POLE_KADRY_OPIS,
		POLE_KADRY_PERSONEL,
		POLE_LEAD,
		POLE_MISJI,
		POLE_OBIEKTU_OPIS,
		POLE_OPISU,
		POLE_PLIKU,
		POLE_SHA,
		POLE_TYTULU,
		POLE_USUNIECIA,
		POLE_ZASTEPCZA,
		PREFIKS_WARTOSCI,
		PREFIKS_ZDJECIA,
		idPola,
		idWyspyZdjecia,
		nazwaPola
	} from '$lib/pola-strony';
	import { PROPORCJA_O_NAS } from '$lib/zdjecia';
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

	/** Bounds of the two staff counts. Semantics and a sane spinner range only: the form
	 *  carries `novalidate` and the server is the validation. */
	const MIN_KADRY = 0;
	const MAKS_KADRY = 99;

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
		prosto(POLE_KADRY_OPIEKUNKI, 'o-nas-kadra-opiekunki');
		prosto(POLE_KADRY_PERSONEL, 'o-nas-kadra-personel');
		prosto(POLE_OBIEKTU_OPIS, 'o-nas-obiekt-opis');

		wartosci.zdjecia.forEach((_, indeks) => {
			// Both picture refusals point at the file control and the description at its own
			// field: a summary entry linking to a control that is not on the screen would
			// announce nothing at all.
			const wyspa = idWyspyZdjecia(indeks);
			for (const [pole, cel] of [
				[POLE_DANYCH, `${wyspa}-plik`],
				[POLE_PLIKU, `${wyspa}-plik`],
				[POLE_ALTU, `${wyspa}-alt`]
			] as const) {
				const komunikat = pola[nazwaPola(PREFIKS_ZDJECIA, indeks, pole)];
				if (komunikat === undefined) continue;
				wpisy.push({ cel, tekst: bladWElemencie(legendaZdjecia(indeks + 1), komunikat) });
			}
		});

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

		<FormField
			id="o-nas-kadra-opiekunki"
			nazwa={POLE_KADRY_OPIEKUNKI}
			typ="number"
			min={MIN_KADRY}
			maks={MAKS_KADRY}
			etykieta={POLA_O_NAS.kadraOpiekunkiEtykieta}
			podpowiedz={POLA_O_NAS.kadraOpiekunkiPodpowiedz}
			wartosc={wartosci.kadraOpiekunki}
			blad={pola[POLE_KADRY_OPIEKUNKI]}
			wymagane
		/>

		<FormField
			id="o-nas-kadra-personel"
			nazwa={POLE_KADRY_PERSONEL}
			typ="number"
			min={MIN_KADRY}
			maks={MAKS_KADRY}
			etykieta={POLA_O_NAS.kadraPersonelEtykieta}
			podpowiedz={POLA_O_NAS.kadraPersonelPodpowiedz}
			wartosc={wartosci.kadraPersonel}
			blad={pola[POLE_KADRY_PERSONEL]}
			wymagane
		/>
	</div>

	<!-- 6d. Obiekt: the narrative, then its pictures. -->
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

	<!-- The photo list. `wlasnaRamka` because the island IS the item's fieldset and carries
	     the numbered legend: two nested fieldsets would announce two groups for one
	     picture. The island is MOUNTED here, never rewritten: the ratio, the ready sentence
	     and all four field names arrive as props, which is exactly why Plan 07 took them as
	     props (D-13). -->
	<div class="grupa">
		<PowtarzalnaGrupa
			id={PREFIKS_ZDJECIA}
			legenda={POLA_O_NAS.zdjeciaLegenda}
			ile={wartosci.zdjecia.length}
			etykietaElementu={legendaZdjecia}
			akcjaDodania={AKCJA_DODANIA_ZDJECIA}
			akcjaUsuniecia={AKCJA_USUNIECIA_ZDJECIA}
			etykietaDodania={KOPIA_ZAPIS.dodajZdjecie}
			etykietaUsuniecia={KOPIA_ZAPIS.usunZdjecie}
			nazwaIndeksu={POLE_INDEKSU}
			nota={KOPIA_ZAPIS.notaGrupy}
			status={form?.statusZdjec ?? ''}
			zadanie={form?.zadanieZdjec}
			wlasnaRamka
		>
			{#snippet element(indeks)}
				<ZdjecieIsland
					id={idWyspyZdjecia(indeks)}
					legenda={legendaZdjecia(indeks + 1)}
					podpowiedz={POLA_O_NAS.zdjeciaPodpowiedz}
					altEtykieta={POLA_O_NAS.zdjecieAltEtykieta}
					altPodpowiedz={POLA_O_NAS.zdjecieAltPodpowiedz}
					proporcja={PROPORCJA_O_NAS}
					komunikatGotowe={KOPIA_ZDJECIA.gotowe43}
					nazwaZdjecia={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_DANYCH)}
					nazwaUsuniecia={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_USUNIECIA)}
					nazwaObrazu={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_PLIKU)}
					nazwaAltu={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_ALTU)}
					obraz={wartosci.zdjecia[indeks].plik}
					usunieto={wartosci.zdjecia[indeks].usunieto}
					zdjecie={wartosci.zdjecia[indeks].dane}
					alt={wartosci.zdjecia[indeks].alt}
					blad={pola[nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_DANYCH)] ??
						pola[nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_PLIKU)]}
					bladAltu={pola[nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_ALTU)]}
					autofokus={form?.zadanieZdjec?.cel === 'element' && form.zadanieZdjec.indeks === indeks}
				/>
			{/snippet}
		</PowtarzalnaGrupa>
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
